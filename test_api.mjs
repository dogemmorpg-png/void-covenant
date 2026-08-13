import fetch from 'node-fetch';
async function testAuth() {
  console.log('Testing /api/auth');
  const res = await fetch('https://void-covenant.vercel.app/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      publicKey: '3z92YkR9vP3JcE',
      signature: '3z92YkR9vP3JcE',
      message: 'test message'
    })
  });
  console.log(res.status);
  console.log(await res.text());
}
testAuth();
