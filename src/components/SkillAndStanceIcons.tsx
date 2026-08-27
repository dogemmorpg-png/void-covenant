import React from 'react';

/**
 * Minimalist, high-contrast Dark Fantasy vector icons for Stances & Skills
 */

export const VoidStrikeIcon: React.FC<{ className?: string; sizeClass?: string }> = ({ 
  className = '', 
  sizeClass = 'w-5 h-5' 
}) => (
  <div className={`relative ${sizeClass} shrink-0 inline-flex items-center justify-center ${className}`}>
    <svg className="w-full h-full filter drop-shadow-[0_0_6px_rgba(6,182,212,0.7)]" viewBox="0 0 24 24" fill="none">
      {/* Void Rift Starburst Background */}
      <path 
        d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" 
        fill="url(#voidRiftGrad)" 
        opacity="0.35" 
      />
      {/* Sharp Lightning Rift Blade */}
      <path 
        d="M13 2.5L5.5 13H11L9.5 21.5L18.5 10.5H12.5L13 2.5Z" 
        fill="url(#voidStrikeGrad)" 
        stroke="#67e8f9" 
        strokeWidth="1.2" 
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="voidStrikeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#cffafe" />
          <stop offset="40%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <radialGradient id="voidRiftGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  </div>
);

export const BloodAuraIcon: React.FC<{ className?: string; sizeClass?: string }> = ({ 
  className = '', 
  sizeClass = 'w-5 h-5' 
}) => (
  <div className={`relative ${sizeClass} shrink-0 inline-flex items-center justify-center ${className}`}>
    <svg className="w-full h-full filter drop-shadow-[0_0_6px_rgba(244,63,94,0.75)]" viewBox="0 0 24 24" fill="none">
      {/* Radiating Sanguine Pulse Rings */}
      <circle cx="12" cy="14" r="8" stroke="#fda4af" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
      <path 
        d="M5 14C5 8.5 8.5 5 12 2C15.5 5 19 8.5 19 14C19 17.866 15.866 21 12 21C8.134 21 5 17.866 5 14Z" 
        fill="url(#bloodAuraGrad)" 
        stroke="#fda4af" 
        strokeWidth="1.2" 
      />
      {/* Inner Heart Core Highlight */}
      <path 
        d="M9 13.5C9 11 11.5 8.5 11.5 8.5" 
        stroke="#ffffff" 
        strokeWidth="1.4" 
        strokeLinecap="round" 
        opacity="0.8" 
      />
      <defs>
        <linearGradient id="bloodAuraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="50%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#881337" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

export const WarlordCryIcon: React.FC<{ className?: string; sizeClass?: string }> = ({ 
  className = '', 
  sizeClass = 'w-5 h-5' 
}) => (
  <div className={`relative ${sizeClass} shrink-0 inline-flex items-center justify-center ${className}`}>
    <svg className="w-full h-full filter drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" viewBox="0 0 24 24" fill="none">
      {/* War Roar Shockwaves */}
      <path 
        d="M17 6C19.5 7.8 21 10.7 21 14C21 17.3 19.5 20.2 17 22" 
        stroke="#fde68a" 
        strokeWidth="1.4" 
        strokeLinecap="round" 
        opacity="0.75" 
      />
      <path 
        d="M14.5 9C15.8 10.3 16.5 12 16.5 14C16.5 16 15.8 17.7 14.5 19" 
        stroke="#f59e0b" 
        strokeWidth="1.4" 
        strokeLinecap="round" 
      />
      {/* Horn / Spiked War Helmet */}
      <path 
        d="M3 10L10 6.5V21.5L3 18V10Z" 
        fill="url(#warlordGrad)" 
        stroke="#fef08a" 
        strokeWidth="1.2" 
      />
      <path 
        d="M10 9L13 10V18L10 19V9Z" 
        fill="#b45309" 
        stroke="#f59e0b" 
        strokeWidth="1" 
      />
      {/* Spikes / Crest */}
      <path d="M4 10L2 7L6 9" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <defs>
        <linearGradient id="warlordGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="40%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

/**
 * Universal Stance Icon Resolver
 */
export const renderStanceIcon = (stanceId?: string, sizeClass: string = "w-5 h-5", className: string = "") => {
  const norm = stanceId?.toLowerCase();
  switch (norm) {
    case 'blood_aura':
      return <BloodAuraIcon sizeClass={sizeClass} className={className} />;
    case 'warlord_cry':
      return <WarlordCryIcon sizeClass={sizeClass} className={className} />;
    case 'void_strike':
    default:
      return <VoidStrikeIcon sizeClass={sizeClass} className={className} />;
  }
};
