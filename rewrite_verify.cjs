const fs = require('fs');

const content = `// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as jwtPkg from 'jsonwebtoken';
const jwt = (jwtPkg as any).default || jwtPkg;
import { createClient } from '@supabase/supabase-js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-in-prod';
const TREASURY_WALLET_ADDRESS = process.env.TREASURY_WALLET_ADDRESS || 'BxxQjEStvpcbWLbSnwL19rjbGmvND1J5pEBRShWFoYNr';
const HELIUS_KEY = 'a53833dc-25c4-42e3-bdef-26901e8e84e9';
const HELIUS_RPC_URL = \`https://mainnet.helius-rpc.com/?api-key=\${HELIUS_KEY}\`;

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
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
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

    const { signature, packageId } = req.body || {};
    if (!signature || !packageId) {
      return res.status(400).json({ error: 'Missing transaction signature or package ID.' });
    }

    const pkg = PACKAGES[packageId];
    if (!pkg) {
      return res.status(400).json({ error: 'Invalid package ID.' });
    }

    const supabase = getSupabase();
    
    // Retry loop for OCC
    let success = false;
    let finalProfile = null;
    let attempts = 0;
    
    while (!success && attempts < 3) {
      attempts++;
      
      const { data: profileRows, error: fetchError } = await supabase
        .from('profiles')
        .select('data, updated_at')
        .eq('wallet_address', walletAddress)
        .limit(1);

      if (fetchError) {
        return res.status(500).json({ error: 'Database read error' });
      }

      let profile: any;
      const profileRow = profileRows && profileRows.length > 0 ? profileRows[0] : null;
      let oldUpdatedAt = profileRow ? profileRow.updated_at : null;

      if (!profileRow) {
        // Fallback profile init
        profile = {
          gold: 1000, dust: 250, darkShards: 50,
          collection: [], deck: [],
          pveEnergy: 10, pveEnergyMax: 10,
          pvpEnergy: 5, pvpEnergyMax: 5,
          lastEnergyRefill: Date.now(),
          pveProgress: 1, pvpRating: 100,
          heroMaxHealth: 30, level: 1, exp: 0,
          solanaAddress: walletAddress, solBalance: 12.5,
          isPremiumBP: false, isRegistered: false
        };
        const { error: insertError } = await supabase.from('profiles').insert({ wallet_address: walletAddress, data: profile });
        if (insertError) {
           // Might already exist due to race, just loop again
           continue; 
        }
      } else {
        profile = profileRow.data || {};
      }

      // 2. Anti-Replay Attack Check
      const processedTxList: string[] = profile.processedTransactions || [];
      if (processedTxList.includes(signature)) {
        return res.status(200).json({
          success: true,
          message: 'This transaction signature has already been claimed!',
          profile
        });
      }

      // 3. Fast Direct JSON-RPC Query to Helius (only on first attempt)
      let tx: any = null;
      if (attempts === 1) {
          try {
            const txRes = await fetch(HELIUS_RPC_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'getTransaction',
                params: [signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0, commitment: 'confirmed' }]
              })
            });
            const txJson: any = await txRes.json();
            tx = txJson.result;
          } catch (e) {
            console.warn('Primary Helius RPC error:', e);
          }

          if (!tx) {
            try {
              const fallbackRes = await fetch('https://solana-rpc.publicnode.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  jsonrpc: '2.0', id: 1, method: 'getTransaction',
                  params: [signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0, commitment: 'confirmed' }]
                })
              });
              const fallbackJson: any = await fallbackRes.json();
              tx = fallbackJson.result;
            } catch (e) {
              console.warn('Fallback PublicNode RPC error:', e);
            }
          }

          if (!tx) {
            return res.status(400).json({ error: 'Transaction indexing in progress. Please click RETRY VERIFICATION in 2 seconds.' });
          }

          if (tx.meta?.err) {
            return res.status(400).json({ error: 'Transaction failed on Solana blockchain.' });
          }

          const expectedLamports = Math.floor(pkg.solCost * 1_000_000_000);
          let validTransferFound = false;

          if (tx.meta && tx.meta.preBalances && tx.meta.postBalances) {
            const accountKeys = tx.transaction?.message?.accountKeys || [];
            const treasuryIndex = accountKeys.findIndex((k: any) => {
              const pubkeyStr = typeof k === 'string' ? k : (k.pubkey ? k.pubkey.toString() : String(k));
              return pubkeyStr === TREASURY_WALLET_ADDRESS;
            });
            if (treasuryIndex !== -1) {
              const pre = tx.meta.preBalances[treasuryIndex] || 0;
              const post = tx.meta.postBalances[treasuryIndex] || 0;
              const gained = post - pre;
              if (gained >= expectedLamports - 10000) validTransferFound = true;
            }
          }

          if (!validTransferFound) {
            const instructions = tx.transaction?.message?.instructions || [];
            for (const ix of instructions) {
              if (ix.program === 'system' && ix.parsed?.type === 'transfer') {
                const info = ix.parsed.info || {};
                if (info.destination === TREASURY_WALLET_ADDRESS && info.lamports >= expectedLamports - 10000) {
                  validTransferFound = true;
                  break;
                }
              }
            }
          }

          if (!validTransferFound) {
            return res.status(400).json({ error: \`Transaction payment does not match package cost (\${pkg.solCost} SOL).\` });
          }
      }

      // 5. Credit Items to Profile
      if (pkg.shards > 0) profile.darkShards = (profile.darkShards || 0) + pkg.shards;
      if (pkg.dust > 0) profile.dust = (profile.dust || 0) + pkg.dust;
      if (pkg.isBp) profile.hasPremiumBp = true;

      profile.isRegistered = true;
      if (!profile.username) profile.username = \`Lord_\${walletAddress.slice(0, 4)}\`;
      profile.processedTransactions = [...processedTxList, signature];

      // 6. Update Profile via Supabase Client with OCC
      let updateQuery = supabase
        .from('profiles')
        .update({ data: profile, updated_at: new Date().toISOString() })
        .eq('wallet_address', walletAddress);

      if (oldUpdatedAt) {
        updateQuery = updateQuery.eq('updated_at', oldUpdatedAt);
      }

      const { data: updateResult, error: updateError } = await updateQuery.select('wallet_address');

      if (updateError || !updateResult || updateResult.length === 0) {
        console.warn('Verify payment OCC conflict on attempt', attempts);
        continue; // Retry loop
      }
      
      success = true;
      finalProfile = profile;
    }

    if (!success) {
      return res.status(409).json({ error: 'Conflict saving payment. Please try again, your SOL is safe and can be verified again.' });
    }

    return res.status(200).json({
      success: true,
      message: \`Payment verified! +\${pkg.shards} Dark Shards added.\`,
      profile: finalProfile
    });

  } catch (globalErr: any) {
    console.error('Unhandled verify-solana-payment error:', globalErr);
    return res.status(500).json({
      error: globalErr.message || 'Server error verifying payment.'
    });
  }
}
`;
fs.writeFileSync('api/verify-solana-payment.ts', content);
console.log('Rewrote api/verify-solana-payment.ts');
