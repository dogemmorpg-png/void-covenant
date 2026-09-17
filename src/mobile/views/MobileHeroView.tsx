import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useToast } from '../../components/Toast';
import { Equipment, EquipmentSlot, CardTier } from '../../types';
import { getEquipmentIcon, calculateEquipmentSetBonuses, DEMIURGE_SET } from '../../data/equipment';
import { TALENT_TREES, TalentStance, TalentNode } from '../../data/talents';
import * as LucideIcons from 'lucide-react';
import { 
  Heart, Sparkles, Coins, Hourglass, Wind, Zap, 
  Check, RefreshCw, X, ShoppingBag, ArrowRight, RotateCcw,
  Lock, ChevronDown, Award
} from 'lucide-react';
import { VoidStrikeIcon, BloodAuraIcon, WarlordCryIcon } from '../../components/SkillAndStanceIcons';

interface SlotConfig {
  slot: EquipmentSlot;
  label: string;
  iconPath: string;
}

const SLOTS_CONFIG: SlotConfig[] = [
  { slot: 'helmet', label: 'HELMET', iconPath: '/icons/equipment/slot_helmet.png' },
  { slot: 'weapon', label: 'WEAPON', iconPath: '/icons/equipment/slot_weapon.png' },
  { slot: 'ring', label: 'RING', iconPath: '/icons/equipment/slot_ring.png' },
  { slot: 'amulet', label: 'AMULET', iconPath: '/icons/equipment/slot_amulet.png' },
  { slot: 'armor', label: 'ARMOR', iconPath: '/icons/equipment/slot_armor.png' },
  { slot: 'boots', label: 'BOOTS', iconPath: '/icons/equipment/slot_boots.png' },
];

const TIER_STYLES: Record<CardTier, { border: string; bg: string; text: string; glow: string; itemGlow: string }> = {
  bronze: {
    border: 'border-amber-700/60 hover:border-amber-600',
    bg: 'from-[#221609]/90 via-[#150d05]/90 to-black',
    text: 'text-amber-500',
    glow: 'shadow-[0_0_12px_rgba(180,83,9,0.25)]',
    itemGlow: 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.85)]'
  },
  silver: {
    border: 'border-slate-300/60 hover:border-slate-200',
    bg: 'from-[#1a232c]/90 via-[#0e141a]/90 to-black',
    text: 'text-slate-300',
    glow: 'shadow-[0_0_12px_rgba(203,213,225,0.25)]',
    itemGlow: 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.85)]'
  },
  gold: {
    border: 'border-amber-400/80 hover:border-amber-300',
    bg: 'from-[#2e2008]/90 via-[#191103]/90 to-black',
    text: 'text-amber-300',
    glow: 'shadow-[0_0_18px_rgba(251,191,36,0.35)]',
    itemGlow: 'drop-shadow-[0_0_10px_rgba(251,191,36,0.35)]'
  },
  legendary: {
    border: 'border-purple-500/90 hover:border-purple-400',
    bg: 'from-[#280c35]/90 via-[#15041d]/90 to-black',
    text: 'text-purple-300',
    glow: 'shadow-[0_0_22px_rgba(168,85,247,0.45)]',
    itemGlow: 'drop-shadow-[0_0_12px_rgba(168,85,247,0.45)]'
  },
  divine: {
    border: 'border-rose-500/90 hover:border-rose-400',
    bg: 'from-[#350811]/90 via-[#1c0409]/90 to-black',
    text: 'text-rose-400 font-bold',
    glow: 'shadow-[0_0_24px_rgba(244,63,94,0.6)] ring-1 ring-rose-400/50',
    itemGlow: 'drop-shadow-[0_0_14px_rgba(244,63,94,0.7)]'
  }
};

const TIER_PRIORITY: Record<CardTier, number> = {
  divine: 5,
  legendary: 4,
  gold: 3,
  silver: 2,
  bronze: 1,
};

const STANCE_CONFIG: Record<TalentStance, { 
  name: string; 
  icon: (size?: string) => React.ReactNode; 
  color: string; 
  borderActive: string;
  bgActive: string;
  desc: string;
  badgeBg: string;
}> = {
  void_strike: { 
    name: 'Void Strike', 
    icon: (s = "w-4 h-4") => <VoidStrikeIcon sizeClass={s} />, 
    color: 'text-cyan-400', 
    borderActive: 'border-cyan-400',
    bgActive: 'from-cyan-950/60 via-[#0a1822] to-black',
    desc: '15% chance to deal 1 bonus damage.',
    badgeBg: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
  },
  blood_aura: { 
    name: 'Blood Aura', 
    icon: (s = "w-4 h-4") => <BloodAuraIcon sizeClass={s} />, 
    color: 'text-rose-400', 
    borderActive: 'border-rose-400',
    bgActive: 'from-red-950/60 via-[#1e070d] to-black',
    desc: '15% chance to heal an ally for 1 HP.',
    badgeBg: 'bg-rose-950/60 text-rose-300 border-rose-500/40'
  },
  warlord_cry: { 
    name: "Warlord's Cry", 
    icon: (s = "w-4 h-4") => <WarlordCryIcon sizeClass={s} />, 
    color: 'text-amber-400', 
    borderActive: 'border-amber-400',
    bgActive: 'from-amber-950/60 via-[#1f1406] to-black',
    desc: '15% chance to buff a random ally with +1 Atk.',
    badgeBg: 'bg-amber-950/60 text-amber-300 border-amber-500/40'
  },
};

interface MobileHeroViewProps {
  onNavigateToShop?: (tab?: 'cards' | 'equipment' | 'divine') => void;
}

