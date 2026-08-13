import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

async function run() {
  const token = jwt.sign({ walletAddress: 'test_gacha_wallet' }, 'fallback-secret-for-dev-only-change-in-prod');
  const res = await fetch('https://void-covenant.vercel.app/api/gacha', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({
      packType: 'bronze',
      numCards: 1
    })
  });
  console.log(res.status);
  console.log(await res.text());
}
run();
