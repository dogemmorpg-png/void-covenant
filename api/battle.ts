import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { PlayerProfile, CardTemplate } from '../src/types.js';
import { CAMPAIGN_STAGES } from '../src/data/cards.js';
import { createCardInstance } from '../src/data/cards.js';

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

  const walletAddress = decoded.walletAddress;
  if (!walletAddress) {
    return res.status(400).json({ error: 'Token missing wallet address' });
  }

  const { battleType, stageId, result, stars } = req.body;
  if (!battleType || !result) {
    return res.status(400).json({ error: 'Missing battle details.' });
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

    const profile: PlayerProfile = profileRow.data;

    // Bot Prevention: Check lastBattleTimestamp
    if (!profile.lastBattleTimestamp) {
      return res.status(400).json({ error: 'Battle session not started. Suspicious activity detected.' });
    }
    const elapsedSeconds = (Date.now() - profile.lastBattleTimestamp) / 1000;
    if (elapsedSeconds < 8) {
      // Clears timestamp to prevent immediate retry with same session
      profile.lastBattleTimestamp = undefined;
      return res.status(400).json({ error: 'Battle completed too quickly. Suspicious activity detected.' });
    }
    profile.lastBattleTimestamp = undefined;

    let goldReward = 0;
    let dustReward = 0;
    let expReward = 0;
    let shardsReward = 0;
    let cardRewardStr = '';
    
    // Add logic to calculate equipment bonuses (we'll just use a fixed 1x for simplicity on backend, or read from profile)
    // Actually, we can check the profile's equipment!
    let goldMultiplier = 1;
    let expMultiplier = 1;
    if (profile.equipped && profile.equipment) {
      Object.values(profile.equipped).forEach(eqId => {
        const eq = profile.equipment.find((e: any) => e.id === eqId);
        if (eq && eq.bonusType === 'goldBonus') goldMultiplier += (eq.bonusValue / 100);
        if (eq && eq.bonusType === 'expBonus') expMultiplier += (eq.bonusValue / 100);
      });
    }

    if (battleType === 'campaign' && result === 'win') {
      const stage = CAMPAIGN_STAGES.find((s: any) => s.id === stageId);
      if (!stage) return res.status(400).json({ error: 'Invalid campaign stage' });

      goldReward = Math.floor(stage.goldReward * goldMultiplier);
      dustReward = stage.dustReward;
      shardsReward = stage.shardsReward || 0;
      expReward = Math.floor(50 * expMultiplier);

      if (stage.cardReward) {
        const newCard = createCardInstance(stage.cardReward as CardTemplate, 1);
        profile.collection.push(newCard);
        cardRewardStr = newCard.name;
      }
      
      // Update campaign progress
      const stageIndex = CAMPAIGN_STAGES.findIndex((s: any) => s.id === stageId);
      if (stageIndex >= profile.pveProgress) {
        profile.pveProgress = stageIndex + 1;
      }
      
      // Update campaign stars
      if (stars && stars > 0) {
        if (!profile.campaignStars) profile.campaignStars = {};
        const currentStars = profile.campaignStars[stageId.toString()] || 0;
        if (stars > currentStars) {
          profile.campaignStars[stageId.toString()] = stars;
        }
      }
    } else if (battleType === 'campaign' && result === 'loss') {
      goldReward = Math.floor(20 * goldMultiplier);
    } else if (battleType === 'pvp') {
      if (result === 'win') {
        goldReward = Math.floor(20 * goldMultiplier);
        expReward = Math.floor(80 * expMultiplier);
        profile.pvpRating = (profile.pvpRating || 1000) + 15;
      } else {
        goldReward = Math.floor(20 * goldMultiplier);
        profile.pvpRating = Math.max(0, (profile.pvpRating || 1000) - 10);
      }
    }

    profile.gold += goldReward;
    profile.dust += dustReward;
    profile.darkShards += shardsReward;
    
    // Process EXP
    profile.exp += expReward;
    if (profile.exp >= profile.maxExp) {
      profile.level += 1;
      profile.exp = profile.exp - profile.maxExp;
      profile.maxExp = Math.floor(profile.maxExp * 1.25);
      profile.heroMaxHealth += 2;
      profile.pveEnergy = profile.maxEnergy; // Refill energy on level up
    }

    const oldVersion = profile.version;
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

    return res.status(200).json({
      success: true,
      profile,
      rewards: {
        gold: goldReward,
        dust: dustReward,
        shards: shardsReward,
        exp: expReward,
        cardName: cardRewardStr
      }
    });

  } catch (error: any) {
    console.error('Battle API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
