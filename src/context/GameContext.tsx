import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '../components/Toast';
import { Card, PlayerProfile, CampaignStage, BattlePassTier, CardTemplate, CardTier, Equipment, EquipmentSlot } from '../types';
import { getStarterDeck, CARD_TEMPLATES, createCardInstance, getCardManaCost, getEvolutionBonusSkill, getFusionCosts, BATTLE_PASS_TIERS, AIRDROP_TASKS } from '../data/cards';
import { supabase } from '../utils/supabaseClient';
import { calculateEnergy, getTierLimits } from '../utils/energyHelper';
import { ALL_LEAGUE_REWARDS } from '../data/leagueRewards';
import { recordShardTransaction } from '../utils/shardLogger';
import { recordSovereignTransaction } from '../utils/sovereignLogger';

interface GameContextType {
  profile: PlayerProfile;
  setProfile: React.Dispatch<React.SetStateAction<PlayerProfile>>;
  saveProfile: (newProfile: PlayerProfile) => void;
  addGold: (amount: number) => void;
  addDust: (amount: number) => void;
  addShards: (amount: number) => void;
  addBloodSovereigns: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  spendDust: (amount: number) => boolean;
  spendShards: (amount: number) => boolean;
  spendBloodSovereigns: (amount: number) => boolean;
  requestWithdrawal: (amountSovereigns: number, targetAddress: string) => Promise<{ success: boolean; message: string }>;
  usePveEnergy: (amount: number) => boolean;
  usePvpEnergy: (amount: number) => boolean;
  buyPvpTickets: (ticketCount?: number) => Promise<boolean>;
  buyPveEnergy: (energyCount?: number) => Promise<boolean>;
  startBattleOnServer: (battleType: 'campaign' | 'pvp', stageId: string, energyCost: number, opponentPayload?: any) => Promise<boolean>;
  buyDarkShardsWithSOL: (solAmount: number) => Promise<boolean>;
  verifySolanaPayment: (signature: string, packageId: string) => Promise<{ success: boolean; message: string }>;
  isLoadingProfile: boolean;
  connectSolanaWallet: (address: string) => Promise<void>;
  disconnectSolanaWallet: () => void;
  fuseCards: (cardId1: string, cardId2: string) => Promise<{ success: boolean; message: string; newCard?: Card }>;
  submitBattleResult: (battleType: 'campaign' | 'pvp', stageId: string, result: 'win' | 'loss', stars?: number) => Promise<{ success: boolean; message: string; rewards?: any }>;
  submitAction: (action: string, payload: any) => Promise<{ success: boolean; message: string; data?: any }>;
  addCardToCollection: (cardTemplate: CardTemplate, level?: number) => Card;
  toggleDeckCard: (cardId: string) => { success: boolean; message: string };
  completeAirdropTask: (taskId: string) => Promise<{ success: boolean; message: string }>;
  buySubscription: (tier: 'premium' | 'ultra', durationDays: 30 | 90) => Promise<{ success: boolean; message: string }>;
  claimDailySubscription: () => Promise<{ success: boolean; message: string }>;
  activateShield: (shieldType: '3h' | '6h' | '12h') => Promise<{ success: boolean; message: string }>;
  buyShield: (shieldType: '3h' | '6h' | '12h') => Promise<{ success: boolean; message: string }>;
  claimReferralSovereigns: () => Promise<{ success: boolean; message: string; claimedSovereigns?: number }>;
  addExp: (amount: number) => void;
  addCampaignStars: (stageId: string, stars: number) => void;
  addEquipment: (equipment: Equipment) => void;
  equipItem: (slot: EquipmentSlot, equipmentId: string) => void;
  unequipItem: (slot: EquipmentSlot) => void;
  registerPlayer: (username: string, avatarUrl: string) => Promise<{ success: boolean; message: string }>;
  logoutPlayer: () => void;
  resetProfile: () => void;
  markMailAsRead: (mailId: string) => Promise<void>;
  deleteMail: (mailId: string) => Promise<{ success: boolean; message: string }>;
  claimMailReward: (mailId: string) => Promise<{ success: boolean; message: string }>;
  claimAllMailRewards: () => Promise<{ success: boolean; message: string; totalGold?: number; totalDust?: number; totalSovereigns?: number }>;
  fetchAdminOverview: () => Promise<{ success: boolean; message: string; [key: string]: any }>;
  fetchAdminWithdrawals: () => Promise<{ success: boolean; message: string; requests?: any[] }>;
  processAdminWithdrawal: (requestId: string, userWallet: string, decision: 'approve' | 'reject', txid?: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  broadcastAdminMail: (targetType: string, targetValue: string, title: string, content: string, rewards?: any) => Promise<{ success: boolean; message: string; sentCount?: number }>;
  searchAdminPlayer: (query: string) => Promise<{ success: boolean; message: string; matches?: any[]; players?: any[] }>;
  modifyAdminPlayer: (targetWallet: string, updates: any) => Promise<{ success: boolean; message: string; profile?: any }>;
  deleteAdminPlayer: (targetWallet: string) => Promise<{ success: boolean; message: string }>;
  triggerAdminRollover: () => Promise<{ success: boolean; message: string; rolloverResult?: any }>;
  leagueRewardsConfig: any[];
  setLeagueRewardsConfig: (config: any[]) => void;
  fetchLeagueRewardsConfig: () => Promise<void>;
  fetchAdminLeagueRewards: () => Promise<{ success: boolean; isCustom?: boolean; config?: any[]; defaultConfig?: any[]; message?: string }>;
  saveAdminLeagueRewards: (config: any[]) => Promise<{ success: boolean; message: string; config?: any[] }>;
  resetAdminLeagueRewards: () => Promise<{ success: boolean; message: string; config?: any[] }>;
  isShardsShopOpen: boolean;
  setIsShardsShopOpen: (open: boolean) => void;
  refreshProfile: (notifyOnDefense?: boolean) => Promise<PlayerProfile | null>;
  hasNewDefenseAttacks: boolean;
  markDefenseHistoryAsViewed: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'void_covenant_profile_v1';

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

const migrateCardInstance = (card: any, templates: any[]): any => {
  if (!card) return card;
  const mappedBaseId = LEGACY_CARD_MAPPINGS[card.baseId];
  if (mappedBaseId) {
    const template = templates.find(t => t.baseId === mappedBaseId);
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
        baseId: mappedBaseId,
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
};

const migrateProfileTo10Cards = (p: PlayerProfile): PlayerProfile => {
  if (!p) return p;
  if (!p.collection) p.collection = [];
  if (!p.deck) p.deck = [];
  
  // Convert image extensions to webp and normalize image URLs from CARD_TEMPLATES
  if (p.avatarUrl) {
    p.avatarUrl = p.avatarUrl.replace(/\.png/g, '.webp').replace(/\.jpg/g, '.webp').replace(/\.jpeg/g, '.webp');
  }
  p.collection = p.collection.map(c => {
    const template = CARD_TEMPLATES.find(t => t.baseId === c.baseId);
    if (template?.image) {
      c.image = template.image;
    } else if (c.image) {
      c.image = c.image.replace(/\.png/g, '.webp').replace(/\.jpg/g, '.webp').replace(/\.jpeg/g, '.webp');
      if (!c.image.startsWith('/cards/')) {
        c.image = `/cards/${c.baseId}.webp`;
      }
    } else {
      c.image = `/cards/${c.baseId}.webp`;
    }
    return c;
  });
  
  // First, migrate any legacy cards in the collection to their new equivalents
  p.collection = p.collection.map(c => migrateCardInstance(c, CARD_TEMPLATES));
  
  // Filter out any cards whose baseId is no longer present in CARD_TEMPLATES (legacy versions)
  const validBaseIds = new Set(CARD_TEMPLATES.map(t => t.baseId));
  p.collection = p.collection.filter(c => validBaseIds.has(c.baseId));
  p.deck = p.deck.filter(cardId => p.collection.some(c => c.id === cardId));
  
  // Ensure all cards in collection have exact accurate manaCost
  p.collection = p.collection.map(c => {
    return { ...c, manaCost: getCardManaCost(c) };
  });

  // Ensure collection has at least 10 cards
  if (p.collection.length < 10) {
    const starterDeck = getStarterDeck();
    starterDeck.forEach(c => {
      if (p.collection.length < 10) {
        c.id = `c_mig_${Math.random().toString(36).substr(2, 5)}_${Date.now()}`;
        p.collection.push(c);
      }
    });
  }
  
  // Ensure deck has exactly 10 cards
  if (p.deck.length < 10) {
    p.deck = p.collection.slice(0, 10).map(c => c.id);
  }
  
  // Ensure league and LP fields are populated
  p.pvpLeague = p.pvpLeague || 'Bronze';
  p.pvpLP = p.pvpLP !== undefined ? p.pvpLP : 100;
  p.bloodSovereigns = p.bloodSovereigns !== undefined ? p.bloodSovereigns : 0;
  
  // Ensure mailMessages have strictly unique IDs
  if (Array.isArray(p.mailMessages)) {
    const seenMailIds = new Set<string>();
    p.mailMessages = p.mailMessages.map((m: any, idx: number) => {
      let mailId = m.id;
      if (!mailId || seenMailIds.has(mailId)) {
        mailId = `${mailId || 'mail'}_dup_${idx}_${Math.random().toString(36).substring(2, 6)}`;
      }
      seenMailIds.add(mailId);
      return { ...m, id: mailId };
    });
  } else {
    p.mailMessages = [];
  }
  
  return p;
};

const createDefaultProfile = (): PlayerProfile => {
  const starterDeck = getStarterDeck();
  return {
  gold: 500,
  dust: 100,
  darkShards: 0,
  bloodSovereigns: 0,
  collection: starterDeck,
  deck: starterDeck.map(c => c.id), // All 10 starter cards
  pveEnergy: 5,
  pveEnergyMax: 5,
  pvpEnergy: 5,
  pvpEnergyMax: 5,
  pvpTickets: 5,
  subscriptionTier: 'free',
  subscriptionExpiresAt: 0,
  shieldsInventory: { '3h': 0, '6h': 0, '12h': 0 },
  activeShieldUntil: 0,
  dailySovereignsWonToday: 0,
  lastEnergyRefill: Date.now(),
  lastPveEnergyRefill: Date.now(),
  lastPvpEnergyRefill: Date.now(),
  pveProgress: 1,
  pvpRating: 100,
  pvpLeague: 'Bronze',
  pvpLP: 100,
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
  solanaAddress: null,
  solBalance: null,
  isPremiumBP: false,
  username: '',
  isRegistered: false,
  mailMessages: []
  };
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<PlayerProfile>(createDefaultProfile);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isShardsShopOpen, setIsShardsShopOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && ref.length >= 32) {
      localStorage.setItem('void_covenant_referrer', ref);
    }
  }, []);

