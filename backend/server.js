process.on('uncaughtException', (err) => {
  console.error('[CRASH uncaughtException]', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRASH unhandledRejection]', reason);
});

require('dotenv').config();
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

console.log('Toutes les vars env chargées:', {
  RESEND_API_KEY: process.env.RESEND_API_KEY ? 'OK' : 'UNDEFINED'
});
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { jwtVerify, createRemoteJWKSet } = require('jose');
const db = require('./database');
const { seedDatabase } = require('./seed');
seedDatabase();

const { sendOrderConfirmation, sendWelcomeEmail, sendOrderShippedEmail, sendVerificationCodeEmail, sendCustomWelcomeEmail } = require('./emails');
const { generateInvoicePDF } = require('./invoice');

const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Trop de tentatives, réessayez dans 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Trop de requêtes, réessayez dans 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false
});

const app = express();

// ============================================================
// ROUTE HEALTH CHECK (UptimeRobot, etc.)
// Doit être avant les middlewares lourds pour répondre vite
// ============================================================
app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    service: "doiryshop-api",
    timestamp: new Date().toISOString()
  });
});

app.set('trust proxy', 1);
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // désactivé pour éviter de casser le frontend React en dev
}));
app.use((req, res, next) => {
  res.setHeader('X-DoiryShop-Backend', 'cors-fix-v3');
  next();
});
const PORT = 3001;
const SECRET_KEY = process.env.JWT_SECRET || process.env.SECRET_KEY || 'votre_cle_secrete_super_securisee_ici';

const parseJsonArrayField = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
};

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = ['https://doiryshop.com', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Permet les requêtes sans origine (comme les outils Postman ou les requêtes internes)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'La politique CORS de ce site ne permet pas l\'accès depuis l\'origine spécifiée.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

app.use((req, res, next) => {
  if (req.url.startsWith('/api/auth')) {
    console.log('[AUTH LIVE]', req.method, req.url, 'origin=', req.headers.origin);
  }
  next();
});
// ... reste du code ...

// ============================================================
// MIDDLEWARES D'AUTHENTIFICATION
// ============================================================

app.use((req, res, next) => {
  const originalSetHeader = res.setHeader.bind(res);
  res.setHeader = (name, value) => {
    if (String(name).toLowerCase().includes('access-control')) {
      console.log('[CORS DEBUG]', req.method, req.url, '=>', name, value);
    }
    return originalSetHeader(name, value);
  };
  next();
});

/**
 * Middleware d'authentification flexible.
 * Supporte les JWT locaux (signés avec SECRET_KEY).
 */
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ error: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    
    console.log('[AUTH] Requête authentifiée:', decoded.email, 'Role:', decoded.role);

    req.user = {
      id:    decoded.id || decoded.sub || null,
      email: decoded.email || null,
      role:  decoded.role || 'client',
      name:  decoded.name || null
    };
    next();
  } catch (err) {
    console.error('[AUTH] Erreur verification token:', err.message);
    return res.status(401).json({ error: 'Token invalide ou expiré' });
  }
};

const optionalAuth = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = {
      id:    decoded.id || decoded.sub || null,
      email: decoded.email || null,
      role:  decoded.role || 'client',
      name:  decoded.name || null
    };
  } catch (err) {
    req.user = null;
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès interdit. Rôle administrateur requis.' });
  }
  next();
};


// ─── TARIFS LA POSTE 2026 (source officielle laposte.fr) ───────────────────

const SHIPPING_OPTIONS = {
  LETTRE_VERTE_SUIVIE: {
    id: 'LETTRE_VERTE_SUIVIE',
    label: 'Lettre Verte Suivie',
    description: 'Livraison J+3 ouvrés avec suivi — format lettre plat',
    delay: 'J+3 ouvrés',
    // Contraintes format lettre (source laposte.fr)
    maxWeight: 2000,       // 2 kg max
    maxThickness: 30,      // 3 cm épaisseur max
    maxLength: 60,         // 60 cm longueur max
    maxDimensionSum: 100,  // L + l + h ≤ 100 cm
    tiers: [
      { maxWeight: 20,   price: 2.02 },
      { maxWeight: 100,  price: 3.60 },
      { maxWeight: 250,  price: 5.74 },
      { maxWeight: 500,  price: 7.91 },
      { maxWeight: 1000, price: 9.79 },
      { maxWeight: 2000, price: 11.64 }
    ]
  },
  COLISSIMO: {
    id: 'COLISSIMO',
    label: 'Colissimo Domicile',
    description: 'Livraison J+2/J+3 ouvrés avec suivi',
    delay: 'J+2 à J+3 ouvrés',
    // Contraintes Colissimo (source laposte.fr)
    maxWeight: 30000,      // 30 kg max
    maxLength: 100,        // longueur max 100 cm
    maxDimensionSum: 150,  // L + l + h ≤ 150 cm
    tiers: [
      { maxWeight: 250,   price: 5.49 },
      { maxWeight: 500,   price: 7.59 },
      { maxWeight: 750,   price: 9.29 },
      { maxWeight: 1000,  price: 9.59 },
      { maxWeight: 2000,  price: 11.19 },
      { maxWeight: 5000,  price: 17.39 },
      { maxWeight: 10000, price: 25.29 },
      { maxWeight: 15000, price: 31.99 },
      { maxWeight: 30000, price: 39.59 }
    ]
  }
};

const FREE_SHIPPING_THRESHOLD = 35;

// Vérifie si tous les articles du panier sont compatibles format lettre
function isCartLetterEligible(items) {
  return items.every(item => {
    const thickness = Number(item.thickness_mm) || 10;
    const length = Number(item.length_cm) || 20;
    const width = Number(item.width_cm) || 15;
    const dimSum = length + width + (thickness / 10);
    return (
      thickness <= 30 &&       // épaisseur ≤ 3 cm
      length <= 60 &&           // longueur ≤ 60 cm
      dimSum <= 100             // L + l + h ≤ 100 cm
    );
  });
}

function getShippingPrice(option, totalWeightGrams) {
  const tier = option.tiers.find(t => totalWeightGrams <= t.maxWeight);
  return tier ? tier.price : null;
}

function getAvailableShipping(cartTotal, totalWeightGrams, items) {
  const isFree = cartTotal >= FREE_SHIPPING_THRESHOLD;
  const letterEligible = isCartLetterEligible(items);
  const options = [];

  // Lettre Verte Suivie — proposée seulement si format + poids compatibles
  if (letterEligible && totalWeightGrams <= SHIPPING_OPTIONS.LETTRE_VERTE_SUIVIE.maxWeight) {
    const price = getShippingPrice(SHIPPING_OPTIONS.LETTRE_VERTE_SUIVIE, totalWeightGrams);
    if (price !== null) {
      options.push({
        ...SHIPPING_OPTIONS.LETTRE_VERTE_SUIVIE,
        tiers: undefined,
        price: isFree ? 0 : price,
        originalPrice: price,
        free: isFree
      });
    }
  }

  // Colissimo — proposé si poids ≤ 30 kg
  if (totalWeightGrams <= SHIPPING_OPTIONS.COLISSIMO.maxWeight) {
    const price = getShippingPrice(SHIPPING_OPTIONS.COLISSIMO, totalWeightGrams);
    if (price !== null) {
      options.push({
        ...SHIPPING_OPTIONS.COLISSIMO,
        tiers: undefined,
        price: isFree ? 0 : price,
        originalPrice: price,
        free: isFree
      });
    }
  }

  return options;
}

// ─── ROUTE : calcul options de livraison ──────────────────────────────────────
app.post('/api/shipping/options', (req, res) => {
  try {
    const { cartTotal, items } = req.body;

    if (typeof cartTotal !== 'number' || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'cartTotal (number) et items (array) requis' });
    }

    // Récupérer les vraies dimensions depuis la BDD pour chaque produit
    const ids = items.map(i => Number(i.id));
    const placeholders = ids.map(() => '?').join(',');

    db.all(
      `SELECT id, weight_g, thickness_mm, length_cm, width_cm FROM products WHERE id IN (${placeholders})`,
      ids,
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        // Enrichir les items avec les vraies données BDD
        const enrichedItems = items.map(item => {
          const dbProduct = rows.find(r => r.id === Number(item.id)) || {};
          return {
            ...item,
            weight_g: dbProduct.weight_g || 50,
            thickness_mm: dbProduct.thickness_mm || 10,
            length_cm: dbProduct.length_cm || 20,
            width_cm: dbProduct.width_cm || 15,
            quantity: Number(item.quantity) || 1
          };
        });

        const totalWeight = enrichedItems.reduce(
          (sum, it) => sum + it.weight_g * it.quantity,
          0
        );

        const options = getAvailableShipping(cartTotal, totalWeight, enrichedItems);

        res.json({ options, totalWeight });
      }
    );
  } catch (err) {
    console.error('[SHIPPING] Erreur:', err);
    res.status(500).json({ error: 'Erreur calcul livraison' });
  }
});

// ─── ROUTE : saisie manuelle du numéro de suivi (admin) ───────────────────────
app.put('/api/admin/orders/:id/tracking', verifyToken, requireAdmin, (req, res) => {
  const { tracking_number } = req.body;
  if (!tracking_number || typeof tracking_number !== 'string') {
    return res.status(400).json({ error: 'tracking_number requis (string)' });
  }
  db.run(
    'UPDATE orders SET tracking_number = ?, statut_paiement = ? WHERE id = ?',
    [tracking_number.trim(), 'expédié', req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Commande introuvable' });
      
      // Envoyer l'email d'expédition
      db.get('SELECT * FROM orders WHERE id = ?', [req.params.id], (err, order) => {
        if (!err && order) {
          let addr = {};
          try { addr = JSON.parse(order.adresse_livraison); } catch(e) {}
          const emailClient = addr.email || order.client_email;
          if (emailClient) {
            sendOrderShippedEmail(emailClient, order).catch(console.error);
          }
        }
      });

      res.json({ success: true, tracking_url: `https://www.laposte.fr/outils/suivre-vos-envois?code=${tracking_number.trim()}` });
    }
  );
});


// ============================================================
// ROUTES AUTHENTIFICATION (Legacy - Login/Register local)
// ============================================================

// ============================================================
// ROUTES AUTHENTIFICATION (Custom Registration)
// ============================================================

