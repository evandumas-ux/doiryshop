const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.resolve(__dirname, 'database.sqlite'));

// SEO Keywords to integrate:
// "pré-roulé sans nicotine"
// "mélange de plantes à fumer"
// "alternative naturelle au tabac à base de feuilles de framboisier"
// "substitut de tabac premium"

const updates = [
  {
    id: 11, // L'Essentiel - Base Pure en Vrac (30g)
    description: "Notre mélange signature. Feuilles de framboisier sélectionnées à la main, séchées à l'air libre. Douces, discrètes, naturelles. Roulez votre propre rituel avec ce mélange de plantes à fumer — sans tabac, sans nicotine. Cette alternative naturelle au tabac à base de feuilles de framboisier est le substitut de tabac premium idéal pour un geste purifié.",
    short_description: "Substitut de tabac premium : un mélange de plantes à fumer 100% naturel, sans tabac ni nicotine. L'alternative naturelle au tabac à base de feuilles de framboisier."
  },
  {
    id: 12, // L'Instant - Pack de Pré-roulés (x3)
    description: "Le format test. Trois cônes pré-remplis pour découvrir Doiryshop sans engagement. Votre pré-roulé sans nicotine prêt à l'emploi. Idéal pour un premier essai ou un cadeau.",
    short_description: "Pack découverte de 3 unités de pré-roulé sans nicotine. Une alternative naturelle au tabac à base de feuilles de framboisier."
  },
  {
    id: 13, // L'Instant - Pack de Pré-roulés (x5)
    description: "Le format des convaincus. Cinq cônes pré-remplis, prêts à l'emploi. Chaque pré-roulé sans nicotine est conçu pour la discrétion et le naturel. Notre best-seller pour ceux qui cherchent un substitut de tabac premium.",
    short_description: "Pack de 5 unités de pré-roulé sans nicotine. Substitut de tabac premium prêt à l'emploi."
  },
  {
    id: 14, // Le Coffret Transition - Kit Roulage
    description: "Le kit complet pour changer vos habitudes. Comprend tout le nécessaire pour préparer votre mélange de plantes à fumer. Une alternative naturelle au tabac à base de feuilles de framboisier pour une transition en douceur vers un rituel sans nicotine.",
    short_description: "Le kit complet pour votre transition : mélange de plantes à fumer et accessoires."
  }
];

db.serialize(() => {
  updates.forEach(u => {
    db.run(
      "UPDATE products SET description = ?, short_description = ? WHERE id = ?",
      [u.description, u.short_description, u.id],
      (err) => {
        if (err) console.error(`Error updating product ${u.id}:`, err);
        else console.log(`Successfully updated SEO descriptions for product ID ${u.id}`);
      }
    );
  });
});
