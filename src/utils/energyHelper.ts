import { PlayerProfile } from '../types';

export function getActiveSubscriptionTier(profile: PlayerProfile): 'free' | 'premium' | 'ultra' {
  if (!profile || !profile.subscriptionExpiresAt) return 'free';
  if (profile.subscriptionExpiresAt <= Date.now()) return 'free';
  return profile.subscriptionTier || 'free';
}

export function getTierLimits(tier: 'free' | 'premium' | 'ultra') {
  if (tier === 'ultra') {
    return {
      pveMax: 20,
      pveRegenInterval: 20 * 60 * 1000, // 20 minutes
      pvpMax: 12
    };
  }
  if (tier === 'premium') {
    return {
      pveMax: 10,
      pveRegenInterval: 30 * 60 * 1000, // 30 minutes
      pvpMax: 8
    };
  }
  return {
    pveMax: 5,
    pveRegenInterval: 40 * 60 * 1000, // 40 minutes
    pvpMax: 5
  };
}

export function calculateEnergy(profile: PlayerProfile): PlayerProfile {
  if (!profile) return profile;
  
  const now = Date.now();
  const tier = getActiveSubscriptionTier(profile);
  const limits = getTierLimits(tier);
  const pveMax = limits.pveMax;
  const pvpMax = limits.pvpMax;
  const pveRegenInterval = limits.pveRegenInterval;
  
  const lastPve = profile.lastPveEnergyRefill ?? profile.lastEnergyRefill ?? now;
  const lastPvp = profile.lastPvpEnergyRefill ?? profile.lastEnergyRefill ?? now;
  
  const timePassedPve = Math.max(0, now - lastPve);
  
  let currentPve = profile.pveEnergy !== undefined ? profile.pveEnergy : pveMax;
  let newLastPve = lastPve;
  
  if (currentPve >= pveMax) {
    newLastPve = now;
  } else if (timePassedPve >= pveRegenInterval) {
    const gained = Math.floor(timePassedPve / pveRegenInterval);
    currentPve = Math.min(pveMax, currentPve + gained);
    newLastPve = now - (timePassedPve % pveRegenInterval);
  }
  
  // PVP TICKET NORMALIZATION & RESERVE MIGRATION
  let dailyEnergy = profile.pvpEnergy !== undefined ? profile.pvpEnergy : pvpMax;
  let bonusTickets = profile.pvpBonusTickets !== undefined ? profile.pvpBonusTickets : 0;

  // If pvpEnergy exceeded pvpMax (due to subscription tier change or legacy), safely migrate excess to bonusTickets
  if (dailyEnergy > pvpMax) {
    bonusTickets += (dailyEnergy - pvpMax);
    dailyEnergy = pvpMax;
  }

  // Ensure dailyEnergy is strictly bounded [0, pvpMax]
  dailyEnergy = Math.max(0, Math.min(pvpMax, dailyEnergy));
  bonusTickets = Math.max(0, bonusTickets);

  profile.pveEnergy = currentPve;
  profile.pveEnergyMax = pveMax;
  profile.pvpEnergy = dailyEnergy;
  profile.pvpEnergyMax = pvpMax;
  profile.pvpBonusTickets = bonusTickets;
  profile.pvpTickets = dailyEnergy + bonusTickets;
  profile.lastPveEnergyRefill = newLastPve;
  profile.lastPvpEnergyRefill = now;
  
  return profile;
}

export function getRequiredExpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.2, Math.max(1, level) - 1));
}

export function processExpGain(profile: PlayerProfile, expGained: number): { profile: PlayerProfile; leveledUp: boolean } {
  profile.exp = (profile.exp || 0) + expGained;
  let level = profile.level || 1;
  let heroMaxHealth = profile.heroMaxHealth || 30;
  let leveledUp = false;
  
  let required = getRequiredExpForLevel(level);
  while (profile.exp >= required) {
    profile.exp -= required;
    level += 1;
    heroMaxHealth += 2;
    leveledUp = true;
    required = getRequiredExpForLevel(level);
  }
  
  profile.level = level;
  profile.heroMaxHealth = heroMaxHealth;
  return { profile, leveledUp };
}
