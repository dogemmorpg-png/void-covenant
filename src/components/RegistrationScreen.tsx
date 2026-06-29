import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { CheckCircle } from 'lucide-react';

interface RegistrationScreenProps {
  onRegister: (username: string, avatarUrl: string) => void;
}

const AVATARS = [
  { id: 'knight', name: 'Death Knight', url: '/avatars/knight.png' },
  { id: 'lich', name: 'Ancient Lich', url: '/avatars/lich.png' },
  { id: 'vampire', name: 'Blood Mage', url: '/avatars/vampire.png' },
  { id: 'rogue', name: 'Shadow Rogue', url: '/avatars/rogue.png' }
];

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onRegister }) => {
  const { publicKey } = useWallet();
  const defaultUsername = publicKey ? 'Summoner_' + publicKey.toBase58().substring(0, 4) : '';
  const [username, setUsername] = useState(defaultUsername);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].url);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onRegister(username.trim(), selectedAvatar);
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center p-4 z-50">
      {/* Background styling */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534080537453-73130129759c?q=80&w=2070')] bg-cover bg-center opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40 pointer-events-none" />

      <div className="bg-[#151a21] border border-[#c5a880]/30 rounded-2xl p-6 md:p-10 max-w-xl w-full relative z-10 shadow-2xl gothic-glow">
        <div className="text-center space-y-4 mb-8">
          <h2 className="font-display font-black text-3xl text-white tracking-widest text-shadow-gold">
            ENTER THE COVENANT
          </h2>
          <p className="text-sm text-gray-400 font-sans">
            Choose your dark moniker and avatar to seal your pact with the Void.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="block text-xs font-mono font-bold text-[#ebd09b] uppercase tracking-widest">
              Summoner Name
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              required
              className="w-full bg-[#0b0c10] border border-[#c5a880]/50 rounded-lg p-3 text-white font-display text-lg focus:outline-none focus:border-[#c5a880] focus:shadow-[0_0_15px_rgba(197,168,128,0.3)] transition-all"
              placeholder="Enter your name..."
            />
          </div>

          <div className="space-y-4">
            <label className="block text-xs font-mono font-bold text-[#ebd09b] uppercase tracking-widest text-center">
              Choose Avatar
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                  <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1 text-center">
                    <span className="text-[9px] font-mono text-white block">{avatar.name}</span>
                  </div>
                  {selectedAvatar === avatar.url && (
                    <div className="absolute top-1 right-1 bg-black/60 rounded-full">
                      <CheckCircle className="w-4 h-4 text-[#ebd09b]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#ebd09b] hover:bg-[#c5a880] text-black font-display font-black tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(235,208,155,0.3)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            SEAL THE PACT
          </button>
        </form>
      </div>
    </div>
  );
};
