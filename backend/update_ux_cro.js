const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const updates = [
  { id: 11, subtitle: "Feuilles de framboisier séchées à rouler — alternative tabac 100% naturelle." },
  { id: 12, subtitle: "3 pré-roulés aux plantes, sans tabac ni nicotine — prêts à l'emploi." },
  { id: 13, subtitle: "5 pré-roulés aux plantes — format quotidien, zéro préparation." },
  { id: 14, subtitle: "Tout pour rouler vos propres cigarettes de plantes dès ce soir." },
  { id: 15, subtitle: "Infusion valériane-passiflore pour s'endormir naturellement — 50g en vrac." },
  { id: 16, subtitle: "20 sachets de tisane apaisante du soir — pour 20 nuits de détente." },
  { id: 17, subtitle: "10 sachets pour tester la tisane du soir sans engagement." },
  { id: 18, subtitle: "Coffret cadeau détente — infusion, bougie et rituel du soir réunis." }
];

db.serialize(() => {
  // Add column tagline_subtitle if it doesn't exist
  db.run("ALTER TABLE products ADD COLUMN tagline_subtitle TEXT", (err) => {
    if (err) {
      if (err.message.includes("duplicate column name")) {
        console.log("Column tagline_subtitle already exists");
      } else {
        console.error("Error adding column:", err.message);
      }
    } else {
      console.log("Added column tagline_subtitle");
    }

    // Update images for coffret serenite (id: 18)
    db.run("UPDATE products SET image_url = '/images/coffret-serenite-placeholder.svg' WHERE id = 18", (err) => {
      if (err) console.error("Error updating image:", err.message);
      else console.log("Updated image for product 18");
    });
    
    // Update product 18 description
    const desc18 = `Le Coffret Sérénité vous invite à prendre le temps pour vous.

✦ Rituel complet : Une infusion douce, une lumière chaleureuse, tout est réuni pour instaurer une routine du soir apaisante.
✦ Usage flexible : Idéal pour se détendre après une longue journée ou pour accompagner en douceur une réduction tabagique en offrant une alternative gestuelle relaxante.
✦ Accompagnement : Pensé comme un véritable soutien pour s'accorder un moment de répit et de lâcher-prise.

✦ Contenu exact : [À COMPLÉTER]
✦ Dimensions du coffret : [À COMPLÉTER]
✦ Économie réalisée : [À COMPLÉTER]`;
    db.run("UPDATE products SET description = ? WHERE id = 18", [desc18], (err) => {
        if (err) console.error("Error updating description:", err.message);
        else console.log("Updated description for product 18");
    });

    // Update competitor price for Elixir Nocturne Vrac 50g (id: 15)
    db.run("UPDATE products SET competitor_label = '0.34€/tasse — moins cher qu''un café · Grande surface : ~0.85€/tasse', competitor_price = NULL WHERE id = 15", (err) => {
      if (err) console.error("Error updating competitor price:", err.message);
      else console.log("Updated competitor info for product 15");
    });

    // Update tagline_subtitle
    const stmt = db.prepare("UPDATE products SET tagline_subtitle = ? WHERE id = ?");
    updates.forEach(u => {
      stmt.run(u.subtitle, u.id);
    });
    stmt.finalize(() => {
      console.log("Updated tagline_subtitle for all products");
      db.close();
    });
  });
});
