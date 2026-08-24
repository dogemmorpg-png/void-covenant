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

    // 1. Fetch current player's rating
    const { data: currentPlayerRow, error: currentPlayerError } = await supabase
      .from('profiles')
      .select('data')
      .eq('wallet_address', walletAddress)
      .single();

    if (currentPlayerError || !currentPlayerRow) {
      return res.status(404).json({ error: 'Player profile not found' });
    }

    const playerRating = currentPlayerRow.data.pvpRating || 100;

    // 2. Fetch potential opponents (real profiles)
    const { data: rows, error } = await supabase
      .from('profiles')
      .select('wallet_address, data')
      .neq('wallet_address', walletAddress)
      .limit(100);

    if (error) {
      console.error('Failed to query profiles:', error);
    }

    const opponents: any[] = [];

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
            activeStance: data.activeStance || 'void_strike',
            talents: data.talents || {},
            deck: mappedDeck,
            isBot: false
          };
        })
        .filter(p => p.deck.length > 0);

      // Sort by closest rating to the current player
      realPlayers.sort((a, b) => Math.abs(a.pvpRating - playerRating) - Math.abs(b.pvpRating - playerRating));
      
      // Grab top matches (up to 3)
      opponents.push(...realPlayers.slice(0, 3));
    }

    // 3. Fallback to bots to fill slots up to 3
    const botNames = ['Void_Stalker', 'Acheron_Cultist', 'Lilith_Gloom', 'DoomBringer', 'HexMage', 'Doom_Herald', 'Soul_Reaver'];
    const botAvatars = ['/avatars/knight.webp', '/avatars/mage.webp', '/avatars/thief.webp'];
    
    while (opponents.length < 3) {
      const botIndex = opponents.length;
      const botName = botNames[botIndex % botNames.length] + '_' + Math.floor(Math.random() * 90 + 10);
      const variance = Math.floor(Math.random() * 101) - 50; // -50 to +50 MMR
      const botRating = Math.max(100, playerRating + variance);

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

      opponents.push({
        walletAddress: 'bot_' + botName.toLowerCase() + '_' + Date.now(),
        username: botName,
        pvpRating: botRating,
        avatarUrl: botAvatars[Math.floor(Math.random() * botAvatars.length)],
        activeStance: Math.random() < 0.35 ? 'warlord_cry' : (Math.random() < 0.5 ? 'blood_aura' : 'void_strike'),
        talents: {},
        deck: botDeck,
        isBot: true
      });
    }

    return res.status(200).json({ success: true, opponents });

  } catch (error: any) {
    console.error('Matchmaking API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
