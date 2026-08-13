import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { PlayerProfile } from '../src/types';
import { CARD_TEMPLATES, createCardInstance, generateCampaignStage, BATTLE_PASS_TIERS } from '../src/data/cards';
import { calculateEnergy, processExpGain } from '../src/utils/energyHelper';

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

  const { action, payload } = req.body;
  if (!action) {
    return res.status(400).json({ error: 'Missing action.' });
  }

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

    let profile: PlayerProfile;

    if (!profileRow) {
      profile = {
        gold: 1000,
        dust: 250,
        darkShards: 50,
        collection: [
          { id: 'c_starter_1', templateId: 's1_skeletal_warrior', name: 'Skeleton Warrior', tier: 'Common', attack: 4, health: 5, manaCost: 2, image: '/cards/skeleton_warrior.png', count: 1, level: 1 },
          { id: 'c_starter_2', templateId: 's1_grave_ghoul', name: 'Grave Ghoul', tier: 'Common', attack: 3, health: 6, manaCost: 2, image: '/cards/grave_ghoul.png', count: 1, level: 1 },
          { id: 'c_starter_3', templateId: 's1_bone_archer', name: 'Bone Archer', tier: 'Common', attack: 5, health: 3, manaCost: 2, image: '/cards/bone_archer.png', count: 1, level: 1 },
          { id: 'c_starter_4', templateId: 's1_plague_rat', name: 'Plague Rat', tier: 'Common', attack: 2, health: 4, manaCost: 1, image: '/cards/plague_rat.png', count: 1, level: 1 },
          { id: 'c_starter_5', templateId: 's1_dark_acolyte', name: 'Dark Acolyte', tier: 'Common', attack: 4, health: 4, manaCost: 2, image: '/cards/dark_acolyte.png', count: 1, level: 1 }
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
      } as any;
      // Prevent creating duplicates by checking again or using insert
      const { data: existingCheck } = await supabase.from('profiles').select('id').eq('wallet_address', walletAddress).limit(1);
      if (!existingCheck || existingCheck.length === 0) {
        await supabase.from('profiles').insert({ wallet_address: walletAddress, data: profile });
      }
    } else {
      profile = profileRow.data;
    }
    profile = calculateEnergy(profile);

    let successMessage = '';
    let responseData: any = {};

    if (action === 'sweep_stage') {
      const floorNum = parseInt(payload.floorNum);
      if (isNaN(floorNum)) return res.status(400).json({ error: 'Invalid floor number' });

      const stage = generateCampaignStage(floorNum);
      if (!stage) return res.status(400).json({ error: 'Campaign stage not found' });

      const stars = profile.campaignStars?.[floorNum.toString()] ?? profile.campaignStars?.[floorNum as any] ?? (floorNum < (profile.pveProgress || 1) ? 3 : 0);
      if (stars < 3) {
        return res.status(400).json({ error: '3 stars required on this stage to sweep!' });
      }

      if ((profile.pveEnergy || 0) < stage.energyCost) {
        return res.status(400).json({ error: 'Not enough PvE energy' });
      }
      profile.pveEnergy -= stage.energyCost;

      let goldMultiplier = 1;
      let expMultiplier = 1;
      if (profile.equipped && profile.equipment) {
        Object.values(profile.equipped).forEach(eqId => {
          const eq = profile.equipment.find((e: any) => e.id === eqId);
          if (eq && eq.bonusType === 'goldBonus') goldMultiplier += (eq.bonusValue / 100);
          if (eq && eq.bonusType === 'expBonus') expMultiplier += (eq.bonusValue / 100);
        });
      }

      const goldReward = Math.floor(stage.goldReward * goldMultiplier);
      const dustReward = stage.dustReward;
      const shardsReward = stage.shardsReward || 0;
      const expReward = Math.floor(50 * expMultiplier);

      profile.gold = (profile.gold || 0) + goldReward;
      profile.dust = (profile.dust || 0) + dustReward;
      profile.darkShards = (profile.darkShards || 0) + shardsReward;
      profile.battlePassPoints = (profile.battlePassPoints || 0) + 50;

      const { leveledUp } = processExpGain(profile, expReward);

      successMessage = leveledUp 
        ? `🔥 LEVEL UP! Reached Level ${profile.level}! (+2 Max HP) +${goldReward} Gold, +${dustReward} Dust, +${expReward} EXP`
        : `Sweep Success! +${goldReward} Gold, +${dustReward} Dust, +${expReward} EXP`;
      responseData = { goldReward, dustReward, shardsReward, expReward, leveledUp, level: profile.level };

    } else if (action === 'buy_shards') {
      const { solAmount } = payload;
      if (!profile.solBalance || profile.solBalance < solAmount) {
        return res.status(400).json({ error: 'Not enough SOL balance' });
      }
      const shardsBought = Math.round(solAmount * 50);
      profile.solBalance = Number((profile.solBalance - solAmount).toFixed(4));
      profile.darkShards = (profile.darkShards || 0) + shardsBought;
      successMessage = `Bought ${shardsBought} Dark Shards`;
      
    } else if (action === 'claim_battlepass') {
      const { tierIndex, isPremium } = payload;
      const tier = BATTLE_PASS_TIERS[tierIndex];
      if (!tier) return res.status(400).json({ error: 'Invalid tier index' });
      
      if ((profile.battlePassPoints || 0) < tier.pointsRequired) {
        return res.status(400).json({ error: 'Not enough Battle Pass points' });
      }
      
      const claimId = tierIndex * 2 + (isPremium ? 1 : 0);
      profile.battlePassClaimed = profile.battlePassClaimed || [];
      if (profile.battlePassClaimed.includes(claimId)) {
        return res.status(400).json({ error: 'Reward already claimed' });
      }

      if (isPremium && !profile.isPremiumBP) {
        return res.status(400).json({ error: 'Premium Battle Pass not unlocked' });
      }

      const rewardType = isPremium ? tier.premiumRewardType : tier.freeRewardType;
      const rewardAmount = isPremium ? tier.premiumRewardAmount : tier.freeRewardAmount;

      if (rewardType === 'gold') profile.gold = (profile.gold || 0) + rewardAmount;
      else if (rewardType === 'dust') profile.dust = (profile.dust || 0) + rewardAmount;
      else if (rewardType === 'shards') profile.darkShards = (profile.darkShards || 0) + rewardAmount;
      else if (rewardType === 'card' || rewardType === 'legendary_pack') {
        const rareTemplates = CARD_TEMPLATES.filter((t: any) => t.tier === 'silver' || t.tier === 'gold');
        const randomTemplate = rareTemplates[Math.floor(Math.random() * rareTemplates.length)];
        const newCard = createCardInstance(randomTemplate, 1);
        profile.collection = profile.collection || [];
        profile.collection.push(newCard);
        responseData.newCardName = newCard.name;
      }
      profile.battlePassClaimed.push(claimId);
      successMessage = 'Battle Pass reward claimed';

    } else if (action === 'buy_premium_bp') {
      if (profile.isPremiumBP) return res.status(400).json({ error: 'Already unlocked' });
      if ((profile.darkShards || 0) < 40) return res.status(400).json({ error: 'Not enough Shards' });
      profile.darkShards -= 40;
      profile.isPremiumBP = true;
      successMessage = 'Premium Battle Pass Unlocked!';
    } else if (action === 'airdrop_task') {
      const { taskId } = payload;
      profile.completedTasks = profile.completedTasks || [];
      if (profile.completedTasks.includes(taskId)) {
        return res.status(400).json({ error: 'Task already completed' });
      }
      
      // Look up task
      const task = CARD_TEMPLATES ? null : null; // We can reward directly:
      profile.completedTasks.push(taskId);
      profile.gold = (profile.gold || 0) + 200;
      profile.battlePassPoints = (profile.battlePassPoints || 0) + 30;
      successMessage = 'Airdrop task completed (+200 Gold, +30 BP)';
    } else {
      return res.status(400).json({ error: 'Unknown action' });
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ data: profile, updated_at: new Date().toISOString() })
      .eq('wallet_address', walletAddress);

    if (updateError) {
      console.error('Action API save error:', updateError);
      return res.status(500).json({ error: 'Failed to save action result.' });
    }

    return res.status(200).json({
      success: true,
      profile,
      message: successMessage,
      ...responseData
    });

  } catch (error: any) {
    console.error('Action API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
