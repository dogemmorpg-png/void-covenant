import os

filepath = r"C:\Users\vaska\Desktop\void-covenant\src\components\CollectionDeckView.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

old_grid = """                return (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`relative aspect-[3/4.2] rounded-xl border p-2.5 flex flex-col justify-between cursor-pointer transition-all hover:scale-105 active:scale-95 ${
                      isSelected 
                        ? 'bg-[#1f2833] border-[#66fcf1] gothic-glow-blue' 
                        : 'bg-[#0b0c10] border-[#c5a880]/15'
                    }`}
                  >
                    {/* Level Badge */}
                    <div className="absolute top-1.5 right-1.5 bg-black/70 border border-[#c5a880]/30 rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-mono font-bold text-[#ebd09b]">
                      L{card.level}
                    </div>

                    {/* Deck indicator icon */}
                    {isInDeck && (
                      <div className="absolute top-1.5 left-1.5 bg-[#880d1e] text-white rounded-full p-0.5" title="In deck">
                        <Swords className="w-2.5 h-2.5" />
                      </div>
                    )}

                    <div className="text-center mt-3">
                      <span className="text-[10px] font-display font-bold text-white block truncate leading-none">
                        {card.name}
                      </span>
                      <span className="text-[7px] text-gray-400 uppercase font-mono tracking-wider">{card.tier}</span>
                    </div>

                    {/* Card Skills Indicator */}
                    <div className="flex justify-center gap-1 my-1">
                      {card.skills.map((s, idx) => (
                        <div 
                          key={idx} 
                          className={`w-1.5 h-1.5 rounded-full ${
                            s.type === 'hex' ? 'bg-purple-500' :
                            s.type === 'vampirism' ? 'bg-red-500' :
                            s.type === 'plague' ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          title={s.description}
                        />
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between items-center text-[9px] font-mono font-bold pt-1.5 border-t border-gray-800">
                      <span className="text-red-400">⚔️{card.attack}</span>
                      <span className="text-emerald-400">❤️{card.health}</span>
                    </div>
                  </div>
                );"""

new_grid = """                return (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`relative aspect-[3/4.2] rounded-xl border p-2 flex flex-col justify-between cursor-pointer transition-all hover:scale-105 active:scale-95 overflow-hidden group ${
                      isSelected 
                        ? 'border-[#66fcf1] gothic-glow-blue' 
                        : 'border-[#c5a880]/20'
                    }`}
                  >
                    {card.image.startsWith('/cards/') ? (
                      <>
                        <img src={card.image} alt={card.name} className="absolute inset-0 w-full h-full object-cover z-0 opacity-80 group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-0 pointer-events-none" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-[#0b0c10] z-0" />
                    )}

                    {/* Level Badge */}
                    <div className="absolute top-1.5 right-1.5 z-10 bg-black/70 border border-[#c5a880]/30 rounded-full w-4 h-4 flex items-center justify-center text-[8px] font-mono font-bold text-[#ebd09b]">
                      L{card.level}
                    </div>

                    {/* Deck indicator icon */}
                    {isInDeck && (
                      <div className="absolute top-1.5 left-1.5 z-10 bg-[#880d1e] text-white rounded-full p-0.5 shadow-md border border-[#dd2c40]/30" title="In deck">
                        <Swords className="w-2.5 h-2.5" />
                      </div>
                    )}

                    <div className="text-center mt-4 relative z-10">
                      {!card.image.startsWith('/cards/') && (
                        <div className="flex justify-center mb-1">
                          {renderCardIcon(card.image, `w-4 h-4 ${getCardIconColor(card.color)} opacity-60`)}
                        </div>
                      )}
                      <span className="text-[10px] font-display font-bold text-white block truncate leading-none text-shadow-gold drop-shadow-md">
                        {card.name}
                      </span>
                      <span className="text-[7px] text-[#ebd09b] uppercase font-mono tracking-wider drop-shadow-md">{card.tier}</span>
                    </div>

                    <div className="relative z-10 mt-auto">
                      {/* Card Skills Indicator */}
                      <div className="flex justify-center gap-1 my-1">
                        {card.skills.map((s, idx) => (
                          <div 
                            key={idx} 
                            className={`w-1.5 h-1.5 rounded-full border border-black shadow-sm ${
                              s.type === 'hex' ? 'bg-purple-500' :
                              s.type === 'vampirism' ? 'bg-red-500' :
                              s.type === 'plague' ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            title={s.description}
                          />
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex justify-between items-center text-[9px] font-mono font-bold pt-1 border-t border-gray-800/80 bg-black/50 backdrop-blur-sm rounded px-1 -mx-1">
                        <span className="text-red-400">⚔️{card.attack}</span>
                        <span className="text-emerald-400">❤️{card.health}</span>
                      </div>
                    </div>
                  </div>
                );"""

if old_grid in content:
    content = content.replace(old_grid, new_grid)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("Grid patched successfully.")
else:
    print("Grid not found.")
