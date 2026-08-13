import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { PlayerProfile, CardTemplate } from '../src/types.js';
import { generateCampaignStage, createCardInstance } from '../src/data/cards.js';
import { calculateEnergy, processExpGain } from '../src/utils/energyHelper.js';

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

    let profile: PlayerProfile = profileRow.data;

    // Recalculate energy based on time passed
    profile = calculateEnergy(profile);

    let goldReward = 0;
    let dustReward = 0;
    let expReward = 0;
    let shardsReward = 0;
    let cardRewardStr = '';
    
    let goldMultiplier = 1;
    let expMultiplier = 1;
    if (profile.equipped && profile.equipment) {
      Object.values(profile.equipped).forEach(eqId => {
        const eq = profile.equipment.find((e: any) => e.id === eqId);
        if (eq && eq.bonusType === 'goldBonus') goldMultiplier += (eq.bonusValue / 100);
        if (eq && eq.bonusType === 'expBonus') expMultiplier += (eq.bonusValue / 100);
      });
    }

    if (battleType === 'campaign') {
      const floorNum = parseInt(stageId);
      if (isNaN(floorNum)) return res.status(400).json({ error: 'Invalid campaign stage' });

      const stage = generateCampaignStage(floorNum);
      if (!stage) return res.status(400).json({ error: 'Invalid campaign stage' });

      // Energy check & deduction
      if ((profile.pveEnergy || 0) < stage.energyCost) {
        return res.status(400).json({ error: 'Not enough PvE energy' });
      }
      profile.pveEnergy -= stage.energyCost;

      if (result === 'win') {
        goldReward = Math.floor(stage.goldReward * goldMultiplier);
        dustReward = stage.dustReward;
        shardsReward = stage.shardsReward || 0;
        expReward = Math.floor(50 * expMultiplier);

        if (stage.cardReward) {
          const newCard = createCardInstance(stage.cardReward as CardTemplate, 1);
          profile.collection = profile.collection || [];
          profile.collection.push(newCard);
          cardRewardStr = newCard.name;
        }
        
        // Advance campaign progress
        if (floorNum >= (profile.pveProgress || 1)) {
          profile.pveProgress = floorNum + 1;
        }
        
        // Update campaign stars
        if (stars && stars > 0) {
          profile.campaignStars = profile.campaignStars || {};
          const currentStars = profile.campaignStars[stageId.toString()] || 0;
          if (stars > currentStars) {
            profile.campaignStars[stageId.toString()] = stars;
          }
        }

        profile.battlePassPoints = (profile.battlePassPoints || 0) + 50;
      } else {
        goldReward = Math.floor(20 * goldMultiplier);
      }
    } else if (battleType === 'pvp') {
      // Energy check & deduction
      if ((profile.pvpEnergy || 0) < 1) {
        return res.status(400).json({ error: 'Not enough PvP energy' });
      }
      profile.pvpEnergy -= 1;

      if (result === 'win') {
        goldReward = Math.floor(20 * goldMultiplier);
        expReward = Math.floor(80 * expMultiplier);
        profile.pvpRating = (profile.pvpRating || 1000) + 15;
        profile.battlePassPoints = (profile.battlePassPoints || 0) + 50;
      } else {
        goldReward = Math.floor(20 * goldMultiplier);
        profile.pvpRating = Math.max(0, (profile.pvpRating || 1000) - 10);
      }
    }

    profile.gold = (profile.gold || 0) + goldReward;
    profile.dust = (profile.dust || 0) + dustReward;
    profile.darkShards = (profile.darkShards || 0) + shardsReward;
    
    // Process EXP and Level Ups cleanly
    let levelUpInfo = { leveledUp: false, newLevel: profile.level };
    if (expReward > 0) {
      const res = processExpGain(profile, expReward);
      levelUpInfo = { leveledUp: res.leveledUp, newLevel: profile.level };
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ data: profile, updated_at: new Date().toISOString() })
      .eq('wallet_address', walletAddress);

    if (updateError) {
      console.error('Update profile error in battle.ts:', updateError);
      return res.status(500).json({ error: 'Failed to save battle rewards.' });
    }

    return res.status(200).json({
      success: true,
      profile,
      rewards: {
        gold: goldReward,
        dust: dustReward,
        shards: shardsReward,
        exp: expReward,
        cardName: cardRewardStr,
        ...levelUpInfo
      }
    });

  } catch (error: any) {
    console.error('Battle API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
