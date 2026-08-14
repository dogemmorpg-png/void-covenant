// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as jwtPkg from 'jsonwebtoken';
const jwt = (jwtPkg as any).default || jwtPkg;
import { createClient } from '@supabase/supabase-js';
import { CARD_TEMPLATES } from './_shared/cards.js';
import { Card, CardTier, PlayerProfile } from './_shared/types.js';
import { calculateEnergy } from './_shared/energyHelper.js';

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

  const { cardId1, cardId2 } = req.body;
  if (!cardId1 || !cardId2 || cardId1 === cardId2) {
    return res.status(400).json({ error: 'Must provide two distinct card IDs to fuse.' });
  }

  try {
    const supabase = getSupabase();
    
    // Fetch profile
    const { data: profileRows, error: fetchError } = await supabase
      .from('profiles')
      .select('data, updated_at')
      .eq('wallet_address', walletAddress)
      .limit(1);

    const profileRow = profileRows && profileRows.length > 0 ? profileRows[0] : null;

    if (fetchError) {
      return res.status(500).json({ error: 'Database error fetching profile', details: fetchError });
    }

    let profile: PlayerProfile;
    let oldUpdatedAt = profileRow ? profileRow.updated_at : null;

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

    // Validate cards exist in collection
    const card1 = profile.collection.find((c: Card) => c.id === cardId1);
    const card2 = profile.collection.find((c: Card) => c.id === cardId2);

    if (!card1 || !card2) {
      return res.status(400).json({ error: 'One or both cards not found in collection.' });
    }



    if (card1.baseId !== card2.baseId) {
      return res.status(400).json({ error: 'Cards must have the same base creature.' });
    }
    
    if (card1.level !== card2.level) {
      return res.status(400).json({ error: 'Cards must be the same level.' });
    }
    
    if (card1.tier !== card2.tier) {
      return res.status(400).json({ error: 'Cards must be the same tier.' });
    }

    const isLevelUpgrade = card1.level < 5;
    
    const goldCost = isLevelUpgrade ? card1.level * 150 : 500;
    const dustCost = isLevelUpgrade ? card1.level * 20 : 100;
    
    if (profile.gold < goldCost) {
      return res.status(400).json({ error: `Not enough gold. Required: ${goldCost}` });
    }
    if (profile.dust < dustCost) {
      return res.status(400).json({ error: `Not enough dust. Required: ${dustCost}` });
    }

    if (!isLevelUpgrade && card1.tier === 'legendary') {
      return res.status(400).json({ error: 'Card is already at the highest tier (Legendary) and cannot be fused.' });
    }

    let fusedCard: Card;

    if (isLevelUpgrade) {
      const nextLevel = card1.level + 1;
      fusedCard = {
        ...card1,
        id: card1.id,
        level: nextLevel,
        attack: Math.round(card1.attack * 1.15),
        health: Math.round(card1.health * 1.15),
        maxHealth: Math.round(card1.health * 1.15)
      };

      const template = CARD_TEMPLATES.find((t: any) => t.baseId === card1.baseId);
      if (template) {
        fusedCard.skills = card1.skills.map((skill: any) => {
          const skillTemplate = template.skills.find((s: any) => s.type === skill.type);
          const baseValue = skillTemplate ? skillTemplate.value : skill.value;
          const scaleFactor = 1 + Math.floor((nextLevel - 1) / 2) * 0.5;
          const newValue = Math.round(baseValue * scaleFactor);
          return {
            ...skill,
            value: newValue,
            description: skill.description.replace(/\d+/, String(newValue))
          };
        });
      }
    } else {
      let nextTier: CardTier = 'bronze';
      if (card1.tier === 'bronze') nextTier = 'silver';
      else if (card1.tier === 'silver') nextTier = 'gold';
      else if (card1.tier === 'gold') nextTier = 'legendary';
      
      fusedCard = {
        ...card1,
        id: card1.id,
        tier: nextTier,
        level: 1,
        attack: Math.round(card1.attack * 1.25),
        health: Math.round(card1.health * 1.25),
        maxHealth: Math.round(card1.health * 1.25),
        delay: Math.max(1, card1.delay - 1)
      };
      
      if (nextTier === 'silver') {
        fusedCard.skills.push({
          type: 'vampirism',
          value: 2,
          description: 'Silver Vampirism: heals self for 2 HP.'
        });
      } else if (nextTier === 'gold') {
        fusedCard.skills.push({
          type: 'plague',
          value: 1,
          description: 'Golden Plague: deals 1 DMG to a random enemy.'
        });
      } else if (nextTier === 'legendary') {
        fusedCard.skills.push({
          type: 'hex',
          value: 3,
          description: 'Legendary Hex: +3 to enemy incoming damage.'
        });
      }
    }

    // Execute transaction locally
    profile.gold -= goldCost;
    profile.dust -= dustCost;
    profile.collection = profile.collection.filter((c: Card) => c.id !== card1.id && c.id !== card2.id);
    profile.collection.push(fusedCard);

    // Keep active deck updated seamlessly
    if (profile.deck) {
      if (profile.deck.includes(card2.id) && !profile.deck.includes(card1.id)) {
        profile.deck = profile.deck.map((id: string) => id === card2.id ? card1.id : id);
      } else if (profile.deck.includes(card2.id) && profile.deck.includes(card1.id)) {
        profile.deck = profile.deck.filter((id: string) => id !== card2.id);
      }
    }

    profile = calculateEnergy(profile);

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
      console.error('Fusion OCC conflict');
      return res.status(409).json({ error: 'Conflict: Please try again' });
    }

    if (updateError) {
      console.error('Fusion update error:', updateError);
      return res.status(500).json({ error: 'Failed to update profile.' });
    }

    return res.status(200).json({
      success: true,
      profile,
      newCard: fusedCard
    });
  } catch (error: any) {
    console.error('Fusion API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}





