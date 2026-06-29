import os
import shutil
import glob
import re

brain_dir = r"C:\Users\vaska\.gemini\antigravity\brain\608ee10e-cbf5-420e-8624-231ac0d86799"
public_cards_dir = r"C:\Users\vaska\Desktop\void-covenant\public\cards"

if not os.path.exists(public_cards_dir):
    os.makedirs(public_cards_dir)

# Find all generated images
generated_pngs = glob.glob(os.path.join(brain_dir, "*.png"))
generated_basenames = []

for png in generated_pngs:
    # format is usually baseId_123456789.png
    filename = os.path.basename(png)
    base_id = "_".join(filename.split("_")[:-1]) # remove timestamp
    if not base_id:
        base_id = filename.split(".")[0]
    
    generated_basenames.append(base_id)
    shutil.copy(png, os.path.join(public_cards_dir, f"{base_id}.png"))

print("Copied images:", generated_basenames)

# Now rewrite cards.ts to use Lucide icons for missing ones
cards_ts_path = r"C:\Users\vaska\Desktop\void-covenant\src\data\cards.ts"
with open(cards_ts_path, "r", encoding="utf-8") as f:
    cards_content = f.read()

# We need to find all `image: '/cards/some_id.png'`
# and if `some_id` is not in generated_basenames, replace it with a random icon
import random
icons = ['Skull', 'Flame', 'Sparkles', 'Wand', 'Swords', 'Crown', 'ShieldAlert', 'Rat']

def repl(match):
    path = match.group(1)
    base_id = path.split('/')[-1].replace('.png', '')
    if base_id in generated_basenames:
        return f"image: '{path}'"
    else:
        return f"image: '{random.choice(icons)}'"

new_content = re.sub(r"image:\s*'(/cards/[^']+)'", repl, cards_content)

with open(cards_ts_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("cards.ts updated with fallback icons for missing images")
