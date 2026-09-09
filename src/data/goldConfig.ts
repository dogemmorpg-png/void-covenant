export interface GoldPackage {
  id: string;
  name: string;
  goldAmount: number;
  shardCost: number;
  image: string;
  badge?: string;
  popular?: boolean;
  description?: string;
}

export const GOLD_PACKAGES: GoldPackage[] = [
  {
    id: 'gold_5k',
    name: 'Pouch of Gold',
    goldAmount: 5000,
    shardCost: 20,
    image: '/shop/gold_pouch_5k_v2.png',
    description: 'A rustic leather pouch spilling ancient minted gold coins.'
  },
  {
    id: 'gold_25k',
    name: 'Sack of Gold',
    goldAmount: 25000,
    shardCost: 80,
    image: '/shop/gold_sack_25k_v2.png',
    badge: 'POPULAR',
    popular: true,
    description: 'A heavy velvet sack bursting with gold bars, coins, and jewels.'
  },
  {
    id: 'gold_50k',
    name: 'Gilded Treasure Chest',
    goldAmount: 50000,
    shardCost: 150,
    image: '/shop/gold_chest_50k_v2.png',
    badge: 'BEST VALUE',
    description: 'An ornate gothic chest overflowing with pure gold goblets and bullion.'
  },
  {
    id: 'gold_100k',
    name: 'Overlord Treasury Vault',
    goldAmount: 100000,
    shardCost: 275,
    image: '/shop/gold_vault_100k_v2.png',
    badge: 'SUPREME',
    description: 'A colossal imperial vault with mountains of pure gold ingots.'
  }
];
