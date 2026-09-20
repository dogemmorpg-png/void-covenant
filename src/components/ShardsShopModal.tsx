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
        message: 'Transfer submitted! Verifying on-chain via Toncenter / TonAPI...'
      }));

      let verified = false;
      for (let attempt = 1; attempt <= 12; attempt++) {
        setPaymentState(prev => ({
          ...prev,
          message: `Verifying on-chain via Toncenter (Attempt ${attempt}/12)...`
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
        message: 'USDT transfer submitted! Verifying on-chain via Toncenter / TonAPI...'
      }));

      let verified = false;
      for (let attempt = 1; attempt <= 12; attempt++) {
        setPaymentState(prev => ({
          ...prev,
          message: `Verifying USDT transfer on-chain (Attempt ${attempt}/12)...`
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
            message: `Re-verifying ${cur.toUpperCase()} on TON blockchain via Toncenter...`
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
        <div className="flex justify-between items-center border-b border-white/10 pb-2 sm:pb-3 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black/70 border border-red-500/50 flex items-center justify-center shadow-inner shrink-0">
              <img 
                src="/icons/icon_shards.webp" 
                alt="Dark Shards" 
                className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" 
              />
            </div>
            <div>
              <h3 className="font-display font-black text-white text-xs sm:text-base tracking-widest uppercase text-shadow-gold leading-none">
                DARK SHARDS SHOP
              </h3>
              <p className="text-[9px] sm:text-[10px] text-rose-300/80 font-mono mt-0.5">
                {isTelegramUser ? 'Acquire shards via Stars, TON or USDT' : 'Acquire shards on Solana Mainnet'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Live Dark Shards Balance Pill */}
            <div className="flex items-center gap-1.5 bg-black/60 border border-rose-500/40 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.15)]">
              <img 
                src="/icons/icon_shards.webp" 
                alt="Shards" 
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain drop-shadow-[0_0_6px_rgba(239,68,68,0.7)]" 
              />
              <span className="text-[11px] sm:text-xs font-mono font-black text-rose-300">
                {(profile.darkShards || 0).toLocaleString()}
              </span>
            </div>

            {isTelegramUser ? (
              /* Telegram Wallet Status (shown when TON / USDT tab active) */
              (tgMethod === 'ton' || tgMethod === 'usdt') && (
                tonAddress ? (
                  <div className="flex items-center gap-1">
                    <div 
                      onClick={() => tonConnectUI.openModal()}
                      title="Connected TON Wallet (click for details)"
                      className="flex items-center gap-1 bg-black/60 hover:bg-cyan-950/40 border border-cyan-500/40 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono text-cyan-300 transition-all cursor-pointer"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      <span>{tonAddress.slice(0, 4)}...{tonAddress.slice(-4)}</span>
                    </div>
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
                    className="flex items-center gap-1 bg-gradient-to-r from-cyan-900/60 to-blue-900/60 hover:from-cyan-700 hover:to-blue-700 border border-cyan-500/40 text-cyan-200 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer"
                  >
                    <Wallet className="w-2.5 h-2.5" /> CONNECT TON
                  </button>
                )
              )
            ) : (
              /* Solana Wallet Status (PC / External Mobile Browsers) */
              connected && publicKey ? (
                <div 
                  onClick={() => disconnect()}
                  title="Click to disconnect"
                  className="flex items-center gap-1 bg-black/60 hover:bg-red-950/40 border border-emerald-500/40 hover:border-red-500/40 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono text-emerald-400 hover:text-red-300 transition-all cursor-pointer"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}</span>
                </div>
              ) : (
                <button
                  onClick={() => setSolanaModalVisible(true)}
                  className="flex items-center gap-1 bg-gradient-to-r from-purple-900/60 to-[#1f2833] hover:from-purple-700 hover:to-indigo-900 border border-purple-500/40 text-purple-300 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold tracking-wider transition-all cursor-pointer"
                >
                  <Wallet className="w-2.5 h-2.5" /> CONNECT
                </button>
              )
            )}

            <button 
              onClick={handleCloseModal}
              className="w-7 h-7 rounded-xl bg-black/50 hover:bg-red-950/60 border border-white/10 hover:border-red-500/40 text-gray-400 hover:text-red-300 flex items-center justify-center transition-all cursor-pointer ml-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Telegram Multi-Payment Method Switcher */}
        {isTelegramUser && (paymentState.status === 'idle' || paymentState.status === 'success' || paymentState.status === 'error' || paymentState.status === 'pending') && (
          <div className="space-y-1.5">
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/60 border border-white/10 rounded-2xl">
              <button
                onClick={() => setTgMethod('stars')}
                className={`py-2 px-2 rounded-xl font-display font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  tgMethod === 'stars'
                    ? 'bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>⭐️</span>
                <span>STARS</span>
              </button>

              <button
                onClick={() => setTgMethod('ton')}
                className={`py-2 px-2 rounded-xl font-display font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  tgMethod === 'ton'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>💎</span>
                <span>TON</span>
              </button>

              <button
                onClick={() => setTgMethod('usdt')}
                className={`py-2 px-2 rounded-xl font-display font-black text-[11px] sm:text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  tgMethod === 'usdt'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>💵</span>
                <span>USDT (TON)</span>
              </button>
            </div>

            <p className="text-[10px] font-mono text-center text-gray-400">
              {tgMethod === 'stars' && '⚡ 1-click native purchase with Telegram Stars (Apple/Google Pay & Card).'}
              {tgMethod === 'ton' && '💎 Direct on-chain transfer in TON via your connected TON wallet.'}
              {tgMethod === 'usdt' && '💵 Transfer in USDT (TON Network) via your connected TON wallet.'}
            </p>
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
                          className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-mono text-[10px] sm:text-xs font-black py-1.5 sm:py-2 px-1 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-[0_0_12px_rgba(245,158,11,0.35)] hover:scale-102 flex items-center justify-center gap-1 active:scale-95"
                        >
                          <span>{(pkg as TelegramPackage).starsCost}</span>
                          <span className="text-sm leading-none">⭐️</span>
                        </button>
                      ) : tgMethod === 'ton' ? (
                        <button
                          onClick={() => handlePurchaseTon(pkg as TelegramPackage)}
                          disabled={paymentState.status === 'signing' || paymentState.status === 'verifying'}
                          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-[10px] sm:text-xs font-black py-1.5 sm:py-2 px-1 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-[0_0_12px_rgba(6,182,212,0.35)] hover:scale-102 flex items-center justify-center gap-1 active:scale-95"
                        >
                          <span>{(pkg as TelegramPackage).tonCost}</span>
                          <span className="text-[8px] sm:text-[9px] text-cyan-200 font-bold">TON</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePurchaseUsdt(pkg as TelegramPackage)}
                          disabled={paymentState.status === 'signing' || paymentState.status === 'verifying'}
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-mono text-[10px] sm:text-xs font-black py-1.5 sm:py-2 px-1 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-[0_0_12px_rgba(16,185,129,0.35)] hover:scale-102 flex items-center justify-center gap-1 active:scale-95"
                        >
                          <span>{(pkg as TelegramPackage).usdtCost}</span>
                          <span className="text-[8px] sm:text-[9px] text-emerald-950 font-black">USDT</span>
                        </button>
                      )
                    ) : (
                      /* Solana Price Button (PC / External Mobile Browsers) */
                      <button
                        onClick={() => handlePurchaseSolana(pkg as SolanaPackage)}
                        disabled={paymentState.status === 'signing' || paymentState.status === 'verifying'}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-[10px] sm:text-xs font-black py-1.5 sm:py-2 px-1 rounded-xl transition-all cursor-pointer whitespace-nowrap shadow-[0_0_10px_rgba(168,85,247,0.3)] hover:scale-102 flex items-center justify-center gap-1 active:scale-95"
                      >
                        <span>{(pkg as SolanaPackage).solCost}</span>
                        <span className="text-[7.5px] sm:text-[9px] text-purple-200 font-bold">SOL</span>
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
              <p className="text-xs text-gray-400 font-sans max-w-xs mx-auto leading-relaxed">
                {paymentState.message}
              </p>
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
