import os

filepath = r"C:\Users\vaska\Desktop\void-covenant\src\components\CollectionDeckView.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace main background layout wrapper classes
content = content.replace("bg-[#151a21]/90 border border-[#c5a880]/20 rounded-2xl p-4 md:p-6", "glass-panel rounded-3xl p-4 md:p-6")

# Replace Deck area
content = content.replace("bg-[#0b0c10] border border-[#c5a880]/30 rounded-xl p-4 mb-8", "bg-black/50 border border-amber-500/20 rounded-2xl p-4 md:p-6 mb-8")
content = content.replace("bg-[#1f2833] border border-[#c5a880]/20 border-dashed rounded-lg flex flex-col items-center justify-center p-4", "bg-white/5 border border-white/10 border-dashed rounded-xl flex flex-col items-center justify-center p-4")

# Replace Collection grid container (if there is one specific)
content = content.replace("bg-[#0b0c10] border border-[#c5a880]/20 rounded-xl p-4", "bg-black/40 border border-white/5 rounded-2xl p-4 md:p-6")

# Replace filter buttons
content = content.replace("bg-[#1f2833] text-[#c5a880]", "bg-white/10 text-amber-200 shadow-[0_0_15px_rgba(235,208,155,0.2)]")
content = content.replace("bg-[#0b0c10] text-gray-500 hover:text-gray-300", "bg-black/50 text-gray-400 hover:bg-white/5 hover:text-gray-200")

# Update Card instances wrappers
content = content.replace("bg-gradient-to-b from-[#1f2833] to-[#0b0c10] border-[#c5a880]/50", "bg-black border-amber-500/50 shadow-neon-gold")
content = content.replace("border-gray-800", "border-white/10")

# Fused modal
content = content.replace("bg-[#151a21] border border-[#c5a880]/50 p-6 rounded-2xl max-w-sm w-full relative", "glass-panel p-8 rounded-3xl max-w-sm w-full relative shadow-neon-gold")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("CollectionDeckView design patched")
