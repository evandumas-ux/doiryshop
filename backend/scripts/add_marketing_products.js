const db = require('../database');

const products = [
  {
    name: "L'Essentiel - Base Pure en Vrac (30g)",
    slug: 'lessentiel-base-pure-vrac',
    categorie: 'vrac',
    tags: ['substitut'],
    price: 12.9,
    price_per_unit: 0.43,
    reference_market_price: 18.5,
    is_best_value: 0,
    short_description: "Notre base signature 100% feuilles de framboisier pour rouler sans tabac, sans nicotine.",
    description: "Un pochon de 30g de notre melange signature 100% feuilles de framboisier. La base parfaite pour rouler, sans tabac, sans nicotine. Doux pour la gorge, odeur discrete.",
    composition: "100% Feuilles de framboisier (Rubus idaeus) - Cultive en France",
    mode_utilisation: "Utiliser comme base de roulage avec des feuilles à cigarettes et un filtre.",
    stock: 100,
    weight_grams: 30,
    width_mm: 100,
    height_mm: 20,
    depth_mm: 70,
    unit_label: 'gramme',
    badge: '100% naturel',
    image_url: '/product_pack2.png',
    tagline: 'Le Rituel',
    type: 'secondary',
  },
  {
    name: "L'Instant - Pack de Pré-roulés (x3)",
    slug: 'linstant-pre-roules-x3',
    categorie: 'pre-roules',
    tags: ['substitut'],
    price: 6.9,
    price_per_unit: 2.3,
    reference_market_price: 2.5,
    is_best_value: 0,
    short_description: "Trois cones pre-remplis pour conserver le geste avec un format simple et propre.",
    description: "Etui elegant contenant 3 cones pre-remplis de notre melange L'Essentiel. Le rituel pret a l'emploi pour vos pauses. Pratique, propre, naturel.",
    composition: "Melange de feuilles de framboisier et molene - Cones en papier non blanchi",
    mode_utilisation: 'Pret a consommer. Allumer et savourer.',
    stock: 80,
    weight_grams: 15,
    width_mm: 110,
    height_mm: 25,
    depth_mm: 80,
    unit_label: 'pre-roule',
    badge: "Pret a l'emploi",
    image_url: '/product_pack.png',
    tagline: 'Le Rituel',
    type: 'secondary',
  },
  {
    name: "L'Instant - Pack de Pré-roulés (x5)",
    slug: 'linstant-pre-roules-x5',
    categorie: 'pre-roules',
    tags: ['substitut'],
    price: 10.9,
    price_per_unit: 2.18,
    reference_market_price: 2.5,
    is_best_value: 1,
    short_description: "Notre format le plus populaire pour garder votre rituel a portee de main.",
    description: "Etui elegant contenant 5 cones pre-remplis de notre melange L'Essentiel. Notre format le plus populaire. Le rituel pret a l'emploi, toujours dans votre poche.",
    composition: "Melange de feuilles de framboisier et molene - Cones en papier non blanchi",
    mode_utilisation: 'Pret a consommer. Allumer et savourer.',
    stock: 100,
    weight_grams: 25,
    width_mm: 110,
    height_mm: 25,
    depth_mm: 80,
    unit_label: 'pre-roule',
    badge: 'Meilleur choix',
    image_url: '/product_pack.png',
    tagline: 'Le Rituel',
    type: 'primary',
  },
  {
    name: 'Le Coffret Transition - Kit de Roulage',
    slug: 'coffret-transition-kit-roulage',
    categorie: 'kits',
    tags: ['substitut'],
    price: 24.9,
    price_per_unit: 24.9,
    reference_market_price: null,
    is_best_value: 0,
    short_description: "Le kit complet pour demarrer un rituel sans tabac, sans nicotine, avec les bons accessoires.",
    description: "Tout le necessaire pour un rituel propre et naturel. Inclut : 1 pochon L'Essentiel 30g + 1 carnet de feuilles a rouler non blanchies + 1 carnet de filtres en carton + 1 briquet Clipper noir. L'alternative ideale pour commencer votre sevrage tabagique.",
    composition: '100% Feuilles de framboisier + accessoires roulage (papier non blanchi, filtres carton)',
    mode_utilisation: "Versez le contenu du pochon dans une feuille a rouler, ajoutez un filtre et roulez.",
    stock: 50,
    weight_grams: 120,
    width_mm: 180,
    height_mm: 50,
    depth_mm: 140,
    unit_label: 'coffret',
    badge: 'Coffret cadeau',
    image_url: '/product_pack2.png',
    tagline: 'Le Rituel',
    type: 'secondary',
  },
  {
    name: "L'Elixir Nocturne - Infusion en Vrac (50g)",
    slug: 'elixir-nocturne-infusion-vrac',
    categorie: 'vrac',
    tags: ['tisanes'],
    price: 16.9,
    price_per_unit: 0.34,
    reference_market_price: 1.5,
    is_best_value: 0,
    short_description: "Un melange apaisant en vrac pour ralentir le soir et installer une routine douce.",
    description: 'Melange de plantes apaisantes en vrac, dont la valeriane. Une relaxation profonde, 100% naturelle. Conditionne en pochon kraft noir.',
    composition: 'Valeriane, melisse, passiflore, aubepine - Toutes plantes cultivees en Europe',
    mode_utilisation: "1 cuillere a cafe (3-5g) dans 250ml d'eau a 90C. Infuser 10 minutes couvert.",
    stock: 80,
    weight_grams: 50,
    width_mm: 120,
    height_mm: 30,
    depth_mm: 90,
    unit_label: 'gramme',
    badge: 'Detente nocturne',
    image_url: '/hero_botanical.png',
    tagline: "L'Apaisement",
    type: 'secondary',
  },
  {
    name: "L'Elixir Nocturne - Boite de 20 Infusettes",
    slug: 'elixir-nocturne-boite-20-sachets',
    categorie: 'tisanes',
    tags: ['tisanes'],
    price: 18.9,
    price_per_unit: 0.95,
    reference_market_price: 1.5,
    is_best_value: 1,
    short_description: 'Le format le plus pratique pour infuser votre dose de serenite a la maison comme au bureau.',
    description: '20 sachets individuels de notre infusion signature. Votre dose de serenite prete a infuser, au bureau ou en voyage. Pratique, elegant et puissant. Boite kraft recyclable.',
    composition: 'Valeriane, melisse, passiflore, aubepine - Sachets biodegradables',
    mode_utilisation: "1 sachet dans 250ml d'eau chaude. Infuser 8 a 10 minutes.",
    stock: 100,
    weight_grams: 60,
    width_mm: 140,
    height_mm: 40,
    depth_mm: 110,
    unit_label: 'sachet',
    badge: 'Meilleur choix',
    image_url: '/hero_botanical.png',
    tagline: "L'Apaisement",
    type: 'primary',
  },
  {
    name: "L'Elixir Nocturne - Boite de 10 Infusettes",
    slug: 'elixir-nocturne-boite-10-sachets',
    categorie: 'tisanes',
    tags: ['tisanes'],
    price: 10.9,
    price_per_unit: 1.09,
    reference_market_price: 1.5,
    is_best_value: 0,
    short_description: 'Le format decouverte pour tester notre infusion signature sans surstock.',
    description: "10 sachets individuels de notre infusion apaisante. Le format decouverte pour tester L'Elixir Nocturne. Ideal en cadeau ou pour un essai.",
    composition: 'Valeriane, melisse, passiflore, aubepine - Sachets biodegradables',
    mode_utilisation: "1 sachet dans 250ml d'eau chaude. Infuser 8 a 10 minutes.",
    stock: 60,
    weight_grams: 35,
    width_mm: 140,
    height_mm: 40,
    depth_mm: 110,
    unit_label: 'sachet',
    badge: 'Decouverte',
    image_url: '/hero_botanical.png',
    tagline: "L'Apaisement",
    type: 'secondary',
  },
  {
    name: 'Le Coffret Serenite - Kit Detente',
    slug: 'coffret-serenite-kit-detente',
    categorie: 'kits',
    tags: ['tisanes'],
    price: 34.9,
    price_per_unit: 34.9,
    reference_market_price: null,
    is_best_value: 0,
    short_description: 'Un coffret pret a offrir pour installer un moment de calme complet a la maison.',
    description: "Le cadeau parfait pour les amateurs de detente. Inclut : 1 pochon L'Elixir Nocturne 50g + 1 boite de 10 infusettes + 1 bougie soja parfumee lavande + 1 guide de meditation imprime.",
    composition: 'Melange plantes apaisantes + bougie soja naturelle + livret papier recycle',
    mode_utilisation: "Allumez la bougie, preparez votre infusion et laissez le calme s'installer.",
    stock: 30,
    weight_grams: 300,
    width_mm: 220,
    height_mm: 70,
    depth_mm: 180,
    unit_label: 'coffret',
    badge: 'Coffret cadeau',
    image_url: '/hero_botanical.png',
    tagline: "L'Apaisement",
    type: 'secondary',
  },
];

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });
}

