import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from '../components/Toast';
import { Swords, Trophy, Clock, Search, X } from 'lucide-react';
import { PvpLeague } from '../types';

interface MobilePvpViewProps {
  onStartBattle: (opponent: any) => void;
  isMatching: boolean;
  setIsMatching: (v: boolean) => void;
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
}

export const MobilePvpView: React.FC<MobilePvpViewProps> = ({ 
  onStartBattle, isMatching, setIsMatching, isModalOpen, setIsModalOpen 
}) => {
  const { profile, searchMatch } = useGame();
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState<'duels'|'league'>('duels');
  const [opponent, setOpponent] = useState<any>(null);

  const handleSearch = async () => {
    if (profile.deck.length < 10) {
      toast('Deck must have 10 cards.', 'warning');
      return;
    }
    if ((profile.pvpEnergy || 0) < 1) {
      toast('Not enough PvP Tickets.', 'warning');
      return;
    }

    setIsMatching(true);
    try {
      const result = await searchMatch();
      if (result.success && result.opponent) {
        setOpponent(result.opponent);
        setIsModalOpen(true);
      } else {
        toast(result.message || 'No match found.', 'error');
      }
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="w-full h-full flex bg-[#0c1015] text-white">
      {/* Left Column 35% */}
      <div className="w-[35%] h-full p-2 border-r border-gray-800 flex flex-col items-center justify-center bg-black/40">
        <div className="w-16 h-16 rounded-full border-2 border-purple-500 flex items-center justify-center overflow-hidden mb-2">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} className="w-full h-full object-cover" />
          ) : (
            <img src="/avatars/knight.webp" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="text-[11px] font-display font-black tracking-widest">{profile.username}</div>
        
        <div className="bg-black/60 border border-purple-500/30 rounded px-2 py-1 flex items-center gap-2 mt-2 w-full justify-center">
          <img src="/icons/ticket_variant_3_gold.png" className="w-4 h-4 object-contain" />
          <span className="text-[9px] font-mono text-purple-300 font-bold">TICKETS: {profile.pvpEnergy}/5</span>
        </div>
        
        <div className="bg-black/60 border border-amber-500/30 rounded px-2 py-1 flex flex-col items-center mt-1 w-full text-center">
          <span className="text-[8px] font-mono text-gray-400">LEAGUE POINTS</span>
          <span className="text-[11px] font-mono font-black text-amber-400">{profile.pvpLP} LP</span>
        </div>
      </div>

      {/* Right Column 65% */}
      <div className="w-[65%] h-full p-2 flex flex-col relative">
        <div className="flex h-7 bg-black/40 border border-gray-800 rounded-lg overflow-hidden shrink-0 mb-2">
           <button onClick={() => setActiveTab('duels')} className={`flex-1 text-[9px] font-display font-bold uppercase tracking-wider ${activeTab === 'duels' ? 'bg-purple-950 border border-purple-500 text-purple-300' : 'text-gray-500'}`}>Duels</button>
           <button onClick={() => setActiveTab('league')} className={`flex-1 text-[9px] font-display font-bold uppercase tracking-wider ${activeTab === 'league' ? 'bg-amber-950 border border-amber-500 text-amber-300' : 'text-gray-500'}`}>League</button>
        </div>
        
        {activeTab === 'duels' && (
          <div className="flex-1 flex flex-col justify-center items-center bg-[url('/ui/arena_bg.jpg')] bg-cover bg-center rounded-xl border border-purple-500/30 relative">
            <div className="absolute inset-0 bg-black/70 rounded-xl"></div>
            <button 
              onClick={handleSearch}
              disabled={isMatching}
              className="relative z-10 w-32 h-32 rounded-full border-4 border-purple-500 bg-black/80 flex flex-col items-center justify-center overflow-hidden hover:scale-105 active:scale-95 transition-transform"
            >
              {isMatching ? (
                <>
                  <div className="absolute inset-0 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                  <Search className="w-6 h-6 text-purple-400 animate-pulse" />
                  <span className="text-[8px] font-display font-bold text-purple-400 mt-1 uppercase">Searching...</span>
                </>
              ) : (
                <>
                   <Swords className="w-8 h-8 text-purple-500 mb-1" />
                   <span className="text-[10px] font-display font-black text-white uppercase tracking-widest">FIND MATCH</span>
                   <span className="text-[7px] text-gray-400 font-mono mt-0.5">-1 Ticket</span>
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === 'league' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/50 border border-gray-800 rounded-xl p-2">
             <div className="text-[10px] font-mono text-center text-amber-500 mb-2 font-bold uppercase">Rankings & Rewards</div>
             <p className="text-[8px] text-gray-400 text-center">Climb leagues to earn daily Blood Sovereigns and exclusive cards.</p>
             <div className="mt-2 space-y-1">
               {['Grandmaster', 'Master', 'Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze'].map((l, i) => (
                 <div key={l} className="flex justify-between items-center p-1.5 bg-black/40 border border-white/5 rounded">
                   <div className="flex items-center gap-1.5">
                     <div className="w-4 h-4 rounded bg-gray-800 flex items-center justify-center text-[7px] font-bold">{i+1}</div>
                     <span className="text-[9px] font-bold text-white">{l}</span>
                   </div>
                   <span className="text-[8px] text-gray-400">{(7-i)*500} LP</span>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* Opponent Found Modal */}
        {isModalOpen && opponent && (
          <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-2 rounded-xl border border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            <h3 className="text-sm font-display font-black text-white mb-3 text-shadow-purple">OPPONENT FOUND</h3>
            
            <div className="flex items-center gap-4 w-full justify-center">
              {/* Me */}
              <div className="flex flex-col items-center">
                 <img src={profile.avatarUrl || '/avatars/knight.webp'} className="w-12 h-12 rounded-full border-2 border-purple-500 object-cover" />
                 <span className="text-[9px] font-bold mt-1 truncate w-16 text-center">{profile.username}</span>
              </div>
              
              <Swords className="w-6 h-6 text-red-500" />
              
              {/* Opponent */}
              <div className="flex flex-col items-center">
                 <img src={opponent.avatarUrl || '/avatars/knight.webp'} className="w-12 h-12 rounded-full border-2 border-red-500 object-cover" />
                 <span className="text-[9px] font-bold mt-1 truncate w-16 text-center text-red-300">{opponent.username}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4 w-full">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-gray-800 text-[10px] font-bold uppercase rounded text-gray-300">Flee</button>
              <button onClick={() => { setIsModalOpen(false); onStartBattle(opponent); }} className="flex-1 py-2 bg-purple-600 text-[10px] font-bold uppercase rounded text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]">BATTLE</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
