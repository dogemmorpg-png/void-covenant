import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { ToastProvider } from './components/Toast';
import { audioSystem } from './utils/AudioSystem';
import { HeaderHUD } from './components/HeaderHUD';
import { CampaignView } from './components/CampaignView';
import { CollectionDeckView } from './components/CollectionDeckView';
import { GachaStoreView } from './components/GachaStoreView';
import { AirdropHubView } from './components/AirdropHubView';
import { BattlePassView } from './components/BattlePassView';
import { BattleFieldView } from './components/BattleFieldView';
import { PvpArenaView } from './components/PvpArenaView';
import { HeroInventoryView } from './components/HeroInventoryView';
import { CampaignStage } from './types';
import { Swords, FolderGit, Sparkles, Wallet, Award, Trophy, UserCircle2 } from 'lucide-react';
import { BATTLE_PASS_TIERS, AIRDROP_TASKS } from './data/cards';
import { LandingPage } from './components/LandingPage';
import { RegistrationScreen } from './components/RegistrationScreen';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

function MainAppContent() {
  const { profile, isLoadingProfile, connectSolanaWallet, registerPlayer, disconnectSolanaWallet } = useGame();
  const { connected, publicKey, signMessage, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  
  const [isVerified, setIsVerified] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  
  // Tab states
  const [activeTab, setActiveTab] = useState<'campaign' | 'pvp' | 'collection' | 'hero' | 'altar' | 'airdrop' | 'battlepass'>('campaign');
  
  // Active Battle stage state
  const [activeBattleStage, setActiveBattleStage] = useState<CampaignStage | null>(null);
  const [activeBattleType, setActiveBattleType] = useState<'campaign' | 'pvp'>('campaign');

  // When battle ends
  const handleExitBattle = (isVictory: boolean) => {
    setActiveBattleStage(null);
    setActiveTab(activeBattleType === 'pvp' ? 'pvp' : 'campaign');
  };

  // Notification badges
  const hasUnclaimedBP = BATTLE_PASS_TIERS.some((tier, idx) => {
    const isUnlocked = profile.battlePassPoints >= tier.pointsRequired;
    const freeClaimId = idx * 2;
    return isUnlocked && !profile.battlePassClaimed.includes(freeClaimId);
  });

  const hasUnfinishedTasks = AIRDROP_TASKS.some(task => 
    !profile.completedTasks.includes(task.id) && 
    !(task.id === 'wallet_connect' && profile.TONWalletAddress)
  );

  React.useEffect(() => {
    // Reset verification if disconnected
    if (!connected) {
      setIsVerified(false);
      setIsSigning(false);
      if (profile.solanaAddress) {
        disconnectSolanaWallet();
      }
      return;
    }

    if (connected && publicKey) {
      // If we haven't verified the signature yet for this session
      if (!isVerified && !isSigning) {
        const performSignature = async () => {
          if (!signMessage) {
            console.warn("Wallet does not support message signing!");
            setIsVerified(true);
            return;
          }
          
          try {
            setIsSigning(true);
            const message = new TextEncoder().encode(`Welcome to Void Covenant!\n\nPlease sign this message to authenticate your wallet.\n\nTimestamp: ${Date.now()}`);
            await signMessage(message);
            setIsVerified(true);
          } catch (error) {
            console.error("Signature rejected or failed:", error);
            // Disconnect if they refuse to sign
            disconnect().catch(() => {});
          } finally {
            setIsSigning(false);
          }
        };
        performSignature();
      } else if (isVerified) {
        // Only load the game profile AFTER they have successfully signed
        if (!profile.solanaAddress || profile.solanaAddress !== publicKey.toBase58()) {
          connectSolanaWallet(publicKey.toBase58());
        }
      }
    }
  }, [connected, publicKey, isVerified, isSigning, profile.solanaAddress, connectSolanaWallet, disconnectSolanaWallet, signMessage, disconnect]);

  if (!connected) {
    return (
      <LandingPage
        onConnectWallet={() => setVisible(true)}
        isConnecting={false}
      />
    );
  }

  // Prevent UI flickering while profile state syncs with wallet connection state
  if (connected && publicKey && (!isVerified || profile.solanaAddress !== publicKey.toBase58() || isLoadingProfile)) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-t-2 border-r-2 border-t-[#dd2c40] border-r-transparent animate-spin" />
          <p className="text-[#dd2c40] font-mono text-xs tracking-[0.3em] animate-pulse">
            {isSigning ? 'AWAITING SIGNATURE...' : isLoadingProfile ? 'LOADING PROFILE...' : 'SYNCING...'}
          </p>
        </div>
      </div>
    );
  }

  if (!profile.isRegistered) {
    return (
      <RegistrationScreen 
        onRegister={(username, avatarUrl) => registerPlayer(username, avatarUrl)} 
      />
    );
  }

  // If in active battle, render full screen combat field for maximum immersion
  if (activeBattleStage) {
    return (
      <BattleFieldView
        stage={activeBattleStage}
        onExitBattle={handleExitBattle}
        battleType={activeBattleType}
      />
    );
  }

  return (
    <>
      <div className="bg-noise" />
      <div className="ambient-orb-1" />
      <div className="ambient-orb-2" />
      <div className="min-h-screen flex flex-col justify-between relative z-10">
        <div>
          {/* Top bar resource hud and wallet */}
          <HeaderHUD />

          {/* Tab content */}
          <div className="py-6">
            {activeTab === 'campaign' && (
              <CampaignView onStartBattle={(stage) => {
                setActiveBattleType('campaign');
                setActiveBattleStage(stage);
              }} />
          )}
          {activeTab === 'pvp' && (
            <PvpArenaView onStartBattle={(stage, type) => {
              setActiveBattleType(type);
              setActiveBattleStage(stage);
            }} />
          )}
          {activeTab === 'collection' && <CollectionDeckView />}
          {activeTab === 'hero' && <HeroInventoryView />}
          {activeTab === 'altar' && <GachaStoreView />}
          {activeTab === 'airdrop' && <AirdropHubView />}
          {activeTab === 'battlepass' && <BattlePassView />}
        </div>
      </div>

      {/* Navigation Footer Tab Bar (Mobile responsive and desktop styled) */}
      <div className="bg-[#151a21]/95 border-t border-[#c5a880]/20 sticky bottom-0 z-50 backdrop-blur-md py-2.5">
        <div className="max-w-4xl mx-auto flex items-center justify-around gap-2 px-4">
          
          {/* Campaign Tab */}
          <button onMouseEnter={() => audioSystem.playHover()} onClick={() => { audioSystem.playClick(); setActiveTab('campaign'); }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'campaign'
                ? 'text-[#ebd09b] bg-black/40 border border-[#c5a880]/30 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Swords className="w-5 h-5" />
            <span className="text-[10px] font-display font-bold tracking-wider">CAMPAIGN</span>
          </button>

          {/* Arena Tab */}
          <button onMouseEnter={() => audioSystem.playHover()} onClick={() => { audioSystem.playClick(); setActiveTab('pvp'); }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'pvp'
                ? 'text-[#ebd09b] bg-black/40 border border-[#c5a880]/30 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-[10px] font-display font-bold tracking-wider">ARENA</span>
          </button>

          {/* Collection Tab */}
          <button onMouseEnter={() => audioSystem.playHover()} onClick={() => { audioSystem.playClick(); setActiveTab('collection'); }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'collection'
                ? 'text-[#ebd09b] bg-black/40 border border-[#c5a880]/30 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FolderGit className="w-5 h-5" />
            <span className="text-[10px] font-display font-bold tracking-wider">CARDS</span>
          </button>

          {/* Hero Tab */}
          <button onMouseEnter={() => audioSystem.playHover()} onClick={() => { audioSystem.playClick(); setActiveTab('hero'); }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'hero'
                ? 'text-[#ebd09b] bg-black/40 border border-[#c5a880]/30 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserCircle2 className="w-5 h-5" />
            <span className="text-[10px] font-display font-bold tracking-wider">LORD</span>
          </button>

          {/* Altar Gacha Tab */}
          <button onMouseEnter={() => audioSystem.playHover()} onClick={() => { audioSystem.playClick(); setActiveTab('altar'); }}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'altar'
                ? 'text-[#ebd09b] bg-black/40 border border-[#c5a880]/30 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] font-display font-bold tracking-wider">SUMMON</span>
          </button>

          {/* Airdrop Web3 Tab */}
          <button onMouseEnter={() => audioSystem.playHover()} onClick={() => { audioSystem.playClick(); setActiveTab('airdrop'); }}
            className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'airdrop'
                ? 'text-[#ebd09b] bg-black/40 border border-[#c5a880]/30 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] font-display font-bold tracking-wider">AIRDROP</span>
            {hasUnfinishedTasks && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#dd2c40] rounded-full animate-ping" />
            )}
          </button>

          {/* Battle Pass Tab */}
          <button onMouseEnter={() => audioSystem.playHover()} onClick={() => { audioSystem.playClick(); setActiveTab('battlepass'); }}
            className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'battlepass'
                ? 'text-[#ebd09b] bg-black/40 border border-[#c5a880]/30 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Award className="w-5 h-5" />
            <span className="text-[10px] font-display font-bold tracking-wider">BATTLE PASS</span>
            {hasUnclaimedBP && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#dd2c40] rounded-full animate-ping" />
            )}
          </button>

        </div>
      </div>
    </div>
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <ToastProvider>
        <MainAppContent />
      </ToastProvider>
    </GameProvider>
  );
}
