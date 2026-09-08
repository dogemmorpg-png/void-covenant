import { PlayerProfile, SovereignTransaction } from '../types';

export function recordSovereignTransaction(
  profile: PlayerProfile,
  action: SovereignTransaction['action'],
  sovereignsChange: number,
  description: string,
  details?: Record<string, any>,
  status: 'SUCCESS' | 'FAILED' = 'SUCCESS',
  customTimestamp?: string | number
): PlayerProfile {
  const sovereignsBefore = profile.bloodSovereigns || 0;
  const sovereignsAfter = Math.max(0, sovereignsBefore + sovereignsChange);

  let formattedTimestamp = new Date().toISOString();
  if (customTimestamp) {
    if (typeof customTimestamp === 'number') {
      formattedTimestamp = new Date(customTimestamp).toISOString();
    } else {
      formattedTimestamp = customTimestamp;
    }
  }

  const tx: SovereignTransaction = {
    id: `svtx_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    timestamp: formattedTimestamp,
    action,
    sovereignsChange,
    sovereignsBefore,
    sovereignsAfter,
    description,
    details,
    status
  };

  // Keep the latest 100 transactions in profile history for audit & verification
  const updatedHistory = [tx, ...(profile.sovereignTransactions || [])].slice(0, 100);

  return {
    ...profile,
    bloodSovereigns: sovereignsAfter,
    sovereignTransactions: updatedHistory
  };
}
