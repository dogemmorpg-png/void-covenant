import fetch from 'node-fetch';
async function testPing() {
  console.log('Testing /api/ping');
  const res = await fetch('https://void-covenant.vercel.app/api/ping');
  console.log(res.status);
  console.log(await res.text());
}
testPing();
