import "dotenv/config";
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'server_db.json');

// Initial default data if file doesn't exist
const INITIAL_DB = {
  systemUsers: [
    {
      id: 'usr_admin',
      name: 'System Admin',
      email: 'admin@gmail.com',
      phone: '01700000000',
      accountNo: 'ADM-0000-999',
      pin: '1234',
      password: '123456',
      role: 'admin',
      balance: 100000,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
      biometricEnabled: true,
      createdAt: new Date().toISOString(),
    },
  ],
  contacts: [
    {
      id: 'c1',
      name: 'Rahim Ahmed',
      phone: '01712345678',
      username: 'rahim',
      email: 'rahim@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      favorite: true,
    },
    {
      id: 'c2',
      name: 'Nusrat Jahan',
      phone: '01898765432',
      username: 'nusrat',
      email: 'nusrat@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      favorite: true,
    },
    {
      id: 'c3',
      name: 'Tanvir Hossain',
      phone: '01712000222',
      username: 'tanvir',
      email: 'tanvir@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      favorite: true,
    },
    {
      id: 'c4',
      name: 'Sadia Islam',
      phone: '01911223344',
      username: 'sadia',
      email: 'sadia@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      favorite: true,
    },
    {
      id: 'c5',
      name: 'Karim Khan',
      phone: '01822334455',
      username: 'karim',
      email: 'karim@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
      favorite: true,
    },
  ],
  transactions: [],
  notifications: [
    {
      id: 'n1',
      title: 'Welcome to PayPulse Cloud',
      message: 'Your account and data are safely synchronized on Vercel cloud server.',
      time: 'Just now',
      read: false,
      type: 'system',
    },
  ],
};

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_state (
        id INTEGER PRIMARY KEY,
        data JSONB NOT NULL
      );
    `);
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
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  // Initialize DB
  await initDB();

  // API ROUTES (Always FIRST before Vite/static middlewares)

  // Healthcheck
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', storage: 'Vercel Server DB Active' });
  });

  // Get full database state
  app.get('/api/db', async (req, res) => {
    const db = await readDB();
    res.json({ success: true, db });
  });

  // Sync / Save full database state
  app.post('/api/db/sync', async (req, res) => {
    const { systemUsers, contacts, transactions, notifications } = req.body;
    const currentDB = await readDB();

    const updatedDB = {
      systemUsers: systemUsers || currentDB.systemUsers,
      contacts: contacts || currentDB.contacts,
      transactions: transactions || currentDB.transactions,
      notifications: notifications || currentDB.notifications,
    };

    await writeDB(updatedDB);
    res.json({ success: true, message: 'Server database synchronized', db: updatedDB });
  });

  // User Registration
  app.post('/api/users/register', async (req, res) => {
    const newUser = req.body;
    if (!newUser || !newUser.email || !newUser.phone) {
      return res.status(400).json({ success: false, error: 'Email and Phone are required' });
    }

    const db = await readDB();
    const cleanPhoneDigits = newUser.phone.replace(/\D/g, '');
    const cleanEmail = newUser.email.trim().toLowerCase();

    // Check duplicate
    const exists = db.systemUsers.some(
      (u: any) =>
        u.email.trim().toLowerCase() === cleanEmail ||
        u.phone.replace(/\D/g, '') === cleanPhoneDigits ||
        u.phone === newUser.phone
    );

    if (exists) {
      return res.status(400).json({ success: false, error: 'User with this Email or Mobile already exists.' });
    }

    const userWithDefaults = {
      ...newUser,
      id: newUser.id || `u_${Date.now()}`,
      balance: newUser.balance ?? 0,
      role: newUser.role || 'user',
      isFrozen: false,
      createdAt: newUser.createdAt || new Date().toISOString(),
    };

    db.systemUsers.push(userWithDefaults);
    await writeDB(db);

    res.json({ success: true, user: userWithDefaults, message: 'User registered successfully on Vercel storage' });
  });

  // User Login
  app.post('/api/auth/login', async (req, res) => {
    const { emailOrPhone, password, pin } = req.body;
    if (!emailOrPhone) {
      return res.status(400).json({ success: false, error: 'Email or phone required' });
    }

    const db = await readDB();
    const target = emailOrPhone.trim().toLowerCase().replaceAll(' ', '');
    const cleanDigits = target.replace(/\D/g, '');

    const user = db.systemUsers.find((u: any) => {
      const uEmail = u.email ? u.email.trim().toLowerCase() : '';
      const uPhoneDigits = u.phone ? u.phone.replace(/\D/g, '') : '';
      const uAcc = u.accountNo ? u.accountNo.toLowerCase() : '';
      return uEmail === target || uPhoneDigits === cleanDigits || uAcc === target;
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Account not found on server.' });
    }

    if (user.isFrozen) {
      return res.status(403).json({ success: false, error: 'Account is frozen by Admin. Contact support.' });
    }

    if (password && user.password && user.password !== password) {
      return res.status(401).json({ success: false, error: 'Incorrect Password.' });
    }

    if (pin && user.pin && user.pin !== pin) {
      return res.status(401).json({ success: false, error: 'Incorrect Security PIN.' });
    }

    res.json({ success: true, user });
  });

  // Update Credentials (PIN / Password reset)
  app.post('/api/auth/update-credentials', async (req, res) => {
    const { emailOrPhone, newPass, newPin } = req.body;
    const db = await readDB();
    const target = (emailOrPhone || '').trim().toLowerCase().replaceAll(' ', '');
    const cleanDigits = target.replace(/\D/g, '');

    let found = false;
    db.systemUsers = db.systemUsers.map((u: any) => {
      const uEmail = u.email ? u.email.trim().toLowerCase() : '';
      const uPhoneDigits = u.phone ? u.phone.replace(/\D/g, '') : '';
      const uAcc = u.accountNo ? u.accountNo.toLowerCase() : '';
      if (uEmail === target || uPhoneDigits === cleanDigits || uAcc === target) {
        found = true;
        return {
          ...u,
          password: newPass ? newPass.trim() : u.password,
          pin: newPin ? newPin.trim() : u.pin,
        };
      }
      return u;
    });

    if (!found) {
      return res.status(404).json({ success: false, error: 'User account not found.' });
    }

    await writeDB(db);
    res.json({ success: true, message: 'Credentials updated successfully on Vercel storage' });
  });

  // Add / Sync Transaction
  app.post('/api/transactions/add', async (req, res) => {
    const { transaction, userEmailOrPhone, newBalance } = req.body;
    const db = await readDB();

    if (transaction) {
      db.transactions.unshift(transaction);
    }

    if (userEmailOrPhone && newBalance !== undefined) {
      const target = userEmailOrPhone.trim().toLowerCase();
      const cleanDigits = target.replace(/\D/g, '');

      db.systemUsers = db.systemUsers.map((u: any) => {
        const uEmail = u.email ? u.email.trim().toLowerCase() : '';
        const uPhoneDigits = u.phone ? u.phone.replace(/\D/g, '') : '';
        if (uEmail === target || uPhoneDigits === cleanDigits) {
          return { ...u, balance: newBalance };
        }
        return u;
      });
    }

    await writeDB(db);
    res.json({ success: true, db });
  });

  // Admin Freeze/Unfreeze
  app.post('/api/admin/users/freeze', async (req, res) => {
    const { userId, isFrozen } = req.body;
    const db = await readDB();

    db.systemUsers = db.systemUsers.map((u: any) => {
      if (u.id === userId) {
        return { ...u, isFrozen: !!isFrozen };
      }
      return u;
    });

    await writeDB(db);
    res.json({ success: true, db });
  });

  // Admin Adjust Balance
  app.post('/api/admin/users/balance', async (req, res) => {
    const { userId, newBalance } = req.body;
    const db = await readDB();

    db.systemUsers = db.systemUsers.map((u: any) => {
      if (u.id === userId) {
        return { ...u, balance: Math.max(0, Number(newBalance) || 0) };
      }
      return u;
    });

    await writeDB(db);
    res.json({ success: true, db });
  });

  // Admin Delete User
  app.post('/api/admin/users/delete', async (req, res) => {
    const { userId } = req.body;
    const db = await readDB();

    db.systemUsers = db.systemUsers.filter((u: any) => u.id !== userId);

    await writeDB(db);
    res.json({ success: true, db });
  });

  // Vite Middleware for Development Mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production Static Files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 PayPulse Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
