import React, { useState, useRef, useCallback } from 'react';
import { Card } from '../types';
import { getCardTierStyles } from '../utils/tierStyles';

interface HoloCardPreviewProps {
  card: Card;
  getCardImageUrl: (card: Card) => string;
  getTierBadgeStyles: (tier: any) => string;
  getCardManaCost: (card: Card) => number;
  renderManaIcon: (cost: number, sizeClass?: string) => React.ReactNode;
}

export const HoloCardPreview: React.FC<HoloCardPreviewProps> = ({
  card,
  getCardImageUrl,
  getTierBadgeStyles,
  getCardManaCost,
  renderManaIcon
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number; active: boolean }>({ x: 50, y: 50, active: false });

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setCoords({ x, y, active: true });
  }, []);

  const handlePointerLeave = useCallback(() => {
    setCoords({ x: 50, y: 50, active: false });
  }, []);

  // 3D Tilt calculation
  const rotateX = coords.active ? (50 - coords.y) * 0.28 : 0; // -14deg to +14deg
  const rotateY = coords.active ? (coords.x - 50) * 0.28 : 0; // -14deg to +14deg
  const glareAngle = Math.round(Math.atan2(coords.y - 50, coords.x - 50) * (180 / Math.PI) + 90);

  const isSilver = card.tier === 'silver';
  const isGold = card.tier === 'gold';
  const isLegendary = card.tier === 'legendary';
  const hasHolo = isSilver || isGold || isLegendary;

  return (
    <div className="relative w-full max-w-[240px] mx-auto perspective-[1000px] py-1 select-none">
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) ${coords.active ? 'scale3d(1.03, 1.03, 1.03)' : 'scale3d(1, 1, 1)'}`,
          transition: coords.active ? 'transform 0.08s ease-out' : 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
        className={`aspect-[3/4.2] w-full rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group cursor-grab active:cursor-grabbing border ${getCardTierStyles(card.tier, false, true)} shadow-[0_15px_35px_rgba(0,0,0,0.7)]`}
      >
        {/* Ambient Dark Background */}
        <div className="absolute inset-0 bg-[#0b0c10] z-0" />

        {/* Card Artwork */}
        <img 
          src={getCardImageUrl(card)} 
          alt={card.name} 
          decoding="async" 
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-90 transition-transform duration-300 pointer-events-none" 
        />

        {/* Vignette Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20 z-0 pointer-events-none" />

        {/* HOLOGRAPHIC FOIL OVERLAYS */}
        {hasHolo && (
          <>
            {/* Prismatic Rainbow Sheen */}
            <div
              className={`absolute inset-0 pointer-events-none transition-opacity duration-300 z-10 ${coords.active ? 'opacity-85' : 'opacity-35'}`}
              style={{
                background: isLegendary
                  ? `linear-gradient(${glareAngle}deg, rgba(255,0,128,0.35) 0%, rgba(255,154,0,0.3) 20%, rgba(208,222,33,0.35) 40%, rgba(79,220,74,0.3) 60%, rgba(63,218,216,0.35) 80%, rgba(199,0,255,0.35) 100%)`
                  : isGold
                  ? `linear-gradient(${glareAngle}deg, rgba(255,215,0,0.4) 0%, rgba(255,140,0,0.35) 25%, rgba(255,75,180,0.3) 50%, rgba(255,230,120,0.45) 75%, rgba(255,215,0,0.4) 100%)`
                  : `linear-gradient(${glareAngle}deg, rgba(200,240,255,0.35) 0%, rgba(255,210,255,0.3) 35%, rgba(180,255,240,0.35) 70%, rgba(220,240,255,0.35) 100%)`,
                mixBlendMode: 'color-dodge'
              }}
            />

            {/* Specular Radial Glare Spot (follows cursor) */}
            <div
              className={`absolute inset-0 pointer-events-none transition-opacity duration-200 z-10 ${coords.active ? 'opacity-90' : 'opacity-0'}`}
              style={{
                background: `radial-gradient(circle at ${coords.x}% ${coords.y}%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 25%, transparent 65%)`,
                mixBlendMode: 'overlay'
              }}
            />

            {/* Micro Prismatic Shimmer Lines */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-25 z-10 mix-blend-screen bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" 
            />

            {/* Idle Ambient Light Sweep */}
            {!coords.active && (
              <div 
                className="absolute inset-0 pointer-events-none z-10 opacity-30 animate-pulse"
                style={{
                  background: isLegendary
                    ? 'linear-gradient(120deg, transparent 30%, rgba(168,85,247,0.4) 50%, transparent 70%)'
                    : isGold
                    ? 'linear-gradient(120deg, transparent 30%, rgba(234,179,8,0.4) 50%, transparent 70%)'
                    : 'linear-gradient(120deg, transparent 30%, rgba(203,213,225,0.35) 50%, transparent 70%)'
                }}
              />
            )}
          </>
        )}

        {/* Top: Tier & Mana/Level Badges */}
        <div className="relative z-20 flex justify-between items-start pointer-events-none">
          <span className={getTierBadgeStyles(card.tier)}>{card.tier}</span>
          <div className="flex items-center gap-1.5">
            {renderManaIcon(getCardManaCost(card), "w-6 h-6")}
            <div className="bg-black/85 border border-[#c5a880]/50 rounded-full w-6 h-6 flex items-center justify-center text-[10px] font-mono font-black text-[#ebd09b] shadow">
              L{card.level}
            </div>
          </div>
        </div>

        <div className="flex-1 pointer-events-none" />

        {/* Bottom: Name & Stats */}
        <div className="relative z-20 pointer-events-none">
          <h3 className="font-display font-black text-xl text-white tracking-widest text-shadow-gold mb-2 text-center drop-shadow-md">
            {card.name}
          </h3>
          <div className="grid grid-cols-3 gap-1 font-mono text-[10px] font-bold text-center border-t border-white/15 pt-2 bg-black/60 backdrop-blur-md rounded-lg p-1.5 shadow-lg">
            <div className="bg-red-950/50 p-1 rounded border border-red-500/20">
              <span className="text-red-400 block text-[8px] opacity-80">ATK</span>
              <span className="text-red-400 text-sm">⚔️{card.attack}</span>
            </div>
            <div className="bg-emerald-950/50 p-1 rounded border border-emerald-500/20">
              <span className="text-emerald-400 block text-[8px] opacity-80">HP</span>
              <span className="text-emerald-400 text-sm">❤️{card.health}</span>
            </div>
            <div className="bg-blue-950/50 p-1 rounded border border-blue-500/20">
              <span className="text-blue-400 block text-[8px] opacity-80">DELAY</span>
              <span className="text-blue-400 text-sm">⏳{card.delay}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Helper Hint */}
      {hasHolo && (
        <div className="text-center mt-1.5 opacity-60 hover:opacity-100 transition-opacity">
          <span className="text-[9px] font-mono text-[#c5a880] tracking-wider uppercase flex items-center justify-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            ✦ Interactive 3D Holo Foil ✦
          </span>
        </div>
      )}
    </div>
  );
};