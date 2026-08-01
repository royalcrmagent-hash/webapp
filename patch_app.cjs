const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace all occurrences of `const newTx: Transaction = {` with `const newTx: Transaction = { userId: currentUser?.id,`
code = code.replace(/const newTx: Transaction = \{/g, 'const newTx: Transaction = { userId: currentUser?.id,');

// Replace newNotif = { with newNotif: AppNotification = { userId: currentUser?.id,
code = code.replace(/const newNotif = \{/g, 'const newNotif: AppNotification = { userId: currentUser?.id,');

fs.writeFileSync('src/App.tsx', code);
