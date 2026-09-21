import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useToast } from '../../components/Toast';

interface MobileTelegramChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimed?: () => void;
}

export const MobileTelegramChannelModal: React.FC<MobileTelegramChannelModalProps> = ({
  isOpen,
  onClose,
  onClaimed
}) => {
  const { checkTelegramSubscription } = useGame();
  const toast = useToast();

  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleJoin = () => {
    setErrorMessage(null);
    const tg = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null;
    const channelUrl = 'https://t.me/voidcovenant';

    if (tg?.openTelegramLink) {
      tg.openTelegramLink(channelUrl);
    } else {
      window.open(channelUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleClaim = async () => {
    setIsChecking(true);
    setErrorMessage(null);

    try {
      const res = await checkTelegramSubscription();
      if (res.success) {
        const tg = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null;
        if (tg?.HapticFeedback) {
          tg.HapticFeedback.notificationOccurred('success');
        }
        toast(res.message || '🎉 Subscribed! +25 Dark Shards added to your vault.', 'success');
        if (onClaimed) onClaimed();
        onClose();
      } else {
        const tg = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null;
        if (tg?.HapticFeedback) {
          tg.HapticFeedback.notificationOccurred('error');
        }
        setErrorMessage(res.error || res.message || 'You have not joined @voidcovenant yet. Please join the channel and click check again!');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Verification network error. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#191624] via-[#0e0c15] to-[#07060a] border border-[#c5a880]/35 shadow-[0_0_50px_rgba(6,182,212,0.25)] p-5 sm:p-6 overflow-hidden text-center select-none"
        >
          {/* Top ambient radial glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-40 bg-cyan-500/20 blur-[80px] pointer-events-none rounded-full" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer z-20 active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon Header */}
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-900/30 to-black border-2 border-cyan-400/50 shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center mb-3">
            <Send className="w-8 h-8 text-cyan-300 transform -rotate-12 translate-x-0.5" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 border border-amber-300 flex items-center justify-center shadow-md">
              <Sparkles className="w-3 h-3 text-black fill-black" />
            </div>
          </div>

          {/* Title & Lore */}
          <span className="font-mono text-[10.5px] uppercase tracking-[0.25em] text-cyan-300 font-bold block">
            // Imperial Decree
          </span>
          <h3 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-wider text-shadow-gold mt-1">
            Join the Channel
          </h3>
          <p className="text-xs text-gray-300 font-serif italic leading-relaxed mt-1.5 px-2">
            Subscribe to our official Telegram channel <strong className="text-cyan-300 font-bold">@voidcovenant</strong> for secret promo codes, development intel, and exclusive airdrops.
          </p>

          {/* Reward Box */}
          <div className="my-4 p-3.5 rounded-2xl bg-black/60 border border-cyan-500/30 shadow-inner flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-center shrink-0">
                <img
                  src="/icons/icon_shard.webp"
                  alt="Dark Shard"
                  className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                />
              </div>
              <div className="text-left">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Reward</span>
                <span className="font-display font-black text-white text-base leading-tight">
                  +25 Dark Shards
                </span>
              </div>
            </div>
            <span className="font-mono text-[11px] font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/40 px-2.5 py-1 rounded-full shrink-0">
              One-time
            </span>
          </div>

          {/* Error / Warning Alert if not subscribed */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3.5 p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2 text-left"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMessage}</span>
            </motion.div>
          )}

          {/* Actions */}
          <div className="space-y-2.5 pt-1">
            {/* 1. Join Channel Button */}
            <button
              onClick={handleJoin}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 hover:from-cyan-500 hover:to-indigo-600 text-white font-display font-black text-xs tracking-widest uppercase transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4 text-cyan-200" />
              <span>1. Join @voidcovenant</span>
            </button>

            {/* 2. Check & Claim Button */}
            <button
              onClick={handleClaim}
              disabled={isChecking}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:to-yellow-400 text-black font-display font-black text-xs tracking-widest uppercase transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Verifying Membership...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>2. Check & Claim +25 💎</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
