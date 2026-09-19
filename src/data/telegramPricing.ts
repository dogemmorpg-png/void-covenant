export const TON_TREASURY_WALLET_ADDRESS = 
  (typeof process !== 'undefined' && process.env?.TON_TREASURY_WALLET_ADDRESS) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TON_TREASURY_WALLET_ADDRESS) ||
  'UQAd_yCFpQPo4X4j7t_junsrt8AZ3L35eUEEpy9uoPm3fRvS';

export const TONCENTER_API_KEY =
  (typeof process !== 'undefined' && process.env?.TONCENTER_API_KEY) ||
  '0ec3643506cf2ac24fc11bf8f9ad06ec4ceeedcb824fa71acb5e4be692a30e20';

// Official USDT Jetton Master Contract Address on TON Mainnet
export const USDT_JETTON_MASTER = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';

export interface TelegramPackage {
  id: string;
  name: string;
  shardsReward: number;
  dustBonus: number;
  starsCost: number;       // Telegram Stars (XTR)
  tonCost: number;         // TON (in TON units, e.g. 0.05)
  usdtCost: number;        // USDT on TON (in USDT units, e.g. 0.10)
  description: string;
  image: string;
  badge?: string;
  popular?: boolean;
}

// Low test pricing for seamless verification
export const TELEGRAM_PACKAGES: TelegramPackage[] = [
  {
    id: 'shards_micro',
    name: 'Pouch of Shards',
    shardsReward: 25,
    dustBonus: 0,
    starsCost: 1,
    tonCost: 0.05,
    usdtCost: 0.10,
    description: 'A modest pouch containing 25 pure Dark Shards.',
    image: '/shop/pouch_of_shards.png'
  },
  {
    id: 'shards_pouch',
    name: 'Dark Shard Chest',
    shardsReward: 85,
    dustBonus: 0,
    starsCost: 5,
    tonCost: 0.15,
    usdtCost: 0.30,
    popular: true,
    badge: 'POPULAR',
    description: 'A reinforced chest brimming with 85 Dark Shards.',
    image: '/shop/dark_shard_chest.png'
  },
  {
    id: 'shards_vault',
    name: 'Abyssal Treasury',
    shardsReward: 250,
    dustBonus: 0,
    starsCost: 15,
    tonCost: 0.40,
    usdtCost: 1.00,
    badge: 'BEST VALUE',
    description: 'A wealthy treasury trove holding 250 Dark Shards.',
    image: '/shop/abyssal_treasury.png'
  },
  {
    id: 'shards_overlord',
    name: 'Lord of the Void Vault',
    shardsReward: 700,
    dustBonus: 0,
    starsCost: 30,
    tonCost: 1.00,
    usdtCost: 2.50,
    badge: 'SUPREME',
    description: 'The ultimate royal vault granting 700 Dark Shards.',
    image: '/shop/void_overlord_vault.png'
  }
];
