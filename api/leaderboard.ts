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

    // Fetch all profiles to build leaderboard
    const { data: rows, error } = await supabase
      .from('profiles')
      .select('wallet_address, data')
      .limit(200);

    if (error) {
      console.error('Failed to query profiles:', error);
      return res.status(500).json({ error: 'Database query failed' });
    }

    const leaderboard = (rows || [])
      .filter(r => r.data && r.data.username && r.data.username.trim() !== '')
      .map(r => ({
        username: r.data.username,
        pvpRating: r.data.pvpRating || 100,
        avatarUrl: r.data.avatarUrl || '/avatars/knight.webp',
        walletAddress: r.wallet_address
      }))
      .sort((a, b) => b.pvpRating - a.pvpRating)
      .slice(0, 15);

    return res.status(200).json({ success: true, leaderboard });

  } catch (error: any) {
    console.error('Leaderboard API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
