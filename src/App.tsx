import React, { useState } from 'react';
import { TonConnectUIProvider, THEME } from '@tonconnect/ui-react';
import { GameProvider, useGame } from './context/GameContext';
import { ToastProvider } from './components/Toast';
import { HeaderHUD } from './components/HeaderHUD';
import { useScrollToTopOnChange } from './utils/scrollHelper';
import { ShardsShopModal } from './components/ShardsShopModal';
import { GoldShopModal } from './components/GoldShopModal';
import { DustShopModal } from './components/DustShopModal';
import { CampaignView } from './components/CampaignView';
import { CollectionDeckView } from './components/CollectionDeckView';
import { GachaStoreView } from './components/GachaStoreView';
import { BankView } from './components/BankView';
import { PremiumPassView } from './components/PremiumPassView';
import { BattleFieldView } from './components/BattleFieldView';
import { PvpArenaView } from './components/PvpArenaView';
import { HeroInventoryView } from './components/HeroInventoryView';
import { TalentsView } from './components/TalentsView';
import { CampaignStage } from './types';
import { Swords, FolderGit, Sparkles, Landmark, Award, Trophy, UserCircle2, Store, Crown, Flame } from 'lucide-react';
import { AIRDROP_TASKS } from './data/cards';
import { LandingPage } from './components/LandingPage';
import { RegistrationScreen } from './components/RegistrationScreen';
import { VoidOnboardingModal } from './components/VoidOnboardingModal';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import bs58Pkg from 'bs58';
import { assetPreloader } from './utils/assetPreloader';
import { useDeviceDetect } from './utils/useDeviceDetect';
import { MobileOrientationGuard } from './components/MobileOrientationGuard';
import { MobileApp } from './mobile/MobileApp';
import { GameLoadingScreen } from './components/GameLoadingScreen';

const bs58 = (bs58Pkg as any).default || bs58Pkg;

