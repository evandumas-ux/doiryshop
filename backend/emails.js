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
  const logoUrl = 'https://doiryshop.com/favicon.jpg';
  try {
    await resend.emails.send({
      from: FROM_CONTACT,
      to: email,
      subject: `🌿 Bienvenue dans la communauté Doiry`,
      html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background-color:#0d0d0d; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; color:#f5f5f5;">
  <div style="max-width:600px; margin:0 auto; padding:40px 20px;">
    <div style="text-align:center; margin-bottom:30px;">
      <img src="${logoUrl}" alt="Doiry Shop" style="width:50px; height:50px; border-radius:10px; margin-bottom:10px;">
      <h1 style="margin:0; font-size:18px; letter-spacing:3px; text-transform:uppercase; color:#7a9e7e; font-weight:400;">Doiry Shop</h1>
    </div>
    <div style="background:#1a1a1a; padding:40px 30px; border-radius:12px; border:1px solid #333; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
      <h2 style="margin:0 0 16px; color:#f5f5f5; font-size:24px; font-weight:400;">Un nouveau chapitre commence</h2>
      <p style="color:#b0b0b0; font-size:16px; line-height:1.7; margin:0 0 24px;">
        Merci de rejoindre notre cercle. Ici, nous explorons le calme, la douceur des plantes et les rituels alternatifs.
      </p>
      <p style="color:#b0b0b0; font-size:16px; line-height:1.7; margin:0 0 32px;">
        Vous recevrez bientot nos inspirations, nos nouveautés, et un moment de poésie dans votre boite de réception.
      </p>
      <div style="text-align:center; margin:32px 0;">
        <a href="https://doiryshop.com/#boutique" style="display:inline-block; background:#7a9e7e; color:#0d0d0d; text-decoration:none; padding:15px 35px; border-radius:8px; font-size:16px; font-weight:bold;">
          Découvrir nos créations
        </a>
      </div>
      <p style="color:#666; font-size:13px; margin-top:30px;">
        Prenez soin de vous,<br/>
        <strong>L'équipe Doiry Shop</strong>
      </p>
    </div>
    <div style="text-align:center; margin-top:30px; color:#666; font-size:12px;">
      <p>© 2026 Doiry Shop · Botanique Moderne</p>
    </div>
  </div>
</body>
</html>`
    });
    console.log(`📧 Email de bienvenue newsletter envoyé à ${email}`);
  } catch (error) {
    console.error('❌ Erreur envoi email newsletter:', error);
    throw error;
  }
}

/**
 * Envoie un email de bienvenue après création de compte.
 */
async function sendWelcomeEmail(email, prenom) {
  const logoUrl = 'https://doiryshop.com/favicon.jpg';
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Bienvenue chez Doiry Shop, ${prenom || 'cher membre'} ✨ `,
      html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background-color:#0d0d0d; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; color:#f5f5f5;">
  <div style="max-width:600px; margin:0 auto; padding:40px 20px;">
    <div style="text-align:center; margin-bottom:30px;">
      <img src="${logoUrl}" alt="Doiry Shop" style="width:50px; height:50px; border-radius:10px; margin-bottom:10px;">
      <h1 style="margin:0; font-size:18px; letter-spacing:3px; text-transform:uppercase; color:#7a9e7e; font-weight:400;">Doiry Shop</h1>
    </div>
    <div style="background:#1a1a1a; padding:40px 30px; border-radius:12px; border:1px solid #333; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
      <h2 style="margin:0 0 16px; color:#f5f5f5; font-size:22px; font-weight:400;">Bienvenue dans votre nouveau rituel, ${prenom || ''}</h2>
      <p style="color:#b0b0b0; font-size:15px; line-height:1.7; margin:0 0 20px;">
        Merci d'avoir rejoint Doiry Shop. Ici, nous créons des substituts naturels au tabac et des infusions apaisantes à base de plantes sélectionnées avec soin.
      </p>
      <p style="color:#b0b0b0; font-size:15px; line-height:1.7; margin:0 0 24px;">
        Découvrez nos pré-roulés aux feuilles de framboisier, nos bases en vrac et nos infusions pensées pour ralentir naturellement.
      </p>
      <div style="text-align:center; margin:32px 0;">
        <a href="https://doiryshop.com/#boutique" style="display:inline-block; background:#7a9e7e; color:#0d0d0d; text-decoration:none; padding:15px 35px; border-radius:8px; font-size:16px; font-weight:bold;">
          Découvrir la collection
        </a>
      </div>
      <p style="color:#666; font-size:13px; line-height:1.7; margin:0;">
        À bientot,<br/>
        <strong>L'équipe Doiry Shop</strong>
      </p>
    </div>
    <div style="text-align:center; margin-top:30px; color:#666; font-size:12px;">
      <p>© 2026 Doiry Shop · Vente réservée aux majeurs.</p>
    </div>
  </div>
</body>
</html>`
    });
    console.log(`📧 Email de bienvenue envoyé à ${email}`);
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
  
  // Utilisation d'un asset URL direct pour éviter le base64 qui cause la troncature Gmail
  const logoUrl = 'https://doiryshop.com/favicon.jpg';

  const produitsHtml = produits.map((p) => `
    <tr>
      <td style="padding:12px 0; border-bottom:1px solid #333; color:#f5f5f5; font-size:14px;">
        ${p.name || 'Produit'}
        <br/><span style="color:#7a9e7e; font-size:12px;">Qté: ${p.quantity || 1}</span>
      </td>
      <td style="padding:12px 0; border-bottom:1px solid #333; color:#f5f5f5; font-size:14px; text-align:right; font-weight:600;">
        ${((p.price || 0) * (p.quantity || 1)).toFixed(2)} €
      </td>
    </tr>
  `).join('');

  const shippingInfo = order.relay_info ? 
    (typeof order.relay_info === 'string' ? JSON.parse(order.relay_info) : order.relay_info) : 
    null;

  let shippingHtml = '';
  if (shippingInfo) {
    shippingHtml = `
      <div style="margin-top:20px; padding:15px; background:#252525; border-radius:8px; border:1px solid #333;">
        <p style="margin:0; color:#7a9e7e; font-size:12px; text-transform:uppercase; letter-spacing:1px; font-weight:bold;">Point Relais Sélectionné</p>
        <p style="margin:8px 0 0; color:#f5f5f5; font-size:14px; line-height:1.5;">
          <strong>${shippingInfo.name}</strong><br/>
          ${shippingInfo.address}<br/>
          ${shippingInfo.zip} ${shippingInfo.city}
        </p>
      </div>
    `;
  } else {
    shippingHtml = `
      <div style="margin-top:20px; padding:15px; background:#252525; border-radius:8px; border:1px solid #333;">
        <p style="margin:0; color:#7a9e7e; font-size:12px; text-transform:uppercase; letter-spacing:1px; font-weight:bold;">Adresse de Livraison</p>
        <p style="margin:8px 0 0; color:#f5f5f5; font-size:14px; line-height:1.5;">
          <strong>${adresse.fname || ''} ${adresse.lname || ''}</strong><br/>
          ${adresse.address || ''}<br/>
          ${adresse.zip || ''} ${adresse.city || ''}<br/>
          <span style="color:#7a9e7e; font-size:12px;">${order.shipping_method === 'MONDIAL_RELAY' ? 'Mondial Relay à Domicile' : (order.shipping_method || 'Livraison Standard')}</span>
        </p>
      </div>
    `;
  }

  const attachments = [];
  if (options.invoiceBuffer) {
    attachments.push({
      filename: options.filename || `facture-${order.id}.pdf`,
      content: options.invoiceBuffer.toString('base64'),
    });
  }

  try {
    await resend.emails.send({
      from: FROM_COMMANDES,
      to: email,
      subject: `Confirmation de commande - ${orderReference} 🌿`,
      attachments,
      html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background-color:#0d0d0d; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; color:#f5f5f5;">
  <div style="max-width:600px; margin:0 auto; padding:40px 20px;">
    
    <!-- Header Logo -->
    <div style="text-align:center; margin-bottom:30px;">
      <img src="${logoUrl}" alt="Doiry Shop" style="width:50px; height:50px; border-radius:10px; margin-bottom:10px;">
      <h1 style="margin:0; font-size:18px; letter-spacing:3px; text-transform:uppercase; color:#7a9e7e; font-weight:400;">Doiry Shop</h1>
    </div>

    <!-- Main Card -->
    <div style="background:#1a1a1a; padding:30px; border-radius:12px; border:1px solid #333; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
      <h2 style="margin:0 0 10px; font-size:22px; color:#f5f5f5; font-weight:400;">Merci pour votre commande, ${adresse.fname || 'cher client'} !</h2>
      <p style="margin:0 0 20px; color:#b0b0b0; font-size:15px; line-height:1.6;">
        Votre commande <strong>${orderReference}</strong> a bien été reçue. Nous préparons vos produits avec soin.
      </p>

      <div style="padding:15px; background:rgba(122, 158, 126, 0.1); border-left:4px solid #7a9e7e; margin-bottom:25px;">
        <p style="margin:0; color:#7a9e7e; font-size:14px; line-height:1.5;">
          Pour déclencher l'expédition, merci d'effectuer votre virement Revolut avec la référence <strong style="color:#f5f5f5;">${orderReference}</strong>.
        </p>
      </div>

      <!-- Order Summary -->
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px;">
        <thead>
          <tr>
            <th style="text-align:left; padding-bottom:10px; color:#7a9e7e; font-size:12px; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid #333;">Produit</th>
            <th style="text-align:right; padding-bottom:10px; color:#7a9e7e; font-size:12px; text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid #333;">Prix</th>
          </tr>
        </thead>
        <tbody>
          ${produitsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td style="padding-top:15px; font-size:16px; color:#b0b0b0;">Total TTC</td>
            <td style="padding-top:15px; font-size:24px; color:#7a9e7e; text-align:right; font-weight:bold;">${Number(order.total || 0).toFixed(2)} €</td>
          </tr>
        </tfoot>
      </table>

      <!-- Shipping Info -->
      ${shippingHtml}

      <!-- CTA Button -->
      <div style="text-align:center; margin-top:35px;">
        <a href="${revolutLink}" target="_blank" style="display:inline-block; background:#7a9e7e; color:#0d0d0d; text-decoration:none; padding:15px 35px; border-radius:8px; font-size:16px; font-weight:bold;">
          Régler via Revolut
        </a>
        <p style="margin:15px 0 0; color:#666; font-size:12px;">L'expédition commence dès réception du paiement.</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center; margin-top:30px; color:#666; font-size:13px; line-height:1.6;">
      <p style="margin:0 0 10px;">
        Besoin d'aide ? <a href="mailto:contact@doiryshop.com" style="color:#7a9e7e; text-decoration:none;">contact@doiryshop.com</a>
      </p>
      <p style="margin:0;">
        © 2026 Doiry Shop — Botanique Moderne & Rituels Alternatifs<br/>
        Vente interdite aux mineurs.
      </p>
    </div>

  </div>
</body>
</html>`
    });
    console.log(`📧 Email Dark Botanical envoyé à ${email} pour la commande ${orderReference}`);
  } catch (error) {
    console.error('❌ Erreur envoi email confirmation:', error);
    throw error;
  }
}

