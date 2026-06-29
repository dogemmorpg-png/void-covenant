import re

files = [
    'src/components/HeaderHUD.tsx',
    'src/components/GachaStoreView.tsx',
    'src/components/CampaignView.tsx',
    'src/components/PvpArenaView.tsx'
]

replacements = {
    r'<Coins[^>]*>': '<img src=\"/icons/icon_gold.png\" alt=\"Gold\" className=\"w-4 h-4 object-contain drop-shadow-md\" />',
    r'<Database[^>]*>': '<img src=\"/icons/icon_dust.png\" alt=\"Dust\" className=\"w-4 h-4 object-contain drop-shadow-md\" />',
    r'<Gem[^>]*text-red-500[^>]*>': '<img src=\"/icons/icon_shards.png\" alt=\"Shards\" className=\"w-4 h-4 object-contain drop-shadow-md\" />',
    r'<Zap[^>]*>': '<img src=\"/icons/icon_energy.png\" alt=\"Energy\" className=\"w-4 h-4 object-contain drop-shadow-md\" />',
    r'<Droplet[^>]*>': '<img src=\"/icons/icon_energy.png\" alt=\"Energy\" className=\"w-4 h-4 object-contain drop-shadow-md\" />'
}

for f in files:
    try:
        content = open(f, 'r', encoding='utf-8').read()
        for pat, rep in replacements.items():
            content = re.sub(pat, rep, content)
        open(f, 'w', encoding='utf-8').write(content)
        print('Processed ' + f)
    except Exception as e:
        print('Error ' + f + ': ' + str(e))
