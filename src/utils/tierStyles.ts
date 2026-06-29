export const getCardTierStyles = (tier: string, isSelected: boolean = false, isHover: boolean = false): string => {
  let baseStyles = "transition-all duration-300 ";
  
  if (isSelected) {
    return baseStyles + "bg-black border-[#66fcf1] shadow-neon-blue scale-[1.02] z-10 ";
  }

  const hoverEffect = isHover ? "hover:scale-[1.02] hover:-translate-y-1 hover:z-10 " : "";

  switch (tier) {
    case 'bronze':
      return baseStyles + hoverEffect + "bg-black/80 border-[#cd7f32]/40 shadow-[0_0_15px_rgba(205,127,50,0.1)] " + (isHover ? "hover:border-[#cd7f32] hover:shadow-[0_0_20px_rgba(205,127,50,0.4)]" : "");
    case 'silver':
      return baseStyles + hoverEffect + "bg-black/80 border-slate-400/50 shadow-[0_0_15px_rgba(148,163,184,0.1)] " + (isHover ? "hover:border-slate-300 hover:shadow-[0_0_20px_rgba(148,163,184,0.4)]" : "");
    case 'gold':
      return baseStyles + hoverEffect + "bg-black/90 border-amber-400/70 shadow-neon-gold " + (isHover ? "hover:border-amber-300 hover:shadow-[0_0_25px_rgba(251,191,36,0.6)]" : "");
    case 'legendary':
      return baseStyles + hoverEffect + "bg-black border-purple-500/80 shadow-neon-purple " + (isHover ? "hover:border-purple-400 hover:shadow-[0_0_35px_rgba(168,85,247,0.8)]" : "");
    default:
      return baseStyles + hoverEffect + "bg-black/60 border-white/10";
  }
};
