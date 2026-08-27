import { CARD_TEMPLATES } from '../data/cards';

// In-memory cache to prevent duplicate requests
const preloadedUrls = new Set<string>();

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
  if (!url || typeof url !== 'string' || preloadedUrls.has(url)) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      preloadedUrls.add(url);
      resolve(true);
    };
    img.onerror = () => {
      preloadedUrls.add(url);
      resolve(false);
    };
    img.src = url;
  });
};

/**
 * Preload high-priority assets immediately in parallel
 */
export const preloadHighPriority = async (urls: string[]): Promise<void> => {
  const uniqueUrls = urls.filter(u => u && !preloadedUrls.has(u));
  if (uniqueUrls.length === 0) return;
  
  await Promise.allSettled(uniqueUrls.map(u => preloadImage(u)));
};

/**
 * Preload background assets in fast smooth batches
 */
export const preloadIdleQueue = (urls: string[], batchSize = 10) => {
  const pendingUrls = urls.filter(u => u && !preloadedUrls.has(u));
  if (pendingUrls.length === 0) return;

  let index = 0;

  const processNextBatch = () => {
    const batch = pendingUrls.slice(index, index + batchSize);
    index += batchSize;

    if (batch.length > 0) {
      Promise.allSettled(batch.map(u => preloadImage(u))).then(() => {
        if (index < pendingUrls.length) {
          setTimeout(processNextBatch, 30);
        }
      });
    }
  };

  setTimeout(processNextBatch, 10);
};

/**
 * Asset Preloader Controller
 */
export const assetPreloader = {
  /**
   * Preload core UI icons and avatars instantly
   */
  preloadCoreUI: async () => {
    await preloadHighPriority(CORE_UI_ASSETS);
  },

  /**
   * Preload active player deck cards instantly
   */
  preloadPlayerDeck: async (deckCards: any[]) => {
    if (!deckCards || deckCards.length === 0) return;
    const urls: string[] = [];
    for (const card of deckCards) {
      if (card?.image && typeof card.image === 'string') {
        urls.push(card.image);
      }
    }
    if (urls.length > 0) {
      await preloadHighPriority(urls);
    }
  },

  /**
   * Preload an opponent's deck or campaign enemy cards before battle starts
   */
  preloadBattleCreatures: async (creatures: any[]) => {
    if (!creatures || creatures.length === 0) return;
    const urls: string[] = [];
    for (const c of creatures) {
      if (c?.image && typeof c.image === 'string') {
        urls.push(c.image);
      }
    }
    if (urls.length > 0) {
      await preloadHighPriority(urls);
    }
  },

  /**
   * Preload all 99 game card images quietly in the background without lag
   */
  preloadAllGameCardsBackground: () => {
    const cardUrls = CARD_TEMPLATES
      .map(c => c.image)
      .filter((img): img is string => typeof img === 'string' && img.startsWith('/cards/'));
    
    preloadIdleQueue(cardUrls, 4);
  },

  /**
   * Check if an image is already preloaded in memory
   */
  isPreloaded: (url: string) => preloadedUrls.has(url)
};