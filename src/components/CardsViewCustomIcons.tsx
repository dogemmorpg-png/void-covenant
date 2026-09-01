import React from 'react';

// 1. Sanctuary Icon: Stylized horned demon/beast skull with glowing gold accents
export const SanctuaryEmblem: React.FC<{ className?: string; size?: number }> = ({ className = 'w-4 h-4', size }) => (
  <svg 
    viewBox='0 0 24 24' 
    fill='none' 
    xmlns='http://www.w3.org/2000/svg'
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id='goldSkullGrad' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stopColor='#fef08a' />
        <stop offset='50%' stopColor='#eab308' />
        <stop offset='100%' stopColor='#854d0e' />
      </linearGradient>
      <radialGradient id='eyeGlow' cx='50%' cy='50%' r='50%'>
        <stop offset='0%' stopColor='#ffffff' />
        <stop offset='100%' stopColor='#eab308' />
      </radialGradient>
      <filter id='goldGlow' x='-20%' y='-20%' width='140%' height='140%'>
        <feDropShadow dx='0' dy='0' stdDeviation='1.5' floodColor='#eab308' floodOpacity='0.8' />
      </filter>
    </defs>
    <g filter='url(#goldGlow)'>
      <path 
        d='M5 9C4 5 6 2 9 1C8 4 9 7 11 8M19 9C20 5 18 2 15 1C16 4 15 7 13 8' 
        stroke='url(#goldSkullGrad)' 
        strokeWidth='1.8' 
        strokeLinecap='round' 
        strokeLinejoin='round' 
      />
      <path 
        d='M7 9C7 5.5 9.2 3.5 12 3.5C14.8 3.5 17 5.5 17 9C17 11.5 16 13 14.5 14.5V17.5C14.5 18.5 13.5 19.5 12 19.5C10.5 19.5 9.5 18.5 9.5 17.5V14.5C8 13 7 11.5 7 9Z' 
        fill='#120e06' 
        stroke='url(#goldSkullGrad)' 
        strokeWidth='1.5' 
      />
      <ellipse cx='9.8' cy='9.8' rx='1.2' ry='1.6' fill='url(#eyeGlow)' />
      <ellipse cx='14.2' cy='9.8' rx='1.2' ry='1.6' fill='url(#eyeGlow)' />
      <path d='M12 11.8L11.4 13.2H12.6L12 11.8Z' fill='url(#goldSkullGrad)' />
      <path d='M10.8 16.5V18.5M12 16.5V18.5M13.2 16.5V18.5' stroke='url(#goldSkullGrad)' strokeWidth='1.2' strokeLinecap='round' />
    </g>
  </svg>
);

// 2. Fusion Altar Icon: Transmutation vortex with twin void crescents and glowing star
export const FusionAltarEmblem: React.FC<{ className?: string; size?: number }> = ({ className = 'w-4 h-4', size }) => (
  <svg 
    viewBox='0 0 24 24' 
    fill='none' 
    xmlns='http://www.w3.org/2000/svg'
    className={className}
    style={size ? { width: size, height: size } : undefined}
  >
    <defs>
      <linearGradient id='purpleAltarGrad' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stopColor='#f0abfc' />
        <stop offset='50%' stopColor='#c084fc' />
        <stop offset='100%' stopColor='#9333ea' />
      </linearGradient>
      <filter id='purpleGlow' x='-25%' y='-25%' width='150%' height='150%'>
        <feDropShadow dx='0' dy='0' stdDeviation='1.8' floodColor='#a855f7' floodOpacity='0.9' />
      </filter>
    </defs>
    <g filter='url(#purpleGlow)'>
      <path 
        d='M12 2C6.48 2 2 6.48 2 12C2 14.8 3.1 17.3 5 19.1C4.3 16.5 4.8 13.5 6.6 11.4C8.4 9.3 11.2 8.4 14 9M12 22C17.52 22 22 17.52 22 12C22 9.2 20.9 6.7 19 4.9C19.7 7.5 19.2 10.5 17.4 12.6C15.6 14.7 12.8 15.6 10 15' 
        stroke='url(#purpleAltarGrad)' 
        strokeWidth='1.8' 
        strokeLinecap='round' 
      />
      <path 
        d='M12 6.5L13.3 10.7L17.5 12L13.3 13.3L12 17.5L10.7 13.3L6.5 12L10.7 10.7L12 6.5Z' 
        fill='#ffffff' 
        stroke='url(#purpleAltarGrad)' 
        strokeWidth='1.2' 
        strokeLinejoin='round' 
      />
      <circle cx='12' cy='12' r='1.5' fill='#fdf4ff' />
    </g>
  </svg>
);

