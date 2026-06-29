import os

filepath = r"C:\Users\vaska\Desktop\void-covenant\src\components\CampaignView.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace main title panel
content = content.replace("bg-[#151a21] border border-[#c5a880]/30 rounded-2xl p-6 shadow-2xl flex flex-col items-center relative overflow-hidden", "glass-panel rounded-3xl p-8 flex flex-col items-center relative overflow-hidden")

# Replace arrow buttons
content = content.replace("bg-[#0b0c10] border border-[#c5a880]/40", "bg-white/5 border border-white/10 hover:bg-white/10")

# Replace Stage Details panel
content = content.replace("border rounded-2xl p-6 shadow-xl relative overflow-hidden ${isBoss ? 'bg-[#1a0f0f] border-red-900/50' : 'bg-[#151a21] border-[#c5a880]/20'}", "glass-panel rounded-3xl p-8 relative overflow-hidden ${isBoss ? 'border-red-900/50 shadow-[0_0_30px_rgba(221,44,64,0.15)]' : ''}")

# Replace inner cards
content = content.replace("bg-[#0b0c10] border border-gray-800", "bg-black/50 border border-white/5")
content = content.replace("bg-[#0b0c10] border border-amber-900/30", "bg-black/50 border border-amber-500/20")
content = content.replace("bg-[#0b0c10] border border-cyan-900/30", "bg-black/50 border border-cyan-500/20")
content = content.replace("bg-[#0b0c10] border border-red-900/30", "bg-black/50 border border-red-500/20")
content = content.replace("bg-[#0b0c10] border border-gray-800/30", "bg-black/50 border border-white/5")
content = content.replace("bg-[#0b0c10] border border-emerald-900/30", "bg-black/50 border border-emerald-500/20")

# Replace buttons
content = content.replace("bg-gradient-to-r from-[#1f2833] to-[#0b0c10] hover:from-[#c5a880]/20 hover:to-[#1f2833] border border-[#c5a880]/30 text-[#c5a880]", "glass-button-gold")
content = content.replace("bg-gradient-to-r from-red-900 to-black hover:from-red-800 hover:to-red-950 border border-red-500/50 text-white text-shadow-crimson gothic-glow-crimson", "glass-button-crimson")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("CampaignView design patched")