app.post('/api/auth/custom-register', async (req, res) => {
  const { email, password, prenom, nom } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60000).toISOString(); // +15 mins
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const fullName = `${prenom || ''} ${nom || ''}`.trim();

    // Vérifier si l'utilisateur existe déjà
    db.get('SELECT id, is_verified FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur.' });
      
      if (user) {
        if (user.is_verified) {
          return res.status(409).json({ error: 'Cet email est déjà utilisé et vérifié.' });
        }
        // Mise à jour de l'utilisateur non vérifié existant
        db.run(
          'UPDATE users SET password = ?, verification_code = ?, verification_expires = ? WHERE email = ?',
          [hashedPassword, code, expires, email],
          async (err) => {
            if (err) return res.status(500).json({ error: 'Erreur serveur.' });
            await sendVerificationCodeEmail(email, code);
            return res.status(200).json({ message: 'Code envoyé.' });
          }
        );
      } else {
        // Création nouvel utilisateur
        db.run(
          'INSERT INTO users (name, prenom, nom, email, password, is_verified, verification_code, verification_expires) VALUES (?, ?, ?, ?, ?, 0, ?, ?)',
          [fullName, prenom || '', nom || '', email, hashedPassword, code, expires],
          async function (err) {
            if (err) return res.status(500).json({ error: 'Erreur création compte.' });
            await sendVerificationCodeEmail(email, code);
            return res.status(200).json({ message: 'Code envoyé.' });
          }
        );
      }
    });
  } catch (error) {
    console.error('[AUTH] custom-register error:', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.post('/api/auth/custom-verify', async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: 'Email et code requis.' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur.' });
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });
    
    if (user.is_verified) {
      return res.status(400).json({ error: 'Compte déjà vérifié.' });
    }

    if (user.verification_code !== code) {
      return res.status(400).json({ error: 'Code incorrect.' });
    }

    if (new Date(user.verification_expires) < new Date()) {
      return res.status(400).json({ error: 'Le code a expiré.' });
    }

    // Valider le compte
    db.run(
      'UPDATE users SET is_verified = 1, verification_code = NULL, verification_expires = NULL WHERE id = ?',
      [user.id],
      async (err) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur.' });
        
        // Attribution des points de fidélité pour l'inscription (+20 Plumes)
        try {
          // addLoyaltyPoints(newUserId, 20, 'inscription', null) - Need to require or use local function
          db.run(
            `INSERT OR IGNORE INTO loyalty_points (user_id, points_actuels, points_cumules_total, niveau) VALUES (?, 20, 20, 'initie')`,
            [user.id]
          );
          db.run(
            `INSERT INTO loyalty_transactions (user_id, points, type, raison) VALUES (?, 20, 'gain', 'inscription')`,
            [user.id]
          );
        } catch (e) {
          console.error('Points fidélité non ajoutés', e);
        }

        // Email de bienvenue Premium
        try {
          await sendCustomWelcomeEmail(user.email);
        } catch (e) {
          console.error('Erreur sendCustomWelcomeEmail', e);
        }

        // Générer le token JWT pour connexion automatique
        const token = jwt.sign(
          { id: user.id, email: user.email, name: user.name, role: user.role },
          SECRET_KEY,
          { expiresIn: '7d' }
        );

        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
        });

        res.json({
          message: 'Compte vérifié et connecté',
          user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
      }
    );
  });
});

// Inscription (Legacy)
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, prenom, nom } = req.body;
  
  const finalName = name || `${prenom || ''} ${nom || ''}`.trim() || email.split('@')[0];

  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe obligatoires." });
  }

  try {
    // 1. Vérifier si l'utilisateur existe déjà
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Erreur base de données." });
      }
      if (user) {
        return res.status(400).json({ error: "Un compte existe déjà avec cet e-mail." });
      }

      // 2. Insérer le nouvel utilisateur (hachage du mot de passe avec bcrypt)
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const query = "INSERT INTO users (name, prenom, nom, email, password) VALUES (?, ?, ?, ?, ?)";
      db.run(query, [finalName, prenom || '', nom || '', email, hashedPassword], function(insertErr) {
        if (insertErr) {
          console.error(insertErr);
          return res.status(500).json({ error: "Erreur lors de l'inscription." });
        }
        
        const newUserId = this.lastID;
        
        // Attribution des points de fidélité pour l'inscription (+20 Plumes)
        addLoyaltyPoints(newUserId, 20, 'inscription', null).catch(err => {
          console.error('Erreur attribution points inscription:', err);
        });

        // Inscription réussie
        return res.status(201).json({ message: "Compte créé avec succès !", userId: newUserId });
      });
    });
  } catch (error) {
    console.error("Erreur critique inscription :", error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
});

