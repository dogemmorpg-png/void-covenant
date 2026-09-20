import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { SOLANA_PACKAGES, SolanaPackage, TREASURY_WALLET_ADDRESS } from '../data/solanaConfig';
import { 
  TELEGRAM_PACKAGES, 
  TelegramPackage, 
  TON_TREASURY_WALLET_ADDRESS,
  USDT_JETTON_MASTER
} from '../data/telegramPricing';
import { buildJettonTransferPayload, getUsdtJettonWalletAddress } from '../utils/tonJettonHelper';
import { Address, beginCell } from '@ton/core';
import { 
  X, 
  Wallet, 
  ExternalLink, 
  CheckCircle, 
  RefreshCw, 
  AlertCircle, 
  Sparkles,
  Star,
  Coins,
  ShieldCheck,
  LogOut
} from 'lucide-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL, ComputeBudgetProgram } from '@solana/web3.js';
import { useTonConnectUI, useTonAddress, CHAIN } from '@tonconnect/ui-react';

interface ShardsShopModalProps {
  onClose: () => void;
}

const isUserCancellation = (err: any): boolean => {
  if (!err) return false;
  const name = String(err?.name || '');
  const msg = String(err?.message || '');
  const info = String(err?.info || '');
  const text = `${name} ${msg} ${info} ${String(err)}`.toLowerCase();

  return (
    text.includes('reject') ||
    text.includes('cancel') ||
    text.includes('decline') ||
    text.includes('abort') ||
    text.includes('not sent') ||
    text.includes('denied') ||
    text.includes('dismiss') ||
    text.includes('closed') ||
    text.includes('userrejects')
  );
};

// Vector SVG Icons for payment currencies
export const TelegramStarIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="tgStarGold" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFE57F" />
        <stop offset="45%" stopColor="#FFB300" />
        <stop offset="100%" stopColor="#E65100" />
      </linearGradient>
      <linearGradient id="tgStarFacetL" x1="12" y1="2" x2="6" y2="18" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#FFF9C4" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#FFB300" stopOpacity="0.2" />
      </linearGradient>
      <linearGradient id="tgStarFacetR" x1="12" y1="2" x2="18" y2="18" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#D84315" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#870000" stopOpacity="0.95" />
      </linearGradient>
    </defs>
    <path
      d="M12 2.2L14.7 8.3L21.4 8.9C22.1 9.0 22.4 9.9 21.8 10.4L16.7 14.8L18.2 21.3C18.4 22.0 17.6 22.6 17.0 22.2L12 18.9L7.0 22.2C6.4 22.6 5.6 22.0 5.8 21.3L7.3 14.8L2.2 10.4C1.6 9.9 1.9 9.0 2.6 8.9L9.3 8.3L12 2.2Z"
      fill="url(#tgStarGold)"
      stroke="#7F2B00"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
    <path d="M12 2.2L14.7 8.3L12 13.5V2.2Z" fill="url(#tgStarFacetL)" />
    <path d="M21.4 8.9L16.7 14.8L12 13.5L14.7 8.3L21.4 8.9Z" fill="#FFA500" opacity="0.4" />
    <path d="M12 13.5L16.7 14.8L18.2 21.3L12 18.9V13.5Z" fill="url(#tgStarFacetR)" />
    <path d="M12 13.5L7.3 14.8L5.8 21.3L12 18.9V13.5Z" fill="#BF360C" opacity="0.4" />
    <path d="M2.6 8.9L7.3 14.8L12 13.5L9.3 8.3L2.6 8.9Z" fill="url(#tgStarFacetL)" />
    <circle cx="12" cy="11.5" r="1.8" fill="#FFFFFF" opacity="0.8" />
  </svg>
);

export const TonSymbolIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="14" cy="14" r="14" fill="#0098EA" />
    <path
      d="M18.7802 8.00098H9.21936C7.46145 8.00098 6.34727 9.89726 7.23164 11.4302L13.1322 21.6576C13.5173 22.3254 14.4823 22.3254 14.8673 21.6576L20.7691 11.4302C21.6523 9.89966 20.5381 8.00098 18.7814 8.00098H18.7802ZM13.1274 18.5906L11.8424 16.1035L8.74168 10.5578C8.53714 10.2029 8.78981 9.74806 9.21816 9.74806H13.1262V18.5918L13.1274 18.5906ZM19.2555 10.5566L16.156 16.1047L14.8709 18.5906V9.74685H18.779C19.2073 9.74685 19.46 10.2017 19.2555 10.5566Z"
      fill="white"
    />
  </svg>
);

export const UsdtSymbolIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="14" cy="14" r="14" fill="#26A17B" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.4 13.8V12.2C18.2 12 20.3 11.2 20.3 10.3C20.3 9.4 18.2 8.6 15.4 8.4V6.5H19.5V5H8.5V6.5H12.6V8.4C9.8 8.6 7.7 9.4 7.7 10.3C7.7 11.2 9.8 12 12.6 12.2V13.8C8.8 14.1 6 15.3 6 16.7C6 18.2 9.3 19.5 14 19.5C18.7 19.5 22 18.2 22 16.7C22 15.3 19.2 14.1 15.4 13.8ZM15.4 9.9V11.2C17.6 11.1 18.8 10.6 18.8 10.3C18.8 10 17.6 9.5 15.4 9.4V9.9ZM12.6 9.9V9.4C10.4 9.5 9.2 10 9.2 10.3C9.2 10.6 10.4 11.1 12.6 11.2V9.9ZM14 18.2C9.9 18.2 7.3 17.1 7.3 16.7C7.3 16.3 9.6 15.3 13.3 15.2V13.8C13.5 13.8 13.8 13.8 14 13.8C14.2 13.8 14.5 13.8 14.7 13.8V15.2C18.4 15.3 20.7 16.3 20.7 16.7C20.7 17.1 18.1 18.2 14 18.2Z"
      fill="white"
    />
  </svg>
);

export const SolanaSymbolIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4.5 17.5L7.2 20.2H20.5L17.8 17.5H4.5Z" fill="url(#solGrad1)" />
    <path d="M4.5 3.8L7.2 6.5H20.5L17.8 3.8H4.5Z" fill="url(#solGrad2)" />
    <path d="M19.5 10.7L16.8 8H3.5L6.2 10.7H19.5Z" fill="url(#solGrad3)" />
    <defs>
      <linearGradient id="solGrad1" x1="4.5" y1="18.8" x2="20.5" y2="18.8" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00FFA3" />
        <stop offset="1" stopColor="#DC1FFF" />
      </linearGradient>
      <linearGradient id="solGrad2" x1="4.5" y1="5.1" x2="20.5" y2="5.1" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00FFA3" />
        <stop offset="1" stopColor="#DC1FFF" />
      </linearGradient>
      <linearGradient id="solGrad3" x1="3.5" y1="9.3" x2="19.5" y2="9.3" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00FFA3" />
        <stop offset="1" stopColor="#DC1FFF" />
      </linearGradient>
    </defs>
  </svg>
);

