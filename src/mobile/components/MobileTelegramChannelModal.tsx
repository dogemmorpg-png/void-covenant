import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#18141f] via-[#0f0d14] to-[#08070b] border border-[#ebd09b]/35 shadow-[0_0_50px_rgba(0,0,0,0.9)] p-5 sm:p-6 overflow-hidden text-center animate-in zoom-in-95 duration-150">
        
        {/* Soft top ambient glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-32 bg-cyan-500/15 blur-3xl pointer-events-none rounded-full" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full bg-black/60 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all cursor-pointer z-20 active:scale-90"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Icon Header */}
        <div className="relative mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0c2438] via-[#081724] to-black border-2 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center justify-center mb-2.5">
          <Send className="w-7 h-7 text-cyan-300 transform -rotate-12 translate-x-0.5" />
        </div>

        {/* Subtitle / Category */}
        <span className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-cyan-400 font-bold block">
          OFFICIAL COMMUNITY
        </span>

        {/* Title */}
        <h3 className="font-display font-black text-lg sm:text-xl text-white uppercase tracking-wider text-shadow-gold mt-0.5">
          JOIN OUR CHANNEL
        </h3>

        {/* Accurate, honest description */}
        <p className="text-[11.5px] text-gray-300 leading-relaxed mt-1 px-1">
          Subscribe to our official Telegram channel <strong className="text-cyan-300 font-bold">@voidcovenant</strong> for project news, game updates, and announcements.
        </p>

        {/* Reward Box with working shard icon */}
        <div className="my-3.5 p-3 rounded-2xl bg-black/70 border border-[#ebd09b]/25 shadow-inner flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-950/30 border border-red-500/30 flex items-center justify-center shrink-0">
              <img
                src="/icons/icon_shards.webp"
                alt="Dark Shards"
                className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]"
              />
            </div>
            <div className="text-left">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block">Reward</span>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-white text-[15px] leading-tight">
                  +25 Dark Shards
                </span>
                <img src="/icons/icon_shards.webp" alt="" className="w-3.5 h-3.5 object-contain" />
              </div>
            </div>
          </div>
          <span className="font-mono text-[10px] font-bold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-full shrink-0">
            One-time
          </span>
        </div>

        {/* Error / Warning Alert if not subscribed */}
        {errorMessage && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2 text-left animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-snug text-[11px]">{errorMessage}</span>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2 pt-0.5">
          {/* 1. Join Channel Button */}
          <button
            onClick={handleJoin}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0c2233] hover:bg-[#102d44] border border-cyan-500/50 hover:border-cyan-400 text-cyan-200 hover:text-white font-display font-bold text-xs tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Send className="w-3.5 h-3.5 text-cyan-300" />
            <span>1. Join @voidcovenant</span>
          </button>

          {/* 2. Check & Claim Button with real Shard icon */}
          <button
            onClick={handleClaim}
            disabled={isChecking}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-b from-[#e5a93c] via-[#c28422] to-[#996515] hover:brightness-110 text-black font-display font-black text-xs tracking-wider uppercase transition-all shadow-[0_0_18px_rgba(235,208,155,0.3)] flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50 disabled:pointer-events-none border border-[#ebd09b]/70"
          >
            {isChecking ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                <span>Verifying Membership...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                <span>2. Check & Claim +25</span>
                <img src="/icons/icon_shards.webp" alt="Shards" className="w-3.5 h-3.5 object-contain" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