/**
 * Envoie un email quand la commande est expédiée (avec suivi).
 */
async function sendOrderShippedEmail(email, order) {
  const logoUrl = 'https://doiryshop.com/favicon.jpg';
  const shippingMethodLabel = {
    'LETTRE_VERTE_SUIVIE': 'Lettre Verte Suivie',
    'COLISSIMO': 'Colissimo Domicile'
  }[order.shipping_method] || 'Standard';

  const trackingLink = `https://www.laposte.fr/outils/suivre-vos-envois?code=${order.tracking_number}`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Votre commande #${order.id} est en route ! 📦`,
      html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background-color:#0d0d0d; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; color:#f5f5f5;">
  <div style="max-width:600px; margin:0 auto; padding:40px 20px;">
    <div style="text-align:center; margin-bottom:30px;">
      <img src="${logoUrl}" alt="Doiry Shop" style="width:50px; height:50px; border-radius:10px; margin-bottom:10px;">
      <h1 style="margin:0; font-size:18px; letter-spacing:3px; text-transform:uppercase; color:#7a9e7e; font-weight:400;">Doiry Shop</h1>
    </div>
    <div style="background:#1a1a1a; padding:40px 30px; border-radius:12px; border:1px solid #333; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
      <h2 style="margin:0 0 16px; color:#f5f5f5; font-size:22px; font-weight:400;">Bonne nouvelle !</h2>
      <p style="color:#b0b0b0; font-size:15px; line-height:1.7; margin:0 0 24px;">
        Votre commande <strong>#${order.id}</strong> a été expédiée via <strong>${shippingMethodLabel}</strong>.
      </p>
      <div style="background:#252525; padding:24px; border-radius:12px; text-align:center; margin-bottom:32px; border:1px solid #333;">
        <p style="margin:0 0 8px; color:#7a9e7e; font-size:12px; text-transform:uppercase; letter-spacing:1px;">Numéro de suivi</p>
        <p style="margin:0 0 20px; color:#f5f5f5; font-size:20px; font-weight:700; letter-spacing:2px;">${order.tracking_number}</p>
        <a href="${trackingLink}" style="display:inline-block; background:#7a9e7e; color:#0d0d0d; text-decoration:none; padding:12px 24px; border-radius:8px; font-size:14px; font-weight:bold;">
          Suivre mon colis
        </a>
      </div>
      <p style="color:#b0b0b0; font-size:14px; line-height:1.7; margin:0; text-align:center;">
        Le délai de livraison estimé est de ${order.shipping_method === 'COLISSIMO' ? '2-3' : '3-5'} jours ouvrés.
      </p>
    </div>
    <div style="text-align:center; margin-top:30px; color:#666; font-size:12px;">
      <p>© 2026 Doiry Shop · Botanique Moderne</p>
    </div>
  </div>
</body>
</html>`
    });
  } catch (err) {
    console.error('❌ Erreur email expédition:', err);
  }
}

/**
 * Envoie le code de vérification à 6 chiffres (Style Dark Botanical).
 */
async function sendVerificationCodeEmail(email, code) {
  const logoUrl = 'https://doiryshop.com/favicon.jpg';
  try {
    await resend.emails.send({
      from: 'Doiry Shop <bienvenue@doiryshop.com>',
      to: email,
      subject: 'Votre code de vérification Doiry Shop',
      html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background-color:#0d0d0d; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; color:#f5f5f5;">
  <div style="max-width:600px; margin:0 auto; padding:40px 20px;">
    <div style="text-align:center; margin-bottom:30px;">
      <img src="${logoUrl}" alt="Doiry Shop" style="width:50px; height:50px; border-radius:10px; margin-bottom:10px;">
      <h1 style="margin:0; font-size:18px; letter-spacing:3px; text-transform:uppercase; color:#7a9e7e; font-weight:400;">Doiry Shop</h1>
    </div>
    <div style="background:#1a1a1a; padding:40px 30px; border-radius:12px; border:1px solid #333; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
      <h2 style="margin:0 0 16px; color:#f5f5f5; font-size:22px; font-weight:400;">Vérification de sécurité</h2>
      <p style="color:#b0b0b0; font-size:15px; line-height:1.7; margin:0 0 32px;">
        Veuillez entrer le code suivant pour valider votre accès à votre espace client.
      </p>
      <div style="margin:0 auto 32px; background:#252525; border:1px solid #7a9e7e; border-radius:8px; padding:20px; max-width:200px;">
        <span style="color:#7a9e7e; font-size:32px; font-weight:bold; letter-spacing:4px;">${code}</span>
      </div>
      <p style="color:#666; font-size:13px; line-height:1.7; margin:0;">
        Ce code expire dans 15 minutes.<br/>
        Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.
      </p>
    </div>
  </div>
</body>
</html>`
    });
    console.log(`📧 Email code envoyé à ${email}`);
  } catch (error) {
    console.error('❌ Erreur envoi email code:', error);
    throw error;
  }
}

