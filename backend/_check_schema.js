const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');
db.all("PRAGMA table_info(products)", (err, columns) => {
  if (err) throw err;
  console.log(columns.map(c => c.name));
});
