import fetch from 'node-fetch';
async function run() {
  const res = await fetch('https://void-covenant-dogemmorpg-pngs-projects.vercel.app/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      publicKey: 'test',
      signature: 'test',
      message: 'test'
    })
  });
  console.log(res.status);
  console.log(await res.text());
}
run();
