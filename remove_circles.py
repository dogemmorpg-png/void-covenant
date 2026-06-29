import re

files = ['src/components/HeaderHUD.tsx', 'src/components/GachaStoreView.tsx']
pattern = re.compile(r'<div className="w-5 h-5 rounded-full bg-[^"]+ border border-[^"]+ flex items-center justify-center shadow-[^"]+">(<img[^>]+>)</div>')

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        text = file.read()
    
    new_text, count = pattern.subn(r'\1', text)
    if count > 0:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_text)
        print(f'Updated {f} with {count} replacements')
    else:
        print(f'No matches in {f}')
