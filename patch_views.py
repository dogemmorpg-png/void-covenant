import os

# Update CollectionDeckView.tsx
file_path = r"C:\Users\vaska\Desktop\void-covenant\src\components\CollectionDeckView.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace renderCardIcon
new_func = """const renderCardIcon = (imageName: string, className: string) => {
  if (imageName.startsWith('/cards/')) {
    return <img src={imageName} alt="card icon" className={`object-cover rounded-full mix-blend-screen ${className}`} />;
  }
  switch(imageName) {
    case 'Skull': return <Skull className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Wand': return <Sparkles className={className} />;
    case 'Swords': return <Swords className={className} />;
    case 'Crown': return <Crown className={className} />;
    case 'ShieldAlert': return <ShieldAlert className={className} />;
    case 'Rat': return <Bug className={className} />;
    default: return <Swords className={className} />;
  }
};"""

if "const renderCardIcon =" in content:
    content = content.replace("const renderCardIcon = (imageName: string, className: string) => {\n  switch(imageName) {\n    case 'Skull': return <Skull className={className} />;\n    case 'Flame': return <Flame className={className} />;\n    case 'Sparkles': return <Sparkles className={className} />;\n    case 'Wand': return <Sparkles className={className} />;\n    case 'Swords': return <Swords className={className} />;\n    case 'Crown': return <Crown className={className} />;\n    case 'ShieldAlert': return <ShieldAlert className={className} />;\n    case 'Rat': return <Bug className={className} />;\n    default: return <Swords className={className} />;\n  }\n};", new_func)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

# Update BattleFieldView.tsx
file_path = r"C:\Users\vaska\Desktop\void-covenant\src\components\BattleFieldView.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

img_str = """                        <>
                          <div className={`absolute inset-0 opacity-[0.06] bg-gradient-to-br ${getTierBgGradient(card.tier)}`} />
                          {card.image.startsWith('/cards/') && (
                            <img src={card.image} alt={card.name} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-40 z-0 rounded-xl" />
                          )}"""

if "                        <>\n                          <div className={`absolute inset-0 opacity-[0.06] bg-gradient-to-br ${getTierBgGradient(card.tier)}`} />" in content:
    content = content.replace("                        <>\n                          <div className={`absolute inset-0 opacity-[0.06] bg-gradient-to-br ${getTierBgGradient(card.tier)}`} />", img_str)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

# Update GachaStoreView.tsx
file_path = r"C:\Users\vaska\Desktop\void-covenant\src\components\GachaStoreView.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

gacha_img = """                            <div className={`w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center relative overflow-hidden bg-gradient-to-br ${card.tier === 'legendary' ? 'from-red-500/20 to-black' : card.tier === 'gold' ? 'from-yellow-500/20 to-black' : card.tier === 'silver' ? 'from-slate-400/20 to-black' : 'from-amber-700/20 to-black'}`}>
                              {card.image.startsWith('/cards/') ? (
                                <img src={card.image} alt={card.name} className="w-full h-full object-cover mix-blend-screen opacity-80" />
                              ) : (
                                <>
                                  {card.image === 'Skull' && <Skull className="w-6 h-6 text-[#dd2c40]" />}
                                  {card.image === 'Flame' && <Flame className="w-6 h-6 text-amber-500" />}
                                  {card.image === 'Sparkles' && <Sparkles className="w-6 h-6 text-purple-400" />}
                                  {card.image === 'Wand' && <Sparkles className="w-6 h-6 text-cyan-400" />}
                                  {card.image !== 'Skull' && card.image !== 'Flame' && card.image !== 'Sparkles' && card.image !== 'Wand' && (
                                    <Swords className="w-6 h-6 text-gray-400" />
                                  )}
                                </>
                              )}
                            </div>"""

import re
content = re.sub(r'<div className=\{`w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center relative bg-gradient-to-br[^>]+>.*?</div>', gacha_img, content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Views updated to support images")
