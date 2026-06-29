import glob
import re

files = glob.glob('src/components/*.tsx')

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    
    original = text
    
    def enhance_style(match):
        img_tag = match.group(0)
        # Remove old drop shadows
        img_tag = re.sub(r'drop-shadow-\[[^\]]+\]', '', img_tag)
        img_tag = re.sub(r'drop-shadow-md', '', img_tag)
        # Remove old brightness/contrast if any
        img_tag = re.sub(r'brightness-\d+', '', img_tag)
        img_tag = re.sub(r'contrast-\d+', '', img_tag)
        # Clean up multiple spaces
        img_tag = re.sub(r'\s+', ' ', img_tag)
        
        # Inject new strong styles
        img_tag = img_tag.replace('className="', 'className="drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 ')
        return img_tag

    text = re.sub(r'<img[^>]+src="/icons/icon_(gold|dust|shards|energy|pass)\.png"[^>]+>', enhance_style, text)
    
    if text != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(text)
        print('Enhanced in ' + filepath)
