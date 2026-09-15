import React, { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { CheckCircle, Sparkles, Shield, User, Flame, Dices } from 'lucide-react';

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
      setError('Name must be 4-12 characters (English letters, numbers, or _)');
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
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#06080d] text-white flex flex-col justify-between overflow-x-hidden overflow-y-auto select-none pt-[max(64px,calc(env(safe-area-inset-top)+48px))] pb-[max(12px,env(safe-area-inset-bottom))] px-3 sm:px-6">
      {/* Dark fantasy atmospheric artwork & vignette background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 scale-105 pointer-events-none"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1534080537453-73130129759c?q=80&w=2070')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-[#0a0d14]/80 to-black/90 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(221,44,64,0.12)_0%,transparent_70%)] pointer-events-none" />

      {/* Decorative corner runes */}
      <div className="absolute top-2 left-3 text-[#ebd09b]/20 font-serif text-[10px] pointer-events-none">⟦Ω⟧</div>
      <div className="absolute top-2 right-3 text-[#ebd09b]/20 font-serif text-[10px] pointer-events-none">⟦Ω⟧</div>
      <div className="absolute bottom-2 left-3 text-[#ebd09b]/20 font-serif text-[10px] pointer-events-none">⟦Ω⟧</div>
      <div className="absolute bottom-2 right-3 text-[#ebd09b]/20 font-serif text-[10px] pointer-events-none">⟦Ω⟧</div>

      {/* Compact Header Bar - Positioned with safe clearance below Telegram's Close button */}
      <header className="relative z-10 w-full max-w-md mx-auto flex items-center justify-between pb-2 border-b border-[#ebd09b]/20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-600/40 via-red-950 to-black border border-red-500/70 flex items-center justify-center shadow-[0_0_12px_rgba(221,44,64,0.6)]">
            <span className="font-display font-bold text-[#dd2c40] text-xs">Ω</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-xs sm:text-sm tracking-wider text-white leading-tight">
              ENTER THE COVENANT
            </h1>
            <span className="text-[8.5px] font-mono text-[#ebd09b]/70 tracking-wider block">
              CHOOSE YOUR AVATAR & SEAL YOUR MONIKER
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[9px] font-mono text-amber-300 bg-amber-950/40 border border-amber-500/40 px-2 py-0.5 rounded-full">
          <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
          <span>REGISTRATION</span>
        </div>
      </header>

      {/* Main Form: Compact, fits on 1 screen without scrolling */}
      <form onSubmit={handleSubmit} className="relative z-10 flex-1 w-full max-w-md mx-auto my-auto py-2 flex flex-col justify-between gap-3 min-h-0">
        
        {/* SECTION 1: Avatar Selector (Single Horizontal Row of 4 Cards) */}
        <div className="bg-[#0b0f19]/90 border border-[#c5a880]/30 rounded-2xl p-2.5 backdrop-blur-md shadow-2xl flex flex-col gap-1.5 shrink-0">
          <div className="flex items-center justify-between pb-1 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#ebd09b]" />
              <span className="text-[10px] font-display font-bold tracking-wider text-[#ebd09b] uppercase">
                1. Choose Entity
              </span>
            </div>
            <span className="text-[9px] font-mono text-gray-300">
              <strong className="text-amber-300 font-bold">{currentAvatarObj.name}</strong> ({currentAvatarObj.role})
            </span>
          </div>

          {/* 4 Avatar Cards Row: All 4 visible side-by-side without vertical crowding */}
          <div className="grid grid-cols-4 gap-2 my-0.5 items-stretch">
            {AVATARS.map(avatar => {
              const isSelected = selectedAvatar === avatar.url;
              return (
                <div
                  key={avatar.id}
                  onClick={() => {
                    setSelectedAvatar(avatar.url);
                    triggerHaptic();
                  }}
                  className={`group relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 aspect-[3/4] flex flex-col justify-end p-1.5 bg-[#0c101a] shadow-md ${
                    isSelected
                      ? 'border-[#ebd09b] shadow-[0_0_15px_rgba(235,208,155,0.6)] ring-2 ring-[#ebd09b]/60 scale-[1.02] z-10'
                      : 'border-white/15 opacity-65 hover:opacity-100 hover:scale-[1.01]'
                  }`}
                >
                  <img 
                    src={avatar.url} 
                    alt={avatar.name} 
                    className="absolute inset-0 w-full h-full object-cover select-none" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
                  
                  {isSelected && (
                    <div className="absolute top-1 right-1 bg-[#ebd09b] text-black rounded-full p-0.5 shadow-md z-10">
                      <CheckCircle className="w-2.5 h-2.5" />
                    </div>
                  )}

                  <div className="relative z-10 text-left">
                    <span className="text-[8.5px] font-display font-bold text-white block leading-tight truncate drop-shadow">
                      {avatar.name}
                    </span>
                    <span className="text-[7.5px] font-mono text-[#ebd09b] block leading-none truncate">
                      {avatar.role}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Single line description of selected avatar */}
          <div className="text-[8.5px] font-mono text-gray-400 text-center bg-black/40 py-0.5 px-2 rounded-lg border border-white/5 truncate shrink-0">
            {currentAvatarObj.desc} • Used across PvP Arena & Profile
          </div>
        </div>

        {/* SECTION 2: Summoner Moniker (Native Standard Input + Quick Picks) */}
        <div className="bg-[#0b0f19]/90 border border-[#c5a880]/30 rounded-2xl p-2.5 backdrop-blur-md shadow-2xl flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between pb-1 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#ebd09b]" />
              <span className="text-[10px] font-display font-bold tracking-wider text-[#ebd09b] uppercase">
                2. Summoner Moniker
              </span>
            </div>
            <span className="text-[8.5px] font-mono text-gray-400">
              {username.length}/12 chars
            </span>
          </div>

          {/* Standard Native Input Box (No fake virtual keyboard modal) */}
          <div className="relative flex items-center bg-black/80 border-2 border-[#c5a880]/60 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/40 rounded-xl p-2 shadow-inner transition-all">
            <span className="text-amber-400 text-base ml-1 mr-2 select-none">👑</span>
            <div className="flex-1 min-w-0">
              <label className="text-[7.5px] font-mono text-zinc-400 block uppercase tracking-wider leading-none mb-0.5 select-none">
                LORD MONIKER (4-12 CHARS)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 12);
                  setUsername(cleaned);
                }}
                placeholder="Enter Moniker..."
                maxLength={12}
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck="false"
                className="w-full bg-transparent text-white font-display font-bold text-sm tracking-wider focus:outline-none placeholder-zinc-600 uppercase"
              />
            </div>

            {/* Random Dice Button */}
            <button
              type="button"
              onClick={rollNewName}
              title="Roll Random Moniker"
              className="px-2 py-1.5 rounded-lg bg-[#ebd09b]/20 hover:bg-[#ebd09b] text-[#ebd09b] hover:text-black border border-[#ebd09b]/40 font-mono text-[9.5px] font-bold flex items-center gap-1 cursor-pointer active:scale-95 transition-all shrink-0 ml-1.5"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Roll</span>
            </button>
          </div>

          {/* 1-Tap Quick-Pick Suggestions */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-mono text-gray-400 uppercase tracking-wider">
                Quick-Pick Names (Tap to choose):
              </span>
              <button
                type="button"
                onClick={rollNewSuggestions}
                className="text-[8px] font-mono text-[#ebd09b]/80 hover:text-[#ebd09b] cursor-pointer"
              >
                ↻ Refresh
              </button>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {tgSuggestedName && tgSuggestedName !== username && (
                <button
                  type="button"
                  onClick={() => {
                    setUsername(tgSuggestedName);
                    triggerHaptic();
                  }}
                  className="px-2 py-1 rounded-md bg-blue-950/70 border border-blue-500/50 text-blue-300 font-mono text-[9px] hover:bg-blue-900/60 cursor-pointer active:scale-95 transition-all font-bold"
                >
                  @{rawTgName}
                </button>
              )}
              {quickPicks.map((name, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setUsername(name);
                    triggerHaptic();
                  }}
                  className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-gray-300 hover:border-amber-400/50 hover:text-white font-mono text-[9px] cursor-pointer active:scale-95 transition-all"
                >
                  ⚔️ {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-950/80 border border-red-500/60 text-red-200 text-[10px] font-mono px-3 py-1.5 rounded-xl text-center shadow-lg animate-shake shrink-0">
            {error}
          </div>
        )}

        {/* SECTION 3: SEAL THE PACT SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={isSubmitting || username.length < 4}
          className="w-full py-3 bg-gradient-to-r from-[#c5a880] via-[#ebd09b] to-[#c5a880] text-black font-display font-black text-xs sm:text-sm tracking-widest uppercase rounded-xl shadow-[0_0_25px_rgba(235,208,155,0.4)] hover:shadow-[0_0_35px_rgba(235,208,155,0.7)] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>SEALING PACT...</span>
            </div>
          ) : (
            <>
              <Flame className="w-4 h-4 text-black animate-pulse" />
              <span>SEAL THE PACT ⚔️</span>
            </>
          )}
        </button>

      </form>

      {/* Subtle Footer Note */}
      <footer className="relative z-10 w-full max-w-md mx-auto text-center text-[8.5px] font-mono text-zinc-500 pb-1 shrink-0">
        The Void Covenant • Tactical Card RPG
      </footer>

    </div>
  );
};
