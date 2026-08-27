// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as jwtPkg from 'jsonwebtoken';
const jwt = (jwtPkg as any).default || jwtPkg;
import { createClient } from '@supabase/supabase-js';
import { PlayerProfile, CardTemplate } from './_shared/types.js';
import { generateCampaignStage, createCardInstance } from './_shared/cards.js';
import { calculateEnergy, processExpGain } from './_shared/energyHelper.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-in-prod';

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

  const { battleType, stageId, result, stars, isStart } = req.body;
  if (!battleType || (!result && !isStart)) {
    return res.status(400).json({ error: 'Missing battle details.' });
  }

  try {
    const supabase = getSupabase();
    
    const now = Date.now();
    const { data: profileRow, error: fetchError } = await supabase
      .from('profiles')
      .select('data, updated_at')
      .eq('wallet_address', walletAddress)
      .single();

    let profile: PlayerProfile;
    let oldUpdatedAt = profileRow ? profileRow.updated_at : null;

    if (fetchError || !profileRow) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    profile = profileRow.data;

    // Handle Battle Start (deduct energy)
    if (isStart || !result) {
      profile = calculateEnergy(profile);

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
        if (!profile.activePvpOpponent) {
          return res.status(400).json({ error: 'No active PvP opponent found. Please search first.' });
        }
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
    }
      profile = {
        gold: 1000,
        dust: 250,
        darkShards: 50,
        collection: [
          { id: 'c_starter_1', templateId: 's1_skeletal_warrior', name: 'Skeleton Warrior', tier: 'Common', attack: 4, health: 5, manaCost: 2, image: '/cards/skeleton_warrior.webp', count: 1, level: 1 },
          { id: 'c_starter_2', templateId: 's1_grave_ghoul', name: 'Grave Ghoul', tier: 'Common', attack: 3, health: 6, manaCost: 2, image: '/cards/grave_ghoul.webp', count: 1, level: 1 },
          { id: 'c_starter_3', templateId: 's1_bone_archer', name: 'Bone Archer', tier: 'Common', attack: 5, health: 3, manaCost: 2, image: '/cards/bone_archer.webp', count: 1, level: 1 },
          { id: 'c_starter_4', templateId: 's1_plague_rat', name: 'Plague Rat', tier: 'Common', attack: 2, health: 4, manaCost: 1, image: '/cards/plague_rat.webp', count: 1, level: 1 },
          { id: 'c_starter_5', templateId: 's1_dark_acolyte', name: 'Dark Acolyte', tier: 'Common', attack: 4, health: 4, manaCost: 2, image: '/cards/dark_acolyte.webp', count: 1, level: 1 }
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
        pvpLeague: 'Bronze',
        pvpLP: 0,
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
      } as any;
      await supabase.from('profiles').upsert({ wallet_address: walletAddress, data: profile });
    } else {
      profile = profileRow.data;
      profile.pvpLeague = profile.pvpLeague || 'Bronze';
      profile.pvpLP = profile.pvpLP !== undefined ? profile.pvpLP : 0;
      
      // Anti-Cheat: Simple cooldown check (must be at least 3 seconds between battles)
      if (profile.lastBattleTime && now - profile.lastBattleTime < 3000) {
        return res.status(400).json({ error: 'Battles are occurring too quickly (Cooldown).' });
      }
      profile.lastBattleTime = now;
    }

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

      // Energy is now deducted at battle start on the server to prevent save-scumming.
      // Verification only:
      if ((profile.pveEnergy || 0) < 0) {
        profile.pveEnergy = 0;
      }

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
      } else {
        goldReward = Math.floor(20 * goldMultiplier);
      }
    } else if (battleType === 'pvp') {
      // Energy is now deducted at battle start on the server to prevent save-scumming.
      // Verification only:
      if ((profile.pvpEnergy || 0) < 0) {
        profile.pvpEnergy = 0;
      }

      const opponent = profile.activePvpOpponent || { 
        walletAddress: 'bot', 
        name: 'Simulated Challenger', 
        rating: profile.pvpRating || 100 
      };

      const rPlayer = profile.pvpRating || 100;
      const rOpponent = opponent.rating || 100;
      const expected = 1 / (1 + Math.pow(10, (rOpponent - rPlayer) / 400));
      
      let attackerRatingChange = 0;
      let defenderRatingChange = 0;
      let attackerLPChange = 0;
      let defenderLPChange = 0;

      if (result === 'win') {
        goldReward = Math.floor(20 * goldMultiplier);
        expReward = Math.floor(80 * expMultiplier);
        
        const gain = Math.round(32 * (1 - expected));
        attackerRatingChange = Math.max(10, Math.min(32, gain));
        defenderRatingChange = -Math.max(5, Math.min(25, Math.round(32 * (1 - expected))));
        
        attackerLPChange = 20;
        defenderLPChange = -15;
      } else {
        goldReward = Math.floor(20 * goldMultiplier);
        
        const loss = Math.round(32 * expected);
        attackerRatingChange = -Math.max(5, Math.min(25, loss));
        
        const gain = Math.round(32 * expected);
        defenderRatingChange = Math.max(10, Math.min(32, gain));
        
        attackerLPChange = -15;
        defenderLPChange = 20;
      }

      const lpPlayer = profile.pvpLP !== undefined ? profile.pvpLP : 0;
      const lpOpponent = opponent.lp !== undefined ? opponent.lp : (opponent.pvpLP !== undefined ? opponent.pvpLP : 0);

      profile.pvpRating = Math.max(0, rPlayer + attackerRatingChange);
      profile.pvpLP = Math.max(0, lpPlayer + attackerLPChange);

      const recordId = 'pvp_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      
      // Save record in player's (attacker) history
      const attackerRecord = {
        id: recordId,
        timestamp: Date.now(),
        attackerName: profile.username || 'You',
        defenderName: opponent.name,
        attackerWallet: walletAddress,
        defenderWallet: opponent.walletAddress,
        winner: result === 'win' ? 'attacker' : 'defender',
        attackerRatingBefore: rPlayer,
        defenderRatingBefore: rOpponent,
        attackerRatingChange: attackerRatingChange,
        defenderRatingChange: defenderRatingChange,
        attackerLPBefore: lpPlayer,
        defenderLPBefore: lpOpponent,
        attackerLPChange: attackerLPChange,
        defenderLPChange: defenderLPChange,
        isDefense: false
      };
      
      profile.pvpHistory = [attackerRecord, ...(profile.pvpHistory || [])].slice(0, 30);

      // Process Offline Defense if defender is a real player
      if (opponent.walletAddress && opponent.walletAddress !== 'bot' && !opponent.walletAddress.startsWith('bot_')) {
        try {
          const { data: defenderRow } = await supabase
            .from('profiles')
            .select('data, updated_at')
            .eq('wallet_address', opponent.walletAddress)
            .single();

          if (defenderRow) {
            let defProfile = defenderRow.data;
            const rDefBefore = defProfile.pvpRating || 100;
            defProfile.pvpRating = Math.max(0, rDefBefore + defenderRatingChange);
            
            const lpDefBefore = defProfile.pvpLP !== undefined ? defProfile.pvpLP : 0;
            defProfile.pvpLeague = defProfile.pvpLeague || 'Bronze';
            defProfile.pvpLP = Math.max(0, lpDefBefore + defenderLPChange);
            
            const defenderRecord = {
              id: recordId,
              timestamp: Date.now(),
              attackerName: profile.username || 'Opponent',
              defenderName: defProfile.username || 'You',
              attackerWallet: walletAddress,
              defenderWallet: opponent.walletAddress,
              winner: result === 'win' ? 'attacker' : 'defender',
              attackerRatingBefore: rPlayer,
              defenderRatingBefore: rDefBefore,
              attackerRatingChange: attackerRatingChange,
              defenderRatingChange: defenderRatingChange,
              attackerLPBefore: lpPlayer,
              defenderLPBefore: lpDefBefore,
              attackerLPChange: attackerLPChange,
              defenderLPChange: defenderLPChange,
              isDefense: true
            };
            
            defProfile.pvpHistory = [defenderRecord, ...(defProfile.pvpHistory || [])].slice(0, 30);
            
            await supabase
              .from('profiles')
              .update({ data: defProfile, updated_at: new Date().toISOString() })
              .eq('wallet_address', opponent.walletAddress);
          }
        } catch (defErr) {
          console.error('Offline defense update failed for:', opponent.walletAddress, defErr);
        }
      }

      // Clear current match lock
      delete profile.activePvpOpponent;
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

    const newUpdatedAt = new Date().toISOString();
    let updateQuery = supabase
      .from('profiles')
      .update({ data: profile, updated_at: newUpdatedAt })
      .eq('wallet_address', walletAddress);
      
    if (oldUpdatedAt) {
      updateQuery = updateQuery.eq('updated_at', oldUpdatedAt);
    }

    const { data: updateResult, error: updateError } = await updateQuery.select('wallet_address');

    if (updateError || !updateResult || updateResult.length === 0) {
      console.error('Update profile error in battle.ts:', updateError);
      return res.status(409).json({ error: 'Conflict: Please try again' });
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





