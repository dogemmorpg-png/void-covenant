import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from '../components/Toast';
import { Landmark, ArrowUpRight, TrendingUp } from 'lucide-react';

export const MobileBankView: React.FC = () => {
  const { profile, requestWithdrawal } = useGame();
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState<'withdraw' | 'history'>('withdraw');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState(profile.solanaAddress || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const balance = profile.bloodSovereigns || 0;
  const isSubActive = profile.subscriptionExpiresAt && profile.subscriptionExpiresAt > Date.now();
  const subTier = isSubActive ? (profile.subscriptionTier || 'free') : 'free';
  const minWithdrawal = subTier === 'ultra' ? 2000 : subTier === 'premium' ? 2500 : 3000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount < minWithdrawal || numAmount > balance) {
      toast('Invalid amount', 'error');
      return;
    }
    if (!address || address.length < 20) {
      toast('Invalid address', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestWithdrawal(numAmount, address.trim());
      if (res.success) {
        toast(res.message, 'success');
        setAmount('');
      } else {
        toast(res.message, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0c1015] text-white">
      <div className="flex h-7 bg-black/40 border-b border-gray-800 shrink-0">
        <button onClick={() => setActiveTab('withdraw')} className={`flex-1 text-[9px] font-display font-bold uppercase tracking-wider ${activeTab === 'withdraw' ? 'bg-amber-950 border border-amber-500 text-amber-300' : 'text-gray-500'}`}>Withdraw</button>
        <button onClick={() => setActiveTab('history')} className={`flex-1 text-[9px] font-display font-bold uppercase tracking-wider ${activeTab === 'history' ? 'bg-amber-950 border border-amber-500 text-amber-300' : 'text-gray-500'}`}>History</button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === 'withdraw' ? (
          <div className="flex flex-col md:flex-row gap-2 h-full">
            {/* Balance Card */}
            <div className="flex-1 bg-black/40 border border-amber-500/30 rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden">
               <Landmark className="absolute opacity-10 w-24 h-24 right-0 bottom-0" />
               <span className="text-[10px] font-mono text-gray-400">AVAILABLE BALANCE</span>
               <div className="flex items-center gap-1.5 mt-1">
                 <img src="/icons/icon_sovereign.webp" className="w-6 h-6 object-contain" />
                 <span className="font-display font-black text-2xl text-amber-400">{balance}</span>
               </div>
               <span className="text-[9px] text-emerald-400 font-mono mt-1">~${(balance * 0.01).toFixed(2)} USDT</span>
               
               <div className="mt-3 text-[8px] bg-black/60 p-1.5 rounded text-gray-400 w-full text-center border border-gray-800">
                 Min. Payout: {minWithdrawal} SOV
               </div>
            </div>

            {/* Form */}
            <div className="flex-1 bg-black/40 border border-amber-500/30 rounded-xl p-3 flex flex-col justify-center">
               <form onSubmit={handleSubmit} className="space-y-2">
                 <div>
                   <label className="text-[8px] text-gray-400 mb-0.5 block font-mono">AMOUNT (SOV)</label>
                   <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-black/60 border border-gray-700 rounded px-2 py-1.5 text-[10px] font-mono focus:border-amber-500 outline-none text-amber-300" placeholder={`Min ${minWithdrawal}`} />
                 </div>
                 <div>
                   <label className="text-[8px] text-gray-400 mb-0.5 block font-mono">SOLANA ADDRESS</label>
                   <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-black/60 border border-gray-700 rounded px-2 py-1.5 text-[10px] font-mono focus:border-amber-500 outline-none text-white" placeholder="Enter SOL Address" />
                 </div>
                 <button disabled={isSubmitting} type="submit" className="w-full mt-2 bg-amber-600 text-black font-display font-bold text-[10px] py-2 rounded flex items-center justify-center gap-1">
                   {isSubmitting ? 'PROCESSING...' : <><ArrowUpRight className="w-3 h-3"/> SUBMIT</>}
                 </button>
               </form>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
             <div className="text-[10px] font-mono text-center text-amber-500 uppercase tracking-widest flex items-center justify-center gap-1">
               <TrendingUp className="w-3 h-3" /> Recent Activity
             </div>
             {(profile.withdrawalRequests || []).map(req => (
               <div key={req.id} className="bg-black/60 border border-gray-800 rounded p-2 flex justify-between items-center">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-mono font-bold text-amber-400">{req.amountSovereigns} SOV</span>
                    <span className="text-[8px] text-gray-500 truncate w-32">{req.walletAddress}</span>
                 </div>
                 <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${req.status === 'completed' ? 'bg-emerald-900 text-emerald-300' : 'bg-amber-900 text-amber-300'}`}>
                   {req.status.toUpperCase()}
                 </span>
               </div>
             ))}
             {!(profile.withdrawalRequests?.length) && (
               <div className="text-[9px] text-center text-gray-500 mt-4">No withdrawal history found.</div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
