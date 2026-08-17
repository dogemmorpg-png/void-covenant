import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { TALENT_TREES, TalentStance } from '../data/talents';
import * as LucideIcons from 'lucide-react';
import { Zap, Activity, Flame } from 'lucide-react';

const STANCES: { id: TalentStance; name: string; icon: React.ReactNode; color: string; desc: string; bg: string }[] = [
  { id: 'void_strike', name: 'Void Strike', icon: <Zap className="w-6 h-6" />, color: 'text-purple-400', desc: '25% chance to deal 1 bonus damage.', bg: 'from-purple-900/20' },
  { id: 'blood_aura', name: 'Blood Aura', icon: <Activity className="w-6 h-6" />, color: 'text-red-400', desc: '25% chance to heal an ally for 1 HP.', bg: 'from-red-900/20' },
  { id: 'warlord_cry', name: "Warlord's Cry", icon: <Flame className="w-6 h-6" />, color: 'text-amber-500', desc: '25% chance to buff a random ally with +1 Atk.', bg: 'from-amber-900/20' },
];

const TREE_WIDTH = 900;
const TREE_HEIGHT = 850;

const getPos = (tier: number, col: number) => {
  const x = 450 + col * 280; // center is 450
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
    <div className="max-w-6xl mx-auto p-4 space-y-6 animate-fade-in relative">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes energyFlow {
          from { stroke-dashoffset: 24; }
          to { stroke-dashoffset: 0; }
        }
        .animate-energy {
          animation: energyFlow 1s linear infinite;
        }
        .hexagon-clip {
          clip-path: polygon(15px 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0 calc(100% - 15px), 0 15px);
        }
      `}} />

      {/* Premium Header */}
      <div className="bg-black/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] group-hover:bg-amber-500/20 transition-all duration-1000"></div>
        <div className="space-y-3 z-10">
          <h2 className="font-display font-black text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 tracking-widest uppercase drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
            Commander Talents
          </h2>
          <p className="text-gray-400 text-sm md:text-base max-w-xl leading-relaxed">
            Channel the power of the Void, Blood, and War. Unlock synergistic nodes to permanently alter your Hero's combat style.
          </p>
        </div>
        
        <div className="flex gap-4 items-center z-10 w-full md:w-auto">
          <div className="bg-black/80 border border-gray-700/50 rounded-2xl p-4 text-center min-w-[140px] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] relative overflow-hidden flex-1 md:flex-none">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
            <span className="block text-[11px] text-gray-500 font-bold tracking-widest uppercase mb-1">Unspent Points</span>
            <span className="block text-4xl font-display font-black text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
              {availablePoints}
            </span>
          </div>
          <button 
            onClick={handleReset}
            className="h-full px-5 py-4 bg-red-950/30 hover:bg-red-900/50 border border-red-900/40 rounded-2xl text-red-400 text-sm font-bold transition-all flex flex-col items-center justify-center gap-1.5 group/btn backdrop-blur-md"
          >
            <LucideIcons.RefreshCw className="w-5 h-5 group-hover/btn:-rotate-180 transition-transform duration-500" />
            <span className="text-[10px] font-mono opacity-60 group-hover/btn:opacity-100">500 Gold</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#08080a] border border-gray-800/80 rounded-3xl overflow-hidden flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Dynamic Background Watermark */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-[0.03] text-white">
          <div className="scale-[15] blur-md transform rotate-12">
            {currentStanceConfig?.icon}
          </div>
        </div>

        {/* Premium Tabs */}
        <div className="flex border-b border-gray-800/80 bg-black/40 backdrop-blur-md relative z-10 p-2 gap-2">
          {STANCES.map(stance => {
            const isActive = activeTab === stance.id;
            return (
              <button
                key={stance.id}
                onClick={() => setActiveTab(stance.id)}
                className={`flex-1 py-4 px-2 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 relative overflow-hidden ${
                  isActive 
                    ? `bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]` 
                    : 'hover:bg-white/[0.02] opacity-60 hover:opacity-100'
                }`}
              >
                {isActive && (
                  <div className={`absolute inset-0 bg-gradient-to-b ${stance.bg} to-transparent opacity-50`}></div>
                )}
                
                <div className={`${stance.color} ${isActive ? 'scale-110 drop-shadow-[0_0_15px_currentColor]' : ''} transition-transform duration-500 relative z-10`}>
                  {stance.icon}
                </div>
                <span className={`font-display font-bold tracking-widest text-sm md:text-base transition-colors duration-500 relative z-10 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                  {stance.name}
                </span>
                
                {isActive && (
                  <div className={`absolute bottom-0 left-[20%] w-[60%] h-1 bg-current ${stance.color} rounded-t-full shadow-[0_-2px_15px_currentColor]`}></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Tree Container */}
        <div className="relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900/40 via-black to-black min-h-[700px] z-10 flex flex-col items-center">
          
          {/* Equip Stance Action Bar (in document flow) */}
          <div className="flex flex-col items-center justify-center mt-6 mb-2 space-y-3 relative z-20">
             <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-gray-800/80 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center gap-4">
                <div className={`${currentStanceConfig?.color}`}>
                  {currentStanceConfig?.icon}
                </div>
                <p className="text-gray-400 text-sm max-w-lg text-center">
                  Base Effect: <span className="text-gray-200 font-bold">{currentStanceConfig?.desc}</span>
                </p>
             </div>
             <button 
              onClick={handleEquipStance}
              disabled={isCurrentStanceEquipped}
              className={`px-10 py-3.5 rounded-full text-sm font-black tracking-widest uppercase transition-all shadow-lg ${
                isCurrentStanceEquipped 
                  ? 'bg-gray-900 text-gray-600 border border-gray-800 cursor-not-allowed' 
                  : 'bg-white text-black hover:bg-amber-400 hover:scale-105 border border-white hover:border-amber-300 hover:shadow-[0_0_30px_rgba(251,191,36,0.6)] active:scale-95'
              }`}
            >
              {isCurrentStanceEquipped ? 'STANCE ACTIVE' : 'EQUIP STANCE'}
            </button>
          </div>

          <div className="overflow-x-auto overflow-y-hidden w-full pt-10 pb-20 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
            <div 
              className="relative mx-auto" 
              style={{ width: TREE_WIDTH, height: TREE_HEIGHT }}
            >
              {/* SVG Animated Beziers */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  {/* Gradients for paths depending on stance */}
                  <linearGradient id="path-grad-void" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#d946ef" />
                  </linearGradient>
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

                    let strokeColor = '#1f2937'; 
                    let strokeWidth = 2;
                    let isAnimated = false;
                    let pathClass = "transition-all duration-1000";

                    // Theming colors based on active tab
                    const themeColor = activeTab === 'void_strike' ? '#a855f7' : (activeTab === 'blood_aura' ? '#ef4444' : '#f59e0b');

                    if (isFullyUnlocked) {
                      strokeColor = themeColor;
                      strokeWidth = 4;
                      pathClass += " opacity-100";
                    } else if (isAvailable) {
                      strokeColor = themeColor;
                      strokeWidth = 2;
                      isAnimated = true; // Show flowing energy to available nodes
                      pathClass += " opacity-40 animate-energy";
                    } else {
                      pathClass += " opacity-20";
                    }

                    // Bezier Curve Path
                    const pathD = `M ${sourcePos.x} ${sourcePos.y + 60} 
                                   C ${sourcePos.x} ${sourcePos.y + 110}, 
                                     ${targetPos.x} ${targetPos.y - 110}, 
                                     ${targetPos.x} ${targetPos.y - 60}`;

                    return (
                      <g key={`${sourcePos.x}-${targetPos.x}-${targetPos.y}`}>
                        {/* Glow Layer (only for fully unlocked) */}
                        {isFullyUnlocked && (
                          <path 
                            d={pathD}
                            fill="none"
                            stroke={strokeColor} 
                            strokeWidth={strokeWidth + 4}
                            filter="url(#glow)"
                            opacity={0.4}
                          />
                        )}
                        {/* Core Path */}
                        <path 
                          d={pathD}
                          fill="none"
                          stroke={strokeColor} 
                          strokeWidth={strokeWidth}
                          strokeDasharray={isAnimated ? "8 16" : "none"}
                          strokeLinecap="round"
                          className={pathClass}
                        />
                      </g>
                    );
                  });
                })}
              </svg>

              {/* Premium Nodes */}
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

                const width = 260;
                const height = 120;
                const isMajor = node.tier === 3 || node.tier === 5;
                
                // Icon Component resolution
                const IconComp = (LucideIcons as any)[node.icon] || LucideIcons.HelpCircle;

                // Theme styling
                let themeBorder = 'border-gray-800';
                let themeBg = 'bg-[#0f0f15]';
                let themeText = 'text-gray-500';
                let themeIconBg = 'bg-gray-900';
                let themeIconColor = 'text-gray-600';
                let glowShadow = 'none';
                
                const themeColorClass = activeTab === 'void_strike' ? 'purple' : (activeTab === 'blood_aura' ? 'red' : 'amber');
                const themeHex = activeTab === 'void_strike' ? 'rgba(168, 85, 247, 0.4)' : (activeTab === 'blood_aura' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)');

                if (currentLevel > 0) {
                  themeBg = isMaxed ? `bg-${themeColorClass}-950/20` : 'bg-[#151520]';
                  themeBorder = isMaxed ? `border-${themeColorClass}-500/80` : `border-${themeColorClass}-700/50`;
                  themeText = 'text-gray-100';
                  themeIconBg = `bg-${themeColorClass}-900/40`;
                  themeIconColor = `text-${themeColorClass}-400`;
                  if (isMaxed) {
                    glowShadow = `0 0 25px ${themeHex}, inset 0 0 15px ${themeHex}`;
                  }
                } else if (!isLocked) {
                  themeBg = 'bg-[#151520] hover:bg-[#1a1a25]';
                  themeBorder = 'border-gray-600 hover:border-gray-400';
                  themeText = 'text-gray-300';
                  themeIconBg = 'bg-gray-800';
                  themeIconColor = 'text-gray-400';
                }

                // Calculate progress for circular ring
                const progressPct = (currentLevel / node.maxLevel) * 100;
                const radius = 22;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (progressPct / 100) * circumference;

                return (
                  <button 
                    key={node.id}
                    onClick={() => handlePurchase(node.id)}
                    disabled={isLocked || isMaxed || availablePoints <= 0}
                    className={`absolute z-10 flex items-center p-3 rounded-2xl border-2 transition-all duration-500 group text-left ${themeBg} ${themeBorder} ${
                      isLocked ? 'opacity-40 grayscale cursor-not-allowed' : 
                      isMaxed ? 'cursor-default' : 
                      'hover:scale-105 hover:-translate-y-1 hover:z-20 cursor-pointer hover:shadow-xl'
                    }`}
                    style={{ 
                      left: pos.x - width / 2, 
                      top: pos.y - height / 2,
                      width,
                      height,
                      boxShadow: glowShadow
                    }}
                  >
                    {/* Glowing effect inside node on hover if available */}
                    {!isLocked && !isMaxed && (
                      <div className={`absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none`}></div>
                    )}

                    {/* Circular Icon / Progress */}
                    <div className="relative shrink-0 w-16 h-16 flex items-center justify-center mr-4">
                      {/* Ring Background */}
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle 
                          cx="32" cy="32" r={radius} 
                          fill="transparent" 
                          stroke="#1f2937" 
                          strokeWidth="3" 
                        />
                        {/* Animated Progress Ring */}
                        <circle 
                          cx="32" cy="32" r={radius} 
                          fill="transparent" 
                          stroke="currentColor" 
                          strokeWidth="4" 
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          className={`transition-all duration-1000 ${themeIconColor}`}
                        />
                      </svg>
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${themeIconBg} ${themeIconColor} z-10 shadow-inner group-hover:scale-110 transition-transform`}>
                         <IconComp className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Node Text Content */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm font-black tracking-wide truncate ${isMajor ? 'text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]' : themeText}`}>
                          {node.name}
                        </h4>
                        <span className={`shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ml-2 ${
                          isMaxed ? 'bg-amber-500/20 text-amber-300' : 'bg-gray-800 text-gray-400'
                        }`}>
                          {currentLevel}/{node.maxLevel}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-gray-400 leading-snug line-clamp-3 font-medium">
                        {node.description(Math.max(1, currentLevel))}
                      </p>
                    </div>

                    {/* Cost Badge (only shown on hover if available) */}
                    {!isLocked && !isMaxed && (
                       <div className="absolute -top-3 -right-3 bg-black border border-gray-700 rounded-full w-7 h-7 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100">
                         <span className="text-[10px] font-bold text-gray-300 flex items-center gap-0.5">
                           <LucideIcons.Star className="w-3 h-3 text-amber-500 fill-current" />
                           {node.cost}
                         </span>
                       </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
