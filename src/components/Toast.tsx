import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle, Sparkles } from 'lucide-react';

// Types
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'reward';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  count?: number;
  updatedAt?: number;
}

type ToastFn = (message: string, type?: ToastType, duration?: number) => void;

// Context
const ToastContext = createContext<ToastFn | null>(null);

// Hook
export const useToast = (): ToastFn => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};

// Style config per toast type
const toastStyles: Record<ToastType, { 
  border: string; 
  iconBg: string; 
  iconBorder: string; 
  icon: React.ReactNode; 
  badgeColor: string; 
  label: string; 
  glow: string; 
}> = {
  success: {
    border: 'border-emerald-500/70',
    iconBg: 'bg-emerald-950/80',
    iconBorder: 'border-emerald-500/50',
    icon: <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />,
    badgeColor: 'text-emerald-400',
    label: 'SUCCESS',
    glow: 'shadow-[0_4px_25px_rgba(16,185,129,0.3)]',
  },
  error: {
    border: 'border-rose-500/70',
    iconBg: 'bg-rose-950/80',
    iconBorder: 'border-rose-500/50',
    icon: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    badgeColor: 'text-rose-400',
    label: 'ERROR',
    glow: 'shadow-[0_4px_25px_rgba(244,63,94,0.3)]',
  },
  warning: {
    border: 'border-amber-500/70',
    iconBg: 'bg-amber-950/80',
    iconBorder: 'border-amber-500/50',
    icon: <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />,
    badgeColor: 'text-amber-300',
    label: 'NOTICE',
    glow: 'shadow-[0_4px_25px_rgba(245,158,11,0.3)]',
  },
  info: {
    border: 'border-cyan-500/70',
    iconBg: 'bg-cyan-950/80',
    iconBorder: 'border-cyan-500/50',
    icon: <Info className="w-4 h-4 text-cyan-300 shrink-0" />,
    badgeColor: 'text-cyan-300',
    label: 'INFO',
    glow: 'shadow-[0_4px_25px_rgba(6,182,212,0.3)]',
  },
  reward: {
    border: 'border-purple-500/70',
    iconBg: 'bg-purple-950/80',
    iconBorder: 'border-purple-500/50',
    icon: <Sparkles className="w-4 h-4 text-purple-300 shrink-0" />,
    badgeColor: 'text-purple-300',
    label: 'REWARD',
    glow: 'shadow-[0_4px_25px_rgba(168,85,247,0.35)]',
  },
};

// Provider
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Safe area top inset calculation for mobile / Telegram WebApp
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const toast: ToastFn = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 2400) => {
      if (!message) return;

      setToasts((prev) => {
        // 1. Smart deduplication & in-place update
        // Handles:
        // - Exact identical message repeated rapidly: "Need 1 skill point!" -> increment count "x2"
        // - Sequential upgrades of same talent: "Upgraded Void Strike (Lvl 1)!" -> update to "(Lvl 2)!" in-place
        // - Sequential sweeps: "Sweep Success! ..." -> updates in-place
        const isUpgrade = message.startsWith('Upgraded ');
        const isSweep = message.startsWith('Sweep Success!');
        const extractEntity = (msg: string) => msg.replace(/ \(Lvl \d+\)!?$/, '').replace(/^Upgraded /, '');

        const existingIdx = prev.findIndex((t) => {
          if (t.type !== type) return false;
          if (t.message === message) return true;
          if (isUpgrade && t.message.startsWith('Upgraded ')) {
            return extractEntity(t.message) === extractEntity(message);
          }
          if (isSweep && t.message.startsWith('Sweep Success!')) {
            return true;
          }
          return false;
        });

        if (existingIdx !== -1) {
          const existing = prev[existingIdx];
          const isSameText = existing.message === message;
          const updatedToast: Toast = {
            ...existing,
            message,
            duration,
            count: isSameText ? (existing.count || 1) + 1 : (existing.count || 1),
            updatedAt: Date.now(),
          };

          // Reset dismiss timer
          const oldTimer = timersRef.current.get(existing.id);
          if (oldTimer) clearTimeout(oldTimer);

          const newTimer = setTimeout(() => {
            removeToast(existing.id);
          }, duration);
          timersRef.current.set(existing.id, newTimer);

          const copy = [...prev];
          copy[existingIdx] = updatedToast;
          return copy;
        }

        // 2. Add as new toast with strict MAX_TOASTS limit (2 on mobile, 3 on desktop)
        const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        const newToast: Toast = {
          id,
          message,
          type,
          duration,
          count: 1,
          updatedAt: Date.now(),
        };

        const timer = setTimeout(() => {
          removeToast(id);
        }, duration);
        timersRef.current.set(id, timer);

        const maxVisible = isMobile ? 2 : 3;
        const next = [...prev, newToast];

        while (next.length > maxVisible) {
          const dropped = next.shift();
          if (dropped) {
            const oldT = timersRef.current.get(dropped.id);
            if (oldT) {
              clearTimeout(oldT);
              timersRef.current.delete(dropped.id);
            }
          }
        }

        return next;
      });
    },
    [removeToast, isMobile]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container - adaptive top & horizontal centering for mobile */}
      <div 
        style={{
          top: isMobile ? 'max(var(--safe-top, 0px), calc(env(safe-area-inset-top, 0px) + 12px))' : undefined
        }}
        className="fixed z-[9999] pointer-events-none flex flex-col items-center gap-2 left-3 right-3 sm:left-auto sm:right-4 sm:top-4 sm:max-w-sm sm:items-end w-auto max-w-md mx-auto sm:mx-0"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const style = toastStyles[t.type] || toastStyles.info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                onClick={() => removeToast(t.id)}
                className={`
                  pointer-events-auto
                  w-full
                  flex items-center gap-2.5 
                  bg-gradient-to-r from-[#141924]/98 via-[#0f141d]/98 to-[#0b0e14]/98
                  border-2 ${style.border}
                  ${style.glow}
                  rounded-2xl p-2.5 sm:p-3
                  shadow-[0_8px_30px_rgba(0,0,0,0.85)]
                  cursor-pointer
                  select-none
                  transition-transform active:scale-[0.98]
                `}
              >
                {/* Type Icon */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg} ${style.iconBorder} border shadow-inner`}>
                  {style.icon}
                </div>

                {/* Message Body */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-1.5 leading-none mb-1">
                    <span className={`text-[8.5px] font-mono font-black uppercase tracking-wider ${style.badgeColor}`}>
                      {style.label}
                    </span>
                    {t.count && t.count > 1 && (
                      <span className="font-mono text-[8px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/50 px-1.5 py-0.2 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.5)]">
                        ×{t.count}
                      </span>
                    )}
                  </div>
                  <div key={t.updatedAt} className="animate-toast-pop text-xs sm:text-[12.5px] text-gray-100 font-sans font-medium leading-snug break-words">
                    {t.message}
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeToast(t.id);
                  }}
                  className="shrink-0 w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/20 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
