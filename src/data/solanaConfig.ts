export const TREASURY_WALLET_ADDRESS = 
  (typeof process !== 'undefined' && process.env?.TREASURY_WALLET_ADDRESS) ||
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_TREASURY_WALLET_ADDRESS) ||
  'BxxQjEStvpcbWLbSnwL19rjbGmvND1J5pEBRShWFoYNr';

export const HELIUS_API_KEY = 'a53833dc-25c4-42e3-bdef-26901e8e84e9';
export const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;

// Primary & Fallback RPC endpoints for max reliability
export const SOLANA_RPC_ENDPOINTS = [
  HELIUS_RPC_URL,
  'https://solana-rpc.publicnode.com',
  'https://api.mainnet-beta.solana.com'
];

export const DEFAULT_RPC_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SOLANA_RPC_URL) ||
  HELIUS_RPC_URL;

export const SOLANA_NETWORK = 'mainnet-beta';

export interface SolanaPackage {
  id: string;
  name: string;
  solCost: number;
  shardsReward: number;
  dustBonus: number;
  description: string;
  image?: string;
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
    description: '',
    image: '/shop/pouch_of_shards.png'
  },
  {
    id: 'shards_pouch',
    name: 'Dark Shard Chest',
    solCost: 0.15,
    shardsReward: 85,
    dustBonus: 0,
    description: '',
    popular: true,
    badge: 'POPULAR',
    image: '/shop/dark_shard_chest.png'
  },
  {
    id: 'shards_vault',
    name: 'Abyssal Treasury',
    solCost: 0.40,
    shardsReward: 250,
    dustBonus: 0,
    description: '',
    badge: 'BEST VALUE',
    image: '/shop/abyssal_treasury.png'
  },
  {
    id: 'shards_overlord',
    name: 'Lord of the Void Vault',
    solCost: 1.00,
    shardsReward: 700,
    dustBonus: 0,
    description: '',
    badge: 'SUPREME',
    image: '/shop/void_overlord_vault.png'
  }
];
