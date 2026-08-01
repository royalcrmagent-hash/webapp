const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const syncCode = `  app.post('/api/db/sync', async (req, res) => {
    const { systemUsers, contacts, transactions, notifications, appState, virtualCards, biometricThreshold, biometricRequired } = req.body;
    const currentDB = await readDB();
    const updatedDB = {
      ...currentDB,
      systemUsers: systemUsers || currentDB.systemUsers,
      contacts: contacts || currentDB.contacts,
      transactions: transactions || currentDB.transactions,
      notifications: notifications || currentDB.notifications,
      appState: appState || currentDB.appState,
      virtualCards: virtualCards || currentDB.virtualCards,
      biometricThreshold: biometricThreshold !== undefined ? biometricThreshold : currentDB.biometricThreshold,
      biometricRequired: biometricRequired !== undefined ? biometricRequired : currentDB.biometricRequired
    };
    await writeDB(updatedDB);
    res.json({ success: true, message: 'Server database synchronized', db: updatedDB });
  });`;

// Replace the existing /api/db/sync
code = code.replace(/  app\.post\('\/api\/db\/sync', async \(req, res\) => \{[\s\S]*?  \}\);/, syncCode);

fs.writeFileSync('server.ts', code);