// 3. Base Card Altar Slot Placeholder: Glowing purple card with runic eye
export const BaseCardSlotEmblem: React.FC<{ className?: string; size?: number }> = ({ className = 'w-8 h-8', size }) => (
  <svg 
    viewBox='0 0 32 40' 
    fill='none' 
    xmlns='http://www.w3.org/2000/svg'
    className={className}
    style={size ? { width: size, height: size * 1.25 } : undefined}
  >
    <defs>
      <linearGradient id='baseCardGrad' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stopColor='#f0abfc' />
        <stop offset='60%' stopColor='#a855f7' />
        <stop offset='100%' stopColor='#6b21a8' />
      </linearGradient>
      <filter id='baseCardGlow' x='-20%' y='-20%' width='140%' height='140%'>
        <feDropShadow dx='0' dy='0' stdDeviation='2.5' floodColor='#a855f7' floodOpacity='0.8' />
      </filter>
    </defs>
    <g filter='url(#baseCardGlow)'>
      <rect 
        x='2' 
        y='2' 
        width='28' 
        height='36' 
        rx='5' 
        fill='#0e0717' 
        stroke='url(#baseCardGrad)' 
        strokeWidth='1.6' 
        strokeDasharray='4 2'
      />
      <path d='M5 8V5H8M24 5H27V8M27 32V35H24M8 35H5V32' stroke='url(#baseCardGrad)' strokeWidth='1.4' strokeLinecap='round' />
      <path d='M8 20C11 15 21 15 24 20C21 25 11 25 8 20Z' fill='#1c0d2e' stroke='url(#baseCardGrad)' strokeWidth='1.4' />
      <circle cx='16' cy='20' r='3' fill='url(#baseCardGrad)' />
      <circle cx='16' cy='20' r='1.2' fill='#ffffff' />
      <path d='M16 11V13M16 27V29M9 20H11M21 20H23' stroke='#f0abfc' strokeWidth='1.2' strokeLinecap='round' />
    </g>
  </svg>
);

// 4. Sacrifice Card Altar Slot Placeholder: Glowing crimson card with sacrificial dagger & flame
export const SacrificeSlotEmblem: React.FC<{ className?: string; size?: number }> = ({ className = 'w-8 h-8', size }) => (
  <svg 
    viewBox='0 0 32 40' 
    fill='none' 
    xmlns='http://www.w3.org/2000/svg'
    className={className}
    style={size ? { width: size, height: size * 1.25 } : undefined}
  >
    <defs>
      <linearGradient id='sacCardGrad' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stopColor='#fca5a5' />
        <stop offset='50%' stopColor='#ef4444' />
        <stop offset='100%' stopColor='#991b1b' />
      </linearGradient>
      <filter id='sacCardGlow' x='-20%' y='-20%' width='140%' height='140%'>
        <feDropShadow dx='0' dy='0' stdDeviation='2.5' floodColor='#ef4444' floodOpacity='0.8' />
      </filter>
    </defs>
    <g filter='url(#sacCardGlow)'>
      <rect 
        x='2' 
        y='2' 
        width='28' 
        height='36' 
        rx='5' 
        fill='#180407' 
        stroke='url(#sacCardGrad)' 
        strokeWidth='1.6' 
        strokeDasharray='4 2'
      />
      <path d='M5 8V5H8M24 5H27V8M27 32V35H24M8 35H5V32' stroke='url(#sacCardGrad)' strokeWidth='1.4' strokeLinecap='round' />
      <path 
        d='M16 9C17.5 12 21 14.5 21 18C21 21.5 18.5 24 16 24C13.5 24 11 21.5 11 18C11 15 13.5 13 14 11C14.5 13 15.5 14 16 14C16.5 14 15 11 16 9Z' 
        fill='#3b060d' 
        stroke='url(#sacCardGrad)' 
        strokeWidth='1.2' 
      />
      <path d='M16 11V27M13 15H19M16 27L14.5 25M16 27L17.5 25' stroke='#ffffff' strokeWidth='1.4' strokeLinecap='round' strokeLinejoin='round' />
      <circle cx='16' cy='11' r='1.5' fill='url(#sacCardGrad)' stroke='#ffffff' strokeWidth='0.8' />
    </g>
  </svg>
);
