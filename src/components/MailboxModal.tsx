import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useToast } from './Toast';
import { MailMessage } from '../types';
import { Mail, MailOpen, Gift, Check, Trash2, X, Sparkles, AlertCircle, Clock, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';

interface MailboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MailboxModal: React.FC<MailboxModalProps> = ({ isOpen, onClose }) => {
  const { profile, markMailAsRead, claimMailReward, claimAllMailRewards, deleteMail } = useGame();
  const toast = useToast();

  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  const getMailTimestamp = (mail: any): number => {
    if (!mail) return Date.now();
    const raw = mail.createdAt ?? mail.date ?? mail.timestamp;
    if (typeof raw === 'number' && !isNaN(raw)) return raw;
    if (typeof raw === 'string') {
      const parsed = new Date(raw).getTime();
      if (!isNaN(parsed)) return parsed;
    }
    const matchTimestamp = mail.id?.match(/_(\d{10,13})/);
    if (matchTimestamp && matchTimestamp[1]) {
      const num = parseInt(matchTimestamp[1], 10);
      return num < 10000000000 ? num * 1000 : num;
    }
    return Date.now();
  };

  // Sort messages descending by creation timestamp
  const messages: MailMessage[] = [...(profile.mailMessages || [])].sort((a, b) => {
    return getMailTimestamp(b) - getMailTimestamp(a);
  });

  const [selectedMailId, setSelectedMailId] = useState<string | null>(messages[0]?.id || null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync selected mail when modal opens or if selected mail is no longer in messages
  React.useEffect(() => {
    if (isOpen) {
      setMobileView('list');
      if (messages.length > 0) {
        if (!selectedMailId || !messages.some(m => m.id === selectedMailId)) {
          setSelectedMailId(messages[0].id);
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedMail = messages.find(m => m.id === selectedMailId) || messages[0] || null;

  const unreadCount = messages.filter(m => !m.isRead).length;
  const unclaimedCount = messages.filter(m => m.rewards && !m.isClaimed).length;

  const handleSelectMail = (mail: MailMessage) => {
    if (isClaiming) return;
    setSelectedMailId(mail.id);
    // Only mark read if the letter has NO unclaimed rewards.
    // Letters with unclaimed rewards get marked read atomically when claimed,
    // avoiding race conditions with concurrent read_mail and claim_mail actions.
    if (!mail.isRead && (!mail.rewards || mail.isClaimed)) {
      markMailAsRead(mail.id);
    }
  };

  const handleDeleteMail = async (mailId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await deleteMail(mailId);
      if (res.success) {
        toast(res.message, 'success');
        if (selectedMailId === mailId) {
          const remaining = messages.filter(m => m.id !== mailId);
          setSelectedMailId(remaining[0]?.id || null);
        }
      } else {
        toast(res.message, 'error');
      }
    } catch (err: any) {
      toast(err.message || 'Failed to delete letter', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClaimSingle = async (mailId: string) => {
    if (isClaiming) return;
    setIsClaiming(true);
    try {
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

  const getMailBody = (mail: any): string => {
    if (!mail) return '';
    return mail.body || mail.content || mail.message || '';
  };

  const formatDate = (rawTime: any) => {
    const ts = typeof rawTime === 'number' ? rawTime : getMailTimestamp({ createdAt: rawTime });
    const d = new Date(ts);
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div 
      style={{
        paddingTop: 'max(var(--safe-top, 0px), calc(env(safe-area-inset-top, 0px) + 16px))',
        paddingBottom: 'max(var(--safe-bottom, 16px), calc(env(safe-area-inset-bottom, 0px) + 16px))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left, 0.75rem))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right, 0.75rem))'
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#180a10] via-[#100508] to-[#0a0204] border border-[#ebd09b]/30 rounded-3xl shadow-[0_0_50px_rgba(221,44,64,0.25)] overflow-hidden flex flex-col max-h-full my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Back button if reading decree */}
            {mobileView === 'detail' && (
              <button
                onClick={() => setMobileView('list')}
                className="md:hidden flex items-center gap-1 text-amber-300 hover:text-amber-200 font-mono text-xs font-bold py-1.5 px-2.5 rounded-xl bg-white/5 border border-amber-500/30 active:scale-95 transition-all shrink-0 mr-1"
                title="Back to decrees list"
              >
                <ChevronLeft className="w-4 h-4 text-amber-400" />
                <span>Back</span>
              </button>
            )}

            {/* Mail Icon (hidden on mobile when viewing detail to maximize room for title) */}
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-red-600/30 to-amber-500/20 border border-amber-500/40 items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] shrink-0 ${
              mobileView === 'detail' ? 'hidden md:flex' : 'flex'
            }`}>
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h2 className="font-display font-black text-sm sm:text-xl text-white tracking-wider text-shadow-gold truncate">
                  {mobileView === 'detail' ? 'DECREE DETAILS' : 'VOID MAILBOX'}
                </h2>
                {/* Unread badge: only shown in list view on mobile (or always on desktop) to avoid crowding letter header */}
                {unreadCount > 0 && mobileView === 'list' && (
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full bg-red-600/80 border border-red-400 text-white font-mono text-[9px] sm:text-[10px] font-bold shadow-[0_0_8px_rgba(220,38,38,0.8)] animate-pulse shrink-0 ${
                    unclaimedCount > 0 ? 'hidden min-[400px]:inline-block' : 'inline-block'
                  }`}>
                    {unreadCount} NEW
                  </span>
                )}
                {unreadCount > 0 && mobileView === 'detail' && (
                  <span className="hidden md:inline-block px-2 py-0.5 rounded-full bg-red-600/80 border border-red-400 text-white font-mono text-[10px] font-bold shadow-[0_0_8px_rgba(220,38,38,0.8)] animate-pulse shrink-0">
                    {unreadCount} NEW
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* CLAIM ALL: shown on desktop, and on mobile only when in list view */}
            {unclaimedCount > 0 && (
              <button
                onClick={handleClaimAll}
                disabled={isClaiming}
                className={`${
                  mobileView === 'detail' ? 'hidden md:flex' : 'flex'
                } items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black font-display font-black text-[10px] sm:text-xs rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50 shrink-0`}
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black animate-spin shrink-0" />
                <span>CLAIM ALL ({unclaimedCount})</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Responsive Master-Detail View */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-[360px] max-h-[75vh] md:max-h-[520px]">
          
          {/* Left Pane: Message List */}
          <div className={`md:col-span-5 border-r border-white/10 overflow-y-auto max-h-[75vh] md:max-h-[520px] p-2 space-y-1.5 ${
            mobileView === 'detail' ? 'hidden md:block' : 'block'
          }`}>
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

                const mailTimestamp = getMailTimestamp(mail);
                const mailBody = getMailBody(mail);

                return (
                  <div
                    key={mail.id}
                    onClick={() => {
                      handleSelectMail(mail);
                      setMobileView('detail');
                    }}
                    className={`relative p-3 sm:p-3.5 rounded-2xl cursor-pointer transition-all duration-200 flex items-start gap-2.5 sm:gap-3 ${
                      isSelected 
                        ? 'bg-gradient-to-r from-amber-500/20 to-red-900/20 border border-amber-500/40 shadow-inner' 
                        : 'bg-black/20 hover:bg-white/5 border border-white/5'
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
                        <span className="font-mono text-[9px] text-gray-500 whitespace-nowrap shrink-0">
                          {new Date(mailTimestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className={`text-xs sm:text-sm font-bold truncate ${mail.isRead ? 'text-gray-300' : 'text-white font-extrabold'}`}>
                        {mail.title}
                      </h4>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        {mailBody}
                      </p>

                      {/* Reward Chips Preview */}
                      {hasRewards && (
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {mail.isClaimed ? (
                            <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-[8.5px] font-mono text-gray-400">
                              CLAIMED
                            </span>
                          ) : (
                            <>
                              {(mail.rewards.bloodSovereigns || 0) > 0 && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 text-[8.5px] font-mono text-amber-300 font-bold">
                                  +{mail.rewards.bloodSovereigns} SOV
                                </span>
                              )}
                              {(mail.rewards.gold || 0) > 0 && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/15 border border-amber-500/30 text-[8.5px] font-mono text-amber-400">
                                  +{mail.rewards.gold} Gold
                                </span>
                              )}
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/40 text-[8.5px] font-mono text-amber-300 font-bold">
                                GIFT
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Tag and Delete */}
                    <div className="flex items-center gap-1 shrink-0 self-center">
                      <button
                        onClick={(e) => handleDeleteMail(mail.id, e)}
                        disabled={isDeleting}
                        title="Delete letter"
                        className="p-1 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer disabled:opacity-40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-gray-500 md:hidden" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Pane: Message Details */}
          <div className={`md:col-span-7 p-4 sm:p-6 overflow-y-auto max-h-[75vh] md:max-h-[520px] flex flex-col justify-between bg-black/40 ${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          }`}>
            {selectedMail ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Letter Header */}
                <div className="border-b border-white/10 pb-3 sm:pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-gray-400 font-mono mb-2">
                    <span className="text-amber-400 font-bold tracking-wider uppercase text-[11px] sm:text-xs">
                      FROM: {selectedMail.sender || 'Council of the Void'}
                    </span>
                    <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3">
                      <span className="flex items-center gap-1 text-[10.5px] sm:text-xs text-gray-400">
                        <Clock className="w-3 h-3 text-gray-500" />
                        {formatDate(getMailTimestamp(selectedMail))}
                      </span>
                      <button
                        onClick={(e) => {
                          handleDeleteMail(selectedMail.id, e);
                          setMobileView('list');
                        }}
                        disabled={isDeleting}
                        title="Delete letter"
                        className="p-1 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-sans"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                  <h3 className="font-display font-black text-lg sm:text-xl text-white text-shadow-gold leading-tight">
                    {selectedMail.title}
                  </h3>
                </div>

                {/* Letter Body */}
                <div className="text-xs sm:text-sm text-gray-200 leading-relaxed font-sans whitespace-pre-line bg-black/30 p-3.5 sm:p-4 rounded-2xl border border-white/5 shadow-inner">
                  {getMailBody(selectedMail)}
                </div>

                {/* Attached Rewards Section */}
                {selectedMail.rewards && (
                  <div className="space-y-3">
                    <h5 className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-400" />
                      Attached Rewards & Tributes
                    </h5>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                      {/* Blood Sovereigns */}
                      {(selectedMail.rewards.bloodSovereigns || 0) > 0 && (
                        <div className="flex flex-col items-center p-2.5 sm:p-3 rounded-2xl bg-gradient-to-b from-amber-500/10 to-red-950/20 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                          <img src="/icons/icon_sovereign.webp" alt="SOV" className="w-7 h-7 sm:w-8 sm:h-8 object-contain drop-shadow-[0_0_10px_rgba(245,158,11,0.6)] mb-1" />
                          <span className="font-mono font-black text-sm text-amber-300">
                            +{selectedMail.rewards.bloodSovereigns}
                          </span>
                          <span className="font-mono text-[9px] text-amber-400/70 uppercase font-bold">SOVEREIGNS</span>
                        </div>
                      )}

                      {/* Gold */}
                      {(selectedMail.rewards.gold || 0) > 0 && (
                        <div className="flex flex-col items-center p-2.5 sm:p-3 rounded-2xl bg-white/5 border border-amber-500/20">
                          <img src="/icons/icon_gold.webp" alt="Gold" className="w-7 h-7 sm:w-8 sm:h-8 object-contain mb-1" />
                          <span className="font-mono font-bold text-sm text-amber-400">
                            +{selectedMail.rewards.gold}
                          </span>
                          <span className="font-mono text-[9px] text-gray-400 uppercase font-bold">GOLD</span>
                        </div>
                      )}

                      {/* Dust */}
                      {(selectedMail.rewards.dust || 0) > 0 && (
                        <div className="flex flex-col items-center p-2.5 sm:p-3 rounded-2xl bg-white/5 border border-cyan-500/20">
                          <img src="/icons/icon_dust.webp" alt="Dust" className="w-7 h-7 sm:w-8 sm:h-8 object-contain mb-1" />
                          <span className="font-mono font-bold text-sm text-[#66fcf1]">
                            +{selectedMail.rewards.dust}
                          </span>
                          <span className="font-mono text-[9px] text-gray-400 uppercase font-bold">DARK DUST</span>
                        </div>
                      )}

                      {/* Dark Shards */}
                      {(selectedMail.rewards.darkShards || 0) > 0 && (
                        <div className="flex flex-col items-center p-2.5 sm:p-3 rounded-2xl bg-white/5 border border-red-500/20">
                          <img src="/icons/icon_shards.webp" alt="Shards" className="w-7 h-7 sm:w-8 sm:h-8 object-contain mb-1" />
                          <span className="font-mono font-bold text-sm text-rose-400">
                            +{selectedMail.rewards.darkShards}
                          </span>
                          <span className="font-mono text-[9px] text-gray-400 uppercase font-bold">SHARDS</span>
                        </div>
                      )}

                      {/* Void Peace Shield */}
                      {selectedMail.rewards.shieldType && (
                        <div className="flex flex-col items-center p-2.5 sm:p-3 rounded-2xl bg-white/5 border border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
                          <img 
                            src={selectedMail.rewards.shieldType === '6h' ? '/icons/shield_6h.png' : '/icons/shield_3h.png'} 
                            alt="Shield" 
                            className="w-7 h-7 sm:w-8 sm:h-8 object-contain mb-1 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" 
                          />
                          <span className="font-mono font-bold text-sm text-cyan-300">
                            +{selectedMail.rewards.shieldCount || 1}
                          </span>
                          <span className="font-mono text-[9px] text-cyan-400/80 uppercase font-bold">{selectedMail.rewards.shieldType} SHIELD</span>
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
                          className="w-full py-3.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-black font-display font-black text-xs sm:text-sm rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider"
                        >
                          {isClaiming ? (
                            <>
                              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-black animate-spin" />
                              <span>CLAIMING REWARDS...</span>
                            </>
                          ) : (
                            <>
                              <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                              <span>CLAIM TRIBUTES & REWARDS</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Mobile Back Button at bottom of letter */}
                <div className="md:hidden pt-2">
                  <button
                    onClick={() => setMobileView('list')}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-mono text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4 text-amber-400" />
                    <span>Back to Decrees List</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 py-12">
                <span>Select a letter from the left to read decrees</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};