import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { MobileHeaderHUD } from './MobileHeaderHUD';
import { MobileNavDrawer, MobileTab } from './MobileNavDrawer';
import { CampaignStage } from '../types';
// Dedicated AAA Mobile Landscape Views
import { MobileCampaignView } from './views/MobileCampaignView';
import { MobilePvpView } from './views/MobilePvpView';
import { MobileCollectionView } from './views/MobileCollectionView';
import { MobileHeroView } from './views/MobileHeroView';
import { MobileShopView } from './views/MobileShopView';
import { MobileBattleArena } from './views/MobileBattleArena';

import { MobileBankView } from './views/MobileBankView';
import { MobilePremiumPassView } from './views/MobilePremiumPassView';

// Modals
import { ShardsShopModal } from '../components/ShardsShopModal';
import { GoldShopModal } from '../components/GoldShopModal';
import { DustShopModal } from '../components/DustShopModal';

type MobileTab = 'campaign' | 'pvp' | 'collection' | 'hero' | 'altar' | 'bank' | 'premium';

export const MobileApp: React.FC = () => {
  const {
    profile,
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
  const [shopInitialTab, setShopInitialTab] = useState<'cards' | 'equipment' | 'divine' | 'shields' | 'level_boost'>('cards');
  const [isPvpMatching, setIsPvpMatching] = useState(false);
  const [isPvpModalOpen, setIsPvpModalOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add('mobile-locked');
    return () => {
      document.body.classList.remove('mobile-locked');
    };
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as MobileTab);
  };

  const handleExitBattle = (_isVictory: boolean) => {
    setActiveBattleStage(null);
    setActiveTab(activeBattleType === 'pvp' ? 'pvp' : 'campaign');
  };

  // If battle active, render dedicated AAA MobileBattleArena (Hearthstone drawer, zero slot blocking, GPU-accelerated 60fps)
  if (activeBattleStage) {
    return (
      <div className="h-[var(--app-height,100dvh)] w-full overflow-hidden bg-[#070504]">
        <MobileBattleArena
          stage={activeBattleStage}
          onExitBattle={handleExitBattle}
          battleType={activeBattleType}
        />
      </div>
    );
  }

  return (
    <div className="mobile-shell-locked bg-[#050505] text-white flex flex-col relative w-full h-[var(--app-height,100dvh)] overflow-hidden">
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

          <div className={activeTab === 'altar' ? 'h-full w-full block' : 'hidden'}>
            <MobileShopView initialTab={shopInitialTab} />
          </div>

          <div className={activeTab === 'bank' ? 'h-full w-full block overflow-y-auto' : 'hidden'}>
            <MobileBankView />
          </div>

          <div className={activeTab === 'premium' ? 'h-full w-full block overflow-y-auto' : 'hidden'}>
            <MobilePremiumPassView />
          </div>
        </div>
      </main>

      {/* Expandable Gothic Corner Menu Drawer (Frees up 100% of vertical screen space) */}
      {!isPvpMatching && !isPvpModalOpen && (
        <MobileNavDrawer
          activeTab={activeTab}
          onTabChange={handleTabChange}
          hasNewDefenseAttacks={hasNewDefenseAttacks}
          deckCount={profile?.deck?.length || 0}
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
