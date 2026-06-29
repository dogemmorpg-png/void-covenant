import os
import re

filepath = r"C:\Users\vaska\Desktop\void-covenant\src\data\cards.ts"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

base_ids = ['phantom_assassin', 'blood_priest']

lines = content.split('\n')
for i, line in enumerate(lines):
    if 'baseId:' in line:
        match = re.search(r"baseId:\s*'([^']+)'", line)
        if match:
            b_id = match.group(1)
            if b_id in base_ids:
                for j in range(i, i+15):
                    if 'image:' in lines[j] and '/cards/' not in lines[j]:
                        lines[j] = re.sub(r"image:\s*'[^']+'", f"image: '/cards/{b_id}.png'", lines[j])
                        break

with open(filepath, "w", encoding="utf-8") as f:
    f.write('\n'.join(lines))
print("cards.ts patched with 2 more images")
