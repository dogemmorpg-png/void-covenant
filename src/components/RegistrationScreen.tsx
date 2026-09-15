import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { CheckCircle, Sparkles, Shield, User } from 'lucide-react';

interface RegistrationScreenProps {
  onRegister: (username: string, avatarUrl: string) => Promise<{ success: boolean; message: string }>;
}

const AVATARS = [
  { id: 'knight', name: 'Death Knight', role: 'Vanguard Warrior', url: '/avatars/knight.webp' },
  { id: 'lich', name: 'Ancient Lich', role: 'Necromancer Lord', url: '/avatars/lich.webp' },
  { id: 'vampire', name: 'Blood Mage', role: 'Sanguine Sorceress', url: '/avatars/vampire.webp' },
  { id: 'rogue', name: 'Shadow Rogue', role: 'Void Assassin', url: '/avatars/rogue.webp' }
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
    <div className="fixed inset-0 w-full h-full min-h-screen bg-[#07090e] text-white flex flex-col justify-between overflow-y-auto select-none pt-12 sm:pt-4 pb-4 px-3 sm:px-6">
      {/* Background artwork & occult atmospheric layers */}
      <div 
        className="fixed inset-0 bg-cover bg-center opacity-25 scale-105 pointer-events-none"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1534080537453-73130129759c?q=80&w=2070')` }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-[#07090e]/90 via-[#0a0d14]/80 to-[#07090e]/95 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(235,208,155,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Header Bar with ample clearance from Telegram top buttons */}
      <header className="relative z-10 w-full max-w-4xl mx-auto flex items-center justify-between py-2 border-b border-[#ebd09b]/20 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600/30 to-black border border-red-500/60 flex items-center justify-center shadow-[0_0_12px_rgba(221,44,64,0.5)]">
            <span className="font-display font-black text-[#dd2c40] text-sm">Ω</span>
          </div>
          <div>
            <h1 className="font-display font-black text-base sm:text-lg tracking-widest text-white text-shadow-gold leading-tight">
              ENTER THE COVENANT
            </h1>
            <p className="text-[9px] sm:text-[10px] text-[#ebd09b]/70 font-mono tracking-wider">
              SEAL YOUR SOUL WITH THE VOID
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-300/80 bg-amber-950/40 border border-amber-500/30 px-3 py-1 rounded-full">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span className="hidden sm:inline">CHARACTER CREATION</span>
          <span className="sm:hidden">PACT</span>
        </div>
      </header>

      {/* Main Container: Form */}
      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-4xl mx-auto my-auto py-3 flex flex-col md:flex-row items-stretch gap-4">
        
        {/* Avatar Section */}
        <div className="flex-1 bg-[#10141d]/80 border border-[#c5a880]/30 rounded-2xl p-3.5 sm:p-4 backdrop-blur-md shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#ebd09b]" />
              <span className="text-xs font-display font-black tracking-wider text-[#ebd09b] uppercase">
                1. SELECT YOUR ENTITY
              </span>
            </div>
            <span className="text-[10px] font-mono text-gray-400">
              <strong className="text-amber-300 font-bold">{currentAvatarObj.name}</strong>
            </span>
          </div>

          {/* 4 Avatar Cards Grid (2x2 on portrait / 4x1 on wide) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3">
            {AVATARS.map(avatar => {
              const isSelected = selectedAvatar === avatar.url;
              return (
                <div
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.url)}
                  className={`group relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 aspect-[4/5] flex flex-col justify-end p-2 ${
                    isSelected
                      ? 'border-[#ebd09b] shadow-[0_0_22px_rgba(235,208,155,0.7)] scale-[1.03] bg-gradient-to-t from-black via-black/40 to-transparent'
                      : 'border-white/15 opacity-70 hover:opacity-100 hover:border-white/40 hover:scale-[1.01]'
                  }`}
                >
                  <img 
                    src={avatar.url} 
                    alt={avatar.name} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 bg-black/80 rounded-full p-0.5 shadow-md">
                      <CheckCircle className="w-4 h-4 text-[#ebd09b]" />
                    </div>
                  )}

                  <div className="relative z-10 text-left">
                    <span className="text-[11px] font-display font-black text-white block leading-tight drop-shadow-md">
                      {avatar.name}
                    </span>
                    <span className="text-[8.5px] font-mono text-[#ebd09b]/80 block leading-tight truncate">
                      {avatar.role}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[9px] font-mono text-gray-400 text-center">
            Avatar determines your emblem across PvP leaderboards and arena duels
          </p>
        </div>

        {/* Identity & Submit Section */}
        <div className="md:w-80 bg-[#10141d]/80 border border-[#c5a880]/30 rounded-2xl p-4 backdrop-blur-md shadow-2xl flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-1.5 pb-2 border-b border-white/10">
            <User className="w-4 h-4 text-[#ebd09b]" />
            <span className="text-xs font-display font-black tracking-wider text-[#ebd09b] uppercase">
              2. SUMMONER NAME
            </span>
          </div>

          <div className="space-y-2 my-auto">
            <label className="block text-[10px] font-mono text-gray-300 uppercase tracking-wider">
              Enter your Lord identifier
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={12}
              required
              className="w-full bg-[#05070a] border border-[#c5a880]/60 focus:border-[#ebd09b] rounded-xl px-3.5 py-2.5 text-white font-display text-base tracking-wider focus:outline-none focus:shadow-[0_0_15px_rgba(235,208,155,0.4)] transition-all"
              placeholder="Lord_Name..."
            />
            <span className="text-[9px] font-mono text-gray-400 block">
              4-12 characters • Latin letters, 0-9, underscore
            </span>

            {error && (
              <div className="bg-red-950/70 border border-red-500/50 text-red-200 text-[10px] p-2.5 rounded-lg font-mono flex items-center gap-1.5 animate-in fade-in">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#ebd09b] via-[#f3dfb9] to-[#c5a880] hover:from-[#f3dfb9] hover:to-[#ebd09b] text-black font-display font-black tracking-widest py-3.5 rounded-xl shadow-[0_0_22px_rgba(235,208,155,0.4)] transition-all transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs sm:text-sm uppercase flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>SEALING THE PACT...</span>
              </>
            ) : (
              <>
                <span>SEAL THE PACT</span>
                <span className="text-sm">⚔️</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Footer info */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto py-1 text-center text-[9px] font-mono text-gray-500 shrink-0">
        Void Covenant • Authoritative Web3 Tactical Card RPG
      </footer>
    </div>
  );
};
