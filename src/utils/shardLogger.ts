import { PlayerProfile, ShardTransaction } from '../types';

export function recordShardTransaction(
  profile: PlayerProfile,
  action: ShardTransaction['action'],
  shardsChange: number,
  description: string,
  details?: Record<string, any>,
  status: 'SUCCESS' | 'FAILED' = 'SUCCESS'
): PlayerProfile {
  const shardsBefore = profile.darkShards || 0;
  const shardsAfter = Math.max(0, shardsBefore + shardsChange);

  const tx: ShardTransaction = {
    id: `stx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    action,
    shardsChange,
    shardsBefore,
    shardsAfter,
    description,
    details,
    status
  };

  // Keep the latest 100 transactions in profile history for audit & verification
  const updatedHistory = [tx, ...(profile.shardTransactions || [])].slice(0, 100);

  return {
    ...profile,
    darkShards: shardsAfter,
    shardTransactions: updatedHistory
  };
}