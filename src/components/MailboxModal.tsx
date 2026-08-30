import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { MailMessage } from '../types';
import { Mail, MailOpen, Gift, Check, Trash2, X, Sparkles, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { audioSystem } from '../utils/AudioSystem';

interface MailboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MailboxModal: React.FC<MailboxModalProps> = ({ isOpen, onClose }) => {
  const { profile, markMailAsRead, claimMailReward, claimAllMailRewards } = useGame();
  const toast = useToast();

  const messages: MailMessage[] = profile.mailMessages || [];
  const [selectedMailId, setSelectedMailId] = useState<string | null>(messages[0]?.id || null);
  const [isClaiming, setIsClaiming] = useState(false);

  if (!isOpen) return null;

  const selectedMail = messages.find(m => m.id === selectedMailId) || messages[0] || null;

  const unreadCount = messages.filter(m => !m.isRead).length;
  const unclaimedCount = messages.filter(m => m.rewards && !m.isClaimed).length;

  const handleSelectMail = (mail: MailMessage) => {
    audioSystem.playClick();
    setSelectedMailId(mail.id);
    if (!mail.isRead) {
      markMailAsRead(mail.id);
    }
  };

  const handleClaimSingle = async (mailId: string) => {
    if (isClaiming) return;
    setIsClaiming(true);
    try {
      audioSystem.playVictory();
      const res = await claimMailReward(mailId);
      if (res.success) {
        toast(res.message, 'success');
      } else {
        toast(res.message, 'error');
      }
    } catch (e: any) {
      toast(e.message || 'Failed to claim reward', 'error');
    } finally {
      setIsClaiming(false);
    }
  };

  const handleClaimAll = async () => {
    if (isClaiming || unclaimedCount === 0) return;
    setIsClaiming(true);
    try {
      audioSystem.playVictory();
      const res = await claimAllMailRewards();
      if (res.success) {
        toast(res.message, 'success');
      } else {
        toast(res.message, 'error');
      }
    } catch (e: any) {
      toast(e.message || 'Failed to claim all rewards', 'error');
    } finally {
      setIsClaiming(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#180a10] via-[#100508] to-[#0a0204] border border-[#ebd09b]/30 rounded-3xl shadow-[0_0_50px_rgba(221,44,64,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600/30 to-amber-500/20 border border-amber-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Mail className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-xl text-white tracking-wider text-shadow-gold">
                  VOID MAILBOX
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-600/80 border border-red-400 text-white font-mono text-[10px] font-bold shadow-[0_0_8px_rgba(220,38,38,0.8)] animate-pulse">
                    {unreadCount} NEW
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 font-mono tracking-tight">League reports, seasonal rewards & official decrees</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {unclaimedCount > 0 && (
              <button
                onClick={handleClaimAll}
                disabled={isClaiming}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black font-display font-black text-xs rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-black animate-spin" />
                <span>CLAIM ALL ({unclaimedCount})</span>
              </button>
            )}

            <button
              onClick={() => {
                audioSystem.playClick();
                onClose();
              }}
              className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Two-Pane Split View */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-[380px]">
          
          {/* Left Pane: Message List */}
          <div className="md:col-span-5 border-r border-white/10 overflow-y-auto max-h-[500px] divide-y divide-white/5 p-2 space-y-1">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center text-gray-500 px-4">
                <Mail className="w-12 h-12 text-gray-600 mb-3 opacity-40" />
                <p className="font-display font-bold text-gray-400 text-sm">Inbox is empty</p>
                <p className="text-xs text-gray-600 mt-1 max-w-xs">Participate in PvP seasons and finish in high leagues to receive reward decrees.</p>
              </div>
            ) : (
              messages.map((mail) => {
                const isSelected = selectedMail?.id === mail.id;
                const hasRewards = mail.rewards && (
                  (mail.rewards.gold || 0) > 0 ||
                  (mail.rewards.dust || 0) > 0 ||
                  (mail.rewards.darkShards || 0) > 0 ||
                  (mail.rewards.bloodSovereigns || 0) > 0 ||
                  (mail.rewards.cards && mail.rewards.cards.length > 0)
                );

                return (
                  <div
                    key={mail.id}
                    onClick={() => handleSelectMail(mail)}
                    className={`relative p-3.5 rounded-2xl cursor-pointer transition-all duration-200 flex items-start gap-3 ${
                      isSelected 
                        ? 'bg-gradient-to-r from-amber-500/20 to-red-900/20 border border-amber-500/40 shadow-inner' 
                        : 'bg-black/20 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {/* Status Icon */}
                    <div className="mt-0.5 shrink-0">
                      {hasRewards && !mail.isClaimed ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/30 to-red-500/20 border border-amber-400/60 flex items-center justify-center shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                          <Gift className="w-4 h-4 text-amber-300 animate-bounce" />
                        </div>
                      ) : mail.isRead ? (
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                          <MailOpen className="w-4 h-4 text-gray-400" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-red-600/30 border border-red-500/60 flex items-center justify-center shadow-[0_0_10px_rgba(220,38,38,0.4)]">
                          <Mail className="w-4 h-4 text-red-400" />
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-mono text-[10px] text-amber-400/80 font-bold uppercase tracking-wider truncate">
                          {mail.sender || 'Council of the Void'}
                        </span>
                        <span className="font-mono text-[9px] text-gray-500 whitespace-nowrap">
                          {new Date(mail.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className={`text-sm font-bold truncate ${mail.isRead ? 'text-gray-300' : 'text-white font-extrabold'}`}>
                        {mail.title}
                      </h4>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {mail.body}
                      </p>
                    </div>

                    {/* Right Tag */}
                    {hasRewards && !mail.isClaimed && (
                      <span className="self-center px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[9px] font-mono text-amber-300 font-bold">
                        GIFT
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Right Pane: Message Details */}
          <div className="md:col-span-7 p-6 overflow-y-auto max-h-[500px] flex flex-col justify-between bg-black/40">
            {selectedMail ? (
              <div className="space-y-6">
                {/* Letter Header */}
                <div className="border-b border-white/10 pb-4">
                  <div className="flex items-center justify-between text-xs text-gray-400 font-mono mb-2">
                    <span className="text-amber-400 font-bold tracking-wider uppercase">
                      FROM: {selectedMail.sender || 'The Void Council'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      {formatDate(selectedMail.createdAt)}
                    </span>
                  </div>
                  <h3 className="font-display font-black text-xl text-white text-shadow-gold">
                    {selectedMail.title}
                  </h3>
                </div>

                {/* Letter Body */}
                <div className="text-sm text-gray-300 leading-relaxed font-sans whitespace-pre-line bg-black/30 p-4 rounded-2xl border border-white/5 shadow-inner">
                  {selectedMail.body}
                </div>

                {/* Attached Rewards Section */}
                {selectedMail.rewards && (
                  <div className="space-y-3">
                    <h5 className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-400" />
                      Attached Rewards & Tributes
                    </h5>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {/* Blood Sovereigns */}
                      {(selectedMail.rewards.bloodSovereigns || 0) > 0 && (
                        <div className="flex flex-col items-center p-3 rounded-2xl bg-gradient-to-b from-amber-500/10 to-red-950/20 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                          <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-8 h-8 object-contain drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] mb-1" />
                          <span className="font-mono font-black text-sm text-amber-300">
                            +{selectedMail.rewards.bloodSovereigns}
                          </span>
                          <span className="font-mono text-[9px] text-amber-400/70 uppercase">SOVEREIGNS</span>
                        </div>
                      )}

                      {/* Gold */}
                      {(selectedMail.rewards.gold || 0) > 0 && (
                        <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-amber-500/20">
                          <img src="/icons/icon_gold.webp" alt="Gold" className="w-8 h-8 object-contain mb-1" />
                          <span className="font-mono font-bold text-sm text-amber-400">
                            +{selectedMail.rewards.gold}
                          </span>
                          <span className="font-mono text-[9px] text-gray-400 uppercase">GOLD</span>
                        </div>
                      )}

                      {/* Dust */}
                      {(selectedMail.rewards.dust || 0) > 0 && (
                        <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-cyan-500/20">
                          <img src="/icons/icon_dust.webp" alt="Dust" className="w-8 h-8 object-contain mb-1" />
                          <span className="font-mono font-bold text-sm text-[#66fcf1]">
                            +{selectedMail.rewards.dust}
                          </span>
                          <span className="font-mono text-[9px] text-gray-400 uppercase">DARK DUST</span>
                        </div>
                      )}

                      {/* Dark Shards */}
                      {(selectedMail.rewards.darkShards || 0) > 0 && (
                        <div className="flex flex-col items-center p-3 rounded-2xl bg-white/5 border border-red-500/20">
                          <img src="/icons/icon_shards.webp" alt="Shards" className="w-8 h-8 object-contain mb-1" />
                          <span className="font-mono font-bold text-sm text-rose-400">
                            +{selectedMail.rewards.darkShards}
                          </span>
                          <span className="font-mono text-[9px] text-gray-400 uppercase">SHARDS</span>
                        </div>
                      )}
                    </div>

                    {/* Claim Button */}
                    <div className="pt-2">
                      {selectedMail.isClaimed ? (
                        <div className="flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-2xl text-emerald-400 font-mono text-xs font-bold">
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span>REWARDS CLAIMED</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleClaimSingle(selectedMail.id)}
                          disabled={isClaiming}
                          className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black font-display font-black text-sm rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <Gift className="w-5 h-5 text-black" />
                          <span>CLAIM TRIBUTES & REWARDS</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <span>Select a letter from the left to read decrees</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};