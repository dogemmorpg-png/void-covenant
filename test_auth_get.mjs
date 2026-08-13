import fetch from 'node-fetch';
async function testAuth() {
  console.log('Testing /api/auth with GET');
  const res = await fetch('https://void-covenant.vercel.app/api/auth');
  console.log(res.status);
  console.log(await res.text());
}
testAuth();
