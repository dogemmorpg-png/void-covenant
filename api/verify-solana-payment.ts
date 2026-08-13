import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PlayerProfile } from '../src/types.js';
import { calculateEnergy } from '../src/utils/energyHelper.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-in-prod';
const TREASURY_WALLET_ADDRESS = process.env.TREASURY_WALLET_ADDRESS || 'BxxQjEStvpcbWLbSnwL19rjbGmvND1J5pEBRShWFoYNr';
const HELIUS_KEY = 'd5c11508-c979-443a-abf2-e6436747e764';
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || `https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}`;

function getSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL or Service Role Key is missing in environment variables.');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

const PACKAGES: Record<string, { solCost: number; shards: number; dust: number; isBp?: boolean }> = {
  shards_micro: { solCost: 0.05, shards: 25, dust: 0 },
  shards_pouch: { solCost: 0.15, shards: 85, dust: 100 },
  shards_vault: { solCost: 0.40, shards: 250, dust: 350 },
  shards_overlord: { solCost: 1.00, shards: 700, dust: 1000 },
  premium_bp_sol: { solCost: 0.25, shards: 0, dust: 0, isBp: true }
};

async function getWorkingSolanaConnection(): Promise<Connection> {
  const endpoints = [
    'https://solana-rpc.publicnode.com',
    'https://api.mainnet-beta.solana.com',
    process.env.SOLANA_RPC_URL || ''
  ].filter(Boolean);

  for (const ep of endpoints) {
    try {
      const conn = new Connection(ep, 'confirmed');
      await conn.getLatestBlockhash();
      return conn;
    } catch (e) {
      console.warn(`RPC endpoint failed: ${ep}`);
    }
  }
  return new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    // 3. Verify On-Chain Transaction with Solana RPC
    const connection = await getWorkingSolanaConnection();
    const tx = await connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed'
    });

    if (!tx) {
      return res.status(400).json({ error: 'Transaction not found on Solana blockchain. Please wait a few seconds for network confirmation and try again.' });
    }

    if (tx.meta?.err) {
      return res.status(400).json({ error: 'Transaction failed on the Solana blockchain.' });
    }

    // 4. Verify Transfer Instruction & Recipient
    const expectedLamports = Math.floor(pkg.solCost * LAMPORTS_PER_SOL);
    let validTransferFound = false;

    // Inspect parsed instructions
    const instructions = tx.transaction.message.instructions;
    for (const ix of instructions) {
      if ('parsed' in ix && ix.program === 'system' && ix.parsed?.type === 'transfer') {
        const info = ix.parsed.info;
        if (
          info.destination === TREASURY_WALLET_ADDRESS &&
          info.source === walletAddress &&
          info.lamports >= expectedLamports
        ) {
          validTransferFound = true;
          break;
        }
      }
    }

    // Fallback: Also inspect inner instructions if using a router/proxy
    if (!validTransferFound && tx.meta?.innerInstructions) {
      for (const inner of tx.meta.innerInstructions) {
        for (const ix of inner.instructions) {
          if ('parsed' in ix && ix.program === 'system' && ix.parsed?.type === 'transfer') {
            const info = ix.parsed.info;
            if (
              info.destination === TREASURY_WALLET_ADDRESS &&
              info.source === walletAddress &&
              info.lamports >= expectedLamports
            ) {
              validTransferFound = true;
              break;
            }
          }
        }
      }
    }

    if (!validTransferFound) {
      return res.status(400).json({
        error: `Transaction does not match expected payment of ${pkg.solCost} SOL to treasury wallet (${TREASURY_WALLET_ADDRESS}).`
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
      profile.isPremiumBP = true;
    }

    // Record signature to prevent replay
    (profile as any).processedTransactions = [...processedTxList, signature];
    profile = calculateEnergy(profile);

    // 6. Save Updated Profile to Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ data: profile, updated_at: new Date().toISOString() })
      .eq('wallet_address', walletAddress);

    if (updateError) {
      console.error('Failed to save profile after payment verification:', updateError);
      return res.status(500).json({ error: 'Failed to credit purchase. Please contact support with your transaction hash.' });
    }

    return res.status(200).json({
      success: true,
      profile,
      message: `Payment verified on Solana! Credited +${pkg.shards} Dark Shards${pkg.dust ? ` & +${pkg.dust} Dust` : ''}!`,
      signature
    });

  } catch (error: any) {
    console.error('Solana payment verification error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
