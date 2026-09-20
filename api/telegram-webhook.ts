// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { recordShardTransaction } from './_shared/shardLogger.js';
import { logPurchaseToDatabase } from './_shared/purchaseLogger.js';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

function getSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yetzjqqnmllwufmzopor.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4';
  return createClient(supabaseUrl, supabaseKey);
}

const PACKAGES: Record<string, { shards: number; name: string }> = {
  shards_micro: { shards: 25, name: 'Pouch of Shards' },
  shards_pouch: { shards: 85, name: 'Dark Shard Chest' },
  shards_vault: { shards: 250, name: 'Abyssal Treasury' },
  shards_overlord: { shards: 700, name: 'Lord of the Void Vault' }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow GET to check status or setup webhook
  if (req.method === 'GET') {
    if (req.query.setup === 'true' && TELEGRAM_BOT_TOKEN) {
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'void-covenant.vercel.app';
      const webhookUrl = `https://${host}/api/telegram-webhook`;
      const hookRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
      const hookData = await hookRes.json();
      return res.status(200).json({ setup: true, webhookUrl, hookData });
    }

    return res.status(200).json({ ok: true, status: 'Telegram webhook receiver ready' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!TELEGRAM_BOT_TOKEN) {
    return res.status(500).json({ error: 'Telegram Bot Token not configured' });
  }

  const update = req.body;
  if (!update) {
    return res.status(400).json({ error: 'Empty update payload' });
  }

  try {
    // 1. Mandatory Pre-Checkout Query Handshake
    if (update.pre_checkout_query) {
      const q = update.pre_checkout_query;
      const ansRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerPreCheckoutQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pre_checkout_query_id: q.id,
          ok: true
        })
      });
      const ansData = await ansRes.json();
      return res.status(200).json({ pre_checkout_answered: true, ansData });
    }

    // 2. Successful Payment Confirmation
    const payment = update.message?.successful_payment;
    if (payment) {
      const chargeId = payment.telegram_payment_charge_id;
      let payloadData: any = {};
      try {
        payloadData = JSON.parse(payment.invoice_payload || '{}');
      } catch (e) {
        payloadData = {};
      }

      let { packageId, walletAddress, p, w } = payloadData;
      packageId = packageId || p;
      walletAddress = walletAddress || w;
      const pkg = PACKAGES[packageId];

      if (walletAddress && pkg) {
        const supabase = getSupabase();

        // Anti-replay check via processed_transactions in profile or transactions ledger
        let profileRow: any = null;
        let matchedWallet = walletAddress;

        const { data: rows } = await supabase
          .from('profiles')
          .select('data, updated_at')
          .eq('wallet_address', walletAddress)
          .limit(1);

        if (rows && rows.length > 0) {
          profileRow = rows[0];
        } else {
          const altWallet = walletAddress.startsWith('tg_') ? walletAddress.slice(3) : `tg_${walletAddress}`;
          const { data: altRows } = await supabase
            .from('profiles')
            .select('data, updated_at')
            .eq('wallet_address', altWallet)
            .limit(1);
          if (altRows && altRows.length > 0) {
            profileRow = altRows[0];
            matchedWallet = altWallet;
          }
        }

        if (profileRow) {
          const profileData = profileRow.data || {};
          const processed = profileData.processedTransactions || [];
          const oldUpdatedAt = profileRow.updated_at;

          // Global anti-replay check across ALL profiles in the database
          const { data: globalClaimed } = await supabase
            .from('profiles')
            .select('wallet_address')
            .contains('data->processedTransactions', [chargeId])
            .limit(1);

          if (globalClaimed && globalClaimed.length > 0) {
            console.log(`[STARS] Charge ${chargeId} already claimed globally, ensuring purchase log.`);
            await logPurchaseToDatabase(supabase, {
              walletAddress: globalClaimed[0]?.wallet_address || matchedWallet,
              packageId: packageId,
              currency: 'XTR',
              amount: payment.total_amount,
              shards: pkg.shards,
              signature: chargeId,
              provider: 'stars',
              status: 'success'
            });
            return res.status(200).json({ ok: true, already_claimed: true });
          }

          if (processed.includes(chargeId)) {
            console.log(`[STARS] Charge ${chargeId} already in profile, ensuring purchase log.`);
            await logPurchaseToDatabase(supabase, {
              walletAddress: matchedWallet,
              packageId: packageId,
              currency: 'XTR',
              amount: payment.total_amount,
              shards: pkg.shards,
              signature: chargeId,
              provider: 'stars',
              status: 'success'
            });
            return res.status(200).json({ ok: true, already_claimed: true });
          }

          if (!processed.includes(chargeId)) {
            profileData.processedTransactions = [...processed, chargeId];

            profileData = recordShardTransaction(
              profileData,
              'SHOP_PURCHASE',
              pkg.shards,
              `Telegram Stars purchase (webhook): ${pkg.name} (${payment.total_amount} XTR, Charge: ${chargeId})`,
              { chargeId, amount: payment.total_amount, currency: 'XTR' }
            );

            let updateQuery = supabase
              .from('profiles')
              .update({
                data: profileData,
                updated_at: new Date().toISOString()
              })
              .eq('wallet_address', matchedWallet);

            if (oldUpdatedAt) {
              updateQuery = updateQuery.eq('updated_at', oldUpdatedAt);
            }

            const { data: updateRes, error: updateErr } = await updateQuery.select('wallet_address');
            if (updateErr || !updateRes || updateRes.length === 0) {
              console.log(`[STARS] Webhook OCC conflict on charge ${chargeId}, already updated concurrently.`);
              return res.status(200).json({ ok: true, concurrent_update: true });
            }

            // Unified purchase ledger in purchases table
            await logPurchaseToDatabase(supabase, {
              walletAddress: matchedWallet,
              packageId: packageId,
              currency: 'XTR',
              amount: payment.total_amount,
              shards: pkg.shards,
              signature: chargeId,
              provider: 'stars',
              status: 'success'
            });

            console.log(`[STARS] Successfully credited ${pkg.shards} shards to ${matchedWallet} and logged to purchases`);
          }
        }
      }

      return res.status(200).json({ ok: true, payment_processed: true });
    }

    return res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('telegram-webhook error:', error);
    return res.status(200).json({ ok: false, error: error.message });
  }
}