// Connexion
app.post('/api/auth/login', authLimiter, (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  const query = `SELECT * FROM users WHERE email = ?`;
  db.get(query, [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur.' });
    if (!user) return res.status(404).json({ error: 'Email ou mot de passe incorrect.' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Mot de passe incorrect.' });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });

    res.json({
      message: 'Connexion réussie',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict"
  });
  res.json({ success: true });
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  console.log("Demande de réinitialisation reçue pour :", email);

  if (!email) {
    return res.status(400).json({ error: "L'adresse e-mail est obligatoire." });
  }

  try {
    // 1. Vérifier si l'utilisateur existe dans la base SQLite
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
      if (err) {
        console.error("❌ Erreur SQL lors de la recherche de l'utilisateur :", err);
        return res.status(500).json({ error: "Erreur base de données." });
      }

      if (!user) {
        console.log(`⚠️ Aucun utilisateur trouvé en base avec l'e-mail : ${email}`);
        return res.status(404).json({ error: "This email does not exist in the SQLite database. Please sign up first." });
      }

      console.log(`✅ Utilisateur trouvé : ${user.name}. Tentative d'envoi du mail avec Resend...`);

      try {
        const resetLink = `https://doiryshop.com/reset-password?email=${encodeURIComponent(user.email)}`;
        
        const sendResult = await resend.emails.send({
          from: 'Doiry Shop <contact@doiryshop.com>',
          to: user.email,
          subject: 'Réinitialisation de votre mot de passe 🌿',
          html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111; text-align: center;">
  <img src="https://doiryshop.com/favicon.jpg" alt="Doiry Shop Logo" style="width: 80px; height: auto; margin-bottom: 20px;" />
  <h3 style="color: #222; font-weight: normal;">Bonjour ${user.name || 'DUMAS Evan'},</h3>
  <p style="font-size: 16px; line-height: 1.5; color: #444;">Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte.</p>
  <div style="margin: 30px 0;">
    <a href="${resetLink}" style="background-color: #801524; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Réinitialiser mon mot de passe</a>
  </div>
  <p style="font-size: 12px; color: #777;">Si vous n'avez pas demandé ce changement, vous pouvez ignorer cet e-mail en toute sécurité.</p>
</div>`
        });

        console.log("🚀 Resend a accepté l'envoi :", sendResult);
        return res.status(200).json({ message: "E-mail de récupération envoyé avec succès !" });

      } catch (emailError) {
        console.error("Resend crash in forgot-password:", emailError);
        return res.status(500).json({ error: "Email delivery failed", details: emailError.message });
      }
    });
  } catch (error) {
    console.error("❌ ERREUR CRITIQUE FORGOT-PASSWORD :", error.message);
    console.error(error.stack);

    if (!res.headersSent) {
      return res.status(500).json({ 
        error: "Internal server error", 
        details: error.message 
      });
    }
  }
});

// Vérifier et Récupérer infos utilisateur ('Me' endpoint)
app.get('/api/auth/me', verifyToken, (req, res) => {
  const query = `SELECT id, name, email, role, prenom, nom, profil_complete, created_at FROM users WHERE id = ?`;
  db.get(query, [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur.' });
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    if (user.profil_complete !== undefined) {
      user.profil_complete = true; // ne plus bloquer
    }
    res.json({ user });
  });
});

/**
 * DELETE /api/auth/delete-account
 * Supprime définitivement le compte utilisateur (route protégée).
 */
app.delete('/api/auth/delete-account', verifyToken, (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // Supprimer les lignes dépendantes en premier (si présentes).
    db.run('DELETE FROM loyalty_points WHERE user_id = ?', [userId]);
    db.run('DELETE FROM loyalty_transactions WHERE user_id = ?', [userId]);
    db.run('DELETE FROM carts WHERE user_id = ?', [userId]);
    db.run('DELETE FROM reviews WHERE user_id = ?', [userId]);
    // Note: on garde l'historique commandes par défaut (orders.user_id peut rester NULL si besoin).
    db.run('UPDATE orders SET user_id = NULL WHERE user_id = ?', [userId]);

    db.run('DELETE FROM users WHERE id = ?', [userId], function (err) {
      if (err) {
        console.error('[AUTH] delete-account error:', err.message);
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Erreur suppression compte.' });
      }

      db.run('COMMIT', () => {
        // Logout immédiat
        res.clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });

        return res.json({ message: "Account successfully deleted" });
      });
    });
  });
});

// ============================================================
// ROUTE NEWSLETTER
// ============================================================

app.post('/api/newsletter', authLimiter, async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const source = String(req.body?.source || 'footer').trim().slice(0, 40);
  console.log("Nouvelle inscription newsletter reçue pour :", email);

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Adresse email invalide ou manquante.' });
  }

  try {
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO newsletter (email, source) VALUES (?, ?)
         ON CONFLICT(email) DO UPDATE SET source = excluded.source`,
        [email, source || 'footer'],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Ensure BIENVENUE10 coupon exists
    const PROMO_CODE = 'BIENVENUE10';
    await new Promise((resolve, reject) => {
      db.get(
        `SELECT id FROM coupons WHERE code = ? AND actif = 1`,
        [PROMO_CODE],
        (err, row) => {
          if (err) {
            console.error('[Newsletter] Erreur vérification coupon:', err);
            return resolve(); // ignore error
          }
          if (!row) {
            console.log('[Newsletter] Création du coupon BIENVENUE10');
            db.run(
              `INSERT INTO coupons (code, type, valeur, nombre_utilisations_max, actif) VALUES (?, ?, ?, NULL, 1)`,
              [PROMO_CODE, 'pourcentage', 10],
              (err) => {
                if (err) console.error('[Newsletter] Erreur création coupon:', err);
                else console.log('[Newsletter] Coupon BIENVENUE10 créé avec succès');
                resolve();
              }
            );
          } else {
            resolve();
          }
        }
      );
    });

    // Send the welcome email
    await resend.emails.send({
      from: 'Doiry Shop <contact@doiryshop.com>',
      to: email,
      subject: 'Rejoins la communauté Doiry 🌿',
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #111; text-align: center;">
  <img src="https://doiryshop.com/favicon.jpg" alt="Doiry Shop Logo" style="width: 80px; height: auto; margin-bottom: 20px;" />
  <h2 style="color: #801524; letter-spacing: 1px;">REJOINS LA COMMUNAUTÉ DOIRY</h2>
  <p style="font-size: 16px; line-height: 1.5; color: #444;">Merci pour votre inscription à notre newsletter !</p>
  <p style="font-size: 14px; color: #777; margin-top: 30px;">Recettes, rituels calmes et offres douces, directement par email.</p>
</div>`
    });

    return res.status(200).json({ message: "Inscription réussie !", code: PROMO_CODE });
  } catch (error) {
    console.error("Newsletter error details:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Server error", details: error.message });
    }
  }
});


// ============================================================
// ROUTE DE SYNCHRONISATION LOGTO (SOCIAL LOGIN)
// ============================================================

/**
 * POST /api/auth/sync-social-login
 * Appelé par le frontend après une connexion Logto réussie (Google).
 * Fait un "upsert" de l'utilisateur dans notre DB locale et envoie l'email de bienvenue si nouveau.
 */
app.post('/api/auth/sync-social-login', (req, res) => {
  const { logto_id, email, name } = req.body;

  // logto_id reste accepté pour compatibilité descendante, mais email est obligatoire
  if (!email) {
    return res.status(400).json({ error: 'email est requis.' });
  }

  // Essayer de trouver l'utilisateur par logto_id ou email
  db.get('SELECT * FROM users WHERE (logto_id = ? AND logto_id IS NOT NULL) OR email = ?', [logto_id || 'null', email], (err, existingUser) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur.' });

    if (existingUser) {
      // Mettre à jour le logto_id s'il n'était pas encore lié
      if (logto_id && !existingUser.logto_id) {
        db.run('UPDATE users SET logto_id = ? WHERE id = ?', [logto_id, existingUser.id]);
      }
      
      // Si un compte est lié via Social Login, on considère l'email vérifié
      if (!existingUser.is_verified) {
         db.run('UPDATE users SET is_verified = 1 WHERE id = ?', [existingUser.id]);
      }

      // Générer un JWT local pour cet utilisateur
      const token = jwt.sign(
        { id: existingUser.id, email: existingUser.email, name: existingUser.name, role: existingUser.role },
        SECRET_KEY,
        { expiresIn: '7d' }
      );

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
      });

      return res.json({
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
          prenom: existingUser.prenom,
          nom: existingUser.nom,
          profil_complete: true
        }
      });
    }

    // Nouvel utilisateur (Premier login via Social Login) : is_verified = 1 direct
    db.run(
      'INSERT INTO users (name, email, logto_id, role, is_verified, profil_complete) VALUES (?, ?, ?, ?, 1, 0)',
      [name || '', email, logto_id || null, 'client'],
      async function (err) {
        if (err) return res.status(500).json({ error: 'Erreur lors de la création du compte.' });

        const newUserId = this.lastID;

        // Points de fidélité : Inscription +20 plumes
        try {
          db.run(
            `INSERT OR IGNORE INTO loyalty_points (user_id, points_actuels, points_cumules_total, niveau) VALUES (?, 20, 20, 'initie')`,
            [newUserId]
          );
          db.run(
            `INSERT INTO loyalty_transactions (user_id, points, type, raison) VALUES (?, 20, 'gain', 'inscription')`,
            [newUserId]
          );
        } catch (e) {
          console.error('[AUTH] Points fidélité non ajoutés', e);
        }

        // Envoyer l'email de bienvenue Premium
        try {
          await sendCustomWelcomeEmail(email);
        } catch (e) {
          console.error('[AUTH] Erreur sendCustomWelcomeEmail', e);
        }

        const token = jwt.sign(
          { id: newUserId, email, name, role: 'client' },
          SECRET_KEY,
          { expiresIn: '7d' }
        );

        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
        });

        res.status(201).json({
          user: { id: newUserId, name, email, role: 'client', profil_complete: true }
        });
      }
    );
  });
});


// ============================================================
// ROUTES PROFIL UTILISATEUR
// ============================================================


app.get('/api/user/profile', verifyToken, (req, res) => {
  db.get('SELECT id, name, email, prenom, nom, age, telephone, adresse, complement_adresse, code_postal, ville, pays, date_naissance, avatar_url, profil_complete FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur.' });
    if (!user) return res.status(404).json({ error: 'Email ou mot de passe incorrect.' });

    user.profil_complete = true; // ne plus bloquer
    res.json({ profile: user });
  });
});

app.put('/api/user/profile', verifyToken, (req, res) => {
  console.log("=== PUT /api/user/profile appelée ===");
  console.log("Body reçu:", JSON.stringify(req.body));
  console.log("User:", JSON.stringify(req.user));

  const { prenom, nom, age, telephone, adresse, complement_adresse, code_postal, ville, pays, date_naissance, avatar_url, profil_complete } = req.body;

  const query = `
    UPDATE users 
    SET prenom = ?, nom = ?, age = ?, telephone = ?, adresse = ?, complement_adresse = ?, code_postal = ?, ville = ?, pays = ?, date_naissance = ?, avatar_url = ?, profil_complete = ?
    WHERE id = ?
  `;

  const params = [
    prenom || null,
    nom || null,
    age || null,
    telephone || null,
    adresse || null,
    complement_adresse || null,
    code_postal || null,
    ville || null,
    pays || 'France',
    date_naissance || null,
    avatar_url || null,
    profil_complete ? 1 : 0,
    req.user.id
  ];

  db.run(query, params, function (err) {
    if (err) {
      console.error("Erreur SQLite lors de l'UPDATE du profil:", err);
      return res.status(500).json({ error: 'Erreur lors de la mise à jour du profil.' });
    }
    console.log(`[Profile UPDATE] user_id=${req.user.id}, profil_complete=${profil_complete ? 1 : 0}, changes=${this.changes}`);

    // Renvoyer le profil mis à jour pour que le frontend ait les bonnes données
    db.get('SELECT id, name, email, prenom, nom, age, telephone, adresse, complement_adresse, code_postal, ville, pays, date_naissance, avatar_url, profil_complete FROM users WHERE id = ?', [req.user.id], (err2, updatedUser) => {
      if (err2 || !updatedUser) {
        return res.json({ message: 'Profil mis à jour avec succès.' });
      }
      updatedUser.profil_complete = !!updatedUser.profil_complete;
      console.log(`[Profile UPDATE] Verification: profil_complete en DB = ${updatedUser.profil_complete}`);
      res.json({ message: 'Profil mis à jour avec succès.', profile: updatedUser });
    });
  });
});

// ============================================================
// ROUTES COMMANDES (Orders)
// ============================================================

app.post('/api/user/profile', verifyToken, (req, res) => {
  const userId = req.user.id;
  const { prenom, nom, telephone, date_naissance, adresse, complement, code_postal, ville } = req.body;

  db.run(
    `INSERT INTO users (id, prenom, nom, telephone, date_naissance, adresse, complement_adresse, code_postal, ville, profil_complete)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
     ON CONFLICT(id) DO UPDATE SET
       prenom = excluded.prenom,
       nom = excluded.nom,
       telephone = excluded.telephone,
       date_naissance = excluded.date_naissance,
       adresse = excluded.adresse,
       complement_adresse = excluded.complement_adresse,
       code_postal = excluded.code_postal,
       ville = excluded.ville,
       profil_complete = 1`,
    [userId, prenom, nom, telephone, date_naissance, adresse, complement, code_postal, ville],
    (err) => {
      if (err) {
        console.error('[Profil] Erreur DB:', err.message);
        return res.status(500).json({ error: 'Erreur sauvegarde profil' });
      }
      return res.json({ success: true });
    }
  );
});

/**
 * GET /api/orders/my-orders
 * Récupère les commandes de l'utilisateur connecté
 */
app.get('/api/orders/my-orders', verifyToken, (req, res) => {
  const query = `
    SELECT id, produits, total, statut_paiement, adresse_livraison, date_creation
    FROM orders
    WHERE user_id = ?
    ORDER BY date_creation DESC
    LIMIT 5
  `;

  db.all(query, [req.user.id], (err, rows) => {
    if (err) {
      console.error('Erreur récupération commandes utilisateur:', err.message);
      return res.status(500).json({ error: 'Erreur serveur.' });
    }

    // Fallback: certaines commandes historiques peuvent ne pas être reliées au bon user_id.
    // Si aucune commande trouvée, on tente une récupération via l'email de livraison (JSON stocké en texte).
    // Cela évite le cas où le programme fidélité affiche "Commande #X" mais la section commandes est vide.
    if ((!rows || rows.length === 0) && req.user?.email) {
      const email = String(req.user.email || '').trim().toLowerCase();
      const emailNeedle = `"email":"${email.replaceAll('"', '\\"')}"`;
      const fallbackQuery = `
        SELECT id, produits, total, statut_paiement, adresse_livraison, date_creation
        FROM orders
        WHERE LOWER(adresse_livraison) LIKE ?
        ORDER BY date_creation DESC
        LIMIT 5
      `;
      return db.all(fallbackQuery, [`%${emailNeedle}%`], (err2, rows2) => {
        if (err2) {
          console.error('[AUTH] Erreur fallback commandes utilisateur:', err2.message);
          return res.json({ orders: [] });
        }

        const orders = (rows2 || []).map(row => ({
          id: row.id,
          total: row.total,
          statut_paiement: row.statut_paiement,
          date_creation: row.date_creation,
          produits: (() => { try { return JSON.parse(row.produits); } catch { return row.produits; } })(),
          adresse_livraison: (() => { try { return JSON.parse(row.adresse_livraison); } catch { return row.adresse_livraison; } })()
        }));

        return res.json({ orders });
      });
    }

    const orders = rows.map(row => ({
      id: row.id,
      total: row.total,
      statut_paiement: row.statut_paiement,
      date_creation: row.date_creation,
      produits: (() => { try { return JSON.parse(row.produits); } catch { return row.produits; } })(),
      adresse_livraison: (() => { try { return JSON.parse(row.adresse_livraison); } catch { return row.adresse_livraison; } })()
    }));

    res.json({ orders });
  });
});

/**
 * GET /api/orders/:orderId/invoice
 * Télécharge la facture PDF d'une commande.
 */
app.get('/api/orders/:orderId/invoice', verifyToken, (req, res) => {
  const { orderId } = req.params;
  const isAdmin = req.user?.role === 'admin';
  const params = isAdmin ? [orderId] : [orderId, req.user.id];
  const query = isAdmin
    ? 'SELECT * FROM orders WHERE id = ?'
    : 'SELECT * FROM orders WHERE id = ? AND user_id = ?';

  db.get(query, params, async (err, order) => {
    if (err) {
      console.error('[INVOICE] Erreur SQL:', err.message);
      return res.status(500).json({ error: 'Erreur lors de la récupération de la facture.' });
    }
    if (!order) {
      return res.status(404).json({ error: 'Commande introuvable ou accès refusé.' });
    }

    try {
      const pdfBuffer = await generateInvoicePDF({
        ...order,
        id: order.id,
        reference: `dry-${order.id}`,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="facture-${order.id}.pdf"`);
      return res.send(pdfBuffer);
    } catch (invoiceErr) {
      console.error('[INVOICE] Erreur génération PDF:', invoiceErr.message);
      return res.status(500).json({ error: 'Impossible de générer la facture PDF.' });
    }
  });
});

/**
 * POST /api/orders
 * Créer une nouvelle commande après validation du paiement.
 */
app.post('/api/orders', optionalAuth, async (req, res) => {
  try {
    console.log('[ORDER] req.user complet:', req.user);
    console.log('[ORDER] user_id extrait:', req.user?.id);

    const { produits, total, statut_paiement, adresse_livraison, shipping_method, shipping_price: client_shipping_price, coupon_code, shipping_relay_id, shipping_relay_data, relay_selection_mode, relay_address_text } = req.body;

    let emailClient = "";
    if (typeof adresse_livraison === 'string') {
      try { emailClient = JSON.parse(adresse_livraison).email; } catch(e){}
    } else if (adresse_livraison) {
      emailClient = adresse_livraison.email;
    }

    const userId = req.user?.id || null;
    const finalEmail = req.user?.email || emailClient;

    if (!finalEmail) {
      return res.status(400).json({ error: 'Impossible d\'identifier le client (email manquant)' });
    }

    if (!produits || !total) {
      return res.status(400).json({ error: 'Les champs "produits" et "total" sont requis.' });
    }

    // Validation shipping
    const validMethods = ['LETTRE_VERTE_SUIVIE', 'COLISSIMO'];
    if (!validMethods.includes(shipping_method)) {
      return res.status(400).json({ error: 'Méthode de livraison invalide' });
    }

    // Recalcul shipping_price (SÉCURITÉ)
    const items = Array.isArray(produits) ? produits : JSON.parse(produits);
    const totalWeightGrams = items.reduce((sum, it) => sum + (Number(it.weight || it.weight_g) || 50) * (Number(it.quantity) || 1), 0);
    const opt = SHIPPING_OPTIONS[shipping_method];
    
    // Calcul du sous-total pour la gratuité (cartTotal au sens du montant produits)
    const cartTotal = items.reduce((sum, it) => sum + (Number(it.price) * Number(it.quantity)), 0);
    const recalculatedShippingPrice = cartTotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : getShippingPrice(opt, totalWeightGrams);

    if (recalculatedShippingPrice === null) {
      return res.status(400).json({ error: 'Poids total non supporté pour cette méthode' });
    }

    const query = `INSERT INTO orders (user_id, produits, total, statut_paiement, adresse_livraison, shipping_method, shipping_price, tracking_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      userId, // Peut être NULL pour les invités
      typeof produits === 'string' ? produits : JSON.stringify(produits),
      total,
      statut_paiement || 'en_attente',
      typeof adresse_livraison === 'string' ? adresse_livraison : JSON.stringify(adresse_livraison || {}),
      shipping_method,
      recalculatedShippingPrice,
      null // tracking_number à NULL par défaut
    ];

    db.run(query, params, function (err) {
      if (err) {
        console.error('[ORDER] Erreur INSERT:', err.message);
        return res.status(500).json({ error: 'Erreur lors de la création de la commande', detail: err.message });
      }
      console.log('[ORDER] Commande créée avec ID:', this.lastID);

      const orderId = this.lastID;
      const orderReference = `dry-${orderId}`;

      // Incrémenter l'utilisation du coupon si fourni
      if (coupon_code) {
        db.run('UPDATE coupons SET nombre_utilisations_actuel = nombre_utilisations_actuel + 1 WHERE code = ?', [coupon_code]);
      }

      // Répondre immédiatement au client
      res.status(201).json({
        success: true,
        message: 'Commande créée avec succès !',
        orderId: orderId,
        reference: orderReference
      });

      // === ATTRIBUTION POINTS DE FIDÉLITÉ ===
      if (statut_paiement !== 'en_attente') {
        if (userId) {
          const pointsCommande = Math.round(total); // 1 Plume par euro dépensé
          if (pointsCommande > 0) {
            addLoyaltyPoints(userId, pointsCommande, `Commande #${orderId}`, orderId).catch(err => {
              console.error('Erreur attribution points commande:', err);
            });
          }

          // Vérifier si c'est le premier achat pour le bonus
          db.get('SELECT COUNT(*) as count FROM orders WHERE user_id = ?', [userId], (err, countRow) => {
            if (!err && countRow && countRow.count === 1) {
              addLoyaltyPoints(userId, 30, 'Bonus premier achat', orderId).catch(err => {
                console.error('Erreur attribution bonus premier achat:', err);
              });
            }
          });

          // Gérer le parrainage : créditer le parrain si le filleul passe sa première commande
          db.get('SELECT parrain_id FROM users WHERE id = ?', [userId], (err, userRow) => {
            if (!err && userRow && userRow.parrain_id) {
              db.get('SELECT COUNT(*) as count FROM orders WHERE user_id = ?', [userId], (err, countRow) => {
                if (!err && countRow && countRow.count === 1) {
                  addLoyaltyPoints(userRow.parrain_id, 100, `Parrainage : filleul commande #${orderId}`, orderId).catch(err => {
                    console.error('Erreur attribution points parrainage:', err);
                  });
                }
              });
            }
          });
        }

      }

      // Email premium + facture PDF (non bloquant) dès la création de commande
      if (finalEmail) {
        const parsedProduits = typeof produits === 'string' ? JSON.parse(produits) : produits;
        const parsedAdresse = typeof adresse_livraison === 'string' ? JSON.parse(adresse_livraison) : adresse_livraison;
        const mailOrder = {
          id: orderId,
          reference: orderReference,
          produits: parsedProduits,
          total,
          shipping_price: recalculatedShippingPrice,
          adresse_livraison: parsedAdresse,
          shipping_method,
          date_creation: new Date().toISOString()
        };

        generateInvoicePDF(mailOrder)
          .then((invoiceBuffer) => sendOrderConfirmation(finalEmail, mailOrder, {
            invoiceBuffer,
            filename: `facture-${orderId}.pdf`,
          }))
          .catch((mailErr) => console.error('Erreur envoi email premium:', mailErr));
      }
    });
  } catch (err) {
    console.error('[ORDER] Catch global:', err);
    return res.status(500).json({ error: err.message || 'Erreur interne lors de la création de la commande' });
  }
});

