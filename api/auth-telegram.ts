// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';
import * as jwtPkg from 'jsonwebtoken';

const jwt = (jwtPkg as any).default || jwtPkg;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-in-prod';
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

function verifyTelegramWebAppData(initData: string, botToken: string): { isValid: boolean; user?: any; startParam?: string } {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) return { isValid: false };

    urlParams.delete('hash');

    const params: string[] = [];
    Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([key, val]) => {
        params.push(`${key}=${val}`);
      });

    const dataCheckString = params.join('\n');
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (calculatedHash !== hash) {
      return { isValid: false };
    }

    const userStr = urlParams.get('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const startParam = urlParams.get('start_param') || undefined;

    return { isValid: true, user, startParam };
  } catch (err) {
    console.error('Failed to verify Telegram WebApp data:', err);
    return { isValid: false };
  }
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { initData } = req.body || {};

    if (!initData) {
      return res.status(400).json({ error: 'Missing initData' });
    }

    if (!TELEGRAM_BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN is not configured in environment variables');
      return res.status(500).json({ error: 'Telegram authentication is not configured on server' });
    }

    const { isValid, user, startParam } = verifyTelegramWebAppData(initData, TELEGRAM_BOT_TOKEN);

    if (!isValid || !user) {
      return res.status(401).json({ error: 'Invalid or forged Telegram authentication data' });
    }

    const walletAddress = `tg_${user.id}`;
    const username = user.username || user.first_name || `Lord_${user.id}`;

    // Issue JWT token valid for 30 days for Telegram users
    const token = jwt.sign(
      {
        walletAddress,
        wallet: walletAddress,
        telegramId: user.id,
        username,
        photoUrl: user.photo_url || ''
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      token,
      walletAddress,
      user: {
        id: user.id,
        username,
        firstName: user.first_name,
        lastName: user.last_name,
        photoUrl: user.photo_url || ''
      },
      startParam
    });
  } catch (error) {
    console.error('Telegram auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
