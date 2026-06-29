const fs = require('fs');

let content = fs.readFileSync('src/components/GachaStoreView.tsx', 'utf8');

// 1. Destructure setProfile
content = content.replace(
  "const { profile, spendGold, spendShards, addCardToCollection, addEquipmentToCollection } = useGame();",
  "const { profile, spendGold, spendShards, addCardToCollection, addEquipmentToCollection, setProfile } = useGame();"
);

// 2. Replace triggerOpeningAnimation logic
const oldTrigger = `  const triggerOpeningAnimation = (packType: 'bronze' | 'obsidian' | 'abyssal', numCards: number) => {
    audioSystem.playMagic();
    setOpeningPack(packType);
    setRevealedCards([]);
    setIsRevealed(false);

    // Pick random cards based on pool
    const pool = CARD_TEMPLATES;
    let selectedTemplates: any[] = [];

    for (let i = 0; i < numCards; i++) {
      let rand = Math.random() * 100;
      let cardTemplate;

      if (packType === 'bronze') {
        // 95% Bronze, 5% Silver
        if (rand < 95) {
          const bronzePool = pool.filter(c => c.tier === 'bronze');
          cardTemplate = bronzePool[Math.floor(Math.random() * bronzePool.length)];
        } else {
          const silverPool = pool.filter(c => c.tier === 'silver');
          cardTemplate = silverPool[Math.floor(Math.random() * silverPool.length)];
        }
      } else if (packType === 'obsidian') {
        // 40% Bronze (L2-3), 50% Silver, 10% Gold
        if (rand < 40) {
          const bronzePool = pool.filter(c => c.tier === 'bronze');
          cardTemplate = bronzePool[Math.floor(Math.random() * bronzePool.length)];
        } else if (rand < 90) {
          const silverPool = pool.filter(c => c.tier === 'silver');
          cardTemplate = silverPool[Math.floor(Math.random() * silverPool.length)];
        } else {
          const goldPool = pool.filter(c => c.tier === 'gold');
          cardTemplate = goldPool[Math.floor(Math.random() * goldPool.length)];
        }
      } else {
        // Abyssal: 40% Silver, 45% Gold, 15% Legendary
        if (rand < 40) {
          const silverPool = pool.filter(c => c.tier === 'silver');
          cardTemplate = silverPool[Math.floor(Math.random() * silverPool.length)];
        } else if (rand < 85) {
          const goldPool = pool.filter(c => c.tier === 'gold');
          cardTemplate = goldPool[Math.floor(Math.random() * goldPool.length)];
        } else {
          const legendaryPool = pool.filter(c => c.tier === 'legendary');
          cardTemplate = legendaryPool[Math.floor(Math.random() * legendaryPool.length)];
        }
      }

      // Roll level (bronze pack has level 1, obsidian/abyssal can roll level 1 to 2)
      let rollLevel = 1;
      if (packType === 'obsidian' && Math.random() < 0.3) rollLevel = 2;
      if (packType === 'abyssal' && Math.random() < 0.4) rollLevel = 2;

      // Add to collection in context and save in state
      const newCardInstance = addCardToCollection(cardTemplate, rollLevel);
      selectedTemplates.push(newCardInstance);
    }

    setRevealedCards(selectedTemplates);

    // Delay visual reveal steps
    setTimeout(() => {
      setIsRevealed(true);
    }, 1500);
  };`;

const newTrigger = `  const triggerOpeningAnimationBackend = (packType: 'bronze' | 'obsidian' | 'abyssal', newCards: any[]) => {
    audioSystem.playMagic();
    setOpeningPack(packType);
    setRevealedCards(newCards);
    setIsRevealed(false);
    setTimeout(() => setIsRevealed(true), 1500);
  };

  const buyPackBackend = async (packType: 'bronze' | 'obsidian' | 'abyssal') => {
    try {
      const token = localStorage.getItem('void_covenant_token');
      if (!token) {
        toast('Please connect and authenticate your wallet first.', 'warning');
        return;
      }
      
      const res = await fetch('/api/gacha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({ packType, numCards: 3 })
      });
      
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || 'Failed to purchase pack', 'error');
        return;
      }
      
      setProfile(data.profile);
      triggerOpeningAnimationBackend(packType, data.newCards);
      
    } catch (e) {
      console.error(e);
      toast('Network error while purchasing pack', 'error');
    }
  };`;

content = content.replace(oldTrigger, newTrigger);

// 3. Replace buyBronzePack etc
content = content.replace(
  "const buyBronzePack = () => {\r\n    if (spendGold(300)) {\r\n      triggerOpeningAnimation('bronze', 3);\r\n    } else {\r\n      toast('Not enough gold! Complete Campaign missions or exchange shards.', 'warning');\r\n    }\r\n  };",
  "const buyBronzePack = () => buyPackBackend('bronze');"
);
// Support LF as well just in case
content = content.replace(
  "const buyBronzePack = () => {\n    if (spendGold(300)) {\n      triggerOpeningAnimation('bronze', 3);\n    } else {\n      toast('Not enough gold! Complete Campaign missions or exchange shards.', 'warning');\n    }\n  };",
  "const buyBronzePack = () => buyPackBackend('bronze');"
);

content = content.replace(
  "const buyObsidianPack = () => {\r\n    if (spendShards(30)) {\r\n      triggerOpeningAnimation('obsidian', 3);\r\n    } else {\r\n      toast('Not enough Dark Shards! Connect Solana wallet, complete airdrop tasks, or buy shards.', 'warning');\r\n    }\r\n  };",
  "const buyObsidianPack = () => buyPackBackend('obsidian');"
);
content = content.replace(
  "const buyObsidianPack = () => {\n    if (spendShards(30)) {\n      triggerOpeningAnimation('obsidian', 3);\n    } else {\n      toast('Not enough Dark Shards! Connect Solana wallet, complete airdrop tasks, or buy shards.', 'warning');\n    }\n  };",
  "const buyObsidianPack = () => buyPackBackend('obsidian');"
);

content = content.replace(
  "const buyAbyssalPack = () => {\r\n    if (spendShards(100)) {\r\n      triggerOpeningAnimation('abyssal', 3);\r\n    } else {\r\n      toast('Not enough Dark Shards! Buy shards to unlock Abyssal pacts.', 'warning');\r\n    }\r\n  };",
  "const buyAbyssalPack = () => buyPackBackend('abyssal');"
);
content = content.replace(
  "const buyAbyssalPack = () => {\n    if (spendShards(100)) {\n      triggerOpeningAnimation('abyssal', 3);\n    } else {\n      toast('Not enough Dark Shards! Buy shards to unlock Abyssal pacts.', 'warning');\n    }\n  };",
  "const buyAbyssalPack = () => buyPackBackend('abyssal');"
);

fs.writeFileSync('src/components/GachaStoreView.tsx', content);
