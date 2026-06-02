const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.resolve(__dirname, 'database.sqlite'));

const descriptions = {
  // L'Essentiel
  "lessentiel-base-pure-vrac": {
    desc: `Notre mélange signature. Feuilles de framboisier
    sélectionnées à la main, séchées à l'air libre. Douces, discrètes, naturelles.
    Roulez votre propre rituel — sans tabac, sans nicotine. Juste le geste,
    purifié.`,
    img: '/images/vrac preroll.png'
  },

  // L'Instant x5
  "linstant-pre-roules-x5": {
    desc: `Le format des convaincus. Cinq cônes pré-remplis,
    prêts à l'emploi. Glissez-en un dans votre poche le matin, sortez-le le soir.
    Propre. Discret. Naturel. Notre best-seller.`,
    img: '/images/pack-5-open.png'
  },

  // L'Instant x3
  "linstant-pre-roules-x3": {
    desc: `Le format test. Trois cônes pré-remplis pour découvrir
    Doiryshop sans engagement. Idéal pour un premier essai ou un cadeau.`,
    img: '/images/pack-3-open.png'
  },

  // Coffret Transition
  "coffret-transition-kit-roulage": {
    desc: `Tout pour rouler, rien à chercher. Pochon,
    feuilles non blanchies, filtres en carton, briquet Clipper noir. Le kit
    complet pour ceux qui veulent reprendre le contrôle — proprement.`,
    img: '/images/coffretfumer.png'
  },

  // L'Élixir Nocturne 50g
  "elixir-nocturne-infusion-vrac": {
    desc: `Feuilles de framboisier et camomille.
    Deux plantes, un seul but : calmer. Infusez 10 minutes, laissez faire.
    Le sommeil ne se force pas — il s'accompagne.`,
    img: '/images/vracthe.png'
  },

  // Boîte 20 infusettes
  "elixir-nocturne-boite-20-sachets": {
    desc: `20 nuits apaisées, une boîte. Pratique au
    bureau, discret en voyage, puissant à la maison. Votre dose de sérénité,
    toujours à portée de main.`,
    img: '/images/boite_infusion_kraft.png'
  },

  // Boîte 10 infusettes
  "elixir-nocturne-boite-10-sachets": {
    desc: `Le format découverte. Dix sachets pour tester
    L'Élixir Nocturne sans commitment. Idéal en cadeau ou pour un essai.`,
    img: '/images/boite_infusion_kraft.png'
  },

  // Coffret Sérénité
  "coffret-serenite-kit-detente": {
    desc: `Le cadeau qui dit "prends soin de toi".
    Infusion apaisante, bougie lavande, livret de méditation. Tout ce qu'il
    faut pour un moment de calme — offert à quelqu'un, ou à soi-même.`,
    img: '/images/coffret_complet_flatlay.png'
  },
};

db.serialize(() => {
  const stmt = db.prepare('UPDATE products SET short_description = ?, description = ?, image_url = ? WHERE slug = ?');
  
  for (const [slug, data] of Object.entries(descriptions)) {
    // Clean up whitespace formatting
    const cleanDesc = data.desc.replace(/\n\s+/g, ' ');
    stmt.run(cleanDesc, cleanDesc, data.img, slug);
  }
  
  stmt.finalize(() => {
    console.log('Descriptions and images updated successfully.');
    db.close();
  });
});
