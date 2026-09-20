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
 * Records a verified purchase to the unified Supabase `purchases` table.
 * Supports both extended schema (with currency, amount, provider) and the base legacy schema.
 */
export async function logPurchaseToDatabase(
  supabase: SupabaseClient,
  entry: PurchaseLogEntry
): Promise<boolean> {
  try {
    if (!supabase || !entry.signature) return false;

    // Check if signature already logged in purchases table to prevent duplicates
    const { data: existing } = await supabase
      .from('purchases')
      .select('id')
      .eq('signature', entry.signature)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`[PURCHASE_LOGGER] Purchase ${entry.signature} already logged in purchases table.`);
      return true;
    }

    // 1. Try insert with new extended columns (currency, amount, provider)
    const extendedRecord = {
      wallet_address: entry.walletAddress,
      package_id: entry.packageId,
      sol_amount: entry.currency === 'SOL' ? entry.amount : 0,
      shards_amount: entry.shards,
      signature: entry.signature,
      status: entry.status || 'success',
      currency: entry.currency,
      amount: entry.amount,
      provider: entry.provider
    };

    const { error: extError } = await supabase
      .from('purchases')
      .insert(extendedRecord);

    if (!extError) {
      console.log(`[PURCHASE_LOGGER] Successfully recorded ${entry.provider} (${entry.currency}) purchase for ${entry.walletAddress} in purchases table.`);
      return true;
    }

    // 2. If extended insert failed because of missing columns, fall back to base schema
    console.warn(`[PURCHASE_LOGGER] Extended insert failed (${extError.message}), using fallback base schema...`);

    const fallbackRecord = {
      wallet_address: entry.walletAddress,
      package_id: `${entry.packageId} [${entry.currency}]`,
      sol_amount: entry.currency === 'SOL' ? entry.amount : 0,
      shards_amount: entry.shards,
      signature: entry.signature,
      status: entry.status || 'success'
    };

    const { error: fallbackError } = await supabase
      .from('purchases')
      .insert(fallbackRecord);

    if (fallbackError) {
      console.error('[PURCHASE_LOGGER] Fallback insert failed:', fallbackError);
      return false;
    }

    console.log(`[PURCHASE_LOGGER] Fallback recorded ${entry.provider} (${entry.currency}) purchase in purchases table.`);
    return true;
  } catch (err) {
    console.error('[PURCHASE_LOGGER] Unhandled error recording purchase:', err);
    return false;
  }
}
