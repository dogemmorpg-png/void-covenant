import fetch from 'node-fetch';
async function run() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3YWxsZXRBZGRyZXNzIjoidGVzdF93YWxsZXRfMiIsIndhbGxldCI6InRlc3Rfd2FsbGV0XzIiLCJpYXQiOjE3ODY2NTM2MDl9.3jrEX4b_WLPenOQ2_qQBFY4jOlCQYGRg5OOzRsr7hSk';
  try {
    const res = await fetch('https://void-covenant-dogemmorpg-pngs-projects.vercel.app/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    });
    console.log(res.status);
    console.log(await res.text());
  } catch (err) {
    console.error(err);
  }
}
run();
