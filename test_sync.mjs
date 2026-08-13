import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

async function run() {
  const token = jwt.sign({ walletAddress: 'test_sync_wallet' }, 'fallback-secret-for-dev-only-change-in-prod');
  const res = await fetch('https://void-covenant.vercel.app/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({
      walletAddress: 'test_sync_wallet',
      pveProgress: 1,
      heroMaxHealth: 30,
      exp: 0,
      level: 1,
      gold: 1000,
      dust: 250,
      darkShards: 50,
      completedTasks: [],
      collection: [],
      deck: [],
      equipment: [],
      equipped: {}
    })
  });
  console.log(res.status);
  console.log(await res.text());
}
run();
