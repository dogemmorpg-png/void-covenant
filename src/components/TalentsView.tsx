import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { TALENT_TREES, TalentStance } from '../data/talents';
import { Zap, Activity, Flame, Lock, Plus, Star } from 'lucide-react';

const STANCES: { id: TalentStance; name: string; icon: React.ReactNode; color: string; desc: string }[] = [
  { id: 'void_strike', name: 'Void Strike', icon: <Zap className="w-6 h-6" />, color: 'text-purple-400', desc: '25% chance to deal 1 bonus damage.' },
  { id: 'blood_aura', name: 'Blood Aura', icon: <Activity className="w-6 h-6" />, color: 'text-red-400', desc: '25% chance to heal an ally for 1 HP.' },
  { id: 'warlord_cry', name: "Warlord's Cry", icon: <Flame className="w-6 h-6" />, color: 'text-amber-500', desc: '10% chance to buff an ally with +1 Atk.' },
];

const TREE_WIDTH = 800;
const TREE_HEIGHT = 850;

const getPos = (tier: number, col: number) => {
  const x = 400 + col * 260;
  const y = 80 + (tier - 1) * 160;
  return { x, y };
};

export const TalentsView: React.FC = () => {
  const { profile, updateProfile } = useGame();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TalentStance>(profile?.activeStance || 'void_strike');

  if (!profile) return null;

  const totalPoints = Math.max(0, profile.level - 1);
  const spentPoints = Object.values(profile.talents || {}).reduce((sum, val) => sum + val, 0);
  const availablePoints = totalPoints - spentPoints;

  const handlePurchase = (nodeId: string) => {
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

    if (node.requires && node.requires.length > 0) {
      const hasReq = node.requires.every(reqId => {
        const reqNode = TALENT_TREES.find(n => n.id === reqId);
        const reqLvl = profile.talents?.[reqId] || 0;
        return node.requireMax ? reqLvl >= (reqNode?.maxLevel || 1) : reqLvl > 0;
      });
      if (!hasReq) {
        toast(node.requireMax ? 'You must MAX OUT the required previous talents first.' : 'You must unlock the required previous talents first.', 'error');
        return;
      }
    }

    const newTalents = { ...profile.talents, [nodeId]: currentLevel + 1 };
    updateProfile({ talents: newTalents });
    toast('Talent upgraded!', 'success');
  };

  const handleEquipStance = () => {
    updateProfile({ activeStance: activeTab });
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

  const activeNodes = TALENT_TREES.filter(t => t.stance === activeTab);
  const isCurrentStanceEquipped = profile.activeStance === activeTab;
  const currentStanceConfig = STANCES.find(s => s.id === activeTab);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-[#151a21] border border-gray-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
        <div className="space-y-2 z-10">
          <h2 className="font-display font-black text-2xl text-white tracking-widest text-shadow-gold">
            COMMANDER TALENTS
          </h2>
          <p className="text-gray-400 text-sm max-w-xl">
            Shape your Hero's combat style by unlocking powerful synergistic nodes.
          </p>
        </div>
        
        <div className="flex gap-4 items-center z-10">
          <div className="bg-black/60 border border-gray-700/50 rounded-lg p-3 text-center min-w-[120px] shadow-inner">
            <span className="block text-[10px] text-gray-500 font-mono mb-1">UNSPENT POINTS</span>
            <span className="block text-3xl font-display font-bold text-amber-400 text-shadow-gold">{availablePoints}</span>
          </div>
          <button 
            onClick={handleReset}
            className="h-full px-4 py-3 bg-red-950/20 hover:bg-red-900/40 border border-red-900/30 rounded-lg text-red-400 text-sm font-bold transition-all flex flex-col items-center justify-center gap-1 group"
          >
            <span className="group-hover:text-red-300">Reset Talents</span>
            <span className="text-[10px] font-mono opacity-60 group-hover:opacity-100">Cost: 500 Gold</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-black/40 border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-800 bg-[#0a0a0f]">
          {STANCES.map(stance => (
            <button
              key={stance.id}
              onClick={() => setActiveTab(stance.id)}
              className={`flex-1 p-4 flex items-center justify-center gap-3 transition-all relative ${
                activeTab === stance.id ? 'bg-gray-800/30' : 'hover:bg-gray-900/50 opacity-60 hover:opacity-100'
              }`}
            >
              <div className={`${stance.color} ${activeTab === stance.id ? 'scale-110 drop-shadow-[0_0_8px_currentColor]' : ''} transition-transform`}>
                {stance.icon}
              </div>
              <span className={`font-display font-bold tracking-wide ${activeTab === stance.id ? 'text-white' : 'text-gray-400'}`}>
                {stance.name}
              </span>
              {activeTab === stance.id && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"></div>
              )}
            </button>
          ))}
        </div>

        {/* Tree Container */}
        <div className="p-6 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900/50 via-[#050505] to-black min-h-[600px]">
          
          {/* Equip Stance Action Bar */}
          <div className="flex flex-col items-center justify-center mb-6 space-y-3">
             <p className="text-gray-400 text-sm max-w-lg text-center bg-black/40 px-4 py-2 rounded-full border border-gray-800/50">
               Base Effect: <span className="text-gray-200">{currentStanceConfig?.desc}</span>
             </p>
             <button 
              onClick={handleEquipStance}
              disabled={isCurrentStanceEquipped}
              className={`px-8 py-3 rounded-full text-sm font-bold tracking-widest transition-all shadow-lg z-10 ${
                isCurrentStanceEquipped 
                  ? 'bg-amber-900/20 text-amber-500/50 border border-amber-900/30 cursor-not-allowed' 
                  : 'bg-amber-600 hover:bg-amber-500 text-white border border-amber-400 shadow-[0_0_20px_rgba(217,119,6,0.4)] hover:shadow-[0_0_30px_rgba(217,119,6,0.6)] hover:scale-105'
              }`}
            >
              {isCurrentStanceEquipped ? 'STANCE ACTIVE' : 'EQUIP THIS STANCE'}
            </button>
          </div>

          <div className="overflow-x-auto overflow-y-hidden w-full pb-8 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
            <div 
              className="relative mx-auto" 
              style={{ width: TREE_WIDTH, height: TREE_HEIGHT }}
            >
              {/* SVG Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                {activeNodes.map(node => {
                  if (!node.requires) return null;
                  const targetPos = getPos(node.tier, node.col);
                  
                  return node.requires.map(reqId => {
                    const reqNode = activeNodes.find(n => n.id === reqId);
                    if (!reqNode) return null;
                    const sourcePos = getPos(reqNode.tier, reqNode.col);

                    const currentLevel = profile.talents?.[node.id] || 0;
                    const reqLevel = profile.talents?.[reqNode.id] || 0;
                    
                    const isFullyUnlocked = currentLevel > 0;
                    const isAvailable = node.requireMax ? reqLevel >= reqNode.maxLevel : reqLevel > 0; 

                    let strokeColor = '#1f2937'; // gray-800
                    let strokeWidth = 2;
                    let opacity = 0.5;

                    if (isFullyUnlocked) {
                      strokeColor = '#d97706'; // amber-600
                      strokeWidth = 4;
                      opacity = 1;
                    } else if (isAvailable) {
                      strokeColor = '#4b5563'; // gray-600
                      strokeWidth = 3;
                      opacity = 0.8;
                    }

                    return (
                      <line 
                        key={`${sourcePos.x}-${sourcePos.y}-${targetPos.x}-${targetPos.y}`}
                        x1={sourcePos.x} 
                        y1={sourcePos.y + 55} // start from bottom center of source node 
                        x2={targetPos.x} 
                        y2={targetPos.y - 55} // end at top center of target node
                        stroke={strokeColor} 
                        strokeWidth={strokeWidth}
                        opacity={opacity}
                        filter={isFullyUnlocked ? 'url(#glow)' : ''}
                        className="transition-all duration-500"
                      />
                    );
                  });
                })}
              </svg>

              {/* Nodes */}
              {activeNodes.map(node => {
                const pos = getPos(node.tier, node.col);
                const currentLevel = profile.talents?.[node.id] || 0;
                const isMaxed = currentLevel >= node.maxLevel;
                
                let isLocked = false;
                if (node.requires) {
                   isLocked = !node.requires.every(req => {
                     const reqNode = activeNodes.find(n => n.id === req);
                     const reqLevel = profile.talents?.[req] || 0;
                     return node.requireMax ? reqLevel >= (reqNode?.maxLevel || 1) : reqLevel > 0;
                   });
                }

                // Node size
                const width = 240;
                const height = 110;

                const isMajor = node.tier === 3 || node.tier === 5;
                const nodeColor = isMajor ? 'amber' : 'gray';

                let bgClass = 'bg-[#111] border-gray-800';
                let textClass = 'text-gray-500';

                if (currentLevel > 0) {
                  bgClass = isMaxed 
                    ? `bg-${nodeColor}-950/40 border-${nodeColor}-500/80 shadow-[0_0_15px_rgba(245,158,11,0.3)]` 
                    : `bg-[#1a1a24] border-${nodeColor}-700/60`;
                  textClass = 'text-amber-100';
                } else if (!isLocked) {
                  bgClass = 'bg-[#15151e] border-gray-600 hover:border-amber-600/50';
                  textClass = 'text-gray-300';
                }

                return (
                  <div 
                    key={node.id}
                    className={`absolute z-10 p-4 rounded-xl border-2 flex flex-col justify-between transition-all duration-300 ${bgClass} ${isLocked ? 'opacity-40 grayscale' : 'hover:scale-105 hover:z-20'}`}
                    style={{ 
                      left: pos.x - width / 2, 
                      top: pos.y - height / 2,
                      width,
                      height
                    }}
                  >
                    <div className="flex justify-between items-start gap-2">
                       <div className="flex-1">
                          <h4 className={`text-sm font-bold leading-tight ${textClass}`}>{node.name}</h4>
                          <p className="text-[11px] text-gray-400 mt-1.5 leading-tight line-clamp-3">
                            {node.description(Math.max(1, currentLevel))}
                          </p>
                       </div>
                       <button 
                          onClick={() => handlePurchase(node.id)}
                          disabled={isLocked || isMaxed || availablePoints <= 0}
                          className={`shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center transition-colors ${
                            isLocked ? 'border-gray-800 bg-gray-900 cursor-not-allowed' :
                            isMaxed ? 'border-amber-500 bg-amber-600 text-black cursor-default shadow-[0_0_10px_rgba(245,158,11,0.5)]' :
                            'border-gray-500 bg-gray-800 hover:bg-amber-600 hover:text-black hover:border-amber-400 text-gray-300'
                          }`}
                        >
                          {isLocked ? <Lock className="w-3 h-3" /> : (isMaxed ? <Star className="w-3 h-3 fill-current" /> : <Plus className="w-4 h-4" />)}
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-3">
                       <div className="flex-1 h-1.5 bg-gray-900 rounded-full overflow-hidden border border-gray-800 shadow-inner">
                          <div 
                            className={`h-full ${isMaxed ? 'bg-amber-400' : 'bg-amber-600/70'} transition-all`} 
                            style={{ width: `${(currentLevel / node.maxLevel) * 100}%` }}
                          />
                       </div>
                       <span className={`text-[10px] font-mono font-bold ${isMaxed ? 'text-amber-400' : 'text-gray-500'}`}>
                         {currentLevel}/{node.maxLevel}
                       </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