/**
 * Envoie l'e-mail de bienvenue Premium (Inscription terminée).
 */
async function sendCustomWelcomeEmail(email) {
  const logoUrl = 'https://doiryshop.com/favicon.jpg';
  try {
    await resend.emails.send({
      from: 'Doiry Shop <bienvenue@doiryshop.com>',
      to: email,
      subject: 'Bienvenue dans l\'univers Doiry Shop',
      html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background-color:#0d0d0d; font-family:'Helvetica Neue', Helvetica, Arial, sans-serif; color:#f5f5f5;">
  <div style="max-width:600px; margin:0 auto; padding:40px 20px;">
    <div style="text-align:center; margin-bottom:30px;">
      <img src="${logoUrl}" alt="Doiry Shop" style="width:50px; height:50px; border-radius:10px; margin-bottom:10px;">
      <h1 style="margin:0; font-size:18px; letter-spacing:3px; text-transform:uppercase; color:#7a9e7e; font-weight:400;">Doiry Shop</h1>
    </div>
    <div style="background:#1a1a1a; padding:40px 30px; border-radius:12px; border:1px solid #333; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
      <h2 style="margin:0 0 16px; color:#f5f5f5; font-size:22px; font-weight:400;">Votre inscription est confirmée</h2>
      <p style="color:#b0b0b0; font-size:15px; line-height:1.7; margin:0 0 20px;">
        Bienvenue chez Doiry Shop. Plongez dans notre univers de rituels botaniques et découvrez nos plantes séchées et infusions.
      </p>
      <p style="color:#b0b0b0; font-size:15px; line-height:1.7; margin:0 0 32px;">
        Pour vous remercier, voici un code de bienvenue de 10% valable sur votre première commande :<br/>
        <strong style="color:#7a9e7e; font-size:24px; letter-spacing:2px; display:block; margin-top:10px;">BIENVENUE10</strong>
      </p>
      <a href="https://doiryshop.com/#boutique" style="display:inline-block; background:#7a9e7e; color:#0d0d0d; text-decoration:none; padding:15px 35px; border-radius:8px; font-size:16px; font-weight:bold;">
        Découvrir la collection
      </a>
    </div>
  </div>
</body>
</html>`
    });
    console.log(`📧 Email bienvenue envoyé à ${email}`);
  } catch (error) {
    console.error('❌ Erreur envoi email bienvenue:', error);
    throw error;
  }
}

module.exports = { sendWelcomeEmail, sendOrderConfirmation, sendOrderShippedEmail, sendNewsletterWelcomeEmail, sendVerificationCodeEmail, sendCustomWelcomeEmail };
