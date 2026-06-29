import os

filepath = r"C:\Users\vaska\Desktop\void-covenant\src\components\BattleFieldView.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add addCardToCollection to useGame
if "const { profile, addGold, addDust, addShards, addBattlePassPoints } = useGame();" in content:
    content = content.replace(
        "const { profile, addGold, addDust, addShards, addBattlePassPoints } = useGame();",
        "const { profile, addGold, addDust, addShards, addBattlePassPoints, addCardToCollection } = useGame();"
    )
elif "const { profile, setProfile, addGold, addDust, addShards, addBattlePassPoints" in content:
    content = content.replace(
        "const { profile, setProfile, addGold, addDust, addShards, addBattlePassPoints",
        "const { profile, setProfile, addGold, addDust, addShards, addBattlePassPoints, addCardToCollection"
    )

# 2. handleBattleWon logic
old_won = """  const handleBattleWon = () => {
    if (soundOn) playSound('victory');
    addGold(stage.goldReward);
    addDust(stage.dustReward);
    if (stage.shardsReward > 0) {
      addShards(stage.shardsReward);
    }
    addBattlePassPoints(50);"""

new_won = """  const handleBattleWon = () => {
    if (soundOn) playSound('victory');
    addGold(stage.goldReward);
    addDust(stage.dustReward);
    if (stage.shardsReward > 0) {
      addShards(stage.shardsReward);
    }
    addBattlePassPoints(50);
    
    // Check for card reward
    if (battleType === 'campaign' && stage.cardReward) {
      // Create and add the card instance using the template
      addCardToCollection(stage.cardReward as any, 1);
    }"""

if old_won in content:
    content = content.replace(old_won, new_won)

# 3. Reward list display
old_reward_list = """              <div className="flex justify-around items-center">
                <div className="text-center">
                  <span className="text-amber-500 font-bold block text-sm">+{stage.goldReward} 🪙</span>
                  <span className="text-[9px] text-gray-500 font-mono">Gold</span>
                </div>
                <div className="text-center">
                  <span className="text-[#66fcf1] font-bold block text-sm">+{stage.dustReward} 🔮</span>
                  <span className="text-[9px] text-gray-500 font-mono">Dark Dust</span>
                </div>
                {battleType === 'pvp' ? (
                  <div className="text-center">
                    <span className="text-cyan-400 font-bold block text-sm">+25 🏆</span>
                    <span className="text-[9px] text-gray-500 font-mono">MMR Rating</span>
                  </div>
                ) : (
                  stage.shardsReward > 0 && (
                    <div className="text-center">
                      <span className="text-red-500 font-bold block text-sm">+{stage.shardsReward} 💎</span>
                      <span className="text-[9px] text-gray-500 font-mono">Shards</span>
                    </div>
                  )
                )}
              </div>"""

new_reward_list = """              <div className="flex justify-around items-center flex-wrap gap-2">
                <div className="text-center">
                  <span className="text-amber-500 font-bold block text-sm">+{stage.goldReward} 🪙</span>
                  <span className="text-[9px] text-gray-500 font-mono">Gold</span>
                </div>
                <div className="text-center">
                  <span className="text-[#66fcf1] font-bold block text-sm">+{stage.dustReward} 🔮</span>
                  <span className="text-[9px] text-gray-500 font-mono">Dark Dust</span>
                </div>
                {battleType === 'pvp' ? (
                  <div className="text-center">
                    <span className="text-cyan-400 font-bold block text-sm">+25 🏆</span>
                    <span className="text-[9px] text-gray-500 font-mono">MMR Rating</span>
                  </div>
                ) : (
                  <>
                    {stage.shardsReward > 0 && (
                      <div className="text-center">
                        <span className="text-red-500 font-bold block text-sm">+{stage.shardsReward} 💎</span>
                        <span className="text-[9px] text-gray-500 font-mono">Shards</span>
                      </div>
                    )}
                    {stage.cardReward && (
                      <div className="text-center">
                        <span className="text-emerald-500 font-bold block text-sm">{stage.cardReward.name} 🎴</span>
                        <span className="text-[9px] text-emerald-700 font-mono">Card Reward</span>
                      </div>
                    )}
                  </>
                )}
              </div>"""

if old_reward_list in content:
    content = content.replace(old_reward_list, new_reward_list)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("BattleFieldView patched")
