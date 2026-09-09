export interface DustPackage {
  id: string;
  name: string;
  dustAmount: number;
  shardCost: number;
  image: string;
  badge?: string;
  popular?: boolean;
  description?: string;
}

export const DUST_PACKAGES: DustPackage[] = [
  {
    id: 'dust_2500',
    name: 'Wisp Orb of Dust',
    dustAmount: 2500,
    shardCost: 15,
    image: '/shop/dust_orb_2500.png',
    description: 'A swirling spherical manifestation of concentrated void souls.'
  },
  {
    id: 'dust_10000',
    name: 'Astral Dust Urn',
    dustAmount: 10000,
    shardCost: 55,
    image: '/shop/dust_urn_10000.png',
    badge: 'POPULAR',
    popular: true,
    description: 'An enchanted reliquary overflowing with crystalline ethereal dust.'
  },
  {
    id: 'dust_25000',
    name: 'Ancient Void Core',
    dustAmount: 25000,
    shardCost: 120,
    image: '/shop/dust_core_25000.png',
    badge: 'BEST VALUE',
    description: 'A pulsating celestial nexus brimming with raw arcane catalyst.'
  },
  {
    id: 'dust_50000',
    name: 'Primordial Nebula',
    dustAmount: 50000,
    shardCost: 220,
    image: '/shop/dust_nebula_50000.png',
    badge: 'SUPREME',
    description: 'A boundless cosmic storm of pure Primordial Void essence.'
  }
];
