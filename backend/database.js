const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur de connexion SQLite:', err.message);
  } else {
    console.log('Connecté à la base de données SQLite.');
  }
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT, /* Optional, used only for local fallback auth */
      logto_id TEXT UNIQUE,
      role TEXT DEFAULT 'client',
      prenom TEXT,
      nom TEXT,
      age INTEGER,
      telephone TEXT,
      adresse TEXT,
      complement_adresse TEXT,
      code_postal TEXT,
      ville TEXT,
      pays TEXT DEFAULT 'France',
      date_naissance TEXT,
      avatar_url TEXT,
      profil_complete INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration : ajout des colonnes profil pour les bases existantes
  // SQLite ne supporte pas IF NOT EXISTS sur ALTER TABLE, on utilise un try/catch via pragma
  const profileColumns = [
    { name: 'prenom', type: 'TEXT' },
    { name: 'nom', type: 'TEXT' },
    { name: 'age', type: 'INTEGER' },
    { name: 'telephone', type: 'TEXT' },
    { name: 'adresse', type: 'TEXT' },
    { name: 'complement_adresse', type: 'TEXT' },
    { name: 'code_postal', type: 'TEXT' },
    { name: 'ville', type: 'TEXT' },
    { name: 'pays', type: "TEXT DEFAULT 'France'" },
    { name: 'date_naissance', type: 'TEXT' },
    { name: 'avatar_url', type: 'TEXT' },
    { name: 'profil_complete', type: 'INTEGER DEFAULT 0' },
    { name: 'verification_code', type: 'TEXT' },
    { name: 'is_verified', type: 'INTEGER DEFAULT 0' },
    { name: 'verification_expires', type: 'DATETIME' },
  ];

  // Vérifier les colonnes existantes et ajouter celles qui manquent
  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (err || !columns) return;
    const existingCols = columns.map(c => c.name);
    profileColumns.forEach(col => {
      if (!existingCols.includes(col.name)) {
        db.run(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`, (err) => {
          if (err) {
            // La colonne existe probablement déjà, on ignore
          } else {
            console.log(`Colonne '${col.name}' ajoutée à la table users.`);
          }
        });
      }
    });
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      produits TEXT NOT NULL, /* JSON array */
      total REAL NOT NULL,
      statut_paiement TEXT DEFAULT 'payé',
      adresse_livraison TEXT, /* JSON string */
      shipping_method TEXT DEFAULT 'colissimo',
      shipping_price REAL DEFAULT 0,
      shipping_relay_data TEXT, /* JSON brut du point relais sélectionné - obsolète mais conservé pour compatibilité */
      relay_info TEXT, /* Nouvelles informations Mondial Relay - JSON string */
      relay_selection_mode TEXT, /* 'closest' ou 'manual' ou NULL */
      relay_address_text TEXT, /* Adresse manuelle du relais si manual */
      date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Migration: ajout des colonnes shipping pour les bases existantes
  db.all("PRAGMA table_info(orders)", (err, columns) => {
    if (err || !columns) return;
    const existingCols = columns.map(c => c.name);
    if (!existingCols.includes('shipping_method')) {
      db.run("ALTER TABLE orders ADD COLUMN shipping_method TEXT DEFAULT 'colissimo'", () => {});
    }
    if (!existingCols.includes('shipping_price')) {
      db.run("ALTER TABLE orders ADD COLUMN shipping_price REAL DEFAULT 0", () => {});
    }
    if (!existingCols.includes('admin_note')) {
      db.run("ALTER TABLE orders ADD COLUMN admin_note TEXT", () => {});
    }
    if (!existingCols.includes('packlink_reference')) {
      db.run("ALTER TABLE orders ADD COLUMN packlink_reference TEXT", () => {});
    }
    if (!existingCols.includes('tracking_number')) {
      db.run("ALTER TABLE orders ADD COLUMN tracking_number TEXT", () => {});
    }
    if (!existingCols.includes('shipping_relay_id')) {
      db.run("ALTER TABLE orders ADD COLUMN shipping_relay_id TEXT", () => {});
    }
    if (!existingCols.includes('shipping_relay_data')) {
      db.run("ALTER TABLE orders ADD COLUMN shipping_relay_data TEXT", () => {});
    }
    if (!existingCols.includes('relay_info')) {
      db.run("ALTER TABLE orders ADD COLUMN relay_info TEXT", () => {});
    }
    if (!existingCols.includes('relay_selection_mode')) {
      db.run("ALTER TABLE orders ADD COLUMN relay_selection_mode TEXT", () => {});
    }
    if (!existingCols.includes('relay_address_text')) {
      db.run("ALTER TABLE orders ADD COLUMN relay_address_text TEXT", () => {});
    }
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT,
      description TEXT,
      short_description TEXT,
      composition TEXT,
      mode_utilisation TEXT,
      price REAL NOT NULL,
      price_per_unit REAL,
      reference_market_price REAL,
      image_url TEXT,
      stock INTEGER DEFAULT 0,
      tagline TEXT,
      type TEXT DEFAULT 'secondary',
      badge TEXT,
      categorie TEXT DEFAULT 'vrac',
      tags TEXT,
      use_cases TEXT,
      is_best_value INTEGER DEFAULT 0,
      unit_label TEXT,
      images TEXT DEFAULT '[]',
      competitor_price REAL,
      competitor_label TEXT,
      savings_label TEXT,
      weight_g INTEGER DEFAULT 50,
      thickness_mm INTEGER DEFAULT 10,
      length_cm INTEGER DEFAULT 20,
      width_cm INTEGER DEFAULT 15,
      height_cm INTEGER DEFAULT 5,
      weight INTEGER DEFAULT 50,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration : ajout de la colonne categorie pour les bases existantes
  db.all("PRAGMA table_info(products)", (err, columns) => {
    if (err || !columns) return;
    const existingCols = columns.map(c => c.name);
    if (!existingCols.includes('categorie')) {
      db.run("ALTER TABLE products ADD COLUMN categorie TEXT DEFAULT 'vrac'", (err) => {
        if (!err) console.log("Colonne 'categorie' ajoutée à la table products.");
      });
    }
    if (!existingCols.includes('short_description')) {
      db.run("ALTER TABLE products ADD COLUMN short_description TEXT", () => {});
    }
    if (!existingCols.includes('images')) {
      db.run("ALTER TABLE products ADD COLUMN images TEXT DEFAULT '[]'", (err) => {
        if (!err) {
          console.log("Colonne 'images' ajoutée à la table products.");
          // Migration des anciennes URL vers le tableau JSON
          db.run(`UPDATE products SET images = '["' || image_url || '"]' WHERE image_url IS NOT NULL AND image_url != '' AND (images IS NULL OR images = '[]')`);
        }
      });
    }
    if (!existingCols.includes('slug')) {
      db.run("ALTER TABLE products ADD COLUMN slug TEXT", () => {});
    }
    if (!existingCols.includes('composition')) {
      db.run("ALTER TABLE products ADD COLUMN composition TEXT", () => {});
    }
    if (!existingCols.includes('mode_utilisation')) {
      db.run("ALTER TABLE products ADD COLUMN mode_utilisation TEXT", () => {});
    }
    if (!existingCols.includes('price_per_unit')) {
      db.run("ALTER TABLE products ADD COLUMN price_per_unit REAL", () => {});
    }
    if (!existingCols.includes('reference_market_price')) {
      db.run("ALTER TABLE products ADD COLUMN reference_market_price REAL", () => {});
    }
    if (!existingCols.includes('tags')) {
      db.run("ALTER TABLE products ADD COLUMN tags TEXT", () => {});
    }
    if (!existingCols.includes('use_cases')) {
      db.run("ALTER TABLE products ADD COLUMN use_cases TEXT", () => {});
    }
    if (!existingCols.includes('weight_g')) {
      db.run("ALTER TABLE products ADD COLUMN weight_g INTEGER DEFAULT 50", () => {});
    }
    if (!existingCols.includes('width_cm')) {
      db.run("ALTER TABLE products ADD COLUMN width_cm INTEGER DEFAULT 15", () => {});
    }
    if (!existingCols.includes('height_cm')) {
      db.run("ALTER TABLE products ADD COLUMN height_cm INTEGER DEFAULT 5", () => {});
    }
    if (!existingCols.includes('length_cm')) {
      db.run("ALTER TABLE products ADD COLUMN length_cm INTEGER DEFAULT 20", () => {});
    }
    if (!existingCols.includes('thickness_mm')) {
      db.run("ALTER TABLE products ADD COLUMN thickness_mm INTEGER DEFAULT 10", () => {});
    }
    if (!existingCols.includes('is_best_value')) {
      db.run("ALTER TABLE products ADD COLUMN is_best_value INTEGER DEFAULT 0", () => {});
    }
    if (!existingCols.includes('unit_label')) {
      db.run("ALTER TABLE products ADD COLUMN unit_label TEXT", () => {});
    }
    if (!existingCols.includes('weight')) {
      db.run("ALTER TABLE products ADD COLUMN weight INTEGER DEFAULT 50", () => {});
    }
    if (!existingCols.includes('status')) {
      db.run("ALTER TABLE products ADD COLUMN status TEXT DEFAULT 'published'", () => {});
    }
    if (!existingCols.includes('is_active')) {
      db.run("ALTER TABLE products ADD COLUMN is_active INTEGER DEFAULT 1", () => {});
    }
    if (!existingCols.includes('weight_grams')) {
      db.run("ALTER TABLE products ADD COLUMN weight_grams INTEGER DEFAULT 0", () => {});
    }
    if (!existingCols.includes('height_mm')) {
      db.run("ALTER TABLE products ADD COLUMN height_mm INTEGER DEFAULT 0", () => {});
    }
    if (!existingCols.includes('width_mm')) {
      db.run("ALTER TABLE products ADD COLUMN width_mm INTEGER DEFAULT 0", () => {});
    }
    if (!existingCols.includes('depth_mm')) {
      db.run("ALTER TABLE products ADD COLUMN depth_mm INTEGER DEFAULT 0", () => {});
    }

    const useCaseSeeds = [
      {
        slug: 'lessentiel-base-pure-vrac',
        names: ['L\'Essentiel Vrac 30g', 'L\'Essentiel - Base Pure en Vrac (30g)'],
        useCases: ['Substitut de tabac pour vos mélanges botaniques', 'Pour des rituels à rouler naturels et raffinés', 'Transition tabac → plantes', 'Mélange CBD sans nicotine'],
      },
      {
        slug: 'linstant-pre-roules-x3',
        names: ['L\'Instant x3', 'L\'Instant - Pack de Pré-roulés (x3)'],
        useCases: ['Prêt à consommer', 'Découverte sans engagement', 'Zéro préparation'],
      },
      {
        names: ['L\'Instant x5', 'L\'Instant - Pack de Pré-roulés (x5)'],
        like: "%Instant%x5%",
        useCases: ['Format quotidien', 'Zéro tabac zéro préparation', 'Best-seller'],
      },
      {
        slug: 'coffret-transition-kit-roulage',
        names: ['Coffret Transition', 'Le Coffret Transition - Kit de Roulage'],
        useCases: ['Arrêter le tabac progressivement', 'Kit complet débutant', 'Je roule moi-même'],
      },
      {
        slug: 'elixir-nocturne-infusion-vrac',
        names: ['Élixir Nocturne Vrac 50g', 'L\'Élixir Nocturne - Infusion en Vrac (50g)'],
        useCases: ['Rituel du soir', 'Aide à l\'endormissement', 'Alternative sans fumée'],
      },
      {
        slug: 'elixir-nocturne-boite-20-sachets',
        names: ['Élixir Nocturne x20', 'L\'Élixir Nocturne - Boîte de 20 Infusettes'],
        useCases: ['20 nuits apaisées', 'Pratique au bureau', 'Discret en voyage'],
      },
      {
        slug: 'elixir-nocturne-boite-10-sachets',
        names: ['Élixir Nocturne x10', 'L\'Élixir Nocturne - Boîte de 10 Infusettes'],
        useCases: ['Format découverte', 'Idéal en cadeau', 'Sans engagement'],
      },
      {
        slug: 'coffret-serenite-kit-detente',
        names: ['Coffret Sérénité', 'Le Coffret Sérénité - Kit Détente'],
        useCases: ['Cadeau détente idéal', 'Rituel du soir complet', 'Pour soi ou à offrir'],
      },
    ];

    useCaseSeeds.forEach(({ slug, names = [], like, useCases }) => {
      if (slug) {
        db.run('UPDATE products SET use_cases = ? WHERE slug = ?', [JSON.stringify(useCases), slug], () => {});
      }
      names.forEach((name) => {
        db.run('UPDATE products SET use_cases = ? WHERE name = ?', [JSON.stringify(useCases), name], () => {});
      });
      if (like) {
        db.run('UPDATE products SET use_cases = ? WHERE name LIKE ?', [JSON.stringify(useCases), like], () => {});
      }
    });
  });
  db.run(`
    CREATE TABLE IF NOT EXISTS carts (
      user_id INTEGER PRIMARY KEY,
      items TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      valeur REAL NOT NULL,
      date_expiration DATETIME,
      nombre_utilisations_max INTEGER,
      nombre_utilisations_actuel INTEGER DEFAULT 0,
      actif INTEGER DEFAULT 1,
      date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS newsletter (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      source TEXT DEFAULT 'footer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table des avis clients
  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      note INTEGER NOT NULL CHECK(note >= 1 AND note <= 5),
      commentaire TEXT,
      photos TEXT, /* JSON array of URLs */
      verifie INTEGER DEFAULT 0,
      date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(product_id) REFERENCES products(id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  // Migration : ajout de la colonne photos pour les bases existantes
  db.all("PRAGMA table_info(reviews)", (err, columns) => {
    if (err || !columns) return;
    const existingCols = columns.map(c => c.name);
    if (!existingCols.includes('photos')) {
      db.run("ALTER TABLE reviews ADD COLUMN photos TEXT", () => {});
    }
  });

  // Un seul avis par utilisateur par produit
  db.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_user_product
    ON reviews(product_id, user_id)
  `);

  // ============================================================
  // TABLES PROGRAMME DE FIDÉLITÉ "LES PLUMES"
  // ============================================================

  db.run(`
    CREATE TABLE IF NOT EXISTS loyalty_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      points_actuels INTEGER DEFAULT 0,
      points_cumules_total INTEGER DEFAULT 0,
      niveau TEXT DEFAULT 'initie',
      date_mise_a_jour DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS loyalty_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      points INTEGER NOT NULL,
      type TEXT NOT NULL,
      raison TEXT NOT NULL,
      reference_id INTEGER,
      date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Migrations explicites programme fidélité
  const migrations = [
    "ALTER TABLE users ADD COLUMN parrain_id INTEGER",
    "ALTER TABLE users ADD COLUMN code_parrainage TEXT",
    "ALTER TABLE users ADD COLUMN anniversaire_utilise INTEGER DEFAULT 0"
  ];

  migrations.forEach(sql => {
    db.run(sql, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.log('Migration ignorée (colonne existante):', sql);
      } else if (!err) {
        console.log('Migration réussie:', sql);
      }
    });
  });

  db.run(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_code_parrainage
    ON users(code_parrainage)
    WHERE code_parrainage IS NOT NULL
  `, (err) => {
    if (err && !err.message.includes('already exists')) {
      console.log('Migration index ignorée:', err.message);
    }
  });
});

module.exports = db;
