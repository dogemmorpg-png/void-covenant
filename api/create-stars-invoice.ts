// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as jwtPkg from 'jsonwebtoken';

const jwt = (jwtPkg as any).default || jwtPkg;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-in-prod';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const PACKAGES: Record<string, { name: string; shards: number; starsCost: number; description: string }> = {
  shards_micro: {
    name: 'Pouch of Shards',
    shards: 25,
    starsCost: 1,
    description: 'Instant credit: 25 pure Dark Shards.'
  },
  shards_pouch: {
    name: 'Dark Shard Chest',
    shards: 85,
    starsCost: 5,
    description: 'Instant credit: 85 pure Dark Shards.'
  },
  shards_vault: {
    name: 'Abyssal Treasury',
    shards: 250,
    starsCost: 15,
    description: 'Instant credit: 250 pure Dark Shards.'
  },
  shards_overlord: {
    name: 'Lord of the Void Vault',
    shards: 700,
    starsCost: 30,
    description: 'Instant credit: 700 pure Dark Shards.'
  }
};

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

    const { packageId } = req.body || {};
    if (!packageId || !PACKAGES[packageId]) {
      return res.status(400).json({ error: `Invalid or missing packageId: ${packageId}` });
    }

    if (!TELEGRAM_BOT_TOKEN) {
      return res.status(500).json({ error: 'Telegram Bot Token is not configured on server' });
    }

    const selectedPkg = PACKAGES[packageId];
    const payload = JSON.stringify({
      packageId,
      walletAddress,
      shards: selectedPkg.shards,
      starsCost: selectedPkg.starsCost,
      createdAt: Date.now()
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

  } catch (error: any) {
    console.error('create-stars-invoice error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
