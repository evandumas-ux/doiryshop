const axios = require('axios');

const getApiKey = () => process.env.PACKLINK_API_KEY || '277a0577580b4b2c0700b42feedf643f9bc5a85eb2353fa67f9577f04d82291a';
const API_URL = 'https://api.packlink.com/v1';

const SENDER_ZIP = '67300'; // Schiltigheim
const SENDER_COUNTRY = 'FR';

const getHeaders = () => {
  const key = getApiKey();
  if (!key) {
    console.warn("ATTENTION: PACKLINK_API_KEY manquante dans .env");
  }
  return {
    'Authorization': key,
    'Content-Type': 'application/json'
  };
};

/**
 * Récupère les tarifs depuis Packlink pour un code postal et un poids
 */
const fetchRates = async (destZip, destCountry = 'FR', packages, orderSubtotal = 0) => {
  try {
    const response = await axios.get(`${API_URL}/services`, {
      headers: getHeaders(),
      params: {
        'from[country]': SENDER_COUNTRY,
        'from[zip]': SENDER_ZIP,
        'to[country]': destCountry,
        'to[zip]': destZip,
        'packages[0][weight]': packages[0].weight,
        'packages[0][width]': packages[0].width,
        'packages[0][height]': packages[0].height,
        'packages[0][length]': packages[0].length
      }
    });

    const allServices = response.data || [];

    // Console log pour débogage
    console.log("Services Packlink retournés:", JSON.stringify(allServices, null, 2));

    const ALLOWED_SERVICE_IDS = [30463, 20247, 21511];

    let filteredRates = allServices
      .filter(service => service && service.carrier && service.name)
      .filter(service => ALLOWED_SERVICE_IDS.includes(Number(service.id)))
      .map(s => ({
        id: s.id || '',
        carrier: s.carrier || '',
        name: s.name || '',
        price: s.price?.total_price ?? s.price?.base_price ?? 0,
        currency: s.price?.currency || 'EUR',
        transit_hours: s.transit_hours || null,
        is_dropoff: s.category === 'dropoff',
        details: s
      }));

    if (orderSubtotal >= 35) {
      filteredRates.unshift({
        id: 'free',
        name: 'Livraison offerte 🌿',
        carrier: 'Doiryshop',
        price: 0,
        transit_hours: 96,
        is_dropoff: false
      });
    }

    return filteredRates;
  } catch (error) {
    console.error("Packlink fetchRates error:", error?.response?.data || error.message);
    throw new Error('Erreur lors de la récupération des tarifs Packlink');
  }
};

/**
 * Récupère les points relais pour un code postal et un service Packlink
 */
const getDropoffs = async (serviceId, zip, country = 'FR') => {
  const url = `${API_URL}/dropoffs`;
  const params = { service_id: serviceId, country: country, zip: zip };
  
  console.log(`[Packlink API] GET ${url}`);
  console.log(`[Packlink API] Query Params:`, params);

  try {
    const response = await axios.get(url, {
      params: params,
      headers: getHeaders()
    });
    console.log(`[Packlink API] Status: ${response.status}`);
    return response.data;
  } catch (error) {
    console.error(`[Packlink API] Erreur Status:`, error?.response?.status);
    console.error(`[Packlink API] Erreur Body:`, error?.response?.data || error.message);
    throw new Error(error?.response?.data?.message || `Erreur API Packlink (${error?.response?.status || 'Inconnu'})`);
  }
};

/**
 * Crée une expédition (Shipment)
 */
const createShipment = async (orderData) => {
  try {
    const payload = {
      service: orderData.serviceId,
      content: "Produits de bien-être",
      contentvalue: orderData.total,
      packages: orderData.packages,
      from: {
        name: "Doiryshop",
        surname: "Expédition",
        street1: "Votre rue (à compléter)",
        city: "Schiltigheim",
        zip: SENDER_ZIP,
        country: SENDER_COUNTRY,
        phone: "0600000000",
        email: "contact@doiryshop.fr"
      },
      to: {
        name: orderData.client.name,
        surname: orderData.client.surname,
        street1: orderData.client.street,
        zip: orderData.client.zip,
        city: orderData.client.city,
        country: orderData.client.country || 'FR',
        phone: orderData.client.phone || "0600000000",
        email: orderData.client.email
      }
    };

    // Si point relais
    if (orderData.dropoffId) {
      payload.dropoff_point_id = orderData.dropoffId;
    }

    const response = await axios.post(`${API_URL}/shipments`, payload, {
      headers: getHeaders()
    });

    return response.data; // contient { reference: 'FR...' }
  } catch (error) {
    console.error("Packlink createShipment error:", error?.response?.data || error.message);
    throw new Error('Erreur lors de la création de l\'expédition Packlink');
  }
};

/**
 * Récupère les labels (bordereaux) pour une expédition
 */
const getLabels = async (reference) => {
  try {
    const response = await axios.get(`${API_URL}/shipments/${reference}/labels`, {
      headers: getHeaders()
    });
    return response.data; // ex: [ "https://..." ]
  } catch (error) {
    console.error("Packlink getLabels error:", error?.response?.data || error.message);
    throw new Error('Erreur lors de la récupération du bordereau Packlink');
  }
};

module.exports = {
  fetchRates,
  getDropoffs,
  createShipment,
  getLabels
};