  // Ref to track latest profile for synchronous reads in spend functions
  const profileRef = useRef(profile);
  useEffect(() => { profileRef.current = profile; }, [profile]);

  const toast = useToast();

  // Track last viewed defense history timestamp
  const [lastViewedDefenseTs, setLastViewedDefenseTs] = useState<number>(() => {
    const saved = localStorage.getItem('void_covenant_last_viewed_defense_ts');
    return saved ? parseInt(saved, 10) || 0 : Date.now();
  });

  // Calculate whether there are new unviewed defense attacks
  const hasNewDefenseAttacks = React.useMemo(() => {
    if (!profile.pvpHistory || profile.pvpHistory.length === 0) return false;
    return profile.pvpHistory.some((r: any) => r.isDefense && r.timestamp > lastViewedDefenseTs);
  }, [profile.pvpHistory, lastViewedDefenseTs]);

  const markDefenseHistoryAsViewed = useCallback(() => {
    const now = Date.now();
    localStorage.setItem('void_covenant_last_viewed_defense_ts', now.toString());
    setLastViewedDefenseTs(now);
  }, []);

  // Track known defense IDs to avoid duplicate toasts
  const knownDefenseIdsRef = useRef<Set<string>>(new Set());

  // Initialize knownDefenseIds when profile is loaded
  useEffect(() => {
    if (profile?.pvpHistory) {
      profile.pvpHistory.forEach((r: any) => {
        if (r.isDefense && r.id) {
          knownDefenseIdsRef.current.add(r.id);
        }
      });
    }
  }, [profile?.solanaAddress]);

  // Refresh profile from authoritative server (silent background fetch)
  const refreshProfile = useCallback(async (notifyOnDefense = true): Promise<PlayerProfile | null> => {
    const token = localStorage.getItem('void_covenant_token');
    if (!token) return null;

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      });

      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          let serverProfile = calculateEnergy(data.profile);
          serverProfile.solBalance = 12.5;
          const migrated = migrateProfileTo10Cards(serverProfile);

          // Check for new defense attacks
          const newHistory = migrated.pvpHistory || [];
          if (notifyOnDefense && knownDefenseIdsRef.current.size > 0 && newHistory.length > 0) {
            const freshDefenseRecords = newHistory.filter(
              (r: any) => r.isDefense && r.id && !knownDefenseIdsRef.current.has(r.id)
            );

            if (freshDefenseRecords.length > 0) {
              freshDefenseRecords.forEach((rec: any) => {
                knownDefenseIdsRef.current.add(rec.id);
                const isWin = rec.winner === 'defender';
                const lpDelta = rec.defenderLPChange !== undefined ? rec.defenderLPChange : rec.defenderRatingChange;
                const sign = lpDelta >= 0 ? `+${lpDelta}` : `${lpDelta}`;
                const challenger = rec.attackerName || 'Challenger';

                if (isWin) {
                  toast(`🛡️ Defense Victorious! ${sign} 👑 vs ${challenger}`, 'success', 6000);
                } else {
                  toast(`⚔️ Defense Breached: ${sign} 👑 by ${challenger}`, 'warning', 6000);
                }
              });
            }
          }

          // Register all current defense IDs into the set
          newHistory.forEach((r: any) => {
            if (r.isDefense && r.id) {
              knownDefenseIdsRef.current.add(r.id);
            }
          });

          // Check if profile actually changed before re-rendering
          setProfile(prev => {
            if (
              prev.pvpLP !== migrated.pvpLP ||
              prev.pvpRating !== migrated.pvpRating ||
              prev.pvpLeague !== migrated.pvpLeague ||
              (prev.pvpHistory?.length || 0) !== (migrated.pvpHistory?.length || 0) ||
              prev.gold !== migrated.gold ||
              prev.dust !== migrated.dust ||
              prev.darkShards !== migrated.darkShards ||
              prev.bloodSovereigns !== migrated.bloodSovereigns ||
              prev.dailySovereignsWonToday !== migrated.dailySovereignsWonToday ||
              prev.lastSovereignsWonDate !== migrated.lastSovereignsWonDate ||
              prev.subscriptionTier !== migrated.subscriptionTier ||
              prev.subscriptionExpiresAt !== migrated.subscriptionExpiresAt ||
              prev.pvpEnergy !== migrated.pvpEnergy ||
              prev.pvpBonusTickets !== migrated.pvpBonusTickets ||
              (prev.mailMessages?.length || 0) !== (migrated.mailMessages?.length || 0) ||
              (prev.sovereignTransactions?.length || 0) !== (migrated.sovereignTransactions?.length || 0) ||
              prev.level !== migrated.level ||
              prev.exp !== migrated.exp
            ) {
              return migrated;
            }
            return prev;
          });

