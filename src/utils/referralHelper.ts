export const TELEGRAM_BOT_USERNAME = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TELEGRAM_BOT_USERNAME) || 'voidcovenantbot';

export const TELEGRAM_APP_NAME = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TELEGRAM_APP_NAME) || 'voidcovenant';

/**
 * Generates an anonymous, clean, collision-resistant 8-character referral code.
 * Excludes ambiguous characters (0, O, 1, l, I).
 */
export function generateReferralCode(): string {
  const chars = '23456789abcdefghjkmnpqrstuvwxyz';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Builds the referral link based on the user's platform.
 * - Telegram Mini App: https://t.me/<bot>/<app>?startapp=<referralCode>
 * - Web (PC and regular mobile browsers): https://<origin>?ref=<referralCode>
 */
export function getReferralLink(referralCode?: string, isTelegram?: boolean): string {
  const code = referralCode || '';
  if (isTelegram) {
    const bot = TELEGRAM_BOT_USERNAME.replace(/^@/, '');
    const app = TELEGRAM_APP_NAME;
    const cleanParam = encodeURIComponent(code);
    return `https://t.me/${bot}/${app}${cleanParam ? `?startapp=${cleanParam}` : ''}`;
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}?ref=${code}`;
}

/**
 * Generates the Telegram web share link.
 */
export function getTelegramShareUrl(referralLink: string, customText?: string): string {
  const text = customText || '⚔️ Void Covenant — Play-to-Earn Dark Fantasy Card RPG. Build your deck, battle in the Arena, withdraw Blood Sovereigns as USDT!\n\n🎁 Use my link to get +1,000 Gold starter bonus!';
  return `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
}
