import os
import re

filepath = r"C:\Users\vaska\Desktop\void-covenant\src\data\cards.ts"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# We know the baseIds for these 15
base_ids = [
    'vampire_bat', 'lost_soul', 'cultist_brute', 'spore_carrier', 'skeleton_guard',
    'shadow_wisp', 'blood_thrall', 'abyss_reaper', 'hell_rider', 'plague_doctor',
    'vampire_knight', 'bone_golem', 'banshee', 'flesh_abomination', 'dark_templar'
]

lines = content.split('\n')
for i, line in enumerate(lines):
    if 'baseId:' in line:
        # find the base_id
        match = re.search(r"baseId:\s*'([^']+)'", line)
        if match:
            b_id = match.group(1)
            if b_id in base_ids:
                # the image field is usually a few lines down
                for j in range(i, i+15):
                    if 'image:' in lines[j] and '/cards/' not in lines[j]:
                        lines[j] = re.sub(r"image:\s*'[^']+'", f"image: '/cards/{b_id}.png'", lines[j])
                        break

with open(filepath, "w", encoding="utf-8") as f:
    f.write('\n'.join(lines))
print("cards.ts patched with 15 new images")
