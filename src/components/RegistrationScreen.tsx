import React, { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { CheckCircle, Shield, User, Dices, PenLine, X } from 'lucide-react';

interface RegistrationScreenProps {
  onRegister: (username: string, avatarUrl: string) => Promise<{ success: boolean; message: string }>;
}

const AVATARS = [
  { id: 'knight', name: 'Death Knight', role: 'Vanguard', desc: 'Heavy armor & martial prowess', url: '/avatars/knight.webp' },
  { id: 'lich', name: 'Ancient Lich', role: 'Necromancer', desc: 'Dark sorcery & soul drain', url: '/avatars/lich.webp' },
  { id: 'vampire', name: 'Blood Mage', role: 'Sanguine', desc: 'Life leech & blood sacrifice', url: '/avatars/vampire.webp' },
  { id: 'rogue', name: 'Shadow Rogue', role: 'Assassin', desc: 'Critical strikes & stealth', url: '/avatars/rogue.webp' }
];

const FANTASY_PREFIXES = [
  'Void', 'Shadow', 'Grim', 'Dark', 'Dread', 'Blood', 'Night', 'Frost',
  'Doom', 'Soul', 'Abyss', 'Nether', 'Iron', 'Hex', 'Rune', 'Ash', 'Storm'
];

const FANTASY_SUFFIXES = [
  'Knight', 'Reaper', 'Walker', 'Blade', 'Lord', 'Warden', 'Mage', 'Fang',
  'Bane', 'Hunter', 'Shade', 'King', 'Claw', 'Priest', 'Guard', 'Weaver'
];

function generateRandomMoniker(): string {
  const p = FANTASY_PREFIXES[Math.floor(Math.random() * FANTASY_PREFIXES.length)];
  const s = FANTASY_SUFFIXES[Math.floor(Math.random() * FANTASY_SUFFIXES.length)];
  const name = `${p}_${s}`;
  return name.length > 12 ? name.substring(0, 12) : name;
}

function sanitizeName(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9_]/g, '');
  if (cleaned.length < 4) return (cleaned + '_lord').substring(0, 12);
  return cleaned.substring(0, 12);
}

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onRegister }) => {
  const { publicKey } = useWallet();
  const tg = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp : null;
  const tgUser = tg?.initDataUnsafe?.user;

  const rawTgName = tgUser?.username || tgUser?.first_name || '';
  const tgSuggestedName = rawTgName ? sanitizeName(rawTgName) : null;

  const defaultUsername = publicKey 
    ? 'Sum_' + publicKey.toBase58().substring(0, 4) 
    : (tgSuggestedName || generateRandomMoniker());

  const [username, setUsername] = useState(defaultUsername);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].url);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick suggestion chips
  const [quickPicks, setQuickPicks] = useState<string[]>(() => [
    generateRandomMoniker(),
    generateRandomMoniker(),
    generateRandomMoniker()
  ]);

  const triggerHaptic = useCallback(() => {
    try {
      tg?.HapticFeedback?.impactOccurred?.('light');
    } catch {}
  }, [tg]);

  const rollNewSuggestions = useCallback(() => {
    triggerHaptic();
    setQuickPicks([
      generateRandomMoniker(),
      generateRandomMoniker(),
      generateRandomMoniker()
    ]);
  }, [triggerHaptic]);

  const rollNewName = useCallback(() => {
    triggerHaptic();
    const newName = generateRandomMoniker();
    setUsername(newName);
  }, [triggerHaptic]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = username.trim();

    const usernameRegex = /^[a-zA-Z0-9_]{4,12}$/;
    if (!usernameRegex.test(trimmed)) {
      setError('Name must be 4-12 characters (letters, numbers, or _)');
      return;
    }

    setIsSubmitting(true);
    triggerHaptic();
    const res = await onRegister(trimmed, selectedAvatar);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.message);
    }
  };

  const currentAvatarObj = AVATARS.find(a => a.url === selectedAvatar) || AVATARS[0];

  return (
    <div 
      className="fixed inset-0 w-full h-[var(--app-height,100dvh)] bg-[#06080d] text-white overflow-x-hidden overflow-y-auto select-none px-3.5 md:px-6 py-4 md:py-8 flex flex-col items-center justify-center"
    >
      {/* Dark fantasy atmospheric artwork & vignette background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 scale-105 pointer-events-none"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1534080537453-73130129759c?q=80&w=2070')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-[#0a0d14]/80 to-black/90 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(221,44,64,0.12)_0%,transparent_70%)] pointer-events-none" />

      {/* Decorative corner runes */}
      <div className="absolute top-2 left-3 md:top-4 md:left-5 text-[#ebd09b]/20 font-display text-[10px] md:text-xs pointer-events-none">⟦Ω⟧</div>
      <div className="absolute top-2 right-3 md:top-4 md:right-5 text-[#ebd09b]/20 font-display text-[10px] md:text-xs pointer-events-none">⟦Ω⟧</div>
      <div className="absolute bottom-2 left-3 md:bottom-4 md:left-5 text-[#ebd09b]/20 font-display text-[10px] md:text-xs pointer-events-none">⟦Ω⟧</div>
      <div className="absolute bottom-2 right-3 md:bottom-4 md:right-5 text-[#ebd09b]/20 font-display text-[10px] md:text-xs pointer-events-none">⟦Ω⟧</div>

      {/* Main Container: Centered, balanced proportions for both mobile & desktop */}
      <div className="relative z-10 w-full max-w-md md:max-w-2xl my-auto flex flex-col gap-2.5 md:gap-3.5">
        
        {/* Header Bar */}
        <header className="w-full flex items-center justify-between pb-1.5 md:pb-2.5 border-b border-[#ebd09b]/20 shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-red-600/40 via-red-950 to-black border border-red-500/70 flex items-center justify-center shadow-[0_0_12px_rgba(221,44,64,0.6)]">
              <span className="font-display font-bold text-[#dd2c40] text-xs md:text-sm">Ω</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-xs sm:text-sm md:text-base tracking-wider text-white leading-tight">
                ENTER THE COVENANT
              </h1>
              <span className="text-[8px] md:text-[10px] font-mono text-[#ebd09b]/70 tracking-wider block">
                CHOOSE YOUR AVATAR & SEAL YOUR MONIKER
              </span>
            </div>
          </div>

          <div className="text-[8.5px] md:text-xs font-mono text-amber-300 bg-amber-950/40 border border-amber-500/40 px-2.5 md:px-3 py-0.5 md:py-1 rounded-full shrink-0">
            <span>REGISTRATION</span>
          </div>
        </header>

        {/* Main Form: Compact on mobile, spacious and readable on PC */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2.5 md:gap-3.5">
          
          {/* SECTION 1: Avatar Selector (Single Horizontal Row of 4 Cards) */}
          <div className="bg-[#0b0f19]/90 border border-[#c5a880]/30 rounded-2xl p-2.5 md:p-3.5 backdrop-blur-md shadow-2xl flex flex-col gap-1.5 md:gap-2.5 shrink-0">
            <div className="flex items-center justify-between pb-1 md:pb-1.5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-1.5 md:gap-2">
                <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#ebd09b]" />
                <span className="text-[10px] md:text-xs font-display font-bold tracking-wider text-[#ebd09b] uppercase">
                  1. Choose Entity
                </span>
              </div>
              <span className="text-[9px] md:text-xs font-mono text-gray-300">
                <strong className="text-amber-300 font-bold">{currentAvatarObj.name}</strong>
              </span>
            </div>

            {/* 4 Avatar Cards Row */}
            <div className="grid grid-cols-4 gap-2 md:gap-3 my-0.5 items-stretch">
              {AVATARS.map(avatar => {
                const isSelected = selectedAvatar === avatar.url;
                return (
                  <div
                    key={avatar.id}
                    onClick={() => {
                      setSelectedAvatar(avatar.url);
                      triggerHaptic();
                    }}
                    className={`group relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 aspect-[3/4] flex flex-col justify-end p-1.5 md:p-2 bg-[#0c101a] shadow-md ${
                      isSelected
                        ? 'border-[#ebd09b] shadow-[0_0_15px_rgba(235,208,155,0.6)] ring-2 ring-[#ebd09b]/60 scale-[1.02] z-10'
                        : 'border-white/15 opacity-65 hover:opacity-100 hover:scale-[1.01]'
                    }`}
                  >
                    <img 
                      src={avatar.url} 
                      alt={avatar.name} 
                      className="absolute inset-0 w-full h-full object-cover select-none group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
                    
                    {isSelected && (
                      <div className="absolute top-1 right-1 md:top-1.5 md:right-1.5 bg-[#ebd09b] text-black rounded-full p-0.5 md:p-1 shadow-md z-10">
                        <CheckCircle className="w-2.5 h-2.5 md:w-3 md:h-3" />
                      </div>
                    )}

                    <div className="relative z-10 text-left">
                      <span className="text-[8.5px] md:text-xs font-display font-bold text-white block leading-tight truncate drop-shadow">
                        {avatar.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 2: Summoner Moniker (Prominent Editable Input Field) */}
          <div className="bg-[#0b0f19]/90 border border-[#c5a880]/30 rounded-2xl p-2.5 md:p-3.5 backdrop-blur-md shadow-2xl flex flex-col gap-2 md:gap-2.5 shrink-0">
            <div className="flex items-center justify-between pb-1 md:pb-1.5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-1.5 md:gap-2">
                <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#ebd09b]" />
                <span className="text-[10px] md:text-xs font-display font-bold tracking-wider text-[#ebd09b] uppercase">
                  2. Summoner Moniker
                </span>
              </div>
              <span className="text-[8.5px] md:text-xs font-mono text-amber-300/80">
                {username.length}/12 chars
              </span>
            </div>

            {/* Clearly defined interactive text input box */}
            <div className="relative flex items-center bg-[#05070c] border-2 border-amber-500/60 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/40 rounded-xl px-2.5 md:px-3.5 py-2 md:py-2.5 shadow-inner transition-all">
              <div className="flex items-center gap-1.5 mr-2 shrink-0 select-none">
                <span className="text-amber-400 text-sm md:text-base">👑</span>
                <PenLine className="w-3.5 h-3.5 md:w-4 md:h-4 text-amber-400/80" />
              </div>

              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 12);
                    setUsername(cleaned);
                  }}
                  placeholder="Tap here to type your name..."
                  maxLength={12}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck="false"
                  className="w-full bg-transparent text-white font-mono font-bold text-sm md:text-base tracking-wider focus:outline-none placeholder-zinc-500 uppercase caret-amber-400"
                />
              </div>

              {username.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setUsername('');
                    triggerHaptic();
                  }}
                  className="p-1 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer shrink-0 ml-1"
                  title="Clear"
                >
                  <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              )}
            </div>

            {/* Explicit helper text stating you can type */}
            <div className="flex items-center justify-between text-[8px] md:text-[10px] font-mono text-zinc-400 px-0.5 -mt-0.5">
              <span>✏️ Tap field to enter custom name</span>
              <span>4-12 characters (A-Z, 0-9, _)</span>
            </div>

            {/* Alternative shortcuts: Roll Random & Telegram chip */}
            <div className="flex items-center gap-2 pt-0.5">
              <button
                type="button"
                onClick={rollNewName}
                className="flex-1 py-1.5 md:py-2 px-2 md:px-3 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-300 font-mono text-[9px] md:text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-sm"
              >
                <Dices className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-400" />
                <span>🎲 Roll Random</span>
              </button>

              {tgSuggestedName && (
                <button
                  type="button"
                  onClick={() => {
                    setUsername(tgSuggestedName);
                    triggerHaptic();
                  }}
                  className="flex-1 py-1.5 md:py-2 px-2 md:px-3 rounded-lg bg-blue-950/50 hover:bg-blue-900/60 border border-blue-500/40 text-blue-300 font-mono text-[9px] md:text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shadow-sm truncate"
                >
                  <span>📱 Use @{rawTgName}</span>
                </button>
              )}
            </div>

            {/* Quick picks suggestions row */}
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              <span className="text-[8px] md:text-[10px] font-mono text-zinc-500 uppercase tracking-wider shrink-0">
                Quick picks:
              </span>
              {quickPicks.map((name, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setUsername(name);
                    triggerHaptic();
                  }}
                  className="px-2 md:px-2.5 py-0.5 md:py-1 rounded-md bg-white/5 border border-white/10 text-gray-300 hover:border-amber-400/50 hover:text-amber-200 font-mono text-[8.5px] md:text-xs cursor-pointer active:scale-95 transition-all"
                >
                  ⚔️ {name}
                </button>
              ))}
              <button
                type="button"
                onClick={rollNewSuggestions}
                title="Refresh Suggestions"
                className="text-[8.5px] md:text-xs font-mono text-[#ebd09b]/70 hover:text-[#ebd09b] ml-auto cursor-pointer p-0.5"
              >
                ↻
              </button>
            </div>
          </div>

          {/* Error Notification */}
          {error && (
            <div className="bg-red-950/80 border border-red-500/60 text-red-200 text-[10px] md:text-xs font-mono px-3 py-1.5 rounded-xl text-center shadow-lg animate-shake shrink-0">
              {error}
            </div>
          )}

          {/* SECTION 3: SEAL THE PACT SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={isSubmitting || username.length < 4}
            className="w-full py-3.5 md:py-4 bg-gradient-to-r from-[#b3894a] via-[#f3d38c] to-[#b3894a] hover:from-[#c59a58] hover:via-[#fae1a2] hover:to-[#c59a58] text-[#1a0f05] font-display font-black text-xs sm:text-sm md:text-base tracking-[0.25em] uppercase rounded-xl shadow-[0_4px_20px_rgba(229,194,120,0.25)] hover:shadow-[0_4px_30px_rgba(229,194,120,0.45)] border border-[#ebd09b]/60 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer shrink-0 mt-1"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#1a0f05] border-t-transparent rounded-full animate-spin" />
                <span className="tracking-widest">SEALING PACT...</span>
              </div>
            ) : (
              <span className="tracking-[0.25em]">SEAL THE PACT</span>
            )}
          </button>

        </form>

        {/* Subtle Footer Note */}
        <footer className="w-full text-center text-[8px] md:text-[10px] font-mono text-zinc-500 pt-0.5 shrink-0">
          The Void Covenant • Tactical Card RPG
        </footer>

      </div>
    </div>
  );
};
