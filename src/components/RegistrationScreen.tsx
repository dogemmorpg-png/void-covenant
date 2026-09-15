import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { CheckCircle } from 'lucide-react';

interface RegistrationScreenProps {
  onRegister: (username: string, avatarUrl: string) => Promise<{ success: boolean; message: string }>;
}

const AVATARS = [
  { id: 'knight', name: 'Death Knight', url: '/avatars/knight.webp' },
  { id: 'lich', name: 'Ancient Lich', url: '/avatars/lich.webp' },
  { id: 'vampire', name: 'Blood Mage', url: '/avatars/vampire.webp' },
  { id: 'rogue', name: 'Shadow Rogue', url: '/avatars/rogue.webp' }
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
      setError('Name must be 4-12 characters long and contain only English letters, numbers, or underscores.');
      return;
    }

    setIsSubmitting(true);
    const res = await onRegister(trimmed, selectedAvatar);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      {/* Background styling */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534080537453-73130129759c?q=80&w=2070')] bg-cover bg-center opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40 pointer-events-none" />

      <div className="bg-[#151a21] border border-[#c5a880]/30 rounded-2xl p-4 sm:p-6 md:p-8 max-w-xl w-full relative z-10 shadow-2xl gothic-glow max-h-[96vh] overflow-y-auto">
        <div className="text-center space-y-1 sm:space-y-2 mb-4 sm:mb-6">
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white tracking-widest text-shadow-gold">
            ENTER THE COVENANT
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 font-sans">
            Choose your dark moniker and avatar to seal your pact with the Void.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-1.5 sm:space-y-2">
            <label className="block text-[11px] sm:text-xs font-mono font-bold text-[#ebd09b] uppercase tracking-widest">
              Summoner Name (4-12 chars, English, 0-9, _)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={12}
              required
              className="w-full bg-[#0b0c10] border border-[#c5a880]/50 rounded-lg px-3 py-2 sm:py-2.5 text-white font-display text-base sm:text-lg focus:outline-none focus:border-[#c5a880] focus:shadow-[0_0_15px_rgba(197,168,128,0.3)] transition-all"
              placeholder="Enter your name..."
            />
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-200 text-xs p-2.5 rounded-lg flex items-center gap-2 font-mono">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="space-y-2 sm:space-y-3">
            <label className="block text-[11px] sm:text-xs font-mono font-bold text-[#ebd09b] uppercase tracking-widest text-center">
              Choose Avatar
            </label>
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5">
              {AVATARS.map(avatar => (
                <div
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.url)}
                  className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-300 aspect-square ${
                    selectedAvatar === avatar.url 
                      ? 'border-[#ebd09b] shadow-[0_0_20px_rgba(235,208,155,0.4)] scale-105' 
                      : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                  }`}
                >
                  <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/75 p-0.5 sm:p-1 text-center">
                    <span className="text-[8px] sm:text-[9px] font-mono text-white block truncate">{avatar.name}</span>
                  </div>
                  {selectedAvatar === avatar.url && (
                    <div className="absolute top-1 right-1 bg-black/60 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ebd09b]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#ebd09b] hover:bg-[#c5a880] text-black font-display font-black tracking-widest py-3 sm:py-3.5 rounded-xl shadow-[0_0_20px_rgba(235,208,155,0.3)] transition-all transform hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs sm:text-sm uppercase"
          >
            {isSubmitting ? 'SEALING THE PACT...' : 'SEAL THE PACT'}
          </button>
        </form>
      </div>
    </div>
  );
};
