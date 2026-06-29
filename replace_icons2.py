import re

files = [
    'src/components/GachaStoreView.tsx'
]

replacements = {
    r'<Gem[^>]*text-red-400[^>]*>': '<img src=\"/icons/icon_shards.png\" alt=\"Shards\" className=\"w-4 h-4 object-contain drop-shadow-md\" />'
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
