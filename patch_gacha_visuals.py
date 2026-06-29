import os

file_gacha = r"C:\Users\vaska\Desktop\void-covenant\src\components\GachaStoreView.tsx"
with open(file_gacha, "r", encoding="utf-8") as f:
    c = f.read()

if "getCardTierStyles" not in c:
    c = c.replace("import { Card } from '../types';", "import { Card } from '../types';\nimport { getCardTierStyles } from '../utils/tierStyles';")

old_str1 = """className="relative w-40 aspect-[3/4.2] bg-black border-amber-500 shadow-neon-gold border p-2 flex flex-col justify-between\""""
new_str1 = """className={`relative w-40 aspect-[3/4.2] border p-2 flex flex-col justify-between ${getCardTierStyles(card.tier, false, false)}`}"""
c = c.replace(old_str1, new_str1)

old_str2 = """className="relative w-40 aspect-[3/4.2] bg-gradient-to-b from-[#1f2833] to-[#0b0c10] border-[#c5a880] border p-2 flex flex-col justify-between\""""
c = c.replace(old_str2, new_str1)

with open(file_gacha, "w", encoding="utf-8") as f:
    f.write(c)

print("GachaStoreView patched")