/**
 * PUT /api/orders/:id/status
 * Confirme le paiement d'une commande (appelé par la page de succès).
 * Vérifie que la commande appartient bien à l'utilisateur connecté.
 */
app.put('/api/orders/:id/status', verifyToken, (req, res) => {
  const orderId = req.params.id;
  const userId = req.user.id;

  // 1. Récupérer la commande et vérifier qu'elle appartient à l'utilisateur
  db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, userId], (err, order) => {
    if (err) {
      console.error('[Confirm Payment] Erreur SQL:', err.message);
      return res.status(500).json({ error: 'Erreur serveur.' });
    }
    if (!order) {
      return res.status(404).json({ error: 'Commande introuvable ou accès refusé.' });
    }

    // 2. Si déjà payée, retourner simplement les infos sans redistribuer les points
    if (order.statut_paiement === 'payé') {
      let produits = order.produits;
      try { produits = JSON.parse(produits); } catch (e) { }
      return res.json({
        message: 'Commande déjà confirmée.',
        order: {
          id: order.id,
          total: order.total,
          statut_paiement: order.statut_paiement,
          date_creation: order.date_creation,
          produits
        }
      });
    }

    // 3. Mettre à jour le statut
    db.run(`UPDATE orders SET statut_paiement = 'payé' WHERE id = ?`, [orderId], function (updateErr) {
      if (updateErr) {
        console.error('[Confirm Payment] Erreur UPDATE:', updateErr.message);
        return res.status(500).json({ error: 'Erreur lors de la confirmation du paiement.' });
      }
      console.log(`[Confirm Payment] Commande ${orderId} passée à "payé".`);

      // 4. Attribution points de fidélité

      const pointsCommande = Math.round(order.total);
      if (pointsCommande > 0) {
        addLoyaltyPoints(userId, pointsCommande, `Commande #${orderId}`, orderId).catch(err => {
          console.error('[AUTH] Erreur attribution points commande:', err);
        });
      }

      // Bonus premier achat
      db.get('SELECT COUNT(*) as count FROM orders WHERE user_id = ? AND statut_paiement = ?', [userId, 'payé'], (err, countRow) => {
        if (!err && countRow && countRow.count === 1) {
          addLoyaltyPoints(userId, 30, 'Bonus premier achat', orderId).catch(err => {
            console.error('[AUTH] Erreur attribution bonus premier achat:', err);
          });
        }
      });

      // Parrainage
      db.get('SELECT parrain_id FROM users WHERE id = ?', [userId], (err, userRow) => {
        if (!err && userRow && userRow.parrain_id) {
          db.get('SELECT COUNT(*) as count FROM orders WHERE user_id = ? AND statut_paiement = ?', [userId, 'payé'], (err, countRow) => {
            if (!err && countRow && countRow.count === 1) {
              addLoyaltyPoints(userRow.parrain_id, 100, `Parrainage : filleul commande #${orderId}`, orderId).catch(err => {
                console.error('[AUTH] Erreur attribution points parrainage:', err);
              });
            }
          });
        }
      });

      // 5. Envoyer l'email de confirmation
      db.get('SELECT email FROM users WHERE id = ?', [userId], (err, userRow) => {
        if (!err && userRow && userRow.email) {
          let produits = order.produits;
          let adresse = order.adresse_livraison;
          try { produits = JSON.parse(produits); } catch (e) { }
          try { adresse = JSON.parse(adresse); } catch (e) { }
          sendOrderConfirmation(userRow.email, {
            id: orderId,
            produits,
            total: order.total,
            adresse_livraison: adresse
          });
        }
      });

      // 6. Répondre avec le récap
      let produits = order.produits;
      try { produits = JSON.parse(produits); } catch (e) { }
      res.json({
        message: 'Paiement confirmé avec succès !',
        order: {
          id: order.id,
          total: order.total,
          statut_paiement: 'payé',
          date_creation: order.date_creation,
          produits
        }
      });
    });
  });
});

// ============================================================
// ROUTES ADMIN
// ============================================================

app.use('/api/admin', adminLimiter);

/**
 * GET /api/admin/orders
 * Récupère toutes les commandes (admin uniquement).
 * Triées par date décroissante.
 */
