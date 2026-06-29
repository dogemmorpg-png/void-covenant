import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle, Gift } from 'lucide-react';
import { audioSystem } from '../utils/AudioSystem';

// Types
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'reward';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
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
const toastStyles: Record<ToastType, { border: string; bg: string; icon: React.ReactNode; glow?: string }> = {
  success: {
    border: 'border-emerald-500/60',
    bg: 'bg-emerald-950/30',
    icon: <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />,
  },
  error: {
    border: 'border-[#dd2c40]/60',
    bg: 'bg-[#4e0707]/40',
    icon: <AlertCircle className="w-4 h-4 text-[#dd2c40] shrink-0" />,
  },
  warning: {
    border: 'border-[#c5a880]/60',
    bg: 'bg-amber-950/30',
    icon: <AlertTriangle className="w-4 h-4 text-[#ebd09b] shrink-0" />,
  },
  info: {
    border: 'border-[#66fcf1]/50',
    bg: 'bg-cyan-950/30',
    icon: <Info className="w-4 h-4 text-[#66fcf1] shrink-0" />,
  },
  reward: {
    border: 'border-[#b64dfa]/50',
    bg: 'bg-purple-950/30',
    icon: <Gift className="w-4 h-4 text-[#ebd09b] shrink-0" />,
    glow: 'shadow-[0_0_15px_rgba(182,77,250,0.25),0_0_30px_rgba(197,168,128,0.1)]',
  },
};

const MAX_TOASTS = 5;

// Provider
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const toast: ToastFn = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const newToast: Toast = { id, message, type, duration };

      if (type === 'error' || type === 'warning') {
        audioSystem.playError();
      }

      setToasts((prev) => {
        const next = [...prev, newToast];
        // Trim to max visible
        if (next.length > MAX_TOASTS) {
          const removed = next.shift();
          if (removed) {
            const timer = timersRef.current.get(removed.id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(removed.id);
            }
          }
        }
        return next;
      });

      // Auto dismiss
      const timer = setTimeout(() => {
        removeToast(id);
      }, duration);
      timersRef.current.set(id, timer);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container - top right */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-sm w-full">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const style = toastStyles[t.type];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 80, scale: 0.85 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                className={`
                  pointer-events-auto
                  flex items-start gap-2.5 
                  bg-[#0b0c10]/95 backdrop-blur-md
                  border ${style.border}
                  ${style.bg}
                  ${style.glow || ''}
                  rounded-xl p-3.5 pr-2.5
                  shadow-2xl
                  font-sans text-xs text-gray-200
                `}
              >
                {style.icon}
                <span className="flex-1 leading-relaxed pt-0.5">{t.message}</span>
                <button
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 p-1 rounded-lg hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors"
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
