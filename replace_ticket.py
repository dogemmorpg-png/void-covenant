import glob
import re

files = glob.glob('src/components/*.tsx')

ticket = '\U0001f3ab'
img_pass = '<img src="/icons/icon_pass.png" alt="Pass" className="w-5 h-5 inline-block align-text-bottom drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] mx-1" />'

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    
    original = text
    
    text = text.replace(ticket, img_pass)
    
    if text != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(text)
        print('Updated ' + filepath)