async function insertProduct(product) {
  await run(
    `
      INSERT INTO products (
        name, slug, description, short_description, composition, mode_utilisation,
        price, price_per_unit, reference_market_price, image_url, stock, tagline, type, badge,
        categorie, tags, is_best_value, unit_label, weight_grams, height_mm, width_mm, depth_mm,
        status, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', 1)
    `,
    [
      product.name,
      product.slug,
      product.description,
      product.short_description,
      product.composition,
      product.mode_utilisation,
      product.price,
      product.price_per_unit,
      product.reference_market_price,
      product.image_url,
      product.stock,
      product.tagline,
      product.type,
      product.badge,
      product.categorie,
      JSON.stringify(product.tags),
      product.is_best_value,
      product.unit_label,
      product.weight_grams,
      product.height_mm,
      product.width_mm,
      product.depth_mm,
    ]
  );
}

async function main() {
  console.log('[add_marketing_products] start');
  await run('DELETE FROM products WHERE id <= 10');
  await run("DELETE FROM products WHERE slug IN (?, ?, ?, ?, ?, ?, ?, ?)", products.map((p) => p.slug));

  for (const product of products) {
    // eslint-disable-next-line no-await-in-loop
    await insertProduct(product);
    console.log(`[add_marketing_products] inserted: ${product.name}`);
  }

  console.log('[add_marketing_products] done');
  db.close();
}

main().catch((error) => {
  console.error('[add_marketing_products] error', error);
  try {
    db.close();
  } catch (_) {}
  process.exit(1);
});
