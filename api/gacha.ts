import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { CARD_TEMPLATES, createCardInstance } from '../src/data/cards';

// Setup Supabase Service Client (bypasses RLS to safely update DB)
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-in-prod';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    const walletAddress = decoded.wallet;
    const { packType, numCards = 3 } = req.body;

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('data')
      .eq('wallet_address', walletAddress)
      .single();

    if (profileError || !profileData) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profile = profileData.data;

    let goldCost = 0;
    let shardCost = 0;

    if (packType === 'bronze') goldCost = 300;
    else if (packType === 'obsidian') shardCost = 30;
    else if (packType === 'abyssal') shardCost = 100;
    else return res.status(400).json({ error: 'Invalid pack type' });

    if (profile.gold < goldCost) {
      return res.status(400).json({ error: 'Not enough gold' });
    }
    
    // Check shards or dust depending on how it's stored
    const currentShards = profile.shards !== undefined ? profile.shards : (profile.dust || 0);
    if (currentShards < shardCost) {
      return res.status(400).json({ error: 'Not enough shards' });
    }

    if (goldCost > 0) profile.gold -= goldCost;
    if (shardCost > 0) {
      if (profile.shards !== undefined) profile.shards -= shardCost;
      else profile.dust -= shardCost;
    }

    const newCards = generateRandomCards(packType, numCards);
    profile.collection = [...(profile.collection || []), ...newCards];

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ data: profile })
      .eq('wallet_address', walletAddress);

    if (updateError) {
      console.error('Update error:', updateError);
      return res.status(500).json({ error: 'Failed to update database' });
    }

    return res.status(200).json({ success: true, profile, newCards });

  } catch (error) {
    console.error('Gacha error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
