import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { GOLD_PACKAGES, GoldPackage } from '../data/goldConfig';
import { X, Plus, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface GoldShopModalProps {
  onClose: () => void;
}

export const GoldShopModal: React.FC<GoldShopModalProps> = ({ onClose }) => {
  const { profile, submitAction, setIsShardsShopOpen } = useGame();
  const toast = useToast();
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const handleBuyPackage = async (pkg: GoldPackage) => {
    const currentShards = profile.darkShards || 0;
    if (currentShards < pkg.shardCost) {
      toast(`Insufficient Dark Shards! You need ${pkg.shardCost} shards.`, 'warning');
      return;
    }

    setPurchasingId(pkg.id);
    try {
      const res = await submitAction('buy_gold_pack', { packageId: pkg.id });
      if (res && res.success) {
        toast(`+${pkg.goldAmount.toLocaleString()} Gold added to your treasury!`, 'success');
      } else {
        toast(res?.message || 'Failed to purchase gold pack', 'error');
      }
    } catch (err: any) {
      toast(err?.message || 'Network error while purchasing gold', 'error');
    } finally {
      setPurchasingId(null);
    }
  };

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'POPULAR':
        return 'bg-gradient-to-r from-amber-950 to-amber-800 text-amber-200 border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]';
      case 'BEST VALUE':
        return 'bg-gradient-to-r from-yellow-950 to-amber-700 text-yellow-100 border-yellow-400/70 shadow-[0_0_14px_rgba(250,204,21,0.4)]';
      case 'SUPREME':
        return 'bg-gradient-to-r from-rose-950 to-amber-800 text-amber-100 border-amber-300/80 shadow-[0_0_16px_rgba(251,191,36,0.5)]';
      default:
        return 'bg-black/60 text-gray-300 border-white/20';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Container */}
      <div className="bg-gradient-to-b from-[#1c1408] via-[#120d04] to-[#0a0702] border-2 border-amber-500/40 max-w-xl w-full rounded-3xl p-5 sm:p-6 shadow-[0_0_60px_rgba(245,158,11,0.22)] relative overflow-hidden flex flex-col space-y-5 animate-in zoom-in-95 duration-200">
        
        {/* Top decorative gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-28 bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-3.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black/70 border border-amber-500/50 flex items-center justify-center shadow-inner relative">
              <img 
                src="/icons/icon_gold.webp" 
                alt="Gold Treasury" 
                className="w-7 h-7 object-contain drop-shadow-[0_0_12px_rgba(245,158,11,0.8)]" 
              />
              <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-black text-white text-base sm:text-lg tracking-widest uppercase text-shadow-gold flex items-center gap-2">
                GOLD REPOSITORY
              </h3>
              <p className="text-[11px] text-amber-400/80 font-mono">
                Exchange Dark Shards for Imperial Gold
              </p>
            </div>
          </div>

          {/* Quick Balances & Close */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Shard balance with quick buy */}
            <div 
              onClick={() => {
                onClose();
                setIsShardsShopOpen(true);
              }}
              className="flex items-center gap-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 hover:border-red-400/80 rounded-full py-1 pl-2 pr-1.5 transition-all cursor-pointer group select-none shadow-sm"
              title="Click to buy more Dark Shards"
            >
              <img src="/icons/icon_shards.webp" alt="Shards" className="w-4 h-4 object-contain" />
              <span className="font-mono font-bold text-rose-300 text-xs">{profile.darkShards || 0}</span>
              <div className="w-4 h-4 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center ml-0.5">
                <Plus className="w-2.5 h-2.5 text-white" />
              </div>
            </div>

            {/* Current Gold */}
            <div className="flex items-center gap-1.5 bg-amber-950/40 border border-amber-500/40 rounded-full py-1 px-2.5 shadow-sm">
              <img src="/icons/icon_gold.webp" alt="Gold" className="w-4 h-4 object-contain" />
              <span className="font-mono font-bold text-amber-300 text-xs">{(profile.gold || 0).toLocaleString()}</span>
            </div>

            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-black/50 hover:bg-amber-950/60 border border-white/10 hover:border-amber-500/40 text-gray-400 hover:text-amber-300 flex items-center justify-center transition-all cursor-pointer ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Packages 2x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {GOLD_PACKAGES.map(pkg => {
            const isPopular = pkg.popular;
            const hasEnough = (profile.darkShards || 0) >= pkg.shardCost;
            const isPurchasing = purchasingId === pkg.id;

            return (
              <div
                key={pkg.id}
                className={`relative rounded-2xl p-3.5 flex flex-col justify-between border transition-all duration-300 group hover:scale-[1.02] ${
                  isPopular 
                    ? 'bg-gradient-to-b from-[#2b200b]/90 via-[#1a1306]/95 to-black border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.2)]' 
                    : 'bg-gradient-to-b from-[#1e170a]/80 via-[#140e04]/90 to-black border-amber-900/40 hover:border-amber-500/50'
                }`}
              >
                {/* Badge */}
                {pkg.badge && (
                  <span className={`absolute top-2.5 right-2.5 text-[8px] px-2 py-0.5 rounded-full font-mono font-black tracking-wider border uppercase ${getBadgeStyle(pkg.badge)}`}>
                    {pkg.badge}
                  </span>
                )}

                {/* Image Showcase */}
                <div className="w-full flex items-center justify-center pt-2 pb-1 relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.18),transparent_70%)] pointer-events-none" />
                  <img 
                    src={pkg.image} 
                    alt={pkg.name} 
                    className="w-24 h-24 sm:w-26 sm:h-26 object-contain drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)] group-hover:scale-105 transition-transform duration-300 rounded-xl" 
                  />
                </div>

                {/* Title & Description */}
                <div className="text-center mt-1">
                  <span className="text-white font-display font-black text-xs sm:text-sm tracking-wide block truncate group-hover:text-amber-300 transition-colors">
                    {pkg.name}
                  </span>
                  {pkg.description && (
                    <span className="text-[10px] text-gray-400 block line-clamp-1 mt-0.5 font-sans">
                      {pkg.description}
                    </span>
                  )}
                </div>

                {/* Price & Reward Row */}
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <img 
                      src="/icons/icon_gold.webp" 
                      alt="Gold" 
                      className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] group-hover:scale-110 transition-transform duration-300" 
                    />
                    <span className="text-lg sm:text-xl font-black text-amber-400 font-mono leading-none tracking-tight">
                      {pkg.goldAmount.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (!hasEnough) {
                        onClose();
                        setIsShardsShopOpen(true);
                      } else {
                        handleBuyPackage(pkg);
                      }
                    }}
                    disabled={isPurchasing}
                    className={`font-mono text-xs font-black py-2 px-3 sm:px-3.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 active:scale-95 shadow-md ${
                      !hasEnough
                        ? 'bg-gradient-to-r from-red-900/70 to-red-800/80 hover:from-red-800 hover:to-red-700 text-rose-200 border border-red-500/40 hover:scale-105'
                        : 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.35)] hover:scale-105'
                    }`}
                    title={!hasEnough ? 'Click to open Dark Shards Shop' : `Purchase for ${pkg.shardCost} Shards`}
                  >
                    <img 
                      src="/icons/icon_shards.webp" 
                      alt="Shards" 
                      className="w-3.5 h-3.5 object-contain" 
                    />
                    <span>{pkg.shardCost}</span>
                    <span className="text-[10px] uppercase font-bold opacity-90">
                      {!hasEnough ? 'GET' : 'SHARDS'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[10px] text-gray-400 font-sans">
          <span>Need more Dark Shards?</span>
          <button
            onClick={() => {
              onClose();
              setIsShardsShopOpen(true);
            }}
            className="text-amber-400 hover:text-amber-300 font-mono underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Open Dark Shards Shop</span>
            <Plus className="w-3 h-3" />
          </button>
        </div>

      </div>
    </div>
  );
};
