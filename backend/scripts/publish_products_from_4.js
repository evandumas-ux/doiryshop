const db = require('../database');

db.serialize(() => {
  db.run("UPDATE products SET status = 'published', is_active = 1 WHERE id >= 4", (err) => {
    if (err) {
      console.error('UPDATE error:', err.message);
      db.close();
      process.exit(1);
    }

    db.all("SELECT id, name, status, is_active, categorie FROM products WHERE id >= 4 ORDER BY id ASC", (err2, rows) => {
      if (err2) {
        console.error('SELECT error:', err2.message);
        db.close();
        process.exit(1);
      }
      console.log(rows);
      db.close();
    });
  });
});

