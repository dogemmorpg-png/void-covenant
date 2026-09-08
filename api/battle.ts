// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as jwtPkg from 'jsonwebtoken';
const jwt = (jwtPkg as any).default || jwtPkg;
import { createClient } from '@supabase/supabase-js';
import { PlayerProfile, CardTemplate } from './_shared/types.js';
import { generateCampaignStage, createCardInstance } from './_shared/cards.js';
import { calculateEnergy, processExpGain, getActiveSubscriptionTier } from './_shared/energyHelper.js';

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

  const walletAddress = decoded.walletAddress || decoded.wallet || decoded.sub;
  if (!walletAddress) {
    return res.status(400).json({ error: 'Token missing wallet address' });
  }

  const { battleType, stageId, result, stars, isStart, opponent } = req.body || {};
  if (!battleType || (!result && !isStart)) {
    return res.status(400).json({ error: 'Missing battle details.' });
  }

  try {
    const supabase = getSupabase();
    const now = Date.now();

    const { data: profileRows, error: fetchError } = await supabase
      .from('profiles')
      .select('data, updated_at')
      .eq('wallet_address', walletAddress)
      .limit(1);

    if (fetchError || !profileRows || profileRows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profileRow = profileRows[0];
    let profile: PlayerProfile = profileRow.data;
    let oldUpdatedAt = profileRow.updated_at;

    if (profile?.isBanned) {
      return res.status(403).json({ error: 'ACCOUNT_BANNED', message: profile.banReason || 'Account is exiled.' });
    }

    // Handle BATTLE START (deduct energy & lock battle session)
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
        // Fallback retry without strict OCC
        await supabase
          .from('profiles')
          .update({ data: profile, updated_at: new Date().toISOString() })
          .eq('wallet_address', walletAddress);
      }

      return res.status(200).json({ success: true, message: 'Battle session started', profile });
    }

    // Handle BATTLE RESULT (calculate rewards, exp, rating)
    profile.pvpLeague = profile.pvpLeague || 'Bronze';
    profile.pvpLP = profile.pvpLP !== undefined ? profile.pvpLP : 0;

    // Recalculate energy based on time passed
    profile = calculateEnergy(profile);

    let goldReward = 0;
    let dustReward = 0;
    let expReward = 0;
    let shardsReward = 0;
    let cardRewardStr = '';
    let sovereignsReward = 0;

    const subTier = getActiveSubscriptionTier(profile);
    let goldMultiplier = 1;
    if (subTier === 'ultra') {
      goldMultiplier += 0.50; // +50% Gold drop
    } else if (subTier === 'premium') {
      goldMultiplier += 0.25; // +25% Gold drop
    }

    let expMultiplier = 1;
    if (profile.equipped && profile.equipment) {
      Object.values(profile.equipped).forEach(eqId => {
        const eq = profile.equipment.find((e: any) => e.id === eqId);
        if (eq && eq.bonusType === 'goldBonus') goldMultiplier += (eq.bonusValue / 100);
        if (eq && eq.bonusType === 'expBonus') expMultiplier += (eq.bonusValue / 100);
      });
    }

    // Fair reward bonus calculation: guarantees at least +1 if player has an active multiplier > 1.0
    function applyMultiplierWithMinimum(baseValue: number, multiplier: number): number {
      if (multiplier <= 1 || baseValue <= 0) return Math.round(baseValue);
      const rawBonus = baseValue * (multiplier - 1);
      const bonus = Math.max(1, Math.round(rawBonus));
      return baseValue + bonus;
    }

    if (battleType === 'campaign') {
      const floorNum = parseInt(stageId);
      if (isNaN(floorNum)) return res.status(400).json({ error: 'Invalid stage ID' });

      const stage = generateCampaignStage(floorNum);
      if (!stage) return res.status(400).json({ error: 'Stage not found' });

      if (result === 'win') {
        const baseGold = stage.rewards.gold || (floorNum * 15 + 30);
        const baseDust = stage.rewards.dust || (floorNum * 5 + 10);
        const baseExp = stage.rewards.exp || (floorNum * 20 + 40);

        goldReward = applyMultiplierWithMinimum(baseGold, goldMultiplier);
        dustReward = baseDust;
        expReward = applyMultiplierWithMinimum(baseExp, expMultiplier);

        const currentCleared = profile.pveProgress || 1;
        if (floorNum >= currentCleared) {
          profile.pveProgress = floorNum + 1;
        }

        const stageStars = stars || 3;
        profile.campaignStars = profile.campaignStars || {};
        const oldStars = profile.campaignStars[stageId] || 0;
        if (stageStars > oldStars) {
          profile.campaignStars[stageId] = stageStars;
        }

        if (stage.rewards.cardDrop && Math.random() < stage.rewards.cardDrop.chance) {
          const newCardInstance = createCardInstance(stage.rewards.cardDrop.template, 1);
          profile.collection = profile.collection || [];
          profile.collection.push(newCardInstance);
          cardRewardStr = newCardInstance.name;
        }
      } else {
        goldReward = applyMultiplierWithMinimum(5, goldMultiplier);
        dustReward = 2;
        expReward = applyMultiplierWithMinimum(10, expMultiplier);
      }

    } else if (battleType === 'pvp') {
      const activeOpponent = profile.activePvpOpponent || opponent;
      if (!activeOpponent) {
        return res.status(400).json({ error: 'No active PvP opponent found' });
      }

      const rPlayer = profile.pvpRating || 1000;
      const rOpponent = activeOpponent.rating || 1000;
      const expected = 1 / (1 + Math.pow(10, (rOpponent - rPlayer) / 400));

      let attackerRatingChange = 0;
      let defenderRatingChange = 0;
      let attackerLPChange = 0;
      let defenderLPChange = 0;

      if (result === 'win') {
        const baseGold = 300 + Math.floor((profile.pvpLP || 0) / 4);
        const baseDust = 30 + Math.floor((profile.pvpLP || 0) / 20);
        goldReward = applyMultiplierWithMinimum(baseGold, goldMultiplier);
        dustReward = baseDust;
        expReward = 0; // EXP is strictly exclusive to PvE Campaign

        const gain = Math.round(32 * (1 - expected));
        attackerRatingChange = Math.max(10, Math.min(32, gain));
        defenderRatingChange = -Math.max(5, Math.min(25, Math.round(32 * (1 - expected))));

        attackerLPChange = 20;
        defenderLPChange = -15;

        // Sovereigns reward for subscribers
        const todayUtc = new Date().toISOString().slice(0, 10);
        if (profile.lastSovereignsWonDate !== todayUtc) {
          profile.dailySovereignsWonToday = 0;
          profile.lastSovereignsWonDate = todayUtc;
        }

        const currentWonToday = profile.dailySovereignsWonToday || 0;
        if (subTier === 'ultra') {
          const cap = 24;
          if (currentWonToday < cap) {
            sovereignsReward = Math.min(2, cap - currentWonToday);
            profile.dailySovereignsWonToday = currentWonToday + sovereignsReward;
            profile.bloodSovereigns = (profile.bloodSovereigns || 0) + sovereignsReward;
          }
        } else if (subTier === 'premium') {
          const cap = 10;
          if (currentWonToday < cap) {
            sovereignsReward = Math.min(1, cap - currentWonToday);
            profile.dailySovereignsWonToday = currentWonToday + sovereignsReward;
            profile.bloodSovereigns = (profile.bloodSovereigns || 0) + sovereignsReward;
          }
        }
      } else {
        goldReward = applyMultiplierWithMinimum(50, goldMultiplier);
        dustReward = 5;
        expReward = 0; // EXP is strictly exclusive to PvE Campaign

        const loss = Math.round(32 * expected);
        attackerRatingChange = -Math.max(5, Math.min(25, loss));

        const gain = Math.round(32 * expected);
        defenderRatingChange = Math.max(10, Math.min(32, gain));

        attackerLPChange = -15;
        defenderLPChange = 20;
      }

      const lpPlayer = profile.pvpLP !== undefined ? profile.pvpLP : 0;
      const lpOpponent = activeOpponent.lp !== undefined ? activeOpponent.lp : (activeOpponent.pvpLP !== undefined ? activeOpponent.pvpLP : 0);

      profile.pvpRating = Math.max(0, rPlayer + attackerRatingChange);
      profile.pvpLP = Math.max(0, lpPlayer + attackerLPChange);

      const recordId = 'pvp_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

      const attackerRecord = {
        id: recordId,
        timestamp: Date.now(),
        attackerName: profile.username || 'You',
        defenderName: activeOpponent.name,
        attackerWallet: walletAddress,
        defenderWallet: activeOpponent.walletAddress,
        winner: result === 'win' ? 'attacker' : 'defender',
        attackerRatingBefore: rPlayer,
        defenderRatingBefore: rOpponent,
        attackerRatingChange: attackerRatingChange,
        defenderRatingChange: defenderRatingChange,
        attackerLPBefore: lpPlayer,
        defenderLPBefore: lpOpponent,
        attackerLPChange: attackerLPChange,
        defenderLPChange: defenderLPChange,
        isDefense: false,
        sovereignsReward: sovereignsReward > 0 ? sovereignsReward : undefined
      };

      profile.pvpHistory = [attackerRecord, ...(profile.pvpHistory || [])].slice(0, 30);

      // Process Offline Defense if defender is a real player
      if (activeOpponent.walletAddress && activeOpponent.walletAddress !== 'bot' && !activeOpponent.walletAddress.startsWith('bot_')) {
        try {
          const { data: defRows } = await supabase
            .from('profiles')
            .select('data')
            .eq('wallet_address', activeOpponent.walletAddress)
            .limit(1);

          if (defRows && defRows.length > 0) {
            const defProfile = defRows[0].data;
            const rDefBefore = defProfile.pvpRating || 1000;
            const lpDefBefore = defProfile.pvpLP !== undefined ? defProfile.pvpLP : 0;

            const isDefShielded = defProfile.activeShieldUntil && defProfile.activeShieldUntil > Date.now();
            const actualDefRatingChange = isDefShielded ? 0 : defenderRatingChange;
            const actualDefLPChange = isDefShielded ? 0 : defenderLPChange;

            defProfile.pvpRating = Math.max(0, rDefBefore + actualDefRatingChange);
            defProfile.pvpLP = Math.max(0, lpDefBefore + actualDefLPChange);

            const defenderRecord = {
              id: recordId,
              timestamp: Date.now(),
              attackerName: profile.username || 'You',
              defenderName: defProfile.username || 'You',
              attackerWallet: walletAddress,
              defenderWallet: activeOpponent.walletAddress,
              winner: result === 'win' ? 'attacker' : 'defender',
              attackerRatingBefore: rPlayer,
              defenderRatingBefore: rDefBefore,
              attackerRatingChange: attackerRatingChange,
              defenderRatingChange: actualDefRatingChange,
              attackerLPBefore: lpPlayer,
              defenderLPBefore: lpDefBefore,
              attackerLPChange: attackerLPChange,
              defenderLPChange: actualDefLPChange,
              isDefense: true,
              wasShielded: !!isDefShielded
            };

            defProfile.pvpHistory = [defenderRecord, ...(defProfile.pvpHistory || [])].slice(0, 30);

            await supabase
              .from('profiles')
              .update({ data: defProfile, updated_at: new Date().toISOString() })
              .eq('wallet_address', activeOpponent.walletAddress);
          }
        } catch (defErr) {
          console.error('Offline defense update failed for:', activeOpponent.walletAddress, defErr);
        }
      }

      delete profile.activePvpOpponent;
    }

    profile.gold = (profile.gold || 0) + goldReward;
    profile.dust = (profile.dust || 0) + dustReward;
    profile.darkShards = (profile.darkShards || 0) + shardsReward;

    let levelUpInfo = { leveledUp: false, newLevel: profile.level };
    if (expReward > 0) {
      const res = processExpGain(profile, expReward);
      levelUpInfo = { leveledUp: res.leveledUp, newLevel: profile.level };
    }

    let updateQuery = supabase
      .from('profiles')
      .update({ data: profile, updated_at: new Date().toISOString() })
      .eq('wallet_address', walletAddress);

    if (oldUpdatedAt) {
      updateQuery = updateQuery.eq('updated_at', oldUpdatedAt);
    }

    const { data: updateResult, error: updateError } = await updateQuery.select('wallet_address');
    if (updateError || !updateResult || updateResult.length === 0) {
      await supabase
        .from('profiles')
        .update({ data: profile, updated_at: new Date().toISOString() })
        .eq('wallet_address', walletAddress);
    }

    return res.status(200).json({
      success: true,
      profile,
      goldReward,
      dustReward,
      expReward,
      shardsReward,
      sovereignsReward: sovereignsReward || 0,
      cardReward: cardRewardStr || undefined,
      leveledUp: levelUpInfo.leveledUp,
      newLevel: levelUpInfo.newLevel
    });

  } catch (error: any) {
    console.error('Battle API error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}