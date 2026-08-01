const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const loadServerCode = `    async function loadServerDB() {
      try {
        const res = await fetch('/api/db');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.db) {
            if (Array.isArray(data.db.systemUsers) && data.db.systemUsers.length > 0) {
              setSystemUsers(data.db.systemUsers);
            }
            if (data.db.appState) {
              setApp(data.db.appState);
            } else {
              if (Array.isArray(data.db.contacts)) {
                setApp((prev) => ({ ...prev, contacts: data.db.contacts }));
              }
              if (Array.isArray(data.db.transactions)) {
                setApp((prev) => ({ ...prev, transactions: data.db.transactions }));
              }
              if (Array.isArray(data.db.notifications)) {
                setApp((prev) => ({ ...prev, notifications: data.db.notifications }));
              }
            }
            if (Array.isArray(data.db.virtualCards)) {
              setVirtualCards(data.db.virtualCards);
            }
            if (data.db.biometricThreshold !== undefined) {
              setBiometricThreshold(data.db.biometricThreshold);
            }
            if (data.db.biometricRequired !== undefined) {
              setBiometricRequired(data.db.biometricRequired);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load DB from Vercel server:', err);
      }
    }`;

code = code.replace(/    async function loadServerDB\(\) \{[\s\S]*?      \} catch \(err\) \{\n        console\.error\('Failed to load DB from Vercel server:', err\);\n      \}\n    \}/, loadServerCode);

const syncCode = `    const syncWithServer = async () => {
      try {
        await fetch('/api/db/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemUsers,
            contacts: app.contacts,
            transactions: app.transactions,
            notifications: app.notifications,
            appState: app,
            virtualCards,
            biometricThreshold,
            biometricRequired
          }),
        });
      } catch (e) {
        console.error('Error syncing data with Vercel server:', e);
      }
    };
    syncWithServer();
  }, [systemUsers, app, virtualCards, biometricThreshold, biometricRequired]);`;

code = code.replace(/    const syncWithServer = async \(\) => \{[\s\S]*?    syncWithServer\(\);\n  \}, \[systemUsers, app\.contacts, app\.transactions, app\.notifications\]\);/, syncCode);

fs.writeFileSync('src/App.tsx', code);
