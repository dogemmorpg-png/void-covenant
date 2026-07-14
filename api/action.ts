import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { PlayerProfile } from '../src/types.js';
import { BATTLE_PASS_TIERS } from '../src/data/battlepass.js';
import { CARD_TEMPLATES, createCardInstance } from '../src/data/cards.js';

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

  const { action, payload } = req.body;
  if (!action) {
    return res.status(400).json({ error: 'Missing action.' });
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
    let successMessage = '';
    let responseData: any = {};

    if (action === 'buy_shards') {
      const { solAmount } = payload;
      if (!profile.solBalance || profile.solBalance < solAmount) {
        return res.status(400).json({ error: 'Not enough SOL balance' });
      }
      const shardsBought = Math.round(solAmount * 50);
      profile.solBalance = Number((profile.solBalance - solAmount).toFixed(4));
      profile.darkShards += shardsBought;
      successMessage = `Bought ${shardsBought} Dark Shards`;
      
    } else if (action === 'claim_battlepass') {
      const { tierIndex, isPremium } = payload;
      const tier = BATTLE_PASS_TIERS[tierIndex];
      if (!tier) return res.status(400).json({ error: 'Invalid tier index' });
      
      if (profile.battlePassPoints < tier.pointsRequired) {
        return res.status(400).json({ error: 'Not enough Battle Pass points' });
      }
      
      const claimId = tierIndex * 2 + (isPremium ? 1 : 0);
      if (profile.battlePassClaimed.includes(claimId)) {
        return res.status(400).json({ error: 'Reward already claimed' });
      }

      if (isPremium && !profile.isPremiumBP) {
        return res.status(400).json({ error: 'Premium Battle Pass not unlocked' });
      }

      const rewardType = isPremium ? tier.premiumRewardType : tier.freeRewardType;
      const rewardAmount = isPremium ? tier.premiumRewardAmount : tier.freeRewardAmount;

      if (rewardType === 'gold') profile.gold += rewardAmount;
      else if (rewardType === 'dust') profile.dust += rewardAmount;
      else if (rewardType === 'shards') profile.darkShards += rewardAmount;
      else if (rewardType === 'card' || rewardType === 'legendary_pack') {
        const rareTemplates = CARD_TEMPLATES.filter((t: any) => t.tier === 'silver' || t.tier === 'gold');
        const randomTemplate = rareTemplates[Math.floor(Math.random() * rareTemplates.length)];
        const newCard = createCardInstance(randomTemplate, 1);
        profile.collection.push(newCard);
        responseData.newCardName = newCard.name;
      }
      profile.battlePassClaimed.push(claimId);
      successMessage = 'Battle Pass reward claimed';

    } else if (action === 'buy_premium_bp') {
      if (profile.isPremiumBP) return res.status(400).json({ error: 'Already unlocked' });
      if (profile.darkShards < 40) return res.status(400).json({ error: 'Not enough Shards' });
      profile.darkShards -= 40;
      profile.isPremiumBP = true;
      successMessage = 'Premium Battle Pass Unlocked!';
    } else if (action === 'airdrop_task') {
      const { taskId } = payload;
      const taskIndex = profile.airdropTasks.findIndex((t: any) => t.id === taskId);
      if (taskIndex === -1) return res.status(400).json({ error: 'Task not found' });
      if (profile.airdropTasks[taskIndex].completed) return res.status(400).json({ error: 'Task already completed' });
      
      const task = profile.airdropTasks[taskIndex];
      if (task.rewardType === 'gold') profile.gold += task.rewardAmount;
      else if (task.rewardType === 'dust') profile.dust += task.rewardAmount;
      else if (task.rewardType === 'shards') profile.darkShards += task.rewardAmount;
      
      profile.airdropTasks[taskIndex].completed = true;
      successMessage = 'Airdrop task completed';
    } else {
      return res.status(400).json({ error: 'Unknown action' });
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
      message: successMessage,
      ...responseData
    });

  } catch (error: any) {
    console.error('Action API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
