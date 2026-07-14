import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { CARD_TEMPLATES } from '../src/data/cards.js';
import { Card, CardTier, PlayerProfile } from '../src/types.js';

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

  const { cardId1, cardId2 } = req.body;
  if (!cardId1 || !cardId2 || cardId1 === cardId2) {
    return res.status(400).json({ error: 'Must provide two distinct card IDs to fuse.' });
  }

  try {
    const supabase = getSupabase();
    
    // Fetch profile
    const { data: profileRow, error: fetchError } = await supabase
      .from('profiles')
      .select('data')
      .eq('wallet_address', walletAddress)
      .single();

    if (fetchError || !profileRow) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profile: PlayerProfile = profileRow.data;

    // Validate cards exist in collection
    const card1 = profile.collection.find((c: Card) => c.id === cardId1);
    const card2 = profile.collection.find((c: Card) => c.id === cardId2);

    if (!card1 || !card2) {
      return res.status(400).json({ error: 'One or both cards not found in collection.' });
    }

    // Validate they are not in the active deck
    if (profile.deck.includes(cardId1) || profile.deck.includes(cardId2)) {
      return res.status(400).json({ error: 'Cannot fuse cards that are currently in your active deck.' });
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

    // Save
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ data: profile, updated_at: new Date().toISOString() })
      .eq('wallet_address', walletAddress);

    if (updateError) {
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
