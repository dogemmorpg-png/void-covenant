export interface ReferralMilestone {
  id: string;
  requiredSubscribers: number;
  rewardSovereigns: number;
  title: string;
}

export const REFERRAL_MILESTONES: ReferralMilestone[] = [
  { id: 'ref_sub_1', requiredSubscribers: 1, rewardSovereigns: 150, title: 'Initiate Patron' },
  { id: 'ref_sub_5', requiredSubscribers: 5, rewardSovereigns: 800, title: 'Vanguard Sponsor' },
  { id: 'ref_sub_10', requiredSubscribers: 10, rewardSovereigns: 2500, title: 'Legion Commander' },
  { id: 'ref_sub_25', requiredSubscribers: 25, rewardSovereigns: 6500, title: 'Baron of the Void' },
  { id: 'ref_sub_50', requiredSubscribers: 50, rewardSovereigns: 15000, title: 'Archon Recruiter' },
  { id: 'ref_sub_100', requiredSubscribers: 100, rewardSovereigns: 40000, title: 'Imperial Grandmaster' },
  { id: 'ref_sub_200', requiredSubscribers: 200, rewardSovereigns: 90000, title: 'Shadow Sovereign' },
  { id: 'ref_sub_500', requiredSubscribers: 500, rewardSovereigns: 230000, title: 'Covenant Highlord' },
  { id: 'ref_sub_1000', requiredSubscribers: 1000, rewardSovereigns: 500000, title: 'Demiurge of the Void' },
];
