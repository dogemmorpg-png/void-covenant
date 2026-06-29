import glob

files = glob.glob('src/components/*.tsx')
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        text = file.read()
    
    text = text.replace('<img src="/icons/icon_shards.png" alt="Shards" className="w-5 h-5 inline-block align-text-bottom drop-shadow-md mx-1" />', '??')
    text = text.replace('<img src="/icons/icon_energy.png" alt="Energy" className="w-5 h-5 inline-block align-text-bottom drop-shadow-md mx-1" />', '?')
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(text)
print('Restored files!')
