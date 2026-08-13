import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PlayerProfile } from '../src/types';
import { calculateEnergy } from '../src/utils/energyHelper';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-in-prod';
const TREASURY_WALLET_ADDRESS = process.env.TREASURY_WALLET_ADDRESS || 'BxxQjEStvpcbWLbSnwL19rjbGmvND1J5pEBRShWFoYNr';
const HELIUS_KEY = 'a53833dc-25c4-42e3-bdef-26901e8e84e9';
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}`;

function getSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yetzjqqnmllwufmzopor.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4';
  return createClient(supabaseUrl, supabaseKey);
}

const PACKAGES: Record<string, { solCost: number; shards: number; dust: number; isBp?: boolean }> = {
  shards_micro: { solCost: 0.05, shards: 25, dust: 0 },
  shards_pouch: { solCost: 0.15, shards: 85, dust: 100 },
  shards_vault: { solCost: 0.40, shards: 250, dust: 350 },
  shards_overlord: { solCost: 1.00, shards: 700, dust: 1000 },
  premium_bp_sol: { solCost: 0.25, shards: 0, dust: 0, isBp: true }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  let decoded: any;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const walletAddress = decoded.walletAddress;
  if (!walletAddress) {
    return res.status(400).json({ error: 'Token missing wallet address' });
  }

  const { signature, packageId } = req.body;
  if (!signature || !packageId) {
    return res.status(400).json({ error: 'Missing transaction signature or package ID.' });
  }

  const pkg = PACKAGES[packageId];
  if (!pkg) {
    return res.status(400).json({ error: 'Invalid package ID.' });
  }

  try {
    const supabase = getSupabase();
    
    // 1. Fetch Profile
    const { data: profileRow, error: fetchError } = await supabase
      .from('profiles')
      .select('data')
      .eq('wallet_address', walletAddress)
      .single();

    if (fetchError || !profileRow) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    let profile: PlayerProfile = profileRow.data;

    // 2. Anti-Replay Attack Check
    const processedTxList: string[] = (profile as any).processedTransactions || [];
    if (processedTxList.includes(signature)) {
      return res.status(400).json({ error: 'This transaction signature has already been claimed!' });
    }

    // 3. Fast Helius RPC Connection
    const connection = new Connection(HELIUS_RPC_URL, 'confirmed');

    // Quick status check
    const status = await connection.getSignatureStatus(signature, { searchTransactionHistory: true });
    if (status.value?.err) {
      return res.status(400).json({ error: 'Transaction failed on Solana blockchain.' });
    }

    // Fetch parsed transaction from Helius
    let tx = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed'
    });

    if (!tx) {
      // If indexer is slightly behind, fallback to public node for instant fetch
      try {
        const fallbackConn = new Connection('https://solana-rpc.publicnode.com', 'confirmed');
        tx = await fallbackConn.getParsedTransaction(signature, {
          maxSupportedTransactionVersion: 0,
          commitment: 'confirmed'
        });
      } catch (e) {
        console.warn('Fallback RPC fetch failed:', e);
      }
    }

    if (!tx) {
      return res.status(400).json({ error: 'Transaction indexing in progress. Please click RETRY VERIFICATION in 2 seconds.' });
    }

    if (tx.meta?.err) {
      return res.status(400).json({ error: 'Transaction failed on the Solana blockchain.' });
    }

    // 4. Verify Transfer Recipient & Amount (Balance Delta Check)
    const expectedLamports = Math.floor(pkg.solCost * LAMPORTS_PER_SOL);
    let validTransferFound = false;

    // Balance Delta Verification (Foolproof)
    if (tx.meta && tx.meta.preBalances && tx.meta.postBalances) {
      const accountKeys = tx.transaction.message.accountKeys;
      const treasuryIndex = accountKeys.findIndex((k: any) => {
        const pubkeyStr = typeof k === 'string' ? k : (k.pubkey ? k.pubkey.toString() : String(k));
        return pubkeyStr === TREASURY_WALLET_ADDRESS;
      });

      if (treasuryIndex !== -1) {
        const pre = tx.meta.preBalances[treasuryIndex] || 0;
        const post = tx.meta.postBalances[treasuryIndex] || 0;
        const gained = post - pre;
        if (gained >= expectedLamports - 10000) {
          validTransferFound = true;
        }
      }
    }

    // Parsed Instruction Fallback
    if (!validTransferFound) {
      const instructions = tx.transaction.message.instructions;
      for (const ix of instructions) {
        if ('parsed' in ix && ix.program === 'system' && ix.parsed?.type === 'transfer') {
          const info = ix.parsed.info;
          if (
            info.destination === TREASURY_WALLET_ADDRESS &&
            info.lamports >= expectedLamports - 10000
          ) {
            validTransferFound = true;
            break;
          }
        }
      }
    }

    if (!validTransferFound) {
      return res.status(400).json({
        error: `Transaction payment does not match package cost (${pkg.solCost} SOL).`
      });
    }

    // 5. Credit Items to Profile
    if (pkg.shards > 0) {
      profile.darkShards = (profile.darkShards || 0) + pkg.shards;
    }
    if (pkg.dust > 0) {
      profile.dust = (profile.dust || 0) + pkg.dust;
    }
    if (pkg.isBp) {
      profile.hasPremiumBp = true;
    }

    // Record processed signature
    (profile as any).processedTransactions = [...processedTxList, signature];

    // Recalculate Energy
    profile = calculateEnergy(profile);

    // 6. Save updated profile to Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ data: profile })
      .eq('wallet_address', walletAddress);

    if (updateError) {
      console.error('Failed to save profile after payment:', updateError);
      return res.status(500).json({ error: 'Failed to update player account in database.' });
    }

    return res.status(200).json({
      success: true,
      message: `Payment successful! +${pkg.shardsReward} Dark Shards added!`,
      profile
    });

  } catch (err: any) {
    console.error('Verify Solana Payment API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
