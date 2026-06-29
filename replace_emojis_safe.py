import glob
import re

files = glob.glob('src/components/*.tsx')

shards = '\U0001f48e'
gold = '\U0001fa99'
dust = '\U0001f9ff'
energy = '\u26a1'

img_shards = '<img src="/icons/icon_shards.png" alt="Shards" className="w-5 h-5 inline-block align-text-bottom drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] mx-1" />'
img_gold = '<img src="/icons/icon_gold.png" alt="Gold" className="w-5 h-5 inline-block align-text-bottom drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] mx-1" />'
img_dust = '<img src="/icons/icon_dust.png" alt="Dust" className="w-5 h-5 inline-block align-text-bottom drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] mx-1" />'
img_energy = '<img src="/icons/icon_energy.png" alt="Energy" className="w-5 h-5 inline-block align-text-bottom drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] mx-1" />'

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    
    original = text
    
    # Fix toasts first
    text = re.sub(r'toast\(([^)]*)[' + shards + gold + dust + energy + r']([^)]*)\)', lambda m: 'toast(' + m.group(1) + ' resources ' + m.group(2) + ')', text)
    
    # Now replace the emojis with img tags
    text = text.replace(shards, img_shards)
    text = text.replace(gold, img_gold)
    text = text.replace(dust, img_dust)
    text = text.replace(energy, img_energy)
    
    if text != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(text)
        print('Updated ' + filepath)
