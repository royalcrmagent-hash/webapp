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

// Initial default data if database/file doesn't exist
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
    {
      id: 'usr_admin2',
      name: 'PayPulse Admin',
      email: 'admin@paypulse.com',
      phone: '01800000000',
      profileId: 'ADM-0000-111',
      code: '1234',
      passkey: '123456',
      role: 'admin',
      balance: 500000,
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

// Get connection string from standard env vars on Vercel, Neon, Supabase, Heroku, etc.
const getDbConnectionString = () => {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    ''
  ).trim();
};

let pgPoolInstance: any = null;
const getPool = () => {
  const connStr = getDbConnectionString();
  if (!connStr) return null;
  if (!pgPoolInstance) {
    try {
      pgPoolInstance = new Pool({
        connectionString: connStr,
        ssl: connStr.includes('localhost') || connStr.includes('127.0.0.1') ? false : { rejectUnauthorized: false },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    } catch (err) {
      console.error('Error creating PG Pool:', err);
    }
  }
  return pgPoolInstance;
};

// In-Memory state fallback for serverless execution
let memoryDb: any = JSON.parse(JSON.stringify(INITIAL_DB));

// Helper to ensure default admin user accounts always exist
const ensureAdminAccounts = (dbData: any) => {
  if (!dbData || typeof dbData !== 'object') dbData = JSON.parse(JSON.stringify(INITIAL_DB));
  if (!Array.isArray(dbData.systemUsers)) dbData.systemUsers = [];

  const admin1 = {
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
  };

  const admin2 = {
    id: 'usr_admin2',
    name: 'PayPulse Admin',
    email: 'admin@paypulse.com',
    phone: '01800000000',
    profileId: 'ADM-0000-111',
    code: '1234',
    passkey: '123456',
    role: 'admin',
    balance: 500000,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
    biometricEnabled: true,
    createdAt: new Date().toISOString(),
  };

  const hasAdmin1 = dbData.systemUsers.some((u: any) => u.email === admin1.email || u.id === admin1.id);
  if (!hasAdmin1) dbData.systemUsers.unshift(admin1);

  const hasAdmin2 = dbData.systemUsers.some((u: any) => u.email === admin2.email || u.id === admin2.id);
  if (!hasAdmin2) dbData.systemUsers.unshift(admin2);

  return dbData;
};

let isPgTableCreated = false;

async function readDB() {
  const pool = getPool();
  if (pool) {
    try {
      if (!isPgTableCreated) {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS app_state (
            id INTEGER PRIMARY KEY,
            data JSONB NOT NULL
          );
        `);
        isPgTableCreated = true;
      }

      const res = await pool.query('SELECT data FROM app_state WHERE id = 1');
      if (res.rows.length > 0 && res.rows[0].data) {
        const dbData = res.rows[0].data;
        const sanitized = ensureAdminAccounts(dbData);
        memoryDb = sanitized;
        return sanitized;
      } else {
        // Seed database
        const sanitized = ensureAdminAccounts(INITIAL_DB);
        await pool.query(
          'INSERT INTO app_state (id, data) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data',
          [JSON.stringify(sanitized)]
        );
        memoryDb = sanitized;
        return sanitized;
      }
    } catch (err) {
      console.error('PostgreSQL database query failed, falling back to local file/memory storage:', err);
    }
  }

  // File system fallback
  try {
    let filePath = DB_FILE;
    if (!fs.existsSync(filePath)) {
      const tmpPath = path.join('/tmp', 'server_db.json');
      if (fs.existsSync(tmpPath)) {
        filePath = tmpPath;
      }
    }

    if (fs.existsSync(filePath)) {
      const data = await fs.promises.readFile(filePath, 'utf-8');
      if (data && data.trim()) {
        const dbData = JSON.parse(data);
        const sanitized = ensureAdminAccounts(dbData);
        memoryDb = sanitized;
        return sanitized;
      }
    }
  } catch (e) {
    console.error('File DB read error:', e);
  }

  const sanitized = ensureAdminAccounts(memoryDb);
  memoryDb = sanitized;
  return sanitized;
}

async function writeDB(data: any) {
  const sanitized = ensureAdminAccounts(data);
  memoryDb = sanitized;

  const pool = getPool();
  if (pool) {
    try {
      if (!isPgTableCreated) {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS app_state (
            id INTEGER PRIMARY KEY,
            data JSONB NOT NULL
          );
        `);
        isPgTableCreated = true;
      }

      await pool.query(
        'INSERT INTO app_state (id, data) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data',
        [JSON.stringify(sanitized)]
      );
      return;
    } catch (err) {
      console.error('PostgreSQL database write error, falling back to local file:', err);
    }
  }

  // File write fallback
  try {
    const content = JSON.stringify(sanitized, null, 2);
    const tempFile = `${DB_FILE}.tmp`;
    await fs.promises.writeFile(tempFile, content, 'utf-8');
    await fs.promises.rename(tempFile, DB_FILE);
  } catch (e) {
    try {
      const tmpPath = path.join('/tmp', 'server_db.json');
      await fs.promises.writeFile(tmpPath, JSON.stringify(sanitized, null, 2), 'utf-8');
    } catch (tmpErr) {
      console.warn('Filesystem is read-only (e.g. Vercel Serverless). Data persisted in memory state.');
    }
  }
}

const app = express();

async function startServer() {
  app.use(express.json({ limit: '10mb' }));

  // API ROUTES (Always FIRST before Vite/static middlewares)

  // Healthcheck
  app.get('/api/health', async (req, res) => {
    try {
      await readDB();
      const connStr = getDbConnectionString();
      const storageType = connStr ? 'PostgreSQL Cloud Database' : 'Local File / Memory Storage';
      res.json({ 
        status: 'ok', 
        database: connStr ? 'connected' : 'local_fallback', 
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
    const connStr = getDbConnectionString();
    if (!connStr) {
      return res.json({ 
        success: false, 
        message: 'No DATABASE_URL or POSTGRES_URL environment variable found. App is operating smoothly using Local/Memory storage.',
        type: 'Local Storage / In-Memory'
      });
    }

    try {
      const pool = getPool();
      if (!pool) {
        return res.json({ success: false, message: 'Failed to create PostgreSQL connection pool.', type: 'PostgreSQL Database' });
      }
      
      const startTime = Date.now();
      const result = await pool.query('SELECT 1 as result');
      const duration = Date.now() - startTime;

      if (result.rows && result.rows[0].result === 1) {
        res.json({ 
          success: true, 
          message: `Connected to Cloud PostgreSQL Database successfully! Query 'SELECT 1' returned ${result.rows[0].result}.`,
          latency: `${duration}ms`,
          type: 'PostgreSQL Database'
        });
      } else {
        res.json({ 
          success: false, 
          message: 'Connected but query returned unexpected result.',
          type: 'PostgreSQL Database'
        });
      }
    } catch (error: any) {
      res.json({ 
        success: false, 
        message: `Database connection error: ${error.message}`,
        type: 'PostgreSQL Database'
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

  // Debug Info API
  app.get('/api/admin/debug-info', async (req, res) => {
    try {
      const connStr = getDbConnectionString();
      const db = await readDB();
      const pool = getPool();
      
      let pgTestSuccess = false;
      let pgError = null;
      if (pool) {
        try {
          const testRes = await pool.query('SELECT 1 as val');
          pgTestSuccess = testRes?.rows[0]?.val === 1;
        } catch (e: any) {
          pgError = e.message || String(e);
        }
      }

      res.json({
        success: true,
        storageType: connStr ? 'PostgreSQL Cloud Database' : 'Local File / Memory Storage',
        hasDbUrl: Boolean(connStr),
        pgConnected: pgTestSuccess,
        pgError: pgError,
        userCount: Array.isArray(db.systemUsers) ? db.systemUsers.length : 0,
        users: Array.isArray(db.systemUsers) ? db.systemUsers.map((u: any) => ({
          name: u.name,
          email: u.email,
          phone: u.phone,
          profileId: u.profileId,
          role: u.role,
          passkey: u.passkey ? '******' : 'none'
        })) : [],
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: `Database Debug Error: ${err.message || String(err)}`,
        stack: err.stack
      });
    }
  });

  // User Registration
  app.post('/api/users/register', async (req, res) => {
    try {
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

      if (!newUser || (!newUser.email && !newUser.phone)) {
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

      res.json({ success: true, user: userWithDefaults, message: 'User registered successfully on database' });
    } catch (err: any) {
      console.error('User Registration DB Error:', err);
      res.status(500).json({
        success: false,
        error: `Database Registration Error: ${err.message || String(err)}`,
        debugDetails: err.stack || String(err)
      });
    }
  });

  // User Login
  app.post('/api/auth/login', async (req, res) => {
    try {
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
        return res.status(404).json({ success: false, error: `Account "${rawTarget}" not found in Database.` });
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
    } catch (err: any) {
      console.error('User Login DB Error:', err);
      res.status(500).json({
        success: false,
        error: `Database Login Error: ${err.message || String(err)}`,
        debugDetails: err.stack || String(err)
      });
    }
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

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 PayPulse Full-Stack Server running on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer();

export default app;
