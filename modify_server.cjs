const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

// 1. Add pg import
code = code.replace(
  "import { createServer as createViteServer } from 'vite';",
  "import { createServer as createViteServer } from 'vite';\nimport pg from 'pg';\nconst { Pool } = pg;\nconst pool = new Pool({ connectionString: process.env.DATABASE_URL });"
);

// 2. Replace readDB and writeDB
const oldReadDB = `// Helper: Read DB from JSON storage
function readDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading server DB file:', err);
  }
  // Write default if not exists
  writeDB(INITIAL_DB);
  return INITIAL_DB;
}

// Helper: Write DB to JSON storage
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing server DB file:', err);
  }
}`;

const newReadDB = `async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(\`
      CREATE TABLE IF NOT EXISTS app_state (
        id INTEGER PRIMARY KEY,
        data JSONB NOT NULL
      );
    \`);
    const res = await client.query('SELECT data FROM app_state WHERE id = 1');
    if (res.rows.length === 0) {
      await client.query('INSERT INTO app_state (id, data) VALUES ($1, $2)', [1, JSON.stringify(INITIAL_DB)]);
    }
  } finally {
    client.release();
  }
}

async function readDB() {
  const res = await pool.query('SELECT data FROM app_state WHERE id = 1');
  return res.rows[0]?.data || INITIAL_DB;
}

async function writeDB(data: any) {
  await pool.query('UPDATE app_state SET data = $1 WHERE id = 1', [JSON.stringify(data)]);
}`;

code = code.replace(oldReadDB, newReadDB);

// 3. Make startServer init DB
code = code.replace('  // Initialize DB\n  readDB();', '  // Initialize DB\n  await initDB();');

// 4. Change all API endpoints to async and await readDB/writeDB
code = code.replace(/app\.get\('\/api\/db', \(req, res\) => {/g, "app.get('/api/db', async (req, res) => {");
code = code.replace(/const db = readDB\(\);/g, "const db = await readDB();");

code = code.replace(/app\.post\('\/api\/db\/sync', \(req, res\) => {/g, "app.post('/api/db/sync', async (req, res) => {");
code = code.replace(/const currentDB = readDB\(\);/g, "const currentDB = await readDB();");
code = code.replace(/writeDB\((.*?)\);/g, "await writeDB($1);");

code = code.replace(/app\.post\('\/api\/users\/register', \(req, res\) => {/g, "app.post('/api/users/register', async (req, res) => {");

code = code.replace(/app\.post\('\/api\/auth\/login', \(req, res\) => {/g, "app.post('/api/auth/login', async (req, res) => {");

code = code.replace(/app\.post\('\/api\/auth\/update-credentials', \(req, res\) => {/g, "app.post('/api/auth/update-credentials', async (req, res) => {");

code = code.replace(/app\.post\('\/api\/transactions\/add', \(req, res\) => {/g, "app.post('/api/transactions/add', async (req, res) => {");

code = code.replace(/app\.post\('\/api\/admin\/users\/freeze', \(req, res\) => {/g, "app.post('/api/admin/users/freeze', async (req, res) => {");

code = code.replace(/app\.post\('\/api\/admin\/users\/balance', \(req, res\) => {/g, "app.post('/api/admin/users/balance', async (req, res) => {");

code = code.replace(/app\.post\('\/api\/admin\/users\/delete', \(req, res\) => {/g, "app.post('/api/admin/users/delete', async (req, res) => {");

fs.writeFileSync('server.ts', code);
console.log('Modified server.ts successfully');
