const fs = require('fs');

function fixCollectionDeckView() {
    let content = fs.readFileSync('src/components/CollectionDeckView.tsx', 'utf8');
    content = content.replace(
        "&& '<img src=\"/icons/icon_dust.png\" alt=\"Dust\" className=\"drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1\" /> Hex'}",
        "&& <><img src=\"/icons/icon_dust.png\" alt=\"Dust\" className=\"drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1\" /> Hex</>}"
    );
    fs.writeFileSync('src/components/CollectionDeckView.tsx', content);
    console.log("Fixed CollectionDeckView");
}

function fixAirdropHubView() {
    let content = fs.readFileSync('src/components/AirdropHubView.tsx', 'utf8');
    content = content.replace(
        "task.rewardType === 'shards' ? '<img src=\"/icons/icon_shards.png\" alt=\"Shards\" className=\"drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1\" />' : task.rewardType === 'gold' ? '<img src=\"/icons/icon_gold.png\" alt=\"Gold\" className=\"drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1\" />' : '<img src=\"/icons/icon_dust.png\" alt=\"Dust\" className=\"drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1\" />'",
        "task.rewardType === 'shards' ? <img src=\"/icons/icon_shards.png\" alt=\"Shards\" className=\"drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1\" /> : task.rewardType === 'gold' ? <img src=\"/icons/icon_gold.png\" alt=\"Gold\" className=\"drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1\" /> : <img src=\"/icons/icon_dust.png\" alt=\"Dust\" className=\"drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1\" />"
    );
    fs.writeFileSync('src/components/AirdropHubView.tsx', content);
    console.log("Fixed AirdropHubView");
}

function fixLandingPage() {
    let content = fs.readFileSync('src/components/LandingPage.tsx', 'utf8');
    content = content.replace(
        "icon: '<img src=\"/icons/icon_dust.png\" alt=\"Dust\" className=\"drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1\" />',",
        "icon: <img src=\"/icons/icon_dust.png\" alt=\"Dust\" className=\"drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1\" />,"
    );
    content = content.replace(
        "icon: '<img src=\"/icons/icon_shards.png\" alt=\"Shards\" className=\"drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1\" />',",
        "icon: <img src=\"/icons/icon_shards.png\" alt=\"Shards\" className=\"drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1\" />,"
    );
    fs.writeFileSync('src/components/LandingPage.tsx', content);
    console.log("Fixed LandingPage");
}

function fixBattleFieldView() {
    let content = fs.readFileSync('src/components/BattleFieldView.tsx', 'utf8');
    
    // Change getSkillIcon to return JSX
    content = content.replace(
        "case 'hex': return '<img src=\"/icons/icon_dust.png\" alt=\"Dust\" className=\"drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1\" />';",
        "case 'hex': return <img src=\"/icons/icon_dust.png\" alt=\"Dust\" className=\"drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] brightness-110 contrast-125 w-7 h-7 inline-block align-text-bottom mx-1\" />;"
    );

    // Change log rendering to dangerouslySetInnerHTML
    content = content.replace(
        "<div key={index} className={`border-b border-gray-900/20 pb-0.5 leading-relaxed ${colorClass}`}>\n                    {log}\n                  </div>",
        "<div key={index} className={`border-b border-gray-900/20 pb-0.5 leading-relaxed ${colorClass}`} dangerouslySetInnerHTML={{ __html: log }} />"
    );
    fs.writeFileSync('src/components/BattleFieldView.tsx', content);
    console.log("Fixed BattleFieldView");
}

fixCollectionDeckView();
fixAirdropHubView();
fixLandingPage();
fixBattleFieldView();
