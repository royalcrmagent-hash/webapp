import "dotenv/config";
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import pg from 'pg';
import axios from 'axios';
import { sendEmail } from './server/mail.ts';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const verifyRecaptcha = async (token: string) => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return true; // Skip if no secret key provided
  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`
    );
    return response.data.success;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
};

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
      profileId: 'ADM-0000-999',
      code: '1234',
      passkey: '123456',
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
      userId: 'ADM-0000-999',
    },
    {
      id: 'c2',
      name: 'Nusrat Jahan',
      phone: '01898765432',
      username: 'nusrat',
      email: 'nusrat@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      favorite: true,
      userId: 'ADM-0000-999',
    },
    {
      id: 'c3',
      name: 'Tanvir Hossain',
      phone: '01712000222',
      username: 'tanvir',
      email: 'tanvir@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      favorite: true,
      userId: 'ADM-0000-999',
    },
    {
      id: 'c4',
      name: 'Sadia Islam',
      phone: '01911223344',
      username: 'sadia',
      email: 'sadia@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      favorite: true,
      userId: 'ADM-0000-999',
    },
    {
      id: 'c5',
      name: 'Karim Khan',
      phone: '01822334455',
      username: 'karim',
      email: 'karim@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
      favorite: true,
      userId: 'ADM-0000-999',
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
      userId: 'ADM-0000-999',
    },
  ],
  settings: {
    recaptchaEnabled: false,
    maintenanceMode: false,
    maintenanceMessage: 'System is under routine maintenance. Please try again shortly.',
    feeConfig: {
      sendMoneyFeePercent: 1.5,
      cashOutFeePercent: 1.85,
      billPayFeeFlat: 5.0,
      minFee: 1.0,
      maxFee: 100.0,
    },
    systemLimits: {
      dailyTxLimit: 50000,
      maxTxAmount: 25000,
      minTxAmount: 10,
    },
  },
  auditLogs: [
    {
      id: 'log_01',
      adminEmail: 'admin@gmail.com',
      adminName: 'System Admin',
      action: 'SYSTEM_INITIALIZED',
      details: 'PayPulse Admin Panel & Database Diagnostic active.',
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
    },
  ],
};

// Database storage abstraction - Using Local Storage (External Database OFF)
let local_db_storage = {
  read: async () => {
    try {
      if (!fs.existsSync(DB_FILE)) {
        await fs.promises.writeFile(DB_FILE, JSON.stringify(INITIAL_DB, null, 2));
        return INITIAL_DB;
      }
      const data = await fs.promises.readFile(DB_FILE, 'utf-8');
      if (!data || !data.trim()) {
        console.warn('Local DB file was empty. Re-initializing with default data.');
        await fs.promises.writeFile(DB_FILE, JSON.stringify(INITIAL_DB, null, 2));
        return INITIAL_DB;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Read Local DB error, resetting corrupted file:', e);
      try {
        await fs.promises.writeFile(DB_FILE, JSON.stringify(INITIAL_DB, null, 2));
      } catch (writeErr) {
        console.error('Failed to repair DB file:', writeErr);
      }
      return INITIAL_DB;
    }
  },
  write: async (data: any) => {
    try {
      const content = JSON.stringify(data, null, 2);
      const tempFile = `${DB_FILE}.tmp`;
      await fs.promises.writeFile(tempFile, content, 'utf-8');
      await fs.promises.rename(tempFile, DB_FILE);
    } catch (e) {
      console.error('Write Local DB error:', e);
      try {
        await fs.promises.writeFile(DB_FILE, JSON.stringify(data, null, 2));
      } catch (writeErr) {
        console.error('Fallback write error:', writeErr);
      }
    }
  }
};

let db_storage = local_db_storage;

async function readDB() {
  return await db_storage.read();
}

async function writeDB(data: any) {
  await db_storage.write(data);
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  // API ROUTES (Always FIRST before Vite/static middlewares)

  // Healthcheck
  app.get('/api/health', async (req, res) => {
    try {
      await readDB();
      const storageType = 'Local File Storage (External DB Disabled)';
      res.json({ 
        status: 'ok', 
        database: 'disabled', 
        storageType,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(500).json({ 
        status: 'error', 
        database: 'disconnected', 
        error: err instanceof Error ? err.message : String(err) 
      });
    }
  });

  // Get full database state
  app.get('/api/db', async (req, res) => {
    const db = await readDB();
    res.json({ success: true, db });
  });

  // Sync / Save full database state
  app.post('/api/db/sync', async (req, res) => {
    const { systemUsers, contacts, transactions, notifications, virtualCards, biometricThreshold, biometricRequired, settings, auditLogs } = req.body;
    const currentDB = await readDB();
    const updatedDB = {
      ...currentDB,
      systemUsers: systemUsers || currentDB.systemUsers,
      contacts: contacts || currentDB.contacts,
      transactions: transactions || currentDB.transactions,
      notifications: notifications || currentDB.notifications,
      virtualCards: virtualCards || currentDB.virtualCards,
      biometricThreshold: biometricThreshold !== undefined ? biometricThreshold : currentDB.biometricThreshold,
      biometricRequired: biometricRequired !== undefined ? biometricRequired : currentDB.biometricRequired,
      settings: settings || currentDB.settings,
      auditLogs: auditLogs || currentDB.auditLogs || []
    };
    await writeDB(updatedDB);
    res.json({ success: true, message: 'Server database synchronized', db: updatedDB });
  });

  // Settings Management
  app.get('/api/settings', async (req, res) => {
    const db = await readDB();
    res.json({ success: true, settings: db.settings || INITIAL_DB.settings });
  });

  // Database Connectivity Test
  app.get('/api/admin/test-db', async (req, res) => {
    if (!process.env.DATABASE_URL) {
      return res.json({ 
        success: false, 
        message: 'Database connection string (DATABASE_URL) is not configured.',
        type: 'Local Storage (JSON)'
      });
    }

    try {
      const db = await readDB(); // Just to ensure storage is initialized
      // If using Pool (Neon/Postgres)
      const { Pool } = await import('pg');
      const pool = new Pool({ 
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });
      
      const startTime = Date.now();
      const result = await pool.query('SELECT 1 as result');
      const duration = Date.now() - startTime;
      
      await pool.end();

      if (result.rows && result.rows[0].result === 1) {
        res.json({ 
          success: true, 
          message: `Connected to Neon Database successfully! Query 'SELECT 1' returned ${result.rows[0].result}.`,
          latency: `${duration}ms`,
          type: 'PostgreSQL (Neon)'
        });
      } else {
        res.json({ 
          success: false, 
          message: 'Connected but query returned unexpected result.',
          type: 'PostgreSQL (Neon)'
        });
      }
    } catch (error: any) {
      res.json({ 
        success: false, 
        message: `Database connection failed: ${error.message}`,
        type: 'PostgreSQL (Neon)'
      });
    }
  });

  app.post('/api/settings', async (req, res) => {
    const { settings } = req.body;
    const db = await readDB();
    db.settings = { ...(db.settings || INITIAL_DB.settings), ...settings };
    await writeDB(db);
    res.json({ success: true, settings: db.settings });
  });

  // User Registration
  app.post('/api/users/register', async (req, res) => {
    const { recaptchaToken, ...newUser } = req.body;
    const db = await readDB();
    const settings = db.settings || INITIAL_DB.settings;
    
    if (settings.recaptchaEnabled && process.env.RECAPTCHA_SECRET_KEY && !recaptchaToken) {
      return res.status(400).json({ success: false, error: 'reCAPTCHA verification required' });
    }

    if (settings.recaptchaEnabled && recaptchaToken) {
      const isValid = await verifyRecaptcha(recaptchaToken);
      if (!isValid) {
        return res.status(400).json({ success: false, error: 'reCAPTCHA verification failed' });
      }
    }

    if (!newUser || !newUser.email || !newUser.phone) {
      return res.status(400).json({ success: false, error: 'Email and Phone are required' });
    }

    const cleanPhoneDigits = newUser.phone ? newUser.phone.replace(/\D/g, '') : '';
    const cleanEmail = newUser.email ? newUser.email.trim().toLowerCase() : '';

    // Check duplicate
    const exists = db.systemUsers.some((u: any) => {
      const uEmail = u.email ? u.email.trim().toLowerCase() : '';
      const uPhoneDigits = u.phone ? u.phone.replace(/\D/g, '') : '';
      
      const emailMatches = cleanEmail && uEmail === cleanEmail;
      const phoneMatches = cleanPhoneDigits.length >= 3 && uPhoneDigits.length >= 3 && 
                           (uPhoneDigits === cleanPhoneDigits || 
                            uPhoneDigits.endsWith(cleanPhoneDigits.replace(/^0+/, '')) || 
                            cleanPhoneDigits.endsWith(uPhoneDigits.replace(/^0+/, '')));
      const rawPhoneMatches = newUser.phone && u.phone === newUser.phone;

      return emailMatches || phoneMatches || rawPhoneMatches;
    });

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

    // Send Welcome Email
    if (userWithDefaults.email) {
      sendEmail(
        userWithDefaults.email,
        'Welcome to PulseTracker!',
        `Hello ${userWithDefaults.name},\n\nWelcome to PulseTracker! Your account has been successfully created. Your Profile ID is ${userWithDefaults.profileId}.\n\nThank you for joining us!`,
        `<h1>Welcome to PulseTracker!</h1><p>Hello <strong>${userWithDefaults.name}</strong>,</p><p>Your account has been successfully created. Your Profile ID is <strong>${userWithDefaults.profileId}</strong>.</p><p>Thank you for joining us!</p>`
      ).catch(err => console.error('Failed to send welcome email:', err));
    }

    res.json({ success: true, user: userWithDefaults, message: 'User registered successfully on Vercel storage' });
  });

  // User Login
  app.post('/api/auth/login', async (req, res) => {
    const { emailOrPhone, passkey, code, recaptchaToken } = req.body;
    const db = await readDB();
    const settings = db.settings || INITIAL_DB.settings;
    
    if (settings.recaptchaEnabled && process.env.RECAPTCHA_SECRET_KEY && !recaptchaToken) {
      return res.status(400).json({ success: false, error: 'reCAPTCHA verification required' });
    }

    if (settings.recaptchaEnabled && recaptchaToken) {
      const isValid = await verifyRecaptcha(recaptchaToken);
      if (!isValid) {
        return res.status(400).json({ success: false, error: 'reCAPTCHA verification failed' });
      }
    }

    if (!emailOrPhone) {
      return res.status(400).json({ success: false, error: 'Email or phone required' });
    }

    const rawTarget = emailOrPhone.trim();
    const target = rawTarget.toLowerCase().replaceAll(' ', '');
    const cleanDigits = target.replace(/\D/g, '');
    const cleanDigitsNoZero = cleanDigits.replace(/^0+/, '');

    const user = db.systemUsers.find((u: any) => {
      const uEmail = u.email ? u.email.trim().toLowerCase() : '';
      const uPhone = u.phone ? u.phone.trim() : '';
      const uPhoneDigits = uPhone.replace(/\D/g, '');
      const uPhoneDigitsNoZero = uPhoneDigits.replace(/^0+/, '');
      const uAcc = u.profileId ? u.profileId.trim().toLowerCase() : '';
      const uName = u.name ? u.name.trim().toLowerCase().replaceAll(' ', '') : '';
      const uUsername = u.username ? u.username.trim().toLowerCase() : '';

      const matchEmail = uEmail && uEmail === rawTarget.toLowerCase();
      const matchPhone = cleanDigitsNoZero.length >= 3 && uPhoneDigitsNoZero.length >= 3 && 
                         (uPhoneDigits === cleanDigits || 
                          uPhoneDigitsNoZero.endsWith(cleanDigitsNoZero) || 
                          cleanDigitsNoZero.endsWith(uPhoneDigitsNoZero));
      const matchAcc = uAcc && (uAcc === rawTarget.toLowerCase() || uAcc === target);
      const matchName = uName && uName === target;
      const matchUsername = uUsername && uUsername === rawTarget.toLowerCase();

      return matchEmail || matchPhone || matchAcc || matchName || matchUsername;
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'Account not found on server.' });
    }

    if (user.isFrozen) {
      return res.status(403).json({ success: false, error: 'Account is frozen by Admin. Contact support.' });
    }

    // Check passkey or code
    const enteredSecret = (passkey || code || '').trim();
    const userPasskey = (user.passkey || '').trim();
    const userCode = (user.code || '').trim();

    if (userPasskey || userCode) {
      const isPasskeyMatch = Boolean(userPasskey && enteredSecret === userPasskey);
      const isCodeMatch = Boolean(userCode && enteredSecret === userCode);

      if (!isPasskeyMatch && !isCodeMatch) {
        return res.status(401).json({ success: false, error: 'Incorrect Passkey or Security Code.' });
      }
    }

    // Send Login Notification Email
    if (user.email) {
      sendEmail(
        user.email,
        'New Login Detected',
        `Hello ${user.name},\n\nA new login was detected on your PulseTracker account at ${new Date().toLocaleString()}.\n\nIf this wasn't you, please reset your passkey immediately.`,
        `<h1>New Login Detected</h1><p>Hello <strong>${user.name}</strong>,</p><p>A new login was detected on your PulseTracker account at <strong>${new Date().toLocaleString()}</strong>.</p><p>If this wasn't you, please reset your passkey immediately.</p>`
      ).catch(err => console.error('Failed to send login email:', err));
    }

    res.json({ success: true, user });
  });

  // Update Credentials (Code / Passkey reset)
  app.post('/api/auth/update-credentials', async (req, res) => {
    const { emailOrPhone, newPass, newPin } = req.body;
    const db = await readDB();
    const target = (emailOrPhone || '').trim().toLowerCase().replaceAll(' ', '');
    const cleanDigits = target.replace(/\D/g, '');

    let found = false;
    db.systemUsers = db.systemUsers.map((u: any) => {
      const uEmail = u.email ? u.email.trim().toLowerCase() : '';
      const uPhoneDigits = u.phone ? u.phone.replace(/\D/g, '') : '';
      const uAcc = u.profileId ? u.profileId.toLowerCase() : '';
      if (uEmail === target || uPhoneDigits === cleanDigits || uAcc === target) {
        found = true;
        return {
          ...u,
          passkey: newPass ? newPass.trim() : u.passkey,
          code: newPin ? newPin.trim() : u.code,
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
      server: { 
        middlewareMode: true,
        hmr: false,
      },
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
