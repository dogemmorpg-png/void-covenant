import os

file_battle = r"C:\Users\vaska\Desktop\void-covenant\src\components\BattleFieldView.tsx"
with open(file_battle, "r", encoding="utf-8") as f:
    c = f.read()

if "getCardTierStyles" not in c:
    c = c.replace("import { Card, BattleState, BattleCard, BoardSlot } from '../types';", "import { Card, BattleState, BattleCard, BoardSlot } from '../types';\nimport { getCardTierStyles } from '../utils/tierStyles';")

# Player Hand
old_hand = """className={`relative w-20 md:w-24 aspect-[3/4.2] rounded border p-1 md:p-1.5 flex flex-col justify-between cursor-pointer transition-all hover:-translate-y-2 hover:z-10 ${
                    selectedHandCardId === card.id
                      ? 'bg-[#1f2833] border-[#66fcf1] scale-105 z-10 shadow-neon-blue'
                      : 'bg-black/80 border-white/10'
                  }`}"""
new_hand = """className={`relative w-20 md:w-24 aspect-[3/4.2] rounded p-1 md:p-1.5 flex flex-col justify-between cursor-pointer border ${getCardTierStyles(card.tier, selectedHandCardId === card.id, true)}`}"""
c = c.replace(old_hand, new_hand)

# Player Board
old_player_board = """className={`relative w-full aspect-[3/4.2] rounded border flex flex-col justify-between cursor-pointer transition-all ${
                            selectedBoardCard?.index === index && selectedBoardCard?.side === 'player'
                              ? 'bg-[#1f2833] border-cyan-400 scale-[1.02] shadow-neon-blue z-10'
                              : 'bg-black/90 border-amber-500/30'
                          } ${canAct ? 'shadow-[0_0_15px_rgba(102,252,241,0.3)]' : ''}`}"""
new_player_board = """className={`relative w-full aspect-[3/4.2] rounded flex flex-col justify-between cursor-pointer border ${getCardTierStyles(card.tier, selectedBoardCard?.index === index && selectedBoardCard?.side === 'player', false)} ${canAct ? 'shadow-[0_0_15px_rgba(102,252,241,0.3)]' : ''}`}"""
c = c.replace(old_player_board, new_player_board)

# Enemy Board
old_enemy_board = """className={`relative w-full aspect-[3/4.2] rounded border flex flex-col justify-between cursor-pointer transition-all ${
                            selectedBoardCard?.index === index && selectedBoardCard?.side === 'enemy'
                              ? 'bg-[#1f2833] border-red-400 scale-[1.02] shadow-neon-crimson z-10'
                              : 'bg-black/60 border-red-900/30'
                          } ${canAct ? 'shadow-[0_0_15px_rgba(221,44,64,0.3)]' : ''}`}"""
new_enemy_board = """className={`relative w-full aspect-[3/4.2] rounded flex flex-col justify-between cursor-pointer border ${getCardTierStyles(card.tier, selectedBoardCard?.index === index && selectedBoardCard?.side === 'enemy', false)} ${canAct ? 'shadow-[0_0_15px_rgba(221,44,64,0.3)]' : ''}`}"""
c = c.replace(old_enemy_board, new_enemy_board)

with open(file_battle, "w", encoding="utf-8") as f:
    f.write(c)

print("BattleFieldView patched")
