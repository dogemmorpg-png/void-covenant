import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { MobileHeaderHUD } from './MobileHeaderHUD';
import { MobileNavBar } from './MobileNavBar';
import { CampaignStage } from '../types';

// Mobile-optimized view components
import { MobileCampaignView } from './MobileCampaignView';
import { MobileCollectionView } from './MobileCollectionView';
import { MobileGachaView } from './MobileGachaView';
import { MobilePvpView } from './MobilePvpView';
import { MobileHeroView } from './MobileHeroView';
import { MobileTalentsView } from './MobileTalentsView';
import { MobileBankView } from './MobileBankView';
import { MobilePremiumView } from './MobilePremiumView';
import MobileBattleView from './MobileBattleView';

// Modals (shared with desktop)
import { ShardsShopModal } from '../components/ShardsShopModal';
import { GoldShopModal } from '../components/GoldShopModal';
import { DustShopModal } from '../components/DustShopModal';

type MobileTab = 'campaign' | 'pvp' | 'collection' | 'hero' | 'talents' | 'altar' | 'bank' | 'premium';

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
  const [shopInitialTab, setShopInitialTab] = useState<'cards' | 'equipment' | 'divine' | 'shields'>('cards');
  const [isPvpMatching, setIsPvpMatching] = useState(false);
  const [isPvpModalOpen, setIsPvpModalOpen] = useState(false);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as MobileTab);
  };

  const handleExitBattle = (isVictory: boolean) => {
    setActiveBattleStage(null);
    setActiveTab(activeBattleType === 'pvp' ? 'pvp' : 'campaign');
  };

  // If a battle is active, render the mobile battlefield full-screen (no HUD/NavBar)
  if (activeBattleStage) {
    return (
      <MobileBattleView
        stage={activeBattleStage}
        onExitBattle={handleExitBattle}
        battleType={activeBattleType}
      />
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'campaign':
        return (
          <MobileCampaignView onStartBattle={(stage) => {
            setActiveBattleType('campaign');
            setActiveBattleStage(stage);
            startBattleOnServer('campaign', stage.id.toString(), stage.energyCost).then(success => {
              if (!success) setActiveBattleStage(null);
            }).catch(() => {});
          }} />
        );
      case 'pvp':
        return (
          <MobilePvpView
            onStartBattle={async (stage: any, type: any, opponentPayload: any) => {
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
        );
      case 'collection': return <MobileCollectionView />;
      case 'hero':
        return (
          <MobileHeroView
            onNavigateToShop={(tab = 'divine') => {
              setShopInitialTab(tab as any);
              setActiveTab('altar');
            }}
          />
        );
      case 'talents': return <MobileTalentsView />;
      case 'altar': return <MobileGachaView initialTab={shopInitialTab} />;
      case 'premium': return <MobilePremiumView />;
      case 'bank': return <MobileBankView />;
      default:
        return (
          <div className="flex items-center justify-center h-full w-full">
            <h2 className="font-display text-2xl text-gray-500 uppercase">{activeTab}</h2>
          </div>
        );
    }
  };

  return (
    <div className="mobile-shell-locked bg-[#050505] text-white flex flex-col relative">
      {/* Top HUD — hidden during PvP matching/modal for immersion */}
      {!isPvpMatching && !isPvpModalOpen && (
        <MobileHeaderHUD onNavigateTab={handleTabChange} />
      )}

      <main className="mobile-content-area flex-1 relative w-full overflow-y-auto">
        {renderActiveView()}
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
