import { PlayerProfile } from '../types';

export function calculateEnergy(profile: PlayerProfile): PlayerProfile {
  if (!profile) return profile;
  
  const now = Date.now();
  const pveMax = profile.pveEnergyMax || 10;
  const pvpMax = profile.pvpEnergyMax || 5;
  
  const lastPve = profile.lastPveEnergyRefill ?? profile.lastEnergyRefill ?? now;
  const lastPvp = profile.lastPvpEnergyRefill ?? profile.lastEnergyRefill ?? now;
  
  const pveRegenInterval = 20 * 60 * 1000; // 20 minutes (1200000 ms)
  const pvpRegenInterval = 15 * 60 * 1000; // 15 minutes (900000 ms)
  
  const timePassedPve = Math.max(0, now - lastPve);
  const timePassedPvp = Math.max(0, now - lastPvp);
  
  let currentPve = profile.pveEnergy !== undefined ? profile.pveEnergy : pveMax;
  let currentPvp = profile.pvpEnergy !== undefined ? profile.pvpEnergy : pvpMax;
  let newLastPve = lastPve;
  let newLastPvp = lastPvp;
  
  if (currentPve >= pveMax) {
    newLastPve = now;
  } else if (timePassedPve >= pveRegenInterval) {
    const gained = Math.floor(timePassedPve / pveRegenInterval);
    currentPve = Math.min(pveMax, currentPve + gained);
    newLastPve = now - (timePassedPve % pveRegenInterval);
  }
  
  // PVP TICKET NORMALIZATION & RESERVE MIGRATION
  let dailyEnergy = profile.pvpEnergy !== undefined ? profile.pvpEnergy : 5;
  let bonusTickets = profile.pvpBonusTickets !== undefined ? profile.pvpBonusTickets : 0;

  // If pvpEnergy exceeded 5 (due to legacy tickets), safely migrate excess to bonusTickets
  if (dailyEnergy > 5) {
    bonusTickets += (dailyEnergy - 5);
    dailyEnergy = 5;
  }

  // Ensure dailyEnergy is strictly bounded [0, 5]
  dailyEnergy = Math.max(0, Math.min(5, dailyEnergy));
  bonusTickets = Math.max(0, bonusTickets);

  profile.pveEnergy = currentPve;
  profile.pveEnergyMax = pveMax;
  profile.pvpEnergy = dailyEnergy;
  profile.pvpEnergyMax = 5;
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
