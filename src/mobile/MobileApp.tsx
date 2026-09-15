import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { MobileHeaderHUD } from './MobileHeaderHUD';
import { MobileNavBar } from './MobileNavBar';
import { CampaignStage } from '../types';

// Dedicated AAA Mobile Landscape Views
import { MobileCampaignView } from './views/MobileCampaignView';
import { MobilePvpView } from './views/MobilePvpView';
import { MobileCollectionView } from './views/MobileCollectionView';
import { MobileHeroView } from './views/MobileHeroView';
import { MobileBattleView } from './views/MobileBattleView';

// Desktop Shared Views for Store, Bank & Premium
import { GachaStoreView } from '../components/GachaStoreView';
import { BankView } from '../components/BankView';
import { PremiumPassView } from '../components/PremiumPassView';

// Modals
import { ShardsShopModal } from '../components/ShardsShopModal';
import { GoldShopModal } from '../components/GoldShopModal';
import { DustShopModal } from '../components/DustShopModal';

type MobileTab = 'campaign' | 'pvp' | 'collection' | 'hero' | 'altar' | 'bank' | 'premium';

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

  // If battle active, render dedicated mobile combat view (full-screen, unblocked)
  if (activeBattleStage) {
    return (
      <div className="h-[100dvh] w-full overflow-hidden bg-[#070504]">
        <MobileBattleView
          stage={activeBattleStage}
          onExitBattle={handleExitBattle}
          battleType={activeBattleType}
        />
      </div>
    );
  }

  return (
    <div className="mobile-shell-locked bg-[#050505] text-white flex flex-col relative w-full h-[100dvh] overflow-hidden">
      {/* Top HUD — Telegram-safe insets */}
      {!isPvpMatching && !isPvpModalOpen && (
        <MobileHeaderHUD onNavigateTab={handleTabChange} />
      )}

      {/* Main Tab Content — 100% fitted to mobile landscape console layout */}
      <main className="mobile-content-area flex-1 relative w-full overflow-hidden min-h-0">
        <div className="h-full w-full">
          <div className={activeTab === 'campaign' ? 'h-full w-full block' : 'hidden'}>
            <MobileCampaignView onStartBattle={(stage) => {
              setActiveBattleType('campaign');
              setActiveBattleStage(stage);
              startBattleOnServer('campaign', stage.id.toString(), stage.energyCost).then(success => {
                if (!success) setActiveBattleStage(null);
              }).catch(() => {});
            }} />
          </div>

          <div className={activeTab === 'pvp' ? 'h-full w-full block' : 'hidden'}>
            <MobilePvpView 
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

          <div className={activeTab === 'collection' ? 'h-full w-full block' : 'hidden'}>
            <MobileCollectionView />
          </div>

          <div className={activeTab === 'hero' ? 'h-full w-full block' : 'hidden'}>
            <MobileHeroView 
              onNavigateToShop={(tab = 'divine') => {
                setShopInitialTab(tab as any);
                setActiveTab('altar');
              }}
            />
          </div>

          <div className={activeTab === 'altar' ? 'h-full w-full block overflow-y-auto' : 'hidden'}>
            <div className="p-2">
              <GachaStoreView initialTab={shopInitialTab} />
            </div>
          </div>

          <div className={activeTab === 'bank' ? 'h-full w-full block overflow-y-auto' : 'hidden'}>
            <div className="p-2">
              <BankView />
            </div>
          </div>

          <div className={activeTab === 'premium' ? 'h-full w-full block overflow-y-auto' : 'hidden'}>
            <div className="p-2">
              <PremiumPassView />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      {!isPvpMatching && !isPvpModalOpen && (
        <MobileNavBar
          activeTab={activeTab}
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
