const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

db.all('SELECT id, email, prenom, nom, profil_complete FROM users', [], (err, rows) => {
  console.log('=== USERS ===');
  if (err) { console.log('ERROR:', err); }
  else { rows.forEach(r => console.log(JSON.stringify(r))); }

  db.all("PRAGMA table_info(users)", [], (err2, cols) => {
    console.log('\n=== TABLE INFO (users) ===');
    if (err2) { console.log('ERROR:', err2); }
    else { cols.forEach(c => console.log(JSON.stringify(c))); }
    db.close();
  });
});
