// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { recordShardTransaction } from './_shared/shardLogger.js';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

function getSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yetzjqqnmllwufmzopor.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4';
  return createClient(supabaseUrl, supabaseKey);
}

const PACKAGES: Record<string, { shards: number; name: string }> = {
  shards_micro: { shards: 50, name: 'Pouch of Shards' },
  shards_pouch: { shards: 250, name: 'Dark Shard Chest' },
  shards_vault: { shards: 500, name: 'Abyssal Treasury' },
  shards_overlord: { shards: 1000, name: 'Void Monolith' },
  shards_sovereign: { shards: 5000, name: 'Lord of the Void Vault' }
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
          .select('data')
          .eq('wallet_address', walletAddress)
          .limit(1);

        if (rows && rows.length > 0) {
          profileRow = rows[0];
        } else {
          const altWallet = walletAddress.startsWith('tg_') ? walletAddress.slice(3) : `tg_${walletAddress}`;
          const { data: altRows } = await supabase
            .from('profiles')
            .select('data')
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

          if (!processed.includes(chargeId)) {
            const currentShards = profileData.darkShards || 0;
            const updatedShards = currentShards + pkg.shards;

            profileData.darkShards = updatedShards;
            profileData.processedTransactions = [...processed, chargeId];

            await supabase
              .from('profiles')
              .update({
                data: profileData,
                updated_at: new Date().toISOString()
              })
              .eq('wallet_address', matchedWallet);

            // Log ledger entry
            await recordShardTransaction(
              supabase,
              matchedWallet,
              'STARS_PURCHASE',
              pkg.shards,
              updatedShards,
              `Telegram Stars purchase: ${pkg.name} (${payment.total_amount} XTR, Charge: ${chargeId})`
            );

            console.log(`[STARS] Successfully credited ${pkg.shards} shards to ${matchedWallet}`);
          }
        }
      }

      return res.status(200).json({ ok: true, payment_processed: true });
    }

    // 3. User Commands & Messages (/start, etc.)
    if (update.message?.text && update.message?.chat?.id) {
      const text = update.message.text.trim();
      const chatId = update.message.chat.id;

      if (text.startsWith('/start') || text === '/play' || text === '/game') {
        const parts = text.split(' ');
        const refCode = parts.length > 1 ? parts[1].trim() : '';

        const gameBaseUrl = process.env.VITE_APP_URL || 'https://void-covenant.fun';
        const webAppUrl = refCode
          ? `${gameBaseUrl}${gameBaseUrl.includes('?') ? '&' : '?'}ref=${encodeURIComponent(refCode)}`
          : gameBaseUrl;

        const welcomeText = `⚔️ <b>Welcome to Void Covenant!</b>\n\nA dark fantasy card game where skill meets real rewards.\n\nCollect rare cards, craft your ultimate deck, and challenge players in tactical duels. Climb the competitive ranks and turn your victories into real crypto rewards you can withdraw anytime.\n\nReady to test your strategy?`;

        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeText,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '⚔️ Play Void Covenant',
                    web_app: { url: webAppUrl }
                  }
                ],
                [
                  {
                    text: '📢 Telegram Channel',
                    url: 'https://t.me/voidcovenant'
                  },
                  {
                    text: '🌐 Website',
                    url: 'https://void-covenant.fun'
                  }
                ]
              ]
            }
          })
        });

        return res.status(200).json({ ok: true, message_sent: true });
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('telegram-webhook error:', error);
    return res.status(200).json({ ok: false, error: error.message });
  }
}
