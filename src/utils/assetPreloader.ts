import { CARD_TEMPLATES } from '../data/cards';

// In-memory cache to prevent duplicate requests
const preloadedUrls = new Set<string>();
let isGlobalPreloadStarted = false;

// Core UI icons, avatars, shop assets, and pack covers that should be instant
const CORE_UI_ASSETS = [
  // Packs & Chests (Summoning Portal)
  '/packs/pack_bronze.webp',
  '/packs/pack_obsidian.webp',
  '/packs/pack_abyssal.webp',
  '/packs/chest_basic.webp',
  '/packs/chest_rare.webp',
  '/packs/chest_premium.webp',

  // Shop Modals & Packages
  '/shop/pouch_of_shards.png',
  '/shop/dark_shard_chest.png',
  '/shop/abyssal_treasury.png',
  '/shop/void_overlord_vault.png',

  // Core Badges & Icons
  '/icons/crown.png',
  '/icons/ticket.png',
  '/icons/icon_gold.webp',
  '/icons/icon_dust.webp',
  '/icons/icon_shards.webp',
  '/icons/arena_duel_emblem.png',
  '/icons/league_bronze.png',
  '/icons/league_silver.png',
  '/icons/league_gold.png',
  '/icons/league_platinum.png',
  '/icons/league_diamond.png',
  '/icons/league_void_overlord.png',
  '/avatars/knight.webp',
  '/avatars/vampire.webp',
  '/avatars/lich.webp',
  '/avatars/rogue.webp'
];

/**
 * Preloads a single image and caches it in browser memory
 */
export const preloadImage = (url: string): Promise<boolean> => {
  if (!url || typeof url !== 'string') {
    return Promise.resolve(true);
  }
  if (preloadedUrls.has(url)) {
    return Promise.resolve(true);
  }

  // Mark as requested immediately to prevent any duplicate network requests
  preloadedUrls.add(url);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * Preload assets with controlled concurrency (6 parallel streams)
 */
export const preloadPool = async (urls: string[], concurrency = 6): Promise<void> => {
  const pending = urls.filter(u => u && !preloadedUrls.has(u));
  if (pending.length === 0) return;

  let index = 0;
  const workers = Array(Math.min(concurrency, pending.length)).fill(0).map(async () => {
    while (index < pending.length) {
      const currentUrl = pending[index++];
      if (currentUrl) {
        await preloadImage(currentUrl);
      }
    }
  });

  await Promise.allSettled(workers);
};

/**
 * Helper to get reliable card image URL
 */
export const getCardImageUrl = (card: any): string => {
  if (!card) return '/cards/skeleton_warrior.webp';
  if (card.image && typeof card.image === 'string' && card.image.startsWith('/cards/')) {
    return card.image;
  }
  const template = CARD_TEMPLATES.find(t => t.baseId === card.baseId);
  if (template?.image) {
    return template.image;
  }
  return `/cards/${card.baseId || 'skeleton_warrior'}.webp`;
};

/**
 * Asset Preloader Controller
 */
export const assetPreloader = {
  /**
   * Preload core UI icons and avatars instantly
   */
  preloadCoreUI: async () => {
    await preloadPool(CORE_UI_ASSETS, 6);
  },

  /**
   * Preload active player deck cards instantly
   */
  preloadPlayerDeck: async (deckCards: any[]) => {
    if (!deckCards || deckCards.length === 0) return;
    const urls = deckCards.map(getCardImageUrl).filter(Boolean);
    if (urls.length > 0) {
      await preloadPool(urls, 6);
    }
  },

  /**
   * Preload an opponent's deck or campaign enemy cards before battle starts
   */
  preloadBattleCreatures: async (creatures: any[]) => {
    if (!creatures || creatures.length === 0) return;
    const urls = creatures.map(getCardImageUrl).filter(Boolean);
    if (urls.length > 0) {
      await preloadPool(urls, 6);
    }
  },

  /**
   * Preload all game card images progressively in the background
   */
  preloadAllGameCardsBackground: () => {
    if (isGlobalPreloadStarted) return;
    isGlobalPreloadStarted = true;

    const cardUrls = CARD_TEMPLATES
      .map(c => c.image)
      .filter((img): img is string => typeof img === 'string' && img.startsWith('/cards/'));
    
    preloadPool(cardUrls, 6);
  },

  /**
   * Check if an image is already preloaded in memory
   */
  isPreloaded: (url: string) => preloadedUrls.has(url),

  getCardImageUrl
};