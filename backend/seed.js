const bcrypt = require('bcrypt');
const db = require('./database');

const defaultProducts = [
  {
    name: "L'Essentiel - Base Pure en Vrac (30g)",
    slug: 'lessentiel-base-pure-vrac',
    short_description: "Notre base signature 100% feuilles de framboisier pour rouler sans tabac, sans nicotine.",
    description: "Un pochon de 30g de notre melange signature 100% feuilles de framboisier. La base parfaite pour rouler, sans tabac, sans nicotine. Doux pour la gorge, odeur discrete.",
    composition: "100% Feuilles de framboisier (Rubus idaeus) - Cultive en France",
    mode_utilisation: "Utiliser comme base de roulage avec des feuilles à cigarettes et un filtre.",
    price: 12.9,
    price_per_unit: 0.43,
    reference_market_price: 18.5,
    image_url: '/product_pack2.png',
    stock: 100,
    tagline: 'Le Rituel',
    type: 'secondary',
    badge: '100% naturel',
    categorie: 'vrac',
    tags: JSON.stringify(['substitut']),
    is_best_value: 0,
    unit_label: 'gramme',
    weight_grams: 30,
    width_mm: 100,
    height_mm: 20,
    depth_mm: 70,
  },
  {
    name: "L'Instant - Pack de Pré-roulés (x3)",
    slug: 'linstant-pre-roules-x3',
    short_description: "Trois cones pre-remplis pour conserver le geste avec un format simple et propre.",
    description: "Etui elegant contenant 3 cones pre-remplis de notre melange L'Essentiel. Le rituel pret a l'emploi pour vos pauses. Pratique, propre, naturel.",
    composition: "Melange de feuilles de framboisier et molene - Cones en papier non blanchi",
    mode_utilisation: 'Pret a consommer. Allumer et savourer.',
    price: 6.9,
    price_per_unit: 2.3,
    reference_market_price: 2.5,
    image_url: '/product_pack.png',
    stock: 80,
    tagline: 'Le Rituel',
    type: 'secondary',
    badge: "Pret a l'emploi",
    categorie: 'pre-roules',
    tags: JSON.stringify(['substitut']),
    is_best_value: 0,
    unit_label: 'pre-roule',
    weight_grams: 15,
    width_mm: 110,
    height_mm: 25,
    depth_mm: 80,
  },
  {
    name: "L'Instant - Pack de Pré-roulés (x5)",
    slug: 'linstant-pre-roules-x5',
    short_description: "Notre format le plus populaire pour garder votre rituel a portee de main.",
    description: "Etui elegant contenant 5 cones pre-remplis de notre melange L'Essentiel. Notre format le plus populaire. Le rituel pret a l'emploi, toujours dans votre poche.",
    composition: "Melange de feuilles de framboisier et molene - Cones en papier non blanchi",
    mode_utilisation: 'Pret a consommer. Allumer et savourer.',
    price: 10.9,
    price_per_unit: 2.18,
    reference_market_price: 2.5,
    image_url: '/product_pack.png',
    stock: 100,
    tagline: 'Le Rituel',
    type: 'primary',
    badge: 'Meilleur choix',
    categorie: 'pre-roules',
    tags: JSON.stringify(['substitut']),
    is_best_value: 1,
    unit_label: 'pre-roule',
    weight_grams: 25,
    width_mm: 110,
    height_mm: 25,
    depth_mm: 80,
  },
  {
    name: 'Le Coffret Transition - Kit de Roulage',
    slug: 'coffret-transition-kit-roulage',
    short_description: "Le kit complet pour demarrer un rituel sans tabac, sans nicotine, avec les bons accessoires.",
    description: "Tout le necessaire pour un rituel propre et naturel. Inclut : 1 pochon L'Essentiel 30g + 1 carnet de feuilles a rouler non blanchies + 1 carnet de filtres en carton + 1 briquet Clipper noir. L'alternative ideale pour commencer votre sevrage tabagique.",
    composition: '100% Feuilles de framboisier + accessoires roulage (papier non blanchi, filtres carton)',
    mode_utilisation: "Versez le contenu du pochon dans une feuille a rouler, ajoutez un filtre et roulez.",
    price: 24.9,
    price_per_unit: 24.9,
    reference_market_price: null,
    image_url: '/product_pack2.png',
    stock: 50,
    tagline: 'Le Rituel',
    type: 'secondary',
    badge: 'Coffret cadeau',
    categorie: 'kits',
    tags: JSON.stringify(['substitut']),
    is_best_value: 0,
    unit_label: 'coffret',
    weight_grams: 120,
    width_mm: 180,
    height_mm: 50,
    depth_mm: 140,
  },
  {
    name: "L'Elixir Nocturne - Infusion en Vrac (50g)",
    slug: 'elixir-nocturne-infusion-vrac',
    short_description: "Un melange apaisant en vrac pour ralentir le soir et installer une routine douce.",
    description: 'Melange de plantes apaisantes en vrac, dont la valeriane. Une relaxation profonde, 100% naturelle. Conditionne en pochon kraft noir.',
    composition: 'Valeriane, melisse, passiflore, aubepine - Toutes plantes cultivees en Europe',
    mode_utilisation: "1 cuillere a cafe (3-5g) dans 250ml d'eau a 90C. Infuser 10 minutes couvert.",
    price: 16.9,
    price_per_unit: 0.34,
    reference_market_price: 1.5,
    image_url: '/hero_botanical.png',
    stock: 80,
    tagline: "L'Apaisement",
    type: 'secondary',
    badge: 'Detente nocturne',
    categorie: 'vrac',
    tags: JSON.stringify(['tisanes']),
    is_best_value: 0,
    unit_label: 'gramme',
    weight_grams: 50,
    width_mm: 120,
    height_mm: 30,
    depth_mm: 90,
  },
  {
    name: "L'Elixir Nocturne - Boite de 20 Infusettes",
    slug: 'elixir-nocturne-boite-20-sachets',
    short_description: 'Le format le plus pratique pour infuser votre dose de serenite a la maison comme au bureau.',
    description: '20 sachets individuels de notre infusion signature. Votre dose de serenite prete a infuser, au bureau ou en voyage. Pratique, elegant et puissant. Boite kraft recyclable.',
    composition: 'Valeriane, melisse, passiflore, aubepine - Sachets biodegradables',
    mode_utilisation: "1 sachet dans 250ml d'eau chaude. Infuser 8 a 10 minutes.",
    price: 18.9,
    price_per_unit: 0.95,
    reference_market_price: 1.5,
    image_url: '/hero_botanical.png',
    stock: 100,
    tagline: "L'Apaisement",
    type: 'primary',
    badge: 'Meilleur choix',
    categorie: 'tisanes',
    tags: JSON.stringify(['tisanes']),
    is_best_value: 1,
    unit_label: 'sachet',
    weight_grams: 60,
    width_mm: 140,
    height_mm: 40,
    depth_mm: 110,
  },
  {
    name: "L'Elixir Nocturne - Boite de 10 Infusettes",
    slug: 'elixir-nocturne-boite-10-sachets',
    short_description: 'Le format decouverte pour tester notre infusion signature sans surstock.',
    description: "10 sachets individuels de notre infusion apaisante. Le format decouverte pour tester L'Elixir Nocturne. Ideal en cadeau ou pour un essai.",
    composition: 'Valeriane, melisse, passiflore, aubepine - Sachets biodegradables',
    mode_utilisation: "1 sachet dans 250ml d'eau chaude. Infuser 8 a 10 minutes.",
    price: 10.9,
    price_per_unit: 1.09,
    reference_market_price: 1.5,
    image_url: '/hero_botanical.png',
    stock: 60,
    tagline: "L'Apaisement",
    type: 'secondary',
    badge: 'Decouverte',
    categorie: 'tisanes',
    tags: JSON.stringify(['tisanes']),
    is_best_value: 0,
    unit_label: 'sachet',
    weight_grams: 35,
    width_mm: 140,
    height_mm: 40,
    depth_mm: 110,
  },
  {
    name: 'Le Coffret Serenite - Kit Detente',
    slug: 'coffret-serenite-kit-detente',
    short_description: 'Un coffret pret a offrir pour installer un moment de calme complet a la maison.',
    description: "Le cadeau parfait pour les amateurs de detente. Inclut : 1 pochon L'Elixir Nocturne 50g + 1 boite de 10 infusettes + 1 bougie soja parfumee lavande + 1 guide de meditation imprime.",
    composition: 'Melange plantes apaisantes + bougie soja naturelle + livret papier recycle',
    mode_utilisation: "Allumez la bougie, preparez votre infusion et laissez le calme s'installer.",
    price: 34.9,
    price_per_unit: 34.9,
    reference_market_price: null,
    image_url: '/hero_botanical.png',
    stock: 30,
    tagline: "L'Apaisement",
    type: 'secondary',
    badge: 'Coffret cadeau',
    categorie: 'kits',
    tags: JSON.stringify(['tisanes']),
    is_best_value: 0,
    unit_label: 'coffret',
    weight_grams: 300,
    width_mm: 220,
    height_mm: 70,
    depth_mm: 180,
  },
];

