// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as jwtPkg from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { CARD_TEMPLATES, createCardInstance } from './_shared/cards.js';

const jwt = (jwtPkg as any).default || jwtPkg;

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-change-in-prod';

function generateStarterDeck() {
  const bronzePool = CARD_TEMPLATES.filter(c => c.tier === 'bronze');
  const collection: any[] = [];
  const deck: string[] = [];
  
  for (let i = 0; i < 10; i++) {
    const template = bronzePool[Math.floor(Math.random() * bronzePool.length)];
    const instance = createCardInstance(template, 1);
    collection.push(instance);
    deck.push(instance.id);
  }
  
  return { collection, deck };
}

function calculateEnergy(profile: any): any {
  if (!profile) return profile;
  
  const now = Date.now();
  const pveMax = profile.pveEnergyMax || 10;
  
  const lastPve = profile.lastPveEnergyRefill ?? profile.lastEnergyRefill ?? now;
  const pveRegenInterval = 20 * 60 * 1000;
  const timePassedPve = Math.max(0, now - lastPve);
  
  let currentPve = profile.pveEnergy !== undefined ? profile.pveEnergy : pveMax;
  let newLastPve = lastPve;
  
  if (currentPve >= pveMax) {
    newLastPve = now;
    currentPve = pveMax;
  } else if (timePassedPve >= pveRegenInterval) {
    const gained = Math.floor(timePassedPve / pveRegenInterval);
    currentPve = Math.min(pveMax, currentPve + gained);
    newLastPve = now - (timePassedPve % pveRegenInterval);
  }
  
  if (profile.pvpTickets === undefined) {
    profile.pvpTickets = profile.pvpEnergy !== undefined ? profile.pvpEnergy : 5;
  }
  
  profile.pveEnergy = currentPve;
  profile.pvpEnergy = profile.pvpTickets;
  profile.pveEnergyMax = pveMax;
  profile.pvpEnergyMax = 5;
  profile.lastPveEnergyRefill = newLastPve;
  profile.lastPvpEnergyRefill = now;
  
  return profile;
}

const LEGACY_CARD_MAPPINGS: Record<string, string> = {
  'grave_hound': 'grave_digger',
  'zombie_footsoldier': 'spitfire_toad',
  'plague_beetle': 'possessed_cleaver',
  'blood_guard': 'petrified_basilisk',
  'cave_bat': 'gothic_harpy',
  'stone_gargoyle': 'crypt_wisp',
  'swamp_beast': 'chasm_worm',
  'dread_knight': 'fallen_inquisitor',
  'flesh_gorgon': 'stitched_chimera',
  'tomb_guardian': 'iron_maiden_golem',
  'spectral_stalker': 'tomb_weaver',
  'crypt_abomination': 'belfry_colossus',
  'void_behemoth': 'abyssal_leviathan',
  'grave_titan': 'pharaoh_of_the_void',
  'the_ancient_one': 'the_faceless_lord'
};

