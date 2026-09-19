// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as jwtPkg from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { recordShardTransaction } from './_shared/shardLogger.js';

const jwt = (jwtPkg as any).default || jwtPkg;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-in-prod';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Solana settings
const TREASURY_WALLET_ADDRESS = process.env.TREASURY_WALLET_ADDRESS || 'BxxQjEStvpcbWLbSnwL19rjbGmvND1J5pEBRShWFoYNr';
const HELIUS_KEY = 'a53833dc-25c4-42e3-bdef-26901e8e84e9';
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}`;

// TON settings
const TON_TREASURY_WALLET_ADDRESS = process.env.TON_TREASURY_WALLET_ADDRESS || 'UQAd_yCFpQPo4X4j7t_junsrt8AZ3L35eUEEpy9uoPm3fRvS';
const TONCENTER_API_KEY = process.env.TONCENTER_API_KEY || '0ec3643506cf2ac24fc11bf8f9ad06ec4ceeedcb824fa71acb5e4be692a30e20';
const USDT_JETTON_MASTER = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';

function getSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yetzjqqnmllwufmzopor.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4';
  return createClient(supabaseUrl, supabaseKey);
}

// Packages for Solana
const SOLANA_PACKAGES: Record<string, { solCost: number; shards: number; dust: number; isBp?: boolean }> = {
  shards_micro: { solCost: 0.05, shards: 25, dust: 0 },
  shards_pouch: { solCost: 0.15, shards: 85, dust: 0 },
  shards_vault: { solCost: 0.40, shards: 250, dust: 0 },
  shards_overlord: { solCost: 1.00, shards: 700, dust: 0 },
  premium_bp_sol: { solCost: 0.25, shards: 0, dust: 0, isBp: true }
};

// Packages for Telegram (Stars, TON, USDT)
const TELEGRAM_PACKAGES: Record<string, { shards: number; starsCost: number; tonCost: number; usdtCost: number; name: string; description: string }> = {
  shards_micro: {
    name: 'Pouch of Shards',
    shards: 25,
    starsCost: 1,
    tonCost: 0.05,
    usdtCost: 0.10,
    description: 'Instant credit: 25 pure Dark Shards.'
  },
  shards_pouch: {
    name: 'Dark Shard Chest',
    shards: 85,
    starsCost: 5,
    tonCost: 0.15,
    usdtCost: 0.30,
    description: 'Instant credit: 85 pure Dark Shards.'
  },
  shards_vault: {
    name: 'Abyssal Treasury',
    shards: 250,
    starsCost: 15,
    tonCost: 0.40,
    usdtCost: 1.00,
    description: 'Instant credit: 250 pure Dark Shards.'
  },
  shards_overlord: {
    name: 'Lord of the Void Vault',
    shards: 700,
    starsCost: 30,
    tonCost: 1.00,
    usdtCost: 2.50,
    description: 'Instant credit: 700 pure Dark Shards.'
  }
};

function addressesMatch(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  const cleanA = a.trim().toLowerCase();
  const cleanB = b.trim().toLowerCase();
  if (cleanA === cleanB) return true;
  if (cleanA.length > 40 && cleanB.length > 40) {
    return cleanA.slice(2) === cleanB.slice(2);
  }
  return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    const action = req.query.action || req.body?.action;

    // ─────────────────────────────────────────────────────────────
    // ROUTE 1: CREATE TELEGRAM STARS INVOICE
    // ─────────────────────────────────────────────────────────────
    if (action === 'create_stars_invoice' || req.body?.type === 'stars_invoice') {
      const { packageId } = req.body || {};
      if (!packageId || !TELEGRAM_PACKAGES[packageId]) {
        return res.status(400).json({ error: `Invalid or missing packageId: ${packageId}` });
      }

      if (!TELEGRAM_BOT_TOKEN) {
        return res.status(500).json({ error: 'Telegram Bot Token is not configured on server' });
      }

      const selectedPkg = TELEGRAM_PACKAGES[packageId];
      // Telegram Bot API requires payload to be between 1 and 128 bytes
      const payload = JSON.stringify({
        p: packageId,
        w: walletAddress
      });

      const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/createInvoiceLink`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${selectedPkg.name} (+${selectedPkg.shards} Shards)`,
          description: selectedPkg.description,
          payload,
          currency: 'XTR',
          prices: [
            {
              label: `${selectedPkg.shards} Dark Shards`,
              amount: selectedPkg.starsCost
            }
          ]
        })
      });

      const tgData = await tgRes.json();
      if (!tgData.ok) {
        console.error('Telegram createInvoiceLink error:', tgData);
        return res.status(500).json({ error: tgData.description || 'Failed to generate Telegram invoice' });
      }

      return res.status(200).json({
        success: true,
        invoiceLink: tgData.result,
        package: selectedPkg
      });
    }

    // ─────────────────────────────────────────────────────────────
    // ROUTE 2: VERIFY TON / USDT (TON) PAYMENT
    // ─────────────────────────────────────────────────────────────
    if (action === 'verify_ton' || req.body?.currency === 'ton' || req.body?.currency === 'usdt') {
      const { packageId, currency, txHash, senderAddress } = req.body || {};
      if (!packageId || !TELEGRAM_PACKAGES[packageId]) {
        return res.status(400).json({ error: `Invalid package ID: ${packageId}` });
      }

      const pkg = TELEGRAM_PACKAGES[packageId];
      const isTon = currency === 'ton';
      const isUsdt = currency === 'usdt';

      if (!isTon && !isUsdt) {
        return res.status(400).json({ error: 'Invalid currency. Must be "ton" or "usdt"' });
      }

      const supabase = getSupabase();

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

      let isVerified = false;
      let matchedTxHash = txHash || '';

      // Check TonAPI events
      try {
        const tonapiRes = await fetch(`https://tonapi.io/v2/accounts/${TON_TREASURY_WALLET_ADDRESS}/events?limit=25`, {
          headers: { 'Accept': 'application/json' }
        });

        if (tonapiRes.ok) {
          const eventsData = await tonapiRes.json();
          const events = eventsData.events || [];

          for (const ev of events) {
            if (txHash && ev.event_id !== txHash) {
              const hasTx = (ev.actions || []).some((a: any) => a.transaction_id === txHash);
              if (!hasTx) continue;
            }

            const evTime = (ev.timestamp || 0) * 1000;
            if (Date.now() - evTime > 30 * 60 * 1000) continue;

            for (const action of ev.actions || []) {
              if (isTon && action.type === 'TonTransfer') {
                const tt = action.TonTransfer;
                if (addressesMatch(tt.recipient?.address, TON_TREASURY_WALLET_ADDRESS)) {
                  const amountInTon = Number(tt.amount) / 1e9;
                  if (amountInTon >= pkg.tonCost * 0.98) {
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

      // Check Toncenter RPC fallback for native TON
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

      // Fallback single-tx lookup
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
        } catch (e) {
          // ignore
        }
      }

      if (!isVerified) {
        return res.status(400).json({
          success: false,
          error: 'Transaction could not be confirmed on the TON blockchain yet. Please wait a moment and retry verification.',
          pending: true
        });
      }

      // Credit Shards
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
    }

    // ─────────────────────────────────────────────────────────────
    // ROUTE 3: VERIFY SOLANA MAINNET PAYMENT
    // ─────────────────────────────────────────────────────────────
    const { signature, packageId } = req.body || {};
    if (!signature || !packageId) {
      return res.status(400).json({ error: 'Missing transaction signature or package ID.' });
    }

    const pkg = SOLANA_PACKAGES[packageId];
    if (!pkg) {
      return res.status(400).json({ error: 'Invalid package ID.' });
    }

    const supabase = getSupabase();
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
        profile = {
          gold: 1000, dust: 250, darkShards: 50,
          collection: [], deck: [],
          pveEnergy: 5, pveEnergyMax: 5,
          pvpEnergy: 5, pvpEnergyMax: 5,
          lastEnergyRefill: Date.now(),
          pveProgress: 1, pvpRating: 100,
          heroMaxHealth: 30, level: 1, exp: 0,
          solanaAddress: walletAddress, solBalance: 12.5,
          isPremiumBP: false, isRegistered: false
        };
        const { error: insertError } = await supabase.from('profiles').insert({ wallet_address: walletAddress, data: profile });
        if (insertError) continue;
      } else {
        profile = profileRow.data || {};
      }

      const processedTxList: string[] = profile.processedTransactions || [];
      if (processedTxList.includes(signature)) {
        return res.status(200).json({
          success: true,
          message: 'This transaction signature has already been claimed!',
          profile
        });
      }

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

        const accountKeys = tx.transaction?.message?.accountKeys || [];
        const senderPubkeyStr = typeof accountKeys[0] === 'string' ? accountKeys[0] : (accountKeys[0]?.pubkey ? accountKeys[0].pubkey.toString() : String(accountKeys[0]));
        if (senderPubkeyStr !== walletAddress) {
          return res.status(400).json({ error: 'Transaction sender mismatch. This transaction belongs to another wallet.' });
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
          return res.status(400).json({ error: `Transaction payment does not match package cost (${pkg.solCost} SOL).` });
        }
      }

      if (pkg.shards > 0) profile.darkShards = (profile.darkShards || 0) + pkg.shards;
      if (pkg.dust > 0) profile.dust = (profile.dust || 0) + pkg.dust;
      if (pkg.isBp) profile.hasPremiumBp = true;

      profile.isRegistered = true;
      if (!profile.username) profile.username = `Lord_${walletAddress.slice(0, 4)}`;
      profile.processedTransactions = [...processedTxList, signature];

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
        continue;
      }

      await supabase
        .from('purchases')
        .insert({
          wallet_address: walletAddress,
          package_id: packageId,
          sol_amount: pkg.solCost,
          shards_amount: pkg.shards,
          signature: signature,
          status: 'success'
        });

      success = true;
      finalProfile = profile;
    }

    if (!success) {
      return res.status(409).json({ error: 'Conflict saving payment. Please try again, your SOL is safe and can be verified again.' });
    }

    return res.status(200).json({
      success: true,
      message: `Payment verified! +${pkg.shards} Dark Shards added.`,
      profile: finalProfile
    });

  } catch (globalErr: any) {
    console.error('Unhandled payment error:', globalErr);
    return res.status(500).json({
      error: globalErr.message || 'Server error processing payment.'
    });
  }
}
