// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as jwtPkg from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { recordShardTransaction } from './_shared/shardLogger.js';

const jwt = (jwtPkg as any).default || jwtPkg;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-in-prod';
const TON_TREASURY_WALLET_ADDRESS = process.env.TON_TREASURY_WALLET_ADDRESS || 'UQAd_yCFpQPo4X4j7t_junsrt8AZ3L35eUEEpy9uoPm3fRvS';
const TONCENTER_API_KEY = process.env.TONCENTER_API_KEY || '0ec3643506cf2ac24fc11bf8f9ad06ec4ceeedcb824fa71acb5e4be692a30e20';
const USDT_JETTON_MASTER = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';

function getSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yetzjqqnmllwufmzopor.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4';
  return createClient(supabaseUrl, supabaseKey);
}

const PACKAGES: Record<string, { shards: number; tonCost: number; usdtCost: number; name: string }> = {
  shards_micro: { shards: 25, tonCost: 0.05, usdtCost: 0.10, name: 'Pouch of Shards' },
  shards_pouch: { shards: 85, tonCost: 0.15, usdtCost: 0.30, name: 'Dark Shard Chest' },
  shards_vault: { shards: 250, tonCost: 0.40, usdtCost: 1.00, name: 'Abyssal Treasury' },
  shards_overlord: { shards: 700, tonCost: 1.00, usdtCost: 2.50, name: 'Lord of the Void Vault' }
};

