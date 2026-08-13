import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Card, PlayerProfile, CampaignStage, BattlePassTier, CardTemplate, CardTier, Equipment, EquipmentSlot } from '../types';
import { getStarterDeck, CARD_TEMPLATES, createCardInstance, BATTLE_PASS_TIERS, AIRDROP_TASKS } from '../data/cards';
import { supabase } from '../utils/supabaseClient';
import { calculateEnergy } from '../utils/energyHelper';

interface GameContextType {
  profile: PlayerProfile;
  setProfile: React.Dispatch<React.SetStateAction<PlayerProfile>>;
  saveProfile: (newProfile: PlayerProfile) => void;
  addGold: (amount: number) => void;
  addDust: (amount: number) => void;
  addShards: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  spendDust: (amount: number) => boolean;
  spendShards: (amount: number) => boolean;
  soundOn: boolean;
  toggleSound: () => void;
  usePveEnergy: (amount: number) => boolean;
  usePvpEnergy: (amount: number) => boolean;
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
  claimBattlePassReward: (tierIndex: number, isPremium: boolean) => Promise<{ success: boolean; message: string }>;
  completeAirdropTask: (taskId: string) => Promise<{ success: boolean; message: string }>;
  addBattlePassPoints: (amount: number) => void;
  claimBattlePassTier: (index: number) => void;
  addExp: (amount: number) => void;
  addCampaignStars: (stageId: string, stars: number) => void;
  addEquipment: (equipment: Equipment) => void;
  equipItem: (slot: EquipmentSlot, equipmentId: string) => void;
  unequipItem: (slot: EquipmentSlot) => void;
  addReferral: () => void;
  registerPlayer: (username: string, avatarUrl: string) => void;
  logoutPlayer: () => void;
  resetProfile: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'void_covenant_profile_v1';

const createDefaultProfile = (): PlayerProfile => {
  const starterDeck = getStarterDeck();
  return {
  gold: 500,
  dust: 100,
  darkShards: 0,
  collection: starterDeck,
  deck: starterDeck.slice(0, 5).map(c => c.id),
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
  solanaAddress: null,
  solBalance: null,
  isPremiumBP: false,
  username: '',
  isRegistered: false
  };
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundOn, setSoundOn] = useState(false);

  const toggleSound = () => {
    const newVal = !soundOn;
    setSoundOn(newVal);
  };

  const [profile, setProfile] = useState<PlayerProfile>(createDefaultProfile);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Ref to track latest profile for synchronous reads in spend functions
  const profileRef = useRef(profile);
  useEffect(() => { profileRef.current = profile; }, [profile]);

