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
    const url = new URL(req.url || '', 'http://localhost');
    const isInfo = req.query?.info === 'true' || url.searchParams.get('info') === 'true';
    const isLogs = req.query?.logs === 'true' || url.searchParams.get('logs') === 'true';
    const isCmds = req.query?.commands === 'true' || url.searchParams.get('commands') === 'true';
    const isSetup = req.query?.setup === 'true' || url.searchParams.get('setup') === 'true';

    if (isInfo) {
      if (!TELEGRAM_BOT_TOKEN) {
        return res.status(200).json({ error: 'TELEGRAM_BOT_TOKEN is missing in env' });
      }
      const infoRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`);
      const infoData = await infoRes.json();
      const meRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
      const meData = await meRes.json();
      return res.status(200).json({ me: meData, info: infoData });
    }

    if (isLogs) {
      const supabase = getSupabase();
      const { data } = await supabase.from('profiles').select('data, updated_at').eq('wallet_address', '__TELEGRAM_WEBHOOK_LOGS__').single();
      const { data: vdata } = await supabase.from('profiles').select('data, updated_at').eq('wallet_address', '__TELEGRAM_VERIFY_LOGS__').single();
      return res.status(200).json({ lastUpdate: data, lastVerify: vdata });
    }

    if (isCmds && TELEGRAM_BOT_TOKEN) {
      const cmdRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMyCommands`);
      const cmdData = await cmdRes.json();
      return res.status(200).json({ commands: cmdData });
    }

    if (isSetup && TELEGRAM_BOT_TOKEN) {
      const host = req.headers['x-forwarded-host'] || req.headers.host || 'void-covenant.vercel.app';
      const webhookUrl = `https://${host}/api/telegram-webhook`;
      const hookRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'edited_message', 'callback_query', 'pre_checkout_query']
        })
      });
      const hookData = await hookRes.json();

      // Register official bot commands including /appss_verify
      const cmdRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setMyCommands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commands: [
            { command: 'start', description: 'Start Void Covenant' },
            { command: 'appss_verify', description: 'Verify Bot Ownership' }
          ]
        })
      });
      const cmdData = await cmdRes.json();

      return res.status(200).json({ setup: true, webhookUrl, hookData, cmdData });
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
    const supabase = getSupabase();
    try {
      await supabase.from('profiles').upsert({
        wallet_address: '__TELEGRAM_WEBHOOK_LOGS__',
        data: {
          lastUpdate: update,
          receivedAt: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      });
    } catch(e) {}

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

    // 3. User Commands & Messages (/start, /appss_verify, etc.)
    const msg = update.message || update.channel_post || update.edited_message;
    if (msg?.text && msg?.chat?.id) {
      const text = msg.text.trim();
      const chatId = msg.chat.id;

      // Apps Center / Catalog verification handler
      if (text.includes('appss_verify')) {
        const sendRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: 'appss_eb30d4'
          })
        });
        const sendData = await sendRes.json();

        try {
          await supabase.from('profiles').upsert({
            wallet_address: '__TELEGRAM_VERIFY_LOGS__',
            data: {
              chatId,
              text,
              sendData,
              sentAt: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          });
        } catch(e) {}

        return res.status(200).json({ ok: true, handled_verify: true, sendData });
      }

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
