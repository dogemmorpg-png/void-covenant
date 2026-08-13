// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as jwtPkg from 'jsonwebtoken';
const jwt = (jwtPkg as any).default || jwtPkg;
import { createClient } from '@supabase/supabase-js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-in-prod';

function getSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL or Service Role Key is missing in environment variables.');
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
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

  const walletAddress = decoded.walletAddress || decoded.wallet;
  if (!walletAddress) {
    return res.status(400).json({ error: 'Token missing wallet address' });
  }

  try {
    const supabase = getSupabase();
    
    const { data: profileRow, error: fetchError } = await supabase
      .from('profiles')
      .select('data')
      .eq('wallet_address', walletAddress)
      .single();

    if (fetchError || !profileRow) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profile = profileRow.data;
    const oldVersion = profile.version;
    
    profile.lastBattleTimestamp = Date.now();
    profile.version = (oldVersion || 0) + 1;

    let updateQuery = supabase
      .from('profiles')
      .update({ data: profile, updated_at: new Date().toISOString() })
      .eq('wallet_address', walletAddress);

    if (oldVersion === undefined) {
      updateQuery = updateQuery.is('data->>version', null);
    } else {
      updateQuery = updateQuery.eq('data->>version', oldVersion.toString());
    }

    const { data: updateData, error: updateError } = await updateQuery.select('wallet_address');

    if (updateError || !updateData || updateData.length === 0) {
      return res.status(409).json({ error: 'Concurrent modification detected. Please try again.' });
    }

    return res.status(200).json({ success: true, message: 'Battle session started' });

  } catch (error: any) {
    console.error('Battle Start API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}