app.get('/api/admin/orders', verifyToken, requireAdmin, (req, res) => {
  const query = `
    SELECT 
      orders.id,
      orders.user_id,
      users.name AS client_name,
      users.email AS client_email,
      orders.produits,
      orders.total,
      orders.statut_paiement,
      orders.adresse_livraison,
      orders.date_creation
    FROM orders
    LEFT JOIN users ON orders.user_id = users.id
    ORDER BY orders.date_creation DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Erreur récupération commandes:', err.message);
      return res.status(500).json({ error: 'Erreur serveur.' });
    }

    // Parser les champs JSON pour chaque commande
    const orders = rows.map(row => ({
      ...row,
      produits: (() => { try { return JSON.parse(row.produits); } catch { return row.produits; } })(),
      adresse_livraison: (() => { try { return JSON.parse(row.adresse_livraison); } catch { return row.adresse_livraison; } })()
    }));

    res.json({ orders });
  });
});

/**
 * GET /api/admin/orders/:id
 * Récupère le détail d'une commande spécifique (admin)
 */
app.get('/api/admin/orders/clear-easy', (req, res) => {
  db.serialize(() => {
    db.run("DELETE FROM orders", function(err) {
      if (err) {
        console.error("Erreur lors de la suppression des commandes:", err);
        return res.status(500).json({ success: false, message: "Erreur serveur lors de la suppression des commandes" });
      }
      
      db.run("DELETE FROM order_items", function(err2) {
        res.json({ success: true, message: "Toutes les commandes de test ont été supprimées avec succès !" });
      });
    });
  });
});

app.get('/api/admin/orders/:id', verifyToken, requireAdmin, (req, res) => {
  const query = `
    SELECT 
      orders.*,
      users.name AS client_name,
      users.email AS client_email,
      users.prenom AS client_prenom,
      users.nom AS client_nom,
      users.telephone AS client_telephone,
      users.created_at AS client_created_at
    FROM orders
    LEFT JOIN users ON orders.user_id = users.id
    WHERE orders.id = ?
  `;

  db.get(query, [req.params.id], (err, order) => {
    if (err) {
      console.error('Erreur récupération commande detail:', err.message);
      return res.status(500).json({ error: 'Erreur serveur.' });
    }
    if (!order) {
      return res.status(404).json({ error: 'Commande introuvable' });
    }

    // Parser les champs JSON
    order.produits = (() => { try { return JSON.parse(order.produits); } catch { return order.produits || []; } })();
    order.adresse_livraison = (() => { try { return JSON.parse(order.adresse_livraison); } catch { return order.adresse_livraison || {}; } })();
    order.shipping_relay_data = (() => { try { return JSON.parse(order.shipping_relay_data); } catch { return order.shipping_relay_data || null; } })();

    // Calcul des dimensions et du poids
    if (Array.isArray(order.produits) && order.produits.length > 0) {
      const productIds = order.produits.map(p => p.id).filter(id => id);
      if (productIds.length > 0) {
        db.all(`SELECT id, weight_g, length_cm, width_cm, height_cm FROM products WHERE id IN (${productIds.join(',')})`, [], (err, rows) => {
          if (!err && rows) {
            const productMap = {};
            rows.forEach(r => productMap[r.id] = r);
            
            let totalWeight = 0;
            let maxLength = 10;
            let maxWidth = 10;
            let totalHeight = 0;

            order.produits.forEach(p => {
              const prod = productMap[p.id] || {};
              const qty = p.quantity || 1;
              totalWeight += (prod.weight_g || 50) * qty; // 50g par défaut
              maxLength = Math.max(maxLength, prod.length_cm || 15);
              maxWidth = Math.max(maxWidth, prod.width_cm || 10);
              totalHeight += (prod.height_cm || 3) * qty;
            });

            order.estimated_weight_g = totalWeight + 100; // +100g pour le carton d'emballage
            order.estimated_length_cm = maxLength;
            order.estimated_width_cm = maxWidth;
            order.estimated_height_cm = Math.max(totalHeight, 5); // carton minimum de 5cm
          } else {
            // Fallback si erreur DB
            order.estimated_weight_g = order.produits.length * 50 + 100;
            order.estimated_length_cm = 15;
            order.estimated_width_cm = 10;
            order.estimated_height_cm = Math.max(order.produits.length * 3, 5);
          }
          return res.json({ ...order });
        });
        return; // Attendre le callback db.all
      }
    }
    
    // Fallback si pas de produits
    order.estimated_weight_g = 150;
    order.estimated_length_cm = 15;
    order.estimated_width_cm = 10;
    order.estimated_height_cm = 5;
    res.json({ ...order });
  });
});

/**
 * PATCH /api/admin/orders/:id/note
 * Met à jour la note interne d'une commande (admin)
 */
app.patch('/api/admin/orders/:id/note', verifyToken, requireAdmin, (req, res) => {
  const { note } = req.body;
  const orderId = req.params.id;

  db.run('UPDATE orders SET admin_note = ? WHERE id = ?', [note, orderId], function (err) {
    if (err) {
      console.error('Erreur MAJ note commande:', err.message);
      return res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de la note.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Commande introuvable' });
    }
    res.json({ success: true, message: 'Note mise à jour avec succès.' });
  });
});

// ============================================================
// ROUTES PRODUITS (Products)
// ============================================================

// Lister tous les produits (Public) — filtre optionnel par catégorie
app.get('/api/products', (req, res) => {
  const { categorie } = req.query;
  let query = "SELECT * FROM products WHERE COALESCE(status, 'published') = 'published' AND COALESCE(is_active, 1) = 1";
  const params = [];

  if (categorie) {
    query += ' AND categorie = ?';
    params.push(categorie);
  }

  query += ' ORDER BY id ASC';

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Erreur get products:', err);
      return res.status(500).json({ error: 'Erreur serveur.' });
    }
    const products = rows.map((row) => ({
      ...row,
      images: (() => {
        if (!row.images) return row.image_url ? [row.image_url] : [];
        try { return JSON.parse(row.images); } catch (_) { return row.image_url ? [row.image_url] : []; }
      })(),
      tags: (() => {
        return parseJsonArrayField(row.tags);
      })(),
      use_cases: (() => {
        return parseJsonArrayField(row.use_cases);
      })(),
      is_best_value: !!row.is_best_value,
    }));
    res.json({ products });
  });
});

// Récupérer un produit par son ID (Public)
app.get('/api/products/:id', (req, res) => {
  const param = req.params.id;
  const isNumeric = /^\d+$/.test(param);
  const query = isNumeric ? 'SELECT * FROM products WHERE id = ?' : 'SELECT * FROM products WHERE slug = ?';

  db.get(query, [param], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur.' });
    if (!row) return res.status(404).json({ error: 'Produit introuvable.' });
    res.json({
      product: {
        ...row,
        images: (() => {
          if (!row.images) return row.image_url ? [row.image_url] : [];
          try { return JSON.parse(row.images); } catch (_) { return row.image_url ? [row.image_url] : []; }
        })(),
        tags: (() => {
          return parseJsonArrayField(row.tags);
        })(),
        use_cases: (() => {
          return parseJsonArrayField(row.use_cases);
        })(),
        is_best_value: !!row.is_best_value,
      },
    });
  });
});

const createProductHandler = (req, res) => {
  const {
    name, slug, description, short_description, composition, mode_utilisation,
    price, price_per_unit, reference_market_price, stock, tagline, type, badge, categorie,
    tags, use_cases, is_best_value, unit_label, weight_g, height_cm, width_cm, length_cm
  } = req.body;

  let existing_images = req.body.existing_images || [];
  if (typeof existing_images === 'string') existing_images = [existing_images];

  let finalImages = [...existing_images];
  if (req.files && req.files.length > 0) {
    const newUrls = req.files.map(f => `/uploads/products/${f.filename}`);
    finalImages = finalImages.concat(newUrls);
  }

  if (finalImages.length === 0) {
    finalImages = ['/placeholders/product-default.png'];
  }

  const imagesJson = JSON.stringify(finalImages);
  const image_url = finalImages[0] || null;

  if (!name || price === undefined) return res.status(400).json({ error: 'Le nom et le prix sont requis.' });

  const parsedTags = parseJsonArrayField(tags);
  const parsedUseCases = parseJsonArrayField(use_cases);

  const query = `
    INSERT INTO products (
      name, slug, description, short_description, composition, mode_utilisation, price, price_per_unit, reference_market_price,
      image_url, images, stock, tagline, type, badge, categorie, tags, use_cases, is_best_value, unit_label,
      weight_g, height_cm, width_cm, length_cm
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.run(query, [
    name, slug || null, description, short_description, composition, mode_utilisation, price, price_per_unit ?? null, reference_market_price ?? null,
    image_url, imagesJson, stock, tagline,
    type || 'secondary', badge, categorie || 'vrac', JSON.stringify(parsedTags), JSON.stringify(parsedUseCases), (is_best_value === 'true' || is_best_value == 1) ? 1 : 0, unit_label || null,
    parseInt(weight_g || 50, 10), parseInt(height_cm || 5, 10), parseInt(width_cm || 10, 10), parseInt(length_cm || 15, 10)
  ], function (err) {
    if (err) return res.status(500).json({ error: 'Erreur création produit.' });
    res.status(201).json({ message: 'Produit créé', productId: this.lastID });
  });
};

const updateProductHandler = (req, res) => {
  const {
    name, slug, description, short_description, composition, mode_utilisation,
    price, price_per_unit, reference_market_price, stock, tagline, type, badge, categorie,
    tags, use_cases, is_best_value, unit_label, weight_g, height_cm, width_cm, length_cm
  } = req.body;
  const productId = req.params.id;

  let existing_images = req.body.existing_images || [];
  if (typeof existing_images === 'string') existing_images = [existing_images];

  let finalImages = [...existing_images];
  if (req.files && req.files.length > 0) {
    const newUrls = req.files.map(f => `/uploads/products/${f.filename}`);
    finalImages = finalImages.concat(newUrls);
  }

  if (finalImages.length === 0) {
    finalImages = ['/placeholders/product-default.png'];
  }

  const imagesJson = JSON.stringify(finalImages);
  const image_url = finalImages[0] || null;

  const parsedTags = parseJsonArrayField(tags);
  const parsedUseCases = parseJsonArrayField(use_cases);

  db.get('SELECT images, image_url FROM products WHERE id = ?', [productId], (err, oldProduct) => {
    if (oldProduct) {
      let oldImages = [];
      try { oldImages = JSON.parse(oldProduct.images || '[]'); } catch (e) { if (oldProduct.image_url) oldImages = [oldProduct.image_url]; }
      if (oldImages.length === 0 && oldProduct.image_url) oldImages = [oldProduct.image_url];

      const imagesToDelete = oldImages.filter(img => !finalImages.includes(img));
      imagesToDelete.forEach(imgPath => {
        if (imgPath && imgPath.startsWith('/uploads/')) {
          const filePath = path.join(__dirname, imgPath);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      });
    }

    const query = `
      UPDATE products
      SET name = ?, slug = ?, description = ?, short_description = ?, composition = ?, mode_utilisation = ?, price = ?, price_per_unit = ?, reference_market_price = ?,
          image_url = ?, images = ?, stock = ?, tagline = ?, type = ?, badge = ?, categorie = ?, tags = ?, use_cases = ?, is_best_value = ?, unit_label = ?,
          weight_g = ?, height_cm = ?, width_cm = ?, length_cm = ?
      WHERE id = ?
    `;
    db.run(query, [
      name, slug || null, description, short_description, composition, mode_utilisation, price, price_per_unit ?? null, reference_market_price ?? null,
      image_url, imagesJson, stock, tagline, type, badge, categorie || 'vrac', JSON.stringify(parsedTags), JSON.stringify(parsedUseCases), (is_best_value === 'true' || is_best_value == 1) ? 1 : 0, unit_label || null,
      parseInt(weight_g || 50, 10), parseInt(height_cm || 5, 10), parseInt(width_cm || 10, 10), parseInt(length_cm || 15, 10),
      productId
    ], function (err) {
      if (err) return res.status(500).json({ error: 'Erreur modification produit.' });
      res.json({ message: 'Produit modifié' });
    });
  });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/products'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Format de fichier non autorisé'));
};

const uploadProducts = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Ajouter / Modifier produit (Admin)
app.post('/api/products', verifyToken, requireAdmin, uploadProducts.array('images', 8), createProductHandler);
app.put('/api/products/:id', verifyToken, requireAdmin, uploadProducts.array('images', 8), updateProductHandler);
app.post('/api/admin/products', verifyToken, requireAdmin, uploadProducts.array('images', 8), createProductHandler);
app.put('/api/admin/products/:id', verifyToken, requireAdmin, uploadProducts.array('images', 8), updateProductHandler);

// Supprimer un produit (Admin)
app.delete('/api/products/:id', verifyToken, requireAdmin, (req, res) => {
  const productId = req.params.id;
  db.get('SELECT images, image_url FROM products WHERE id = ?', [productId], (err, oldProduct) => {
    if (oldProduct) {
      let oldImages = [];
      try { oldImages = JSON.parse(oldProduct.images || '[]'); } catch (e) { if (oldProduct.image_url) oldImages = [oldProduct.image_url]; }
      if (oldImages.length === 0 && oldProduct.image_url) oldImages = [oldProduct.image_url];

      oldImages.forEach(imgPath => {
        if (imgPath && imgPath.startsWith('/uploads/')) {
          const filePath = path.join(__dirname, imgPath);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
      });
    }
    db.run(`DELETE FROM products WHERE id = ?`, [productId], function (err) {
      if (err) return res.status(500).json({ error: 'Erreur suppression produit.' });
      res.json({ message: 'Produit supprimé' });
    });
  });
});

// ============================================================
// ROUTES PANIER (Cart)
// ============================================================

// Récupérer le panier de l'utilisateur connecté
app.get('/api/cart', verifyToken, (req, res) => {
  const userId = req.user.id;
  db.get('SELECT items FROM carts WHERE user_id = ?', [userId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur.' });
    if (!row) return res.json({ items: [] });
    try {
      res.json({ items: JSON.parse(row.items) });
    } catch {
      res.json({ items: [] });
    }
  });
});

// Sauvegarder ou mettre à jour le panier de l'utilisateur
app.post('/api/cart', verifyToken, (req, res) => {
  const userId = req.user.id;
  const { items } = req.body;
  if (!items || !Array.isArray(items)) return res.status(400).json({ error: 'Format invalide.' });

  const itemsJson = JSON.stringify(items);
  // Upsert pattern
  db.get('SELECT user_id FROM carts WHERE user_id = ?', [userId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur.' });
    if (row) {
      db.run('UPDATE carts SET items = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?', [itemsJson, userId], (err) => {
        if (err) return res.status(500).json({ error: 'Erreur lors de la sauvegarde du panier.' });
        res.json({ success: true });
      });
    } else {
      db.run('INSERT INTO carts (user_id, items) VALUES (?, ?)', [userId, itemsJson], (err) => {
        if (err) return res.status(500).json({ error: 'Erreur lors de la sauvegarde du panier.' });
        res.json({ success: true });
      });
    }
  });
});

// ============================================================
// GESTION DES COUPONS (ADMIN)
// ============================================================

// Créer un coupon
app.post('/api/admin/coupons', verifyToken, requireAdmin, (req, res) => {
  const { code, type, valeur, date_expiration, nombre_utilisations_max, actif } = req.body;

  if (!code || !type || valeur === undefined) {
    return res.status(400).json({ error: 'Le code, type et la valeur sont requis.' });
  }

  const sql = `
    INSERT INTO coupons (code, type, valeur, date_expiration, nombre_utilisations_max, actif) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [
    code.toUpperCase(),
    type,
    valeur,
    date_expiration || null,
    nombre_utilisations_max || null,
    actif !== undefined ? (actif ? 1 : 0) : 1
  ], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Ce code promo existe déjà.' });
      }
      return res.status(500).json({ error: 'Erreur lors de la création du coupon.', details: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Coupon créé avec succès.' });
  });
});

// Lister tous les coupons
app.get('/api/admin/coupons', verifyToken, requireAdmin, (req, res) => {
  db.all('SELECT * FROM coupons ORDER BY date_creation DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erreur lors du chargement des coupons.' });
    res.json(rows);
  });
});

// Modifier ou désactiver un coupon
app.put('/api/admin/coupons/:id', verifyToken, requireAdmin, (req, res) => {
  const { type, valeur, date_expiration, nombre_utilisations_max, actif } = req.body;
  const sql = `
    UPDATE coupons 
    SET type = ?, valeur = ?, date_expiration = ?, nombre_utilisations_max = ?, actif = ?
    WHERE id = ?
  `;

  db.run(sql, [
    type,
    valeur,
    date_expiration || null,
    nombre_utilisations_max || null,
    actif ? 1 : 0,
    req.params.id
  ], function (err) {
    if (err) return res.status(500).json({ error: 'Erreur lors de la mise à jour du coupon.' });
    if (this.changes === 0) return res.status(404).json({ error: 'Coupon non trouvé.' });
    res.json({ message: 'Coupon mis à jour avec succès.' });
  });
});

// Supprimer un coupon
app.delete('/api/admin/coupons/:id', verifyToken, requireAdmin, (req, res) => {
  db.run('DELETE FROM coupons WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Erreur lors de la suppression du coupon.' });
    if (this.changes === 0) return res.status(404).json({ error: 'Coupon non trouvé.' });
    res.json({ message: 'Coupon supprimé avec succès.' });
  });
});

// ============================================================
// VÉRIFICATION D'UN COUPON (CLIENT)
// ============================================================

app.post('/api/coupons/verify', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Code manquant' });

    const coupon = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM coupons WHERE code = ? AND actif = 1',
        [code.toUpperCase()],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!coupon) {
      return res.status(404).json({ error: 'Code promo invalide ou expiré' });
    }

    if (coupon.date_expiration && new Date(coupon.date_expiration) < new Date()) {
      return res.status(400).json({ error: 'Code promo expiré' });
    }

    return res.json({
      valid: true,
      discount: coupon.valeur,
      type: coupon.type || 'pourcentage',
      code: coupon.code
    });
  } catch (err) {
    console.error('Erreur vérification coupon:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================================
// ROUTES AVIS CLIENTS (Reviews)
// ============================================================

/**
 * GET /api/products/:id/reviews
 * Retourne les avis vérifiés d'un produit + note moyenne + total.
 */
app.get('/api/products/:id/reviews', (req, res) => {
  const productId = req.params.id;

  // Récupérer les avis vérifiés avec les infos utilisateur
  const reviewsQuery = `
    SELECT 
      reviews.id, reviews.note, reviews.commentaire, reviews.photos, reviews.date_creation,
      users.prenom, users.nom, users.name
    FROM reviews
    JOIN users ON reviews.user_id = users.id
    WHERE reviews.product_id = ? AND reviews.verifie = 1
    ORDER BY reviews.date_creation DESC
  `;

  // Stats : moyenne et total
  const statsQuery = `
    SELECT 
      COUNT(*) as total,
      ROUND(AVG(note), 1) as moyenne,
      SUM(CASE WHEN note = 5 THEN 1 ELSE 0 END) as stars_5,
      SUM(CASE WHEN note = 4 THEN 1 ELSE 0 END) as stars_4,
      SUM(CASE WHEN note = 3 THEN 1 ELSE 0 END) as stars_3,
      SUM(CASE WHEN note = 2 THEN 1 ELSE 0 END) as stars_2,
      SUM(CASE WHEN note = 1 THEN 1 ELSE 0 END) as stars_1
    FROM reviews
    WHERE product_id = ? AND verifie = 1
  `;

  db.all(reviewsQuery, [productId], (err, reviews) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur.' });

    db.get(statsQuery, [productId], (err2, stats) => {
      if (err2) return res.status(500).json({ error: 'Erreur serveur.' });

      res.json({
        reviews: reviews.map(r => ({
          ...r,
          photos: (() => { try { return r.photos ? JSON.parse(r.photos) : []; } catch { return []; } })(),
          auteur: r.prenom
            ? `${r.prenom} ${r.nom ? r.nom[0] + '.' : ''}`
            : r.name || 'Anonyme'
        })),
        stats: {
          total: stats.total || 0,
          moyenne: stats.moyenne || 0,
          distribution: {
            5: stats.stars_5 || 0,
            4: stats.stars_4 || 0,
            3: stats.stars_3 || 0,
            2: stats.stars_2 || 0,
            1: stats.stars_1 || 0,
          }
        }
      });
    });
  });
});

const reviewStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/reviews'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'review-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  }
});

const reviewUpload = multer({
  storage: reviewStorage,
  fileFilter: fileFilter, // Reuse the same fileFilter as uploadProducts
  limits: { fileSize: 5 * 1024 * 1024 }
});

/**
 * POST /api/products/:id/reviews
 * Laisser un avis (utilisateur connecté + doit avoir commandé ce produit).
 */
app.post('/api/products/:id/reviews', verifyToken, reviewUpload.array('photos', 3), (req, res) => {
  const productId = parseInt(req.params.id);
  const userId = req.user.id;
  const note = Number(req.body?.note);
  const commentaire = req.body?.commentaire || '';
  const photos = Array.isArray(req.files)
    ? req.files.slice(0, 3).map(f => `/uploads/reviews/${path.basename(f.path)}`)
    : [];

  if (!note || note < 1 || note > 5) {
    return res.status(400).json({ error: 'La note doit être entre 1 et 5.' });
  }

  // 1. Vérifier que l'utilisateur a une commande payée/expédiée contenant ce produit
  db.all("SELECT produits, statut_paiement FROM orders WHERE user_id = ? AND statut_paiement IN ('payé', 'expédiée')", [userId], (err, orders) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur.' });

    let hasOrdered = false;
    for (const order of orders) {
      try {
        const produits = JSON.parse(order.produits);
        if (produits.some(p => p.id === productId)) {
          hasOrdered = true;
          break;
        }
      } catch (e) { /* ignore parse errors */ }
    }

    if (!hasOrdered) {
      return res.status(403).json({ error: 'Vous devez avoir acheté ce produit pour laisser un avis.' });
    }

    // 2. Vérifier s'il a déjà laissé un avis
    db.get('SELECT id FROM reviews WHERE product_id = ? AND user_id = ?', [productId, userId], (err2, existing) => {
      if (err2) return res.status(500).json({ error: 'Erreur serveur.' });

      if (existing) {
        // Mettre à jour l'avis existant (repasse en non-vérifié pour re-modération)
        db.run(
          'UPDATE reviews SET note = ?, commentaire = ?, photos = ?, verifie = 0, date_creation = CURRENT_TIMESTAMP WHERE id = ?',
          [note, commentaire || '', JSON.stringify(photos), existing.id],
          function (err3) {
            if (err3) return res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'avis.' });
            res.json({ message: 'Avis mis à jour. Il sera visible après modération.', reviewId: existing.id });
          }
        );
      } else {
        // Créer un nouvel avis
        db.run(
          'INSERT INTO reviews (product_id, user_id, note, commentaire, photos) VALUES (?, ?, ?, ?, ?)',
          [productId, userId, note, commentaire || '', JSON.stringify(photos)],
          function (err3) {
            if (err3) {
              if (err3.message.includes('UNIQUE')) {
                return res.status(409).json({ error: 'Vous avez déjà laissé un avis pour ce produit.' });
              }
              return res.status(500).json({ error: 'Erreur lors de la création de l\'avis.' });
            }
            res.status(201).json({ message: 'Avis soumis avec succès ! Il sera visible après modération.', reviewId: this.lastID });
          }
        );
      }
    });
  });
});

/**
 * GET /api/admin/reviews
 * Liste tous les avis (admin uniquement) avec filtre optionnel ?status=pending|approved|all
 */
app.get('/api/admin/reviews', verifyToken, requireAdmin, (req, res) => {
  const status = req.query.status || 'all';

  let whereClause = '';
  if (status === 'pending') whereClause = 'WHERE reviews.verifie = 0';
  else if (status === 'approved') whereClause = 'WHERE reviews.verifie = 1';

  const query = `
    SELECT 
      reviews.id, reviews.product_id, reviews.user_id, reviews.note, 
      reviews.commentaire, reviews.verifie, reviews.date_creation,
      users.prenom, users.nom, users.name AS user_name, users.email,
      products.name AS product_name
    FROM reviews
    JOIN users ON reviews.user_id = users.id
    JOIN products ON reviews.product_id = products.id
    ${whereClause}
    ORDER BY reviews.date_creation DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Erreur récupération avis:', err.message);
      return res.status(500).json({ error: 'Erreur serveur.' });
    }
    res.json({ reviews: rows });
  });
});

