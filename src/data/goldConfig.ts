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
    image: '/shop/gold_pouch_5k.jpg',
    description: 'A leather pouch filled with minted gold coins.'
  },
  {
    id: 'gold_25k',
    name: 'Sack of Gold',
    goldAmount: 25000,
    shardCost: 80,
    image: '/shop/gold_sack_25k.jpg',
    badge: 'POPULAR',
    popular: true,
    description: 'A heavy sack bursting with ancient gold coins and void essence.'
  },
  {
    id: 'gold_50k',
    name: 'Gilded Void Chest',
    goldAmount: 50000,
    shardCost: 150,
    image: '/shop/gold_chest_50k.png',
    badge: 'BEST VALUE',
    description: 'An ornate gothic treasure chest filled to the brim with gold.'
  },
  {
    id: 'gold_100k',
    name: 'Overlord Vault',
    goldAmount: 100000,
    shardCost: 275,
    image: '/shop/gold_vault_100k.png',
    badge: 'SUPREME',
    description: 'An immense hoard of pure gold from the Nether vaults.'
  }
];
