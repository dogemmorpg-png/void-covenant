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

# 1. CollectionDeckView.tsx (Sanctuary details panel)
cdv_old = """                {/* High Fidelity Visual Card Illustration Representation */}
                <div className="aspect-[3/3.8] max-w-[200px] mx-auto bg-[#0b0c10] border border-[#c5a880]/30 rounded-2xl p-4 flex flex-col justify-between relative shadow-inner">
                  {/* Card level badge */}
                  <div className="absolute top-2 right-2 bg-black border border-[#c5a880]/40 rounded-full w-5 h-5 flex items-center justify-center text-[9px] font-mono font-bold text-[#ebd09b]">
                    {selectedCard.level}
                  </div>

                  {/* Icon representation */}
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[#151a21] border border-gray-800 flex items-center justify-center text-shadow-gold">
                      {renderCardIcon(selectedCard.image, `w-8 h-8 ${getCardIconColor(selectedCard.color)} animate-pulse`)}
                    </div>
                  </div>

                  {/* Visual power stats */}
                  <div className="grid grid-cols-3 gap-1 font-mono text-[10px] font-bold text-center border-t border-gray-800/60 pt-2">
                    <div className="bg-red-950/20 p-1 rounded border border-red-900/10">
                      <span className="text-red-400 block">ATK</span>
                      <span className="text-red-400 text-xs">⚔️{selectedCard.attack}</span>
                    </div>
                    <div className="bg-emerald-950/20 p-1 rounded border border-emerald-900/10">
                      <span className="text-emerald-400 block">HP</span>
                      <span className="text-emerald-400 text-xs">❤️{selectedCard.health}</span>
                    </div>
                    <div className="bg-blue-950/20 p-1 rounded border border-blue-900/10">
                      <span className="text-blue-400 block">DELAY</span>
                      <span className="text-blue-400 text-xs">⏳{selectedCard.delay}</span>
                    </div>
                  </div>
                </div>"""

cdv_new = """                {/* High Fidelity Visual Card Illustration Representation */}
                <div className="aspect-[3/4.2] w-full max-w-[240px] mx-auto bg-[#0b0c10] border border-[#c5a880]/30 rounded-2xl p-4 flex flex-col justify-between relative shadow-inner overflow-hidden group">
                  {/* Card Background Image */}
                  <div className={`absolute inset-0 opacity-10 bg-gradient-to-br z-0`} />
                  {selectedCard.image.startsWith('/cards/') && (
                    <>
                      <img src={selectedCard.image} alt={selectedCard.name} className="absolute inset-0 w-full h-full object-cover z-0 opacity-90 transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-0 pointer-events-none" />
                    </>
                  )}

                  {/* Top: Tier & Level */}
                  <div className="relative z-10 flex justify-between items-start">
                    <span className={getTierBadgeStyles(selectedCard.tier)}>{selectedCard.tier}</span>
                    <div className="bg-black/70 border border-[#c5a880]/40 rounded-full px-2 py-0.5 text-[9px] font-mono font-bold text-[#ebd09b] shadow">
                      L{selectedCard.level}
                    </div>
                  </div>

                  {/* Middle: Icon fallback if no image */}
                  {!selectedCard.image.startsWith('/cards/') && (
                    <div className="flex-1 flex items-center justify-center relative z-10">
                      <div className="w-16 h-16 rounded-full bg-[#151a21]/80 border border-gray-800 flex items-center justify-center text-shadow-gold backdrop-blur-sm">
                        {renderCardIcon(selectedCard.image, `w-8 h-8 ${getCardIconColor(selectedCard.color)} animate-pulse`)}
                      </div>
                    </div>
                  )}
                  {selectedCard.image.startsWith('/cards/') && <div className="flex-1" />}

                  {/* Bottom: Name & Stats */}
                  <div className="relative z-10">
                    <h3 className="font-display font-black text-xl text-white tracking-widest text-shadow-gold mb-2 text-center drop-shadow-md">{selectedCard.name}</h3>
                    <div className="grid grid-cols-3 gap-1 font-mono text-[10px] font-bold text-center border-t border-gray-800/60 pt-2 bg-black/40 backdrop-blur-sm rounded-lg p-1.5">
                      <div className="bg-red-950/40 p-1 rounded">
                        <span className="text-red-400 block text-[8px] opacity-80">ATK</span>
                        <span className="text-red-400 text-sm">⚔️{selectedCard.attack}</span>
                      </div>
                      <div className="bg-emerald-950/40 p-1 rounded">
                        <span className="text-emerald-400 block text-[8px] opacity-80">HP</span>
                        <span className="text-emerald-400 text-sm">❤️{selectedCard.health}</span>
                      </div>
                      <div className="bg-blue-950/40 p-1 rounded">
                        <span className="text-blue-400 block text-[8px] opacity-80">DELAY</span>
                        <span className="text-blue-400 text-sm">⏳{selectedCard.delay}</span>
                      </div>
                    </div>
                  </div>
                </div>"""
replace_in_file(r"C:\Users\vaska\Desktop\void-covenant\src\components\CollectionDeckView.tsx", cdv_old, cdv_new)

