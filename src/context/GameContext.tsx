import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Card, PlayerProfile, CampaignStage, BattlePassTier, CardTemplate, CardTier, Equipment, EquipmentSlot } from '../types';
import { getStarterDeck, CARD_TEMPLATES, createCardInstance, BATTLE_PASS_TIERS, AIRDROP_TASKS } from '../data/cards';
import { supabase } from '../utils/supabaseClient';

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
  buyDarkShardsWithSOL: (solAmount: number) => boolean;
  isLoadingProfile: boolean;
  connectSolanaWallet: (address: string) => Promise<void>;
  disconnectSolanaWallet: () => void;
  fuseCards: (cardId1: string, cardId2: string) => { success: boolean; message: string; newCard?: Card };
  addCardToCollection: (cardTemplate: CardTemplate, level?: number) => Card;
  toggleDeckCard: (cardId: string) => { success: boolean; message: string };
  claimBattlePassReward: (tierIndex: number, isPremium: boolean) => { success: boolean; message: string };
  completeAirdropTask: (taskId: string) => { success: boolean; message: string };
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

const createDefaultProfile = (): PlayerProfile => ({
  gold: 500,
  dust: 100,
  darkShards: 0,
  collection: getStarterDeck(),
  deck: getStarterDeck().slice(0, 5).map(c => c.id),
  pveEnergy: 10,
  pveEnergyMax: 10,
  pvpEnergy: 5,
  pvpEnergyMax: 5,
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
});

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
      
      supabase.from('profiles').upsert({
        wallet_address: newProfile.solanaAddress,
        username: newProfile.username || null,
        level: newProfile.level || 1,
        pvp_rating: newProfile.pvpRating || 100,
        data: newProfile,
        updated_at: new Date().toISOString()
      }).catch(err => console.error('Error saving to Supabase', err));
    }
  };

  // Passive Energy Regeneration over time
  useEffect(() => {
    const interval = setInterval(() => {
      setProfile(current => {
        const now = Date.now();
        
        const lastPve = current.lastPveEnergyRefill ?? current.lastEnergyRefill;
        const lastPvp = current.lastPvpEnergyRefill ?? current.lastEnergyRefill;
        
        const timePassedPve = now - lastPve;
        const timePassedPvp = now - lastPvp;
        
        let pveGained = 0;
        let pvpGained = 0;
        
        // 20 minutes per PvE energy (1,200,000 ms)
        const pveRegenTime = 1200000;
        // 15 minutes per PvP energy (900,000 ms)
        const pvpRegenTime = 900000;
        
        let newLastPve = lastPve;
        let newLastPvp = lastPvp;
        
        if (current.pveEnergy >= current.pveEnergyMax) {
          newLastPve = now;
        } else if (timePassedPve >= pveRegenTime) {
          pveGained = Math.floor(timePassedPve / pveRegenTime);
          newLastPve = now - (timePassedPve % pveRegenTime);
        }
        
        if (current.pvpEnergy >= current.pvpEnergyMax) {
          newLastPvp = now;
        } else if (timePassedPvp >= pvpRegenTime) {
          pvpGained = Math.floor(timePassedPvp / pvpRegenTime);
          newLastPvp = now - (timePassedPvp % pvpRegenTime);
        }
        
        if (pveGained > 0 || pvpGained > 0 || newLastPve !== lastPve || newLastPvp !== lastPvp) {
          const updatedProfile = {
            ...current,
            pveEnergy: Math.min(current.pveEnergyMax, current.pveEnergy + pveGained),
            pvpEnergy: Math.min(current.pvpEnergyMax, current.pvpEnergy + pvpGained),
            lastPveEnergyRefill: newLastPve,
            lastPvpEnergyRefill: newLastPvp
          };
          saveProfile(updatedProfile);
          return updatedProfile;
        }
        
        return current;
      });
    }, 15000); // Check every 15 seconds

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

  // Buy Shards using SOL
  const buyDarkShardsWithSOL = (solAmount: number): boolean => {
    const ref = profileRef.current;
    if (!ref.solanaAddress || !ref.solBalance || ref.solBalance < solAmount) return false;
    setProfile(current => {
      if (!current.solanaAddress || !current.solBalance || current.solBalance < solAmount) return current;
      const shardsBought = Math.round(solAmount * 50); // 1 SOL = 50 Shards
      const updated = {
        ...current,
        solBalance: Number((current.solBalance - solAmount).toFixed(4)),
        darkShards: current.darkShards + shardsBought
      };
      saveProfile(updated);
      return updated;
    });
    return true;
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
        loadedProfile = { ...loadedProfile, ...parsed, solanaAddress: address, solBalance: 12.5 };
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

  // Fusing: Combine two identical cards of same level & tier
  const fuseCards = (cardId1: string, cardId2: string): { success: boolean; message: string; newCard?: Card } => {
    let success = false;
    let message = '';
    let resultCard: Card | undefined;
    
    setProfile(current => {
      const card1 = current.collection.find(c => c.id === cardId1);
      const card2 = current.collection.find(c => c.id === cardId2);
      
      if (!card1 || !card2 || cardId1 === cardId2) {
        message = 'You must select two different cards.';
        return current;
      }
      
      if (card1.baseId !== card2.baseId) {
        message = 'Cards must have the same base creature.';
        return current;
      }
      
      if (card1.level !== card2.level) {
        message = 'Cards must be the same level.';
        return current;
      }
      
      if (card1.tier !== card2.tier) {
        message = 'Cards must be the same tier.';
        return current;
      }

      const isLevelUpgrade = card1.level < 5;
      
      // Fusing costs gold and dust dynamically
      const goldCost = isLevelUpgrade ? card1.level * 150 : 500;
      const dustCost = isLevelUpgrade ? card1.level * 20 : 100;
      
      if (current.gold < goldCost) {
        message = `Not enough gold for fusion. Required: ${goldCost} 🪙`;
        return current;
      }
      if (current.dust < dustCost) {
        message = `Not enough Dark Dust. Required: ${dustCost} 🔮`;
        return current;
      }
      
      let fusedCard: Card;

      if (isLevelUpgrade) {
        // LEVEL UP (e.g. 1 -> 2, 2 -> 3, 3 -> 4, 4 -> 5)
        const nextLevel = card1.level + 1;
        fusedCard = {
          ...card1,
          id: card1.id, // Retain ID of the first card to keep favorite status & deck slot
          level: nextLevel,
          attack: Math.round(card1.attack * 1.15),
          health: Math.round(card1.health * 1.15),
          maxHealth: Math.round(card1.health * 1.15)
        };

        // Scale skill values slightly with level
        const template = CARD_TEMPLATES.find(t => t.baseId === card1.baseId);
        if (template) {
          fusedCard.skills = card1.skills.map(skill => {
            const skillTemplate = template.skills.find(s => s.type === skill.type);
            const baseValue = skillTemplate ? skillTemplate.value : skill.value;
            const scaleFactor = 1 + Math.floor((nextLevel - 1) / 2) * 0.5; // +50% power every 2 levels
            const newValue = Math.round(baseValue * scaleFactor);
            return {
              ...skill,
              value: newValue,
              description: skill.description.replace(/\d+/, String(newValue))
            };
          });
        }
        
        success = true;
        message = `Fusion successful! ${card1.name} leveled up to L${nextLevel}!`;
      } else {
        // TIER UPGRADE (Level 5 -> Next Tier, Reset to Level 1)
        if (card1.tier === 'legendary') {
          message = 'Card is already at the highest tier (Legendary) and cannot be fused.';
          return current;
        }

        // Calculate next tier
        let nextTier: CardTier = 'bronze';
        if (card1.tier === 'bronze') nextTier = 'silver';
        else if (card1.tier === 'silver') nextTier = 'gold';
        else if (card1.tier === 'gold') nextTier = 'legendary';
        
        let template = CARD_TEMPLATES.find(t => t.baseId === card1.baseId);
        if (!template) {
          message = 'Card template not found.';
          return current;
        }
        
        success = true;
        message = `Fusion successful! Upgraded to higher tier: ${card1.name} [${nextTier.toUpperCase()}]`;
        
        // Instantiate new card of next tier, level 1
        fusedCard = createCardInstance(template, 1);
        fusedCard.id = card1.id; // Retain ID to preserve favorite status & deck slot
        fusedCard.tier = nextTier;
        
        // Boost fused card stats specifically
        fusedCard.attack = Math.round(card1.attack * 1.15); // +15% from max previous
        fusedCard.health = Math.round(card1.health * 1.15);
        fusedCard.maxHealth = fusedCard.health;
        
        // Enhance delay (reduction)
        fusedCard.delay = Math.max(1, card1.delay - 1); // Reduced delay is the ultimate reward!
        
        // Add a skill bonus for fusing
        if (nextTier === 'silver' && fusedCard.skills.length === 1) {
          fusedCard.skills.push({
            type: 'vampirism',
            value: 2,
            description: 'Vampirism: restores +2 HP on fusion.'
          });
        } else if (nextTier === 'gold') {
          fusedCard.skills.forEach(s => s.value += 2);
        } else if (nextTier === 'legendary') {
          fusedCard.skills.push({
            type: 'hex',
            value: 3,
            description: 'Legendary Hex: +3 to enemy incoming damage.'
          });
        }
      }
      
      // Remove both cards (but note that fusedCard keeps cardId1 so we will append fusedCard)
      const newCollection = current.collection.filter(c => c.id !== cardId1 && c.id !== cardId2);
      newCollection.push(fusedCard);
      
      // Clean up combat deck
      // Card 2 is consumed, so it must be removed.
      // Card 1 is upgraded and keeps its ID, so it can stay.
      const newDeck = current.deck.filter(id => id !== cardId2);
      
      resultCard = fusedCard;
      
      const updated = {
        ...current,
        gold: current.gold - goldCost,
        dust: current.dust - dustCost,
        collection: newCollection,
        deck: newDeck
      };
      saveProfile(updated);
      return updated;
    });
    
    return { success, message, newCard: resultCard };
  };

  // Add / Remove card in the battle deck (max 5 cards in deck)
  const toggleDeckCard = (cardId: string): { success: boolean; message: string } => {
    let success = false;
    let message = '';
    
    setProfile(current => {
      const isCurrentlyInDeck = current.deck.includes(cardId);
      
      if (isCurrentlyInDeck) {
        // Remove from deck. Ensure they have at least 1 card in deck!
        if (current.deck.length <= 1) {
          message = 'Deck cannot be empty. Select at least 1 card.';
          return current;
        }
        success = true;
        message = 'Card removed from battle deck.';
        const updated = {
          ...current,
          deck: current.deck.filter(id => id !== cardId)
        };
        saveProfile(updated);
        return updated;
      } else {
        // Add to deck. Check max 5 limit.
        if (current.deck.length >= 5) {
          message = 'Maximum 5 cards in deck. Remove a card first.';
          return current;
        }
        success = true;
        message = 'Card added to battle deck!';
        const updated = {
          ...current,
          deck: [...current.deck, cardId]
        };
        saveProfile(updated);
        return updated;
      }
    });
    
    return { success, message };
  };

  // Claim Battle Pass Tier reward
  const claimBattlePassReward = (tierIndex: number, isPremium: boolean): { success: boolean; message: string } => {
    let success = false;
    let message = '';
    const tier = BATTLE_PASS_TIERS[tierIndex];
    
    setProfile(current => {
      if (current.battlePassPoints < tier.pointsRequired) {
        message = 'Not enough Battle Pass points.';
        return current;
      }
      
      const claimId = tierIndex * 2 + (isPremium ? 1 : 0);
      if (current.battlePassClaimed.includes(claimId)) {
        message = 'Reward already claimed.';
        return current;
      }
      
      success = true;
      const rewardType = isPremium ? tier.premiumRewardType : tier.freeRewardType;
      const rewardAmount = isPremium ? tier.premiumRewardAmount : tier.freeRewardAmount;
      
      let updatedGold = current.gold;
      let updatedDust = current.dust;
      let updatedShards = current.darkShards;
      let updatedCollection = [...current.collection];
      let pveEnergy = current.pveEnergy;
      
      if (rewardType === 'gold') {
        updatedGold += rewardAmount;
        message = `Received ${rewardAmount} 🪙 Gold!`;
      } else if (rewardType === 'dust') {
        updatedDust += rewardAmount;
        message = `Received ${rewardAmount} 🔮 Dark Dust!`;
      } else if (rewardType === 'shards') {
        updatedShards += rewardAmount;
        message = `Received ${rewardAmount} 💎 Dark Shards!`;
      } else if (rewardType === 'card' || rewardType === 'legendary_pack') {
        // Instantiate a rare card template
        const rareTemplates = CARD_TEMPLATES.filter(t => t.tier === 'silver' || t.tier === 'gold');
        const randomTemplate = rareTemplates[Math.floor(Math.random() * rareTemplates.length)];
        const newCard = createCardInstance(randomTemplate, 1);
        updatedCollection.push(newCard);
        message = `Received a unique card: ${newCard.name} [${newCard.tier.toUpperCase()}]!`;
      }
      
      const updated = {
        ...current,
        gold: updatedGold,
        dust: updatedDust,
        darkShards: updatedShards,
        pveEnergy,
        collection: updatedCollection,
        battlePassClaimed: [...current.battlePassClaimed, claimId]
      };
      saveProfile(updated);
      return updated;
    });
    
    return { success, message };
  };

  const claimBattlePassTier = (index: number) => {
    // Wrapper/alias if needed for specific logic
  };

  // Complete Airdrop / social tasks
  const completeAirdropTask = (taskId: string): { success: boolean; message: string } => {
    let success = false;
    let message = '';
    
    setProfile(current => {
      if (current.completedTasks.includes(taskId)) {
        message = 'Task already completed.';
        return current;
      }
      
      const task = AIRDROP_TASKS.find(t => t.id === taskId);
      if (!task) {
        message = 'Task not found.';
        return current;
      }
      
      success = true;
      let updatedGold = current.gold;
      let updatedDust = current.dust;
      let updatedShards = current.darkShards;
      
      if (task.rewardType === 'gold') {
        updatedGold += task.rewardAmount;
        message = `Task completed! Reward: +${task.rewardAmount} 🪙 Gold.`;
      } else if (task.rewardType === 'dust') {
        updatedDust += task.rewardAmount;
        message = `Task completed! Reward: +${task.rewardAmount} 🔮 Dark Dust.`;
      } else if (task.rewardType === 'shards') {
        updatedShards += task.rewardAmount;
        message = `Task completed! Reward: +${task.rewardAmount} 💎 Dark Shards.`;
      }
      
      // If wallet connection task
      let walletAddress = current.solanaAddress;
      let walletBalance = current.solBalance;
      if (taskId === 'wallet_connect' && !walletAddress) {
        // Wallet connection handled externally via WalletContext
        // Just mark the task as completed
      }
      
      const updated = {
        ...current,
        gold: updatedGold,
        dust: updatedDust,
        darkShards: updatedShards,
        solanaAddress: walletAddress,
        solBalance: walletBalance,
        completedTasks: [...current.completedTasks, taskId]
      };
      saveProfile(updated);
      return updated;
    });
    
    return { success, message };
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
        connectSolanaWallet,
        disconnectSolanaWallet,
        fuseCards,
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
