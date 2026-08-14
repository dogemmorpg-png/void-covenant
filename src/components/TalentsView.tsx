import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { TALENT_TREES, TalentStance, TalentNode } from '../data/talents';
import { Zap, Activity, Flame, Shield, Star, Lock, Plus } from 'lucide-react';

export const TalentsView: React.FC = () => {
  const { profile, updateProfile, submitAction } = useGame();
  const toast = useToast();
  
  if (!profile) return null;

  const totalPoints = Math.max(0, profile.level - 1);
  const spentPoints = Object.values(profile.talents || {}).reduce((sum, val) => sum + val, 0);
  const availablePoints = totalPoints - spentPoints;
  const activeStance = profile.activeStance || 'void_strike';

  const handlePurchase = async (nodeId: string) => {
    if (availablePoints <= 0) {
      toast('Not enough skill points! Level up to get more.', 'warning');
      return;
    }

    const node = TALENT_TREES.find(n => n.id === nodeId);
    if (!node) return;

    const currentLevel = profile.talents?.[nodeId] || 0;
    if (currentLevel >= node.maxLevel) {
      toast('Talent is already maxed!', 'info');
      return;
    }

    // Check requirements
    if (node.requires && node.requires.length > 0) {
      const hasReq = node.requires.every(reqId => (profile.talents?.[reqId] || 0) > 0);
      if (!hasReq) {
        toast('You must unlock the previous talent first.', 'error');
        return;
      }
    }

    const newTalents = { ...profile.talents, [nodeId]: currentLevel + 1 };
    
    // Optimistic update
    updateProfile({ talents: newTalents });
    
    // In a real app we'd sync this to backend immediately or queue it
    // Wait, sync is automatic when we update context? Yes, GameContext syncs state automatically.
    toast('Talent upgraded!', 'success');
  };

  const handleEquipStance = (stance: TalentStance) => {
    updateProfile({ activeStance: stance });
    toast('Combat Stance updated!', 'success');
  };

  const handleReset = () => {
    if (profile.gold < 500) {
      toast('Not enough Gold to reset talents. Costs 500 Gold.', 'warning');
      return;
    }
    if (spentPoints === 0) {
      toast('You have not spent any points yet.', 'info');
      return;
    }

    const newProfile = { ...profile, gold: profile.gold - 500, talents: {} };
    updateProfile(newProfile);
    toast('Talents reset successfully.', 'success');
  };

  const renderStanceColumn = (stance: TalentStance, title: string, icon: React.ReactNode, colorClass: string) => {
    const stanceNodes = TALENT_TREES.filter(t => t.stance === stance);
    const isEquipped = activeStance === stance;

    return (
      <div className={`flex flex-col gap-4 p-4 rounded-xl border ${isEquipped ? 'border-amber-500/50 bg-amber-950/10' : 'border-gray-800 bg-black/40'} flex-1`}>
        <div className="flex flex-col items-center mb-4 text-center space-y-2">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${isEquipped ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.5)]' : 'border-gray-700'}`}>
            {icon}
          </div>
          <h3 className={`font-display font-bold text-lg ${colorClass}`}>{title}</h3>
          <button 
            onClick={() => handleEquipStance(stance)}
            disabled={isEquipped}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isEquipped ? 'bg-amber-600/20 text-amber-500 border border-amber-600/50' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            {isEquipped ? 'ACTIVE STANCE' : 'EQUIP STANCE'}
          </button>
        </div>

        <div className="flex flex-col gap-3 relative">
          {stanceNodes.sort((a, b) => a.row - b.row).map(node => {
            const currentLevel = profile.talents?.[node.id] || 0;
            const isMaxed = currentLevel >= node.maxLevel;
            
            let isLocked = false;
            if (node.requires) {
               isLocked = !node.requires.every(req => (profile.talents?.[req] || 0) > 0);
            }

            return (
              <div 
                key={node.id} 
                className={`relative p-3 rounded-lg border ${
                  isLocked ? 'border-gray-900 bg-gray-900/50 opacity-50' : 
                  currentLevel > 0 ? 'border-amber-700/50 bg-[#1a1423]' : 'border-gray-700 bg-black/60'
                } flex gap-3 transition-colors`}
              >
                <div className="flex flex-col items-center justify-center gap-1">
                  <button 
                    onClick={() => handlePurchase(node.id)}
                    disabled={isLocked || isMaxed || availablePoints <= 0}
                    className={`w-10 h-10 rounded-md border flex items-center justify-center transition-all ${
                      isLocked ? 'border-gray-800 bg-gray-800' :
                      isMaxed ? 'border-amber-500 bg-amber-900/50 text-amber-400' :
                      'border-gray-500 bg-gray-800 hover:border-amber-400'
                    }`}
                  >
                    {isLocked ? <Lock className="w-4 h-4 text-gray-600" /> : <Plus className="w-5 h-5" />}
                  </button>
                  <span className="text-[10px] font-mono text-gray-400">
                    {currentLevel}/{node.maxLevel}
                  </span>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <span className={`text-sm font-bold ${currentLevel > 0 ? 'text-amber-100' : 'text-gray-300'}`}>{node.name}</span>
                  <span className="text-xs text-gray-400 leading-tight mt-1">{node.description(Math.max(1, currentLevel))}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-8">
      {/* Header */}
      <div className="bg-[#151a21] border border-gray-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="font-display font-black text-2xl text-white tracking-widest text-shadow-gold">
            COMMANDER TALENTS
          </h2>
          <p className="text-gray-400 text-sm max-w-xl">
            Spend skill points earned from leveling up to enhance your Hero's combat stances. You can switch your active stance at any time.
          </p>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="bg-black/50 border border-gray-700 rounded-lg p-4 text-center min-w-[120px]">
            <span className="block text-xs text-gray-400 font-mono mb-1">UNSPENT POINTS</span>
            <span className="block text-3xl font-display font-bold text-amber-400">{availablePoints}</span>
          </div>
          <button 
            onClick={handleReset}
            className="h-full px-4 py-3 bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 rounded-lg text-red-300 text-sm font-bold transition-all flex flex-col items-center justify-center gap-1"
          >
            <span>Reset Talents</span>
            <span className="text-[10px] font-mono opacity-70">Cost: 500 Gold</span>
          </button>
        </div>
      </div>

      {/* Talent Trees */}
      <div className="flex flex-col md:flex-row gap-6">
        {renderStanceColumn('void_strike', 'Void Strike', <Zap className="w-8 h-8 text-purple-400" />, 'text-purple-400')}
        {renderStanceColumn('blood_aura', 'Blood Aura', <Activity className="w-8 h-8 text-red-400" />, 'text-red-400')}
        {renderStanceColumn('warlord_cry', "Warlord's Cry", <Flame className="w-8 h-8 text-amber-500" />, 'text-amber-500')}
      </div>
    </div>
  );
};
