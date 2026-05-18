const packlink = require('../services/packlink');

function getAuthToken(req) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

function dbGet(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

function dbAll(db, query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

async function resolveOptionalUser(req, deps) {
  const token = getAuthToken(req);
  if (!token) return null;

  const { db, jwt, jwtVerify, SECRET_KEY, LOGTO_JWKS, LOGTO_ENDPOINT } = deps;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded?.id) return { id: decoded.id };
  } catch (_) {
    // fallback logto
  }

  try {
    const { payload } = await jwtVerify(token, LOGTO_JWKS, {
      issuer: `${LOGTO_ENDPOINT}/oidc`,
    });
    const logtoId = payload?.sub;
    if (!logtoId) return null;
    const user = await dbGet(db, 'SELECT id FROM users WHERE logto_id = ?', [logtoId]);
    return user ? { id: user.id } : null;
  } catch (_) {
    return null;
  }
}

function registerShippingRoutes(app, deps) {
  const { db } = deps;

  app.post('/api/shipping/rates', async (req, res) => {
    try {
      const { cartItems, destPostalCode, destCountryCode = 'FR' } = req.body || {};
      const { db } = deps;

      if (!cartItems || cartItems.length === 0) return res.status(400).json({ error: 'cartItems requis' });
      if (!destPostalCode) return res.status(400).json({ error: 'Code postal requis' });

      const productIds = cartItems.map(i => Number(i.productId)).filter(Boolean);
      if (productIds.length === 0) return res.status(400).json({ error: 'Aucun produit valide' });

      const placeholders = productIds.map(() => '?').join(',');
      const products = await dbAll(
        db,
        `SELECT id, weight_g, width_cm, height_cm, length_cm, price FROM products WHERE id IN (${placeholders})`,
        productIds
      );
      const byId = new Map(products.map(p => [p.id, p]));

      let totalWeight = 0;
      let maxWidth = 0, maxHeight = 0, maxLength = 0;
      let orderSubtotal = 0;
      for (const item of cartItems) {
        const product = byId.get(Number(item.productId));
        if (!product) continue;
        const qty = item.quantity || 1;
        
        totalWeight += ((product.weight_g || 50) * qty);
        maxWidth = Math.max(maxWidth, product.width_cm || 10);
        maxHeight = Math.max(maxHeight, (product.height_cm || 5) * qty);
        maxLength = Math.max(maxLength, product.length_cm || 15);
        
        orderSubtotal += Math.max(0, Number(product.price || 0)) * qty;
      }
      
      totalWeight += 50; // emballage
      
      const packages = [{
        weight: totalWeight / 1000,
        width: maxWidth || 10,
        height: maxHeight || 10,
        length: maxLength || 10
      }];
      if (orderSubtotal >= 35) {
        return res.json({
          rates: [
            { id: "doiryshop-offert", name: "Livraison via Doiryshop (96h)", carrier: "Doiryshop", price: 0, transitTime: "4 jours ouvrés", badge: "Suivi inclus 🌿", is_dropoff: false }
          ]
        });
      }

      let rates = [];
      try {
        if (!process.env.PACKLINK_API_KEY) throw new Error('PACKLINK_API_KEY undefined');
        rates = await packlink.fetchRates(destPostalCode, destCountryCode, packages, orderSubtotal);
      } catch (err) {
        console.error('Erreur appel Packlink, utilisation du fallback:', err.message);
        rates = [
          { id: "chronopost-shop2shop", name: "Chronopost Shop2Shop", carrier: "Chronopost", price: 3.54, transitTime: "3 jours ouvrés", is_dropoff: true },
          { id: "mondial-relay-relais", name: "Point Relais Mondial Relay", carrier: "Mondial Relay", price: 3.61, transitTime: "3-4 jours ouvrés", is_dropoff: true },
          { id: "mondial-relay-domicile", name: "Domicile Mondial Relay", carrier: "Mondial Relay", price: 5.98, transitTime: "3-4 jours ouvrés", is_dropoff: false }
        ];
      }
      
      return res.json({ rates });
    } catch (err) {
      console.error('Erreur rates:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/shipping/dropoffs', async (req, res) => {
    try {
      let { service_id, zip, country = 'FR' } = req.query;
      
      console.log(`[Dropoffs] Requête reçue: service_id=${service_id}, zip=${zip}, country=${country}`);
      
      if (!service_id || !zip) return res.status(400).json({ error: 'service_id et zip requis' });

      // Map fallback string IDs and carrier_product_ids to actual Packlink Service IDs
      const SERVICE_MAP = {
        'mondial-relay-relais': 30463, // Mondial Relay Point Relais
        'chronopost-shop2shop': 21511, // Chronopost Shop2Shop
        'ACI_CHRONOPOST_SHOP2SHOP_S2S_PRO': 21511,
        'ACI_MONDIAL_RELAY_S2S_POINT_RELAIS_DELIVERY_24R_XS': 30463,
        'ACI_MONDIAL_RELAY_S2H_HOME_DELIVERY_XS': 30407,
      };
      
      const realServiceId = SERVICE_MAP[service_id] || service_id;
      console.log(`[Dropoffs] Service ID résolu pour Packlink: ${realServiceId}`);

      const dropoffs = await packlink.getDropoffs(realServiceId, zip, country);
      console.log(`[Dropoffs] Résultat Packlink: ${dropoffs ? dropoffs.length : 0} relais trouvés.`);
      
      return res.json({ dropoffs });
    } catch (err) {
      console.error('[Dropoffs] Erreur:', err.message);
      return res.status(500).json({ error: err.message });
    }
  });
}

module.exports = { registerShippingRoutes };