async function seed() {
  console.log('Debut du seed de la base de donnees...');

  db.serialize(async () => {
    db.run('DROP TABLE IF EXISTS carts');
    db.run('DROP TABLE IF EXISTS orders');
    db.run('DROP TABLE IF EXISTS products');
    db.run('DROP TABLE IF EXISTS users');

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        logto_id TEXT UNIQUE,
        role TEXT DEFAULT 'client',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        produits TEXT NOT NULL,
        total REAL NOT NULL,
        statut_paiement TEXT DEFAULT 'paye',
        adresse_livraison TEXT,
        date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

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
        is_best_value INTEGER DEFAULT 0,
        unit_label TEXT,
        weight_grams INTEGER DEFAULT 0,
        height_mm INTEGER DEFAULT 0,
        width_mm INTEGER DEFAULT 0,
        depth_mm INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS carts (
        user_id INTEGER PRIMARY KEY,
        items TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    const stmt = db.prepare(`
      INSERT INTO products (
        name, slug, description, short_description, composition, mode_utilisation,
        price, price_per_unit, reference_market_price, image_url, stock, tagline, type, badge,
        categorie, tags, is_best_value, unit_label, weight_grams, height_mm, width_mm, depth_mm
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    defaultProducts.forEach((p) => {
      stmt.run(
        p.name,
        p.slug,
        p.description,
        p.short_description,
        p.composition,
        p.mode_utilisation,
        p.price,
        p.price_per_unit,
        p.reference_market_price,
        p.image_url,
        p.stock,
        p.tagline,
        p.type,
        p.badge,
        p.categorie,
        p.tags,
        p.is_best_value,
        p.unit_label,
        p.weight_grams,
        p.height_mm,
        p.width_mm,
        p.depth_mm
      );
    });
    stmt.finalize();
    console.log('Produits par defaut inseres.');

    const adminEmail = 'admin@emile.fr';
    const adminPass = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPass, 10);

    db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Administrateur', adminEmail, hashedPassword, 'admin'],
      function onInsert(err) {
        if (err) {
          console.error("Erreur lors de la creation de l'admin:", err.message);
          return;
        }

        console.log(`Compte admin cree avec succes ! Email: ${adminEmail}, Password: ${adminPass}`);
        db.run(
          'INSERT INTO orders (user_id, produits, total, statut_paiement, adresse_livraison) VALUES (?, ?, ?, ?, ?)',
          [
            this.lastID,
            JSON.stringify([{ id: 1, name: defaultProducts[0].name, price: defaultProducts[0].price, quantity: 1 }]),
            defaultProducts[0].price,
            'paye',
            JSON.stringify({ address: '1 rue de la Paix', city: 'Paris', zip: '75000', country: 'France' }),
          ],
          (orderErr) => {
            if (orderErr) {
              console.error('Erreur lors de la creation de la commande de test:', orderErr.message);
            } else {
              console.log('Commande de test creee avec succes !');
            }
          }
        );
      }
    );
  });
}

seed();