/**
 * PUT /api/admin/reviews/:id
 * Approuver ou rejeter un avis (admin uniquement).
 * Body: { verifie: true/false }
 */
app.put('/api/admin/reviews/:id', verifyToken, requireAdmin, (req, res) => {
  const { verifie } = req.body;

  if (verifie === undefined) {
    return res.status(400).json({ error: 'Le champ "verifie" est requis.' });
  }

  db.run(
    'UPDATE reviews SET verifie = ? WHERE id = ?',
    [verifie ? 1 : 0, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
      if (this.changes === 0) return res.status(404).json({ error: 'Avis non trouvé.' });

      // Attribution de points de fidélité si l'avis est approuvé
      if (verifie) {
        db.get('SELECT user_id FROM reviews WHERE id = ?', [req.params.id], (err, review) => {
          if (!err && review) {
            addLoyaltyPoints(review.user_id, 15, 'Avis client approuvé', parseInt(req.params.id)).catch(err => {
              console.error('Erreur attribution points avis:', err);
            });
          }
        });
      }

      res.json({ message: verifie ? 'Avis approuvé.' : 'Avis rejeté.' });
    }
  );
});

/**
 * DELETE /api/admin/reviews/:id
 * Supprimer un avis (admin uniquement).
 */
app.delete('/api/admin/reviews/:id', verifyToken, requireAdmin, (req, res) => {
  db.run('DELETE FROM reviews WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: 'Erreur lors de la suppression.' });
    if (this.changes === 0) return res.status(404).json({ error: 'Avis non trouvé.' });
    res.json({ message: 'Avis supprimé.' });
  });
});

