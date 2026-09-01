// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as jwtPkg from 'jsonwebtoken';
const jwt = (jwtPkg as any).default || jwtPkg;
import { createClient } from '@supabase/supabase-js';
import { PlayerProfile } from './_shared/types.js';
import { CARD_TEMPLATES, createCardInstance, generateCampaignStage, AIRDROP_TASKS } from './_shared/cards.js';
import { calculateEnergy, processExpGain } from './_shared/energyHelper.js';
import { checkAndPerformPvpRollover, DEFAULT_LEAGUE_REWARDS } from './_shared/pvpRollover.js';
import { recordShardTransaction } from './_shared/shardLogger.js';

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

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let action = req.body?.action;
  let payload = req.body?.payload;

  if (req.method === 'GET') {
    action = req.query.action || 'pvp_rollover';
    payload = req.query.payload;
  }

  if (!action) {
    return res.status(400).json({ error: 'Missing action.' });
  }

  if (action === 'pvp_rollover') {
    try {
      const supabase = getSupabase();
      const force = req.query.force === 'true' || req.body?.force === true;
      const result = await checkAndPerformPvpRollover(supabase, force);

      return res.status(200).json({
        success: true,
        message: result.rolledOver ? 'PvP daily rollover complete' : `PvP rollover skipped: ${result.reason}`,
        ...result
      });

    } catch (error: any) {
      console.error('PvP Rollover API error:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  if (action === 'referrals') {
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
    try {
      const supabase = getSupabase();
      const { data: refRows, error: refError } = await supabase
        .from('referrals')
        .select('referred_wallet, created_at')
        .eq('referrer_wallet', walletAddress);

      if (refError || !refRows || refRows.length === 0) {
        return res.status(200).json({ referrals: [] });
      }

      const referredWallets = refRows.map((r: any) => r.referred_wallet);
      const { data: profileRows } = await supabase
        .from('profiles')
        .select('wallet_address, data')
        .in('wallet_address', referredWallets);

      const referrals = refRows.map((r: any) => {
        const matchingProfile = profileRows?.find((p: any) => p.wallet_address === r.referred_wallet);
        const profileData = matchingProfile?.data || {};
        return {
          wallet: r.referred_wallet,
          username: profileData.username || 'Anonymous',
          level: profileData.level || 1,
          avatarUrl: profileData.avatarUrl || '/avatars/knight.webp',
          joinedAt: r.created_at
        };
      });

      return res.status(200).json({ referrals });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
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

    let profile: PlayerProfile;
    let oldUpdatedAt = profileRow ? profileRow.updated_at : null;

    if (!profileRow) {
      profile = {
        gold: 1000,
        dust: 250,
        darkShards: 50,
        collection: [
          { id: 'c_starter_1', templateId: 's1_skeletal_warrior', name: 'Skeleton Warrior', tier: 'Common', attack: 4, health: 5, manaCost: 2, image: '/cards/skeleton_warrior.webp', count: 1, level: 1 },
          { id: 'c_starter_2', templateId: 's1_grave_ghoul', name: 'Grave Ghoul', tier: 'Common', attack: 3, health: 6, manaCost: 2, image: '/cards/grave_ghoul.webp', count: 1, level: 1 },
          { id: 'c_starter_3', templateId: 's1_bone_archer', name: 'Bone Archer', tier: 'Common', attack: 5, health: 3, manaCost: 2, image: '/cards/bone_archer.webp', count: 1, level: 1 },
          { id: 'c_starter_4', templateId: 's1_plague_rat', name: 'Plague Rat', tier: 'Common', attack: 2, health: 4, manaCost: 1, image: '/cards/plague_rat.webp', count: 1, level: 1 },
          { id: 'c_starter_5', templateId: 's1_dark_acolyte', name: 'Dark Acolyte', tier: 'Common', attack: 4, health: 4, manaCost: 2, image: '/cards/dark_acolyte.webp', count: 1, level: 1 }
        ],
        deck: ['c_starter_1', 'c_starter_2', 'c_starter_3', 'c_starter_4', 'c_starter_5'],
        pveEnergy: 10,
        pveEnergyMax: 10,
        pvpEnergy: 5,
        pvpEnergyMax: 5,
        pvpTickets: 5,
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
      const { data: existingCheck } = await supabase.from('profiles').select('wallet_address').eq('wallet_address', walletAddress).limit(1);
      if (!existingCheck || existingCheck.length === 0) {
        await supabase.from('profiles').insert({ wallet_address: walletAddress, data: profile });
      }
    } else {
      profile = profileRow.data;
    }
    profile = calculateEnergy(profile);

    let successMessage = '';
    let responseData: any = {};

    if (profile?.isBanned && !action.startsWith('admin_')) {
      return res.status(403).json({
        error: 'ACCOUNT_BANNED',
        message: profile.banReason || 'Your account has been exiled from the Void by administration.',
        isBanned: true
      });
    }

    // --- ADMIN ACTION DISPATCHER ---
    if (action.startsWith('admin_')) {
      const isAdmin = 
        profile?.username?.toLowerCase() === 'adminus' || 
        profile?.role === 'admin' || 
        decoded?.role === 'admin' ||
        walletAddress === 'adminus' ||
        walletAddress === 'BxxQjEStvpcbWLbSnwL19rjbGmvND1J5pEBRShWFoYNr' ||
        profile?.solanaAddress === 'BxxQjEStvpcbWLbSnwL19rjbGmvND1J5pEBRShWFoYNr';

      if (!isAdmin) {
        return res.status(403).json({ error: 'Forbidden: Admin privileges required.' });
      }

      if (action === 'admin_get_overview') {
        const { data: allProfiles, error: fetchErr } = await supabase
          .from('profiles')
          .select('wallet_address, data, updated_at');

        if (fetchErr) {
          return res.status(500).json({ error: 'Failed to fetch profiles overview', details: fetchErr });
        }

        const now = Date.now();
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

        let totalGold = 0;
        let totalDust = 0;
        let totalShards = 0;
        let totalSovereigns = 0;
        let active24h = 0;
        let active7d = 0;
        let pendingWithdrawalsCount = 0;
        let pendingWithdrawalsUsdt = 0;
        let completedWithdrawalsCount = 0;
        let completedWithdrawalsUsdt = 0;

        const leagueDistribution: Record<string, number> = {
          'Bronze': 0,
          'Silver': 0,
          'Gold': 0,
          'Platinum': 0,
          'Emerald': 0,
          'Ruby': 0,
          'Diamond': 0,
          'Master': 0,
          'Grandmaster': 0,
          'Void Overlord': 0
        };

        allProfiles?.forEach((p: any) => {
          const d = p.data || {};
          totalGold += d.gold || 0;
          totalDust += d.dust || 0;
          totalShards += d.darkShards || 0;
          totalSovereigns += d.bloodSovereigns || 0;

          const lastActive = d.lastLogin || (p.updated_at ? new Date(p.updated_at).getTime() : 0);
          if (lastActive >= oneDayAgo) active24h++;
          if (lastActive >= sevenDaysAgo) active7d++;

          const rawLeague = d.pvpLeague || d.league || 'Bronze';
          let normLeague = 'Bronze';
          if (/overlord|void/i.test(rawLeague)) normLeague = 'Void Overlord';
          else if (/grandmaster|gm/i.test(rawLeague)) normLeague = 'Grandmaster';
          else if (/master/i.test(rawLeague)) normLeague = 'Master';
          else if (/diamond/i.test(rawLeague)) normLeague = 'Diamond';
          else if (/ruby/i.test(rawLeague)) normLeague = 'Ruby';
          else if (/emerald/i.test(rawLeague)) normLeague = 'Emerald';
          else if (/platinum/i.test(rawLeague)) normLeague = 'Platinum';
          else if (/gold/i.test(rawLeague)) normLeague = 'Gold';
          else if (/silver/i.test(rawLeague)) normLeague = 'Silver';
          else normLeague = 'Bronze';

          if (leagueDistribution[normLeague] !== undefined) {
            leagueDistribution[normLeague]++;
          } else {
            leagueDistribution[normLeague] = 1;
          }

          const reqs = d.withdrawalRequests || [];
          reqs.forEach((r: any) => {
            if (r.status === 'pending') {
              pendingWithdrawalsCount++;
              pendingWithdrawalsUsdt += (r.amountUsdt || (r.amountSovereigns * 0.01) || 0);
            } else if (r.status === 'completed') {
              completedWithdrawalsCount++;
              completedWithdrawalsUsdt += (r.amountUsdt || (r.amountSovereigns * 0.01) || 0);
            }
          });
        });

        return res.status(200).json({
          success: true,
          overview: {
            totalPlayers: allProfiles?.length || 0,
            active24h,
            active7d,
            totalGold,
            totalDust,
            totalShards,
            totalSovereigns,
            usdtObligations: Number((totalSovereigns * 0.01).toFixed(2)),
            pendingWithdrawalsCount,
            pendingWithdrawalsUsdt: Number(pendingWithdrawalsUsdt.toFixed(2)),
            completedWithdrawalsCount,
            completedWithdrawalsUsdt: Number(completedWithdrawalsUsdt.toFixed(2)),
            leagueDistribution
          }
        });
      }

      if (action === 'admin_get_withdrawals') {
        const { data: allProfiles, error: fetchErr } = await supabase
          .from('profiles')
          .select('wallet_address, data');

        if (fetchErr) {
          return res.status(500).json({ error: 'Failed to fetch withdrawals', details: fetchErr });
        }

        const requests: any[] = [];
        allProfiles?.forEach((p: any) => {
          const reqs = p.data?.withdrawalRequests || [];
          reqs.forEach((r: any) => {
            requests.push({
              ...r,
              userWallet: p.wallet_address,
              userProfileName: p.data?.username || 'Voidwalker'
            });
          });
        });

        requests.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        return res.status(200).json({
          success: true,
          requests
        });
      }

      if (action === 'admin_process_withdrawal') {
        const { requestId, userWallet, decision, txid, reason } = payload || {};
        if (!requestId || !userWallet || !decision) {
          return res.status(400).json({ error: 'Missing required parameters: requestId, userWallet, decision' });
        }

        const { data: targetRows, error: findErr } = await supabase
          .from('profiles')
          .select('data, updated_at')
          .eq('wallet_address', userWallet)
          .limit(1);

        if (findErr || !targetRows || targetRows.length === 0) {
          return res.status(404).json({ error: 'Target player not found' });
        }

        const targetData = targetRows[0].data;
        const targetReqs = targetData.withdrawalRequests || [];
        const reqIndex = targetReqs.findIndex((r: any) => r.id === requestId);

        if (reqIndex === -1) {
          return res.status(404).json({ error: 'Withdrawal request not found on player profile' });
        }

        const currentReq = targetReqs[reqIndex];
        if (currentReq.status !== 'pending') {
          return res.status(400).json({ error: `Request is already ${currentReq.status}` });
        }

        if (decision === 'approve') {
          targetReqs[reqIndex] = {
            ...currentReq,
            status: 'completed',
            processedAt: Date.now(),
            txid: txid || 'Confirmed Manual Payout'
          };

          const notificationMail = {
            id: `mail_payout_${Date.now()}`,
            title: 'USDT Withdrawal Confirmed',
            sender: 'Void Royal Treasury',
            body: `Your withdrawal of ${currentReq.amountSovereigns} Blood Sovereigns ($${currentReq.amountUsdt} USDT) has been processed and sent to your wallet ${currentReq.walletAddress}.\n\nTransaction ID (TXID):\n${txid || 'Confirmed Manual Transfer'}`,
            content: `Your withdrawal of ${currentReq.amountSovereigns} Blood Sovereigns ($${currentReq.amountUsdt} USDT) has been processed and sent to your wallet ${currentReq.walletAddress}.\n\nTransaction ID (TXID):\n${txid || 'Confirmed Manual Transfer'}`,
            createdAt: Date.now(),
            date: Date.now(),
            isRead: false,
            type: 'system',
            txid: txid || ''
          };

          targetData.mailMessages = [notificationMail, ...(targetData.mailMessages || [])];
        } else if (decision === 'reject') {
          targetReqs[reqIndex] = {
            ...currentReq,
            status: 'rejected',
            processedAt: Date.now(),
            rejectionReason: reason || 'Declined by administration'
          };

          // Refund Blood Sovereigns
          targetData.bloodSovereigns = (targetData.bloodSovereigns || 0) + (currentReq.amountSovereigns || 0);

          const refundMail = {
            id: `mail_reject_${Date.now()}`,
            title: 'Withdrawal Request Declined & Refunded',
            sender: 'Void Royal Treasury',
            body: `Your withdrawal request of ${currentReq.amountSovereigns} Blood Sovereigns ($${currentReq.amountUsdt} USDT) was declined.\n\nReason: ${reason || 'Security review or invalid address'}.\n\nYour ${currentReq.amountSovereigns} Blood Sovereigns have been refunded to your vault balance.`,
            content: `Your withdrawal request of ${currentReq.amountSovereigns} Blood Sovereigns ($${currentReq.amountUsdt} USDT) was declined.\n\nReason: ${reason || 'Security review or invalid address'}.\n\nYour ${currentReq.amountSovereigns} Blood Sovereigns have been refunded to your vault balance.`,
            createdAt: Date.now(),
            date: Date.now(),
            isRead: false,
            type: 'system'
          };

          targetData.mailMessages = [refundMail, ...(targetData.mailMessages || [])];
        } else {
          return res.status(400).json({ error: 'Invalid decision: must be approve or reject' });
        }

        targetData.withdrawalRequests = targetReqs;

        const { error: saveErr } = await supabase
          .from('profiles')
          .update({ data: targetData, updated_at: new Date().toISOString() })
          .eq('wallet_address', userWallet);

        if (saveErr) {
          return res.status(500).json({ error: 'Failed to update target player withdrawal status', details: saveErr });
        }

        return res.status(200).json({
          success: true,
          message: `Withdrawal request #${requestId} successfully ${decision}d!`
        });
      }

      if (action === 'admin_broadcast_mail') {
        const { targetType, targetValue, title, content, body, rewards } = payload || {};
        const mailContent = content || body || '';
        if (!title || !mailContent) {
          return res.status(400).json({ error: 'Title and content are required' });
        }

        const newMailTemplate = {
          id: `decree_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          title,
          sender: 'High Void Command',
          body: mailContent,
          content: mailContent,
          createdAt: Date.now(),
          date: Date.now(),
          isRead: false,
          isClaimed: false,
          type: rewards && Object.values(rewards).some((v: any) => v > 0) ? 'reward' : 'announcement',
          rewards: rewards || null
        };

        const { data: allProfiles, error: fetchErr } = await supabase
          .from('profiles')
          .select('wallet_address, data');

        if (fetchErr || !allProfiles) {
          return res.status(500).json({ error: 'Failed to fetch profiles for broadcast' });
        }

        let sentCount = 0;
        for (const p of allProfiles) {
          const d = p.data || {};
          let shouldSend = false;

          if (targetType === 'all') {
            shouldSend = true;
          } else if (targetType === 'player') {
            shouldSend = 
              p.wallet_address?.toLowerCase() === targetValue?.toLowerCase() ||
              d.username?.toLowerCase() === targetValue?.toLowerCase();
          } else if (targetType === 'league') {
            const rawL = (d.pvpLeague || d.league || 'Bronze').trim().toLowerCase();
            const targetL = (targetValue || '').trim().toLowerCase();
            shouldSend = rawL === targetL;
          }

          if (shouldSend) {
            const userMail = { ...newMailTemplate, id: `mail_${p.wallet_address.slice(0, 6)}_${Date.now()}` };
            d.mailMessages = [userMail, ...(d.mailMessages || [])];
            await supabase
              .from('profiles')
              .update({ data: d, updated_at: new Date().toISOString() })
              .eq('wallet_address', p.wallet_address);
            sentCount++;
          }
        }

        return res.status(200).json({
          success: true,
          sentCount,
          message: `Decree delivered to ${sentCount} player(s)!`
        });
      }

      if (action === 'admin_search_player' || action === 'admin_get_players') {
        const query = (payload?.query || '').trim().toLowerCase();

        const { data: allProfiles, error: fetchErr } = await supabase
          .from('profiles')
          .select('wallet_address, data, updated_at');

        if (fetchErr) {
          return res.status(500).json({ error: 'Failed to fetch players', details: fetchErr });
        }

        let filtered = (allProfiles || []);
        if (query) {
          filtered = filtered.filter(p => {
            const w = p.wallet_address?.toLowerCase() || '';
            const u = p.data?.username?.toLowerCase() || '';
            return w.includes(query) || u.includes(query);
          });
        }

        const matches = filtered
          .map(p => ({
            walletAddress: p.wallet_address,
            updatedAt: p.updated_at,
            profile: p.data
          }));

        return res.status(200).json({ success: true, matches, players: matches });
      }

      if (action === 'admin_modify_player') {
        const { targetWallet, updates } = payload || {};
        if (!targetWallet || !updates) {
          return res.status(400).json({ error: 'Missing targetWallet or updates' });
        }

        const { data: targetRows, error: findErr } = await supabase
          .from('profiles')
          .select('data')
          .eq('wallet_address', targetWallet)
          .limit(1);

        if (findErr || !targetRows || targetRows.length === 0) {
          return res.status(404).json({ error: 'Target player not found' });
        }

        const targetData = targetRows[0].data;

        if (updates.gold !== undefined) targetData.gold = Number(updates.gold);
        if (updates.dust !== undefined) targetData.dust = Number(updates.dust);
        if (updates.darkShards !== undefined) targetData.darkShards = Number(updates.darkShards);
        if (updates.bloodSovereigns !== undefined) targetData.bloodSovereigns = Number(updates.bloodSovereigns);
        if (updates.pveEnergy !== undefined) targetData.pveEnergy = Number(updates.pveEnergy);
        if (updates.pvpTickets !== undefined) targetData.pvpTickets = Number(updates.pvpTickets);
        if (updates.pvpLeague !== undefined) targetData.pvpLeague = updates.pvpLeague;
        if (updates.pvpLP !== undefined) targetData.pvpLP = Number(updates.pvpLP);
        if (updates.role !== undefined) targetData.role = updates.role;
        if (updates.isBanned !== undefined) {
          targetData.isBanned = Boolean(updates.isBanned);
          if (targetData.isBanned) {
            targetData.banReason = updates.banReason ? String(updates.banReason) : 'Violation of Void Covenant terms & rules';
            targetData.bannedAt = Date.now();
            targetData.bannedBy = profile?.username || 'Admin';
          } else {
            targetData.banReason = null;
            targetData.bannedAt = null;
            targetData.bannedBy = null;
          }
        }

        const { error: saveErr } = await supabase
          .from('profiles')
          .update({ data: targetData, updated_at: new Date().toISOString() })
          .eq('wallet_address', targetWallet);

        if (saveErr) {
          return res.status(500).json({ error: 'Failed to update player', details: saveErr });
        }

        return res.status(200).json({
          success: true,
          message: `Player ${targetWallet} updated successfully!`,
          profile: targetData
        });
      }

      if (action === 'admin_delete_player') {
        const { targetWallet } = payload || {};
        if (!targetWallet) {
          return res.status(400).json({ error: 'Missing targetWallet' });
        }

        const { error: delErr } = await supabase
          .from('profiles')
          .delete()
          .eq('wallet_address', targetWallet);

        if (delErr) {
          return res.status(500).json({ error: 'Failed to delete player profile', details: delErr });
        }

        return res.status(200).json({ success: true, message: `Player ${targetWallet} deleted successfully.` });
      }

      if (action === 'admin_trigger_rollover') {
        const rolloverResult = await checkAndPerformPvpRollover(supabase, true);
        return res.status(200).json({
          success: true,
          message: 'PvP Season Rollover executed manually by Admin',
          ...rolloverResult
        });
      }

      if (action === 'admin_get_league_rewards') {
        const { data: configRows } = await supabase
          .from('profiles')
          .select('data')
          .eq('wallet_address', '__SYSTEM_CONFIG_LEAGUE_REWARDS__')
          .limit(1);

        const customConfig = configRows && configRows.length > 0 && configRows[0].data?.config 
          ? configRows[0].data.config 
          : null;

        return res.status(200).json({
          success: true,
          isCustom: !!customConfig,
          config: customConfig || DEFAULT_LEAGUE_REWARDS,
          defaultConfig: DEFAULT_LEAGUE_REWARDS
        });
      }

      if (action === 'admin_save_league_rewards') {
        const { config } = payload || {};
        if (!config || !Array.isArray(config)) {
          return res.status(400).json({ error: 'Invalid rewards configuration format: expected an array of leagues.' });
        }

        const dataToSave = {
          config,
          updatedAt: Date.now(),
          updatedBy: walletAddress
        };

        const { data: existingRow } = await supabase
          .from('profiles')
          .select('wallet_address')
          .eq('wallet_address', '__SYSTEM_CONFIG_LEAGUE_REWARDS__')
          .limit(1);

        if (existingRow && existingRow.length > 0) {
          const { error: updateErr } = await supabase
            .from('profiles')
            .update({ data: dataToSave, updated_at: new Date().toISOString() })
            .eq('wallet_address', '__SYSTEM_CONFIG_LEAGUE_REWARDS__');

          if (updateErr) {
            return res.status(500).json({ error: 'Failed to update league rewards', details: updateErr });
          }
        } else {
          const { error: insertErr } = await supabase
            .from('profiles')
            .insert({ wallet_address: '__SYSTEM_CONFIG_LEAGUE_REWARDS__', data: dataToSave });

          if (insertErr) {
            return res.status(500).json({ error: 'Failed to insert league rewards config', details: insertErr });
          }
        }

        return res.status(200).json({
          success: true,
          message: 'League rewards configuration saved successfully!',
          config
        });
      }

      if (action === 'admin_reset_league_rewards') {
        await supabase
          .from('profiles')
          .delete()
          .eq('wallet_address', '__SYSTEM_CONFIG_LEAGUE_REWARDS__');

        return res.status(200).json({
          success: true,
          message: 'League rewards reset to default values.',
          config: DEFAULT_LEAGUE_REWARDS
        });
      }

      return res.status(400).json({ error: 'Unknown admin action' });
    }
    // --- END ADMIN ACTION DISPATCHER ---

    if (action === 'get_league_rewards') {
      const { data: configRows } = await supabase
        .from('profiles')
        .select('data')
        .eq('wallet_address', '__SYSTEM_CONFIG_LEAGUE_REWARDS__')
        .limit(1);

      const customConfig = configRows && configRows.length > 0 && configRows[0].data?.config 
        ? configRows[0].data.config 
        : null;

      return res.status(200).json({
        success: true,
        isCustom: !!customConfig,
        config: customConfig || DEFAULT_LEAGUE_REWARDS
      });
    }

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

      const { leveledUp } = processExpGain(profile, expReward);

      successMessage = leveledUp 
        ? `🔥 LEVEL UP! Reached Level ${profile.level}! (+2 Max HP) +${goldReward} Gold, +${dustReward} Dust, +${expReward} EXP`
        : `Sweep Success! +${goldReward} Gold, +${dustReward} Dust, +${expReward} EXP`;
      responseData = { goldReward, dustReward, shardsReward, expReward, leveledUp, level: profile.level };

    } else if (action === 'buy_shards') {
      const { solAmount } = payload;
      if (solAmount <= 0 || isNaN(solAmount)) return res.status(400).json({ error: 'Invalid amount' });
      if (!profile.solBalance || profile.solBalance < solAmount) {
        return res.status(400).json({ error: 'Not enough SOL balance' });
      }
      const shardsBought = Math.round(solAmount * 50);
      profile.solBalance = Number((profile.solBalance - solAmount).toFixed(4));
      profile = recordShardTransaction(
        profile,
        'SHOP_PURCHASE',
        shardsBought,
        `Purchased ${shardsBought} Dark Shards with ${solAmount} SOL`,
        { solAmount, shardsBought }
      );
      successMessage = `Bought ${shardsBought} Dark Shards`;
      
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
      successMessage = 'Airdrop task completed (+200 Gold)';
    } else if (action === 'buy_pvp_tickets') {
      const ticketCount = payload?.ticketCount || 5;
      let ticketCost = 50;
      if (ticketCount === 1) ticketCost = 12;
      else if (ticketCount === 10) ticketCost = 90;
      else if (ticketCount !== 5) {
        return res.status(400).json({ error: 'Invalid ticket count package' });
      }

      const currentShards = profile.darkShards || 0;
      if (currentShards < ticketCost) {
        return res.status(400).json({ error: 'Not enough Dark Shards' });
      }
      profile = recordShardTransaction(
        profile,
        'BUY_ARENA_TICKETS',
        -ticketCost,
        `Purchased ${ticketCount} Arena Tickets for ${ticketCost} Shards`,
        { ticketCount, ticketCost }
      );
      profile.pvpBonusTickets = (profile.pvpBonusTickets || 0) + ticketCount;
      if (profile.pvpEnergy === undefined) profile.pvpEnergy = 5;
      profile.pvpTickets = (profile.pvpEnergy || 0) + profile.pvpBonusTickets;
      successMessage = `Bought ${ticketCount} Arena Tickets for ${ticketCost} Shards (added to Reserve)!`;
    } else if (action === 'buy_pve_energy') {
      const energyCount = payload?.energyCount || 10;
      let shardCost = 25;
      if (energyCount === 3) shardCost = 10;
      else if (energyCount === 25) shardCost = 50;
      else if (energyCount !== 10) {
        return res.status(400).json({ error: 'Invalid energy package' });
      }

      const currentShards = profile.darkShards || 0;
      if (currentShards < shardCost) {
        return res.status(400).json({ error: 'Not enough Dark Shards' });
      }

      profile = recordShardTransaction(
        profile,
        'BUY_PVE_ENERGY',
        -shardCost,
        `Restored +${energyCount} PvE Energy for ${shardCost} Shards`,
        { energyCount, shardCost }
      );
      profile.pveEnergy = (profile.pveEnergy || 0) + energyCount;
      if (profile.pveEnergyMax === undefined) profile.pveEnergyMax = 10;
      successMessage = `Restored +${energyCount} PvE Energy for ${shardCost} Shards!`;
      responseData = { energyCount, shardCost, newEnergy: profile.pveEnergy };
    } else if (action === 'withdrawal') {
      const { amountSovereigns, targetAddress } = payload || {};
      const numAmount = parseInt(amountSovereigns, 10);

      if (isNaN(numAmount) || numAmount < 100) {
        return res.status(400).json({ error: 'Minimum withdrawal is 100 Blood Sovereigns ($1.00 USDT).' });
      }

      if (!targetAddress || typeof targetAddress !== 'string' || targetAddress.trim().length < 24) {
        return res.status(400).json({ error: 'Invalid destination wallet address.' });
      }

      const currentSovereigns = profile.bloodSovereigns || 0;
      if (currentSovereigns < numAmount) {
        return res.status(400).json({ error: `Insufficient balance! You have ${currentSovereigns} SOV, requested ${numAmount} SOV.` });
      }

      const newRequest = {
        id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        userId: walletAddress,
        username: profile.username || 'Voidwalker',
        walletAddress: targetAddress.trim(),
        amountSovereigns: numAmount,
        amountUsdt: Number((numAmount * 0.01).toFixed(2)),
        status: 'pending',
        createdAt: Date.now()
      };

      profile.bloodSovereigns = currentSovereigns - numAmount;
      profile.withdrawalRequests = [newRequest, ...(profile.withdrawalRequests || [])];
      successMessage = `Successfully requested withdrawal of ${numAmount} SOV ($${(numAmount * 0.01).toFixed(2)} USDT)!`;
      responseData = { request: newRequest };
    } else if (action === 'read_mail') {
      const { mailId } = payload || {};
      if (!mailId) return res.status(400).json({ error: 'Missing mailId' });
      profile.mailMessages = (profile.mailMessages || []).map((m: any) => {
        if (m.id === mailId) {
          return { ...m, isRead: true };
        }
        return m;
      });
      successMessage = 'Mail marked as read';
    } else if (action === 'claim_mail') {
      const { mailId } = payload || {};
      if (!mailId) return res.status(400).json({ error: 'Missing mailId' });
      const mail = (profile.mailMessages || []).find((m: any) => m.id === mailId);
      if (!mail) return res.status(404).json({ error: 'Mail not found' });
      if (mail.isClaimed) return res.status(400).json({ error: 'Reward already claimed' });

      if (mail.rewards) {
        if (mail.rewards.gold) profile.gold = (profile.gold || 0) + mail.rewards.gold;
        if (mail.rewards.dust) profile.dust = (profile.dust || 0) + mail.rewards.dust;
        if (mail.rewards.darkShards) {
          profile = recordShardTransaction(
            profile,
            'MAIL_CLAIM',
            mail.rewards.darkShards,
            `Claimed tribute from mail: ${mail.title}`,
            { mailId: mail.id }
          );
        }
        if (mail.rewards.bloodSovereigns) profile.bloodSovereigns = (profile.bloodSovereigns || 0) + mail.rewards.bloodSovereigns;
      }

      profile.mailMessages = profile.mailMessages.map((m: any) => {
        if (m.id === mailId) {
          return { ...m, isClaimed: true, isRead: true };
        }
        return m;
      });
      successMessage = 'Tributes and rewards claimed successfully!';
    } else if (action === 'claim_all_mail') {
      let claimedCount = 0;
      let totalGold = 0;
      let totalDust = 0;
      let totalShards = 0;
      let totalSovereigns = 0;

      profile.mailMessages = (profile.mailMessages || []).map((m: any) => {
        if (m.rewards && !m.isClaimed) {
          claimedCount++;
          if (m.rewards.gold) totalGold += m.rewards.gold;
          if (m.rewards.dust) totalDust += m.rewards.dust;
          if (m.rewards.darkShards) totalShards += m.rewards.darkShards;
          if (m.rewards.bloodSovereigns) totalSovereigns += m.rewards.bloodSovereigns;
          return { ...m, isClaimed: true, isRead: true };
        }
        return m;
      });

      if (claimedCount === 0) {
        return res.status(400).json({ error: 'No unclaimed rewards found' });
      }

      profile.gold = (profile.gold || 0) + totalGold;
      profile.dust = (profile.dust || 0) + totalDust;
      if (totalShards > 0) {
        profile = recordShardTransaction(
          profile,
          'MAIL_CLAIM',
          totalShards,
          `Claimed all rewards from ${claimedCount} letters`,
          { claimedLettersCount: claimedCount }
        );
      }
      profile.bloodSovereigns = (profile.bloodSovereigns || 0) + totalSovereigns;

      successMessage = `Claimed all rewards from ${claimedCount} letter(s)!`;
      responseData = { claimedCount, totalGold, totalDust, totalShards, totalSovereigns };
    } else {
      return res.status(400).json({ error: 'Unknown action' });
    }

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
      return res.status(409).json({ error: 'Conflict: Please try again' });
    }

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





