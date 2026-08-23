const fs = require('fs');
let content = fs.readFileSync('api/verify-solana-payment.ts', 'utf8');

// We need to add sender verification logic right before checking treasury transfer.
const checkLogic = `          if (tx.meta?.err) {
            return res.status(400).json({ error: 'Transaction failed on Solana blockchain.' });
          }`;

const newCheckLogic = `          if (tx.meta?.err) {
            return res.status(400).json({ error: 'Transaction failed on Solana blockchain.' });
          }

          const accountKeys = tx.transaction?.message?.accountKeys || [];
          const senderPubkeyStr = typeof accountKeys[0] === 'string' ? accountKeys[0] : (accountKeys[0]?.pubkey ? accountKeys[0].pubkey.toString() : String(accountKeys[0]));
          if (senderPubkeyStr !== walletAddress) {
            return res.status(400).json({ error: 'Transaction sender mismatch. This transaction belongs to another wallet.' });
          }`;

content = content.replace(checkLogic, newCheckLogic);
fs.writeFileSync('api/verify-solana-payment.ts', content);
console.log('Patched verify-solana-payment.ts against global replay');
