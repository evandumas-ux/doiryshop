const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.resolve(__dirname, 'database.sqlite'));

const updates = [
  { id: 12, name: "L'Instant - Pack de Pré-roulés (x3)" },
  { id: 13, name: "L'Instant - Pack de Pré-roulés (x5)" },
  { id: 15, name: "L'Élixir Nocturne - Infusion en Vrac (50g)" },
  { id: 16, name: "L'Élixir Nocturne - Boîte de 20 Infusettes" },
  { id: 17, name: "L'Élixir Nocturne - Boîte de 10 Infusettes" },
  { id: 18, name: "Le Coffret Sérénité - Kit Détente" },
];

db.serialize(() => {
  updates.forEach(u => {
    db.run("UPDATE products SET name = ? WHERE id = ?", [u.name, u.id], (err) => {
      if (err) console.error(err);
      else console.log(`Updated name for id ${u.id}`);
    });
  });

  const replaceDesc = [
    { old: "sans commitment", new: "sans engagement" },
    { old: "un seul but : calmer.", new: "un seul but : accompagner le moment de détente." }
  ];

  db.all("SELECT id, description, short_description FROM products", [], (err, rows) => {
    if (err) return console.error(err);
    rows.forEach(row => {
      let desc = row.description;
      let short = row.short_description;
      let changed = false;

      replaceDesc.forEach(r => {
        if (desc && desc.includes(r.old)) { desc = desc.replace(r.old, r.new); changed = true; }
        if (short && short.includes(r.old)) { short = short.replace(r.old, r.new); changed = true; }
      });

      if (changed) {
        db.run("UPDATE products SET description = ?, short_description = ? WHERE id = ?", [desc, short, row.id], (err) => {
          if (err) console.error(err);
          else console.log(`Updated descriptions for id ${row.id}`);
        });
      }
    });
  });
});
