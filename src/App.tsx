import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { ToastProvider } from './components/Toast';
import { audioSystem } from './utils/AudioSystem';
import { HeaderHUD } from './components/HeaderHUD';
import { ShardsShopModal } from './components/ShardsShopModal';
import { CampaignView } from './components/CampaignView';
import { CollectionDeckView } from './components/CollectionDeckView';
import { GachaStoreView } from './components/GachaStoreView';
import { AirdropHubView } from './components/AirdropHubView';
import { BattleFieldView } from './components/BattleFieldView';
import { PvpArenaView } from './components/PvpArenaView';
import { HeroInventoryView } from './components/HeroInventoryView';
import { TalentsView } from './components/TalentsView';
import { CampaignStage } from './types';
import { Swords, FolderGit, Sparkles, Wallet, Award, Trophy, UserCircle2 } from 'lucide-react';
import { AIRDROP_TASKS } from './data/cards';
import { LandingPage } from './components/LandingPage';
import { RegistrationScreen } from './components/RegistrationScreen';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import bs58Pkg from 'bs58';
import { assetPreloader } from './utils/assetPreloader';

const bs58 = (bs58Pkg as any).default || bs58Pkg;

function MainAppContent() {
  const { profile, isLoadingProfile, connectSolanaWallet, registerPlayer, disconnectSolanaWallet, startBattleOnServer, isShardsShopOpen, setIsShardsShopOpen } = useGame();
  const { connected, publicKey, signMessage, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  
  const [isVerified, setIsVerified] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  
  // Intelligent Background Asset Preloader (UI + Deck + Background Cards)
  React.useEffect(() => {
    assetPreloader.preloadCoreUI();

    if (profile?.collection && profile?.deck) {
      const activeDeckCards = profile.collection.filter(c => profile.deck.includes(c.id));
      assetPreloader.preloadPlayerDeck(activeDeckCards);
    }

    assetPreloader.preloadAllGameCardsBackground();
  }, [profile?.deck, profile?.collection]);

  // Tab states
  const [activeTab, setActiveTab] = useState<'campaign' | 'pvp' | 'collection' | 'hero' | 'talents' | 'altar' | 'airdrop'>('campaign');
  
  // Active Battle stage state
  const [activeBattleStage, setActiveBattleStage] = useState<CampaignStage | null>(null);
  const [activeBattleType, setActiveBattleType] = useState<'campaign' | 'pvp'>('campaign');
  const [isPvpMatching, setIsPvpMatching] = useState(false);
  const [isPvpModalOpen, setIsPvpModalOpen] = useState(false);

  // When battle ends
  const handleExitBattle = (isVictory: boolean) => {
    setActiveBattleStage(null);
    setActiveTab(activeBattleType === 'pvp' ? 'pvp' : 'campaign');
  };

  const hasUnfinishedTasks = AIRDROP_TASKS.some(task => 
    !profile.completedTasks.includes(task.id) && 
    !(task.id === 'wallet_connect' && profile.TONWalletAddress)
  );

  const wasConnectedRef = React.useRef(false);

  React.useEffect(() => {
    if (connected && publicKey) {
      wasConnectedRef.current = true;
    } else if (!connected && wasConnectedRef.current) {
      wasConnectedRef.current = false;
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
            const timestamp = Date.now();
            const messageString = `Welcome to Void Covenant!\n\nPlease sign this message to authenticate your wallet.\n\nTimestamp: ${timestamp}`;
            const message = new TextEncoder().encode(messageString);
            
            const signatureBytes = await signMessage(message);
            
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

            if (!response.ok) {
              throw new Error('Backend authentication failed');
            }

            const data = await response.json();
            localStorage.setItem('void_covenant_token', data.token);

            setIsVerified(true);
          } catch (error) {
            console.error("Signature rejected or failed:", error);
            // Disconnect if they refuse to sign or auth fails
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
    // If we're not loading and not signing, but we're stuck here, it means the server fetch failed.
    if (!isLoadingProfile && !isSigning && isVerified) {
      return (
        <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center relative overflow-hidden">
          <div className="bg-noise mix-blend-overlay absolute inset-0 z-0 opacity-20" />
          <div className="relative z-10 flex flex-col items-center gap-6 max-w-md text-center p-8 border border-[#dd2c40]/30 bg-black/60 rounded-lg backdrop-blur-sm">
            <div className="w-16 h-16 rounded-full border-2 border-[#dd2c40] flex items-center justify-center mb-2">
              <span className="text-[#dd2c40] font-bold text-2xl">!</span>
            </div>
            <h2 className="text-[#ebd09b] font-display text-2xl tracking-widest uppercase">Connection Failed</h2>
            <p className="text-gray-400 font-body text-sm">
              We could not synchronize your profile with the game server. This might be due to a network issue, server maintenance, or an invalid session.
            </p>
            <button
              onClick={() => {
                disconnect().catch(() => {});
                localStorage.removeItem('void_covenant_token');
                window.location.reload();
              }}
              className="mt-4 px-8 py-3 bg-[#dd2c40] hover:bg-[#ff334b] text-white font-display font-bold tracking-widest rounded transition-all"
            >
              DISCONNECT & RETRY
            </button>
          </div>
        </div>
      );
    }

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
           {!isPvpMatching && !isPvpModalOpen && <HeaderHUD />}

          {/* Tab content */}
          <div className="py-6">
            {activeTab === 'campaign' && (
              <CampaignView onStartBattle={async (stage) => {
                const success = await startBattleOnServer('campaign', stage.id.toString(), stage.energyCost);
                if (success) {
                  setActiveBattleType('campaign');
                  setActiveBattleStage(stage);
                }
              }} />
          )}
          {activeTab === 'pvp' && (
            <PvpArenaView 
              onStartBattle={async (stage, type, opponentPayload) => {
                const success = await startBattleOnServer('pvp', stage.id.toString(), 1, opponentPayload);
                if (success) {
                  setActiveBattleType(type);
                  setActiveBattleStage(stage);
                  return true;
                }
                return false;
              }}
              isMatching={isPvpMatching}
              setIsMatching={setIsPvpMatching}
              isModalOpen={isPvpModalOpen}
              setIsModalOpen={setIsPvpModalOpen}
            />
          )}
          {activeTab === 'collection' && <CollectionDeckView />}
          {activeTab === 'hero' && <HeroInventoryView />}
          {activeTab === 'talents' && <TalentsView />}
          {activeTab === 'altar' && <GachaStoreView />}
          {activeTab === 'airdrop' && <AirdropHubView />}
        </div>
      </div>

      {/* Navigation Footer Tab Bar (Mobile responsive and desktop styled) */}
      {!isPvpMatching && !isPvpModalOpen && (
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



        </div>
      </div>
      )}
    </div>
      {isShardsShopOpen && (
        <ShardsShopModal onClose={() => setIsShardsShopOpen(false)} />
      )}
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
