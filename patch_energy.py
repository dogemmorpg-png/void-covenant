import os

# 1. Update types.ts
types_path = r"C:\Users\vaska\Desktop\void-covenant\src\types.ts"
with open(types_path, "r", encoding="utf-8") as f:
    types_content = f.read()

types_replacement = """  lastEnergyRefill: number; // timestamp
  lastPveEnergyRefill?: number;
  lastPvpEnergyRefill?: number;"""

if "  lastEnergyRefill: number; // timestamp" in types_content and "lastPveEnergyRefill" not in types_content:
    types_content = types_content.replace("  lastEnergyRefill: number; // timestamp", types_replacement)
    with open(types_path, "w", encoding="utf-8") as f:
        f.write(types_content)
    print("types.ts patched")

# 2. Update GameContext.tsx
gc_path = r"C:\Users\vaska\Desktop\void-covenant\src\context\GameContext.tsx"
with open(gc_path, "r", encoding="utf-8") as f:
    gc_content = f.read()

# Initial state
if "lastEnergyRefill: Date.now()," in gc_content and "lastPveEnergyRefill" not in gc_content:
    gc_content = gc_content.replace(
        "lastEnergyRefill: Date.now(),",
        "lastEnergyRefill: Date.now(),\n      lastPveEnergyRefill: Date.now(),\n      lastPvpEnergyRefill: Date.now(),"
    )

# Regen loop
old_regen = """  // Passive Energy Regeneration over time
  useEffect(() => {
    const interval = setInterval(() => {
      setProfile(current => {
        const now = Date.now();
        const timePassedMs = now - current.lastEnergyRefill;
        
        let pveGained = 0;
        let pvpGained = 0;
        
        // 20 minutes per PvE energy (1,200,000 ms)
        const pveRegenTime = 1200000;
        // 15 minutes per PvP energy (900,000 ms)
        const pvpRegenTime = 900000;
        
        let newLastRefill = current.lastEnergyRefill;
        
        if (timePassedMs >= pveRegenTime && current.pveEnergy < current.pveEnergyMax) {
          pveGained = Math.floor(timePassedMs / pveRegenTime);
          newLastRefill = now - (timePassedMs % pveRegenTime);
        }
        
        if (timePassedMs >= pvpRegenTime && current.pvpEnergy < current.pvpEnergyMax) {
          pvpGained = Math.floor(timePassedMs / pvpRegenTime);
          if (newLastRefill === current.lastEnergyRefill) {
            newLastRefill = now - (timePassedMs % pvpRegenTime);
          }
        }
        
        if (pveGained > 0 || pvpGained > 0) {
          const updatedProfile = {
            ...current,
            pveEnergy: Math.min(current.pveEnergyMax, current.pveEnergy + pveGained),
            pvpEnergy: Math.min(current.pvpEnergyMax, current.pvpEnergy + pvpGained),
            lastEnergyRefill: newLastRefill
          };
          saveProfile(updatedProfile);
          return updatedProfile;
        }
        
        return current;
      });
    }, 15000); // Check every 15 seconds"""

new_regen = """  // Passive Energy Regeneration over time
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
    }, 15000); // Check every 15 seconds"""

if old_regen in gc_content:
    gc_content = gc_content.replace(old_regen, new_regen)

# usePveEnergy / usePvpEnergy
old_use = """  const usePveEnergy = (amount: number): boolean => {
    if (profileRef.current.pveEnergy < amount) return false;
    setProfile(current => {
      if (current.pveEnergy < amount) return current;
      const updated = { ...current, pveEnergy: current.pveEnergy - amount };
      saveProfile(updated);
      return updated;
    });
    return true;
  };

  const usePvpEnergy = (amount: number): boolean => {
    if (profileRef.current.pvpEnergy < amount) return false;
    setProfile(current => {
      if (current.pvpEnergy < amount) return current;
      const updated = { ...current, pvpEnergy: current.pvpEnergy - amount };
      saveProfile(updated);
      return updated;
    });
    return true;
  };"""

new_use = """  const usePveEnergy = (amount: number): boolean => {
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
  };"""

if old_use in gc_content:
    gc_content = gc_content.replace(old_use, new_use)

with open(gc_path, "w", encoding="utf-8") as f:
    f.write(gc_content)

print("GameContext.tsx patched")
