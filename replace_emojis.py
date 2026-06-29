import glob
import re

files = glob.glob('src/components/*.tsx')

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    
    original = text
    
    # We must be careful about strings vs JSX. 
    # For now, let's just do a blanket replacement but fix broken toast messages if they occur.
    # Actually, replacing them with JSX in a toast message: 	oast('... <img...>') will just render [object Object].
    # Let's fix toasts first.
    text = re.sub(r'toast\(([^)]*)[???????]([^)]*)\)', lambda m: 'toast(' + m.group(1) + 'resources' + m.group(2) + ')', text)
    
    # Now replace the rest with JSX images
    text = text.replace('??', '<img src="/icons/icon_shards.png" alt="Shards" className="w-5 h-5 inline-block align-text-bottom drop-shadow-md mx-1" />')
    text = text.replace('??', '<img src="/icons/icon_gold.png" alt="Gold" className="w-5 h-5 inline-block align-text-bottom drop-shadow-md mx-1" />')
    text = text.replace('??', '<img src="/icons/icon_dust.png" alt="Dust" className="w-5 h-5 inline-block align-text-bottom drop-shadow-md mx-1" />')
    text = text.replace('?', '<img src="/icons/icon_energy.png" alt="Energy" className="w-5 h-5 inline-block align-text-bottom drop-shadow-md mx-1" />')
    
    if text != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(text)
        print('Updated ' + filepath)
