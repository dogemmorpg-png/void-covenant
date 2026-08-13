// @ts-nocheck
import type { VercelRequest, VercelResponse } from '@vercel/node';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-in-prod';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
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

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  
  // Dynamic require to bypass ESM interop bugs
  const jwt = require('jsonwebtoken');
  const { createClient } = require('@supabase/supabase-js');
  
  // IMPORTANT: We must use a separate function for calculateEnergy so we don't inline it if it uses require
  const { calculateEnergy } = require('./shared/energyHelper');

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

  const { safeProfileData } = req.body || {};

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
    
    // Fallback logic
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials missing, simulating success (development only)');
      return res.status(200).json({
        success: true,
        message: 'Development mock sync successful',
        profile: safeProfileData
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: profileRows, error: fetchError } = await supabase
      .from('profiles')
      .select('data')
      .eq('wallet_address', walletAddress)
      .limit(1);

    const profileRow = profileRows && profileRows.length > 0 ? profileRows[0] : null;

    if (fetchError) {
      return res.status(500).json({ error: 'Database error fetching profile', details: fetchError });
    }

    let currentProfile: any;

    if (!profileRow) {
      currentProfile = {
        gold: 500,
        dust: 100,
        darkShards: 0,
        collection: [
          {
            "id": "c_starter_1",
            "baseId": "skeleton_warrior",
            "name": "Skeleton Warrior",
            "level": 1,
            "tier": "bronze",
            "attack": 2,
            "health": 8,
            "maxHealth": 8,
            "delay": 1,
            "skills": [
              {
                "type": "vampirism",
                "value": 2,
                "description": "Vampirism: heals self for 2 HP on attack."
              }
            ],
            "image": "/cards/skeleton_warrior.png",
            "color": "slate",
            "xp": 0,
            "maxXp": 50
          }
        ],
        deck: ['c_starter_1'],
        pveEnergy: 10,
        pveEnergyMax: 10,
        pvpEnergy: 5,
        pvpEnergyMax: 5,
        lastEnergyRefill: Date.now(),
        lastPveEnergyRefill: Date.now(),
        lastPvpEnergyRefill: Date.now(),
        pveProgress: 1,
        pvpRating: 100,
        solanaAddress: walletAddress,
        username: 'Player_' + walletAddress.substring(0, 4),
        avatar: 'avatar_knight'
      };

      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          wallet_address: walletAddress,
          data: currentProfile
        });

      if (insertError) {
        return res.status(500).json({ error: 'Database error creating profile', details: insertError });
      }
    } else {
      currentProfile = profileRow.data;
      if (safeProfileData && Object.keys(safeProfileData).length > 0) {
        currentProfile = { ...currentProfile, ...safeProfileData };
        
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ data: currentProfile, updated_at: new Date().toISOString() })
          .eq('wallet_address', walletAddress);

        if (updateError) {
          return res.status(500).json({ error: 'Database error updating profile', details: updateError });
        }
      }
    }

    const processedProfile = calculateEnergy(currentProfile);

    res.status(200).json({
      success: true,
      profile: processedProfile
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Internal server error', details: error?.toString() });
  }
}

