import os

filepath = r"C:\Users\vaska\Desktop\void-covenant\src\components\GachaStoreView.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Wrappers
content = content.replace("bg-[#151a21]/90 border border-[#c5a880]/20 rounded-2xl p-4 md:p-6", "glass-panel rounded-3xl p-4 md:p-8")

# Sections
content = content.replace("bg-[#0b0c10] border border-[#c5a880]/30 rounded-xl p-6 relative overflow-hidden", "bg-black/50 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden")

# Buttons
content = content.replace("bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500", "glass-button-gold")
content = content.replace("bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600", "glass-button-gold")
content = content.replace("bg-gradient-to-r from-purple-700 to-fuchsia-700 hover:from-purple-600 hover:to-fuchsia-600", "glass-button-gold")

# Modals
content = content.replace("bg-[#151a21] border border-[#c5a880]/50 p-6 rounded-2xl max-w-sm w-full relative overflow-hidden", "glass-panel rounded-3xl p-8 max-w-sm w-full relative overflow-hidden shadow-neon-gold")
content = content.replace("bg-gradient-to-b from-[#1f2833] to-[#0b0c10] border-[#c5a880]", "bg-black border-amber-500 shadow-neon-gold")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("GachaStoreView design patched")
