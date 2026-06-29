import os

filepath = r"C:\Users\vaska\Desktop\void-covenant\src\components\HeaderHUD.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Fix import
if "import React from 'react';" in content:
    content = content.replace("import React from 'react';", "import React, { useState, useEffect } from 'react';")

# Add timer logic
timer_logic = """  const [timeUntilRegen, setTimeUntilRegen] = useState<string>('');

  useEffect(() => {
    const pveRegenTime = 1200000;
    
    const updateTimer = () => {
      if (profile.pveEnergy >= profile.pveEnergyMax) {
        setTimeUntilRegen('');
        return;
      }
      
      const lastPve = profile.lastPveEnergyRefill ?? profile.lastEnergyRefill;
      const timePassed = Date.now() - lastPve;
      const timeLeft = Math.max(0, pveRegenTime - (timePassed % pveRegenTime));
      
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      setTimeUntilRegen(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [profile.pveEnergy, profile.pveEnergyMax, profile.lastPveEnergyRefill, profile.lastEnergyRefill]);

  const truncateAddress"""

if "const truncateAddress" in content and "timeUntilRegen" not in content:
    content = content.replace("  const truncateAddress", timer_logic)

# Fix JSX
old_jsx = """          {/* PvE Energy (Main Energy) */}
          <div className="flex items-center gap-2 bg-[#0b0c10] border border-[#c5a880]/20 rounded-full py-1 px-3 shadow-inner" title="Energy (Restores 1 per 5 mins)">
            <Zap className="w-4 h-4 text-emerald-500" />
            <div className="flex flex-col">
              <span className="font-mono text-xs font-bold text-emerald-400">
                Energy: {profile.pveEnergy}/{profile.pveEnergyMax}
              </span>
            </div>
          </div>"""

new_jsx = """          {/* PvE Energy (Main Energy) */}
          <div className="flex items-center gap-2 bg-[#0b0c10] border border-[#c5a880]/20 rounded-full py-1 px-3 shadow-inner" title="Energy (Restores 1 per 20 mins)">
            <Zap className="w-4 h-4 text-emerald-500" />
            <div className="flex flex-col">
              <span className="font-mono text-xs font-bold text-emerald-400">
                Energy: {profile.pveEnergy}/{profile.pveEnergyMax}
              </span>
              {timeUntilRegen && (
                <span className="font-mono text-[8px] text-emerald-500/80 -mt-0.5 tracking-widest text-center">
                  +1 IN {timeUntilRegen}
                </span>
              )}
            </div>
          </div>"""

if old_jsx in content:
    content = content.replace(old_jsx, new_jsx)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("HeaderHUD patched")
