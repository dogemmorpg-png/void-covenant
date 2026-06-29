import re

file_path = r"C:\Users\vaska\Desktop\void-covenant\src\data\cards.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

with open("cards_array.txt", "r", encoding="utf-8") as f:
    cards_arr = f.read()

# Replace from export const CARD_TEMPLATES to the end of the array ];
pattern = re.compile(r'export const CARD_TEMPLATES: CardTemplate\[\] = \[.*?\];', re.DOTALL)
new_content = pattern.sub(cards_arr, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("cards.ts updated")