function MainAppContent() {
  const device = useDeviceDetect();
  const { profile, isLoadingProfile, connectSolanaWallet, registerPlayer, disconnectSolanaWallet, startBattleOnServer, isShardsShopOpen, setIsShardsShopOpen, isGoldShopOpen, setIsGoldShopOpen, isDustShopOpen, setIsDustShopOpen, hasNewDefenseAttacks } = useGame();
  const { connected, publicKey, signMessage, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  
  const [isVerified, setIsVerified] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  // Telegram Mini App authentication state
  const hasTelegramInitData = typeof window !== 'undefined' && Boolean((window as any).Telegram?.WebApp?.initData);
  const isTelegram = device.isTelegram || hasTelegramInitData;
  const [isTelegramAuthLoading, setIsTelegramAuthLoading] = useState<boolean>(() => hasTelegramInitData);
  const [isTelegramAuthenticated, setIsTelegramAuthenticated] = useState(false);
  const [telegramAuthError, setTelegramAuthError] = useState<string | null>(null);
  const authInitiatedRef = React.useRef(false);

  // Auto-login Telegram users via Telegram initData
  React.useEffect(() => {
    const tg = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null;
    if (tg?.initData && !authInitiatedRef.current) {
      authInitiatedRef.current = true;
      const authenticateTelegram = async () => {
        setIsTelegramAuthLoading(true);
        setTelegramAuthError(null);
        try {
          const res = await fetch('/api/auth-telegram', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ initData: tg.initData }),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Telegram authentication failed');
          }

          const data = await res.json();
          localStorage.setItem('void_covenant_token', data.token);
          const startParam = data.startParam || tg?.initDataUnsafe?.start_param;
          if (startParam) {
            localStorage.setItem('void_covenant_referrer', startParam);
          }

          setIsTelegramAuthenticated(true);
          await connectSolanaWallet(data.walletAddress);
        } catch (err: any) {
          console.error('Telegram auth error:', err);
          setTelegramAuthError(err.message || 'Failed to authenticate Telegram user');
        } finally {
          setIsTelegramAuthLoading(false);
        }
      };

      authenticateTelegram();
    }
  }, [connectSolanaWallet]);
  
  // Intelligent Background Asset Preloader (UI + Deck + Background Cards)
  React.useEffect(() => {
    assetPreloader.preloadCoreUI();

    if (profile?.collection && profile?.deck) {
      const activeDeckCards = (profile.collection || []).filter(c => (profile.deck || []).includes(c.id));
      assetPreloader.preloadPlayerDeck(activeDeckCards);
    }

    assetPreloader.preloadAllGameCardsBackground();
  }, [profile?.deck, profile?.collection]);

  // Tab states
  const [activeTab, setActiveTab] = useState<'campaign' | 'pvp' | 'collection' | 'hero' | 'talents' | 'altar' | 'bank' | 'premium'>('campaign');
  const [shopInitialTab, setShopInitialTab] = useState<'cards' | 'equipment' | 'divine' | 'shields'>('cards');

  // Reset scroll position to top whenever switching tabs or exiting battle on PC
  useScrollToTopOnChange(activeTab, activeBattleStage, shopInitialTab);
  
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

  // Newcomer Void Grimoire Tutorial (shows strictly once right after character registration)
  const [isGrimoireOpen, setIsGrimoireOpen] = useState(() => {
    return typeof window !== 'undefined' &&
      sessionStorage.getItem('void_covenant_just_registered') === 'true' &&
      localStorage.getItem('void_covenant_grimoire_seen') !== 'true';
  });

  const handleRegister = async (username: string, avatarUrl: string) => {
    const res = await registerPlayer(username, avatarUrl);
    if (res.success) {
      sessionStorage.setItem('void_covenant_just_registered', 'true');
      setIsGrimoireOpen(true);
    }
    return res;
  };

  const handleCloseGrimoire = () => {
    localStorage.setItem('void_covenant_grimoire_seen', 'true');
    sessionStorage.removeItem('void_covenant_just_registered');
    setIsGrimoireOpen(false);
  };

  const hasUnfinishedTasks = AIRDROP_TASKS.some(task => 
    !(profile?.completedTasks || []).includes(task.id) && 
    !(task.id === 'wallet_connect' && profile?.TONWalletAddress)
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

  // Telegram Loading & Error Screens
  if (isTelegram && hasTelegramInitData) {
    if (telegramAuthError) {
      return (
        <div className="fixed inset-0 z-[99999] bg-[#07090e] flex items-center justify-center p-6 text-center">
          <div className="max-w-md p-8 border border-red-500/30 bg-black/80 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-full border border-red-500 text-red-500 flex items-center justify-center mx-auto text-xl font-bold">!</div>
            <h2 className="font-display text-xl text-white tracking-wider">TELEGRAM AUTH FAILED</h2>
            <p className="text-gray-400 text-xs font-mono">{telegramAuthError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-display text-xs font-bold tracking-wider rounded-lg transition-all cursor-pointer"
            >
              RETRY
            </button>
          </div>
        </div>
      );
    }

    if (isTelegramAuthLoading || !isTelegramAuthenticated || isLoadingProfile) {
      return <GameLoadingScreen statusText="Loading..." />;
    }
  }

  if (!isTelegram && !connected) {
    return (
      <LandingPage
        onConnectWallet={() => setVisible(true)}
        isConnecting={false}
      />
    );
  }

  // Prevent UI flickering while profile state syncs with wallet connection state
  if (!isTelegram && connected && publicKey && (!isVerified || profile.solanaAddress !== publicKey.toBase58() || isLoadingProfile)) {
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
      <GameLoadingScreen 
        statusText={isSigning ? 'AWAITING WALLET SIGNATURE...' : isLoadingProfile ? 'LOADING PROFILE FROM SERVER...' : 'SYNCHRONIZING WITH SERVER...'} 
      />
    );
  }

  if (profile.isBanned) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#180508] via-[#0d0204] to-black flex items-center justify-center p-4 relative z-50">
        <div className="max-w-md w-full bg-black/80 border-2 border-red-600/60 rounded-3xl p-8 text-center space-y-6 shadow-[0_0_50px_rgba(220,38,38,0.4)] animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-950/80 border-2 border-red-500/80 flex items-center justify-center shadow-[0_0_25px_rgba(220,38,38,0.6)]">
            <span className="text-4xl">🚫</span>
          </div>
          <div>
            <h2 className="font-display font-black text-2xl text-red-500 tracking-wider uppercase text-shadow-red">
              EXILED FROM THE VOID
            </h2>
            <p className="font-mono text-xs text-gray-400 mt-2">
              Your account has been suspended by the High Council of Administration.
            </p>
          </div>

          <div className="bg-red-950/40 border border-red-500/40 p-4 rounded-2xl text-left space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold block">
              Reason for Ban:
            </span>
            <p className="text-xs text-red-200 font-sans leading-relaxed whitespace-pre-line font-bold">
              {profile.banReason || 'Violation of Void Covenant terms of service and gameplay rules.'}
            </p>
            {profile.bannedAt && (
              <span className="text-[9px] font-mono text-gray-500 block pt-1">
                Date of Exile: {new Date(profile.bannedAt).toLocaleString()}
              </span>
            )}
          </div>

          <button
            onClick={() => {
              disconnectSolanaWallet();
              window.location.reload();
            }}
            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
          >
            Disconnect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (!profile.isRegistered) {
    return (
      <MobileOrientationGuard isMobile={device.isMobile} isPortrait={device.isPortrait} disableRotatePrompt={true}>
        <RegistrationScreen 
          onRegister={handleRegister} 
        />
      </MobileOrientationGuard>
    );
  }

  // ═══════════════════════════════════════════════════
  // MOBILE: Render entirely separate mobile UI shell
  // ═══════════════════════════════════════════════════
  if (device.isMobile) {
    return (
      <MobileOrientationGuard isMobile={device.isMobile} isPortrait={device.isPortrait} disableRotatePrompt={true}>
        <MobileApp />
        <VoidOnboardingModal isOpen={isGrimoireOpen} onClose={handleCloseGrimoire} />
      </MobileOrientationGuard>
    );
  }

  // ═══════════════════════════════════════════════════
  // DESKTOP: Original desktop UI (unchanged below)
  // ═══════════════════════════════════════════════════

  // If in active battle, render full screen combat field for maximum immersion
  if (activeBattleStage) {
    return (
      <MobileOrientationGuard isMobile={device.isMobile} isPortrait={device.isPortrait}>
        <BattleFieldView
          stage={activeBattleStage}
          onExitBattle={handleExitBattle}
          battleType={activeBattleType}
        />
      </MobileOrientationGuard>
    );
  }

  return (
    <MobileOrientationGuard isMobile={device.isMobile} isPortrait={device.isPortrait}>
      <div className="bg-noise" />
      <div className="ambient-orb-1" />
      <div className="ambient-orb-2" />
      <div className="min-h-screen flex flex-col justify-between relative z-10">
        <div>
          {/* Top bar resource hud and wallet */}
           {!isPvpMatching && !isPvpModalOpen && <HeaderHUD onNavigateTab={setActiveTab} />}

          {/* Tab content */}
          <div className="pt-3 sm:pt-4 pb-20 sm:pb-24">
            <div className={activeTab === 'campaign' ? 'block' : 'hidden'}>
              <CampaignView onStartBattle={(stage) => {
                setActiveBattleType('campaign');
                setActiveBattleStage(stage);
                startBattleOnServer('campaign', stage.id.toString(), stage.energyCost).then(success => {
                  if (!success) {
                    setActiveBattleStage(null);
                  }
                }).catch(() => {});
              }} />
            </div>

            <div className={activeTab === 'pvp' ? 'block' : 'hidden'}>
              <PvpArenaView 
                onStartBattle={async (stage, type, opponentPayload) => {
                  setActiveBattleType(type);
                  setActiveBattleStage(stage);
                  startBattleOnServer('pvp', stage.id.toString(), 1, opponentPayload).then(success => {
                    if (!success) {
                      setActiveBattleStage(null);
                    }
                  }).catch(() => {});
                  return true;
                }}
                isMatching={isPvpMatching}
                setIsMatching={setIsPvpMatching}
                isModalOpen={isPvpModalOpen}
                setIsModalOpen={setIsPvpModalOpen}
                onNavigateToShop={(tab = 'shields') => {
                  setShopInitialTab(tab);
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
                  setShopInitialTab(tab);
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
      </div>

      {/* Navigation Footer Tab Bar (Mobile responsive and desktop styled) */}
      {!isPvpMatching && !isPvpModalOpen && (
        <div className="bg-[#151a21]/95 border-t border-[#c5a880]/20 sticky bottom-0 z-50 backdrop-blur-md py-2.5">
          <div className="max-w-4xl mx-auto flex items-center justify-around gap-2 px-4">
          
          {/* Campaign Tab */}
          <button onClick={() => setActiveTab('campaign')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              activeTab === 'campaign'
                ? 'bg-black/50 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'hover:opacity-100 opacity-90'
            }`}
          >
            <Swords className="w-5 h-5 text-emerald-400" />
            <span className="text-[10px] font-display font-bold tracking-wider text-emerald-300">CAMPAIGN</span>
          </button>

          {/* Arena Tab */}
          <button onClick={() => setActiveTab('pvp')}
            className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              activeTab === 'pvp'
                ? 'bg-black/50 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                : 'hover:opacity-100 opacity-90'
            }`}
          >
            <Trophy className="w-5 h-5 text-rose-400" />
            <span className="text-[10px] font-display font-bold tracking-wider text-rose-300">ARENA</span>
            {hasNewDefenseAttacks && activeTab !== 'pvp' && (
              <span className="absolute top-1 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.9)]"></span>
              </span>
            )}
          </button>

          {/* Collection Tab */}
          <button onClick={() => setActiveTab('collection')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              activeTab === 'collection'
                ? 'text-[#ebd09b] bg-black/40 border border-[#c5a880]/30 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FolderGit className="w-5 h-5" />
            <span className="text-[10px] font-display font-bold tracking-wider">CARDS</span>
          </button>

          {/* Hero Tab */}
          <button onClick={() => setActiveTab('hero')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              activeTab === 'hero'
                ? 'text-[#ebd09b] bg-black/40 border border-[#c5a880]/30 shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserCircle2 className="w-5 h-5" />
            <span className="text-[10px] font-display font-bold tracking-wider">LORD</span>
          </button>

          {/* Shop Tab */}
          <button onClick={() => setActiveTab('altar')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              activeTab === 'altar'
                ? 'bg-black/50 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                : 'hover:opacity-100 opacity-90'
            }`}
          >
            <Store className="w-5 h-5 text-purple-400" />
            <span className="text-[10px] font-display font-bold tracking-wider text-purple-300">SHOP</span>
          </button>

          {/* Premium / VIP Pass Tab */}
          <button onClick={() => setActiveTab('premium')}
            className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              activeTab === 'premium'
                ? 'bg-gradient-to-b from-amber-500/20 via-yellow-500/10 to-black/60 border border-yellow-400/60 shadow-[0_0_16px_rgba(250,204,21,0.4)]'
                : 'hover:opacity-100 opacity-90'
            }`}
          >
            <Crown className="w-5 h-5 text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.7)] animate-pulse" />
            <span className="text-[10px] font-display font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-400">
              PREMIUM
            </span>
            <span className="absolute -top-1.5 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400 shadow-[0_0_6px_rgba(250,204,21,0.9)]"></span>
            </span>
          </button>

          {/* Bank / Treasury Tab */}
          <button onClick={() => setActiveTab('bank')}
            className={`relative flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95 ${
              activeTab === 'bank'
                ? 'bg-black/50 border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'hover:opacity-100 opacity-90'
            }`}
          >
            <Landmark className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] font-display font-bold tracking-wider text-amber-300">BANK</span>
          </button>



        </div>
      </div>
      )}
    </div>
      {isShardsShopOpen && (
        <ShardsShopModal onClose={() => setIsShardsShopOpen(false)} />
      )}
      {isGoldShopOpen && (
        <GoldShopModal onClose={() => setIsGoldShopOpen(false)} />
      )}
      {isDustShopOpen && (
        <DustShopModal onClose={() => setIsDustShopOpen(false)} />
      )}
      <VoidOnboardingModal isOpen={isGrimoireOpen} onClose={handleCloseGrimoire} />
    </MobileOrientationGuard>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  state = { hasError: false, error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App ErrorBoundary caught error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[99999] bg-[#07090e] text-white flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full p-6 border border-red-500/40 bg-black/90 rounded-2xl shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-500/50 flex items-center justify-center mx-auto text-red-400 text-xl font-bold">
              ⚠
            </div>
            <h2 className="font-display font-black text-lg text-red-400 tracking-wider uppercase">
              Application Error
            </h2>
            <p className="text-xs text-zinc-400 font-mono leading-relaxed break-words">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg active:scale-95"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const tonManifestUrl = typeof window !== 'undefined' && window.location?.origin
    ? `${window.location.origin}/tonconnect-manifest.json`
    : 'https://void-covenant.fun/tonconnect-manifest.json';

  return (
    <ErrorBoundary>
      <TonConnectUIProvider
        manifestUrl={tonManifestUrl}
        uiPreferences={{ theme: THEME.DARK }}
        actionsConfiguration={{
          twaReturnUrl: 'https://t.me/voidcovenantbot/voidcovenant',
          returnStrategy: 'back',
          modals: [],
          notifications: []
        }}
      >
        <ToastProvider>
          <GameProvider>
            <MainAppContent />
          </GameProvider>
        </ToastProvider>
      </TonConnectUIProvider>
    </ErrorBoundary>
  );
}

