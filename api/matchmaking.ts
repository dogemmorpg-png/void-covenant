// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as jwtPkg from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { CARD_TEMPLATES } from './_shared/cards.js';

const jwt = (jwtPkg as any).default || jwtPkg;

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-in-prod';

function getSupabase() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://yetzjqqnmllwufmzopor.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlldHpqcXFubWxsd3VmbXpvcG9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NTkwMzgsImV4cCI6MjA5ODMzNTAzOH0.Ra2mdK9QS4Aq5WZsUmULvqfdaJkdLJBcEzPch9EpwB4';
  return createClient(supabaseUrl, supabaseKey);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

  try {
    const supabase = getSupabase();

    // 1. Fetch current player's rating and profile
    const { data: currentPlayerRow, error: currentPlayerError } = await supabase
      .from('profiles')
      .select('data')
      .eq('wallet_address', walletAddress)
      .single();

    if (currentPlayerError || !currentPlayerRow) {
      return res.status(404).json({ error: 'Player profile not found' });
    }

    const profileData = currentPlayerRow.data;
    const playerRating = profileData.pvpRating || 100;

    // 2. Spend resource (Energy or Shards)
    const { spendShards, spendEnergy } = req.body || {};
    
    if (spendEnergy) {
      const currentEnergy = profileData.pvpEnergy || 0;
      if (currentEnergy < 1) {
        return res.status(400).json({ error: 'Not enough PvP energy' });
      }
      profileData.pvpEnergy = currentEnergy - 1;
    }

    if (spendShards) {
      const currentShards = profileData.darkShards || 0;
      if (currentShards < 5) {
        return res.status(400).json({ error: 'Insufficient Dark Shards' });
      }
      profileData.darkShards = currentShards - 5;
    }

    // 3. Fetch potential opponents (real profiles)
    const { data: rows, error } = await supabase
      .from('profiles')
      .select('wallet_address, data')
      .neq('wallet_address', walletAddress)
      .limit(150);

    if (error) {
      console.error('Failed to query profiles:', error);
    }

    let opponent: any = null;

    if (rows && rows.length > 0) {
      const realPlayers = rows
        .filter(r => r.data && r.data.username && r.data.username.trim() !== '')
        .map(r => {
          const data = r.data;
          
          // Map deck IDs to actual card instances
          const mappedDeck = (data.deck || [])
            .map(id => data.collection?.find(c => c.id === id))
            .filter(Boolean)
            .map(c => ({
              baseId: c.baseId,
              name: c.name,
              tier: c.tier,
              attack: c.attack,
              health: c.health,
              maxHealth: c.maxHealth || c.health,
              delay: c.delay,
              manaCost: c.manaCost || 1,
              skills: c.skills || [],
              image: c.image,
              color: c.color,
              level: c.level || 1,
              xp: c.xp || 0,
              maxXp: c.maxXp || 100
            }));

          return {
            walletAddress: r.wallet_address,
            username: data.username,
            pvpRating: data.pvpRating || 100,
            avatarUrl: data.avatarUrl || '/avatars/knight.webp',
            level: data.level || 1,
            activeStance: data.activeStance || 'void_strike',
            talents: data.talents || {},
            deck: mappedDeck,
            isBot: false
          };
        })
        .filter(p => p.deck.length > 0);

      if (realPlayers.length > 0) {
        // Filter players within +/- 300 MMR
        const inRange = realPlayers.filter(p => Math.abs(p.pvpRating - playerRating) <= 300);
        if (inRange.length > 0) {
          opponent = inRange[Math.floor(Math.random() * inRange.length)];
        } else {
          // If none in range, sort by closest rating and pick from the top 3 closest at random
          realPlayers.sort((a, b) => Math.abs(a.pvpRating - playerRating) - Math.abs(b.pvpRating - playerRating));
          const topClosest = realPlayers.slice(0, 3);
          opponent = topClosest[Math.floor(Math.random() * topClosest.length)];
        }
      }
    }

    // 4. Fallback to bot if no real player found
    if (!opponent) {
      const botNames = ['Void_Stalker', 'Acheron_Cultist', 'Lilith_Gloom', 'DoomBringer', 'HexMage', 'Doom_Herald', 'Soul_Reaver'];
      const botAvatars = ['/avatars/knight.webp', '/avatars/mage.webp', '/avatars/thief.webp'];
      
      const botName = botNames[Math.floor(Math.random() * botNames.length)] + '_' + Math.floor(Math.random() * 90 + 10);
      const variance = Math.floor(Math.random() * 101) - 50; // -50 to +50 MMR
      const botRating = Math.max(100, playerRating + variance);
      const botLevel = Math.max(1, Math.min(30, Math.floor(botRating / 100) + Math.floor(Math.random() * 3)));

      // Generate bot deck (10 cards from CARD_TEMPLATES)
      const botDeck = Array.from({ length: 10 }, () => {
        const randomTemplate = CARD_TEMPLATES[Math.floor(Math.random() * CARD_TEMPLATES.length)];
        const mmrMultiplier = 1 + (botRating - 100) * 0.0003;
        const scaledHealth = Math.round(randomTemplate.health * mmrMultiplier);
        const level = 1 + Math.min(4, Math.floor(botRating / 400));
        return {
          baseId: randomTemplate.baseId,
          name: randomTemplate.name,
          tier: randomTemplate.tier,
          attack: Math.round(randomTemplate.attack * mmrMultiplier),
          health: scaledHealth,
          maxHealth: scaledHealth,
          delay: randomTemplate.delay,
          manaCost: randomTemplate.tier === 'silver' ? 2 : (randomTemplate.tier === 'gold' ? 3 : (randomTemplate.tier === 'legendary' ? 4 : 1)),
          skills: randomTemplate.skills || [],
          image: randomTemplate.image,
          color: randomTemplate.color,
          level: level,
          xp: 0,
          maxXp: 100
        };
      });

      opponent = {
        walletAddress: 'bot_' + botName.toLowerCase() + '_' + Date.now(),
        username: botName,
        pvpRating: botRating,
        avatarUrl: botAvatars[Math.floor(Math.random() * botAvatars.length)],
        level: botLevel,
        activeStance: Math.random() < 0.35 ? 'warlord_cry' : (Math.random() < 0.5 ? 'blood_aura' : 'void_strike'),
        talents: {},
        deck: botDeck,
        isBot: true
      };
    }

    // 5. Lock this active opponent in the database
    profileData.activePvpOpponent = {
      walletAddress: opponent.walletAddress,
      name: opponent.username,
      rating: opponent.pvpRating,
      deck: opponent.deck,
      stance: opponent.activeStance || 'void_strike',
      talents: opponent.talents || {},
      avatarUrl: opponent.avatarUrl || '/avatars/knight.webp',
      level: opponent.level || 1
    };

    // 6. Save player profile to DB
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ data: profileData, updated_at: new Date().toISOString() })
      .eq('wallet_address', walletAddress);
      
    if (updateError) {
      console.error('Failed to update player profile:', updateError);
    }

    return res.status(200).json({ success: true, opponent, profile: profileData });

  } catch (error: any) {
    console.error('Matchmaking API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
