const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'backend', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const updates = [
  "UPDATE products SET competitor_price = 18.50, competitor_label = 'PLANTES EN VRAC PREMIUM DU MARCHÉ' WHERE id = 11;",
  "UPDATE products SET competitor_price = 2.90, competitor_label = 'PRIX D''UN PRÉ-ROULÉ SANS TABAC EN BOUTIQUE' WHERE id = 12;",
  "UPDATE products SET competitor_price = 2.90, competitor_label = 'PRIX D''UN PRÉ-ROULÉ SANS TABAC EN BOUTIQUE' WHERE id = 13;",
  "UPDATE products SET competitor_price = 33.90, competitor_label = 'SI ACHETÉ SÉPARÉMENT EN BOUTIQUE' WHERE id = 14;",
  "UPDATE products SET competitor_price = 4.50, competitor_label = 'PRIX D''UNE TISANE EN GRANDE SURFACE (50G)' WHERE id = 15;",
  "UPDATE products SET competitor_price = 1.20, competitor_label = 'PRIX D''UN SACHET DE TISANE EN GRANDE SURFACE' WHERE id = 16;",
  "UPDATE products SET competitor_price = 1.20, competitor_label = 'PRIX D''UN SACHET DE TISANE EN GRANDE SURFACE' WHERE id = 17;",
  "UPDATE products SET competitor_price = 45.00, competitor_label = 'SI ACHETÉ SÉPARÉMENT EN BOUTIQUE BIEN-ÊTRE' WHERE id = 18;"
];

db.serialize(() => {
  updates.forEach(sql => {
    db.run(sql, function(err) {
      if (err) console.error("Error running query:", sql, err.message);
    });
  });
  db.all("SELECT id, name, competitor_price, competitor_label FROM products WHERE id >= 11 AND id <= 18", (err, rows) => {
    if (err) console.error(err);
    else console.log(JSON.stringify(rows, null, 2));
  });
});
db.close();
