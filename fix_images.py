import os

def replace_in_file(filepath, old, new):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    if old in content:
        content = content.replace(old, new)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
            print(f"Patched {filepath}")
    else:
        print(f"Pattern not found in {filepath}")

# 1. CollectionDeckView.tsx
replace_in_file(
    r"C:\Users\vaska\Desktop\void-covenant\src\components\CollectionDeckView.tsx",
    "return <img src={imageName} alt=\"card icon\" className={`object-cover rounded-full mix-blend-screen ${className}`} />;",
    "return <img src={imageName} alt=\"card icon\" className={`object-cover rounded-full ${className.replace('text-slate-400','').replace('text-emerald-400','').replace('text-purple-400','').replace('text-red-400','').replace('text-violet-400','').replace('text-amber-400','').replace('text-cyan-400','').replace('text-rose-400','').replace('text-red-500','')} bg-black/50 p-0.5 border border-white/10`} />;"
)

# 2. GachaStoreView.tsx
replace_in_file(
    r"C:\Users\vaska\Desktop\void-covenant\src\components\GachaStoreView.tsx",
    '<img src={card.image} alt={card.name} className="w-full h-full object-cover mix-blend-screen opacity-80" />',
    '<img src={card.image} alt={card.name} className="w-full h-full object-cover opacity-100" />'
)

# 3. BattleFieldView.tsx
old_bf = """<img src={card.image} alt={card.name} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 z-0 rounded-xl" />"""
new_bf = """<img src={card.image} alt={card.name} className="absolute inset-0 w-full h-full object-cover z-0 rounded-xl opacity-90" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10 z-0 rounded-xl pointer-events-none" />"""
replace_in_file(r"C:\Users\vaska\Desktop\void-covenant\src\components\BattleFieldView.tsx", old_bf, new_bf)

# 4. GameContext.tsx migration
gc_path = r"C:\Users\vaska\Desktop\void-covenant\src\context\GameContext.tsx"
with open(gc_path, "r", encoding="utf-8") as f:
    gc_content = f.read()

migration_code = """
  // Sync profile cards with new images if updated
  useEffect(() => {
    let updated = false;
    const newCollection = profile.collection.map(card => {
      const template = CARD_TEMPLATES.find(t => t.baseId === card.baseId);
      if (template && template.image !== card.image) {
        updated = true;
        return { ...card, image: template.image };
      }
      return card;
    });

    if (updated) {
      const updatedProfile = { ...profile, collection: newCollection };
      setProfile(updatedProfile);
      saveProfile(updatedProfile);
    }
  }, [profile.collection.length]); // Only run on mount or length change

"""

if "Sync profile cards with new images" not in gc_content:
    if "const resetProfile =" in gc_content:
        gc_content = gc_content.replace("const resetProfile =", migration_code + "const resetProfile =")
        with open(gc_path, "w", encoding="utf-8") as f:
            f.write(gc_content)
        print("GameContext.tsx patched with migration logic")

