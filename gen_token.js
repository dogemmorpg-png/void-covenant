import jwt from 'jsonwebtoken';
const token = jwt.sign({ walletAddress: 'test_wallet_2', wallet: 'test_wallet_2' }, 'fallback-secret-for-dev-only-change-in-prod');
console.log(token);
