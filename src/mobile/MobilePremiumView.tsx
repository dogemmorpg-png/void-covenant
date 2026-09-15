import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from '../components/Toast';
import { Crown, Sparkles, Zap } from 'lucide-react';

export const MobilePremiumView: React.FC = () => {
  const { profile, buySubscription, setIsShardsShopOpen } = useGame();
  const toast = useToast();

  const [dur, setDur] = useState<30|90>(30);
  const [tier, setTier] = useState<'premium'|'ultra'>('premium');
  const [isProcessing, setIsProcessing] = useState(false);

  const isSubActive = profile.subscriptionExpiresAt && profile.subscriptionExpiresAt > Date.now();
  const activeTier = isSubActive ? (profile.subscriptionTier || 'free') : 'free';

  const prices = { premium: { 30: 150, 90: 400 }, ultra: { 30: 350, 90: 900 } };

  const handleBuy = async () => {
    const cost = prices[tier][dur];
    if ((profile.darkShards || 0) < cost) {
      toast('Not enough Shards!', 'warning');
      setIsShardsShopOpen(true);
      return;
    }
    setIsProcessing(true);
    try {
      const res = await buySubscription(tier, dur);
      if (res.success) toast(res.message, 'success');
      else toast(res.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full h-full flex bg-[#0c1015] text-white overflow-hidden">
      {/* Left Column 40% */}
      <div className="w-[40%] h-full p-2 border-r border-gray-800 flex flex-col bg-black/40">
         <div className="text-[10px] font-display font-black text-amber-400 text-center uppercase tracking-widest mb-1.5 flex justify-center items-center gap-1">
           <Crown className="w-3 h-3" /> Covenant Pass
         </div>
         
         <div className="flex bg-black/60 rounded border border-gray-800 mb-2 overflow-hidden">
            <button onClick={() => setDur(30)} className={`flex-1 py-1 text-[8px] font-bold ${dur === 30 ? 'bg-amber-900 text-white' : 'text-gray-500'}`}>30 DAYS</button>
            <button onClick={() => setDur(90)} className={`flex-1 py-1 text-[8px] font-bold ${dur === 90 ? 'bg-amber-900 text-white' : 'text-gray-500'}`}>90 DAYS</button>
         </div>

         <div className="space-y-1.5 flex-1 overflow-y-auto pb-2 custom-scrollbar">
            <div 
              onClick={() => setTier('premium')} 
              className={`border rounded-xl p-2 cursor-pointer flex flex-col items-center justify-center text-center relative ${tier === 'premium' ? 'bg-amber-950/40 border-amber-500' : 'bg-black/40 border-gray-700'}`}
            >
              {activeTier === 'premium' && <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[6px] font-bold px-1 rounded-bl">ACTIVE</div>}
              <span className="text-[10px] font-display font-bold text-amber-400">PREMIUM TIER</span>
              <div className="flex items-center gap-0.5 mt-0.5">
                <img src="/icons/icon_shards.webp" className="w-3 h-3 object-contain" />
                <span className="text-[11px] font-mono font-black">{prices.premium[dur]}</span>
              </div>
            </div>

            <div 
              onClick={() => setTier('ultra')} 
              className={`border rounded-xl p-2 cursor-pointer flex flex-col items-center justify-center text-center relative ${tier === 'ultra' ? 'bg-purple-950/40 border-purple-500' : 'bg-black/40 border-gray-700'}`}
            >
              {activeTier === 'ultra' && <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[6px] font-bold px-1 rounded-bl">ACTIVE</div>}
              <span className="text-[10px] font-display font-bold text-purple-400">ULTRA OVERLORD</span>
              <div className="flex items-center gap-0.5 mt-0.5">
                <img src="/icons/icon_shards.webp" className="w-3 h-3 object-contain" />
                <span className="text-[11px] font-mono font-black">{prices.ultra[dur]}</span>
              </div>
            </div>
         </div>
         
         <button 
           onClick={handleBuy} 
           disabled={isProcessing}
           className={`w-full py-2 rounded text-[9px] font-display font-black uppercase tracking-wider ${tier === 'premium' ? 'bg-amber-600 text-black' : 'bg-purple-600 text-white'}`}
         >
           {isProcessing ? 'Processing...' : 'Activate Pass'}
         </button>
      </div>

      {/* Right Column 60% */}
      <div className="w-[60%] h-full p-2 overflow-y-auto custom-scrollbar">
         <div className={`text-[10px] font-display font-bold mb-2 pb-1 border-b uppercase ${tier === 'premium' ? 'text-amber-400 border-amber-500/30' : 'text-purple-400 border-purple-500/30'}`}>
           {tier === 'premium' ? 'Premium Privileges' : 'Ultra Overlord Privileges'}
         </div>
         
         <div className="space-y-1.5 font-sans">
            <div className="flex gap-1.5 items-start bg-black/40 p-1.5 rounded border border-gray-800">
               <Sparkles className={`w-3 h-3 shrink-0 ${tier === 'premium' ? 'text-amber-400' : 'text-purple-400'}`} />
               <div>
                 <div className="text-[9px] font-bold">{tier === 'premium' ? '8 PvP Tickets / Day' : '12 PvP Tickets / Day'}</div>
                 <div className="text-[7px] text-gray-400">Climb ranks faster.</div>
               </div>
            </div>
            
            <div className="flex gap-1.5 items-start bg-black/40 p-1.5 rounded border border-gray-800">
               <img src="/icons/icon_sovereign.webp" className="w-3 h-3 shrink-0 object-contain" />
               <div>
                 <div className="text-[9px] font-bold">{tier === 'premium' ? '+1 SOV / PvP Win' : '+2 SOV / PvP Win'}</div>
                 <div className="text-[7px] text-gray-400">Extra rewards on victory.</div>
               </div>
            </div>

            <div className="flex gap-1.5 items-start bg-black/40 p-1.5 rounded border border-gray-800">
               <img src="/icons/icon_energy.webp" className="w-3 h-3 shrink-0 object-contain" />
               <div>
                 <div className="text-[9px] font-bold">{tier === 'premium' ? '10 PvE Max Energy' : '20 PvE Max Energy'}</div>
                 <div className="text-[7px] text-gray-400">{tier === 'premium' ? '+25% Regen' : '+100% Regen'}</div>
               </div>
            </div>

            <div className="flex gap-1.5 items-start bg-black/40 p-1.5 rounded border border-gray-800">
               <Zap className="w-3 h-3 shrink-0 text-emerald-400" />
               <div>
                 <div className="text-[9px] font-bold">Withdrawal Minimum</div>
                 <div className="text-[7px] text-gray-400">{tier === 'premium' ? '2500 SOV' : '2000 SOV'} (Down from 3000)</div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
