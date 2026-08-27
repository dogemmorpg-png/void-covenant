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
    currentPve = pveMax;
  } else if (timePassedPve >= pveRegenInterval) {
    const gained = Math.floor(timePassedPve / pveRegenInterval);
    currentPve = Math.min(pveMax, currentPve + gained);
    newLastPve = now - (timePassedPve % pveRegenInterval);
  }
  
  if (profile.pvpEnergy === undefined) {
    profile.pvpEnergy = profile.pvpTickets !== undefined ? Math.min(5, profile.pvpTickets) : 5;
  }
  if (profile.pvpBonusTickets === undefined) {
    // Migrate any excess legacy tickets to bonus reserve
    if (profile.pvpTickets && profile.pvpTickets > 5) {
      profile.pvpBonusTickets = profile.pvpTickets - 5;
      profile.pvpEnergy = 5;
    } else {
      profile.pvpBonusTickets = 0;
    }
  }

  profile.pveEnergy = currentPve;
  profile.pveEnergyMax = pveMax;
  profile.pvpEnergyMax = 5;
  profile.pvpTickets = (profile.pvpEnergy || 0) + (profile.pvpBonusTickets || 0);
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