export const MobileHeroView: React.FC<MobileHeroViewProps> = ({ onNavigateToShop }) => {
  const { profile, equipItem, unequipItem, updateProfile, resetTalents, setIsShardsShopOpen } = useGame();
  const toast = useToast();
  
  const [selectedSlot, setSelectedSlot] = useState<EquipmentSlot | null>(null);
  const [subTab, setSubTab] = useState<'equipment' | 'talents'>('equipment');

  // Talent Tree stance sub-tab
  const [activeTalentStance, setActiveTalentStance] = useState<TalentStance>(profile?.activeStance || 'void_strike');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Equipped items resolution
  const eqWeapon = profile.equipment?.find(e => e.id === profile.equipped?.['weapon']) || null;
  const eqArmor = profile.equipment?.find(e => e.id === profile.equipped?.['armor']) || null;
  const eqHelmet = profile.equipment?.find(e => e.id === profile.equipped?.['helmet']) || null;
  const eqAmulet = profile.equipment?.find(e => e.id === profile.equipped?.['amulet']) || null;
  const eqRing = profile.equipment?.find(e => e.id === profile.equipped?.['ring']) || null;
  const eqBoots = profile.equipment?.find(e => e.id === profile.equipped?.['boots']) || null;

  const equippedList = [eqHelmet, eqArmor, eqWeapon, eqAmulet, eqRing, eqBoots].filter(Boolean) as Equipment[];

  // Set Bonus Calculations
  const setBonusResults = calculateEquipmentSetBonuses(equippedList);
  const demiurgeBonus = setBonusResults.find(s => s.setId === 'demiurge');

  const setBonusHealth = demiurgeBonus?.totalBonuses.maxHealth || 0;
  const setBonusDodge = demiurgeBonus?.totalBonuses.dodge || 0;
  const setBonusDelay = demiurgeBonus?.totalBonuses.delayReduction || 0;

  // Bonus Calculations
  const bonusHealth = equippedList.filter(e => e.bonusType === 'maxHealth').reduce((sum, e) => sum + e.bonusValue, 0)
    + equippedList.filter(e => e.secondaryBonusType === 'maxHealth').reduce((sum, e) => sum + (e.secondaryBonusValue || 0), 0)
    + setBonusHealth;

  const bonusDodge = equippedList.filter(e => e.bonusType === 'dodge').reduce((sum, e) => sum + e.bonusValue, 0)
    + equippedList.filter(e => e.secondaryBonusType === 'dodge').reduce((sum, e) => sum + (e.secondaryBonusValue || 0), 0)
    + setBonusDodge;

  const bonusGold = equippedList.filter(e => e.bonusType === 'goldBonus').reduce((sum, e) => sum + e.bonusValue, 0);
  const bonusDelay = equippedList.filter(e => e.bonusType === 'delayReduction').reduce((sum, e) => sum + e.bonusValue, 0)
    + setBonusDelay;

  const baseHealth = profile.heroMaxHealth || 30;
  const totalHealth = baseHealth + bonusHealth;

  // Stance Info
  const activeStance = STANCE_CONFIG[profile.activeStance || 'void_strike'] || STANCE_CONFIG.void_strike;

  // EXP & Level Calculations
  const getRequiredExpForLevel = (level: number) => {
    const lvl = Math.max(1, level || 1);
    return Math.floor(200 * lvl + 15 * Math.pow(lvl, 1.5));
  };
  const reqExp = getRequiredExpForLevel(profile.level);
  const expPercent = Math.min(100, Math.floor(((profile.exp || 0) / reqExp) * 100));

  const formatBonusLabel = (type: string, val: number) => {
    switch (type) {
      case 'maxHealth': return `+${val} Max HP`;
      case 'dodge': return `+${val}% Dodge`;
      case 'goldBonus': return `+${val}% Gold`;
      case 'delayReduction': return `-${val} Delay`;
      default: return `+${val} ${type}`;
    }
  };

  const demiurgePieces = equippedList.filter(e => e.setId === 'demiurge').length;

  // Talent Calculations
  const totalTalentPoints = Math.max(0, (profile.level || 1) - 1);
  const spentTalentPoints = Object.entries(profile.talents || {}).reduce((sum, [nodeId, lvl]) => {
    const node = TALENT_TREES.find(t => t.id === nodeId);
    return sum + (lvl * (node?.cost || 1));
  }, 0);
  const availableTalentPoints = totalTalentPoints - spentTalentPoints;

  const handlePurchaseTalent = (node: TalentNode) => {
    if (availableTalentPoints < node.cost) {
      toast(`Need ${node.cost} skill point${node.cost > 1 ? 's' : ''}!`, 'warning');
      return;
    }

    const currentLevel = profile.talents?.[node.id] || 0;
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
        toast(node.requireMax ? 'Must MAX OUT required previous talents first.' : 'Must unlock required previous talents first.', 'error');
        return;
      }
    }

    const newTalents = { ...profile.talents, [node.id]: currentLevel + 1 };
    updateProfile({ talents: newTalents });
    toast(`Upgraded ${node.name} (Lvl ${currentLevel + 1})!`, 'success');
  };

  const handleEquipStance = (stanceId: TalentStance) => {
    updateProfile({ activeStance: stanceId });
    toast(`Equipped ${STANCE_CONFIG[stanceId].name}!`, 'success');
  };

  const handleConfirmReset = async () => {
    if (isResetting) return;
    if (spentTalentPoints === 0) {
      toast('No points spent to reset.', 'info');
      setIsResetConfirmOpen(false);
      return;
    }
    if ((profile.darkShards || 0) < 15) {
      toast('Need 15 Dark Shards to reset talents.', 'warning');
      setIsResetConfirmOpen(false);
      if (setIsShardsShopOpen) setIsShardsShopOpen(true);
      return;
    }

    setIsResetting(true);
    try {
      const res = await resetTalents();
      if (res.success) {
        toast('Talents reset! All points refunded.', 'success');
      } else {
        toast(res.message || 'Failed to reset talents.', 'error');
      }
    } catch (err: any) {
      toast(err.message || 'Error resetting talents.', 'error');
    } finally {
      setIsResetting(false);
      setIsResetConfirmOpen(false);
    }
  };

  // Paperdoll individual slot box
  const renderSlotBox = (slot: EquipmentSlot, label: string, defaultIconPath: string) => {
    const item = profile.equipment?.find(e => e.id === profile.equipped?.[slot]) || null;
    const isSelected = selectedSlot === slot;
    const tierStyle = item ? TIER_STYLES[item.tier] : null;
    const itemIcon = item ? getEquipmentIcon(item, slot) : defaultIconPath;

    return (
      <div
        onClick={() => setSelectedSlot(selectedSlot === slot ? null : slot)}
        className={`w-[78px] h-[78px] min-[390px]:w-[84px] min-[390px]:h-[84px] rounded-2xl p-1.5 flex flex-col items-center justify-between cursor-pointer transition-all duration-200 relative group overflow-hidden ${
          isSelected
            ? 'border-2 border-purple-400 ring-2 ring-purple-500/50 scale-105 shadow-[0_0_20px_rgba(168,85,247,0.5)] z-20 bg-purple-950/40'
            : item
            ? `border-2 ${tierStyle?.border} bg-gradient-to-b ${tierStyle?.bg} ${tierStyle?.glow} active:scale-95`
            : 'border border-white/15 bg-gradient-to-b from-[#140e18]/80 to-black/90 active:scale-95 shadow-inner'
        }`}
      >
        {item ? (
          <>
            <div className="w-full flex items-center justify-between text-[7.5px] min-[390px]:text-[8px] font-mono font-black uppercase tracking-wider z-10 leading-none">
              <span className={tierStyle?.text}>{item.tier}</span>
              <span className="text-gray-400">{label}</span>
            </div>

            <div className="w-8 h-8 min-[390px]:w-9 min-[390px]:h-9 my-auto flex items-center justify-center relative z-10">
              <img 
                src={itemIcon} 
                alt={item.name} 
                className={`w-full h-full object-contain ${tierStyle?.itemGlow || ''}`} 
              />
            </div>

            <div className="w-full text-center z-10 leading-none">
              <div className="text-[7.5px] min-[390px]:text-[8.5px] text-emerald-400 font-mono font-bold truncate">
                {formatBonusLabel(item.bonusType, item.bonusValue)}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-full text-center text-[8px] font-mono text-gray-500 uppercase tracking-widest leading-none">
              {label}
            </div>

            <div className="w-7 h-7 my-auto flex items-center justify-center opacity-30 group-hover:opacity-60 transition-opacity">
              <img 
                src={defaultIconPath} 
                alt={label} 
                className="w-full h-full object-contain filter grayscale" 
              />
            </div>

            <div className="text-[7.5px] min-[390px]:text-[8px] font-mono text-purple-400 font-bold uppercase tracking-wider leading-none animate-pulse">
              + EQUIP
            </div>
          </>
        )}
      </div>
    );
  };

  // Modal for picking a relic for the chosen slot
  const renderInventoryModal = () => {
    if (!selectedSlot) return null;
    const rawItems = profile.equipment?.filter(e => e.slot === selectedSlot) || [];
    const equippedItemId = profile.equipped?.[selectedSlot];
    const inventoryItems = [...rawItems].sort((a, b) => {
      const aEquipped = a.id === equippedItemId;
      const bEquipped = b.id === equippedItemId;
      if (aEquipped && !bEquipped) return -1;
      if (!aEquipped && bEquipped) return 1;

      const tierDiff = (TIER_PRIORITY[b.tier] || 0) - (TIER_PRIORITY[a.tier] || 0);
      if (tierDiff !== 0) return tierDiff;

      const bonusDiff = (b.bonusValue || 0) - (a.bonusValue || 0);
      if (bonusDiff !== 0) return bonusDiff;

      return a.name.localeCompare(b.name);
    });
    const slotCfg = SLOTS_CONFIG.find(s => s.slot === selectedSlot);

    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedSlot(null);
        }}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-b from-[#1c1422] via-[#130d17] to-[#0a070c] border-2 border-purple-500/40 rounded-3xl p-4 sm:p-5 shadow-[0_0_50px_rgba(168,85,247,0.35)] w-full max-w-lg max-h-[85vh] flex flex-col space-y-3 overflow-hidden cursor-default animate-in zoom-in-95 duration-150"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-gray-800 pb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-black/70 border border-purple-500/50 flex items-center justify-center shadow-inner">
                <img src={slotCfg?.iconPath} alt={selectedSlot} className="w-6 h-6 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
              </div>
              <div>
                <h4 className="font-display font-black text-white text-base tracking-widest uppercase">
                  CHOOSE {selectedSlot.toUpperCase()}
                </h4>
                <span className="text-[10px] font-mono text-purple-300">
                  {inventoryItems.length} owned relic{inventoryItems.length === 1 ? '' : 's'} for this slot
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setSelectedSlot(null)}
              className="w-8 h-8 rounded-xl bg-black/50 hover:bg-red-950/60 border border-white/10 hover:border-red-500/40 text-gray-400 hover:text-red-300 flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Content / Relics List */}
          <div className="overflow-y-auto pr-0.5 flex-1 space-y-2.5 custom-scrollbar py-1">
            {inventoryItems.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-purple-950/40 border border-purple-500/30 flex items-center justify-center mx-auto">
                  <img src={slotCfg?.iconPath} alt={selectedSlot} className="w-8 h-8 object-contain opacity-40 grayscale" />
                </div>
                <p className="text-xs text-gray-300 font-sans font-medium">No relics found for the {selectedSlot} slot.</p>
                <p className="text-[10px] text-gray-500 font-sans max-w-xs mx-auto">
                  Open Equipment Packs in the <strong>SHOP</strong> to discover weapons, armor, and accessories!
                </p>
                <button
                  onClick={() => {
                    setSelectedSlot(null);
                    onNavigateToShop?.('equipment');
                  }}
                  className="mt-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:brightness-110 text-white font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-lg cursor-pointer"
                >
                  Go to Shop
                </button>
              </div>
            ) : (
              inventoryItems.map(item => {
                const isEquipped = equippedItemId === item.id;
                const tierStyle = TIER_STYLES[item.tier];
                const itemIcon = getEquipmentIcon(item, selectedSlot);

                return (
                  <div 
                    key={item.id} 
                    className={`bg-gradient-to-b ${tierStyle.bg} border-2 ${tierStyle.border} ${tierStyle.glow} p-3 rounded-2xl flex flex-col justify-between space-y-2.5 transition-all duration-200`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[9.5px] font-display font-black uppercase tracking-widest ${tierStyle.text}`}>
                        {item.tier}
                      </span>
                      {isEquipped && (
                        <span className="bg-emerald-950/90 border border-emerald-500/50 text-emerald-400 text-[8.5px] font-mono font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                          <Check className="w-2.5 h-2.5" /> EQUIPPED
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center p-1.5 relative overflow-hidden shrink-0 shadow-inner">
                        <img 
                          src={itemIcon} 
                          alt={item.name} 
                          className={`w-full h-full object-contain ${tierStyle.itemGlow}`} 
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <h5 className="font-display font-black text-xs text-white leading-snug tracking-wide truncate">
                          {item.name}
                        </h5>

                        <div className="flex flex-wrap items-center gap-1">
                          <span className="inline-flex items-center bg-black/60 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[9.5px] text-emerald-400 font-mono font-bold">
                            {formatBonusLabel(item.bonusType, item.bonusValue)}
                          </span>
                          {item.secondaryBonusType && (
                            <span className="inline-flex items-center bg-black/60 border border-rose-500/30 px-2 py-0.5 rounded-full text-[9.5px] text-rose-400 font-mono font-bold">
                              {formatBonusLabel(item.secondaryBonusType, item.secondaryBonusValue || 0)}
                            </span>
                          )}
                        </div>

                        {item.setId && (
                          <div className="pt-0.5">
                            <span className="text-[8px] font-mono text-rose-300 font-bold bg-rose-950/70 border border-rose-500/40 px-2 py-0.2 rounded-full">
                              SET OF THE DEMIURGE
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      {isEquipped ? (
                        <button
                          onClick={() => {
                            unequipItem(selectedSlot);
                            setSelectedSlot(null);
                          }}
                          className="w-full bg-red-950/70 hover:bg-red-900 text-red-300 hover:text-white border border-red-500/50 rounded-xl py-2 text-xs font-display font-black tracking-widest uppercase transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                        >
                          <X className="w-3.5 h-3.5" /> UNEQUIP
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            equipItem(selectedSlot, item.id);
                            setSelectedSlot(null);
                          }}
                          className="w-full bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 text-white border border-purple-400/50 rounded-xl py-2 text-xs font-display font-black tracking-widest uppercase transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> {equippedItemId ? 'SWAP RELIC' : 'EQUIP RELIC'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

  // Node Card for Mobile Talent Progression
  const renderTalentNodeCard = (node: TalentNode, isWide: boolean = false) => {
    const currentLevel = profile.talents?.[node.id] || 0;
    const isMaxed = currentLevel >= node.maxLevel;
    
    let isLocked = false;
    let lockReason = '';
    if (node.requires && node.requires.length > 0) {
      isLocked = !node.requires.every(reqId => {
        const reqNode = TALENT_TREES.find(n => n.id === reqId);
        const reqLevel = profile.talents?.[reqId] || 0;
        return node.requireMax ? reqLevel >= (reqNode?.maxLevel || 1) : reqLevel > 0;
      });
      if (isLocked) {
        const reqNames = node.requires.map(r => TALENT_TREES.find(n => n.id === r)?.name || r).join(', ');
        lockReason = node.requireMax ? `Requires maxing ${reqNames}` : `Requires unlocking ${reqNames}`;
      }
    }

    const IconComp = (LucideIcons as any)[node.icon] || LucideIcons.Sparkles;
    const stanceCfg = STANCE_CONFIG[activeTalentStance];
    const isMajor = node.tier === 3 || node.tier === 5;
    const canUpgrade = !isLocked && !isMaxed && availableTalentPoints >= node.cost;

    return (
      <div 
        key={node.id}
        onClick={() => {
          if (!isLocked && !isMaxed) handlePurchaseTalent(node);
          else if (isLocked) toast(lockReason, 'info');
        }}
        className={`rounded-2xl p-2.5 sm:p-3 border-2 transition-all relative flex flex-col justify-between select-none ${
          isLocked 
            ? 'bg-black/50 border-white/10 opacity-50 grayscale cursor-not-allowed'
            : isMaxed
            ? 'bg-gradient-to-b from-[#181a24] to-[#0d0f15] border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
            : canUpgrade
            ? `bg-gradient-to-b from-[#161426] via-[#100e1b] to-black ${stanceCfg.borderActive} shadow-lg active:scale-98 cursor-pointer`
            : 'bg-[#100e18] border-white/15 opacity-80'
        } ${isWide ? 'w-full' : 'flex-1 min-w-0'}`}
      >
        {/* Top: Icon + Name + Level Pill */}
        <div className="flex items-center gap-2 mb-1.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
            isMaxed 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
              : isLocked 
              ? 'bg-gray-800 text-gray-500' 
              : `${stanceCfg.badgeBg} border`
          }`}>
            <IconComp className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h5 className={`font-display font-bold text-[11px] leading-tight truncate ${
                isMajor ? 'text-amber-300' : isMaxed ? 'text-white' : 'text-gray-200'
              }`}>
                {node.name}
              </h5>
              <span className={`text-[8.5px] font-mono font-black px-1.5 py-0.2 rounded shrink-0 ${
                isMaxed 
                  ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40' 
                  : 'bg-black/60 text-gray-300 border border-white/10'
              }`}>
                {currentLevel}/{node.maxLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Middle: Description */}
        <p className="text-[9px] font-sans text-gray-400 leading-snug line-clamp-2 min-h-[24px]">
          {node.description(Math.max(1, currentLevel))}
        </p>

        {/* Bottom: Upgrade Action or Status */}
        <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[8px] font-mono">
          {isMaxed ? (
            <span className="w-full text-center py-0.5 text-amber-400 font-black tracking-wider flex items-center justify-center gap-1">
              <Check className="w-2.5 h-2.5 stroke-[3]" /> MAXED
            </span>
          ) : isLocked ? (
            <span className="w-full text-center py-0.5 text-gray-500 font-semibold tracking-tight truncate flex items-center justify-center gap-1">
              <Lock className="w-2.5 h-2.5" /> {lockReason || 'Locked'}
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePurchaseTalent(node);
              }}
              disabled={!canUpgrade}
              className={`w-full py-1 px-2 rounded-lg font-display font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-sm ${
                canUpgrade
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black cursor-pointer active:scale-95'
                  : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
              }`}
            >
              <span>Upgrade</span>
              <span className="text-[7.5px] font-mono opacity-85">({node.cost}pt)</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#080a0f] text-gray-200 select-none overflow-y-auto no-scrollbar font-sans pb-24">
      
      {/* 1. TOP SUB-TAB NAVIGATION */}
      <div className="sticky top-0 z-30 bg-[#080a0f]/95 backdrop-blur-md border-b border-[#c5a880]/20 px-3 py-2 shrink-0">
        <div className="flex gap-2 max-w-sm mx-auto">
          <button 
            onClick={() => setSubTab('equipment')}
            className={`flex-1 py-2 px-3 rounded-xl font-display font-black tracking-wider text-[11px] min-[380px]:text-xs transition-all duration-200 uppercase flex items-center justify-center gap-1.5 cursor-pointer ${
              subTab === 'equipment' 
                ? 'bg-gradient-to-b from-[#3b1248] via-[#240a2c] to-[#120417] text-purple-200 border-2 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.35)]' 
                : 'bg-black/50 text-gray-400 border border-white/10 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> RELICS & GEAR
          </button>
          
          <button 
            onClick={() => setSubTab('talents')}
            className={`flex-1 py-2 px-3 rounded-xl font-display font-black tracking-wider text-[11px] min-[380px]:text-xs transition-all duration-200 uppercase flex items-center justify-center gap-1.5 cursor-pointer ${
              subTab === 'talents' 
                ? 'bg-gradient-to-b from-[#3a2208] via-[#241403] to-[#100801] text-amber-200 border-2 border-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.35)]' 
                : 'bg-black/50 text-gray-400 border border-white/10 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" /> TALENT TREE
          </button>
        </div>
      </div>

      {subTab === 'equipment' ? (
        /* ------------------------------------------------------------- */
        /* TAB 1: RELICS & GEAR                                          */
        /* ------------------------------------------------------------- */
        <div className="p-3 space-y-3 max-w-md mx-auto w-full">

          {/* 2. LORD PROFILE & ATTRIBUTES CARD */}
          <div className="bg-gradient-to-b from-[#18121a] via-[#120d15] to-[#0a070c] border border-[#c5a880]/30 rounded-2xl p-3.5 shadow-xl relative overflow-hidden space-y-3">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-900/10 blur-3xl pointer-events-none" />

            {/* Profile Avatar, Username & Current Stance */}
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-14 h-14 rounded-full bg-gradient-to-b from-purple-950 to-black border-2 border-[#ebd09b] p-0.5 shadow-[0_0_15px_rgba(235,208,155,0.25)] flex items-center justify-center shrink-0">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <img src="/avatars/knight.webp" alt="Avatar" className="w-full h-full object-cover rounded-full" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-sm text-white tracking-wider uppercase truncate text-shadow-gold">
                    {profile.username || 'Abyssal Lord'}
                  </h3>
                  <span className="text-[#ebd09b] font-mono text-[9px] font-black bg-[#ebd09b]/10 border border-[#ebd09b]/30 px-2 py-0.5 rounded-full shadow-inner shrink-0">
                    LVL {profile.level}
                  </span>
                </div>

                {/* Stance Indicator Banner */}
                <div className="mt-1 bg-black/60 border border-white/10 rounded-lg py-1 px-2 flex items-center gap-1.5">
                  <div className="shrink-0">{activeStance.icon("w-3.5 h-3.5")}</div>
                  <div className="min-w-0 flex-1">
                    <span className={`text-[9px] font-display font-black uppercase tracking-wider block ${activeStance.color} leading-none`}>
                      {activeStance.name}
                    </span>
                    <span className="text-[7.5px] text-gray-400 font-sans block truncate leading-tight mt-0.5">
                      {activeStance.desc}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* EXP Progress Bar */}
            <div className="space-y-1 relative z-10 pt-0.5">
              <div className="flex justify-between text-gray-400 text-[8.5px] font-mono uppercase font-bold">
                <span>EXPERIENCE</span>
                <span className="text-gray-300">{Math.floor(profile.exp || 0).toLocaleString()} / {reqExp.toLocaleString()}</span>
              </div>
              <div className="w-full h-1.5 bg-black/80 rounded-full overflow-hidden border border-white/10 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-indigo-400 to-emerald-400 transition-all duration-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" 
                  style={{ width: `${expPercent}%` }} 
                />
              </div>
            </div>

            {/* Battle Attributes 2x2 Grid */}
            <div className="pt-2 border-t border-gray-800/80 space-y-1.5 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] font-display font-black text-[#ebd09b] tracking-wider uppercase">
                  BATTLE ATTRIBUTES
                </span>
                <span className="text-[8.5px] font-mono text-purple-300 font-bold bg-purple-950/60 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  {equippedList.length}/6 Relics
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 font-mono">
                {/* Max Health */}
                <div className="bg-black/60 border border-emerald-500/25 px-2.5 py-1.5 rounded-xl flex items-center justify-between shadow-sm">
                  <span className="flex items-center gap-1 text-gray-400 text-[9px] uppercase font-bold">
                    <Heart className="w-3 h-3 text-emerald-400 shrink-0" /> HP
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-emerald-300 font-display font-black text-xs">{totalHealth}</span>
                    {bonusHealth > 0 && (
                      <span className="text-[8px] text-emerald-400/80 font-bold">+{bonusHealth}</span>
                    )}
                  </div>
                </div>

                {/* Dodge Chance */}
                <div className="bg-black/60 border border-cyan-500/25 px-2.5 py-1.5 rounded-xl flex items-center justify-between shadow-sm">
                  <span className="flex items-center gap-1 text-gray-400 text-[9px] uppercase font-bold">
                    <Wind className="w-3 h-3 text-cyan-400 shrink-0" /> Dodge
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-cyan-300 font-display font-black text-xs">{bonusDodge}%</span>
                    {bonusDodge > 0 && (
                      <span className="text-[8px] text-cyan-400/80 font-bold">+{bonusDodge}%</span>
                    )}
                  </div>
                </div>

                {/* Gold Bonus */}
                <div className="bg-black/60 border border-amber-500/25 px-2.5 py-1.5 rounded-xl flex items-center justify-between shadow-sm">
                  <span className="flex items-center gap-1 text-gray-400 text-[9px] uppercase font-bold">
                    <Coins className="w-3 h-3 text-amber-400 shrink-0" /> Gold
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-amber-300 font-display font-black text-xs">+{bonusGold}%</span>
                  </div>
                </div>

                {/* Delay Reduction */}
                <div className="bg-black/60 border border-purple-500/25 px-2.5 py-1.5 rounded-xl flex items-center justify-between shadow-sm">
                  <span className="flex items-center gap-1 text-gray-400 text-[9px] uppercase font-bold">
                    <Hourglass className="w-3 h-3 text-purple-400 shrink-0" /> Delay
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-purple-300 font-display font-black text-[10.5px]">
                      {bonusDelay > 0 ? `-${bonusDelay}T` : 'Normal'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. PAPERDOLL MANNEQUIN CARD */}
          <div className="bg-gradient-to-b from-[#18121a] via-[#120d15] to-[#0a070c] border border-purple-900/40 rounded-2xl p-3.5 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.08),transparent_70%)] pointer-events-none" />

            <div className="flex items-center justify-between border-b border-purple-900/40 pb-2 mb-2 relative z-10">
              <h3 className="font-display font-black text-xs text-purple-200 tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> EQUIPPED RELICS
              </h3>
              <span className="text-[8.5px] font-mono text-gray-400">
                Tap slot to equip
              </span>
            </div>

            {/* 6 Slots + Center Silhouette */}
            <div className="flex items-center justify-center py-2 relative z-10">
              <div className="flex items-center justify-center gap-1.5 min-[380px]:gap-3 w-full">
                
                {/* Left Column: HELMET, WEAPON, RING */}
                <div className="flex flex-col gap-2">
                  {renderSlotBox('helmet', 'HELMET', '/icons/equipment/slot_helmet.png')}
                  {renderSlotBox('weapon', 'WEAPON', '/icons/equipment/slot_weapon.png')}
                  {renderSlotBox('ring', 'RING', '/icons/equipment/slot_ring.png')}
                </div>

                {/* Center Silhouette Mannequin */}
                <div className="w-20 min-[380px]:w-24 h-64 relative flex items-center justify-center">
                  <div className="w-full h-full bg-black/40 border border-purple-500/20 rounded-2xl flex items-center justify-center p-1.5 shadow-inner overflow-hidden relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.2),transparent_70%)] pointer-events-none" />
                    <img 
                      src="/icons/equipment/lord_silhouette.png" 
                      alt="Lord Silhouette" 
                      className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(168,85,247,0.4)] opacity-85 hover:opacity-100 transition-opacity" 
                    />
                  </div>
                </div>

                {/* Right Column: AMULET, ARMOR, BOOTS */}
                <div className="flex flex-col gap-2">
                  {renderSlotBox('amulet', 'AMULET', '/icons/equipment/slot_amulet.png')}
                  {renderSlotBox('armor', 'ARMOR', '/icons/equipment/slot_armor.png')}
                  {renderSlotBox('boots', 'BOOTS', '/icons/equipment/slot_boots.png')}
                </div>

              </div>
            </div>

            <div className="mt-1 pt-2 border-t border-white/5 text-center relative z-10 text-[9px] font-mono text-purple-300/80">
              Tap any slot to browse & equip inventory relics
            </div>
          </div>

          {/* 4. SET OF THE DEMIURGE (DIVINE RESONANCE MONOLITH) */}
          <div className="bg-gradient-to-b from-[#210912] via-[#14050b] to-[#0a0205] border-2 border-rose-500/40 rounded-2xl p-3.5 shadow-xl relative overflow-hidden space-y-3">
            <div className="absolute top-0 right-0 w-36 h-36 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Crest + Title + Resonance Counter */}
            <div className="border-b border-rose-500/20 pb-2.5 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-xl bg-rose-950/80 border border-rose-500/50 p-1 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.35)] shrink-0">
                  <img 
                    src="/icons/equipment/demiurge_crest.png" 
                    alt="Demiurge Crest" 
                    className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]" 
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-display font-black text-white text-xs tracking-wider uppercase truncate">
                      SET OF THE DEMIURGE
                    </h4>
                    <span className="bg-rose-500 text-white font-mono text-[7.5px] font-black uppercase px-2 py-0.5 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.7)] shrink-0">
                      DIVINE
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[8.5px] font-mono text-gray-400 font-bold uppercase">Resonance</span>
                    <span className="font-mono font-black text-xs text-rose-300">
                      {demiurgePieces} / 6 Pieces
                    </span>
                  </div>
                </div>
              </div>

              {/* 6-Pip Milestone Progress Bar */}
              <div className="grid grid-cols-6 gap-1 mt-2">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i <= demiurgePieces 
                        ? 'bg-gradient-to-r from-rose-500 to-amber-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]' 
                        : 'bg-black/60 border border-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 3 Milestone Threshold Cards */}
            <div className="space-y-1.5 relative z-10">
              {DEMIURGE_SET.thresholds.map((threshold, tIdx) => {
                const isActive = demiurgePieces >= threshold.pieces;
                return (
                  <div
                    key={tIdx}
                    className={`rounded-xl p-2.5 border transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-950/90 via-[#270710]/90 to-rose-950/80 border-rose-400/90 shadow-[0_0_12px_rgba(244,63,94,0.35)] ring-1 ring-rose-400/40'
                        : 'bg-black/50 border-white/10 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-3.5 h-3.5 rounded text-[8px] font-mono font-black flex items-center justify-center ${
                          isActive ? 'bg-rose-500 text-black font-bold' : 'bg-white/10 text-gray-400'
                        }`}>
                          {threshold.pieces}
                        </span>
                        <span className={`text-[9px] font-mono font-black uppercase tracking-wider ${isActive ? 'text-rose-200' : 'text-gray-400'}`}>
                          {threshold.label}
                        </span>
                      </div>

                      {isActive ? (
                        <span className="text-[7.5px] font-mono font-black text-rose-300 bg-rose-950 border border-rose-500/70 px-1.5 py-0.2 rounded-full flex items-center gap-1 shadow-[0_0_6px_rgba(244,63,94,0.6)]">
                          <Check className="w-2.5 h-2.5" /> ACTIVE
                        </span>
                      ) : (
                        <span className="text-[7.5px] font-mono text-gray-500">
                          {threshold.pieces - demiurgePieces} needed
                        </span>
                      )}
                    </div>

                    <p className={`text-[9.5px] font-sans leading-snug ${isActive ? 'text-rose-100 font-medium' : 'text-gray-400'}`}>
                      {threshold.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Forge Set in Shop Button */}
            <div className="pt-1 text-center relative z-10">
              <button
                onClick={() => onNavigateToShop?.('divine')}
                className="w-full py-2 px-3 bg-gradient-to-r from-rose-950 via-red-900 to-rose-950 hover:from-red-900 hover:via-rose-800 hover:to-red-900 border border-rose-500/60 hover:border-rose-400 text-rose-200 hover:text-white font-display font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(244,63,94,0.3)] hover:shadow-[0_0_22px_rgba(244,63,94,0.6)] flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-rose-400" />
                <span>FORGE SET IN SHOP</span>
                <ArrowRight className="w-3.5 h-3.5 text-rose-400/80" />
              </button>
            </div>
          </div>

        </div>
      ) : (
        /* ------------------------------------------------------------- */
        /* TAB 2: TALENT TREE (MOBILE-OPTIMIZED VIEW)                     */
        /* ------------------------------------------------------------- */
        <div className="p-3 space-y-3 max-w-md mx-auto w-full">
          
          {/* Header Card: Points & Reset */}
          <div className="bg-gradient-to-b from-[#18121a] via-[#120d15] to-[#0a070c] border border-[#c5a880]/30 rounded-2xl p-3.5 shadow-xl relative overflow-hidden flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[9px] font-mono text-gray-400 uppercase tracking-widest block leading-tight">
                Skill Points
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl min-[380px]:text-2xl font-display font-black text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                  {availableTalentPoints}
                </span>
                <span className="text-[9px] font-mono text-gray-400">
                  / {totalTalentPoints} Total
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsResetConfirmOpen(true)}
              disabled={spentTalentPoints === 0 || isResetting}
              className="bg-gradient-to-r from-red-950/80 to-rose-950/90 hover:from-red-900 hover:to-rose-900 border border-rose-500/50 text-rose-200 hover:text-white px-3 py-2 rounded-xl text-[10.5px] font-display font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Reset (15 💎)</span>
            </button>
          </div>

          {/* Stance Selector Pills */}
          <div className="bg-black/60 border border-white/10 rounded-2xl p-1.5 grid grid-cols-3 gap-1">
            {(['void_strike', 'blood_aura', 'warlord_cry'] as const).map(stKey => {
              const st = STANCE_CONFIG[stKey];
              const isSelectedTab = activeTalentStance === stKey;
              const isEquipped = (profile.activeStance || 'void_strike') === stKey;

              return (
                <button
                  key={stKey}
                  onClick={() => setActiveTalentStance(stKey)}
                  className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer relative ${
                    isSelectedTab
                      ? `bg-gradient-to-b ${st.bgActive} border-2 ${st.borderActive} shadow-lg text-white`
                      : 'border border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <div className="shrink-0">{st.icon("w-4 h-4")}</div>
                  <span className="text-[8.5px] min-[380px]:text-[9px] font-display font-bold uppercase truncate max-w-full">
                    {st.name.split(' ')[0]}
                  </span>
                  {isEquipped && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] absolute top-1 right-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Stance Status Banner & Equip Button */}
          {(() => {
            const currentCfg = STANCE_CONFIG[activeTalentStance];
            const isEquipped = (profile.activeStance || 'void_strike') === activeTalentStance;

            return (
              <div className="bg-gradient-to-b from-[#13101c] to-[#0a0812] border border-white/15 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-md">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-display font-black uppercase tracking-wider ${currentCfg.color}`}>
                      {currentCfg.name}
                    </span>
                    {isEquipped && (
                      <span className="text-[8px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 px-1.5 py-0.2 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] font-sans text-gray-400 mt-0.5 leading-snug">
                    Base: <span className="text-gray-200">{currentCfg.desc}</span>
                  </p>
                </div>

                {isEquipped ? (
                  <span className="bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-[9px] font-mono font-black px-2.5 py-1 rounded-xl shrink-0 flex items-center gap-1">
                    <Check className="w-3 h-3" /> ACTIVE
                  </span>
                ) : (
                  <button
                    onClick={() => handleEquipStance(activeTalentStance)}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-black font-display font-black text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-md shrink-0 active:scale-95 cursor-pointer"
                  >
                    Equip Stance
                  </button>
                )}
              </div>
            );
          })()}

          {/* Mobile Tiered Progression Tree */}
          {(() => {
            const activeNodes = TALENT_TREES.filter(t => t.stance === activeTalentStance);
            const tier1Nodes = activeNodes.filter(n => n.tier === 1);
            const tier2Nodes = activeNodes.filter(n => n.tier === 2);
            const tier3Nodes = activeNodes.filter(n => n.tier === 3);
            const tier4Nodes = activeNodes.filter(n => n.tier === 4);
            const tier5Nodes = activeNodes.filter(n => n.tier === 5);

            return (
              <div className="space-y-2 pt-1">
                {/* TIER 1 (Base Attunement) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[8.5px] font-mono text-gray-400 uppercase tracking-wider font-bold">
                      Tier 1 · Base Attunement
                    </span>
                  </div>
                  {tier1Nodes.map(node => renderTalentNodeCard(node, true))}
                </div>

                {/* Connector Arrow */}
                <div className="flex justify-center text-gray-600 py-0.5">
                  <ChevronDown className="w-4 h-4 animate-bounce" />
                </div>

                {/* TIER 2 (Branching Passives) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[8.5px] font-mono text-gray-400 uppercase tracking-wider font-bold">
                      Tier 2 · Enhancement Paths
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {tier2Nodes.map(node => renderTalentNodeCard(node, false))}
                  </div>
                </div>

                {/* Connector Arrow */}
                <div className="flex justify-center text-gray-600 py-0.5">
                  <ChevronDown className="w-4 h-4 animate-bounce" />
                </div>

                {/* TIER 3 (Major Keystone) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[8.5px] font-mono text-amber-400/90 uppercase tracking-wider font-bold flex items-center gap-1">
                      <Award className="w-3 h-3 text-amber-400" /> Tier 3 · Major Keystone
                    </span>
                    <span className="text-[7.5px] font-mono text-gray-500">Requires Max T2</span>
                  </div>
                  {tier3Nodes.map(node => renderTalentNodeCard(node, true))}
                </div>

                {/* Connector Arrow */}
                <div className="flex justify-center text-gray-600 py-0.5">
                  <ChevronDown className="w-4 h-4 animate-bounce" />
                </div>

                {/* TIER 4 (Advanced Specializations) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[8.5px] font-mono text-gray-400 uppercase tracking-wider font-bold">
                      Tier 4 · Advanced Passives
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {tier4Nodes.map(node => renderTalentNodeCard(node, false))}
                  </div>
                </div>

                {/* Connector Arrow */}
                <div className="flex justify-center text-gray-600 py-0.5">
                  <ChevronDown className="w-4 h-4 animate-bounce" />
                </div>

                {/* TIER 5 (Ultimate Capstone) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[8.5px] font-mono text-rose-400/90 uppercase tracking-wider font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-rose-400" /> Tier 5 · Ultimate Capstone
                    </span>
                    <span className="text-[7.5px] font-mono text-gray-500">Requires All Maxed</span>
                  </div>
                  {tier5Nodes.map(node => renderTalentNodeCard(node, true))}
                </div>
              </div>
            );
          })()}

        </div>
      )}

      {/* 6. RELIC SELECTION MODAL POPUP */}
      {renderInventoryModal()}

      {/* 7. TALENT RESET CONFIRMATION MODAL */}
      {isResetConfirmOpen && (
        <div 
          onClick={() => setIsResetConfirmOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#15121e] border-2 border-rose-500/50 rounded-2xl p-5 max-w-xs w-full shadow-[0_0_40px_rgba(244,63,94,0.3)] text-center relative overflow-hidden cursor-default"
          >
            <div className="w-12 h-12 rounded-full bg-rose-950/60 border border-rose-500/40 flex items-center justify-center mx-auto mb-2 text-rose-400">
              <RotateCcw className="w-6 h-6" />
            </div>

            <h3 className="font-display font-black text-white text-base tracking-widest uppercase mb-1">
              Reset Talents?
            </h3>

            <p className="text-gray-300 font-sans text-xs mb-4 leading-relaxed">
              Refund all spent talent points for <span className="text-rose-400 font-bold">15 Dark Shards</span>?
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2 rounded-xl bg-black/60 border border-white/15 text-gray-300 text-xs font-mono font-bold hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                disabled={isResetting}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-800 to-rose-700 hover:brightness-110 text-white text-xs font-display font-black uppercase tracking-wider shadow-lg active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isResetting ? 'Resetting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MobileHeroView;
