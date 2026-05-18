const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.run(`DELETE FROM reviews WHERE verifie = 0 OR verifie IS NULL`, function(err) {
  if (err) {
    console.error('Error deleting fake reviews:', err.message);
  } else {
    console.log(`Successfully deleted ${this.changes} fake/unverified reviews.`);
  }
  db.close();
});
