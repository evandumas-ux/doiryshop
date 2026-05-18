const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const seeds = [
  {
    slug: 'lessentiel-base-pure-vrac',
    useCases: ['Remplace le tabac dans un joint', 'Pour rouleurs de clopes naturelles', 'Transition tabac → plantes', 'Mélange CBD sans nicotine'],
  },
  {
    slug: 'linstant-pre-roules-x3',
    useCases: ['Prêt à consommer', 'Découverte sans engagement', 'Zéro préparation'],
  },
  {
    slug: null,
    like: '%Instant%x5%',
    useCases: ['Format quotidien', 'Zéro tabac zéro préparation', 'Best-seller'],
  },
  {
    slug: 'coffret-transition-kit-roulage',
    useCases: ['Arrêter le tabac progressivement', 'Kit complet débutant', 'Je roule moi-même'],
  },
  {
    slug: 'elixir-nocturne-infusion-vrac',
    useCases: ['Rituel du soir', "Aide à l'endormissement", 'Alternative sans fumée'],
  },
  {
    slug: 'elixir-nocturne-boite-20-sachets',
    useCases: ['20 nuits apaisées', 'Pratique au bureau', 'Discret en voyage'],
  },
  {
    slug: 'elixir-nocturne-boite-10-sachets',
    useCases: ['Format découverte', 'Idéal en cadeau', 'Sans engagement'],
  },
  {
    slug: 'coffret-serenite-kit-detente',
    useCases: ['Cadeau détente idéal', 'Rituel du soir complet', 'Pour soi ou à offrir'],
  },
];

let pending = seeds.length;
seeds.forEach(({ slug, like, useCases }) => {
  const sql = slug
    ? 'UPDATE products SET use_cases = ? WHERE slug = ?'
    : 'UPDATE products SET use_cases = ? WHERE name LIKE ?';
  const target = slug || like;
  db.run(
    sql,
    [JSON.stringify(useCases), target],
    (err) => {
      if (err) {
        console.error(`Erreur update ${target}:`, err.message);
      }
      pending -= 1;
      if (pending === 0) {
        console.log('use_cases mis à jour.');
        db.close();
      }
    }
  );
});
