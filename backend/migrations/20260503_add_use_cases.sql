ALTER TABLE products ADD COLUMN use_cases TEXT;

UPDATE products
SET use_cases = '["Substitut de tabac pour vos mélanges botaniques","Pour des rituels à rouler naturels et raffinés","Transition tabac → plantes","Mélange CBD sans nicotine"]'
WHERE name = 'L''Essentiel Vrac 30g';

UPDATE products
SET use_cases = '["Prêt à consommer","Découverte sans engagement","Zéro préparation"]'
WHERE name = 'L''Instant x3';

UPDATE products
SET use_cases = '["Format quotidien","Zéro tabac zéro préparation","Best-seller"]'
WHERE name = 'L''Instant x5';

UPDATE products
SET use_cases = '["Arrêter le tabac progressivement","Kit complet débutant","Je roule moi-même"]'
WHERE name = 'Coffret Transition';

UPDATE products
SET use_cases = '["Rituel du soir","Aide à l''endormissement","Alternative sans fumée"]'
WHERE name = 'Élixir Nocturne Vrac 50g';

UPDATE products
SET use_cases = '["20 nuits apaisées","Pratique au bureau","Discret en voyage"]'
WHERE name = 'Élixir Nocturne x20';

UPDATE products
SET use_cases = '["Format découverte","Idéal en cadeau","Sans engagement"]'
WHERE name = 'Élixir Nocturne x10';

UPDATE products
SET use_cases = '["Cadeau détente idéal","Rituel du soir complet","Pour soi ou à offrir"]'
WHERE name = 'Coffret Sérénité';
