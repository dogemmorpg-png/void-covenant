import { beginCell, Address } from '@ton/core';
import { USDT_JETTON_MASTER } from '../data/telegramPricing';

/**
 * Builds standard TEP-74 Jetton transfer payload cell
 * Opcode: 0x0f8a7ea5 (transfer)
 */
export function buildJettonTransferPayload(
  toAddress: string,
  responseAddress: string,
  jettonAmountUnits: bigint
): string {
  return beginCell()
    .storeUint(0xf8a7ea5, 32)                     // op::transfer
    .storeUint(0, 64)                             // query_id
    .storeCoins(jettonAmountUnits)                // jetton amount with decimals (e.g. 6 for USDT)
    .storeAddress(Address.parse(toAddress))       // destination
    .storeAddress(Address.parse(responseAddress)) // response_destination (for excess refund)
    .storeBit(0)                                  // custom_payload (null)
    .storeCoins(1n)                               // forward_ton_amount (1 nanoton)
    .storeBit(0)                                  // forward_payload (empty)
    .endCell()
    .toBoc()
    .toString('base64');
}

/**
 * Resolves user's Jetton wallet address for USDT on TON Mainnet
 */
export async function getUsdtJettonWalletAddress(userAddress: string): Promise<string | null> {
  try {
    const res = await fetch(`https://tonapi.io/v2/accounts/${userAddress}/jettons/${USDT_JETTON_MASTER}`);
    const data = await res.json();
    if (data.wallet_address?.address) {
      return data.wallet_address.address;
    }
    if (data.error && typeof data.error === 'string') {
      const match = data.error.match(/jetton wallet (0:[a-f0-9]+)/i);
      if (match && match[1]) {
        return match[1];
      }
    }
  } catch (e) {
    console.warn('Failed to fetch user USDT Jetton wallet address:', e);
  }
  return null;
}