// ============================================================
// PROGRAMME DE FIDÉLITÉ "LES PLUMES"
// ============================================================

/**
 * Détermine le niveau en fonction des points cumulés totaux
 */
function getLoyaltyLevel(pointsCumulesTotal) {
  if (pointsCumulesTotal >= 300) return 'aigle_royal';
  if (pointsCumulesTotal >= 100) return 'chasseur';
  return 'initie';
}

/**
 * Retourne le multiplicateur de points selon le niveau
 */
function getLevelMultiplier(niveau) {
  if (niveau === 'aigle_royal') return 1.20;
  if (niveau === 'chasseur') return 1.10;
  return 1.0;
}

/**
 * Ajoute des points de fidélité à un utilisateur.
 * Gère le multiplicateur de niveau, la transaction et la mise à jour du niveau.
 * @returns {Promise<{points_ajoutes, nouveau_total, niveau}>}
 */
function getLoyaltyTransactionType(points, raison = '') {
  const normalized = String(raison).toLowerCase();
  if (points < 0) return 'echange';
  if (normalized.includes('inscription')) return 'inscription';
  if (normalized.includes('commande') || normalized.includes('achat')) return 'achat';
  if (normalized.includes('parrainage')) return 'parrainage';
  if (normalized.includes('avis')) return 'avis';
  if (normalized.includes('admin') || normalized.includes('manuel')) return 'admin';
  if (normalized.includes('bonus')) return 'bonus';
  return points > 0 ? 'gain' : 'ajustement';
}

function addLoyaltyPoints(userId, points, raison, referenceId = null) {
  return new Promise((resolve, reject) => {
    // S'assurer que la ligne loyalty_points existe
    db.run(
      `INSERT OR IGNORE INTO loyalty_points (user_id, points_actuels, points_cumules_total, niveau) VALUES (?, 0, 0, 'initie')`,
      [userId],
      (err) => {
        if (err) return reject(err);

        // Récupérer le niveau actuel pour le multiplicateur
        db.get('SELECT * FROM loyalty_points WHERE user_id = ?', [userId], (err, row) => {
          if (err) return reject(err);

          let pointsFinaux = points;
          // Appliquer le multiplicateur seulement sur les gains (pas les dépenses)
          if (points > 0) {
            const multiplier = getLevelMultiplier(row ? row.niveau : 'initie');
            pointsFinaux = Math.round(points * multiplier);
          }

          // Mettre à jour les points
          const newActuels = Math.max(0, (row ? row.points_actuels : 0) + pointsFinaux);
          const newCumules = points > 0
            ? (row ? row.points_cumules_total : 0) + pointsFinaux
            : (row ? row.points_cumules_total : 0); // Les dépenses ne réduisent pas le cumul

          const newNiveau = getLoyaltyLevel(newCumules);

          const transactionType = getLoyaltyTransactionType(pointsFinaux, raison);

          db.run(
            `UPDATE loyalty_points SET points_actuels = ?, points_cumules_total = ?, niveau = ?, date_mise_a_jour = CURRENT_TIMESTAMP WHERE user_id = ?`,
            [newActuels, newCumules, newNiveau, userId],
            (err) => {
              if (err) return reject(err);

              // Insérer la transaction
              db.run(
                `INSERT INTO loyalty_transactions (user_id, points, type, raison, reference_id) VALUES (?, ?, ?, ?, ?)`,
                [userId, pointsFinaux, transactionType, raison, referenceId],
                function (err) {
                  if (err) return reject(err);
                  resolve({ points_ajoutes: pointsFinaux, nouveau_total: newActuels, niveau: newNiveau });
                }
              );
            }
          );
        });
      }
    );
  });
}

// [FIN DES FONCTIONS PACKLINK SUPPRIMÉES]

/**
 * Génère un code de parrainage unique basé sur l'ID utilisateur
 */
function generateReferralCode(userId) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const base = 'PLM' + String(userId).padStart(3, '0');
  let extra = '';
  for (let i = 0; i < (8 - base.length); i++) {
    extra += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return (base + extra).substring(0, 8);
}

// ── GET /api/loyalty/my-points ──
app.get('/api/loyalty/my-points', verifyToken, (req, res) => {
  const userId = req.user.id;

  // S'assurer que la ligne existe
  db.run(
    `INSERT OR IGNORE INTO loyalty_points (user_id, points_actuels, points_cumules_total, niveau) VALUES (?, 0, 0, 'initie')`,
    [userId]
  );

  db.get('SELECT * FROM loyalty_points WHERE user_id = ?', [userId], (err, loyaltyRow) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur.' });

    const data = loyaltyRow || { points_actuels: 0, points_cumules_total: 0, niveau: 'initie' };

    // Points pour le prochain niveau
    let points_prochain_niveau = 0;
    let prochain_niveau = null;
    if (data.niveau === 'initie') {
      points_prochain_niveau = 100 - data.points_cumules_total;
      prochain_niveau = 'chasseur';
    } else if (data.niveau === 'chasseur') {
      points_prochain_niveau = 300 - data.points_cumules_total;
      prochain_niveau = 'aigle_royal';
    }

    // Dernières transactions
    db.all(
      'SELECT * FROM loyalty_transactions WHERE user_id = ? ORDER BY date_creation DESC LIMIT 10',
      [userId],
      (err, transactions) => {
        if (err) transactions = [];

        // Vérifier le bonus anniversaire
        db.get('SELECT date_naissance, anniversaire_utilise FROM users WHERE id = ?', [userId], (err, userRow) => {
          let anniversaire_actif = false;
          let anniversaire_expiration = null;

          if (!err && userRow && userRow.date_naissance) {
            const today = new Date();
            const dob = new Date(userRow.date_naissance);
            const sameDay = today.getDate() === dob.getDate() && today.getMonth() === dob.getMonth();
            const currentYear = today.getFullYear();

            if (sameDay && userRow.anniversaire_utilise !== currentYear) {
              anniversaire_actif = true;
              const expiration = new Date(today);
              expiration.setHours(expiration.getHours() + 24);
              anniversaire_expiration = expiration.toISOString();
            }
          }

          // Compteur de filleuls
          db.get('SELECT COUNT(*) as count FROM users WHERE parrain_id = ?', [userId], (err, refRow) => {
            res.json({
              points_actuels: data.points_actuels,
              points_cumules_total: data.points_cumules_total,
              niveau: data.niveau,
              points_prochain_niveau: Math.max(0, points_prochain_niveau),
              prochain_niveau,
              transactions: transactions || [],
              anniversaire_actif,
              anniversaire_expiration,
              filleuls_count: refRow ? refRow.count : 0
            });
          });
        });
      }
    );
  });
});

// ── POST /api/loyalty/redeem ──
app.post('/api/loyalty/redeem', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { type_recompense } = req.body;

  const recompenses = {
    reduction_5: { points: 50, type: 'pourcentage', valeur: 5, label: 'Réduction 5%' },
    reduction_10: { points: 100, type: 'pourcentage', valeur: 10, label: 'Réduction 10%' },
    livraison_gratuite: { points: 75, type: 'montant_fixe', valeur: 9.90, label: 'Livraison gratuite' },
    pochon_offert: { points: 250, type: 'montant_fixe', valeur: 15, label: 'Pochon offert' },
  };

  const recompense = recompenses[type_recompense];
  if (!recompense) return res.status(400).json({ error: 'Type de récompense invalide.' });

  // Vérifier les points disponibles
  db.get('SELECT points_actuels FROM loyalty_points WHERE user_id = ?', [userId], async (err, row) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur.' });
    if (!row || row.points_actuels < recompense.points) {
      return res.status(400).json({ error: `Pas assez de Plumes. Il vous faut ${recompense.points} Plumes.` });
    }

    // Générer un code coupon unique
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let couponCode = 'PLUME-';
    for (let i = 0; i < 6; i++) couponCode += chars.charAt(Math.floor(Math.random() * chars.length));

    // Créer le coupon dans la table coupons
    db.run(
      `INSERT INTO coupons (code, type, valeur, nombre_utilisations_max, actif) VALUES (?, ?, ?, 1, 1)`,
      [couponCode, recompense.type, recompense.valeur],
      async function (err) {
        if (err) return res.status(500).json({ error: 'Erreur lors de la création du coupon.' });

        try {
          // Débiter les points
          await addLoyaltyPoints(userId, -recompense.points, `Échange : ${recompense.label}`, this.lastID);
          res.json({
            message: `Récompense échangée ! Votre code : ${couponCode}`,
            coupon_code: couponCode,
            recompense: recompense.label,
            points_depenses: recompense.points
          });
        } catch (e) {
          res.status(500).json({ error: 'Erreur lors du débit des points.' });
        }
      }
    );
  });
});

