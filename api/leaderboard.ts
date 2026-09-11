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

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabase();

    const authHeader = req.headers.authorization;
    let requestingWallet: string | null = null;
    let requestingUsername: string | null = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        requestingWallet = decoded.walletAddress || decoded.wallet || decoded.sub || null;
        requestingUsername = decoded.username || null;
      } catch (err) {
        // ignore token error
      }
    }

    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        body = {};
      }
    }
    const { league } = body || {};
    let playerLeague = league || 'Bronze';

    // Fetch profiles to build leaderboard
    const { data: rows, error } = await supabase
      .from('profiles')
      .select('wallet_address, data')
      .not('wallet_address', 'like', '__SYSTEM_%')
      .neq('wallet_address', 'system_pvp_state')
      .limit(500);

    if (error) {
      console.error('Failed to query profiles:', error);
      return res.status(200).json({ success: true, leaderboard: [], myRank: null });
    }

    if (!league && (requestingWallet || requestingUsername)) {
      const myRow = (rows || []).find(r => 
        (requestingWallet && r?.wallet_address && r.wallet_address.toLowerCase() === requestingWallet.toLowerCase()) ||
        (requestingUsername && r?.data?.username && r.data.username.trim().toLowerCase() === requestingUsername.trim().toLowerCase())
      );
      if (myRow && myRow.data?.pvpLeague) {
        playerLeague = myRow.data.pvpLeague;
      }
    }

    const sorted = (rows || [])
      .filter(r => r?.data && r.data.username && typeof r.data.username === 'string' && r.data.username.trim() !== '')
      .filter(r => (r.data.pvpLeague || 'Bronze') === playerLeague)
      .map(r => {
        const isSubActive = r.data?.subscriptionExpiresAt && Number(r.data.subscriptionExpiresAt) > Date.now();
        const subTier = isSubActive ? (r.data.subscriptionTier || 'free') : 'free';
        return {
          username: r.data.username,
          pvpRating: Number(r.data.pvpRating) || 100,
          pvpLeague: r.data.pvpLeague || 'Bronze',
          pvpLP: r.data.pvpLP !== undefined ? Number(r.data.pvpLP) : 0,
          avatarUrl: r.data.avatarUrl || '/avatars/knight.webp',
          walletAddress: r.wallet_address,
          subscriptionTier: subTier
        };
      })
      .sort((a, b) => (b.pvpLP - a.pvpLP) || (b.pvpRating - a.pvpRating));

    let myRank: number | null = null;
    if (requestingWallet || requestingUsername) {
      const myIdx = sorted.findIndex(p => 
        (requestingWallet && p.walletAddress && p.walletAddress.toLowerCase() === requestingWallet.toLowerCase()) ||
        (requestingUsername && p.username && p.username.trim().toLowerCase() === requestingUsername.trim().toLowerCase())
      );
      if (myIdx !== -1) {
        myRank = myIdx + 1;
      }
    }

    const leaderboard = sorted.slice(0, 20);

    return res.status(200).json({ success: true, leaderboard, myRank });

  } catch (error: any) {
    console.error('Leaderboard API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
