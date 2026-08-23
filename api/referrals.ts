// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as jwtPkg from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const jwt = (jwtPkg as any).default || jwtPkg;

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-in-prod';

function getSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yetzjqqnmllwufmzopor.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4';
  return createClient(supabaseUrl, supabaseKey);
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

  if (req.method !== 'GET') {
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

  try {
    const supabase = getSupabase();

    // 1. Fetch referred wallets from referrals table
    const { data: refRows, error: refError } = await supabase
      .from('referrals')
      .select('referred_wallet, created_at')
      .eq('referrer_wallet', walletAddress);

    if (refError) {
      console.error('Failed to fetch referrals:', refError);
      return res.status(500).json({ error: 'Database query failed' });
    }

    if (!refRows || refRows.length === 0) {
      return res.status(200).json({ referrals: [] });
    }

    // 2. Fetch profiles for those wallets to extract username & level
    const referredWallets = refRows.map(r => r.referred_wallet);
    const { data: profileRows, error: profileError } = await supabase
      .from('profiles')
      .select('wallet_address, data')
      .in('wallet_address', referredWallets);

    if (profileError) {
      console.error('Failed to fetch profiles for referrals:', profileError);
      // Fallback: return without profiles
    }

    // 3. Map records
    const referrals = refRows.map(r => {
      const matchingProfile = profileRows?.find(p => p.wallet_address === r.referred_wallet);
      const profileData = matchingProfile?.data || {};

      return {
        wallet: r.referred_wallet,
        username: profileData.username || 'Anonymous',
        level: profileData.level || 1,
        avatarUrl: profileData.avatarUrl || '/avatars/knight.png',
        joinedAt: r.created_at
      };
    });

    return res.status(200).json({ referrals });

  } catch (error: any) {
    console.error('Referrals API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
