import os

filepath = r"C:\Users\vaska\Desktop\void-covenant\src\components\HeaderHUD.tsx"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace the outer container
old_container = """    <div className="bg-[#151a21]/95 border-b border-[#c5a880]/30 px-4 py-3 sticky top-0 z-50 backdrop-blur-md gothic-glow-blue">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">"""

new_container = """    <div className="sticky top-4 z-50 px-4 w-full flex justify-center">
      <div className="glass-panel rounded-full w-full max-w-5xl px-6 py-2 flex flex-col md:flex-row items-center justify-between gap-4 shadow-neon-blue">"""

content = content.replace(old_container, new_container)

# Replace the Logo bg
old_logo = """<div className="w-10 h-10 rounded-lg bg-[#4e0707] border border-[#dd2c40]/50 flex items-center justify-center shadow-inner animate-pulse">"""
new_logo = """<div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600/20 to-black border border-red-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(221,44,64,0.4)] animate-pulse">"""
content = content.replace(old_logo, new_logo)

# Replace the inner resource pills
content = content.replace("bg-[#0b0c10] border border-[#c5a880]/20 rounded-full", "bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors cursor-default")
content = content.replace("bg-[#0b0c10] border border-[#dd2c40]/20 rounded-full", "bg-red-500/5 border border-red-500/20 rounded-full hover:bg-red-500/10 transition-colors cursor-default")

# Adjust energy timer text
content = content.replace("text-emerald-500/80 -mt-0.5", "text-emerald-400/80 -mt-0.5")

# Bottom closing divs
old_closing = """      </div>
    </div>"""

new_closing = """      </div>
    </div>"""

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)
print("HeaderHUD design patched")
