export const TREASURY_WALLET_ADDRESS = 
  (typeof process !== 'undefined' && process.env?.TREASURY_WALLET_ADDRESS) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TREASURY_WALLET_ADDRESS) ||
  'BxxQjEStvpcbWLbSnwL19rjbGmvND1J5pEBRShWFoYNr';

export const HELIUS_API_KEY = 'd5c11508-c979-443a-abf2-e6436747e764';

// Primary & Fallback RPC endpoints for max reliability
export const SOLANA_RPC_ENDPOINTS = [
  'https://solana-rpc.publicnode.com',
  'https://api.mainnet-beta.solana.com',
  `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
];

export const DEFAULT_RPC_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SOLANA_RPC_URL) ||
  'https://solana-rpc.publicnode.com';

export const SOLANA_NETWORK = 'mainnet-beta';

export interface SolanaPackage {
  id: string;
  name: string;
  solCost: number;
  shardsReward: number;
  dustBonus: number;
  description: string;
  badge?: string;
  popular?: boolean;
}

export const SOLANA_PACKAGES: SolanaPackage[] = [
  {
    id: 'shards_micro',
    name: 'Pouch of Shards',
    solCost: 0.05,
    shardsReward: 25,
    dustBonus: 0,
    description: 'Quick top-up for 1 booster pack.',
  },
  {
    id: 'shards_pouch',
    name: 'Dark Shard Chest',
    solCost: 0.15,
    shardsReward: 85,
    dustBonus: 100,
    description: 'Enough for an Obsidian pack + 15 shards.',
    popular: true,
    badge: 'POPULAR'
  },
  {
    id: 'shards_vault',
    name: 'Abyssal Treasury',
    solCost: 0.40,
    shardsReward: 250,
    dustBonus: 350,
    description: 'Supreme horde. Guaranteed to summon high-tier lords.',
    badge: 'BEST VALUE'
  },
  {
    id: 'shards_overlord',
    name: 'Lord of the Void Vault',
    solCost: 1.00,
    shardsReward: 700,
    dustBonus: 1000,
    description: 'Massive hoard of Dark Shards + 1,000 Dark Dust bonus.',
    badge: 'SUPREME'
  }
];
