import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { MobileHeaderHUD } from './MobileHeaderHUD';
import { MobileNavBar } from './MobileNavBar';
import { CampaignStage } from '../types';

// Genuine full game components (identical logic and mechanics to desktop)
import { CampaignView } from '../components/CampaignView';
import { CollectionDeckView } from '../components/CollectionDeckView';
import { GachaStoreView } from '../components/GachaStoreView';
import { PvpArenaView } from '../components/PvpArenaView';
import { BattleFieldView } from '../components/BattleFieldView';
import { HeroInventoryView } from '../components/HeroInventoryView';
import { TalentsView } from '../components/TalentsView';
import { BankView } from '../components/BankView';
import { PremiumPassView } from '../components/PremiumPassView';

// Modals
import { ShardsShopModal } from '../components/ShardsShopModal';
import { GoldShopModal } from '../components/GoldShopModal';
import { DustShopModal } from '../components/DustShopModal';

type MobileTab = 'campaign' | 'pvp' | 'collection' | 'hero' | 'talents' | 'altar' | 'bank' | 'premium';

export const MobileApp: React.FC = () => {
  const {
    startBattleOnServer,
    hasNewDefenseAttacks,
    isShardsShopOpen,
    setIsShardsShopOpen,
    isGoldShopOpen,
    setIsGoldShopOpen,
    isDustShopOpen,
    setIsDustShopOpen,
  } = useGame();

  const [activeTab, setActiveTab] = useState<MobileTab>('campaign');
  const [activeBattleStage, setActiveBattleStage] = useState<CampaignStage | null>(null);
  const [activeBattleType, setActiveBattleType] = useState<'campaign' | 'pvp'>('campaign');
  const [shopInitialTab, setShopInitialTab] = useState<'cards' | 'equipment' | 'divine' | 'shields'>('cards');
  const [isPvpMatching, setIsPvpMatching] = useState(false);
  const [isPvpModalOpen, setIsPvpModalOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as MobileTab);
  };

  const handleExitBattle = (_isVictory: boolean) => {
    setActiveBattleStage(null);
    setActiveTab(activeBattleType === 'pvp' ? 'pvp' : 'campaign');
  };

  // If a battle is active, render the genuine BattleFieldView full-screen in mobile shell
  if (activeBattleStage) {
    return (
      <div className="mobile-battle-shell h-[100dvh] w-full overflow-hidden">
        <BattleFieldView
          stage={activeBattleStage}
          onExitBattle={handleExitBattle}
          battleType={activeBattleType}
        />
      </div>
    );
  }

  return (
    <div className="mobile-shell-locked bg-[#050505] text-white flex flex-col relative w-full h-[100dvh] overflow-hidden">
      {/* Top HUD — hidden during PvP matching/modal for maximum immersion */}
      {!isPvpMatching && !isPvpModalOpen && (
        <MobileHeaderHUD onNavigateTab={handleTabChange} />
      )}

      {/* Main Tab Content — preserves DOM mount state with block/hidden like desktop */}
      <main className="mobile-content-area flex-1 relative w-full overflow-y-auto min-h-0">
        <div className="py-2 px-1 sm:px-3">
          <div className={activeTab === 'campaign' ? 'block' : 'hidden'}>
            <CampaignView onStartBattle={(stage) => {
              setActiveBattleType('campaign');
              setActiveBattleStage(stage);
              startBattleOnServer('campaign', stage.id.toString(), stage.energyCost).then(success => {
                if (!success) setActiveBattleStage(null);
              }).catch(() => {});
            }} />
          </div>

          <div className={activeTab === 'pvp' ? 'block' : 'hidden'}>
            <PvpArenaView 
              onStartBattle={async (stage, type, opponentPayload) => {
                setActiveBattleType(type);
                setActiveBattleStage(stage);
                startBattleOnServer('pvp', stage.id.toString(), 1, opponentPayload).then(success => {
                  if (!success) setActiveBattleStage(null);
                }).catch(() => {});
                return true;
              }}
              isMatching={isPvpMatching}
              setIsMatching={setIsPvpMatching}
              isModalOpen={isPvpModalOpen}
              setIsModalOpen={setIsPvpModalOpen}
              onNavigateToShop={(tab = 'shields') => {
                setShopInitialTab(tab as any);
                setActiveTab('altar');
              }}
            />
          </div>

          <div className={activeTab === 'collection' ? 'block' : 'hidden'}>
            <CollectionDeckView />
          </div>

          <div className={activeTab === 'hero' ? 'block' : 'hidden'}>
            <HeroInventoryView 
              onNavigateToShop={(tab = 'divine') => {
                setShopInitialTab(tab as any);
                setActiveTab('altar');
              }}
            />
          </div>

          <div className={activeTab === 'talents' ? 'block' : 'hidden'}>
            <TalentsView />
          </div>

          <div className={activeTab === 'altar' ? 'block' : 'hidden'}>
            <GachaStoreView initialTab={shopInitialTab} />
          </div>

          <div className={activeTab === 'bank' ? 'block' : 'hidden'}>
            <BankView />
          </div>

          <div className={activeTab === 'premium' ? 'block' : 'hidden'}>
            <PremiumPassView />
          </div>
        </div>
      </main>

      {/* Bottom Navigation — hidden during PvP matching/modal */}
      {!isPvpMatching && !isPvpModalOpen && (
        <MobileNavBar
          activeTab={activeTab as any}
          onTabChange={handleTabChange}
          hasNewDefenseAttacks={hasNewDefenseAttacks}
        />
      )}

      {/* Global Shop Modals */}
      {isShardsShopOpen && (
        <ShardsShopModal onClose={() => setIsShardsShopOpen(false)} />
      )}
      {isGoldShopOpen && (
        <GoldShopModal onClose={() => setIsGoldShopOpen(false)} />
      )}
      {isDustShopOpen && (
        <DustShopModal onClose={() => setIsDustShopOpen(false)} />
      )}
    </div>
  );
};

export default MobileApp;
