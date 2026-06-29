import re

files = [
    'src/components/HeaderHUD.tsx',
    'src/components/GachaStoreView.tsx',
    'src/components/CampaignView.tsx',
    'src/components/PvpArenaView.tsx'
]

for f in files:
    try:
        content = open(f, 'r', encoding='utf-8').read()
        content = re.sub(r'w-4 h-4 object-contain drop-shadow-md', r'w-6 h-6 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]', content)
        open(f, 'w', encoding='utf-8').write(content)
        print('Processed ' + f)
    except Exception as e:
        print('Error ' + f + ': ' + str(e))
