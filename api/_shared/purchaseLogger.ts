// @ts-nocheck
import { SupabaseClient } from '@supabase/supabase-js';

export interface PurchaseLogEntry {
  walletAddress: string;
  packageId: string;
  currency: 'SOL' | 'TON' | 'USDT' | 'XTR';
  amount: number;
  shards: number;
  signature: string;
  provider: 'solana' | 'ton' | 'stars';
  status?: string;
}

/**
 * Records a verified purchase to the Supabase `purchases` table.
 * Uses the proven base schema (wallet_address, package_id, sol_amount, shards_amount, signature, status).
 */
export async function logPurchaseToDatabase(
  supabase: SupabaseClient,
  entry: PurchaseLogEntry
): Promise<boolean> {
  try {
    if (!supabase || !entry.signature) return false;

    // Check if signature already logged in purchases table to prevent duplicate rows
    const { data: existing } = await supabase
      .from('purchases')
      .select('id')
      .eq('signature', entry.signature)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`[PURCHASE_LOGGER] Purchase ${entry.signature} already logged in purchases table.`);
      return true;
    }

    const baseRecord = {
      wallet_address: entry.walletAddress,
      package_id: entry.packageId,
      sol_amount: entry.currency === 'SOL' ? entry.amount : 0,
      shards_amount: entry.shards,
      signature: entry.signature,
      status: entry.status || 'success'
    };

    const { error: baseErr } = await supabase
      .from('purchases')
      .insert(baseRecord);

    if (baseErr) {
      console.error('[PURCHASE_LOGGER] Insert to purchases table failed:', baseErr.message);
      return false;
    }

    console.log(`[PURCHASE_LOGGER] Successfully logged ${entry.provider} (${entry.currency}) purchase for ${entry.walletAddress} to purchases table.`);
    return true;
  } catch (err) {
    console.error('[PURCHASE_LOGGER] Unhandled error recording purchase:', err);
    return false;
  }
}