# 2. GachaStoreView.tsx (Gacha drop)
gacha_old = """                        <div
                          className="w-48 aspect-[3/4.2] bg-[#151a21] border border-[#c5a880]/20 rounded-2xl p-4 flex flex-col justify-between relative shadow-2xl scale-100 hover:scale-105 transition-all"
                        >
                          <div className="absolute top-2 right-2 bg-black border border-[#c5a880]/40 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-mono font-bold text-[#ebd09b]">
                            {card.level}
                          </div>
                        
                          <div className="text-center mt-3">
                            <span className="text-xs font-display font-bold text-white block truncate leading-none">
                              {card.name}
                            </span>
                            <span className="text-[8px] text-[#ebd09b] uppercase font-mono tracking-wider">{card.tier}</span>
                          </div>

                          <div className="flex-1 flex items-center justify-center my-3">
                            <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-amber-700/20 to-black">
                              {card.image.startsWith('/cards/') ? (
                                <img src={card.image} alt={card.name} className="w-full h-full object-cover opacity-100" />
                              ) : (
                                <>
                                  {card.image === 'Skull' && <Skull className="w-6 h-6 text-[#dd2c40]" />}
                                  {card.image === 'Flame' && <Flame className="w-6 h-6 text-amber-500" />}
                                  {card.image === 'Sparkles' && <Sparkles className="w-6 h-6 text-purple-400" />}
                                  {card.image === 'Wand' && <Sparkles className="w-6 h-6 text-cyan-400" />}
                                  {card.image !== 'Skull' && card.image !== 'Flame' && card.image !== 'Sparkles' && card.image !== 'Wand' && (
                                    <Skull className="w-6 h-6 text-gray-500" />
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                          {/* Skill preview */}
                          {skill && (
                            <div className="bg-black/40 border border-gray-900 p-1.5 rounded-lg text-[9px] text-gray-400 text-center leading-tight">
                              <span className="font-semibold block text-[#c5a880] uppercase text-[8px]">{skill.type}</span>
                              <span className="line-clamp-1">{skill.description}</span>
                            </div>
                          )}

                          <div className="flex justify-between items-center text-[10px] font-mono font-bold pt-1.5 border-t border-gray-800/80">
                            <span className="text-red-400">⚔️ {card.attack}</span>
                            <span className="text-emerald-400">❤️ {card.health}</span>
                            <span className="text-blue-400">⏳ {card.delay}</span>
                          </div>
                        </div>"""

gacha_new = """                        <div
                          className="w-48 aspect-[3/4.2] bg-[#151a21] border border-[#c5a880]/20 rounded-2xl p-4 flex flex-col justify-between relative shadow-2xl scale-100 hover:scale-105 transition-all overflow-hidden"
                        >
                          {card.image.startsWith('/cards/') && (
                            <>
                              <img src={card.image} alt={card.name} className="absolute inset-0 w-full h-full object-cover z-0 opacity-90" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-0 pointer-events-none" />
                            </>
                          )}

                          <div className="relative z-10 flex justify-between items-start">
                            <div className="text-center bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded border border-[#c5a880]/20">
                              <span className="text-[8px] text-[#ebd09b] uppercase font-mono tracking-wider">{card.tier}</span>
                            </div>
                            <div className="bg-black border border-[#c5a880]/40 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-mono font-bold text-[#ebd09b]">
                              {card.level}
                            </div>
                          </div>

                          <div className="flex-1 flex items-center justify-center my-2 relative z-10">
                            {!card.image.startsWith('/cards/') && (
                              <div className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-amber-700/20 to-black">
                                {card.image === 'Skull' && <Skull className="w-8 h-8 text-[#dd2c40]" />}
                                {card.image === 'Flame' && <Flame className="w-8 h-8 text-amber-500" />}
                                {card.image === 'Sparkles' && <Sparkles className="w-8 h-8 text-purple-400" />}
                                {card.image === 'Wand' && <Sparkles className="w-8 h-8 text-cyan-400" />}
                                {card.image !== 'Skull' && card.image !== 'Flame' && card.image !== 'Sparkles' && card.image !== 'Wand' && (
                                  <Skull className="w-8 h-8 text-gray-500" />
                                )}
                              </div>
                            )}
                          </div>

                          <div className="relative z-10 space-y-1.5 mt-auto">
                            <div className="text-center">
                              <span className="text-sm font-display font-black text-white block truncate leading-none text-shadow-gold drop-shadow-md">
                                {card.name}
                              </span>
                            </div>

                            {/* Skill preview */}
                            {skill && (
                              <div className="bg-black/60 backdrop-blur-sm border border-gray-900/50 p-1.5 rounded-lg text-[9px] text-gray-300 text-center leading-tight">
                                <span className="font-semibold block text-[#c5a880] uppercase text-[8px]">{skill.type}</span>
                                <span className="line-clamp-1">{skill.description}</span>
                              </div>
                            )}

                            <div className="flex justify-between items-center text-[10px] font-mono font-bold pt-1.5 border-t border-gray-800/80 bg-black/40 backdrop-blur-sm rounded px-1.5 py-1">
                              <span className="text-red-400">⚔️ {card.attack}</span>
                              <span className="text-emerald-400">❤️ {card.health}</span>
                              <span className="text-blue-400">⏳ {card.delay}</span>
                            </div>
                          </div>
                        </div>"""
replace_in_file(r"C:\Users\vaska\Desktop\void-covenant\src\components\GachaStoreView.tsx", gacha_old, gacha_new)
