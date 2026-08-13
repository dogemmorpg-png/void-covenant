import { VercelRequest, VercelResponse } from '@vercel/node';
import * as jwtPkg from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

const jwt = (jwtPkg as any).default || jwtPkg;

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-in-prod';

function calculateEnergy(profile: any): any {
  if (!profile) return profile;
  
  const now = Date.now();
  const pveMax = profile.pveEnergyMax || 10;
  const pvpMax = profile.pvpEnergyMax || 5;
  
  const lastPve = profile.lastPveEnergyRefill ?? profile.lastEnergyRefill ?? now;
  const lastPvp = profile.lastPvpEnergyRefill ?? profile.lastEnergyRefill ?? now;
  
  const pveRegenInterval = 20 * 60 * 1000;
  const pvpRegenInterval = 15 * 60 * 1000;
  
  const timePassedPve = Math.max(0, now - lastPve);
  const timePassedPvp = Math.max(0, now - lastPvp);
  
  let currentPve = profile.pveEnergy !== undefined ? profile.pveEnergy : pveMax;
  let currentPvp = profile.pvpEnergy !== undefined ? profile.pvpEnergy : pvpMax;
  let newLastPve = lastPve;
  let newLastPvp = lastPvp;
  
  if (currentPve >= pveMax) {
    newLastPve = now;
    currentPve = pveMax;
  } else if (timePassedPve >= pveRegenInterval) {
    const gained = Math.floor(timePassedPve / pveRegenInterval);
    currentPve = Math.min(pveMax, currentPve + gained);
    newLastPve = now - (timePassedPve % pveRegenInterval);
  }
  
  if (currentPvp >= pvpMax) {
    newLastPvp = now;
    currentPvp = pvpMax;
  } else if (timePassedPvp >= pvpRegenInterval) {
    const gained = Math.floor(timePassedPvp / pvpRegenInterval);
    currentPvp = Math.min(pvpMax, currentPvp + gained);
    newLastPvp = now - (timePassedPvp % pvpRegenInterval);
  }
  
  profile.pveEnergy = currentPve;
  profile.pvpEnergy = currentPvp;
  profile.pveEnergyMax = pveMax;
  profile.pvpEnergyMax = pvpMax;
  profile.lastPveEnergyRefill = newLastPve;
  profile.lastPvpEnergyRefill = newLastPvp;
  
  return profile;
}

function getSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yetzjqqnmllwufmzopor.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4';
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

  const walletAddress = decoded.walletAddress;
  if (!walletAddress) {
    return res.status(400).json({ error: 'Token missing wallet address' });
  }

  const { safeProfileData } = req.body || {};

  try {
    const supabase = getSupabase();
    
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
        },
        {
          "id": "c_starter_2",
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
        },
        {
          "id": "c_starter_3",
          "baseId": "plague_rat",
          "name": "Plague Rat",
          "level": 1,
          "tier": "bronze",
          "attack": 1,
          "health": 6,
          "maxHealth": 6,
          "delay": 1,
          "skills": [
            {
              "type": "plague",
              "value": 1,
              "description": "Plague: deals 1 damage to random enemies at end of turn."
            }
          ],
          "image": "/cards/plague_rat.png",
          "color": "emerald",
          "xp": 0,
          "maxXp": 50
        },
        {
          "id": "c_starter_4",
          "baseId": "cursed_witch",
          "name": "Cursed Witch",
          "level": 1,
          "tier": "bronze",
          "attack": 3,
          "health": 10,
          "maxHealth": 10,
          "delay": 2,
          "skills": [
            {
              "type": "hex",
              "value": 2,
              "description": "Hex: increases enemy incoming damage by 2."
            }
          ],
          "image": "/cards/cursed_witch.png",
          "color": "purple",
          "xp": 0,
          "maxXp": 50
        },
        {
          "id": "c_starter_5",
          "baseId": "dark_acolyte",
          "name": "Dark Acolyte",
          "level": 1,
          "tier": "bronze",
          "attack": 2,
          "health": 12,
          "maxHealth": 12,
          "delay": 2,
          "skills": [
            {
              "type": "sacrifice",
              "value": 4,
              "description": "Sacrifice: destroys an ally, granting the hero +4 HP."
            }
          ],
          "image": "/cards/dark_acolyte.png",
          "color": "crimson",
          "xp": 0,
          "maxXp": 50
        }
      ],
      deck: ['c_starter_1', 'c_starter_2', 'c_starter_3', 'c_starter_4', 'c_starter_5'],
        pveEnergy: 10,
        pveEnergyMax: 10,
        pvpEnergy: 5,
        pvpEnergyMax: 5,
        lastEnergyRefill: Date.now(),
        lastPveEnergyRefill: Date.now(),
        lastPvpEnergyRefill: Date.now(),
        pveProgress: 1,
        pvpRating: 100,
        heroMaxHealth: 30,
        level: 1,
        exp: 0,
        campaignStars: {},
        equipment: [],
        equipped: {},
        battlePassPoints: 40,
        battlePassClaimed: [],
        referralsCount: 0,
        completedTasks: [],
        solanaAddress: walletAddress,
        solBalance: 12.5,
        isPremiumBP: false,
        username: '',
        isRegistered: false
      };
      // Prevent creating duplicates by checking again or using insert
      const { data: existingCheck } = await supabase.from('profiles').select('id').eq('wallet_address', walletAddress).limit(1);
      if (!existingCheck || existingCheck.length === 0) {
        const { error: insertError } = await supabase.from('profiles').insert({ wallet_address: walletAddress, data: currentProfile });
        if (insertError) {
          console.error('Failed to insert new profile:', insertError);
          return res.status(500).json({ error: 'Failed to create profile in database.', details: insertError });
        }
      }
    } else {
      currentProfile = profileRow.data;
    }

    currentProfile = calculateEnergy(currentProfile);

    // ONLY merge fields that are safe for the user to change locally:
    // deck, equipped, soundOn, isRegistered, username, avatarUrl
    if (safeProfileData) {
      if (safeProfileData.deck) currentProfile.deck = safeProfileData.deck;
      if (safeProfileData.equipped) currentProfile.equipped = safeProfileData.equipped;
      if (safeProfileData.soundOn !== undefined) currentProfile.soundOn = safeProfileData.soundOn;
      if (safeProfileData.isRegistered !== undefined) currentProfile.isRegistered = safeProfileData.isRegistered;
      if (safeProfileData.username) currentProfile.username = safeProfileData.username;
      if (safeProfileData.avatarUrl) currentProfile.avatarUrl = safeProfileData.avatarUrl;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ data: currentProfile, updated_at: new Date().toISOString() })
      .eq('wallet_address', walletAddress);

    if (updateError) {
      console.error('Sync API save error:', updateError);
      return res.status(500).json({ error: 'Failed to sync profile.' });
    }

    return res.status(200).json({ success: true, profile: currentProfile });
  } catch (error: any) {
    console.error('Sync API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
