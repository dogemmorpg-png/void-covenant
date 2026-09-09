// @ts-nocheck
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as jwtPkg from 'jsonwebtoken';
const jwt = (jwtPkg as any).default || jwtPkg;
import { createClient } from '@supabase/supabase-js';
import { PlayerProfile } from './_shared/types.js';
import { CARD_TEMPLATES, createCardInstance, generateCampaignStage, AIRDROP_TASKS } from './_shared/cards.js';
import { EQUIPMENT_TEMPLATES, generateEquipmentInstance } from './_shared/equipment.js';
import { calculateEnergy, processExpGain, getActiveSubscriptionTier, getTierLimits } from './_shared/energyHelper.js';
import { checkAndPerformPvpRollover, DEFAULT_LEAGUE_REWARDS } from './_shared/pvpRollover.js';
import { recordShardTransaction } from './_shared/shardLogger.js';
import { recordSovereignTransaction } from './_shared/sovereignLogger.js';

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

      // Get user's own profile for unclaimed and total earned referral sovereigns
      const { data: myProfileRows } = await supabase
        .from('profiles')
        .select('data')
        .eq('wallet_address', walletAddress)
        .limit(1);
      const myData = myProfileRows?.[0]?.data || {};
      const unclaimedSovereigns = myData.referralSovereignsUnclaimed || 0;
      const totalEarnedSovereigns = myData.referralSovereignsTotalEarned || 0;

      // 1. Fetch from referrals table
      let refRows: Array<{ referred_wallet: string; created_at?: string }> = [];
      try {
        const { data } = await supabase
          .from('referrals')
          .select('referred_wallet, created_at')
          .eq('referrer_wallet', walletAddress);
        if (data) refRows = data;
      } catch (err) {
        console.error('Failed to fetch from referrals table:', err);
      }

      // 2. Also fetch profiles where data->>referredBy equals walletAddress (for 100% data consistency)
      let referredProfiles: any[] = [];
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('wallet_address, data, updated_at')
          .filter('data->>referredBy', 'eq', walletAddress);
        if (error) {
          console.error('Error in referredProfiles query:', error);
        } else if (data) {
          referredProfiles = data;
        }
      } catch (err) {
        console.error('Failed to fetch referred profiles:', err);
      }

      // 3. Merge both sources by wallet
      const referredMap = new Map<string, { wallet: string; created_at?: string; profileData: any }>();

      for (const p of referredProfiles) {
        referredMap.set(p.wallet_address, {
          wallet: p.wallet_address,
          created_at: (p.data as any)?.joinedAt || (p.data as any)?.createdAt || p.updated_at,
          profileData: p.data || {}
        });
      }

      if (refRows.length > 0) {
        const missingWallets = refRows
          .map(r => r.referred_wallet)
          .filter(w => !referredMap.has(w));

        if (missingWallets.length > 0) {
          const { data: missingProfiles } = await supabase
            .from('profiles')
            .select('wallet_address, data')
            .in('wallet_address', missingWallets);

          for (const r of refRows) {
            if (!referredMap.has(r.referred_wallet)) {
              const mp = missingProfiles?.find((p: any) => p.wallet_address === r.referred_wallet);
              referredMap.set(r.referred_wallet, {
                wallet: r.referred_wallet,
                created_at: r.created_at,
                profileData: mp?.data || {}
              });
            }
          }
        }
      }

      const referralContributions = myData.referralContributions || {};

      const referrals = Array.from(referredMap.values()).map(r => {
        const profileData = r.profileData || {};
        const isSubActive = profileData.subscriptionExpiresAt && profileData.subscriptionExpiresAt > Date.now();
        const subTier = isSubActive ? (profileData.subscriptionTier || 'free') : 'free';

        // Calculate total sovereigns contributed by this referral
        let contributed = Number((referralContributions[r.wallet] || 0));
        let subBounty = 0;
        if (profileData.referralSubBountiesAwarded?.ultra) {
          subBounty += 600;
        } else if (profileData.referralSubBountiesAwarded?.premium) {
          subBounty += 300;
        }
        if (contributed < subBounty) {
          contributed = subBounty;
        }

        return {
          wallet: r.wallet,
          username: profileData.username || 'Anonymous',
          level: profileData.level || 1,
          avatarUrl: profileData.avatarUrl || '/avatars/knight.webp',
          joinedAt: r.created_at,
          subscriptionTier: subTier,
          sovereignsContributed: Number(contributed.toFixed(2))
        };
      });

      return res.status(200).json({ 
        referrals,
        unclaimedSovereigns,
        totalEarnedSovereigns
      });
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
        pveEnergy: 5,
        pveEnergyMax: 5,
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

    // Ensure all mail messages have unique IDs
    if (profile && Array.isArray(profile.mailMessages)) {
      const seenMailIds = new Set<string>();
      profile.mailMessages = profile.mailMessages.map((m: any, idx: number) => {
        let mailId = m.id;
        if (!mailId || seenMailIds.has(mailId)) {
          mailId = `${mailId || 'mail'}_dup_${idx}_${Math.random().toString(36).substring(2, 6)}`;
        }
        seenMailIds.add(mailId);
        return { ...m, id: mailId };
      });
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
        let totalPremiumCount = 0;
        let totalUltraCount = 0;

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

          // Subscription check
          const isSubActive = d.subscriptionExpiresAt && Number(d.subscriptionExpiresAt) > now;
          if (isSubActive) {
            const tier = d.subscriptionTier || 'free';
            if (tier === 'ultra') totalUltraCount++;
            else if (tier === 'premium') totalPremiumCount++;
          }

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
            totalPremiumCount,
            totalUltraCount,
            totalSubscribersCount: totalPremiumCount + totalUltraCount,
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
        if (updates.subscriptionTier !== undefined) {
          targetData.subscriptionTier = updates.subscriptionTier;
          if (updates.subscriptionTier === 'ultra' || updates.subscriptionTier === 'premium') {
            const limits = getTierLimits(updates.subscriptionTier);
            targetData.pveEnergy = Math.max(targetData.pveEnergy || 0, limits.pveMax);
            targetData.pveEnergyMax = limits.pveMax;
            targetData.lastPveEnergyRefill = Date.now();
            targetData.pvpEnergy = Math.max(targetData.pvpEnergy || 0, limits.pvpMax);
            targetData.pvpEnergyMax = limits.pvpMax;
            targetData.lastPvpEnergyRefill = Date.now();
            targetData.pvpTickets = targetData.pvpEnergy + (targetData.pvpBonusTickets || 0);
          }
        }
        if (updates.subscriptionExpiresAt !== undefined) targetData.subscriptionExpiresAt = Number(updates.subscriptionExpiresAt);
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
      const wasMax = (profile.pveEnergy || 0) >= (profile.pveEnergyMax || 5);
      profile.pveEnergy -= stage.energyCost;
      if (wasMax) profile.lastPveEnergyRefill = Date.now();

      const subTier = getActiveSubscriptionTier ? getActiveSubscriptionTier(profile) : 'free';
      let goldMultiplier = 1;
      if (subTier === 'ultra') {
        goldMultiplier += 0.50;
      } else if (subTier === 'premium') {
        goldMultiplier += 0.25;
      }

      let expMultiplier = 1;
      if (profile.equipped && profile.equipment) {
        Object.values(profile.equipped).forEach(eqId => {
          const eq = profile.equipment.find((e: any) => e.id === eqId);
          if (eq && eq.bonusType === 'goldBonus') goldMultiplier += (eq.bonusValue / 100);
          if (eq && eq.bonusType === 'expBonus') expMultiplier += (eq.bonusValue / 100);
        });
      }

      const applyMultiplierWithMinimum = (baseVal: number, mult: number) => {
        if (mult <= 1 || baseVal <= 0) return Math.round(baseVal);
        return baseVal + Math.max(1, Math.round(baseVal * (mult - 1)));
      };

      const goldReward = applyMultiplierWithMinimum(stage.goldReward, goldMultiplier);
      const dustReward = stage.dustReward;
      const shardsReward = stage.shardsReward || 0;
      const baseExp = floorNum * 16 + 32;
      const expReward = applyMultiplierWithMinimum(baseExp, expMultiplier);

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
      if (profile.pveEnergyMax === undefined) {
        const tier = getActiveSubscriptionTier ? getActiveSubscriptionTier(profile) : 'free';
        profile.pveEnergyMax = tier === 'vip' ? 15 : (tier === 'premium' ? 10 : 5);
      }
      successMessage = `Restored +${energyCount} PvE Energy for ${shardCost} Shards!`;
      responseData = { energyCount, shardCost, newEnergy: profile.pveEnergy };
    } else if (action === 'buy_gold_pack') {
      const { packageId } = payload || {};
      const GOLD_RATES: Record<string, { gold: number; shards: number; name: string }> = {
        'gold_5k': { gold: 5000, shards: 20, name: 'Pouch of Gold' },
        'gold_25k': { gold: 25000, shards: 80, name: 'Sack of Gold' },
        'gold_50k': { gold: 50000, shards: 150, name: 'Gilded Void Chest' },
        'gold_100k': { gold: 100000, shards: 275, name: 'Overlord Vault' },
      };
      const pack = GOLD_RATES[packageId];
      if (!pack) {
        return res.status(400).json({ error: 'Invalid gold package' });
      }

      const currentShards = profile.darkShards || 0;
      if (currentShards < pack.shards) {
        return res.status(400).json({ error: `Not enough Dark Shards! Need ${pack.shards}, you have ${currentShards}.` });
      }

      profile = recordShardTransaction(
        profile,
        'SHOP_PURCHASE',
        -pack.shards,
        `Purchased ${pack.gold.toLocaleString()} Gold (${pack.name}) for ${pack.shards} Shards`,
        { packageId, goldAmount: pack.gold, shardCost: pack.shards }
      );
      profile.gold = (profile.gold || 0) + pack.gold;
      successMessage = `Successfully purchased ${pack.gold.toLocaleString()} Gold!`;
      responseData = { goldAdded: pack.gold, newGold: profile.gold, shardsSpent: pack.shards, newShards: profile.darkShards };
    } else if (action === 'buy_dust_pack') {
      const { packageId } = payload || {};
      const DUST_RATES: Record<string, { dust: number; shards: number; name: string }> = {
        'dust_2500': { dust: 2500, shards: 15, name: 'Wisp Orb of Dust' },
        'dust_10000': { dust: 10000, shards: 55, name: 'Astral Dust Urn' },
        'dust_25000': { dust: 25000, shards: 120, name: 'Ancient Void Core' },
        'dust_50000': { dust: 50000, shards: 220, name: 'Primordial Nebula' },
      };
      const pack = DUST_RATES[packageId];
      if (!pack) {
        return res.status(400).json({ error: 'Invalid dust package' });
      }

      const currentShards = profile.darkShards || 0;
      if (currentShards < pack.shards) {
        return res.status(400).json({ error: `Not enough Dark Shards! Need ${pack.shards}, you have ${currentShards}.` });
      }

      profile = recordShardTransaction(
        profile,
        'SHOP_PURCHASE',
        -pack.shards,
        `Purchased ${pack.dust.toLocaleString()} Void Dust (${pack.name}) for ${pack.shards} Shards`,
        { packageId, dustAmount: pack.dust, shardCost: pack.shards }
      );
      profile.dust = (profile.dust || 0) + pack.dust;
      successMessage = `Successfully purchased ${pack.dust.toLocaleString()} Void Dust!`;
      responseData = { dustAdded: pack.dust, newDust: profile.dust, shardsSpent: pack.shards, newShards: profile.darkShards };
    } else if (action === 'buy_divine_card') {
      const { baseId } = payload || {};
      const template = CARD_TEMPLATES.find((c: any) => c.baseId === baseId && c.tier === 'divine');
      if (!template) {
        return res.status(400).json({ error: 'Divine entity template not found.' });
      }

      const cardCost = 50;
      const currentShards = profile.darkShards || 0;
      if (currentShards < cardCost) {
        return res.status(400).json({ error: 'Not enough Dark Shards' });
      }

      profile = recordShardTransaction(
        profile,
        'SHOP_PURCHASE',
        -cardCost,
        `Divine Altar summoning: ${template.name}`,
        { baseId, cardCost }
      );

      const newCard = createCardInstance(template, 1);
      profile.collection = profile.collection || [];
      profile.collection.push(newCard);

      successMessage = `Divine entity invoked: ${template.name}!`;
      responseData = { newCard, profile };
    } else if (action === 'buy_divine_equipment') {
      const { itemName } = payload || {};
      const template = EQUIPMENT_TEMPLATES.find((e: any) => e.name === itemName && e.tier === 'divine');
      if (!template) {
        return res.status(400).json({ error: 'Divine equipment template not found.' });
      }

      const equipCost = 50;
      const currentShards = profile.darkShards || 0;
      if (currentShards < equipCost) {
        return res.status(400).json({ error: 'Not enough Dark Shards' });
      }

      profile = recordShardTransaction(
        profile,
        'SHOP_PURCHASE',
        -equipCost,
        `Divine Relic forged: ${template.name}`,
        { itemName, equipCost }
      );

      const newEquipment = generateEquipmentInstance(template);
      profile.equipment = profile.equipment || [];
      profile.equipment.push(newEquipment);

      successMessage = `Divine relic forged: ${template.name}!`;
      responseData = { newEquipment, profile };
    } else if (action === 'buy_divine_set') {
      const demiurgeTemplates = EQUIPMENT_TEMPLATES.filter((e: any) => e.tier === 'divine' && e.setId === 'demiurge');
      if (!demiurgeTemplates || demiurgeTemplates.length === 0) {
        return res.status(400).json({ error: 'Demiurge set templates not found.' });
      }

      // Discount: 250 Dark Shards instead of 300 (50 shards discount)
      const bundleCost = 250;
      const currentShards = profile.darkShards || 0;
      if (currentShards < bundleCost) {
        return res.status(400).json({ error: `Not enough Dark Shards! Bundle costs ${bundleCost} Shards.` });
      }

      profile = recordShardTransaction(
        profile,
        'SHOP_PURCHASE',
        -bundleCost,
        'Complete Demiurge Relic Set forged (6 pieces)',
        { bundleCost, count: demiurgeTemplates.length }
      );

      profile.equipment = profile.equipment || [];
      const newEquipments: any[] = [];

      for (const t of demiurgeTemplates) {
        // Give one piece of each template in the set
        const inst = generateEquipmentInstance(t);
        profile.equipment.push(inst);
        newEquipments.push(inst);
      }

      successMessage = '✨ The Complete Demiurge Relic Set has been forged!';
      responseData = { newEquipments, profile };
    } else if (action === 'withdrawal') {
      const { amountSovereigns, targetAddress } = payload || {};
      const numAmount = parseInt(amountSovereigns, 10);

      const isSubActive = profile.subscriptionExpiresAt && profile.subscriptionExpiresAt > Date.now();
      const subTier = isSubActive ? (profile.subscriptionTier || 'free') : 'free';
      const minSov = subTier === 'ultra' ? 2000 : subTier === 'premium' ? 2500 : 3000;

      if (isNaN(numAmount) || numAmount < minSov) {
        return res.status(400).json({ error: `Minimum withdrawal for ${subTier.toUpperCase()} tier is ${minSov} Blood Sovereigns ($${(minSov * 0.01).toFixed(2)} USDT).` });
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

      profile = recordSovereignTransaction(
        profile,
        'WITHDRAWAL',
        -numAmount,
        `Withdrawal requested to ${targetAddress.trim()}`,
        { requestId: newRequest.id, amountUsdt: newRequest.amountUsdt, targetAddress: targetAddress.trim() }
      );
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
    } else if (action === 'delete_mail') {
      const { mailId } = payload || {};
      if (!mailId) return res.status(400).json({ error: 'Missing mailId' });
      profile.mailMessages = (profile.mailMessages || []).filter((m: any) => m.id !== mailId);
      successMessage = 'Letter deleted successfully';
    } else if (action === 'claim_mail') {
      const { mailId } = payload || {};
      if (!mailId) return res.status(400).json({ error: 'Missing mailId' });
      const mail = (profile.mailMessages || []).find((m: any) => m.id === mailId);
      if (!mail) return res.status(404).json({ error: 'Mail not found' });
      if (mail.isClaimed) return res.status(400).json({ error: 'Reward already claimed' });

      const mailCreatedAt = mail.createdAt ?? mail.date ?? mail.timestamp;

      if (mail.rewards) {
        if (mail.rewards.gold) profile.gold = (profile.gold || 0) + mail.rewards.gold;
        if (mail.rewards.dust) profile.dust = (profile.dust || 0) + mail.rewards.dust;
        if (mail.rewards.shieldType) {
          profile.shieldsInventory = profile.shieldsInventory || { '3h': 0, '6h': 0, '12h': 0 };
          const sType = mail.rewards.shieldType;
          profile.shieldsInventory[sType] = (profile.shieldsInventory[sType] || 0) + (mail.rewards.shieldCount || 1);
        }
        if (mail.rewards.darkShards) {
          profile = recordShardTransaction(
            profile,
            'MAIL_CLAIM',
            mail.rewards.darkShards,
            `Claimed tribute from mail: ${mail.title}`,
            { mailId: mail.id }
          );
        }
        if (mail.rewards.bloodSovereigns) {
          const isLeague = mail.title?.toLowerCase().includes('league') || mail.title?.toLowerCase().includes('pvp season');
          profile = recordSovereignTransaction(
            profile,
            isLeague ? 'LEAGUE_ROLLOVER' : 'MAIL_CLAIM',
            mail.rewards.bloodSovereigns,
            `Claimed tribute: ${mail.title}`,
            { mailId: mail.id, originalCreatedAt: mailCreatedAt },
            'SUCCESS',
            mailCreatedAt
          );
        }
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
          if (m.rewards.shieldType) {
            profile.shieldsInventory = profile.shieldsInventory || { '3h': 0, '6h': 0, '12h': 0 };
            const sType = m.rewards.shieldType;
            profile.shieldsInventory[sType] = (profile.shieldsInventory[sType] || 0) + (m.rewards.shieldCount || 1);
          }
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
      if (totalSovereigns > 0) {
        profile = recordSovereignTransaction(
          profile,
          'MAIL_CLAIM',
          totalSovereigns,
          `Claimed tributes from ${claimedCount} letters`,
          { claimedLettersCount: claimedCount }
        );
      }

      successMessage = `Claimed all rewards from ${claimedCount} letter(s)!`;
      responseData = { claimedCount, totalGold, totalDust, totalShards, totalSovereigns };
    } else if (action === 'buy_subscription') {
      const { tier, durationDays } = payload || {};
      if (!tier || !['premium', 'ultra'].includes(tier) || !durationDays || ![30, 90].includes(durationDays)) {
        return res.status(400).json({ error: 'Invalid subscription tier or duration.' });
      }

      const PRICES: Record<string, Record<number, number>> = {
        premium: { 30: 150, 90: 400 },
        ultra: { 30: 350, 90: 900 }
      };

      const cost = PRICES[tier]?.[durationDays];
      if (!cost) return res.status(400).json({ error: 'Price configuration error.' });

      if ((profile.darkShards || 0) < cost) {
        return res.status(400).json({ error: `Insufficient Dark Shards! Need ${cost} Shards, you have ${profile.darkShards || 0}.` });
      }

      const durationMs = durationDays * 24 * 60 * 60 * 1000;
      const isCurrentActive = profile.subscriptionExpiresAt && profile.subscriptionExpiresAt > Date.now();

      if (isCurrentActive && profile.subscriptionTier === tier) {
        profile.subscriptionExpiresAt = (profile.subscriptionExpiresAt || Date.now()) + durationMs;
      } else {
        profile.subscriptionExpiresAt = Date.now() + durationMs;
      }

      profile.subscriptionTier = tier;
      profile = calculateEnergy(profile);

      // Instantly restore energy and arena tickets to the new maximum limit!
      const limits = getTierLimits(tier);
      profile.pveEnergy = Math.max(profile.pveEnergy || 0, limits.pveMax);
      profile.pveEnergyMax = limits.pveMax;
      profile.lastPveEnergyRefill = Date.now();

      profile.pvpEnergy = Math.max(profile.pvpEnergy || 0, limits.pvpMax);
      profile.pvpEnergyMax = limits.pvpMax;
      profile.lastPvpEnergyRefill = Date.now();
      profile.pvpTickets = profile.pvpEnergy + (profile.pvpBonusTickets || 0);

      profile = recordShardTransaction(
        profile,
        'BUY_SUBSCRIPTION',
        -cost,
        `Purchased ${tier.toUpperCase()} Subscription (${durationDays} Days)`,
        { tier, durationDays, cost }
      );

      // Immediately deliver today's daily tribute mail upon activating or extending pass if not yet delivered today
      const todayUtc = new Date().toISOString().slice(0, 10);
      if (profile.lastDailySubscriptionMail !== todayUtc) {
        const isUltra = tier === 'ultra';
        const gold = isUltra ? 3000 : 1000;
        const dust = isUltra ? 400 : 150;
        const shieldType = isUltra ? '6h' : '3h';
        const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const dailyMail = {
          id: `mail_sub_${todayUtc}_${walletAddress.slice(-4)}_${uniqueSuffix}`,
          title: isUltra ? '💎 Daily Ultra Overlord Tribute' : '⚜️ Daily Premium Tribute',
          sender: 'Imperial Treasury',
          body: `Hail, Lord ${profile.username || 'Voidwalker'}!\n\nYour imperial covenant tribute for ${todayUtc} has arrived at your dominion:\n• +${gold.toLocaleString()} Gold\n• +${dust} Dark Dust\n• 1x ${shieldType} Void Aegis Shield\n\nClaim these resources to fortify your rank in the Abyss!`,
          rewards: {
            gold,
            dust,
            shieldType,
            shieldCount: 1
          },
          isClaimed: false,
          isRead: false,
          createdAt: Date.now()
        };
        profile.mailMessages = [dailyMail, ...(profile.mailMessages || [])].slice(0, 50);
        profile.lastDailySubscriptionMail = todayUtc;
      }

      // One-time subscription bounty for referrer: 300 SOV for Premium, 600 SOV for Ultra
      if (profile.referredBy) {
        profile.referralSubBountiesAwarded = profile.referralSubBountiesAwarded || {};
        const bountyTier = tier as 'premium' | 'ultra';
        if (!profile.referralSubBountiesAwarded[bountyTier]) {
          profile.referralSubBountiesAwarded[bountyTier] = true;
          const bountyAmount = bountyTier === 'ultra' ? 600 : 300;
          try {
            const { data: refOwnerRows } = await supabase
              .from('profiles')
              .select('data')
              .eq('wallet_address', profile.referredBy)
              .limit(1);
            if (refOwnerRows && refOwnerRows.length > 0) {
              const refData = refOwnerRows[0].data || {};
              refData.referralSovereignsUnclaimed = Number(((refData.referralSovereignsUnclaimed || 0) + bountyAmount).toFixed(2));
              refData.referralSovereignsTotalEarned = Number(((refData.referralSovereignsTotalEarned || 0) + bountyAmount).toFixed(2));
              refData.referralContributions = refData.referralContributions || {};
              refData.referralContributions[walletAddress] = Number(((refData.referralContributions[walletAddress] || 0) + bountyAmount).toFixed(2));
              await supabase
                .from('profiles')
                .update({ data: refData, updated_at: new Date().toISOString() })
                .eq('wallet_address', profile.referredBy);
            }
          } catch (refBountyErr) {
            console.error('Failed to credit referrer subscription bounty:', refBountyErr);
          }
        }
      }

      successMessage = `${tier === 'ultra' ? '💎' : '⚜️'} Hail, Lord! You have unlocked the ${tier.toUpperCase()} Pass for ${durationDays} days! Energy & Tickets fully restored, and your daily tribute has been sent to your Mail!`;
      responseData = { 
        subscriptionTier: tier, 
        subscriptionExpiresAt: profile.subscriptionExpiresAt,
        pveEnergy: profile.pveEnergy,
        pveEnergyMax: profile.pveEnergyMax,
        pvpEnergy: profile.pvpEnergy,
        pvpEnergyMax: profile.pvpEnergyMax,
        pvpTickets: profile.pvpTickets,
        mailMessages: profile.mailMessages
      };
    } else if (action === 'claim_daily_subscription') {
      const isSubActive = profile.subscriptionExpiresAt && profile.subscriptionExpiresAt > Date.now();
      if (!isSubActive) {
        return res.status(400).json({ error: 'No active subscription found. Upgrade to claim daily tributes.' });
      }

      const todayUtc = new Date().toISOString().slice(0, 10);
      if (profile.lastDailySubscriptionClaim === todayUtc) {
        return res.status(400).json({ error: 'Daily subscription tribute has already been claimed today.' });
      }

      const tier = profile.subscriptionTier || 'premium';
      const goldReward = tier === 'ultra' ? 3000 : 1000;
      const dustReward = tier === 'ultra' ? 400 : 150;
      const shieldType = tier === 'ultra' ? '6h' : '3h';

      profile.gold = (profile.gold || 0) + goldReward;
      profile.dust = (profile.dust || 0) + dustReward;

      profile.shieldsInventory = profile.shieldsInventory || { '3h': 0, '6h': 0, '12h': 0 };
      profile.shieldsInventory[shieldType] = (profile.shieldsInventory[shieldType] || 0) + 1;
      profile.lastDailySubscriptionClaim = todayUtc;

      successMessage = `⚔️ Daily ${tier.toUpperCase()} Tribute claimed: +${goldReward} Gold, +${dustReward} Dust, +1 ${shieldType} Void Aegis Shield!`;
      responseData = { goldReward, dustReward, shieldType };
    } else if (action === 'activate_shield') {
      const { shieldType } = payload || {};
      if (!shieldType || !['3h', '6h', '12h'].includes(shieldType)) {
        return res.status(400).json({ error: 'Invalid shield type.' });
      }

      if (profile.activeShieldUntil && profile.activeShieldUntil > Date.now()) {
        return res.status(400).json({ error: 'A Peace Shield is already active! You cannot activate another shield until the current one expires.' });
      }

      profile.shieldsInventory = profile.shieldsInventory || { '3h': 0, '6h': 0, '12h': 0 };
      const count = profile.shieldsInventory[shieldType] || 0;
      if (count < 1) {
        return res.status(400).json({ error: `You do not have any ${shieldType} Void Shields in your inventory.` });
      }

      profile.shieldsInventory[shieldType] = count - 1;
      const hours = shieldType === '12h' ? 12 : shieldType === '6h' ? 6 : 3;
      const durationMs = hours * 3600 * 1000;

      profile.activeShieldUntil = Date.now() + durationMs;

      successMessage = `🛡️ Void Aegis activated! Your territory is immune to Arena attacks for ${hours} hours.`;
      responseData = { activeShieldUntil: profile.activeShieldUntil };
    } else if (action === 'buy_shield') {
      const { shieldType } = payload || {};
      if (!shieldType || !['3h', '6h', '12h'].includes(shieldType)) {
        return res.status(400).json({ error: 'Invalid shield type.' });
      }

      const SHIELD_PRICES: Record<string, number> = {
        '3h': 8,
        '6h': 15,
        '12h': 25
      };

      const cost = SHIELD_PRICES[shieldType];
      if ((profile.darkShards || 0) < cost) {
        return res.status(400).json({ error: `Insufficient Dark Shards! Need ${cost} Shards, you have ${profile.darkShards || 0}.` });
      }

      profile.shieldsInventory = profile.shieldsInventory || { '3h': 0, '6h': 0, '12h': 0 };
      profile.shieldsInventory[shieldType] = (profile.shieldsInventory[shieldType] || 0) + 1;

      profile = recordShardTransaction(
        profile,
        'BUY_SHIELD',
        -cost,
        `Purchased ${shieldType} Void Aegis for ${cost} Dark Shards`,
        { shieldType, cost }
      );

      successMessage = `🛡️ Purchased 1x ${shieldType} Void Aegis Shield!`;
      responseData = { shieldsInventory: profile.shieldsInventory, darkShards: profile.darkShards };
    } else if (action === 'claim_referral_sovereigns') {
      const unclaimed = profile.referralSovereignsUnclaimed || 0;
      const wholeUnits = Math.floor(unclaimed);
      if (wholeUnits < 1) {
        return res.status(400).json({ error: 'You need at least 1 whole Blood Sovereign to transfer to the Bank.' });
      }

      profile.referralSovereignsUnclaimed = Number((unclaimed - wholeUnits).toFixed(2));
      profile.bloodSovereigns = (profile.bloodSovereigns || 0) + wholeUnits;
      profile = recordSovereignTransaction(
        profile,
        'REFERRAL_COMMISSION',
        wholeUnits,
        `Transferred ${wholeUnits} Blood Sovereigns from Referral Vault to Bank`,
        { transferredAmount: wholeUnits, remainingUnclaimed: profile.referralSovereignsUnclaimed }
      );

      successMessage = `Transferred ${wholeUnits} Blood Sovereigns to your Imperial Bank!`;
      responseData = {
        claimedSovereigns: wholeUnits,
        referralSovereignsUnclaimed: profile.referralSovereignsUnclaimed,
        bloodSovereigns: profile.bloodSovereigns
      };
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





