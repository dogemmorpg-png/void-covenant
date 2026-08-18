// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as jwtPkg from 'jsonwebtoken';
const jwt = (jwtPkg as any).default || jwtPkg;
import { createClient } from '@supabase/supabase-js';
import { generateCampaignStage } from './_shared/cards.js';
import { calculateEnergy } from './_shared/energyHelper.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-in-prod';

function getSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yetzjqqnmllwufmzopor.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
  return createClient(supabaseUrl, supabaseKey);
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

  const { battleType, stageId } = req.body;
  if (!battleType || !stageId) {
    return res.status(400).json({ error: 'Missing battle details' });
  }

  try {
    const supabase = getSupabase();
    
    const { data: profileRow, error: fetchError } = await supabase
      .from('profiles')
      .select('data, updated_at')
      .eq('wallet_address', walletAddress)
      .single();

    if (fetchError || !profileRow) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    let profile = profileRow.data;
    const oldUpdatedAt = profileRow.updated_at;
    
    // Recalculate energy
    profile = calculateEnergy(profile);
    
    // Check and deduct energy
    if (battleType === 'campaign') {
      const floorNum = parseInt(stageId);
      if (isNaN(floorNum)) return res.status(400).json({ error: 'Invalid campaign stage' });
      
      const stage = generateCampaignStage(floorNum);
      if (!stage) return res.status(400).json({ error: 'Invalid campaign stage' });
      
      if ((profile.pveEnergy || 0) < stage.energyCost) {
        return res.status(400).json({ error: 'Not enough PvE energy' });
      }
      profile.pveEnergy -= stage.energyCost;
    } else if (battleType === 'pvp') {
      if ((profile.pvpEnergy || 0) < 1) {
        return res.status(400).json({ error: 'Not enough PvP energy' });
      }
      profile.pvpEnergy -= 1;
    }
    
    profile.lastBattleTimestamp = Date.now();

    let updateQuery = supabase
      .from('profiles')
      .update({ data: profile, updated_at: new Date().toISOString() })
      .eq('wallet_address', walletAddress);

    if (oldUpdatedAt) {
      updateQuery = updateQuery.eq('updated_at', oldUpdatedAt);
    }

    const { data: updateData, error: updateError } = await updateQuery.select('wallet_address');

    if (updateError || !updateData || updateData.length === 0) {
      return res.status(409).json({ error: 'Concurrent modification detected. Please try again.' });
    }

    return res.status(200).json({ success: true, message: 'Battle session started', profile });

  } catch (error: any) {
    console.error('Battle Start API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