// ── GET /api/loyalty/referral-code ──
app.get('/api/loyalty/referral-code', verifyToken, (req, res) => {
  const userId = req.user.id;

  db.get('SELECT code_parrainage FROM users WHERE id = ?', [userId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur.' });

    if (row && row.code_parrainage) {
      return res.json({ code: row.code_parrainage });
    }

    // Générer un nouveau code
    const code = generateReferralCode(userId);
    db.run('UPDATE users SET code_parrainage = ? WHERE id = ?', [code, userId], (err) => {
      if (err) return res.status(500).json({ error: 'Erreur lors de la génération du code.' });
      res.json({ code });
    });
  });
});

// ── POST /api/loyalty/use-referral ──
app.post('/api/loyalty/use-referral', verifyToken, (req, res) => {
  const userId = req.user.id;
  const { code } = req.body;

  if (!code) return res.status(400).json({ error: 'Code de parrainage requis.' });

  // Vérifier que le code existe
  db.get('SELECT id FROM users WHERE code_parrainage = ?', [code], (err, parrain) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur.' });
    if (!parrain) return res.status(404).json({ error: 'Code de parrainage invalide.' });
    if (parrain.id === userId) return res.status(400).json({ error: 'Vous ne pouvez pas vous parrainer vous-même.' });

    // Vérifier que l'utilisateur n'a pas déjà un parrain
    db.get('SELECT parrain_id FROM users WHERE id = ?', [userId], (err, userRow) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur.' });
      if (userRow && userRow.parrain_id) return res.status(400).json({ error: 'Vous avez déjà un parrain.' });

      // Enregistrer le parrain
      db.run('UPDATE users SET parrain_id = ? WHERE id = ?', [parrain.id, userId], (err) => {
        if (err) return res.status(500).json({ error: 'Erreur lors de l\'enregistrement du parrainage.' });
        res.json({ message: 'Parrainage enregistré avec succès !' });
      });
    });
  });
});

// ── GET /api/admin/loyalty ──
app.get('/api/admin/loyalty', verifyToken, requireAdmin, (req, res) => {
  const query = `
    SELECT
      u.id, u.prenom, u.nom, u.email,
      COALESCE(lp.points_actuels, 0) as points_actuels,
      COALESCE(lp.points_cumules_total, 0) as points_cumules_total,
      COALESCE(lp.niveau, 'initie') as niveau,
      (SELECT COUNT(*) FROM loyalty_transactions WHERE user_id = u.id) as nb_transactions
    FROM users u
    LEFT JOIN loyalty_points lp ON u.id = lp.user_id
    ORDER BY lp.points_cumules_total DESC
  `;
  db.all(query, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur.' });

    // Stats globales
    const totalPlumes = rows.reduce((sum, r) => sum + r.points_cumules_total, 0);
    const niveaux = { initie: 0, chasseur: 0, aigle_royal: 0 };
    rows.forEach(r => { niveaux[r.niveau] = (niveaux[r.niveau] || 0) + 1; });

    res.json({
      stats: { total_plumes: totalPlumes, niveaux },
      users: rows
    });
  });
});

// ── PUT /api/admin/loyalty/:userId ──
app.put('/api/admin/loyalty/:userId', verifyToken, requireAdmin, async (req, res) => {
  const { points, raison } = req.body;
  const targetUserId = parseInt(req.params.userId);

  if (!points || !raison) return res.status(400).json({ error: 'Points et raison requis.' });

  try {
    const result = await addLoyaltyPoints(targetUserId, parseInt(points), `Admin: ${raison}`);
    res.json({ message: 'Points mis à jour.', ...result });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour des points.' });
  }
});

// [FIN DES ROUTES PACKLINK SUPPRIMÉES]

// ── GET /api/generate-rib ──
app.get('/api/generate-rib', async (req, res) => {
  const { orderId, amount, reference } = req.query;

  if (!orderId || !amount || !reference) {
    return res.status(400).send('Paramètres manquants');
  }

  try {
    const { createCanvas, loadImage } = require('canvas');
    // Dimensions 1200 x 1600 (Ratio 3:4)
    const width = 1200;
    const height = 1600;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // --- PALETTES & STYLES ---
    const bgBlack = '#111111';
    const cardBg = '#1A1610';
    const goldMatte = '#A68A56';
    const burgundyDark = '#5C141F';
    const pureWhite = '#FFFFFF';
    const pureBlack = '#000000';

    ctx.fillStyle = bgBlack;
    ctx.fillRect(0, 0, width, height);

    const cardMargin = 40;
    const cardWidth = width - (cardMargin * 2);
    const cardHeight = height - (cardMargin * 2);
    
    ctx.fillStyle = cardBg;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 20;
    ctx.fillRect(cardMargin, cardMargin, cardWidth, cardHeight);
    ctx.shadowBlur = 0;

    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = goldMatte;
    ctx.font = '60px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const symbols = ['𓅃', '𓆣', '𓁹', '𓋹', '𓃻'];
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 20; j++) {
        const sym = symbols[(i + j) % symbols.length];
        ctx.fillText(sym, cardMargin + j * 70, cardMargin + i * 70);
      }
    }
    ctx.restore();

    const innerMarginX = cardMargin + 80;
    let currentY = cardMargin + 60;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    try {
      const logoPath = path.join(__dirname, 'image_5.png');
      if (fs.existsSync(logoPath)) {
        const logo = await loadImage(logoPath);
        const logoRatio = logo.width / logo.height;
        const logoWidth = 150 * logoRatio;
        ctx.drawImage(logo, (width - logoWidth) / 2, currentY, logoWidth, 150);
        currentY += 170;
      } else {
        ctx.fillStyle = burgundyDark;
        ctx.beginPath();
        ctx.arc(width / 2, currentY + 75, 75, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.font = '60px serif';
        ctx.fillText('🦅', width / 2, currentY + 45);
        currentY += 170;
      }
    } catch (e) {
      currentY += 170;
    }

    ctx.fillStyle = burgundyDark;
    ctx.font = 'bold 46px "Times New Roman", Garamond, serif';
    ctx.fillText('DOIRY SHOP', width / 2, currentY);
    currentY += 70;

    ctx.fillStyle = goldMatte;
    ctx.font = '30px "Times New Roman", Garamond, serif';
    ctx.fillText('PROTOCOLE DE TRANSFERT SÉCURISÉ', width / 2, currentY);
    currentY += 60;

    ctx.beginPath();
    ctx.moveTo(innerMarginX, currentY);
    ctx.lineTo(width - innerMarginX, currentY);
    ctx.strokeStyle = goldMatte;
    ctx.lineWidth = 1;
    ctx.stroke();
    currentY += 60;

    ctx.textAlign = 'left';

    const zoneB_Y = currentY;
    const zoneB_Height = 520;
    const zoneB_MarginX = innerMarginX - 40;
    const zoneB_Width = width - (zoneB_MarginX * 2);

    ctx.fillStyle = pureWhite;
    if (ctx.roundRect) {
      ctx.roundRect(zoneB_MarginX, zoneB_Y, zoneB_Width, zoneB_Height, 15);
    } else {
      ctx.fillRect(zoneB_MarginX, zoneB_Y, zoneB_Width, zoneB_Height);
    }
    ctx.fill();

    currentY += 40;

    const drawOcrRow = (label, value, isIban = false) => {
      ctx.fillStyle = pureBlack;
      ctx.font = 'bold 22px Arial, Helvetica, "Inter", "Roboto", sans-serif';
      ctx.fillText(label, innerMarginX, currentY);
      currentY += 35;

      ctx.fillStyle = pureBlack;
      const fontSize = isIban ? 52 : 36;
      ctx.font = `bold ${fontSize}px Arial, Helvetica, "Inter", "Roboto", sans-serif`;
      ctx.fillText(value, innerMarginX, currentY);
      
      currentY += isIban ? 90 : 70;
    };

    drawOcrRow('Titulaire du compte :', 'Evan DUMAS');
    const staticIban = 'FR76 2823 3000 0161 1348 4847 481';
    drawOcrRow('IBAN :', staticIban, true);
    drawOcrRow('Code BIC / SWIFT :', 'REVOFRP2');
    drawOcrRow('Banque :', 'Revolut Bank UAB');

    currentY = zoneB_Y + zoneB_Height + 60;

    ctx.fillStyle = goldMatte;
    ctx.font = 'italic 26px "Times New Roman", Garamond, serif';
    ctx.fillText('Numéro de commande :', innerMarginX, currentY);
    currentY += 40;
    ctx.fillStyle = goldMatte;
    ctx.font = 'bold 36px "Times New Roman", Garamond, serif';
    ctx.fillText(`CMD-${orderId}`, innerMarginX, currentY);
    currentY += 70;

    ctx.fillStyle = goldMatte;
    ctx.font = 'italic 26px "Times New Roman", Garamond, serif';
    ctx.fillText('Total de votre commande :', innerMarginX, currentY);
    currentY += 40;
    ctx.fillStyle = goldMatte;
    ctx.font = 'bold 36px "Times New Roman", Garamond, serif';
    ctx.fillText(`${amount} €`, innerMarginX, currentY);
    currentY += 70;

    ctx.fillStyle = goldMatte;
    ctx.font = 'italic 26px "Times New Roman", Garamond, serif';
    ctx.fillText('Référence de virement :', innerMarginX, currentY);
    currentY += 40;
    ctx.fillStyle = goldMatte;
    ctx.font = 'bold 36px "Times New Roman", Garamond, serif';
    ctx.fillText(reference, innerMarginX, currentY);
    currentY += 45;

    ctx.fillStyle = goldMatte;
    ctx.font = 'italic 20px "Times New Roman", Garamond, serif';
    ctx.fillText('Veuillez inscrire cette référence exacte lors de la validation de votre virement.', innerMarginX, currentY);

    ctx.textAlign = 'center';
    ctx.fillStyle = goldMatte;
    
    const footerY = height - cardMargin - 50;
    ctx.font = '40px serif';
    ctx.fillText('☥', width / 2, footerY - 45); 

    ctx.font = '18px "Times New Roman", Garamond, serif'; 
    ctx.fillText('Document crypté dynamiquement – Doiry Shop Cryptage DSP2', width / 2, footerY);

    const buffer = canvas.toBuffer('image/png', { resolution: 300 });

    res.setHeader('Content-Type', 'image/png');
    
    const disposition = req.query.download === '1' ? 'attachment' : 'inline';
    res.setHeader('Content-Disposition', `${disposition}; filename="doiryshop_rib_${orderId}.png"`);
    
    res.send(buffer);

  } catch (error) {
    console.error('Erreur lors de la génération du RIB :', error);
    res.status(500).send('Erreur interne lors de la génération du RIB');
  }
});

// Lancement du serveur
const server = app.listen(3001, () => {
  console.log('=== Backend démarré sur http://localhost:3001 ===');
  console.log('=== Health Check URL: http://localhost:3001/health ===');
  console.log('=== Prêt pour UptimeRobot ! ===');
});

server.on('error', (err) => {
  console.error('[SERVER ERROR]', err.message);
});
