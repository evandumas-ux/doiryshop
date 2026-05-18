/**
 * Grilles tarifaires officielles La Poste 2026
 * Source : laposte.fr/tarifs-postaux-courrier-lettres-timbres
 * Valables depuis le 1er janvier 2026
 * France métropolitaine uniquement
 */

// Lettre Verte — J+3 — sans suivi
const LETTRE_VERTE_RATES = [
  { maxWeightG: 20,   price: 1.52 },
  { maxWeightG: 100,  price: 3.10 },
  { maxWeightG: 250,  price: 5.24 },
  { maxWeightG: 500,  price: 7.41 },
  { maxWeightG: 1000, price: 9.29 },
  { maxWeightG: 2000, price: 11.14 },
];

// Lettre Services Plus — J+2 — avec suivi + indemnisation
const LETTRE_SERVICES_PLUS_RATES = [
  { maxWeightG: 20,   price: 3.47 },
  { maxWeightG: 100,  price: 4.57 },
  { maxWeightG: 250,  price: 5.78 },
  { maxWeightG: 500,  price: 8.10 },
  { maxWeightG: 1000, price: 10.35 },
  { maxWeightG: 2000, price: 12.01 },
];

// Limites format lettre (commun aux deux services)
const LETTER_LIMITS = {
  maxWeightG: 2000,
  maxEpaisseurMm: 30,       // 3 cm
  maxLongueurMm: 600,       // 60 cm
  maxSommeDimensionsMm: 1000, // L + l + h <= 100 cm
  minLongueurMm: 140,       // 14 cm
  minLargeurMm: 90,         // 9 cm
};

/**
 * Vérifie si un colis rentre dans le format lettre
 * @param {number} weightG
 * @param {number} longueurMm
 * @param {number} largeurMm
 * @param {number} epaisseurMm
 * @returns {{ valid: boolean, reason: string|null }}
 */
function checkLetterFormat(weightG, longueurMm, largeurMm, epaisseurMm) {
  if (weightG > LETTER_LIMITS.maxWeightG) {
    return { valid: false, reason: `Poids ${weightG}g dépasse le maximum lettre (2 kg)` };
  }
  if (epaisseurMm > LETTER_LIMITS.maxEpaisseurMm) {
    return { valid: false, reason: `Épaisseur ${epaisseurMm}mm dépasse 30mm (3 cm max)` };
  }
  if (longueurMm > LETTER_LIMITS.maxLongueurMm) {
    return { valid: false, reason: `Longueur ${longueurMm}mm dépasse 600mm (60 cm max)` };
  }
  const somme = longueurMm + largeurMm + epaisseurMm;
  if (somme > LETTER_LIMITS.maxSommeDimensionsMm) {
    return { valid: false, reason: `Somme dimensions ${somme}mm dépasse 1000mm (100 cm max)` };
  }
  return { valid: true, reason: null };
}

/**
 * Calcule le prix d'une lettre
 * @param {number} weightG - poids en grammes
 * @param {'lettre_verte'|'lettre_services_plus'} service
 * @returns {{ price: number, service: string, delay: string, hasTracking: boolean }}
 */
function getLetterPrice(weightG, service) {
  const rates = service === 'lettre_services_plus'
    ? LETTRE_SERVICES_PLUS_RATES
    : LETTRE_VERTE_RATES;

  // S'assurer que le tableau est trié par poids croissant
  const sortedRates = [...rates].sort((a, b) => a.maxWeightG - b.maxWeightG);

  // Trouver la PREMIÈRE tranche dont le max >= poids réel
  const rate = sortedRates.find(r => weightG <= r.maxWeightG);

  if (!rate) {
    throw new Error('Poids trop élevé pour le format lettre (max 2 kg)');
  }

  return {
    price: rate.price,
    service,
    label: service === 'lettre_verte' ? 'Lettre Verte' : 'Lettre Services Plus',
    delay: service === 'lettre_verte' ? 'J+3' : 'J+2',
    hasTracking: service === 'lettre_services_plus',
    indemnisation: service === 'lettre_services_plus' ? '5€ si délai dépassé' : null,
    trancheLabel: `Jusqu'à ${rate.maxWeightG}g`,
  };
}

module.exports = {
  checkLetterFormat,
  getLetterPrice,
  LETTER_LIMITS,
};
