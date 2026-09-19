export const TELEGRAM_BOT_USERNAME = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TELEGRAM_BOT_USERNAME) || 'voidcovenantbot';

export const TELEGRAM_APP_NAME = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TELEGRAM_APP_NAME) || 'voidcovenant';

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
  const text = customText || 'Join Void Covenant! Sign up with my link to get +1,000 Gold starter bonus!';
  return `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`;
}
