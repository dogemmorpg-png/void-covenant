import os

filepath = r"C:\Users\vaska\Desktop\void-covenant\src\components\BattleFieldView.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace main wrapper
content = content.replace("bg-[#0b0c10]", "bg-black/80 backdrop-blur-3xl")

# Replace header hud bar inside battle
content = content.replace("bg-[#151a21] border-b border-gray-800", "bg-black/50 border-b border-white/5 backdrop-blur-xl")

# Replace player/enemy stat plates
content = content.replace("bg-[#1a0f0f] border border-[#dd2c40]/30", "bg-red-950/40 border border-red-500/20 backdrop-blur-md shadow-neon-crimson")
content = content.replace("bg-[#1f2833] border border-cyan-900/50", "bg-cyan-950/40 border border-cyan-500/20 backdrop-blur-md shadow-neon-blue")
content = content.replace("bg-[#151a21]/80 rounded-xl px-4 py-2 border border-gray-800", "glass-panel rounded-xl px-4 py-2")

# Replace the board slots
content = content.replace("bg-[#151a21] border border-gray-800 border-dashed rounded-lg flex items-center justify-center opacity-30", "bg-white/5 border border-white/10 border-dashed rounded-xl flex items-center justify-center opacity-40")

# Replace turn indicator
content = content.replace("bg-[#151a21] border border-[#c5a880]/30 text-[#c5a880]", "glass-panel text-amber-300 font-black tracking-widest")

# Replace cards on board
content = content.replace("border-[#c5a880]/30", "border-amber-500/30")
content = content.replace("bg-[#1f2833]", "bg-black/90")
content = content.replace("bg-[#0b0c10]", "bg-black/60")

# Buttons
content = content.replace("bg-gradient-to-r from-emerald-900 to-[#1f2833] hover:from-emerald-800 border border-emerald-500/30 text-emerald-400", "glass-button-gold")
content = content.replace("bg-[#151a21] hover:bg-gray-800 border-gray-700", "bg-white/10 hover:bg-white/20 border-white/20")
content = content.replace("bg-[#dd2c40]/20 hover:bg-[#dd2c40]/40 border border-[#dd2c40]/50 text-white", "glass-button-crimson")

# End Game Modal
content = content.replace("bg-[#151a21] border border-[#c5a880]/50 rounded-2xl p-8 max-w-sm w-full text-center relative", "glass-panel rounded-3xl p-10 max-w-md w-full text-center relative shadow-2xl shadow-black")
content = content.replace("bg-[#4e0707] text-[#dd2c40] border border-[#dd2c40]/50", "bg-red-950 text-red-400 border border-red-500/50")
content = content.replace("bg-[#c5a880]/20 text-[#c5a880] border border-[#c5a880]/50", "bg-amber-500/20 text-amber-300 border border-amber-500/50")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("BattleFieldView design patched")
