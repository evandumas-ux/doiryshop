const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.resolve(__dirname, 'database.sqlite'));

db.all("SELECT id, name, tagline, description, short_description FROM products", [], (err, rows) => {
  if (err) console.error(err);
  console.log(JSON.stringify(rows, null, 2));
  db.close();
});
