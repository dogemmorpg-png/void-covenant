import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { CheckCircle, Sparkles, Shield, User, Flame } from 'lucide-react';

interface RegistrationScreenProps {
  onRegister: (username: string, avatarUrl: string) => Promise<{ success: boolean; message: string }>;
}

const AVATARS = [
  { id: 'knight', name: 'Death Knight', role: 'Vanguard', desc: 'Heavy armor & martial prowess', url: '/avatars/knight.webp' },
  { id: 'lich', name: 'Ancient Lich', role: 'Necromancer', desc: 'Dark sorcery & soul drain', url: '/avatars/lich.webp' },
  { id: 'vampire', name: 'Blood Mage', role: 'Sanguine', desc: 'Life leech & blood sacrifice', url: '/avatars/vampire.webp' },
  { id: 'rogue', name: 'Shadow Rogue', role: 'Assassin', desc: 'Critical strikes & stealth', url: '/avatars/rogue.webp' }
];

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onRegister }) => {
  const { publicKey } = useWallet();
  const tgUser = typeof window !== 'undefined' ? (window as any).Telegram?.WebApp?.initDataUnsafe?.user : null;
  const defaultUsername = publicKey 
    ? 'Sum_' + publicKey.toBase58().substring(0, 4) 
    : (tgUser?.username || '');

  const [username, setUsername] = useState(defaultUsername);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].url);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const res = await onRegister(trimmed, selectedAvatar);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.message);
    }
  };

  const currentAvatarObj = AVATARS.find(a => a.url === selectedAvatar) || AVATARS[0];

  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#06080d] text-white flex flex-col justify-between overflow-hidden select-none pt-[max(36px,env(safe-area-inset-top))] pb-[max(10px,env(safe-area-inset-bottom))] px-[max(16px,env(safe-area-inset-left))] pr-[max(16px,env(safe-area-inset-right))]">
      {/* Dark fantasy atmospheric artwork & vignette background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-25 scale-105 pointer-events-none"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1534080537453-73130129759c?q=80&w=2070')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-[#0a0d14]/75 to-black/90 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(221,44,64,0.15)_0%,transparent_70%)] pointer-events-none" />

      {/* Decorative corner runes */}
      <div className="absolute top-2 left-3 text-[#ebd09b]/25 font-serif text-[10px] pointer-events-none">⟦Ω⟧</div>
      <div className="absolute top-2 right-3 text-[#ebd09b]/25 font-serif text-[10px] pointer-events-none">⟦Ω⟧</div>
      <div className="absolute bottom-2 left-3 text-[#ebd09b]/25 font-serif text-[10px] pointer-events-none">⟦Ω⟧</div>
      <div className="absolute bottom-2 right-3 text-[#ebd09b]/25 font-serif text-[10px] pointer-events-none">⟦Ω⟧</div>

      {/* Compact Header Bar */}
      <header className="relative z-10 w-full flex items-center justify-between pb-2 border-b border-[#ebd09b]/20 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600/40 via-red-950 to-black border border-red-500/70 flex items-center justify-center shadow-[0_0_12px_rgba(221,44,64,0.6)]">
            <span className="font-display font-bold text-[#dd2c40] text-sm">Ω</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-sm tracking-widest text-white leading-tight">
              ENTER THE COVENANT
            </h1>
            <span className="text-[9px] font-mono text-[#ebd09b]/70 tracking-wider block">
              CHOOSE YOUR AVATAR AND SEAL YOUR MONIKER
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-300 bg-amber-950/40 border border-amber-500/40 px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>PACT CREATION</span>
        </div>
      </header>

      {/* Main Form: 2-Column Landscape */}
      <form onSubmit={handleSubmit} className="relative z-10 flex-1 w-full my-2 flex items-stretch gap-3.5 min-h-0">
        
        {/* Left Column: Avatar Grid (58% width) */}
        <div className="flex-[58] flex flex-col justify-between bg-[#0b0f19]/80 border border-[#c5a880]/30 rounded-2xl p-3 backdrop-blur-md shadow-2xl min-h-0">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#ebd09b]" />
              <span className="text-[11px] font-display font-bold tracking-wider text-[#ebd09b] uppercase">
                1. Choose Entity
              </span>
            </div>
            <span className="text-[10px] font-mono text-gray-300">
              Selected: <strong className="text-amber-300 font-bold">{currentAvatarObj.name}</strong> ({currentAvatarObj.role})
            </span>
          </div>

          {/* 4 Avatar Cards Row */}
          <div className="grid grid-cols-4 gap-2.5 my-auto py-2 h-full items-center">
            {AVATARS.map(avatar => {
              const isSelected = selectedAvatar === avatar.url;
              return (
                <div
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.url)}
                  className={`group relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 h-full max-h-[195px] aspect-[3/4] mx-auto flex flex-col justify-end p-2 ${
                    isSelected
                      ? 'border-[#ebd09b] shadow-[0_0_22px_rgba(235,208,155,0.6)] scale-[1.03] ring-1 ring-[#ebd09b]'
                      : 'border-white/15 opacity-65 hover:opacity-100 hover:border-white/40 hover:scale-[1.01]'
                  }`}
                >
                  <img 
                    src={avatar.url} 
                    alt={avatar.name} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 bg-[#ebd09b] text-black rounded-full p-0.5 shadow-md">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div className="relative z-10 text-left">
                    <span className="text-[10px] font-display font-bold text-white block leading-tight truncate">
                      {avatar.name}
                    </span>
                    <span className="text-[8.5px] font-mono text-[#ebd09b] block leading-tight truncate">
                      {avatar.role}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[9px] font-mono text-gray-400 text-center shrink-0">
            {currentAvatarObj.desc} • Used across PvP Arena and Profile
          </div>
        </div>

        {/* Right Column: Identity & Submit (42% width) */}
        <div className="flex-[42] flex flex-col justify-between bg-[#0b0f19]/80 border border-[#c5a880]/30 rounded-2xl p-3 backdrop-blur-md shadow-2xl min-h-0">
          <div className="flex items-center gap-1.5 pb-1.5 border-b border-white/10 shrink-0">
            <User className="w-4 h-4 text-[#ebd09b]" />
            <span className="text-[11px] font-display font-bold tracking-wider text-[#ebd09b] uppercase">
              2. Summoner Moniker
            </span>
          </div>

          <div className="space-y-2 my-auto">
            <label className="block text-[10px] font-mono text-gray-300 uppercase tracking-wider">
              Enter your Lord name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={12}
              required
              className="w-full bg-black/60 border border-[#c5a880]/60 focus:border-[#ebd09b] rounded-xl px-3.5 py-2 text-white font-display text-sm tracking-wider focus:outline-none focus:ring-1 focus:ring-[#ebd09b] focus:shadow-[0_0_15px_rgba(235,208,155,0.4)] transition-all"
              placeholder="Lord_Name..."
            />
            <span className="text-[9px] font-mono text-gray-400 block">
              4-12 characters • English letters, numbers, or _
            </span>

            {error && (
              <div className="bg-red-950/80 border border-red-500/60 text-red-200 text-[9px] p-2 rounded-lg font-mono flex items-center gap-1.5">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#ebd09b] via-[#f3dfb9] to-[#c5a880] hover:from-[#f3dfb9] hover:to-[#ebd09b] text-black font-display font-bold tracking-widest py-3 rounded-xl shadow-[0_0_25px_rgba(235,208,155,0.45)] transition-all transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs uppercase flex items-center justify-center gap-2 shrink-0"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>SEALING THE PACT...</span>
              </>
            ) : (
              <>
                <Flame className="w-4 h-4 text-black" />
                <span>SEAL THE PACT</span>
                <span>⚔️</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Footer */}
      <footer className="relative z-10 w-full text-center text-[8px] font-mono text-gray-500 shrink-0">
        The Void Covenant • Tactical Card RPG
      </footer>
    </div>
  );
};
