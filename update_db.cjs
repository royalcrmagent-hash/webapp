const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const res = await client.query('SELECT data FROM app_state WHERE id = 1');
  if (res.rows.length > 0) {
    let data = res.rows[0].data;
    data.transactions = [];
    data.notifications = [];
    await client.query('UPDATE app_state SET data = $1 WHERE id = 1', [JSON.stringify(data)]);
    console.log("DB cleared transactions");
  }
  await client.end();
}
run().catch(console.error);
