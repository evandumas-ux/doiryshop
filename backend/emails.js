const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');

// Utilise la clé API depuis les variables d'environnement
const resend = new Resend(process.env.RESEND_API_KEY);

// Expéditeur par défaut (onboarding@resend.dev en attendant un domaine custom)
const FROM_EMAIL = 'Doiry Shop <onboarding@resend.dev>';
const FROM_CONTACT = 'Doiry Shop <contact@doiryshop.com>';
const FROM_COMMANDES = 'Doiry Shop <commandes@doiryshop.com>';
const DEFAULT_REVOLUT_URL = process.env.REVOLUT_ME_URL || 'https://revolut.me/dumase07';

const buildOrderReference = (orderId) => `dry-${orderId}`;

const buildRevolutPaymentLink = ({ amount, orderId, reference }) => {
  const params = new URLSearchParams();
  if (amount) params.set('amount', Number(amount).toFixed(2));
  if (reference) params.set('reference', reference);
  else if (orderId) params.set('reference', buildOrderReference(orderId));
  return `${DEFAULT_REVOLUT_URL}?${params.toString()}`;
};

const getEmailLogoDataUri = () => {
  const logoCandidates = [
    path.resolve(__dirname, '../public/favicon.jpg'),
    path.resolve(__dirname, '../public/logo.jpg'),
  ];
  const logoPath = logoCandidates.find((candidate) => fs.existsSync(candidate));
  if (!logoPath) return null;
  try {
    const logoBase64 = fs.readFileSync(logoPath).toString('base64');
    return `data:image/jpeg;base64,${logoBase64}`;
  } catch {
    return null;
  }
};

/**
 * Envoie un email de bienvenue à la newsletter.
 */
