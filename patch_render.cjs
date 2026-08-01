const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Insert myTransactions right before return (
code = code.replace(/  return \(\n    <div/, `  const myTransactions = app.transactions.filter(t => t.userId === app.user.profileId || t.userId === currentUser?.id);
  const myNotifications = app.notifications.filter(n => n.userId === app.user.profileId || n.userId === currentUser?.id);
  const myContacts = app.contacts.filter(c => c.userId === app.user.profileId || c.userId === currentUser?.id);

  return (
    <div`);

// Replace app.transactions with myTransactions where appropriate
code = code.replace(/transactions=\{app\.transactions\}/g, 'transactions={myTransactions}');
code = code.replace(/\{app\.transactions\.slice/g, '{myTransactions.slice');

// Replace app.notifications with myNotifications
code = code.replace(/notifications=\{app\.notifications\}/g, 'notifications={myNotifications}');
code = code.replace(/app\.notifications\.filter\(\(n\) => !n\.read\)/g, 'myNotifications.filter((n) => !n.read)');

// Replace app.contacts with myContacts
code = code.replace(/contacts=\{app\.contacts\}/g, 'contacts={myContacts}');

fs.writeFileSync('src/App.tsx', code);
