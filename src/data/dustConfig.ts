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
    name: 'Gothic Vial of Dust',
    dustAmount: 2500,
    shardCost: 15,
    image: '/shop/dust_orb_2500.png',
    description: 'An enchanted glass vial infused with swirling cyan void stardust.'
  },
  {
    id: 'dust_10000',
    name: 'Astral Reliquary Urn',
    dustAmount: 10000,
    shardCost: 55,
    image: '/shop/dust_urn_10000.png',
    badge: 'POPULAR',
    popular: true,
    description: 'A carved silver urn overflowing with luminous cosmic dust.'
  },
  {
    id: 'dust_25000',
    name: 'Ancient Void Core',
    dustAmount: 25000,
    shardCost: 120,
    image: '/shop/dust_core_25000.png',
    badge: 'BEST VALUE',
    description: 'A runic astrolabe nexus pulsating with concentrated void dust.'
  },
  {
    id: 'dust_50000',
    name: 'Primordial Chalice',
    dustAmount: 50000,
    shardCost: 220,
    image: '/shop/dust_nebula_50000.png',
    badge: 'SUPREME',
    description: 'A supreme starlight chalice releasing a boundless nebula storm.'
  }
];
