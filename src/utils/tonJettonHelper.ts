import { beginCell, Address, Cell } from '@ton/core';
import { USDT_JETTON_MASTER, TONCENTER_API_KEY } from '../data/telegramPricing';

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
    .storeCoins(0n)                               // forward_ton_amount (0 for standard transfer)
    .storeBit(0)                                  // forward_payload (empty)
    .endCell()
    .toBoc()
    .toString('base64');
}

/**
 * Resolves user's Jetton wallet address for USDT on TON Mainnet.
 * Always returns a valid user-friendly bounceable address (e.g. EQ...)
 * compliant with TonConnect SDK address validation rules.
 */
export async function getUsdtJettonWalletAddress(userAddress: string): Promise<string | null> {
  // Method 1: Toncenter runGetMethod (Deterministic on-chain calculation)
  try {
    const user = Address.parse(userAddress);
    const sliceCell = beginCell().storeAddress(user).endCell();
    const boc = sliceCell.toBoc().toString('base64');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (TONCENTER_API_KEY) {
      headers['X-API-Key'] = TONCENTER_API_KEY;
    }

    const res = await fetch('https://toncenter.com/api/v2/runGetMethod', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        address: USDT_JETTON_MASTER,
        method: 'get_wallet_address',
        stack: [['tvm.Slice', boc]]
      })
    });
    const data = await res.json();
    if (data.ok && data.result?.stack?.[0]?.[1]?.bytes) {
      const bytes = data.result.stack[0][1].bytes;
      const cell = Cell.fromBoc(Buffer.from(bytes, 'base64'))[0];
      const jettonWalletAddr = cell.beginParse().loadAddress();
      return jettonWalletAddr.toString({ bounceable: true });
    }
  } catch (e) {
    console.warn('Toncenter get_wallet_address failed:', e);
  }

  // Method 2: TonAPI account jettons lookup
  try {
    const res = await fetch(`https://tonapi.io/v2/accounts/${userAddress}/jettons/${USDT_JETTON_MASTER}`);
    const data = await res.json();
    if (data.wallet_address?.address) {
      return Address.parse(data.wallet_address.address).toString({ bounceable: true });
    }
  } catch (e) {
    console.warn('TonAPI getUsdtJettonWalletAddress failed:', e);
  }

  return null;
}