function migrateProfileCards(profile: any): any {
  if (!profile || !profile.collection) return profile;
  
  if (profile.avatarUrl) {
    profile.avatarUrl = profile.avatarUrl.replace(/\.png/g, '.webp').replace(/\.jpg/g, '.webp').replace(/\.jpeg/g, '.webp');
  }
  
  profile.collection = profile.collection.map((card: any) => {
    if (card.image) {
      card.image = card.image.replace(/\.png/g, '.webp').replace(/\.jpg/g, '.webp').replace(/\.jpeg/g, '.webp');
    }
    
    const mapped = LEGACY_CARD_MAPPINGS[card.baseId];
    if (mapped) {
      const template = CARD_TEMPLATES.find(t => t.baseId === mapped);
      if (template) {
        const level = card.level || 1;
        const scale = 1 + (level - 1) * 0.2;
        const attack = Math.round(template.attack * scale);
        const health = Math.round(template.health * scale);
        
        let manaCost = 1;
        if (template.tier === 'silver') manaCost = 2;
        else if (template.tier === 'gold') manaCost = 3;
        else if (template.tier === 'legendary') manaCost = 4;
        else if (template.delay > 1) manaCost = 2;

        return {
          ...card,
          baseId: mapped,
          name: template.name,
          tier: template.tier,
          attack,
          health,
          maxHealth: health,
          delay: template.delay,
          skills: template.skills,
          image: template.image,
          color: template.color,
          description: template.description,
          manaCost
        };
      }
    }
    return card;
  });

  return profile;
}

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

  const { safeProfileData, referrer } = req.body || {};

  try {
    const supabase = getSupabase();
    
    const { data: profileRows, error: fetchError } = await supabase
      .from('profiles')
      .select('data, updated_at')
      .eq('wallet_address', walletAddress)
      .limit(1);

    const profileRow = profileRows && profileRows.length > 0 ? profileRows[0] : null;

    if (fetchError) {
      return res.status(500).json({ error: 'Database error fetching profile', details: fetchError });
    }

    let currentProfile: any;
    let oldUpdatedAt = profileRow ? profileRow.updated_at : null;

    if (!profileRow) {
      let isReferred = false;
      let referrerAddress = '';
      if (referrer && typeof referrer === 'string' && referrer !== walletAddress) {
        const { data: refRows } = await supabase
          .from('profiles')
          .select('wallet_address')
          .eq('wallet_address', referrer)
          .limit(1);
        if (refRows && refRows.length > 0) {
          await supabase
            .from('referrals')
            .insert({
              referrer_wallet: referrer,
              referred_wallet: walletAddress
            });
          
          isReferred = true;
          referrerAddress = referrer;
        }
      }

      const starterDeck = generateStarterDeck();

      currentProfile = {
        gold: isReferred ? 700 : 500,
        dust: 100,
        darkShards: 0,
        collection: starterDeck.collection,
        deck: starterDeck.deck,
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
        isRegistered: false,
        referredBy: isReferred ? referrerAddress : null
      };
      // Prevent creating duplicates by checking again or using insert
      const { data: existingCheck } = await supabase.from('profiles').select('wallet_address').eq('wallet_address', walletAddress).limit(1);
      if (!existingCheck || existingCheck.length === 0) {
        const { error: insertError } = await supabase.from('profiles').insert({ wallet_address: walletAddress, data: currentProfile });
        if (insertError) {
          console.error('Failed to insert new profile:', insertError);
          return res.status(500).json({ error: 'Failed to create profile in database.', details: insertError });
        }
      }
    } else {
      currentProfile = migrateProfileCards(profileRow.data);
    }

    currentProfile = calculateEnergy(currentProfile);

    // ONLY merge fields that are safe for the user to change locally:
    // deck, equipped, soundOn, isRegistered, username, avatarUrl
    if (safeProfileData) {
      if (safeProfileData.deck) currentProfile.deck = safeProfileData.deck;
      if (safeProfileData.equipped) currentProfile.equipped = safeProfileData.equipped;
      if (safeProfileData.soundOn !== undefined) currentProfile.soundOn = safeProfileData.soundOn;
      if (safeProfileData.isRegistered !== undefined) currentProfile.isRegistered = safeProfileData.isRegistered;
      if (safeProfileData.username) {
        const reqUsername = safeProfileData.username.trim();
        const usernameRegex = /^[a-zA-Z0-9_]{4,12}$/;
        if (!usernameRegex.test(reqUsername)) {
          return res.status(400).json({ error: 'Username must be 4-12 characters long and contain only English letters, numbers, or underscores.' });
        }
        
        if (currentProfile.username !== reqUsername) {
          const { data: duplicateRows, error: dupError } = await supabase
            .from('profiles')
            .select('wallet_address')
            .eq('data->>username', reqUsername)
            .neq('wallet_address', walletAddress)
            .limit(1);
            
          if (dupError) {
            console.error('Database error checking duplicate username:', dupError);
            return res.status(500).json({ error: 'Database check failed' });
          }
          
          if (duplicateRows && duplicateRows.length > 0) {
            return res.status(400).json({ error: 'This username is already taken by another player.' });
          }
          currentProfile.username = reqUsername;
        }
      }
      if (safeProfileData.avatarUrl) currentProfile.avatarUrl = safeProfileData.avatarUrl;
      if (safeProfileData.talents) {
        let totalSpent = 0;
        const requestedTalents = safeProfileData.talents;
        let valid = true;
        
        // Embedded directly to prevent Vercel ESM module resolution issues on API routes
        const TALENT_TREES = [
          { id: 'void_base', maxLevel: 20, cost: 1 }, { id: 'void_dmg', maxLevel: 10, cost: 1 }, { id: 'void_chain', maxLevel: 10, cost: 1 },
          { id: 'void_pierce', maxLevel: 1, cost: 5 }, { id: 'void_execute', maxLevel: 3, cost: 5 }, { id: 'void_leech', maxLevel: 3, cost: 5 }, { id: 'void_ultimate', maxLevel: 1, cost: 10 },
          { id: 'blood_base', maxLevel: 20, cost: 1 }, { id: 'blood_heal', maxLevel: 10, cost: 1 }, { id: 'blood_cleanse', maxLevel: 10, cost: 1 },
          { id: 'blood_ward', maxLevel: 1, cost: 5 }, { id: 'blood_overflow', maxLevel: 3, cost: 5 }, { id: 'blood_shield', maxLevel: 3, cost: 5 }, { id: 'blood_ultimate', maxLevel: 1, cost: 10 },
          { id: 'war_base', maxLevel: 20, cost: 1 }, { id: 'war_atk', maxLevel: 10, cost: 1 }, { id: 'war_armor', maxLevel: 10, cost: 1 },
          { id: 'war_duration', maxLevel: 1, cost: 5 }, { id: 'war_momentum', maxLevel: 3, cost: 5 }, { id: 'war_heal', maxLevel: 3, cost: 5 }, { id: 'war_ultimate', maxLevel: 1, cost: 10 }
        ];

        for (const [nodeId, level] of Object.entries(requestedTalents)) {
           const node = TALENT_TREES.find((t: any) => t.id === nodeId);
           if (!node) {
             console.warn(`Anti-cheat: Invalid talent node ID '${nodeId}' for wallet ${walletAddress}`);
             valid = false;
             break;
           }

           const numLevel = Number(level) || 0;
           if (numLevel < 0 || numLevel > node.maxLevel) {
             valid = false;
             break;
           }
           totalSpent += (numLevel * node.cost);
        }
        
        const playerLevel = currentProfile.level || 1;
        // The total allowed points is playerLevel - 1
        const maxAllowedPoints = Math.max(0, playerLevel - 1);
        if (valid && totalSpent <= maxAllowedPoints) {
          currentProfile.talents = requestedTalents;
        } else {
          console.warn(`Cheating detected for wallet ${walletAddress}: Spent ${totalSpent} points at Level ${playerLevel}`);
        }
      }
      if (safeProfileData.activeStance) currentProfile.activeStance = safeProfileData.activeStance;
    }

    // Anti-referral exploit: check if player reached Level 10 and has a referrer, and reward hasn't been paid out yet
    if (currentProfile.referredBy && (currentProfile.level || 1) >= 10 && !currentProfile.referralRewardClaimed) {
      const { data: refRows } = await supabase
        .from('profiles')
        .select('data')
        .eq('wallet_address', currentProfile.referredBy)
        .limit(1);
        
      if (refRows && refRows.length > 0) {
        const refRow = refRows[0];
        const refProfile = refRow.data;
        
        // Reward referrer
        refProfile.referralsCount = (refProfile.referralsCount || 0) + 1;
        refProfile.gold = (refProfile.gold || 0) + 1000;
        refProfile.dust = (refProfile.dust || 0) + 100;
        
        await supabase
          .from('profiles')
          .update({ data: refProfile, updated_at: new Date().toISOString() })
          .eq('wallet_address', currentProfile.referredBy);
          
        // Mark reward as claimed on referred player so they don't get double rewards
        currentProfile.referralRewardClaimed = true;
      }
    }

    const newUpdatedAt = new Date().toISOString();
    let updateQuery = supabase
      .from('profiles')
      .update({ data: currentProfile, updated_at: newUpdatedAt })
      .eq('wallet_address', walletAddress);
    if (oldUpdatedAt) {
      updateQuery = updateQuery.eq('updated_at', oldUpdatedAt);
    }
    const { data: updateResult, error: updateError } = await updateQuery.select('wallet_address');
    if (updateError || !updateResult || updateResult.length === 0) {
      console.error('Sync API OCC conflict');
      return res.status(409).json({ error: 'Conflict: Please try again' });
    }

    if (updateError) {
      console.error('Sync API save error:', updateError);
      return res.status(500).json({ error: 'Failed to sync profile.' });
    }

    return res.status(200).json({ success: true, profile: currentProfile });
  } catch (error: any) {
    console.error('Sync API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}




