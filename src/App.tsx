import React, { useState, useEffect, useRef } from 'react';
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
  const lastWalletRef = useRef<string | null>(null);

  // Auto-detect wallet switching or disconnection
  useEffect(() => {
    const currentKeyStr = publicKey ? publicKey.toBase58() : null;
    if (currentKeyStr !== lastWalletRef.current) {
      lastWalletRef.current = currentKeyStr;
      setIsVerified(false);
      setIsSigning(false);
      if (!connected || !publicKey) {
        localStorage.removeItem('void_covenant_token');
        disconnectSolanaWallet();
      }
    }
  }, [connected, publicKey, disconnectSolanaWallet]);
  
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
    !(task.id === 'wallet_connect' && profile.solanaAddress)
  );

  useEffect(() => {
    if (!connected) {
      setIsVerified(false);
      setIsSigning(false);
      return;
    }

    if (connected && publicKey) {
      // If signature is not verified for current wallet
      if (!isVerified && !isSigning) {
        const performSignature = async () => {
          if (!signMessage) {
            console.warn("Wallet does not support message signing, bypassing server auth");
            setIsVerified(true);
            connectSolanaWallet(publicKey.toBase58());
            return;
          }
          
          try {
            setIsSigning(true);
            const timestamp = Date.now();
            const messageString = `Welcome to Void Covenant!\n\nPlease sign this message to authenticate your wallet.\n\nTimestamp: ${timestamp}`;
            const message = new TextEncoder().encode(messageString);
            
            const signatureBytes = await signMessage(message);
            
            const bs58 = (await import('bs58')).default;
            const signature = bs58.encode(signatureBytes);
            const publicKeyStr = publicKey.toBase58();

            const response = await fetch('/api/auth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                publicKey: publicKeyStr,
                signature,
                message: messageString
              })
            });

            if (response.ok) {
              const data = await response.json();
              if (data.token) {
                localStorage.setItem('void_covenant_token', data.token);
              }
            }

            setIsVerified(true);
            connectSolanaWallet(publicKeyStr);
          } catch (error) {
            console.error("Signature rejected or auth error:", error);
            // Allow playing even if backend auth fails
            setIsVerified(true);
            connectSolanaWallet(publicKey.toBase58());
          } finally {
            setIsSigning(false);
          }
        };
        performSignature();
      }
    }
  }, [connected, publicKey, isVerified, isSigning, connectSolanaWallet, signMessage]);

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
              <PvpArenaView onStartPvpBattle={(stage) => {
                setActiveBattleType('pvp');
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

        {/* Bottom Navigation Bar */}
        <div className="sticky bottom-0 z-40 bg-[#0b0c10]/95 backdrop-blur-xl border-t border-[#c5a880]/20 py-2.5 px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
          <div className="max-w-4xl mx-auto flex justify-between items-center gap-1 md:gap-4">
            
            <button
              onClick={() => {
                audioSystem.playClick();
                setActiveTab('campaign');
              }}
              className={`flex-1 flex flex-col items-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'campaign'
                  ? 'bg-gradient-to-t from-red-950/60 to-transparent text-[#dd2c40] border border-[#dd2c40]/30 shadow-[0_0_15px_rgba(221,44,64,0.2)]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <Swords className="w-5 h-5 mb-1" />
              <span className="font-display text-[10px] uppercase font-bold tracking-wider">Campaign</span>
            </button>

            <button
              onClick={() => {
                audioSystem.playClick();
                setActiveTab('pvp');
              }}
              className={`flex-1 flex flex-col items-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'pvp'
                  ? 'bg-gradient-to-t from-purple-950/60 to-transparent text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <Trophy className="w-5 h-5 mb-1" />
              <span className="font-display text-[10px] uppercase font-bold tracking-wider">PvP Arena</span>
            </button>

            <button
              onClick={() => {
                audioSystem.playClick();
                setActiveTab('collection');
              }}
              className={`flex-1 flex flex-col items-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'collection'
                  ? 'bg-gradient-to-t from-amber-950/60 to-transparent text-[#ebd09b] border border-[#ebd09b]/30 shadow-[0_0_15px_rgba(235,208,155,0.2)]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <FolderGit className="w-5 h-5 mb-1" />
              <span className="font-display text-[10px] uppercase font-bold tracking-wider">Deck</span>
            </button>

            <button
              onClick={() => {
                audioSystem.playClick();
                setActiveTab('hero');
              }}
              className={`flex-1 flex flex-col items-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'hero'
                  ? 'bg-gradient-to-t from-[#66fcf1]/20 to-transparent text-[#66fcf1] border border-[#66fcf1]/30 shadow-[0_0_15px_rgba(102,252,241,0.2)]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <UserCircle2 className="w-5 h-5 mb-1" />
              <span className="font-display text-[10px] uppercase font-bold tracking-wider">Inventory</span>
            </button>

            <button
              onClick={() => {
                audioSystem.playClick();
                setActiveTab('altar');
              }}
              className={`flex-1 flex flex-col items-center py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'altar'
                  ? 'bg-gradient-to-t from-cyan-950/60 to-transparent text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-5 h-5 mb-1" />
              <span className="font-display text-[10px] uppercase font-bold tracking-wider">Summon</span>
            </button>

            <button
              onClick={() => {
                audioSystem.playClick();
                setActiveTab('battlepass');
              }}
              className={`flex-1 flex flex-col items-center py-1.5 px-2 rounded-xl transition-all relative cursor-pointer ${
                activeTab === 'battlepass'
                  ? 'bg-gradient-to-t from-purple-950/60 to-transparent text-purple-300 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {hasUnclaimedBP && (
                <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-purple-500 animate-ping" />
              )}
              <Award className="w-5 h-5 mb-1" />
              <span className="font-display text-[10px] uppercase font-bold tracking-wider">Pass</span>
            </button>

            <button
              onClick={() => {
                audioSystem.playClick();
                setActiveTab('airdrop');
              }}
              className={`flex-1 flex flex-col items-center py-1.5 px-2 rounded-xl transition-all relative cursor-pointer ${
                activeTab === 'airdrop'
                  ? 'bg-gradient-to-t from-[#66fcf1]/20 to-transparent text-[#66fcf1] border border-[#66fcf1]/30 shadow-[0_0_15px_rgba(102,252,241,0.2)]'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              {hasUnfinishedTasks && (
                <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-[#66fcf1] animate-ping" />
              )}
              <Wallet className="w-5 h-5 mb-1" />
              <span className="font-display text-[10px] uppercase font-bold tracking-wider">Airdrop</span>
            </button>

          </div>
        </div>

      </div>
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <GameProvider>
        <MainAppContent />
      </GameProvider>
    </ToastProvider>
  );
}
