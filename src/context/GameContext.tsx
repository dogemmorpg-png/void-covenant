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
  startBattleOnServer: (battleType: 'campaign' | 'pvp', stageId: string, energyCost: number) => Promise<boolean>;
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
  updateProfile: (updates: Partial<PlayerProfile>) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'void_covenant_profile_v1';

const migrateProfileTo10Cards = (p: PlayerProfile): PlayerProfile => {
  if (!p) return p;
  if (!p.collection) p.collection = [];
  if (!p.deck) p.deck = [];
  
  // Filter out any cards whose baseId is no longer present in CARD_TEMPLATES (legacy versions)
  const validBaseIds = new Set(CARD_TEMPLATES.map(t => t.baseId));
  p.collection = p.collection.filter(c => validBaseIds.has(c.baseId));
  p.deck = p.deck.filter(cardId => p.collection.some(c => c.id === cardId));
  
  // Ensure all cards in collection have a manaCost
  p.collection = p.collection.map(c => {
    if (c.manaCost === undefined || c.manaCost === null) {
      const template = CARD_TEMPLATES.find(t => t.baseId === c.baseId);
      let manaCost = 1;
      if (template) {
        if (template.tier === 'silver') manaCost = 2;
        else if (template.tier === 'gold') manaCost = 3;
        else if (template.tier === 'legendary') manaCost = 4;
        else if (template.delay > 1) manaCost = 2;
      }
      return { ...c, manaCost };
    }
    return c;
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
  
  return p;
};

const createDefaultProfile = (): PlayerProfile => {
  const starterDeck = getStarterDeck();
  return {
  gold: 500,
  dust: 100,
  darkShards: 0,
  collection: starterDeck,
  deck: starterDeck.map(c => c.id), // All 10 starter cards
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

  // Automatically save profile settings to Supabase
  const saveProfile = (newProfile: PlayerProfile) => {
    setProfile(newProfile);
    if (newProfile.solanaAddress) {
      // Local storage is now ONLY used for token persistence, NOT for the profile itself
      const token = localStorage.getItem('void_covenant_token');
      if (token) {
        // Send safe profile updates to the server (e.g. deck, equipped, sound)
        fetch('/api/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ safeProfileData: newProfile })
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
    return Math.floor(100 * Math.pow(1.2, level - 1));
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

  const startBattleOnServer = async (battleType: 'campaign' | 'pvp', stageId: string, energyCost: number): Promise<boolean> => {
    const token = localStorage.getItem('void_covenant_token');
    
    if (token) {
      try {
        const res = await fetch('/api/battle-start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ battleType, stageId })
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

      const curLevel = card1.level || 1;
      const nextLevel = curLevel + 1;
      newCard = createCardInstance(template, nextLevel);

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

      const updated = {
        ...current,
        collection: newCollection,
        deck: updatedDeck
      };

      saveProfile(updated);
      return updated;
    });

    if (errorMsg) return { success: false, message: errorMsg };
    return { success: true, message: `Fusion successful! Evolved to level ${newCard?.level || 2}!`, newCard };
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
          return { success: true, message: 'Rewards claimed successfully', rewards: data.rewards };
        }
      } catch (err: any) {
        console.warn('Battle API error, using local fallback:', err);
      }
    }

    // Local calculation fallback (100% Guaranteed Success)
    let rewards: any = { gold: 0, dust: 0, exp: 0, shards: 0 };
    setProfile(current => {
      const updated = { ...current };
      const floorNum = parseInt(stageId) || 1;

      if (result === 'win') {
        rewards.gold = 50 + floorNum * 10;
        rewards.dust = 10;
        rewards.exp = 50;

        updated.gold = (updated.gold || 0) + rewards.gold;
        updated.dust = (updated.dust || 0) + rewards.dust;
        updated.exp = (updated.exp || 0) + rewards.exp;
        
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

        updated.battlePassPoints = (updated.battlePassPoints || 0) + 50;
      } else {
        rewards.gold = 20;
        updated.gold = (updated.gold || 0) + rewards.gold;
      }

      saveProfile(updated);
      return updated;
    });

    return { success: true, message: 'Rewards claimed successfully!', rewards };
  };

  const submitAction = async (action: string, payload: any) => {
    const token = localStorage.getItem('void_covenant_token');
    
    if (token) {
      try {
        const res = await fetch('/api/action', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ action, payload })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.profile) setProfile(migrateProfileTo10Cards(data.profile));
          return { success: true, message: data.message, data };
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
        updated.battlePassPoints = (updated.battlePassPoints || 0) + 50;

        msg = `Fast sweep complete! +${goldReward} Gold & +${dustReward} Dust claimed!`;
        saveProfile(updated);
        return updated;
      });

      return { success: true, message: msg };
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
        resetProfile,
        updateProfile
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