  // Automatically save profile changes to localStorage and Supabase
  const saveProfile = (newProfile: PlayerProfile) => {
    if (newProfile.solanaAddress) {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_${newProfile.solanaAddress}`, JSON.stringify(newProfile));
      
      const token = localStorage.getItem('void_covenant_token');
      if (token) {
        fetch('/api/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ safeProfileData: newProfile })
        }).catch(err => console.error('Failed to sync profile', err));
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
    return Math.floor(100 * Math.pow(1.2, level - 1));
  };

  const addExp = (amount: number) => {
    setProfile(current => {
      let newExp = current.exp + amount;
      let newLevel = current.level;
      let newMaxHealth = current.heroMaxHealth;
      
      let required = getRequiredExpForLevel(newLevel);
      while (newExp >= required) {
        newExp -= required;
        newLevel++;
        // Lord gains 1-3 Max HP per level (randomized for flavor, or fixed to 2 to be fair, let's use +2)
        newMaxHealth += 2;
        required = getRequiredExpForLevel(newLevel);
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

  const addShards = (amount: number) => {
    setProfile(current => {
      const updated = { ...current, darkShards: current.darkShards + amount };
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

  const spendShards = (amount: number): boolean => {
    if (profileRef.current.darkShards < amount) return false;
    setProfile(current => {
      if (current.darkShards < amount) return current;
      const updated = { ...current, darkShards: current.darkShards - amount };
      saveProfile(updated);
      return updated;
    });
    return true;
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
    if (profileRef.current.pvpEnergy < amount) return false;
    setProfile(current => {
      if (current.pvpEnergy < amount) return current;
      const wasMax = current.pvpEnergy >= current.pvpEnergyMax;
      const updated = { 
        ...current, 
        pvpEnergy: current.pvpEnergy - amount,
        lastPvpEnergyRefill: wasMax ? Date.now() : (current.lastPvpEnergyRefill ?? current.lastEnergyRefill)
      };
      saveProfile(updated);
      return updated;
    });
    return true;
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
        setProfile(data.profile);
      }
      return { success: true, message: data.message || 'Payment verified!' };
    } catch (err: any) {
      console.error('Verify payment error:', err);
      return { success: false, message: err.message || 'Network error during payment verification.' };
    }
  };

  // Connect Solana Wallet
  const connectSolanaWallet = useCallback(async (address: string) => {
    setIsLoadingProfile(true);
    const specificKey = `${LOCAL_STORAGE_KEY}_${address}`;
    let loadedProfile = createDefaultProfile();
    loadedProfile.solanaAddress = address;
    loadedProfile.solBalance = 12.5;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('data')
        .eq('wallet_address', address)
        .single();
        
      if (data && data.data) {
        const parsed = data.data as PlayerProfile;
        if (parsed.heroMaxHealth && parsed.heroMaxHealth >= 100) {
          const levelUps = (parsed.level || 1) - 1;
          parsed.heroMaxHealth = 30 + (levelUps * 2);
        }
        
        // Sanitize deck to remove ghost cards
        if (parsed.deck && parsed.collection) {
          parsed.deck = parsed.deck.filter(id => parsed.collection.some(c => c.id === id));
        }

        loadedProfile = calculateEnergy({ ...loadedProfile, ...parsed, solanaAddress: address, solBalance: 12.5 });
        setProfile(loadedProfile);
        setIsLoadingProfile(false);
        return;
      }
    } catch (e) {
      console.warn('Profile not found in Supabase or network error, falling back to local storage', e);
    }

    const specificSaved = localStorage.getItem(specificKey);
    if (specificSaved) {
      try {
        const parsed = JSON.parse(specificSaved);
        if (parsed.heroMaxHealth && parsed.heroMaxHealth >= 100) {
          const levelUps = (parsed.level || 1) - 1;
          parsed.heroMaxHealth = 30 + (levelUps * 2);
        }
        
        // Sanitize deck to remove ghost cards
        if (parsed.deck && parsed.collection) {
          parsed.deck = parsed.deck.filter(id => parsed.collection.some(c => c.id === id));
        }
        
        loadedProfile = { ...loadedProfile, ...parsed, solanaAddress: address, solBalance: 12.5 };
      } catch (e) {
        console.error('Failed to parse specific wallet profile', e);
      }
    } else {
      // Try to migrate legacy profile if it matches this address or has no address
      const legacySaved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (legacySaved) {
        try {
          const parsed = JSON.parse(legacySaved);
          if (!parsed.solanaAddress || parsed.solanaAddress === address) {
            if (parsed.heroMaxHealth && parsed.heroMaxHealth >= 100) {
              const levelUps = (parsed.level || 1) - 1;
              parsed.heroMaxHealth = 30 + (levelUps * 2);
            }
            
            // Sanitize deck to remove ghost cards
            if (parsed.deck && parsed.collection) {
              parsed.deck = parsed.deck.filter(id => parsed.collection.some(c => c.id === id));
            }
            
            loadedProfile = { ...loadedProfile, ...parsed, solanaAddress: address, solBalance: 12.5 };
            
            // Save the migrated profile immediately and remove the legacy one to prevent copying it to other wallets
            localStorage.setItem(specificKey, JSON.stringify(loadedProfile));
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        } catch(e) {
          console.error('Failed to parse legacy profile', e);
        }
      }
    }

    loadedProfile = calculateEnergy(loadedProfile);
    setProfile(loadedProfile);
    setIsLoadingProfile(false);
  }, []);

  // Disconnect Solana Wallet
  const disconnectSolanaWallet = useCallback(() => {
    setProfile(createDefaultProfile());
  }, []);

  const registerPlayer = (username: string, avatarUrl: string) => {
    setProfile(current => {
      const updated = {
        ...current,
        username,
        avatarUrl,
        isRegistered: true
      };
      saveProfile(updated);
      return updated;
    });
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
    if (!token) return { success: false, message: 'Please authenticate first.' };

    try {
      const res = await fetch('/api/fusion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ cardId1, cardId2 })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Fusion failed.' };
      }

      setProfile(data.profile);

      return {
        success: true,
        message: 'Fusion successful!',
        newCard: data.newCard
      };
    } catch (err: any) {
      console.error('Fusion error:', err);
      return { success: false, message: 'Network error during fusion.' };
    }
  };

  const submitBattleResult = async (battleType: 'campaign' | 'pvp', stageId: string, result: 'win' | 'loss', stars?: number) => {
    const token = localStorage.getItem('void_covenant_token');
    if (!token) return { success: false, message: 'Not authenticated' };

    try {
      const res = await fetch('/api/battle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ battleType, stageId, result, stars })
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Battle rewards failed.' };
      }

      setProfile(data.profile);
      return { success: true, message: 'Rewards claimed successfully', rewards: data.rewards };
    } catch (err: any) {
      console.error('Battle API error:', err);
      return { success: false, message: 'Network error during battle reward claim.' };
    }
  };

  const submitAction = async (action: string, payload: any) => {
    const token = localStorage.getItem('void_covenant_token');
    if (!token) return { success: false, message: 'Not authenticated' };
    
    try {
      const res = await fetch('/api/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action, payload })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.error || 'Action failed.' };
      
      setProfile(data.profile);
      return { success: true, message: data.message, data };
    } catch (err: any) {
      console.error('Action API error:', err);
      return { success: false, message: 'Network error.' };
    }
  };

  // Add / Remove card in the battle deck (max 5 cards in deck)
  const toggleDeckCard = (cardId: string): { success: boolean; message: string } => {
    let success = false;
    let message = '';
    
    setProfile(current => {
      // Self-heal ghost cards
      const validDeck = current.deck.filter(id => current.collection.some(c => c.id === id));
      const isCurrentlyInDeck = validDeck.includes(cardId);
      
      if (isCurrentlyInDeck) {
        // Remove from deck. Ensure they have at least 1 card in deck!
        if (validDeck.length <= 1) {
          message = 'Deck cannot be empty. Select at least 1 card.';
          return { ...current, deck: validDeck };
        }
        success = true;
        message = 'Card removed from battle deck.';
        const updated = {
          ...current,
          deck: validDeck.filter(id => id !== cardId)
        };
        saveProfile(updated);
        return updated;
      } else {
        // Add to deck. Check max 5 limit.
        if (validDeck.length >= 5) {
          message = 'Maximum 5 cards in deck. Remove a card first.';
          return { ...current, deck: validDeck };
        }
        success = true;
        message = 'Card added to battle deck!';
        const updated = {
          ...current,
          deck: [...validDeck, cardId]
        };
        saveProfile(updated);
        return updated;
      }
    });
    
    return { success, message };
  };

  // Claim Battle Pass Tier reward
  const claimBattlePassReward = async (tierIndex: number, isPremium: boolean): Promise<{ success: boolean; message: string }> => {
    return submitAction('claim_battlepass', { tierIndex, isPremium });
  };

  const claimBattlePassTier = (index: number) => {
    // Wrapper/alias if needed for specific logic
  };

  // Complete Airdrop / social tasks
  const completeAirdropTask = async (taskId: string): Promise<{ success: boolean; message: string }> => {
    return submitAction('airdrop_task', { taskId });
  };

  // Battle pass points progression helper
  const addBattlePassPoints = (amount: number) => {
    setProfile(current => {
      const updated = {
        ...current,
        battlePassPoints: current.battlePassPoints + amount
      };
      saveProfile(updated);
      return updated;
    });
  };

  // Simulated referral sharing
  const addReferral = () => {
    setProfile(current => {
      const pointsReward = 80;
      const goldReward = 1000;
      
      const updated = {
        ...current,
        referralsCount: current.referralsCount + 1,
        gold: current.gold + goldReward,
        battlePassPoints: current.battlePassPoints + pointsReward
      };
      saveProfile(updated);
      return updated;
    });
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
      saveProfile(updatedProfile);
    }
  }, [profile.collection.length]); // Only run on mount or length change

  const resetProfile = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    window.location.reload();
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
        spendGold,
        spendDust,
        spendShards,
        soundOn,
        toggleSound,
        usePveEnergy,
        usePvpEnergy,
        buyDarkShardsWithSOL,
        verifySolanaPayment,
        connectSolanaWallet,
        disconnectSolanaWallet,
        fuseCards,
        submitBattleResult,
        submitAction,
        addCardToCollection,
        toggleDeckCard,
        claimBattlePassReward,
        completeAirdropTask,
        addBattlePassPoints,
        claimBattlePassTier,
        addExp,
        addCampaignStars,
        addEquipment,
        equipItem,
        unequipItem,
        addReferral,
        registerPlayer,
        logoutPlayer,
        resetProfile
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
