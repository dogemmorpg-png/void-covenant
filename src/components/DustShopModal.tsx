import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { DUST_PACKAGES, DustPackage } from '../data/dustConfig';
import { X, Plus, Sparkles } from 'lucide-react';

interface DustShopModalProps {
  onClose: () => void;
}

export const DustShopModal: React.FC<DustShopModalProps> = ({ onClose }) => {
  const { profile, submitAction, setIsShardsShopOpen } = useGame();
  const toast = useToast();
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const handleBuyPackage = async (pkg: DustPackage) => {
    const currentShards = profile.darkShards || 0;
    if (currentShards < pkg.shardCost) {
      toast(`Insufficient Dark Shards! You need ${pkg.shardCost} shards.`, 'warning');
      return;
    }

    setPurchasingId(pkg.id);
    try {
      const res = await submitAction('buy_dust_pack', { packageId: pkg.id });
      if (res && res.success) {
        toast(`+${pkg.dustAmount.toLocaleString()} Void Dust infused into your essence!`, 'success');
      } else {
        toast(res?.message || 'Failed to purchase dust pack', 'error');
      }
    } catch (err: any) {
      toast(err?.message || 'Network error while purchasing dust', 'error');
    } finally {
      setPurchasingId(null);
    }
  };

  const getBadgeStyle = (badge?: string) => {
    switch (badge) {
      case 'POPULAR':
        return 'bg-gradient-to-r from-cyan-950 to-cyan-800 text-cyan-200 border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.4)]';
      case 'BEST VALUE':
        return 'bg-gradient-to-r from-teal-950 to-cyan-700 text-cyan-100 border-teal-400/70 shadow-[0_0_14px_rgba(20,184,166,0.4)]';
      case 'SUPREME':
        return 'bg-gradient-to-r from-purple-950 to-indigo-900 text-purple-200 border-purple-400/80 shadow-[0_0_16px_rgba(168,85,247,0.5)]';
      default:
        return 'bg-black/60 text-gray-300 border-white/20';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-2.5 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal Container */}
      <div className="bg-gradient-to-b from-[#081822] via-[#051017] to-[#02070b] border-2 border-cyan-500/40 max-w-xl w-full rounded-3xl p-3 sm:p-5 shadow-[0_0_60px_rgba(6,182,212,0.25)] relative overflow-hidden flex flex-col space-y-2.5 sm:space-y-4 animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto custom-scrollbar">
        
        {/* Top decorative gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-600 via-teal-400 to-indigo-500" />
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-28 bg-cyan-500/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/10 pb-2 sm:pb-3 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black/70 border border-cyan-500/50 flex items-center justify-center shadow-inner relative overflow-hidden shrink-0">
              <img 
                src="/icons/icon_dust.webp" 
                alt="Void Dust Sanctum" 
                className="w-6 h-6 sm:w-7 sm:h-7 scale-[1.7] object-contain drop-shadow-[0_0_8px_rgba(6,182,212,0.9)]" 
              />
              <Sparkles className="w-3 h-3 text-cyan-300 absolute -top-0.5 -right-0.5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-black text-white text-xs sm:text-base tracking-widest uppercase text-shadow-blue leading-none">
                VOID DUST SANCTUM
              </h3>
              <p className="text-[9px] sm:text-[10px] text-cyan-400/80 font-mono mt-0.5">
                Exchange Dark Shards for Void Dust
              </p>
            </div>
          </div>

          {/* Quick Balances & Close */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Shard balance with quick buy */}
            <div 
              onClick={() => {
                onClose();
                setIsShardsShopOpen(true);
              }}
              className="flex items-center gap-1 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 hover:border-red-400/80 rounded-full py-0.5 pl-1.5 pr-1 transition-all cursor-pointer group select-none shadow-sm"
              title="Click to buy more Dark Shards"
            >
              <img src="/icons/icon_shards.webp" alt="Shards" className="w-3.5 h-3.5 object-contain" />
              <span className="font-mono font-bold text-rose-300 text-[10px] sm:text-xs">{profile.darkShards || 0}</span>
              <div className="w-3.5 h-3.5 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center ml-0.5">
                <Plus className="w-2 h-2 text-white" />
              </div>
            </div>

            {/* Current Dust */}
            <div className="flex items-center gap-1 bg-cyan-950/40 border border-cyan-500/40 rounded-full py-0.5 px-2 shadow-sm">
              <img src="/icons/icon_dust.webp" alt="Dust" className="w-3.5 h-3.5 sm:w-4 sm:h-4 scale-[1.7] mx-0.5 object-contain" />
              <span className="font-mono font-bold text-cyan-300 text-[10px] sm:text-xs">{(profile.dust || 0).toLocaleString()}</span>
            </div>

            <button 
              onClick={onClose}
              className="w-7 h-7 rounded-xl bg-black/50 hover:bg-cyan-950/60 border border-white/10 hover:border-cyan-500/40 text-gray-400 hover:text-cyan-300 flex items-center justify-center transition-all cursor-pointer ml-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Packages 2x2 Grid on ALL screens */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {DUST_PACKAGES.map(pkg => {
            const isPopular = pkg.popular;
            const hasEnough = (profile.darkShards || 0) >= pkg.shardCost;
            const isPurchasing = purchasingId === pkg.id;

            return (
              <div
                key={pkg.id}
                className={`relative rounded-2xl p-2 sm:p-3 flex flex-col justify-between border transition-all duration-200 group hover:scale-[1.02] ${
                  isPopular 
                    ? 'bg-gradient-to-b from-[#0b2733]/90 via-[#071822]/95 to-black border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.2)]' 
                    : 'bg-gradient-to-b from-[#091e28]/80 via-[#05131b]/90 to-black border-cyan-900/40 hover:border-cyan-500/50'
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
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.18),transparent_70%)] pointer-events-none" />
                  <img 
                    src={pkg.image} 
                    alt={pkg.name} 
                    className="w-14 h-14 sm:w-20 sm:h-20 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] group-hover:scale-105 transition-transform duration-300 rounded-xl" 
                  />
                </div>

                {/* Title */}
                <div className="text-center mt-0.5">
                  <span className="text-white font-display font-bold text-[10px] sm:text-xs tracking-wide block truncate group-hover:text-cyan-300 transition-colors">
                    {pkg.name}
                  </span>
                  {pkg.description && (
                    <span className="hidden sm:block text-[9px] text-gray-400 line-clamp-1 mt-0.5 font-sans">
                      {pkg.description}
                    </span>
                  )}
                </div>

                {/* Reward Amount */}
                <div className="flex items-center justify-center gap-1 my-1">
                  <img 
                    src="/icons/icon_dust.webp" 
                    alt="Dust" 
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 scale-[1.7] mx-0.5 object-contain drop-shadow-[0_0_6px_rgba(6,182,212,0.8)] shrink-0" 
                  />
                  <span className="text-xs sm:text-sm font-black text-cyan-300 font-mono leading-none tracking-tight">
                    +{pkg.dustAmount.toLocaleString()}
                  </span>
                </div>

                {/* Price Button */}
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
                  className="w-full bg-gradient-to-r from-red-900/90 via-red-800 to-rose-900/90 hover:from-red-800 hover:to-rose-800 text-white border border-red-500/50 hover:border-red-400/80 font-mono text-[10px] sm:text-xs font-black py-1.5 sm:py-2 px-1 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1 active:scale-95 shadow-[0_0_10px_rgba(225,29,72,0.25)] hover:scale-102"
                  title={`Purchase for ${pkg.shardCost} Shards`}
                >
                  <img 
                    src="/icons/icon_shards.webp" 
                    alt="Shards" 
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain drop-shadow-[0_0_4px_rgba(244,63,94,0.8)] shrink-0" 
                  />
                  <span>{pkg.shardCost}</span>
                  <span className="text-[7.5px] sm:text-[9px] text-rose-200 uppercase font-bold tracking-wider opacity-90">
                    SHARDS
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="border-t border-white/5 pt-1.5 flex items-center justify-between text-[9px] sm:text-[10px] text-gray-400 font-sans">
          <span>Need more Dark Shards?</span>
          <button
            onClick={() => {
              onClose();
              setIsShardsShopOpen(true);
            }}
            className="text-cyan-400 hover:text-cyan-300 font-mono underline flex items-center gap-0.5 cursor-pointer transition-colors"
          >
            <span>Open Dark Shards Shop</span>
            <Plus className="w-2.5 h-2.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
