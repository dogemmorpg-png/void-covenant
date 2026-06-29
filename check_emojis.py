import glob
import re

files = glob.glob('src/components/*.tsx')
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        text = file.read()
    emojis = set(re.findall(r'[^\x00-\x7F]', text))
    if emojis:
        print(f + ': ' + ', '.join(hex(ord(e)) for e in emojis))
