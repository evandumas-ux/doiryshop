// Colissimo API La Poste
// Doc officielle : https://www.laposte.fr/colissimo/nos-solutions/colissimo-access

const COLISSIMO_LOGIN = process.env.COLISSIMO_LOGIN;
const COLISSIMO_PASSWORD = process.env.COLISSIMO_PASSWORD;
const COLISSIMO_API_URL = process.env.COLISSIMO_API_URL
  || 'https://ws.colissimo.fr/sls-ws/SlsServiceWSRest/2.0/';

const PLACEHOLDERS = ['ton_login_laposte', 'ton_mot_de_passe_laposte', '', null, undefined];

async function getShippingRate({ destCountryCode, destPostalCode, weightGrams }) {
  if (PLACEHOLDERS.includes(COLISSIMO_LOGIN) || PLACEHOLDERS.includes(COLISSIMO_PASSWORD)) {
    throw new Error('__NO_CREDENTIALS__');
  }

  const weightKg = Math.max(0.001, Number(weightGrams || 0) / 1000);
  const endpoint = `${COLISSIMO_API_URL.replace(/\/+$/, '/') }getProductInter`;

  const body = {
    login: COLISSIMO_LOGIN,
    password: COLISSIMO_PASSWORD,
    countryCode: destCountryCode,
    postalCode: destPostalCode,
    weight: weightKg,
    product: destCountryCode === 'FR' ? 'DOM' : 'COLI',
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Colissimo API error: ${response.status}`);
  }

  const data = await response.json();
  const statusId = data?.messages?.id || data?.messages?.[0]?.id;
  const hasSuccessCode = String(statusId) === '0';
  const parsedPrice = Number.parseFloat(data?.price);
  const price = Number.isFinite(parsedPrice) ? parsedPrice : null;

  if (!hasSuccessCode || price === null) {
    const message = data?.messages?.[0]?.messageContent
      || data?.messages?.messageContent
      || 'Erreur inconnue';
    throw new Error(`Colissimo: ${message}`);
  }

  return { price, product: data.product || body.product };
}

module.exports = { getShippingRate };
