import os

file_path = r"C:\Users\vaska\Desktop\void-covenant\src\components\BattleFieldView.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

bad_snippet = """                          {card.image.startsWith('/cards/') && (
                            <img src={card.image} alt={card.name} className="absolute inset-0 w-full h-full object-cover z-0 rounded-xl opacity-90" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10 z-0 rounded-xl pointer-events-none" />
                          )}"""

good_snippet = """                          {card.image.startsWith('/cards/') && (
                            <>
                              <img src={card.image} alt={card.name} className="absolute inset-0 w-full h-full object-cover z-0 rounded-xl opacity-90" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10 z-0 rounded-xl pointer-events-none" />
                            </>
                          )}"""

if bad_snippet in content:
    content = content.replace(bad_snippet, good_snippet)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Fixed BattleFieldView.tsx JSX syntax error.")
else:
    print("Snippet not found!")
