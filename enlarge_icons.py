import glob
import re

files = glob.glob('src/components/*.tsx')

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    
    original = text
    
    # We only want to enlarge the new icons: icon_gold, icon_dust, icon_shards, icon_energy, icon_pass
    def resize(match):
        img_tag = match.group(0)
        # Increase w-X and h-X
        # w-4 -> w-6, w-5 -> w-7, w-6 -> w-8
        def replace_size(m):
            size = int(m.group(1))
            new_size = size + 2
            return f"{m.group(0)[0]}-{new_size}"
        
        img_tag = re.sub(r'[wh]-(\d+)', replace_size, img_tag)
        return img_tag

    text = re.sub(r'<img[^>]+src="/icons/icon_(gold|dust|shards|energy|pass)\.png"[^>]+>', resize, text)
    
    if text != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(text)
        print('Updated sizes in ' + filepath)
