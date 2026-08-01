const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query('SELECT data FROM app_state WHERE id = 1');
  if (res.rows.length > 0) {
    let dataStr = JSON.stringify(res.rows[0].data);
    dataStr = dataStr.replace(/"password"/g, '"passkey"');
    dataStr = dataStr.replace(/"pin"/g, '"code"');
    dataStr = dataStr.replace(/"accountNo"/g, '"profileId"');
    await client.query('UPDATE app_state SET data = $1 WHERE id = 1', [dataStr]);
    console.log("DB updated");
  }
  await client.end();
}
run().catch(console.error);