export const ShardsShopModal: React.FC<ShardsShopModalProps> = ({ onClose }) => {
  const { 
    profile, 
    setProfile,
    verifySolanaPayment, 
    createStarsInvoice, 
    verifyStarsPayment,
    notifyShardCredit,
    verifyTonPayment, 
    refreshProfile, 
    saveProfile 
  } = useGame();
  
  const toast = useToast();
  const { setVisible: setSolanaModalVisible } = useWalletModal();
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected, disconnect } = useWallet();

  const [tonConnectUI] = useTonConnectUI();
  const tonAddress = useTonAddress();

  // Atomic payment lock & timestamp debounce refs to prevent duplicate transaction intents
  const isProcessingPaymentRef = useRef(false);
  const lastPaymentTimeRef = useRef(0);
  const redirectToWalletRef = useRef<(() => Promise<void>) | null>(null);
  const starsWatchdogTimerRef = useRef<any>(null);
  const activeStarsHandlerRef = useRef<((eventData: any) => void) | null>(null);

  // Fresh profile sync on modal mount
  useEffect(() => {
    if (refreshProfile) {
      refreshProfile(false);
    }
  }, [refreshProfile]);

  // Cleanup on unmount: unregister invoice listener and cancel watchdog
  useEffect(() => {
    return () => {
      isProcessingPaymentRef.current = false;
      const tg = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null;
      if (activeStarsHandlerRef.current && tg?.offEvent) {
        tg.offEvent('invoiceClosed', activeStarsHandlerRef.current);
        activeStarsHandlerRef.current = null;
      }
      if (starsWatchdogTimerRef.current) {
        clearTimeout(starsWatchdogTimerRef.current);
        starsWatchdogTimerRef.current = null;
      }
    };
  }, []);

  const handleCloseModal = () => {
    isProcessingPaymentRef.current = false;
    const tg = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null;
    if (activeStarsHandlerRef.current && tg?.offEvent) {
      tg.offEvent('invoiceClosed', activeStarsHandlerRef.current);
      activeStarsHandlerRef.current = null;
    }
    if (starsWatchdogTimerRef.current) {
      clearTimeout(starsWatchdogTimerRef.current);
      starsWatchdogTimerRef.current = null;
    }
    onClose();
  };

  const handleOpenWallet = () => {
    const tg = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null;
    const universalLink = tonConnectUI.walletInfo?.universalLink;
    const deepLink = (tonConnectUI.walletInfo as any)?.deepLink;

    if (tg?.openLink && universalLink && !universalLink.includes('t.me')) {
      tg.openLink(universalLink);
    } else if (redirectToWalletRef.current) {
      redirectToWalletRef.current().catch(err => console.warn('Wallet redirect error:', err));
    } else if (deepLink && typeof window !== 'undefined') {
      window.location.href = deepLink;
    }
  };

  const isTelegramUser = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(
      (window as any).Telegram?.WebApp?.initData ||
      /Telegram/i.test(navigator.userAgent || '') ||
      Boolean(profile.solanaAddress && profile.solanaAddress.startsWith('tg_'))
    );
  }, [profile.solanaAddress]);

  const [tgMethod, setTgMethod] = useState<'stars' | 'ton' | 'usdt'>('stars');

  // Payment processing state modal
  const [paymentState, setPaymentState] = useState<{
    status: 'idle' | 'signing' | 'verifying' | 'pending' | 'success' | 'error';
    message: string;
    txSignature?: string;
    txType?: 'solana' | 'ton' | 'stars';
    selectedCurrency?: 'ton' | 'usdt' | 'stars' | 'solana';
    selectedPkg?: any;
  }>({ status: 'idle', message: '' });

  // Direct On-Chain Verification Fallback for Solana (PC / External Browser)
  const verifySolanaOnChainDirect = async (signature: string, pkg: SolanaPackage): Promise<boolean> => {
    const HELIUS_RPC_URL = 'https://mainnet.helius-rpc.com/?api-key=a53833dc-25c4-42e3-bdef-26901e8e84e9';
    const expectedLamports = Math.floor(pkg.solCost * LAMPORTS_PER_SOL);

    const checkEndpoint = async (rpcUrl: string) => {
      const res = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTransaction',
          params: [
            signature,
            { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0, commitment: 'confirmed' }
          ]
        })
      });
      const json = await res.json();
      return json.result;
    };

    try {
      let tx = await checkEndpoint(HELIUS_RPC_URL);
      if (!tx) {
        tx = await checkEndpoint('https://solana-rpc.publicnode.com');
      }

      if (!tx || tx.meta?.err) return false;

      if (tx.meta?.preBalances && tx.meta?.postBalances) {
        const accountKeys = tx.transaction?.message?.accountKeys || [];
        const treasuryIndex = accountKeys.findIndex((k: any) => {
          const pubkeyStr = typeof k === 'string' ? k : (k.pubkey ? k.pubkey.toString() : String(k));
          return pubkeyStr === TREASURY_WALLET_ADDRESS;
        });

        if (treasuryIndex !== -1) {
          const gained = (tx.meta.postBalances[treasuryIndex] || 0) - (tx.meta.preBalances[treasuryIndex] || 0);
          if (gained >= expectedLamports - 10000) return true;
        }
      }

      const instructions = tx.transaction?.message?.instructions || [];
      for (const ix of instructions) {
        if (ix.program === 'system' && ix.parsed?.type === 'transfer') {
          const info = ix.parsed.info || {};
          if (info.destination === TREASURY_WALLET_ADDRESS && info.lamports >= expectedLamports - 10000) {
            return true;
          }
        }
      }
    } catch (e) {
      console.warn('Direct on-chain check error:', e);
    }
    return false;
  };

  // ═══════════════════════════════════════════════════
  // 1. SOLANA PURCHASE HANDLER (PC / External Browsers)
  // ═══════════════════════════════════════════════════
  const handlePurchaseSolana = async (pkg: SolanaPackage) => {
    const now = Date.now();
    if (isProcessingPaymentRef.current || now - lastPaymentTimeRef.current < 2500) {
      return;
    }
    isProcessingPaymentRef.current = true;
    lastPaymentTimeRef.current = now;

    if (!connected || !publicKey || !sendTransaction) {
      isProcessingPaymentRef.current = false;
      toast('Please connect your Solana wallet first!', 'warning');
      setSolanaModalVisible(true);
      return;
    }

    try {
      setPaymentState({
        status: 'signing',
        message: 'Please approve the transaction in your Solana wallet (Phantom / Solflare)...',
        selectedPkg: pkg,
        txType: 'solana'
      });

      const lamports = Math.floor(pkg.solCost * LAMPORTS_PER_SOL);
      const transaction = new Transaction();

      transaction.add(
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100000 })
      );

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(TREASURY_WALLET_ADDRESS),
          lamports
        })
      );

      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });

      setPaymentState({
        status: 'verifying',
        message: 'Transaction broadcasted to Solana Mainnet! Verifying with Helius...',
        txSignature: signature,
        selectedPkg: pkg,
        txType: 'solana'
      });

      let verifySuccess = false;
      for (let attempt = 1; attempt <= 4; attempt++) {
        setPaymentState(prev => ({
          ...prev,
          message: `Verifying on-chain transaction with Helius (Attempt ${attempt}/4)...`
        }));

        const res = await verifySolanaPayment(signature, pkg.id);
        if (res && res.success) {
          verifySuccess = true;
          break;
        }
        if (attempt < 4) {
          await new Promise(r => setTimeout(r, 1000));
        }
      }

      if (!verifySuccess) {
        setPaymentState(prev => ({
          ...prev,
          message: 'Performing direct on-chain verification with Helius RPC...'
        }));

        const directVerified = await verifySolanaOnChainDirect(signature, pkg);
        if (directVerified) {
          verifySuccess = true;
          const updated = { ...profile };
          if (pkg.shardsReward > 0) updated.darkShards = (updated.darkShards || 0) + pkg.shardsReward;
          updated.processedTransactions = [...(updated.processedTransactions || []), signature];
          saveProfile(updated);
        }
      }

      if (!verifySuccess) {
        setPaymentState(prev => ({
          ...prev,
          status: 'pending',
          message: 'Transaction sent to Solana! On-chain indexing in progress. Click RETRY VERIFICATION below.'
        }));
        toast('Transaction submitted. Click Retry Verification to claim.', 'info');
        return;
      }

      setPaymentState(prev => ({
        ...prev,
        status: 'success',
        message: `Success! +${pkg.shardsReward} Dark Shards added to your account!`
      }));

      toast(`Payment confirmed! +${pkg.shardsReward} Dark Shards added!`, 'success');

    } catch (err: any) {
      console.error('Solana purchase error:', err);
      const isUserReject = isUserCancellation(err);
      setPaymentState(prev => ({
        ...prev,
        status: isUserReject ? 'idle' : 'error',
        message: isUserReject ? 'Transaction was cancelled by user.' : (err.message || 'Payment failed.')
      }));
      toast(isUserReject ? 'Transaction cancelled' : (err.message || 'Payment failed'), isUserReject ? 'info' : 'error');
    } finally {
      isProcessingPaymentRef.current = false;
    }
  };

  // ═══════════════════════════════════════════════════
  // 2. TELEGRAM STARS PURCHASE HANDLER
  // ═══════════════════════════════════════════════════
  const handlePurchaseStars = async (pkg: TelegramPackage) => {
    const now = Date.now();
    if (isProcessingPaymentRef.current || now - lastPaymentTimeRef.current < 2500) {
      return;
    }
    isProcessingPaymentRef.current = true;
    lastPaymentTimeRef.current = now;

    const tg = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null;
    if (!tg) {
      isProcessingPaymentRef.current = false;
      toast('Telegram WebApp is not available. Please open inside Telegram.', 'error');
      return;
    }

    try {
      setPaymentState({
        status: 'verifying',
        message: 'Generating Telegram Stars invoice...',
        selectedPkg: pkg,
        txType: 'stars'
      });

      const res = await createStarsInvoice(pkg.id);
      if (!res.success || !res.invoiceLink) {
        isProcessingPaymentRef.current = false;
        setPaymentState({
          status: 'error',
          message: res.message || 'Failed to create Stars invoice'
        });
        toast(res.message || 'Failed to create invoice', 'error');
        return;
      }

      setPaymentState({
        status: 'signing',
        message: 'Confirm the Stars payment in Telegram...',
        selectedPkg: pkg,
        txType: 'stars'
      });

      let hasHandledInvoice = false;

      const finishStarsInvoice = async (status: string) => {
        if (hasHandledInvoice) return;
        hasHandledInvoice = true;

        if (starsWatchdogTimerRef.current) {
          clearTimeout(starsWatchdogTimerRef.current);
          starsWatchdogTimerRef.current = null;
        }

        if (activeStarsHandlerRef.current && tg?.offEvent) {
          tg.offEvent('invoiceClosed', activeStarsHandlerRef.current);
          activeStarsHandlerRef.current = null;
        }

        isProcessingPaymentRef.current = false;

        const normalizedStatus = (status || '').toLowerCase().trim();

        if (normalizedStatus === 'paid') {
          // 1. Instant optimistic local balance update so user sees Dark Shards immediately!
          notifyShardCredit?.();
          setProfile(prev => ({
            ...prev,
            darkShards: (prev.darkShards || 0) + pkg.shardsReward
          }));

          setPaymentState({
            status: 'success',
            message: `Stars payment confirmed! +${pkg.shardsReward} Dark Shards added!`,
            selectedPkg: pkg,
            txType: 'stars'
          });
          toast(`+${pkg.shardsReward} Dark Shards added!`, 'success');

          // 2. Authoritative on-demand verification with server
          if (verifyStarsPayment) {
            verifyStarsPayment(pkg.id).catch(err => console.warn('Stars on-demand verify error:', err));
          }

          // 3. Staggered background profile refreshes
          if (refreshProfile) {
            setTimeout(() => refreshProfile(false), 1500);
            setTimeout(() => refreshProfile(false), 4000);
            setTimeout(() => refreshProfile(false), 8000);
          }
        } else if (
          normalizedStatus === 'cancelled' ||
          normalizedStatus === 'canceled' ||
          normalizedStatus === 'failed' ||
          normalizedStatus === 'closed' ||
          normalizedStatus === 'close'
        ) {
          setPaymentState({
            status: 'idle',
            message: ''
          });
          if (normalizedStatus === 'cancelled' || normalizedStatus === 'canceled') {
            toast('Stars payment cancelled', 'info');
          }
        } else {
          setPaymentState({
            status: 'idle',
            message: ''
          });
          if (normalizedStatus && normalizedStatus !== 'unknown') {
            toast(`Payment status: ${status}`, 'info');
          }
        }
      };

      const handleInvoiceClosed = (eventData: any) => {
        const status = typeof eventData === 'string' ? eventData : (eventData?.status || 'closed');
        finishStarsInvoice(status);
      };

      activeStarsHandlerRef.current = handleInvoiceClosed;
      if (tg.onEvent) {
        tg.onEvent('invoiceClosed', handleInvoiceClosed);
      }

      // Safety watchdog: 40 seconds timeout if native invoice dismissed without event
      starsWatchdogTimerRef.current = setTimeout(() => {
        if (!hasHandledInvoice) {
          finishStarsInvoice('cancelled');
        }
      }, 40000);

      // Open native Telegram Stars sheet
      tg.openInvoice(res.invoiceLink, (status: string) => {
        finishStarsInvoice(status);
      });

    } catch (e: any) {
      isProcessingPaymentRef.current = false;
      console.error('Stars purchase error:', e);
      setPaymentState({
        status: 'error',
        message: e.message || 'Error processing Stars payment'
      });
      toast(e.message || 'Payment error', 'error');
    }
  };

  // ═══════════════════════════════════════════════════
  // 3. TON (NATIVE) PURCHASE HANDLER
  // ═══════════════════════════════════════════════════
  const handlePurchaseTon = async (pkg: TelegramPackage) => {
    const now = Date.now();
    if (isProcessingPaymentRef.current || now - lastPaymentTimeRef.current < 2500) {
      return;
    }
    isProcessingPaymentRef.current = true;
    lastPaymentTimeRef.current = now;

    if (!tonAddress) {
      isProcessingPaymentRef.current = false;
      toast('Please connect your TON wallet first!', 'warning');
      tonConnectUI.openModal();
      return;
    }

    try {
      const nanotons = Math.floor(pkg.tonCost * 1e9).toString();
      const bounceableTreasury = Address.parse(TON_TREASURY_WALLET_ADDRESS).toString({ bounceable: true });
      const walletName = tonConnectUI.walletInfo?.name || 'Wallet';

      setPaymentState({
        status: 'signing',
        message: `Please approve the transaction in ${walletName}...`,
        selectedPkg: pkg,
        txType: 'ton',
        selectedCurrency: 'ton'
      });

      const commentCell = beginCell()
        .storeUint(0, 32)
        .storeStringTail(pkg.id)
        .endCell();

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        network: CHAIN.MAINNET,
        messages: [
          {
            address: bounceableTreasury,
            amount: nanotons,
            payload: commentCell.toBoc().toString('base64')
          }
        ]
      };

      await tonConnectUI.sendTransaction(transaction, {
        returnStrategy: 'back',
        modals: [],
        notifications: [],
        onRequestSent: (redirectToWallet) => {
          redirectToWalletRef.current = redirectToWallet;
          const tg = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null;
          const uLink = tonConnectUI.walletInfo?.universalLink;
          if (tg?.openLink && uLink && !uLink.includes('t.me')) {
            tg.openLink(uLink);
          }
        }
      });

      setPaymentState(prev => ({
        ...prev,
        status: 'verifying',
        message: 'Transfer submitted! Verifying transaction on blockchain...'
      }));

      let verified = false;
      for (let attempt = 1; attempt <= 12; attempt++) {
        setPaymentState(prev => ({
          ...prev,
          message: `Verifying on-chain (Attempt ${attempt}/12)...`
        }));

        const res = await verifyTonPayment(pkg.id, 'ton', undefined, tonAddress);
        if (res.success) {
          verified = true;
          setPaymentState({
            status: 'success',
            message: `TON payment confirmed! +${pkg.shardsReward} Dark Shards added!`,
            selectedPkg: pkg,
            txType: 'ton',
            selectedCurrency: 'ton'
          });
          toast(`Payment confirmed! +${pkg.shardsReward} Dark Shards added!`, 'success');
          if (refreshProfile) await refreshProfile();
          break;
        }

        if (attempt < 12) {
          await new Promise(r => setTimeout(r, 2500));
        }
      }

      if (!verified) {
        setPaymentState(prev => ({
          ...prev,
          status: 'pending',
          message: 'Transaction submitted to TON. Waiting for on-chain block confirmation. Click RETRY VERIFICATION below.',
          selectedPkg: pkg,
          txType: 'ton',
          selectedCurrency: 'ton'
        }));
      }

    } catch (err: any) {
      console.error('TON purchase error:', err);
      
      if (isUserCancellation(err)) {
        setPaymentState({
          status: 'idle',
          message: 'Transaction was cancelled in wallet.'
        });
        toast('Transaction cancelled', 'info');
        return;
      }

      // Check on-chain before declaring failure
      setPaymentState(prev => ({
        ...prev,
        status: 'verifying',
        message: 'Checking on-chain confirmation on TON blockchain...'
      }));

      let verified = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        const res = await verifyTonPayment(pkg.id, 'ton', undefined, tonAddress);
        if (res.success) {
          verified = true;
          setPaymentState({
            status: 'success',
            message: `TON payment confirmed! +${pkg.shardsReward} Dark Shards added!`,
            selectedPkg: pkg,
            txType: 'ton',
            selectedCurrency: 'ton'
          });
          toast(`Payment confirmed! +${pkg.shardsReward} Dark Shards added!`, 'success');
          if (refreshProfile) await refreshProfile();
          break;
        }
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      if (!verified) {
        setPaymentState(prev => ({
          ...prev,
          status: 'pending',
          message: 'Waiting for on-chain block confirmation. If you confirmed the payment in your wallet, click RETRY VERIFICATION below.',
          selectedPkg: pkg,
          txType: 'ton',
          selectedCurrency: 'ton'
        }));
        toast('Awaiting on-chain confirmation. Click Retry Verification if needed.', 'info');
      }
    } finally {
      isProcessingPaymentRef.current = false;
    }
  };

  // ═══════════════════════════════════════════════════
  // 4. USDT (JETTON ON TON) PURCHASE HANDLER
  // ═══════════════════════════════════════════════════
  const handlePurchaseUsdt = async (pkg: TelegramPackage) => {
    const now = Date.now();
    if (isProcessingPaymentRef.current || now - lastPaymentTimeRef.current < 2500) {
      return;
    }
    isProcessingPaymentRef.current = true;
    lastPaymentTimeRef.current = now;

    if (!tonAddress) {
      isProcessingPaymentRef.current = false;
      toast('Please connect your TON wallet first!', 'warning');
      tonConnectUI.openModal();
      return;
    }

    try {
      const jettonUnits = Math.round(pkg.usdtCost * 1e6).toString();
      const bounceableTreasury = Address.parse(TON_TREASURY_WALLET_ADDRESS).toString({ bounceable: true });
      const walletName = tonConnectUI.walletInfo?.name || 'Wallet';

      setPaymentState({
        status: 'signing',
        message: 'Resolving your USDT (Jetton) wallet on TON...',
        selectedPkg: pkg,
        txType: 'ton',
        selectedCurrency: 'usdt'
      });

      const userJettonWallet = await getUsdtJettonWalletAddress(tonAddress);
      if (!userJettonWallet) {
        setPaymentState({
          status: 'error',
          message: 'Could not locate your USDT wallet in TON. Please ensure your wallet holds USDT on TON.'
        });
        toast('USDT wallet not found on TON account', 'error');
        return;
      }

      setPaymentState({
        status: 'signing',
        message: `Please approve the USDT transfer in ${walletName}...`,
        selectedPkg: pkg,
        txType: 'ton',
        selectedCurrency: 'usdt'
      });

      const payloadBoc = buildJettonTransferPayload(bounceableTreasury, tonAddress, BigInt(jettonUnits));

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        network: CHAIN.MAINNET,
        messages: [
          {
            address: userJettonWallet,
            amount: '50000000', // 0.05 TON for network gas fee
            payload: payloadBoc
          }
        ]
      };

      await tonConnectUI.sendTransaction(transaction, {
        returnStrategy: 'back',
        modals: [],
        notifications: [],
        onRequestSent: (redirectToWallet) => {
          redirectToWalletRef.current = redirectToWallet;
          const tg = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null;
          const uLink = tonConnectUI.walletInfo?.universalLink;
          if (tg?.openLink && uLink && !uLink.includes('t.me')) {
            tg.openLink(uLink);
          }
        }
      });

      setPaymentState(prev => ({
        ...prev,
        status: 'verifying',
        message: 'USDT transfer submitted! Verifying transaction on blockchain...'
      }));

      let verified = false;
      for (let attempt = 1; attempt <= 12; attempt++) {
        setPaymentState(prev => ({
          ...prev,
          message: `Verifying USDT on-chain (Attempt ${attempt}/12)...`
        }));

        const res = await verifyTonPayment(pkg.id, 'usdt', undefined, tonAddress);
        if (res.success) {
          verified = true;
          setPaymentState({
            status: 'success',
            message: `USDT payment confirmed! +${pkg.shardsReward} Dark Shards added!`,
            selectedPkg: pkg,
            txType: 'ton',
            selectedCurrency: 'usdt'
          });
          toast(`+${pkg.shardsReward} Dark Shards added!`, 'success');
          if (refreshProfile) await refreshProfile();
          break;
        }

        if (attempt < 12) {
          await new Promise(r => setTimeout(r, 2500));
        }
      }

      if (!verified) {
        setPaymentState(prev => ({
          ...prev,
          status: 'pending',
          message: 'USDT transaction submitted to TON. Waiting for block confirmation. Click RETRY VERIFICATION below.',
          selectedPkg: pkg,
          txType: 'ton',
          selectedCurrency: 'usdt'
        }));
      }

    } catch (err: any) {
      console.error('USDT purchase error:', err);
      
      if (isUserCancellation(err)) {
        setPaymentState({
          status: 'idle',
          message: 'Transaction was cancelled in wallet.'
        });
        toast('Transaction cancelled', 'info');
        return;
      }

      // Check on-chain before declaring failure
      setPaymentState(prev => ({
        ...prev,
        status: 'verifying',
        message: 'Checking USDT on-chain confirmation on TON blockchain...'
      }));

      let verified = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        const res = await verifyTonPayment(pkg.id, 'usdt', undefined, tonAddress);
        if (res.success) {
          verified = true;
          setPaymentState({
            status: 'success',
            message: `USDT payment confirmed! +${pkg.shardsReward} Dark Shards added!`,
            selectedPkg: pkg,
            txType: 'ton',
            selectedCurrency: 'usdt'
          });
          toast(`+${pkg.shardsReward} Dark Shards added!`, 'success');
          if (refreshProfile) await refreshProfile();
          break;
        }
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }

      if (!verified) {
        setPaymentState(prev => ({
          ...prev,
          status: 'pending',
          message: 'Waiting for USDT block confirmation. If you confirmed the payment in your wallet, click RETRY VERIFICATION below.',
          selectedPkg: pkg,
          txType: 'ton',
          selectedCurrency: 'usdt'
        }));
        toast('Awaiting on-chain confirmation. Click Retry Verification if needed.', 'info');
      }
    } finally {
      isProcessingPaymentRef.current = false;
    }
  };

  const handleRetryVerification = async () => {
    if (!paymentState.selectedPkg) return;
    const pkg = paymentState.selectedPkg;

    try {
      if (isTelegramUser) {
        const cur = paymentState.selectedCurrency || tgMethod || 'ton';
        if (cur === 'ton' || cur === 'usdt') {
          setPaymentState(prev => ({
            ...prev,
            status: 'verifying',
            message: `Re-verifying ${cur.toUpperCase()} on TON blockchain...`
          }));
          const res = await verifyTonPayment(pkg.id, cur, undefined, tonAddress);
          if (res.success) {
            setPaymentState({
              status: 'success',
              message: res.message
            });
            toast('Payment verified! Shards added!', 'success');
            if (refreshProfile) await refreshProfile();
            return;
          }
        }
      } else {
        const sig = paymentState.txSignature;
        if (!sig) return;

        setPaymentState(prev => ({
          ...prev,
          status: 'verifying',
          message: 'Re-verifying transaction on Solana blockchain...'
        }));

        const res = await verifySolanaPayment(sig, pkg.id);
        if (res.success) {
          setPaymentState(prev => ({
            ...prev,
            status: 'success',
            message: res.message
          }));
          toast('Transaction verified! Shards credited!', 'success');
          return;
        }

        const directOk = await verifySolanaOnChainDirect(sig, pkg);
        if (directOk) {
          const updated = { ...profile };
          if (pkg.shardsReward > 0) updated.darkShards = (updated.darkShards || 0) + pkg.shardsReward;
          updated.processedTransactions = [...(updated.processedTransactions || []), sig];
          saveProfile(updated);

          setPaymentState(prev => ({
            ...prev,
            status: 'success',
            message: `Payment confirmed on-chain! +${pkg.shardsReward} Dark Shards added!`
          }));
          toast('Transaction verified on-chain! Shards credited!', 'success');
          return;
        }
      }

      setPaymentState(prev => ({
        ...prev,
        status: 'pending',
        message: 'Verification in progress on the blockchain. Click RETRY VERIFICATION in a few seconds.'
      }));
      toast('Verification pending...', 'info');

    } catch (e: any) {
      toast(e.message || 'Error re-verifying transaction', 'error');
    }
  };

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'POPULAR':
        return 'bg-gradient-to-r from-purple-950 to-purple-800 text-purple-200 border-purple-400/50 shadow-[0_0_10px_rgba(168,85,247,0.3)]';
      case 'BEST VALUE':
        return 'bg-gradient-to-r from-amber-950 to-amber-800 text-amber-200 border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
      case 'SUPREME':
        return 'bg-gradient-to-r from-rose-950 to-red-800 text-rose-100 border-rose-400/60 shadow-[0_0_12px_rgba(244,63,94,0.4)]';
      default:
        return 'bg-black/60 text-gray-300 border-white/20';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseModal();
      }}
    >
      {/* Modal Container */}
      <div className="bg-gradient-to-b from-[#18111e] via-[#100a15] to-[#08050a] border-2 border-red-500/30 max-w-xl w-full rounded-3xl p-3 sm:p-5 shadow-[0_0_60px_rgba(221,44,64,0.18)] relative overflow-hidden flex flex-col space-y-2.5 sm:space-y-4 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto custom-scrollbar">
        
        {/* Top decorative gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-700 via-purple-600 to-rose-600" />
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-24 bg-red-600/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-2.5 sm:pb-3 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black/70 border border-red-500/50 flex items-center justify-center shadow-inner shrink-0">
              <img 
                src="/icons/icon_shards.webp" 
                alt="Dark Shards" 
                className="w-5 h-5 sm:w-6 sm:h-6 object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" 
              />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-black text-white text-xs sm:text-sm md:text-base tracking-widest uppercase text-shadow-gold leading-none truncate">
                DARK SHARDS SHOP
              </h3>
              <p className="text-[9px] sm:text-[10px] text-rose-300/80 font-mono mt-1 leading-none truncate">
                {isTelegramUser ? 'Telegram Stars · TON · USDT' : 'Acquire shards on Solana Mainnet'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Live Dark Shards Balance Pill */}
            <div className="flex items-center gap-1.5 bg-black/60 border border-rose-500/40 px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.15)]">
              <img 
                src="/icons/icon_shards.webp" 
                alt="Shards" 
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]" 
              />
              <span className="text-[11px] sm:text-xs font-mono font-black text-rose-300 leading-none">
                {(profile.darkShards || 0).toLocaleString()}
              </span>
            </div>

            {/* Solana Wallet Status (PC / External Mobile Browsers) */}
            {!isTelegramUser && (
              connected && publicKey ? (
                <div 
                  onClick={() => disconnect()}
                  title="Click to disconnect"
                  className="flex items-center gap-1 bg-black/60 hover:bg-red-950/40 border border-emerald-500/40 hover:border-red-500/40 px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-mono text-emerald-400 hover:text-red-300 transition-all cursor-pointer"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}</span>
                </div>
              ) : (
                <button
                  onClick={() => setSolanaModalVisible(true)}
                  className="flex items-center gap-1 bg-gradient-to-r from-purple-900/60 to-[#1f2833] hover:from-purple-700 hover:to-indigo-900 border border-purple-500/40 text-purple-300 px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer"
                >
                  <Wallet className="w-2.5 h-2.5" /> CONNECT
                </button>
              )
            )}

            <button 
              onClick={handleCloseModal}
              className="w-7 h-7 rounded-xl bg-black/50 hover:bg-red-950/60 border border-white/10 hover:border-red-500/40 text-gray-400 hover:text-red-300 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Telegram Multi-Payment Method Switcher */}
        {isTelegramUser && (paymentState.status === 'idle' || paymentState.status === 'success' || paymentState.status === 'error' || paymentState.status === 'pending') && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/70 border border-white/10 rounded-2xl shadow-inner">
              <button
                onClick={() => setTgMethod('stars')}
                className={`py-2 px-2 rounded-xl font-display font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none ${
                  tgMethod === 'stars'
                    ? 'bg-gradient-to-b from-[#2d1b06] via-[#1d1103] to-[#0f0801] border-2 border-amber-400 text-amber-300 shadow-[0_0_16px_rgba(245,158,11,0.4)] ring-1 ring-amber-400/50'
                    : 'bg-black/40 hover:bg-white/5 border border-white/5 hover:border-white/20 text-gray-400 hover:text-gray-200'
                }`}
              >
                <TelegramStarIcon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 transition-transform ${tgMethod === 'stars' ? 'scale-110 drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]' : 'opacity-70'}`} />
                <span className={tgMethod === 'stars' ? 'text-white drop-shadow' : ''}>STARS</span>
              </button>

              <button
                onClick={() => setTgMethod('ton')}
                className={`py-2 px-2 rounded-xl font-display font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none ${
                  tgMethod === 'ton'
                    ? 'bg-gradient-to-b from-[#061d2d] via-[#04131e] to-[#020a10] border-2 border-cyan-400 text-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.4)] ring-1 ring-cyan-400/50'
                    : 'bg-black/40 hover:bg-white/5 border border-white/5 hover:border-white/20 text-gray-400 hover:text-gray-200'
                }`}
              >
                <TonSymbolIcon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 transition-transform ${tgMethod === 'ton' ? 'scale-110 drop-shadow-[0_0_8px_rgba(0,152,234,0.9)]' : 'opacity-70'}`} />
                <span className={tgMethod === 'ton' ? 'text-white drop-shadow' : ''}>TON</span>
              </button>

              <button
                onClick={() => setTgMethod('usdt')}
                className={`py-2 px-2 rounded-xl font-display font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none ${
                  tgMethod === 'usdt'
                    ? 'bg-gradient-to-b from-[#06241a] via-[#031710] to-[#020d09] border-2 border-emerald-400 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.4)] ring-1 ring-emerald-400/50'
                    : 'bg-black/40 hover:bg-white/5 border border-white/5 hover:border-white/20 text-gray-400 hover:text-gray-200'
                }`}
              >
                <UsdtSymbolIcon className={`w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0 transition-transform ${tgMethod === 'usdt' ? 'scale-110 drop-shadow-[0_0_8px_rgba(38,161,123,0.9)]' : 'opacity-70'}`} />
                <span className={tgMethod === 'usdt' ? 'text-white drop-shadow' : ''}>USDT</span>
              </button>
            </div>

            {/* Dedicated TON Wallet status bar (only for TON & USDT methods) */}
            {(tgMethod === 'ton' || tgMethod === 'usdt') && (
              <div className="flex items-center justify-between px-3 py-1.5 bg-black/40 border border-cyan-500/20 rounded-xl">
                <div className="flex items-center gap-1.5 text-gray-400 font-mono text-[10px] sm:text-[11px]">
                  <Wallet className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>TON Wallet:</span>
                </div>

                {tonAddress ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => tonConnectUI.openModal()}
                      title="Connected TON Wallet (click for details)"
                      className="flex items-center gap-1.5 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-cyan-300 transition-all cursor-pointer"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span>{tonAddress.slice(0, 4)}...{tonAddress.slice(-4)}</span>
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await tonConnectUI.disconnect();
                          toast('TON wallet disconnected', 'info');
                        } catch (err) {
                          console.warn('Disconnect error:', err);
                        }
                      }}
                      title="Disconnect TON wallet"
                      className="w-5 h-5 rounded-full bg-black/60 hover:bg-red-950/60 border border-white/20 hover:border-red-500/50 text-gray-400 hover:text-red-300 flex items-center justify-center transition-all cursor-pointer"
                    >
                      <LogOut className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => tonConnectUI.openModal()}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-900/80 to-blue-900/80 hover:from-cyan-700 hover:to-blue-700 border border-cyan-500/50 text-cyan-200 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.25)]"
                  >
                    <Wallet className="w-3 h-3" /> CONNECT TON WALLET
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        {paymentState.status === 'idle' || paymentState.status === 'success' || paymentState.status === 'error' || paymentState.status === 'pending' ? (
          <div className="space-y-2.5 sm:space-y-4">
            
            {/* Packages 2x2 Grid on ALL screens */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {(isTelegramUser ? TELEGRAM_PACKAGES : SOLANA_PACKAGES).map(pkg => {
                const isPopular = pkg.popular;
                return (
                  <div
                    key={pkg.id}
                    className={`relative rounded-2xl p-2 sm:p-3 flex flex-col justify-between border transition-all duration-200 group hover:scale-[1.02] ${
                      isPopular 
                        ? 'bg-gradient-to-b from-[#211229]/90 via-[#140b1a]/95 to-black border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
                        : 'bg-gradient-to-b from-[#1b121e]/80 via-[#100a14]/90 to-black border-white/10 hover:border-red-500/40'
                    }`}
                  >
                    {/* Badge */}
                    {pkg.badge && (
                      <span className={`absolute top-1.5 right-1.5 text-[7px] sm:text-[8px] px-1.5 py-0.2 rounded-full font-mono font-black tracking-wider border uppercase z-10 ${getBadgeStyle(pkg.badge)}`}>
                        {pkg.badge}
                      </span>
                    )}

                    {/* Image Showcase */}
                    <div className="w-full flex items-center justify-center py-0.5 sm:py-1 relative">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.12),transparent_70%)] pointer-events-none" />
                      {pkg.image && (
                        <img 
                          src={pkg.image} 
                          alt={pkg.name} 
                          className="w-14 h-14 sm:w-20 sm:h-20 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform duration-300 rounded-xl" 
                        />
                      )}
                    </div>

                    {/* Title */}
                    <div className="text-center mt-0.5">
                      <span className="text-white font-display font-bold text-[10px] sm:text-xs tracking-wide block truncate">
                        {pkg.name}
                      </span>
                    </div>

                    {/* Reward Amount */}
                    <div className="flex items-center justify-center gap-1 my-1">
                      <img 
                        src="/icons/icon_shards.webp" 
                        alt="Shards" 
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain drop-shadow-[0_0_6px_rgba(239,68,68,0.7)] shrink-0" 
                      />
                      <span className="text-xs sm:text-sm font-black text-white font-mono leading-none tracking-tight">
                        +{pkg.shardsReward}
                      </span>
                    </div>

                    {/* Price Button */}
                    {isTelegramUser ? (
                      tgMethod === 'stars' ? (
                        <button
                          onClick={() => handlePurchaseStars(pkg as TelegramPackage)}
                          disabled={paymentState.status === 'signing' || paymentState.status === 'verifying'}
                          className="w-full bg-gradient-to-r from-[#2a1705] via-[#3d2308] to-[#1e1003] hover:from-[#3f2407] hover:to-[#2a1705] border border-amber-400/80 hover:border-amber-300 text-white font-mono text-[11px] sm:text-xs font-black py-2 px-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-[0_0_14px_rgba(245,158,11,0.25)] hover:shadow-[0_0_20px_rgba(245,158,11,0.45)] hover:scale-[1.02] flex items-center justify-center gap-1.5 active:scale-95 group/btn"
                        >
                          <TelegramStarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-[0_0_8px_rgba(245,158,11,0.9)] group-hover/btn:scale-110 transition-transform shrink-0" />
                          <span className="font-mono font-black text-amber-200 text-xs sm:text-sm tracking-tight">{(pkg as TelegramPackage).starsCost}</span>
                          <span className="text-[9px] sm:text-[10px] font-display font-bold text-amber-400 uppercase tracking-wider">STARS</span>
                        </button>
                      ) : tgMethod === 'ton' ? (
                        <button
                          onClick={() => handlePurchaseTon(pkg as TelegramPackage)}
                          disabled={paymentState.status === 'signing' || paymentState.status === 'verifying'}
                          className="w-full bg-gradient-to-r from-[#072030] via-[#0c2e44] to-[#051724] hover:from-[#0f3954] hover:to-[#082436] border border-cyan-400/80 hover:border-cyan-300 text-white font-mono text-[11px] sm:text-xs font-black py-2 px-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-[0_0_14px_rgba(6,182,212,0.25)] hover:shadow-[0_0_20px_rgba(6,182,212,0.45)] hover:scale-[1.02] flex items-center justify-center gap-1.5 active:scale-95 group/btn"
                        >
                          <TonSymbolIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-[0_0_8px_rgba(0,152,234,0.9)] group-hover/btn:scale-110 transition-transform shrink-0" />
                          <span className="font-mono font-black text-cyan-200 text-xs sm:text-sm tracking-tight">{(pkg as TelegramPackage).tonCost}</span>
                          <span className="text-[9px] sm:text-[10px] font-display font-bold text-cyan-300 uppercase tracking-wider">TON</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePurchaseUsdt(pkg as TelegramPackage)}
                          disabled={paymentState.status === 'signing' || paymentState.status === 'verifying'}
                          className="w-full bg-gradient-to-r from-[#06241a] via-[#093526] to-[#041a13] hover:from-[#0c4431] hover:to-[#06291e] border border-emerald-400/80 hover:border-emerald-300 text-white font-mono text-[11px] sm:text-xs font-black py-2 px-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-[0_0_14px_rgba(16,185,129,0.25)] hover:shadow-[0_0_20px_rgba(16,185,129,0.45)] hover:scale-[1.02] flex items-center justify-center gap-1.5 active:scale-95 group/btn"
                        >
                          <UsdtSymbolIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-[0_0_8px_rgba(38,161,123,0.9)] group-hover/btn:scale-110 transition-transform shrink-0" />
                          <span className="font-mono font-black text-emerald-200 text-xs sm:text-sm tracking-tight">${(pkg as TelegramPackage).usdtCost}</span>
                          <span className="text-[9px] sm:text-[10px] font-display font-bold text-emerald-300 uppercase tracking-wider">USDT</span>
                        </button>
                      )
                    ) : (
                      /* Solana Price Button (PC / External Mobile Browsers) */
                      <button
                        onClick={() => handlePurchaseSolana(pkg as SolanaPackage)}
                        disabled={paymentState.status === 'signing' || paymentState.status === 'verifying'}
                        className="w-full bg-gradient-to-r from-[#1d0a2c] via-[#2a0e3e] to-[#160621] hover:from-[#35124e] hover:to-[#1f092e] border border-purple-400/80 hover:border-purple-300 text-white font-mono text-[11px] sm:text-xs font-black py-2 px-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-[0_0_14px_rgba(168,85,247,0.25)] hover:shadow-[0_0_20px_rgba(168,85,247,0.45)] hover:scale-[1.02] flex items-center justify-center gap-1.5 active:scale-95 group/btn"
                      >
                        <SolanaSymbolIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 drop-shadow-[0_0_8px_rgba(220,31,255,0.9)] group-hover/btn:scale-110 transition-transform shrink-0" />
                        <span className="font-mono font-black text-purple-200 text-xs sm:text-sm tracking-tight">{(pkg as SolanaPackage).solCost}</span>
                        <span className="text-[9px] sm:text-[10px] font-display font-bold text-purple-300 uppercase tracking-wider">SOL</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Transaction Overlays */}
        {paymentState.status !== 'idle' && paymentState.status !== 'success' && paymentState.status !== 'error' && paymentState.status !== 'pending' ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-6 text-center animate-in fade-in duration-200">
            <div className="relative">
              {paymentState.status === 'signing' && (
                <div className="w-16 h-16 rounded-2xl bg-amber-950/50 border-2 border-amber-500 flex items-center justify-center animate-bounce shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                  {paymentState.txType === 'stars' ? (
                    <Star className="w-8 h-8 text-amber-400" />
                  ) : (
                    <Wallet className="w-8 h-8 text-amber-400" />
                  )}
                </div>
              )}
              {paymentState.status === 'verifying' && (
                <div className="w-16 h-16 rounded-full border-4 border-amber-900/30 border-t-amber-500 animate-spin" />
              )}
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-display font-bold text-sm tracking-wider uppercase">
                {paymentState.status === 'signing' && (paymentState.txType === 'stars' ? 'Confirm Stars in Telegram' : 'Confirm in Wallet')}
                {paymentState.status === 'verifying' && 'Verifying Transaction...'}
              </h4>
              {paymentState.status === 'signing' && paymentState.message && (
                <p className="text-xs text-gray-400 font-sans max-w-xs mx-auto leading-relaxed">
                  {paymentState.message}
                </p>
              )}
              {paymentState.status === 'signing' && (
                <div className="flex flex-col items-center gap-2 mt-3 w-full max-w-xs mx-auto">
                  {paymentState.txType === 'ton' && tonConnectUI.walletInfo && !tonConnectUI.walletInfo.universalLink?.includes('t.me') && (
                    <button
                      type="button"
                      onClick={handleOpenWallet}
                      className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95 flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open {tonConnectUI.walletInfo.name || 'Wallet'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (activeStarsHandlerRef.current && (window as any).Telegram?.WebApp?.offEvent) {
                        (window as any).Telegram.WebApp.offEvent('invoiceClosed', activeStarsHandlerRef.current);
                        activeStarsHandlerRef.current = null;
                      }
                      if (starsWatchdogTimerRef.current) {
                        clearTimeout(starsWatchdogTimerRef.current);
                        starsWatchdogTimerRef.current = null;
                      }
                      isProcessingPaymentRef.current = false;
                      setPaymentState({ status: 'idle', message: '' });
                    }}
                    className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white font-mono text-xs font-bold rounded-xl transition-all cursor-pointer border border-white/10 active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>Cancel / Return to Shop</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Success / Error / Pending Status Boxes */}
        {paymentState.status === 'success' || paymentState.status === 'error' || paymentState.status === 'pending' ? (
          <div className="border-t border-white/10 pt-4 space-y-4 animate-in fade-in duration-200">
            {paymentState.status === 'success' && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3.5 flex items-start gap-3 text-left shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white block">Payment Confirmed!</span>
                  <span className="text-[11px] text-emerald-300 font-sans mt-0.5 block leading-normal">{paymentState.message}</span>
                </div>
              </div>
            )}
            {paymentState.status === 'error' && (
              <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-3.5 flex items-start gap-3 text-left">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-white block">Transaction Failed</span>
                  <span className="text-[11px] text-red-300 font-sans mt-0.5 block leading-normal">{paymentState.message}</span>
                </div>
              </div>
            )}
            {paymentState.status === 'pending' && (
              <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-3.5 flex flex-col gap-2 text-left">
                <div className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-spin" />
                  <div>
                    <span className="text-xs font-bold text-white block">Awaiting Confirmation...</span>
                    <span className="text-[11px] text-amber-300 font-sans mt-0.5 block leading-normal">{paymentState.message}</span>
                  </div>
                </div>
              </div>
            )}

            {paymentState.txSignature && (
              <div className="bg-black/50 border border-white/10 p-3 rounded-xl text-left space-y-1">
                <span className="text-[9px] text-gray-400 font-mono block uppercase">
                  {paymentState.txType === 'ton' ? 'TON Transaction' : 'Solana Tx Signature'}
                </span>
                <a 
                  href={
                    paymentState.txType === 'ton'
                      ? `https://tonviewer.com/transaction/${paymentState.txSignature}`
                      : `https://solscan.io/tx/${paymentState.txSignature}`
                  }
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[11px] text-[#66fcf1] font-mono hover:underline flex items-center gap-1 truncate"
                >
                  <span className="truncate">{paymentState.txSignature}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            )}

            <div className="flex gap-2">
              {(paymentState.status === 'pending' || paymentState.status === 'error') && (
                <button
                  onClick={handleRetryVerification}
                  className="flex-1 bg-red-950/60 hover:bg-red-900/60 border border-red-500/40 text-red-200 font-display font-black py-2.5 px-4 rounded-xl text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> RETRY VERIFY
                </button>
              )}
              <button
                onClick={() => setPaymentState({ status: 'idle', message: '' })}
                className="flex-1 bg-[#1f2833] hover:bg-[#2b3a4a] text-white font-display font-bold py-2.5 px-4 rounded-xl text-xs tracking-wider transition-all cursor-pointer"
              >
                BACK TO SHOP
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