async function sendNewsletterWelcomeEmail(email) {
  try {
    const data = await resend.emails.send({
      from: FROM_CONTACT,
      to: email,
      subject: `🌿 Bienvenue dans la communauté Doiry`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#121212;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#1a1a1a;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.4);border:1px solid #333;">
    <div style="padding:40px 32px;text-align:center;border-bottom:1px solid #333;">
      <h1 style="margin:0;color:#f0f0f0;font-size:28px;font-family:Georgia,serif;font-weight:400;letter-spacing:2px;">
        Doiry Shop
      </h1>
    </div>
    <div style="padding:40px 32px;">
      <h2 style="margin:0 0 16px;color:#e8e8e8;font-family:Georgia,serif;font-size:22px;font-weight:400;text-align:center;">
        Un nouveau chapitre commence
      </h2>
      <p style="color:#b0b0b0;font-size:15px;line-height:1.7;margin:0 0 20px;text-align:center;">
        Merci de rejoindre notre cercle. Ici, nous explorons le calme, la douceur des plantes et les rituels alternatifs.
      </p>
      <p style="color:#b0b0b0;font-size:15px;line-height:1.7;margin:0 0 32px;text-align:center;">
        Votre inscription est bien confirmée. Vous recevrez bientot nos inspirations, nos nouveautés, et un moment de poésie dans votre boite de réception.
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="https://doiryshop.com/#boutique" style="display:inline-block;background:#831b2f;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:1px;transition:background 0.3s;">
          Découvrir nos créations
        </a>
      </div>
      <p style="color:#808080;font-size:13px;line-height:1.7;margin:0;text-align:center;">
        Prenez soin de vous,<br/>
        <strong>L'équipe Doiry Shop</strong>
      </p>
    </div>
    <div style="padding:24px 32px;background:#141414;border-top:1px solid #333;text-align:center;">
      <p style="margin:0;color:#666;font-size:12px;">
        © 2026 Doiry Shop · Tous droits réservés
      </p>
    </div>
  </div>
</body>
</html>`
    });
    console.log(`📧 Email de bienvenue newsletter envoyé à ${email}`);
    return data;
  } catch (error) {
    console.error('❌ Erreur envoi email newsletter:', error);
    throw error;
  }
}

/**
 * Envoie un email de bienvenue après création de compte.
 */
async function sendWelcomeEmail(email, prenom) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Bienvenue chez Doiry Shop, ${prenom || 'et bienvenue'} ✨ `,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#FAFAF7;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#831b2f 0%,#a8192b 100%);padding:40px 32px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:28px;font-family:Georgia,serif;font-weight:400;">
        Doiry Shop
      </h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;letter-spacing:1px;">COMPTOIR DE PLANTES MODERNE</p>
    </div>

    <!-- Corps -->
    <div style="padding:40px 32px;">
      <h2 style="margin:0 0 16px;color:#2D3B2A;font-family:Georgia,serif;font-size:22px;font-weight:400;">
        Bienvenue dans votre nouveau rituel, ${prenom || ''}
      </h2>
      <p style="color:#5A6855;font-size:15px;line-height:1.7;margin:0 0 20px;">
        Merci d'avoir rejoint Doiry Shop. Ici, nous creons des substituts naturels au tabac et des infusions apaisantes a base de plantes selectionnees avec soin.
      </p>
      <p style="color:#5A6855;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Vous y trouverez des pré-roulés aux feuilles de framboisier, des bases en vrac, des kits de roulage et des infusions pensees pour ralentir naturellement, toujours sans nicotine.
      </p>
      <p style="color:#5A6855;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Prenez votre temps, explorez la collection, et trouvez le format qui vous ressemble. Nous sommes ravis de vous accompagner dans cette transition.
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="https://doiryshop.com/#boutique" style="display:inline-block;background:#A8192B;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;">
          Decouvrir la collection
        </a>
      </div>
      <p style="color:#8A9080;font-size:13px;line-height:1.7;margin:0;">
        A bientot,<br/>
        <strong>L'equipe Doiry Shop</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:24px 32px;background:#F5F5F0;border-top:1px solid #E8E8E0;text-align:center;">
      <p style="margin:0;color:#8A9080;font-size:12px;">
        © 2026 Doiry Shop · Tous droits reserves<br/>
        Vente reservee aux majeurs de 18 ans.
      </p>
    </div>
  </div>
</body>
</html>`
    });
    console.log(`📧 Email de bienvenue envoyé à ${email}`, data);
    return data;
  } catch (error) {
    console.error('❌ Erreur envoi email bienvenue:', error);
    throw error;
  }
}

/**
 * Envoie un email de confirmation de commande.
 */
async function sendOrderConfirmation(email, order, options = {}) {
  const produits = Array.isArray(order.produits) ? order.produits : JSON.parse(order.produits || '[]');
  const adresse = typeof order.adresse_livraison === 'object' ? order.adresse_livraison : JSON.parse(order.adresse_livraison || '{}');
  const orderReference = order.reference || buildOrderReference(order.id);
  const revolutLink = buildRevolutPaymentLink({ amount: order.total, orderId: order.id, reference: orderReference });
  const logoDataUri = getEmailLogoDataUri();

  const produitsHtml = produits.map((p) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#f4f1ec;font-size:14px;">${p.name || 'Produit'}</td>
      <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#d6d0c8;font-size:14px;text-align:center;">${p.quantity || 1}</td>
      <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#f4f1ec;font-size:14px;text-align:right;font-weight:600;">${((p.price || 0) * (p.quantity || 1)).toFixed(2)} €</td>
    </tr>
  `).join('');

  const attachments = [];
  if (options.invoiceBuffer) {
    attachments.push({
      filename: options.filename || `facture-${order.id}.pdf`,
      content: options.invoiceBuffer.toString('base64'),
    });
  }

  try {
    const data = await resend.emails.send({
      from: FROM_COMMANDES,
      to: email,
      subject: 'Votre commande Doiry Shop est enregistrée €xRR',
      attachments,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#0d0d0d;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:640px;margin:24px auto;background:#121212;border:1px solid #2a2a2a;border-radius:16px;overflow:hidden;">
    <div style="padding:30px 28px;border-bottom:1px solid #2a2a2a;background:#151515;">
      ${logoDataUri ? `<img src="${logoDataUri}" alt="Doiry Shop" style="height:60px;width:auto;display:block;margin-bottom:14px;" />` : '<h1 style="margin:0 0 14px;color:#f4f1ec;font-family:Georgia,serif;">Doiry Shop</h1>'}
      <p style="margin:0;color:#b9b2aa;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Commande enregistrée</p>
      <p style="margin:8px 0 0;color:#f4f1ec;font-size:14px;">Référence <strong style="color:#e9d9de;">${orderReference}</strong></p>
    </div>

    <div style="padding:28px;">
      <p style="margin:0 0 16px;color:#f4f1ec;font-size:16px;line-height:1.7;">
        Merci pour votre confiance. Votre commande est bien enregistrée.
      </p>
      <p style="margin:0 0 16px;color:#d6d0c8;font-size:14px;line-height:1.7;">
        Pour valider votre achat et déclencher l'expédition sous 48h, merci d'effectuer votre virement Revolut en indiquant impérativement la référence <strong style="color:#f4f1ec;">${orderReference}</strong> en note.
      </p>

      <table style="width:100%;border-collapse:collapse;margin:20px 0 10px;">
        <thead>
          <tr>
            <th style="text-align:left;padding-bottom:10px;color:#8b263e;font-size:12px;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid #2a2a2a;">Produit</th>
            <th style="text-align:center;padding-bottom:10px;color:#8b263e;font-size:12px;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid #2a2a2a;">Qté</th>
            <th style="text-align:right;padding-bottom:10px;color:#8b263e;font-size:12px;letter-spacing:1px;text-transform:uppercase;border-bottom:1px solid #2a2a2a;">Total TTC</th>
          </tr>
        </thead>
        <tbody>${produitsHtml}</tbody>
      </table>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-top:14px;border-top:1px solid #2a2a2a;">
        <span style="color:#d6d0c8;font-size:14px;">Total TTC</span>
        <span style="color:#f4f1ec;font-size:22px;font-weight:700;font-family:Georgia,serif;">${Number(order.total || 0).toFixed(2)} €</span>
      </div>

      <div style="text-align:center;margin:26px 0 10px;">
        <a href="${revolutLink}" target="_blank" style="display:inline-block;background:#8b263e;color:#ffffff;text-decoration:none;padding:14px 26px;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:0.3px;">
          Payer maintenant via Revolut
        </a>
      </div>
      <p style="margin:8px 0 0;color:#908880;font-size:12px;text-align:center;">
        La facture PDF est jointe à cet email.
      </p>
    </div>
  </div>
</body>
</html>`
    });
    console.log(`📧 Email premium envoyé à ${email} pour la commande #${order.id}`);
    return data;
  } catch (error) {
    console.error('❌ Erreur envoi email confirmation:', error);
    throw error;
  }
}

/**
 * Envoie un email quand la commande est expédiée (avec suivi).
 */
async function sendOrderShippedEmail(email, order) {
  const shippingMethodLabel = {
    'LETTRE_VERTE_SUIVIE': 'Lettre Verte Suivie',
    'COLISSIMO': 'Colissimo Domicile'
  }[order.shipping_method] || 'Standard';

  const trackingLink = `https://www.laposte.fr/outils/suivre-vos-envois?code=${order.tracking_number}`;

  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Votre commande #${order.id} est en route ! €xaa`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#FAFAF7;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <div style="background:linear-gradient(135deg,#6B7F5E 0%,#2D3B2A 100%);padding:40px 32px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:28px;font-family:Georgia,serif;font-weight:400;">Doiry Shop</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;letter-spacing:1px;">VOTRE COLIS EST EN ROUTE</p>
    </div>
    <div style="padding:40px 32px;">
      <h2 style="margin:0 0 16px;color:#2D3B2A;font-family:Georgia,serif;font-size:22px;font-weight:400;">Bonne nouvelle !</h2>
      <p style="color:#5A6855;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Votre commande <strong>#${order.id}</strong> a ete expediee via <strong>${shippingMethodLabel}</strong>.
      </p>
      <div style="background:#F5F5F0;padding:24px;border-radius:12px;text-align:center;margin-bottom:32px;">
        <p style="margin:0 0 8px;color:#8A9080;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Numéro de suivi</p>
        <p style="margin:0 0 20px;color:#2D3B2A;font-size:20px;font-weight:700;letter-spacing:2px;">${order.tracking_number}</p>
        <a href="${trackingLink}" style="display:inline-block;background:#2D3B2A;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
          Suivre mon colis
        </a>
      </div>
      <p style="color:#5A6855;font-size:14px;line-height:1.7;margin:0;">
        Le delai de livraison estime est de ${order.shipping_method === 'COLISSIMO' ? '2-3' : '3'} jours ouvres.
      </p>
    </div>
    <div style="padding:24px 32px;background:#F5F5F0;border-top:1px solid #E8E8E0;text-align:center;">
      <p style="margin:0;color:#8A9080;font-size:12px;">© 2026 Doiry Shop</p>
    </div>
  </div>
</body>
</html>`
    });
    return data;
  } catch (err) {
    console.error('❌ Erreur email expédition:', err);
  }
}

/**
 * Envoie le code de vérification à 6 chiffres (Style Dark Academia).
 */
async function sendVerificationCodeEmail(email, code) {
  try {
    const data = await resend.emails.send({
      from: 'Doiry Shop <bienvenue@doiryshop.com>',
      to: email,
      subject: 'Votre code secret Doiry Shop',
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#0d0d0d;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#1a1a1a;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.4);border:1px solid #333;">
    <div style="padding:40px 32px;text-align:center;border-bottom:1px solid #333;">
      <h1 style="margin:0;color:#f0f0f0;font-size:28px;font-family:Georgia,serif;font-weight:400;letter-spacing:2px;">
        Doiry Shop
      </h1>
    </div>
    <div style="padding:40px 32px;text-align:center;">
      <h2 style="margin:0 0 16px;color:#e8e8e8;font-family:Georgia,serif;font-size:22px;font-weight:400;">
        Vérification de votre espace privilégié
      </h2>
      <p style="color:#b0b0b0;font-size:15px;line-height:1.7;margin:0 0 32px;">
        Veuillez entrer le code suivant pour valider votre accès.
      </p>
      <div style="margin:0 auto 32px;background:#0d0d0d;border:1px solid #8b263e;border-radius:8px;padding:20px;max-width:200px;">
        <span style="color:#ffffff;font-size:32px;font-weight:bold;letter-spacing:4px;">${code}</span>
      </div>
      <p style="color:#808080;font-size:13px;line-height:1.7;margin:0;">
        Ce code expire dans 15 minutes.<br/>
        Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.
      </p>
    </div>
  </div>
</body>
</html>`
    });
    console.log(`📧 Email code envoyé à ${email}`);
    return data;
  } catch (error) {
    console.error('❌ Erreur envoi email code:', error);
    throw error;
  }
}

/**
 * Envoie l'e-mail de bienvenue Premium (Inscription terminée).
 */
async function sendCustomWelcomeEmail(email) {
  const logoDataUri = getEmailLogoDataUri();
  try {
    const data = await resend.emails.send({
      from: 'Doiry Shop <bienvenue@doiryshop.com>',
      to: email,
      subject: 'Bienvenue dans l\'univers Doiry Shop',
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#121212;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#1a1a1a;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.4);border:1px solid #333;">
    <div style="padding:40px 32px;text-align:center;border-bottom:1px solid #333;">
      ${logoDataUri ? `<img src="${logoDataUri}" alt="Doiry Shop" style="height:60px;width:auto;display:block;margin:0 auto 14px;" />` : ''}
      <h1 style="margin:0;color:#f0f0f0;font-size:28px;font-family:Georgia,serif;font-weight:400;letter-spacing:2px;">
        Doiry Shop
      </h1>
    </div>
    <div style="padding:40px 32px;text-align:center;">
      <h2 style="margin:0 0 16px;color:#e8e8e8;font-family:Georgia,serif;font-size:22px;font-weight:400;">
        Votre inscription est confirmée
      </h2>
      <p style="color:#b0b0b0;font-size:15px;line-height:1.7;margin:0 0 20px;">
        Bienvenue chez Doiry Shop. Plongez dans notre univers de rituels botaniques et découvrez nos plantes séchées et infusions.
      </p>
      <p style="color:#b0b0b0;font-size:15px;line-height:1.7;margin:0 0 32px;">
        Pour vous remercier, voici un code de bienvenue de 10% valable sur votre première commande :<br/>
        <strong style="color:#ffffff;font-size:18px;letter-spacing:2px;display:block;margin-top:10px;">BIENVENUE10</strong>
      </p>
      <a href="https://doiryshop.com/#boutique" style="display:inline-block;background:#8b263e;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:1px;">
        Découvrir la collection
      </a>
    </div>
  </div>
</body>
</html>`
    });
    console.log(`📧 Email bienvenue envoyé à ${email}`);
    return data;
  } catch (error) {
    console.error('❌ Erreur envoi email bienvenue:', error);
    throw error;
  }
}

module.exports = { sendWelcomeEmail, sendOrderConfirmation, sendOrderShippedEmail, sendNewsletterWelcomeEmail, sendVerificationCodeEmail, sendCustomWelcomeEmail };