          return migrated;
        }
      }
    } catch (err) {
      // Quiet background network glitch - no spam
    }
    return null;
  }, [toast]);

  // Window Focus and Visibility Change listener (instant refresh when returning to tab)
  useEffect(() => {
    const handleFocusOrVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshProfile(true);
      }
    };

    window.addEventListener('focus', handleFocusOrVisibility);
    document.addEventListener('visibilitychange', handleFocusOrVisibility);

    return () => {
      window.removeEventListener('focus', handleFocusOrVisibility);
      document.removeEventListener('visibilitychange', handleFocusOrVisibility);
    };
  }, [refreshProfile]);

  // Background polling interval: every 12 seconds when window is active/visible
  useEffect(() => {
    const pollInterval = setInterval(() => {
      if (!document.hidden && localStorage.getItem('void_covenant_token')) {
        refreshProfile(true);
      }
    }, 12000);

    return () => clearInterval(pollInterval);
  }, [refreshProfile]);

  // Automatically save profile settings to Supabase
  const saveProfile = (newProfile: PlayerProfile) => {
    setProfile(newProfile);
    if (newProfile.solanaAddress) {
      // Local storage is now ONLY used for token persistence, NOT for the profile itself
      const token = localStorage.getItem('void_covenant_token');
      if (token) {
        // Send safe profile updates to the server (e.g. deck, equipped, sound)
        const referrer = localStorage.getItem('void_covenant_referrer') || undefined;
        fetch('/api/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ safeProfileData: newProfile, referrer })
        }).catch(err => console.error('Failed to sync profile settings', err));
      }
    }
  };

  // Passive Energy Regeneration over time (UI updates only, no server spam)
  useEffect(() => {
    const interval = setInterval(() => {
      setProfile(current => {
        const updated = calculateEnergy({ ...current });
        if (
          updated.pveEnergy !== current.pveEnergy || 
          updated.pvpEnergy !== current.pvpEnergy ||
          updated.lastPveEnergyRefill !== current.lastPveEnergyRefill
        ) {
          return updated;
        }
        return current;
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Utility actions
  const addGold = (amount: number) => {
    setProfile(current => {
      const updated = { ...current, gold: current.gold + amount };
      saveProfile(updated);
      return updated;
    });
  };

  const addDust = (amount: number) => {
    setProfile(current => {
      const updated = { ...current, dust: current.dust + amount };
      saveProfile(updated);
      return updated;
    });
  };

  const getRequiredExpForLevel = (level: number) => {
    const lvl = Math.max(1, level);
    return Math.floor(200 * lvl + 15 * Math.pow(lvl, 1.5));
  };

  const addExp = (amount: number) => {
    setProfile(current => {
      if (current.level >= 100) return current;

      let newExp = current.exp + amount;
      let newLevel = current.level;
      let newMaxHealth = current.heroMaxHealth;
      
      let required = getRequiredExpForLevel(newLevel);
      while (newExp >= required && newLevel < 100) {
        newExp -= required;
        newLevel++;
        newMaxHealth += 2;
        required = getRequiredExpForLevel(newLevel);
      }
      
      if (newLevel >= 100) {
        newExp = 0; // Or keep it at required-1, but 0 is cleaner for max level
      }

      const updated = { ...current, exp: newExp, level: newLevel, heroMaxHealth: newMaxHealth };
      saveProfile(updated);
      return updated;
    });
  };

  const addCampaignStars = (stageId: string, stars: number) => {
    setProfile(current => {
      const currentStars = current.campaignStars[stageId] || 0;
      if (stars > currentStars) {
        const updated = { 
          ...current, 
          campaignStars: { ...current.campaignStars, [stageId]: stars } 
        };
        saveProfile(updated);
        return updated;
      }
      return current;
    });
  };

  const addEquipment = (equipment: Equipment) => {
    setProfile(current => {
      const updated = {
        ...current,
        equipment: [...current.equipment, equipment]
      };
      saveProfile(updated);
      return updated;
    });
  };

  const equipItem = (slot: EquipmentSlot, equipmentId: string) => {
    setProfile(current => {
      // Check if player owns this equipment and it matches the slot
      const item = current.equipment.find(e => e.id === equipmentId);
      if (!item || item.slot !== slot) return current;

      const updated = {
        ...current,
        equipped: {
          ...current.equipped,
          [slot]: equipmentId
        }
      };
      saveProfile(updated);
      return updated;
    });
  };

  const unequipItem = (slot: EquipmentSlot) => {
    setProfile(current => {
      const newEquipped = { ...current.equipped };
      delete newEquipped[slot];
      
      const updated = {
        ...current,
        equipped: newEquipped
      };
      saveProfile(updated);
      return updated;
    });
  };

  const addShards = (amount: number, description: string = 'Added Dark Shards') => {
    setProfile(current => {
      const updated = recordShardTransaction(
        current,
        'ADMIN_ADJUSTMENT',
        amount,
        description,
        { amount }
      );
      saveProfile(updated);
      return updated;
    });
  };

  const spendGold = (amount: number): boolean => {
    if (profileRef.current.gold < amount) return false;
    setProfile(current => {
      if (current.gold < amount) return current;
      const updated = { ...current, gold: current.gold - amount };
      saveProfile(updated);
      return updated;
    });
    return true;
  };

  const spendDust = (amount: number): boolean => {
    if (profileRef.current.dust < amount) return false;
    setProfile(current => {
      if (current.dust < amount) return current;
      const updated = { ...current, dust: current.dust - amount };
      saveProfile(updated);
      return updated;
    });
    return true;
  };

  const spendShards = (amount: number, description: string = 'Spent Dark Shards'): boolean => {
    if (profileRef.current.darkShards < amount) {
      setIsShardsShopOpen(true);
      return false;
    }
    setProfile(current => {
      if (current.darkShards < amount) return current;
      const updated = recordShardTransaction(
        current,
        'SHOP_PURCHASE',
        -amount,
        description,
        { amount }
      );
      saveProfile(updated);
      return updated;
    });
    return true;
  };

  const addBloodSovereigns = (amount: number) => {
    setProfile(current => {
      const updated = {
        ...current,
        bloodSovereigns: (current.bloodSovereigns || 0) + amount
      };
      saveProfile(updated);
      return updated;
    });
  };

  const spendBloodSovereigns = (amount: number): boolean => {
    if ((profileRef.current.bloodSovereigns || 0) < amount) {
      return false;
    }
    setProfile(current => {
      if ((current.bloodSovereigns || 0) < amount) return current;
      const updated = {
        ...current,
        bloodSovereigns: (current.bloodSovereigns || 0) - amount
      };
      saveProfile(updated);
      return updated;
    });
    return true;
  };

  const requestWithdrawal = async (amountSovereigns: number, targetAddress: string): Promise<{ success: boolean; message: string }> => {
    if (amountSovereigns < 100) {
      return { success: false, message: 'Minimum withdrawal amount is 100 Blood Sovereigns ($1.00 USDT).' };
    }
    if (!targetAddress || targetAddress.trim().length < 24) {
      return { success: false, message: 'Please provide a valid destination wallet address.' };
    }
    if ((profileRef.current.bloodSovereigns || 0) < amountSovereigns) {
      return { success: false, message: 'Insufficient Blood Sovereigns balance!' };
    }

    const token = localStorage.getItem('void_covenant_token');
    if (token) {
      try {
        const res = await fetch('/api/action', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ action: 'withdrawal', payload: { amountSovereigns, targetAddress } })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfile(migrateProfileTo10Cards(data.profile));
          }
          return { success: true, message: data.message || 'Withdrawal request submitted successfully!' };
        } else {
          const err = await res.json().catch(() => ({}));
          return { success: false, message: err.error || 'Failed to submit withdrawal request.' };
        }
      } catch (e: any) {
        console.error('Withdrawal error:', e);
      }
    }

    // Local state fallback for offline / guest / client mode
    const newRequest: WithdrawalRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId: profile.solanaAddress || 'guest_user',
      username: profile.username || 'Voidwalker',
      walletAddress: targetAddress.trim(),
      amountSovereigns,
      amountUsdt: Number((amountSovereigns * 0.01).toFixed(2)),
      status: 'pending',
      createdAt: Date.now()
    };

    setProfile(current => {
      let updated = recordSovereignTransaction(
        current,
        'WITHDRAWAL',
        -amountSovereigns,
        `Withdrawal requested to ${targetAddress.trim()}`,
        { requestId: newRequest.id, amountUsdt: newRequest.amountUsdt, targetAddress: targetAddress.trim() }
      );
      updated = {
        ...updated,
        withdrawalRequests: [newRequest, ...(updated.withdrawalRequests || [])]
      };
      saveProfile(updated);
      return updated;
    });

    return { success: true, message: `Successfully requested withdrawal of ${amountSovereigns} SOV ($${(amountSovereigns * 0.01).toFixed(2)} USDT)!` };
  };

  const markMailAsRead = async (mailId: string): Promise<void> => {
    setProfile(current => {
      const updatedMessages = (current.mailMessages || []).map(m => m.id === mailId ? { ...m, isRead: true } : m);
      const updated = { ...current, mailMessages: updatedMessages };
      saveProfile(updated);
      return updated;
    });

    const token = localStorage.getItem('void_covenant_token');
    if (token) {
      submitAction('read_mail', { mailId }).catch(() => {});
    }
  };

  const deleteMail = async (mailId: string): Promise<{ success: boolean; message: string }> => {
    setProfile(current => {
      const updatedMessages = (current.mailMessages || []).filter(m => m.id !== mailId);
      const updated = { ...current, mailMessages: updatedMessages };
      saveProfile(updated);
      return updated;
    });

    const token = localStorage.getItem('void_covenant_token');
    if (token) {
      try {
        const res = await submitAction('delete_mail', { mailId });
        return { success: res.success, message: res.message || 'Letter deleted' };
      } catch (e: any) {
        return { success: false, message: e.message || 'Failed to delete letter' };
      }
    }
    return { success: true, message: 'Letter deleted' };
  };

  const claimMailReward = async (mailId: string): Promise<{ success: boolean; message: string }> => {
    const token = localStorage.getItem('void_covenant_token');
    if (token) {
      try {
        const res = await submitAction('claim_mail', { mailId });
        return { success: res.success, message: res.message || 'Reward claimed successfully!' };
      } catch (e: any) {
        return { success: false, message: e.message || 'Failed to claim reward' };
      }
    }

    // Local fallback for offline / demo mode
    let messageResult = 'Reward claimed!';
    setProfile(current => {
      const targetMail = (current.mailMessages || []).find(m => m.id === mailId);
      if (!targetMail || targetMail.isClaimed) return current;

      let newGold = current.gold || 0;
      let newDust = current.dust || 0;
      let newShards = current.darkShards || 0;
      const sovReward = targetMail.rewards?.bloodSovereigns || 0;
      const mailCreatedAt = targetMail.createdAt ?? targetMail.date ?? targetMail.timestamp;

      let newShields = { ...(current.shieldsInventory || { '3h': 0, '6h': 0, '12h': 0 }) };

      if (targetMail.rewards) {
        if (targetMail.rewards.gold) newGold += targetMail.rewards.gold;
        if (targetMail.rewards.dust) newDust += targetMail.rewards.dust;
        if (targetMail.rewards.darkShards) newShards += targetMail.rewards.darkShards;
        if (targetMail.rewards.shieldType) {
          const sType = targetMail.rewards.shieldType;
          newShields[sType] = (newShields[sType] || 0) + (targetMail.rewards.shieldCount || 1);
        }
      }

      const updatedMessages = (current.mailMessages || []).map(m => m.id === mailId ? { ...m, isClaimed: true, isRead: true } : m);
      let updated: PlayerProfile = {
        ...current,
        gold: newGold,
        dust: newDust,
        darkShards: newShards,
        shieldsInventory: newShields,
        mailMessages: updatedMessages
      };

      if (sovReward > 0) {
        const isLeague = targetMail.title?.toLowerCase().includes('league') || targetMail.title?.toLowerCase().includes('pvp season');
        updated = recordSovereignTransaction(
          updated,
          isLeague ? 'LEAGUE_ROLLOVER' : 'MAIL_CLAIM',
          sovReward,
          `Claimed tribute: ${targetMail.title}`,
          { mailId: targetMail.id, originalCreatedAt: mailCreatedAt },
          'SUCCESS',
          mailCreatedAt
        );
      }

      saveProfile(updated);
      return updated;
    });

    return { success: true, message: messageResult };
  };

  const claimAllMailRewards = async (): Promise<{ success: boolean; message: string }> => {
    const token = localStorage.getItem('void_covenant_token');
    if (token) {
      try {
        const res = await submitAction('claim_all_mail', {});
        return { success: res.success, message: res.message || 'All rewards claimed!' };
      } catch (e: any) {
        return { success: false, message: e.message || 'Failed to claim all rewards' };
      }
    }

    // Local fallback
    setProfile(current => {
      let newGold = current.gold || 0;
      let newDust = current.dust || 0;
      let newShards = current.darkShards || 0;
      let newShields = { ...(current.shieldsInventory || { '3h': 0, '6h': 0, '12h': 0 }) };
      let totalSovereigns = 0;
      let claimedCount = 0;

      const updatedMessages = (current.mailMessages || []).map(m => {
        if (m.rewards && !m.isClaimed) {
          claimedCount++;
          if (m.rewards.gold) newGold += m.rewards.gold;
          if (m.rewards.dust) newDust += m.rewards.dust;
          if (m.rewards.darkShards) newShards += m.rewards.darkShards;
          if (m.rewards.bloodSovereigns) totalSovereigns += m.rewards.bloodSovereigns;
          if (m.rewards.shieldType) {
            const sType = m.rewards.shieldType;
            newShields[sType] = (newShields[sType] || 0) + (m.rewards.shieldCount || 1);
          }
          return { ...m, isClaimed: true, isRead: true };
        }
        return m;
      });

      let updated: PlayerProfile = {
        ...current,
        gold: newGold,
        dust: newDust,
        darkShards: newShards,
        shieldsInventory: newShields,
        mailMessages: updatedMessages
      };

      if (totalSovereigns > 0) {
        updated = recordSovereignTransaction(
          updated,
          'MAIL_CLAIM',
          totalSovereigns,
          `Claimed tributes from ${claimedCount} letters`,
          { claimedLettersCount: claimedCount }
        );
      }

      saveProfile(updated);
      return updated;
    });

    return { success: true, message: 'All pending mail rewards claimed!' };
  };

  const startBattleOnServer = async (battleType: 'campaign' | 'pvp', stageId: string, energyCost: number, opponentPayload?: any): Promise<boolean> => {
    const token = localStorage.getItem('void_covenant_token');
    
    if (token) {
      try {
        const res = await fetch('/api/battle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ isStart: true, battleType, stageId, ...opponentPayload })
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setProfile(migrateProfileTo10Cards(data.profile));
          }
          return true;
        } else {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to start battle');
        }
      } catch (err: any) {
        console.error('Network error starting battle:', err);
        return false;
      }
    }
    
    // Local fallback for offline/guest/dev mode
    let success = false;
    setProfile(current => {
      const updated = { ...current };
      if (battleType === 'campaign') {
        if (updated.pveEnergy < energyCost) return current;
        updated.pveEnergy -= energyCost;
      } else {
        if (updated.pvpEnergy < 1) return current;
        updated.pvpEnergy -= 1;
      }
      saveProfile(updated);
      success = true;
      return updated;
    });
    return success;
  };

  const usePveEnergy = (amount: number): boolean => {
    if (profileRef.current.pveEnergy < amount) return false;
    setProfile(current => {
      if (current.pveEnergy < amount) return current;
      const wasMax = current.pveEnergy >= current.pveEnergyMax;
      const updated = { 
        ...current, 
        pveEnergy: current.pveEnergy - amount,
        lastPveEnergyRefill: wasMax ? Date.now() : (current.lastPveEnergyRefill ?? current.lastEnergyRefill)
      };
      saveProfile(updated);
      return updated;
    });
    return true;
  };

  const usePvpEnergy = (amount: number): boolean => {
    const currentTickets = profileRef.current.pvpTickets !== undefined ? profileRef.current.pvpTickets : (profileRef.current.pvpEnergy || 0);
    if (currentTickets < amount) return false;
    setProfile(current => {
      const tickets = current.pvpTickets !== undefined ? current.pvpTickets : (current.pvpEnergy || 0);
      if (tickets < amount) return current;
      const updated = { 
        ...current, 
        pvpTickets: Math.max(0, tickets - amount),
        pvpEnergy: Math.max(0, tickets - amount)
      };
      saveProfile(updated);
      return updated;
    });
    return true;
  };

  const buyPvpTickets = async (ticketCount: number = 5): Promise<boolean> => {
    const res = await submitAction('buy_pvp_tickets', { ticketCount });
    if (res.success && res.profile) {
      setProfile(res.profile);
      saveProfile(res.profile);
    }
    return res.success;
  };

  const buyPveEnergy = async (energyCount: number = 10): Promise<boolean> => {
    const res = await submitAction('buy_pve_energy', { energyCount });
    if (res.success && res.profile) {
      setProfile(res.profile);
      saveProfile(res.profile);
    }
    return res.success;
  };

  // Buy Shards using SOL (Legacy alias)
  const buyDarkShardsWithSOL = async (solAmount: number): Promise<boolean> => {
    const res = await submitAction('buy_shards', { solAmount });
    return res.success;
  };

  // Verify real on-chain Solana payment
  const verifySolanaPayment = async (signature: string, packageId: string): Promise<{ success: boolean; message: string }> => {
    const token = localStorage.getItem('void_covenant_token');
    if (!token) return { success: false, message: 'Authentication required.' };

    try {
      const res = await fetch('/api/verify-solana-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ signature, packageId })
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('API response is not JSON:', text);
        return { success: false, message: `Server error (${res.status}): ${text.slice(0, 100)}` };
      }

      if (!res.ok) {
        return { success: false, message: data.error || `Payment verification failed (HTTP ${res.status}).` };
      }

      if (data.profile) {
        setProfile(migrateProfileTo10Cards(data.profile));
      }
      return { success: true, message: data.message || 'Payment verified!' };
    } catch (err: any) {
      console.error('Verify payment error:', err);
      return { success: false, message: err.message || 'Network error during payment verification.' };
    }
  };

  // Connect Solana Wallet (Strict Server-Authoritative)
  const connectSolanaWallet = useCallback(async (address: string) => {
    setIsLoadingProfile(true);

    const token = localStorage.getItem('void_covenant_token');
    
    if (token) {
      try {
        // Fetch strictly from the backend to ensure a unique DB profile is created/returned
        const referrer = localStorage.getItem('void_covenant_referrer') || undefined;
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ referrer })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            let serverProfile = calculateEnergy(data.profile);
            
            // Only force username/registered if they are actually registered, or let the UI handle it
            if (!serverProfile.username && serverProfile.isRegistered) {
              serverProfile.username = `Lord_${address.slice(0, 4)}`;
            }
            serverProfile.solBalance = 12.5;

            setProfile(migrateProfileTo10Cards(serverProfile));
            setIsLoadingProfile(false);
            return;
          }
        } else {
          console.error(`Sync API returned ${res.status}: ${await res.text()}`);
        }
      } catch (err) {
        console.error('Failed to connect to authoritative server', err);
      }
    }

    // If server fails or no token, disconnect to prevent infinite syncing loop
    console.error('Disconnecting due to server sync failure.');
    setProfile(createDefaultProfile());
    setIsLoadingProfile(false);
    // Remove invalid token
    localStorage.removeItem('void_covenant_token');
  }, []);

  // Disconnect Solana Wallet
  const disconnectSolanaWallet = useCallback(() => {
    setProfile(createDefaultProfile());
  }, []);

  const registerPlayer = async (username: string, avatarUrl: string): Promise<{ success: boolean; message: string }> => {
    const token = localStorage.getItem('void_covenant_token');
    if (!token) return { success: false, message: 'Not authenticated. Connect wallet first.' };

    try {
      const updatedProfile = {
        ...profile,
        username,
        avatarUrl,
        isRegistered: true
      };

      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ safeProfileData: updatedProfile })
      });

      if (!res.ok) {
        const errorText = await res.text();
        let parsedError = 'Registration failed';
        try {
          parsedError = JSON.parse(errorText).error || parsedError;
        } catch (e) {}
        return { success: false, message: parsedError };
      }

      const data = await res.json();
      if (data.profile) {
        setProfile(migrateProfileTo10Cards(calculateEnergy(data.profile)));
        return { success: true, message: 'Pact sealed successfully!' };
      }
      return { success: false, message: 'Server did not return updated profile' };
    } catch (e: any) {
      console.error('Registration failed:', e);
      return { success: false, message: e.message || 'Network error during registration' };
    }
  };

  const logoutPlayer = () => {
    setProfile(createDefaultProfile());
  };

  // Add a Card to player collection from template
  const addCardToCollection = (cardTemplate: CardTemplate, level: number = 1): Card => {
    const newCard = createCardInstance(cardTemplate, level);
    setProfile(current => {
      const updated = {
        ...current,
        collection: [...current.collection, newCard]
      };
      saveProfile(updated);
      return updated;
    });
    return newCard;
  };

  const fuseCards = async (cardId1: string, cardId2: string): Promise<{ success: boolean; message: string; newCard?: Card }> => {
    const token = localStorage.getItem('void_covenant_token');
    
    if (token) {
      try {
        const res = await fetch('/api/fusion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ cardId1, cardId2 })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.profile) setProfile(migrateProfileTo10Cards(data.profile));
          return {
            success: true,
            message: 'Fusion successful!',
            newCard: data.newCard
          };
        }
      } catch (err: any) {
        console.warn('Fusion API error, using local fallback:', err);
      }
    }

    // Local Fusion Fallback (100% Guaranteed Success)
    let newCard: Card | undefined = undefined;
    let errorMsg = '';

    setProfile(current => {
      const card1 = current.collection.find(c => c.id === cardId1);
      const card2 = current.collection.find(c => c.id === cardId2);

      if (!card1 || !card2) {
        errorMsg = 'One or both cards not found in your collection.';
        return current;
      }

      if (card1.baseId !== card2.baseId) {
        errorMsg = 'Cards must be identical base entity type to fuse!';
        return current;
      }

      const template = CARD_TEMPLATES.find(t => t.baseId === card1.baseId);
      if (!template) {
        errorMsg = `Card template definition not found for ${card1.baseId}.`;
        return current;
      }

      const { goldCost, dustCost, shardsCost, isLevelUpgrade } = getFusionCosts(card1);

      if ((current.gold || 0) < goldCost) {
        errorMsg = `Not enough gold. Required: ${goldCost}`;
        return current;
      }
      if ((current.dust || 0) < dustCost) {
        errorMsg = `Not enough dust. Required: ${dustCost}`;
        return current;
      }
      if (shardsCost > 0 && (current.darkShards || 0) < shardsCost) {
        errorMsg = `Not enough Dark Shards. Required: ${shardsCost}`;
        return current;
      }

      if (!isLevelUpgrade && card1.tier === 'legendary') {
        errorMsg = 'Card is already at Legendary tier and cannot evolve further.';
        return current;
      }

      if (isLevelUpgrade) {
        const nextLevel = card1.level + 1;
        newCard = {
          ...card1,
          id: card1.id,
          level: nextLevel,
          attack: Math.round(card1.attack * 1.15),
          health: Math.round(card1.health * 1.15),
          maxHealth: Math.round(card1.health * 1.15)
        };
        const template = CARD_TEMPLATES.find(t => t.baseId === card1.baseId);
        if (template) {
          newCard.skills = card1.skills.map(skill => {
            const skillTemplate = template.skills.find(s => s.type === skill.type);
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
        let nextTier: CardTier = 'silver';
        if (card1.tier === 'bronze') nextTier = 'silver';
        else if (card1.tier === 'silver') nextTier = 'gold';
        else if (card1.tier === 'gold') nextTier = 'legendary';

        newCard = {
          ...card1,
          id: card1.id,
          tier: nextTier,
          level: 1,
          attack: Math.round(card1.attack * 1.25),
          health: Math.round(card1.health * 1.25),
          maxHealth: Math.round(card1.health * 1.25),
          delay: Math.max(1, card1.delay - 1),
          manaCost: getCardManaCost({ ...card1, tier: nextTier, delay: Math.max(1, card1.delay - 1) }),
          skills: [...(card1.skills || [])]
        };

        const bonusSkill = getEvolutionBonusSkill(card1.skills || [], nextTier);
        if (bonusSkill) {
          newCard.skills.push(bonusSkill);
        }
      }

      // Remove fused source cards and add new evolved card
      const filteredCollection = current.collection.filter(c => c.id !== cardId1 && c.id !== cardId2);
      const newCollection = [...filteredCollection, newCard];

      // Update battle deck if fused cards were equipped
      let updatedDeck = [...current.deck];
      if (updatedDeck.includes(cardId1) || updatedDeck.includes(cardId2)) {
        updatedDeck = updatedDeck.filter(id => id !== cardId1 && id !== cardId2);
        if (updatedDeck.length < 5 && newCard) {
          updatedDeck.push(newCard.id);
        }
      }

      let updated = {
        ...current,
        gold: (current.gold || 0) - goldCost,
        dust: (current.dust || 0) - dustCost,
        collection: newCollection,
        deck: updatedDeck
      };

      if (shardsCost > 0) {
        updated = recordShardTransaction(
          updated,
          'FUSION_TIER_ASCENSION',
          -shardsCost,
          `Tier evolution ritual: ${card1.name} (L5 ${card1.tier} ➔ L1 ${newCard?.tier})`,
          { card1Id, card2Id, newCardId: newCard?.id, targetTier: newCard?.tier }
        );
      }

      saveProfile(updated);
      return updated;
    });

    if (errorMsg) return { success: false, message: errorMsg };
    return { success: true, message: `Fusion successful!`, newCard };
  };

  const submitBattleResult = async (battleType: 'campaign' | 'pvp', stageId: string, result: 'win' | 'loss', stars?: number) => {
    const token = localStorage.getItem('void_covenant_token');
    
    if (token) {
      try {
        const res = await fetch('/api/battle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ battleType, stageId, result, stars })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.profile) setProfile(migrateProfileTo10Cards(data.profile));
          return { 
            success: true, 
            message: 'Rewards claimed successfully', 
            sovereignsReward: data.sovereignsReward || 0,
            rewards: {
              gold: data.goldReward,
              dust: data.dustReward,
              exp: data.expReward,
              shards: data.shardsReward,
              sovereigns: data.sovereignsReward || 0,
              card: data.cardReward
            },
            ...data
          };
        }
      } catch (err: any) {
        console.warn('Battle API error, using local fallback:', err);
      }
    }

    // Local calculation fallback (100% Guaranteed Success)
    let rewards: any = { gold: 0, dust: 0, exp: 0, shards: 0, sovereigns: 0 };
    setProfile(current => {
      const updated = { ...current };
      const floorNum = parseInt(stageId) || 1;

      const isSubActive = updated.subscriptionExpiresAt && Number(updated.subscriptionExpiresAt) > Date.now();
      const subTier = isSubActive ? (updated.subscriptionTier || 'free') : 'free';
      let goldMultiplier = 1;
      if (subTier === 'ultra') {
        goldMultiplier += 0.50;
      } else if (subTier === 'premium') {
        goldMultiplier += 0.25;
      }

      let expMultiplier = 1;
      if (updated.equipped && updated.equipment) {
        Object.values(updated.equipped).forEach(eqId => {
          const eq = updated.equipment?.find((e: any) => e.id === eqId);
          if (eq && eq.bonusType === 'goldBonus') goldMultiplier += (eq.bonusValue / 100);
          if (eq && eq.bonusType === 'expBonus') expMultiplier += (eq.bonusValue / 100);
        });
      }

      const applyMult = (baseVal: number, mult: number) => {
        if (mult <= 1 || baseVal <= 0) return Math.round(baseVal);
        return baseVal + Math.max(1, Math.round(baseVal * (mult - 1)));
      };

      if (result === 'win') {
        if (battleType === 'pvp') {
          const baseGold = 50;
          const baseDust = 25;
          rewards.gold = applyMult(baseGold, goldMultiplier);
          rewards.dust = baseDust;
          rewards.exp = applyMult(100, expMultiplier);
          updated.pvpLP = (updated.pvpLP || 0) + 20;

          // Check daily sovereigns quota
          const todayUtc = new Date().toISOString().slice(0, 10);
          if (updated.lastSovereignsWonDate !== todayUtc) {
            updated.dailySovereignsWonToday = 0;
            updated.lastSovereignsWonDate = todayUtc;
          }
          const currentWonToday = updated.dailySovereignsWonToday || 0;
          const cap = subTier === 'ultra' ? 24 : subTier === 'premium' ? 10 : 0;
          const perWin = subTier === 'ultra' ? 2 : subTier === 'premium' ? 1 : 0;
          const sovereignsGain = Math.max(0, Math.min(perWin, cap - currentWonToday));
          if (sovereignsGain > 0) {
            updated.dailySovereignsWonToday = currentWonToday + sovereignsGain;
            updated.bloodSovereigns = (updated.bloodSovereigns || 0) + sovereignsGain;
            rewards.sovereigns = sovereignsGain;
          }
        } else {
          const floorStep = Math.floor(floorNum / 5);
          const baseGold = 50 + (floorStep * 25);
          const baseDust = 25 + (floorStep * 10);
          const baseExp = floorNum * 16 + 32;
          rewards.gold = applyMult(baseGold, goldMultiplier);
          rewards.dust = baseDust;
          rewards.exp = applyMult(baseExp, expMultiplier);

          if (floorNum >= (updated.pveProgress || 1)) {
            updated.pveProgress = floorNum + 1;
          }

          if (stars && stars > 0) {
            updated.campaignStars = updated.campaignStars || {};
            const curStars = updated.campaignStars[stageId] || 0;
            if (stars > curStars) {
              updated.campaignStars[stageId] = stars;
            }
          }
        }

        updated.gold = (updated.gold || 0) + rewards.gold;
        updated.dust = (updated.dust || 0) + rewards.dust;
        if (rewards.exp > 0 && updated.level < 100) {
          let curExp = (updated.exp || 0) + rewards.exp;
          let curLevel = updated.level || 1;
          let curHealth = updated.heroMaxHealth || 30;
          let req = getRequiredExpForLevel(curLevel);
          while (curExp >= req && curLevel < 100) {
            curExp -= req;
            curLevel++;
            curHealth += 2;
            req = getRequiredExpForLevel(curLevel);
          }
          if (curLevel >= 100) curExp = 0;
          updated.exp = curExp;
          updated.level = curLevel;
          updated.heroMaxHealth = curHealth;
        }
      } else {
        rewards.gold = applyMult(20, goldMultiplier);
        rewards.dust = 0;
        rewards.exp = 0;
        updated.gold = (updated.gold || 0) + rewards.gold;
      }

      saveProfile(updated);
      return updated;
    });

    return { success: true, message: 'Rewards claimed successfully!', rewards, sovereignsReward: rewards.sovereigns };
  };

  const submitAction = async (action: string, payload: any) => {
    const token = localStorage.getItem('void_covenant_token');
    
    if (token) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        const res = await fetch('/api/action', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ action, payload }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data.profile) setProfile(migrateProfileTo10Cards(data.profile));
          return { success: true, message: data.message, data, ...data };
        } else {
          const errData = await res.json().catch(() => ({}));
          return { success: false, message: errData.error || 'Server request failed', error: errData.error };
        }
      } catch (err: any) {
        console.warn('Action API error, using local fallback:', err);
      }
    }

    // Local fallback for sweep_stage
    if (action === 'sweep_stage') {
      const floorNum = payload?.floorNum || 1;
      let msg = '';
      setProfile(current => {
        const updated = { ...current };
        const goldReward = 50 + floorNum * 10;
        const dustReward = 10;
        
        updated.pveEnergy = Math.max(0, (updated.pveEnergy || 0) - (payload?.energyCost || 3));
        updated.gold = (updated.gold || 0) + goldReward;
        updated.dust = (updated.dust || 0) + dustReward;

        msg = `Fast sweep complete! +${goldReward} Gold & +${dustReward} Dust claimed!`;
        saveProfile(updated);
        return updated;
      });

      return { success: true, message: msg };
    }

    if (action === 'buy_pvp_tickets') {
      const ticketCount = payload?.ticketCount || 5;
      let ticketCost = 50;
      if (ticketCount === 1) ticketCost = 12;
      else if (ticketCount === 10) ticketCost = 90;
 
      let msg = '';
      let success = false;
      let updatedProfile: any = null;
 
      setProfile(current => {
        const currentShards = current.darkShards || 0;
        if (currentShards < ticketCost) {
          msg = `Not enough Dark Shards! Need ${ticketCost} shards.`;
          success = false;
          return current;
        }
        success = true;
        const currentBonus = current.pvpBonusTickets || 0;
        const newBonus = currentBonus + ticketCount;
        const dailyEnergy = current.pvpEnergy !== undefined ? current.pvpEnergy : 5;
        let updated = recordShardTransaction(
          current,
          'BUY_ARENA_TICKETS',
          -ticketCost,
          `Purchased ${ticketCount} Arena Tickets for ${ticketCost} Shards`,
          { ticketCount, ticketCost }
        );
        updated = { 
          ...updated,
          pvpBonusTickets: newBonus,
          pvpTickets: dailyEnergy + newBonus
        };
        msg = `Successfully purchased ${ticketCount} Arena Tickets for ${ticketCost} Shards!`;
        updatedProfile = updated;
        saveProfile(updated);
        return updated;
      });
 
      return { success, message: msg, profile: updatedProfile };
    }

    if (action === 'buy_subscription') {
      const { tier, durationDays } = payload || {};
      const PRICES: Record<string, Record<number, number>> = {
        premium: { 30: 150, 90: 400 },
        ultra: { 30: 350, 90: 900 }
      };
      const cost = PRICES[tier]?.[durationDays];
      let msg = '';
      let success = false;
      let updatedProfile: any = null;

      setProfile(current => {
        if ((current.darkShards || 0) < cost) {
          msg = `Insufficient Dark Shards! Need ${cost} Shards.`;
          success = false;
          return current;
        }

        const durationMs = (durationDays || 30) * 24 * 60 * 60 * 1000;
        const isCurrentActive = current.subscriptionExpiresAt && current.subscriptionExpiresAt > Date.now();
        const newExpiresAt = (isCurrentActive && current.subscriptionTier === tier)
          ? (current.subscriptionExpiresAt || Date.now()) + durationMs
          : Date.now() + durationMs;

        let updated = recordShardTransaction(
          current,
          'BUY_SUBSCRIPTION',
          -cost,
          `Purchased ${tier.toUpperCase()} Subscription (${durationDays} Days)`,
          { tier, durationDays, cost }
        );

        updated.subscriptionTier = tier;
        updated.subscriptionExpiresAt = newExpiresAt;
        updated = calculateEnergy(updated);

        // Instantly restore energy and arena tickets to the new maximum limit!
        const limits = getTierLimits(tier);
        updated.pveEnergy = Math.max(updated.pveEnergy || 0, limits.pveMax);
        updated.pveEnergyMax = limits.pveMax;
        updated.lastPveEnergyRefill = Date.now();

        updated.pvpEnergy = Math.max(updated.pvpEnergy || 0, limits.pvpMax);
        updated.pvpEnergyMax = limits.pvpMax;
        updated.lastPvpEnergyRefill = Date.now();
        updated.pvpTickets = updated.pvpEnergy + (updated.pvpBonusTickets || 0);

        // Immediately deliver today's daily tribute mail upon activating or extending pass if not yet delivered today
        const todayUtc = new Date().toISOString().slice(0, 10);
        if (updated.lastDailySubscriptionMail !== todayUtc) {
          const isUltra = tier === 'ultra';
          const gold = isUltra ? 3000 : 1000;
          const dust = isUltra ? 400 : 150;
          const shieldType = isUltra ? '6h' : '3h';
          const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          const dailyMail = {
            id: `mail_sub_${todayUtc}_${(updated.solanaAddress || 'guest').slice(-4)}_${uniqueSuffix}`,
            title: isUltra ? '💎 Daily Ultra Overlord Tribute' : '⚜️ Daily Premium Tribute',
            sender: 'Imperial Treasury',
            body: `Hail, Lord ${updated.username || 'Voidwalker'}!\n\nYour imperial covenant tribute for ${todayUtc} has arrived at your dominion:\n• +${gold.toLocaleString()} Gold\n• +${dust} Dark Dust\n• 1x ${shieldType} Void Aegis Shield\n\nClaim these resources to fortify your rank in the Abyss!`,
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
          updated.mailMessages = [dailyMail, ...(updated.mailMessages || [])].slice(0, 50);
          updated.lastDailySubscriptionMail = todayUtc;
        }

        msg = `${tier === 'ultra' ? '💎' : '⚜️'} Hail, Lord! You have unlocked the ${tier.toUpperCase()} Pass for ${durationDays} days! Energy & Tickets fully restored!`;
        success = true;
        updatedProfile = updated;
        saveProfile(updated);
        return updated;
      });

      return { success, message: msg, profile: updatedProfile };
    }

    if (action === 'claim_referral_sovereigns') {
      let claimedUnits = 0;
      let msg = '';
      let success = false;
      setProfile(current => {
        const unclaimed = current.referralSovereignsUnclaimed || 0;
        const wholeUnits = Math.floor(unclaimed);
        if (wholeUnits < 1) {
          msg = 'You need at least 1 whole Blood Sovereign to transfer to the Bank.';
          success = false;
          return current;
        }

        claimedUnits = wholeUnits;
        let updated = { ...current };
        updated.referralSovereignsUnclaimed = Number((unclaimed - wholeUnits).toFixed(2));
        updated = recordSovereignTransaction(
          updated,
          'REFERRAL_COMMISSION',
          wholeUnits,
          `Transferred ${wholeUnits} Blood Sovereigns from Referral Vault to Bank`,
          { transferredAmount: wholeUnits, remainingUnclaimed: updated.referralSovereignsUnclaimed }
        );
        msg = `Transferred ${wholeUnits} Blood Sovereigns to your Imperial Bank!`;
        success = true;
        saveProfile(updated);
        return updated;
      });
      return { success, message: msg, claimedSovereigns: claimedUnits };
    }

    if (action === 'activate_shield') {
      const { shieldType } = payload || {};
      if (!shieldType || !['3h', '6h', '12h'].includes(shieldType)) {
        return { success: false, message: 'Invalid shield type.' };
      }

      let msg = '';
      let success = false;
      let updatedProfile: any = null;

      setProfile(current => {
        if (current.activeShieldUntil && current.activeShieldUntil > Date.now()) {
          msg = 'A Peace Shield is already active!';
          success = false;
          return current;
        }

        const inv = current.shieldsInventory || { '3h': 0, '6h': 0, '12h': 0 };
        const count = inv[shieldType as '3h' | '6h' | '12h'] || 0;
        if (count < 1) {
          msg = `You do not have any ${shieldType} Void Shields in your inventory.`;
          success = false;
          return current;
        }

        const hours = shieldType === '12h' ? 12 : shieldType === '6h' ? 6 : 3;
        const durationMs = hours * 3600 * 1000;
        const newInv = { ...inv, [shieldType]: count - 1 };

        const updated = {
          ...current,
          shieldsInventory: newInv,
          activeShieldUntil: Date.now() + durationMs
        };

        msg = `🛡️ Void Aegis activated! Your territory is immune to Arena attacks for ${hours} hours.`;
        success = true;
        updatedProfile = updated;
        saveProfile(updated);
        return updated;
      });

      return { success, message: msg, profile: updatedProfile };
    }

    if (action === 'buy_shield') {
      const { shieldType } = payload || {};
      if (!shieldType || !['3h', '6h', '12h'].includes(shieldType)) {
        return { success: false, message: 'Invalid shield type.' };
      }

      const SHIELD_PRICES: Record<string, number> = {
        '3h': 8,
        '6h': 15,
        '12h': 25
      };
      const cost = SHIELD_PRICES[shieldType];

      let msg = '';
      let success = false;
      let updatedProfile: any = null;

      setProfile(current => {
        if ((current.darkShards || 0) < cost) {
          msg = `Insufficient Dark Shards! Need ${cost} Shards, you have ${current.darkShards || 0}.`;
          success = false;
          return current;
        }

        const inv = current.shieldsInventory || { '3h': 0, '6h': 0, '12h': 0 };
        const newInv = { ...inv, [shieldType]: (inv[shieldType as '3h' | '6h' | '12h'] || 0) + 1 };

        let updated = recordShardTransaction(
          current,
          'BUY_SHIELD',
          -cost,
          `Purchased ${shieldType} Void Aegis for ${cost} Dark Shards`,
          { shieldType, cost }
        );

        updated = {
          ...updated,
          shieldsInventory: newInv
        };

        msg = `🛡️ Purchased 1x ${shieldType} Void Aegis Shield!`;
        success = true;
        updatedProfile = updated;
        saveProfile(updated);
        return updated;
      });

      return { success, message: msg, profile: updatedProfile };
    }

    return { success: true, message: 'Action saved locally.' };
  };

  // Add / Remove card in the battle deck (max 5 cards in deck)
  const toggleDeckCard = (cardId: string): { success: boolean; message: string } => {
    // Self-heal ghost cards
    const validDeck = profile.deck.filter(id => profile.collection.some(c => c.id === id));
    const isCurrentlyInDeck = validDeck.includes(cardId);
    
    if (isCurrentlyInDeck) {
      // Remove from deck. Ensure they have at least 1 card in deck!
      if (validDeck.length <= 1) {
        return { success: false, message: 'Deck cannot be empty. Select at least 1 card.' };
      }
      
      const updated = {
        ...profile,
        deck: validDeck.filter(id => id !== cardId)
      };
      saveProfile(updated);
      return { success: true, message: 'Card removed from battle deck.' };
    } else {
      // Add to deck. Check max 10 limit.
      if (validDeck.length >= 10) {
        return { success: false, message: 'Maximum 10 cards in deck. Remove a card first.' };
      }
      
      const updated = {
        ...profile,
        deck: [...validDeck, cardId]
      };
      saveProfile(updated);
      return { success: true, message: 'Card added to battle deck!' };
    }
  };

  // Complete Airdrop / social tasks
  const completeAirdropTask = async (taskId: string): Promise<{ success: boolean; message: string }> => {
    return submitAction('airdrop_task', { taskId });
  };

  // Sync profile cards with new images if updated
  useEffect(() => {
    let updated = false;
    const newCollection = profile.collection.map(card => {
      const template = CARD_TEMPLATES.find(t => t.baseId === card.baseId);
      if (template && template.image !== card.image) {
        updated = true;
        return { ...card, image: template.image };
      }
      return card;
    });

    if (updated) {
        const updatedProfile = { ...profile, collection: newCollection };
        setProfile(updatedProfile);
        // Do not call saveProfile here to avoid OCC conflicts right after gacha
      }
  }, [profile.collection.length]); // Only run on mount or length change

  const resetProfile = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    window.location.reload();
  };

  const updateProfile = (updates: Partial<PlayerProfile>) => {
    setProfile(current => {
      const updated = { ...current, ...updates };
      saveProfile(updated);
      return updated;
    });
  };

  // Admin Methods
  const fetchAdminOverview = async () => {
    return submitAction('admin_get_overview', {});
  };

  const fetchAdminWithdrawals = async () => {
    return submitAction('admin_get_withdrawals', {});
  };

  const processAdminWithdrawal = async (requestId: string, userWallet: string, decision: 'approve' | 'reject', txid?: string, reason?: string) => {
    return submitAction('admin_process_withdrawal', { requestId, userWallet, decision, txid, reason });
  };

  const broadcastAdminMail = async (targetType: string, targetValue: string, title: string, content: string, rewards?: any) => {
    return submitAction('admin_broadcast_mail', { targetType, targetValue, title, content, rewards });
  };

  const searchAdminPlayer = async (query: string) => {
    return submitAction('admin_search_player', { query });
  };

  const modifyAdminPlayer = async (targetWallet: string, updates: any) => {
    return submitAction('admin_modify_player', { targetWallet, updates });
  };

  const deleteAdminPlayer = async (targetWallet: string) => {
    return submitAction('admin_delete_player', { targetWallet });
  };

  const triggerAdminRollover = async () => {
    return submitAction('admin_trigger_rollover', {});
  };

  const [leagueRewardsConfig, setLeagueRewardsConfig] = useState<any[]>(ALL_LEAGUE_REWARDS);

  const fetchLeagueRewardsConfig = useCallback(async () => {
    try {
      const res = await submitAction('get_league_rewards', {});
      if (res.success && res.config && Array.isArray(res.config)) {
        setLeagueRewardsConfig(res.config);
      }
    } catch (e) {
      console.warn('Failed to fetch league rewards config:', e);
    }
  }, []);

  useEffect(() => {
    fetchLeagueRewardsConfig();
  }, [fetchLeagueRewardsConfig]);

  const fetchAdminLeagueRewards = async () => {
    return submitAction('admin_get_league_rewards', {});
  };

  const saveAdminLeagueRewards = async (config: any[]) => {
    const res = await submitAction('admin_save_league_rewards', { config });
    if (res.success && config) {
      setLeagueRewardsConfig(config);
    }
    return res;
  };

  const resetAdminLeagueRewards = async () => {
    const res = await submitAction('admin_reset_league_rewards', {});
    if (res.success && res.config) {
      setLeagueRewardsConfig(res.config);
    }
    return res;
  };

  const buySubscription = async (tier: 'premium' | 'ultra', durationDays: 30 | 90) => {
    return await submitAction('buy_subscription', { tier, durationDays });
  };

  const claimDailySubscription = async () => {
    return await submitAction('claim_daily_subscription', {});
  };

  const activateShield = async (shieldType: '3h' | '6h' | '12h') => {
    return await submitAction('activate_shield', { shieldType });
  };

  const buyShield = async (shieldType: '3h' | '6h' | '12h') => {
    return await submitAction('buy_shield', { shieldType });
  };

  const claimReferralSovereigns = async () => {
    return await submitAction('claim_referral_sovereigns', {});
  };

  return (
    <GameContext.Provider
      value={{
        profile,
        isLoadingProfile,
        setProfile,
        saveProfile,
        addGold,
        addDust,
        addShards,
        addBloodSovereigns,
        spendGold,
        spendDust,
        spendShards,
        spendBloodSovereigns,
        requestWithdrawal,
        buySubscription,
        claimDailySubscription,
        activateShield,
        buyShield,
        claimReferralSovereigns,
        usePveEnergy,
        usePvpEnergy,
        buyPvpTickets,
        buyPveEnergy,
        startBattleOnServer,
        buyDarkShardsWithSOL,
        verifySolanaPayment,
        connectSolanaWallet,
        disconnectSolanaWallet,
        fuseCards,
        submitBattleResult,
        submitAction,
        addCardToCollection,
        toggleDeckCard,
        completeAirdropTask,
        addExp,
        addCampaignStars,
        addEquipment,
        equipItem,
        unequipItem,
        registerPlayer,
        logoutPlayer,
        resetProfile,
        updateProfile,
        markMailAsRead,
        deleteMail,
        claimMailReward,
        claimAllMailRewards,
        fetchAdminOverview,
        fetchAdminWithdrawals,
        processAdminWithdrawal,
        broadcastAdminMail,
        searchAdminPlayer,
        modifyAdminPlayer,
        deleteAdminPlayer,
        triggerAdminRollover,
        leagueRewardsConfig,
        setLeagueRewardsConfig,
        fetchLeagueRewardsConfig,
        fetchAdminLeagueRewards,
        saveAdminLeagueRewards,
        resetAdminLeagueRewards,
        isShardsShopOpen,
        setIsShardsShopOpen,
        refreshProfile,
        hasNewDefenseAttacks,
        markDefenseHistoryAsViewed
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