// Normalize any TON address (raw or bounceable/non-bounceable) for comparison
function addressesMatch(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  const cleanA = a.trim().toLowerCase();
  const cleanB = b.trim().toLowerCase();
  if (cleanA === cleanB) return true;
  // If comparing base64 user-friendly addresses ignoring prefix differences (EQ vs UQ)
  if (cleanA.length > 40 && cleanB.length > 40) {
    return cleanA.slice(2) === cleanB.slice(2);
  }
  return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    const walletAddress = decoded.walletAddress || decoded.wallet || decoded.sub;
    if (!walletAddress) {
      return res.status(400).json({ error: 'Token missing wallet address' });
    }

    const { packageId, currency, txHash, senderAddress } = req.body || {};

    if (!packageId || !PACKAGES[packageId]) {
      return res.status(400).json({ error: `Invalid package ID: ${packageId}` });
    }

    const pkg = PACKAGES[packageId];
    const isTon = currency === 'ton';
    const isUsdt = currency === 'usdt';

    if (!isTon && !isUsdt) {
      return res.status(400).json({ error: 'Invalid currency. Must be "ton" or "usdt"' });
    }

    const supabase = getSupabase();

    // Check if this txHash was already processed in profiles
    if (txHash) {
      const { data: existingProfiles } = await supabase
        .from('profiles')
        .select('wallet_address')
        .contains('data->processedTransactions', [txHash])
        .limit(1);

      if (existingProfiles && existingProfiles.length > 0) {
        return res.status(400).json({ error: 'This transaction has already been claimed and credited.' });
      }
    }

    // ON-CHAIN VERIFICATION
    let isVerified = false;
    let matchedTxHash = txHash || '';

    // Strategy 1: TonAPI Events Query (Parses both TON and Jetton USDT)
    try {
      const tonapiRes = await fetch(`https://tonapi.io/v2/accounts/${TON_TREASURY_WALLET_ADDRESS}/events?limit=25`, {
        headers: { 'Accept': 'application/json' }
      });

      if (tonapiRes.ok) {
        const eventsData = await tonapiRes.json();
        const events = eventsData.events || [];

        for (const ev of events) {
          // If a txHash was provided by the client, match it specifically
          if (txHash && ev.event_id !== txHash) {
            // Also check action hashes
            const hasTx = (ev.actions || []).some((a: any) => a.transaction_id === txHash);
            if (!hasTx) continue;
          }

          // Check timestamp: event must be recent (within last 30 minutes)
          const evTime = (ev.timestamp || 0) * 1000;
          if (Date.now() - evTime > 30 * 60 * 1000) continue;

          for (const action of (ev.actions || [])) {
            if (isTon && action.type === 'TonTransfer') {
              const tt = action.TonTransfer;
              if (addressesMatch(tt.recipient?.address, TON_TREASURY_WALLET_ADDRESS)) {
                const amountInTon = Number(tt.amount) / 1e9;
                if (amountInTon >= pkg.tonCost * 0.98) {
                  // If sender specified, verify sender
                  if (!senderAddress || addressesMatch(tt.sender?.address, senderAddress)) {
                    isVerified = true;
                    matchedTxHash = ev.event_id || txHash || `ton_${ev.timestamp}`;
                    break;
                  }
                }
              }
            } else if (isUsdt && action.type === 'JettonTransfer') {
              const jt = action.JettonTransfer;
              if (addressesMatch(jt.recipient?.address, TON_TREASURY_WALLET_ADDRESS)) {
                // USDT has 6 decimals
                const amountInUsdt = Number(jt.amount) / 1e6;
                if (amountInUsdt >= pkg.usdtCost * 0.98) {
                  if (!senderAddress || addressesMatch(jt.sender?.address, senderAddress)) {
                    isVerified = true;
                    matchedTxHash = ev.event_id || txHash || `usdt_${ev.timestamp}`;
                    break;
                  }
                }
              }
            }
          }

          if (isVerified) break;
        }
      }
    } catch (tonapiErr) {
      console.warn('TonAPI verification attempt error:', tonapiErr);
    }

    // Strategy 2: Toncenter API v2 Fallback (For Native TON)
    if (!isVerified && isTon) {
      try {
        const headers: Record<string, string> = { 'Accept': 'application/json' };
        if (TONCENTER_API_KEY) {
          headers['X-API-Key'] = TONCENTER_API_KEY;
        }

        const tcRes = await fetch(`https://toncenter.com/api/v2/getTransactions?address=${TON_TREASURY_WALLET_ADDRESS}&limit=25`, {
          headers
        });

        if (tcRes.ok) {
          const tcData = await tcRes.json();
          const txs = tcData.result || [];

          for (const tx of txs) {
            const currentHash = tx.transaction_id?.hash;
            if (txHash && currentHash !== txHash) continue;

            const txTime = (tx.utime || 0) * 1000;
            if (Date.now() - txTime > 30 * 60 * 1000) continue;

            const inMsg = tx.in_msg;
            if (inMsg && addressesMatch(inMsg.destination, TON_TREASURY_WALLET_ADDRESS)) {
              const amountInTon = Number(inMsg.value) / 1e9;
              if (amountInTon >= pkg.tonCost * 0.98) {
                if (!senderAddress || addressesMatch(inMsg.source, senderAddress)) {
                  isVerified = true;
                  matchedTxHash = currentHash || txHash || `toncenter_${tx.utime}`;
                  break;
                }
              }
            }
          }
        }
      } catch (tcErr) {
        console.warn('Toncenter verification attempt error:', tcErr);
      }
    }

    // Fallback if recent broadcast: If txHash is provided and client just broadcasted, verify transaction exists
    if (!isVerified && txHash) {
      try {
        const checkRes = await fetch(`https://tonapi.io/v2/blockchain/transactions/${txHash}`);
        if (checkRes.ok) {
          const txInfo = await checkRes.json();
          if (txInfo && !txInfo.aborted && txInfo.success) {
            isVerified = true;
            matchedTxHash = txHash;
          }
        }
      } catch (e) {}
    }

    if (!isVerified) {
      return res.status(400).json({
        success: false,
        error: 'Transaction could not be confirmed on the TON blockchain yet. Please wait a moment and retry verification.',
        pending: true
      });
    }

    // Double check anti-replay before credit
    const { data: rows } = await supabase
      .from('profiles')
      .select('data')
      .eq('wallet_address', walletAddress)
      .limit(1);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Player profile not found' });
    }

    const profileData = rows[0].data || {};
    const processed = profileData.processedTransactions || [];

    if (processed.includes(matchedTxHash)) {
      return res.status(400).json({ error: 'Transaction already claimed' });
    }

    const currentShards = profileData.darkShards || 0;
    const updatedShards = currentShards + pkg.shards;

    profileData.darkShards = updatedShards;
    profileData.processedTransactions = [...processed, matchedTxHash];

    await supabase
      .from('profiles')
      .update({
        data: profileData,
        updated_at: new Date().toISOString()
      })
      .eq('wallet_address', walletAddress);

    // Record shard transaction ledger
    await recordShardTransaction(
      supabase,
      walletAddress,
      isTon ? 'TON_PURCHASE' : 'USDT_PURCHASE',
      pkg.shards,
      updatedShards,
      `Purchased ${pkg.name} via ${isTon ? 'TON' : 'USDT'} (TX: ${matchedTxHash})`
    );

    return res.status(200).json({
      success: true,
      message: `Payment verified! +${pkg.shards} Dark Shards added!`,
      shardsAdded: pkg.shards,
      newDarkShards: updatedShards,
      txHash: matchedTxHash
    });

  } catch (error: any) {
    console.error('verify-ton-payment error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
