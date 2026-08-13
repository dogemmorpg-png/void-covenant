import { VercelRequest, VercelResponse } from '@vercel/node';


import { CARD_TEMPLATES, createCardInstance } from './shared/cards';
import { getRandomEquipmentByTier, generateEquipmentInstance } from './shared/equipment';
import { PlayerProfile, CardTier } from './shared/types';
import { calculateEnergy } from './shared/energyHelper';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-in-prod';

function getSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yetzjqqnmllwufmzopor.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4';
  return createClient(supabaseUrl, supabaseKey);
}

function generateRandomCards(packType: string, numCards: number) {
  const pool = CARD_TEMPLATES;
  let selectedTemplates: any[] = [];

  for (let i = 0; i < numCards; i++) {
    let rand = Math.random() * 100;
    let cardTemplate;

    if (packType === 'bronze') {
      if (rand < 95) {
        const bronzePool = pool.filter(c => c.tier === 'bronze');
        cardTemplate = bronzePool[Math.floor(Math.random() * bronzePool.length)];
      } else {
        const silverPool = pool.filter(c => c.tier === 'silver');
        cardTemplate = silverPool[Math.floor(Math.random() * silverPool.length)];
      }
    } else if (packType === 'obsidian') {
      if (rand < 40) {
        const bronzePool = pool.filter(c => c.tier === 'bronze');
        cardTemplate = bronzePool[Math.floor(Math.random() * bronzePool.length)];
      } else if (rand < 90) {
        const silverPool = pool.filter(c => c.tier === 'silver');
        cardTemplate = silverPool[Math.floor(Math.random() * silverPool.length)];
      } else {
        const goldPool = pool.filter(c => c.tier === 'gold');
        cardTemplate = goldPool[Math.floor(Math.random() * goldPool.length)];
      }
    } else {
      if (rand < 40) {
        const silverPool = pool.filter(c => c.tier === 'silver');
        cardTemplate = silverPool[Math.floor(Math.random() * silverPool.length)];
      } else if (rand < 85) {
        const goldPool = pool.filter(c => c.tier === 'gold');
        cardTemplate = goldPool[Math.floor(Math.random() * goldPool.length)];
      } else {
        const legendaryPool = pool.filter(c => c.tier === 'legendary');
        cardTemplate = legendaryPool[Math.floor(Math.random() * legendaryPool.length)];
      }
    }

    let rollLevel = 1;
    if (packType === 'obsidian' && Math.random() < 0.3) rollLevel = 2;
    if (packType === 'abyssal' && Math.random() < 0.4) rollLevel = 2;

    const newCardInstance = createCardInstance(cardTemplate, rollLevel);
    selectedTemplates.push(newCardInstance);
  }

  return selectedTemplates;
}

function generateRandomEquipment(packType: string, numEquips: number) {
  let selectedEquips: any[] = [];
  for (let i = 0; i < numEquips; i++) {
    let tier: CardTier = 'bronze';
    const rand = Math.random() * 100;
    
    if (packType === 'eq_basic') {
      tier = rand < 80 ? 'bronze' : 'silver';
    } else if (packType === 'eq_rare') {
      if (rand < 40) tier = 'bronze';
      else if (rand < 90) tier = 'silver';
      else tier = 'gold';
    } else {
      if (rand < 40) tier = 'silver';
      else if (rand < 85) tier = 'gold';
      else tier = 'legendary';
    }

    const template = getRandomEquipmentByTier(tier);
    const instance = generateEquipmentInstance(template);
    selectedEquips.push(instance);
  }
  return selectedEquips;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
      const jwt = require('jsonwebtoken');
  const { createClient } = require('@supabase/supabase-js');
  const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const walletAddress = decoded.walletAddress || decoded.wallet;
    const { packType, numCards = 3 } = req.body;

    const supabase = getSupabase();

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('data')
      .eq('wallet_address', walletAddress)
      .single();

    let profile: PlayerProfile;

    if (profileError || !profileData) {
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
      await supabase.from('profiles').upsert({ wallet_address: walletAddress, data: profile });
    } else {
      profile = profileData.data;
    }

    let goldCost = 0;
    let shardCost = 0;
    let isEquipment = false;

    if (packType === 'bronze') goldCost = 300;
    else if (packType === 'obsidian') shardCost = 30;
    else if (packType === 'abyssal') shardCost = 100;
    else if (packType === 'eq_basic') { goldCost = 500; isEquipment = true; }
    else if (packType === 'eq_rare') { shardCost = 30; isEquipment = true; }
    else if (packType === 'eq_premium') { shardCost = 70; isEquipment = true; }
    else return res.status(400).json({ error: 'Invalid pack type' });

    if (goldCost > 0 && profile.gold < goldCost) {
      return res.status(400).json({ error: 'Not enough gold' });
    }
    
    if (shardCost > 0 && profile.darkShards < shardCost) {
      return res.status(400).json({ error: 'Not enough Dark Shards' });
    }

    if (goldCost > 0) profile.gold -= goldCost;
    if (shardCost > 0) profile.darkShards -= shardCost;

    let newItems: any[] = [];
    if (isEquipment) {
      newItems = generateRandomEquipment(packType, 1);
      profile.equipment = [...(profile.equipment || []), ...newItems];
    } else {
      newItems = generateRandomCards(packType, numCards);
      profile.collection = [...(profile.collection || []), ...newItems];
    }

    profile = calculateEnergy(profile);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ data: profile, updated_at: new Date().toISOString() })
      .eq('wallet_address', walletAddress);

    if (updateError) {
      console.error('Update error in gacha.ts:', updateError);
      return res.status(500).json({ error: 'Failed to update database' });
    }

    return res.status(200).json({ success: true, profile, newItems });

  } catch (error: any) {
    console.error('Gacha error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
