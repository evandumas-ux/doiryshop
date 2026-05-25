const { Resend } = require('resend');

// Utilise la clé API depuis les variables d'environnement
const resend = new Resend(process.env.RESEND_API_KEY);

// Expéditeur par défaut (onboarding@resend.dev en attendant un domaine custom)
const FROM_EMAIL = 'Doiry Shop <onboarding@resend.dev>';
const FROM_CONTACT = 'Doiry Shop <contact@doiryshop.com>';
const FROM_COMMANDES = 'Doiry Shop <commandes@doiryshop.com>';

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
        <a href="https://doiryshop.fr/#boutique" style="display:inline-block;background:#831b2f;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:1px;transition:background 0.3s;">
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
    console.log(`✅ Email de bienvenue newsletter envoyé à ${email}`);
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
      subject: `Bienvenue chez Doiry Shop, ${prenom || 'et bienvenue'} ✨`,
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
        <a href="https://doiryshop.fr/#boutique" style="display:inline-block;background:#A8192B;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;">
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
    console.log(`✅ Email de bienvenue envoyé à ${email}`, data);
    return data;
  } catch (error) {
    console.error('❌ Erreur envoi email bienvenue:', error);
    throw error;
  }
}

/**
 * Envoie un email de confirmation de commande.
 */
async function sendOrderConfirmation(email, order) {
  const produits = Array.isArray(order.produits) ? order.produits : JSON.parse(order.produits || '[]');
  const adresse = typeof order.adresse_livraison === 'object' ? order.adresse_livraison : JSON.parse(order.adresse_livraison || '{}');

  const produitsHtml = produits.map(p => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #EEEEE8;color:#2D3B2A;font-size:14px;">
        ${p.name || 'Produit'}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #EEEEE8;color:#5A6855;font-size:14px;text-align:center;">
        ×${p.quantity || 1}
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #EEEEE8;color:#2D3B2A;font-size:14px;text-align:right;font-weight:600;">
        ${((p.price || 0) * (p.quantity || 1)).toFixed(2)} €
      </td>
    </tr>
  `).join('');

  const shippingMethodLabel = {
    'LETTRE_VERTE_SUIVIE': 'Lettre Verte Suivie',
    'COLISSIMO': 'Colissimo Domicile'
  }[order.shipping_method] || 'Standard';

  const adresseHtml = adresse && Object.keys(adresse).length > 0
    ? `
      <div style="margin-top:28px;padding:20px;background:#F5F5F0;border-radius:12px;">
        <h3 style="margin:0 0 12px;color:#2D3B2A;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
          📍 Livraison via ${shippingMethodLabel}
        </h3>
        <p style="margin:0;color:#5A6855;font-size:14px;line-height:1.7;">
          ${adresse.fname || ''} ${adresse.lname || ''}<br/>
          ${adresse.address || ''}<br/>
          ${adresse.zip || ''} ${adresse.city || ''}<br/>
          ${adresse.country || 'France'}
        </p>
      </div>
    ` : '';

  try {
    const data = await resend.emails.send({
      from: FROM_COMMANDES,
      to: email,
      subject: `🌿 Confirmation de votre commande - Doiry Shop`,
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
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;letter-spacing:1px;">CONFIRMATION DE COMMANDE</p>
    </div>

    <!-- Corps -->
    <div style="padding:40px 32px;">
      <div style="text-align:center;margin-bottom:32px;">
        <div style="display:inline-block;width:64px;height:64px;line-height:64px;background:#E8F0E4;border-radius:50%;font-size:28px;">
          ✓
        </div>
        <h2 style="margin:16px 0 8px;color:#2D3B2A;font-family:Georgia,serif;font-size:22px;font-weight:400;">
          Votre commande est confirmee
        </h2>
        <p style="margin:0;color:#8A9080;font-size:14px;">
          Commande <strong style="color:#6B7F5E;">#${order.id}</strong> · ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <p style="color:#5A6855;font-size:15px;line-height:1.7;margin:0 0 24px;">
        Merci pour votre confiance. Nous preparons votre colis avec discretion et attention, puis nous vous informerons des qu'il est en route.
      </p>

      <!-- Tableau produits -->
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;padding:0 0 12px;color:#8A9080;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #EEEEE8;">Produit</th>
            <th style="text-align:center;padding:0 0 12px;color:#8A9080;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #EEEEE8;">Qté</th>
            <th style="text-align:right;padding:0 0 12px;color:#8A9080;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #EEEEE8;">Prix</th>
          </tr>
        </thead>
        <tbody>
          ${produitsHtml}
        </tbody>
      </table>

      <!-- Total -->
      <div style="margin-top:20px;padding:16px 0;border-top:2px solid #6B7F5E;display:flex;justify-content:space-between;align-items:center;">
        <span style="color:#2D3B2A;font-size:16px;font-weight:600;">Total TTC</span>
        <span style="color:#6B7F5E;font-size:24px;font-weight:700;font-family:Georgia,serif;">${Number(order.total).toFixed(2)} €</span>
      </div>

      ${adresseHtml}

      <!-- Revolut Payment Reminder -->
      <div style="margin-top:32px;padding:24px;background:#f9f9f9;border-left:4px solid #831b2f;border-radius:4px;">
        <h3 style="margin:0 0 12px;color:#333;font-size:16px;font-weight:600;">Règlement de votre commande</h3>
        <p style="margin:0 0 16px;color:#555;font-size:14px;line-height:1.6;">
          N'oubliez pas de finaliser votre paiement instantané via Revolut pour que nous puissions préparer votre colis.
        </p>
        <a href="https://revolut.me/your_revolut_link_here" target="_blank" style="display:inline-block;background:#000;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">
          Payer via Revolut
        </a>
      </div>

      <p style="color:#5A6855;font-size:14px;line-height:1.7;margin:24px 0 0;">
        En attendant, prenez soin de vous. Chaque commande Doiry Shop est preparee pour vous offrir un rituel naturel, artisanal et soigne.
      </p>
    </div>

    <!-- Footer -->
    <div style="padding:24px 32px;background:#F5F5F0;border-top:1px solid #E8E8E0;text-align:center;">
      <p style="margin:0 0 8px;color:#5A6855;font-size:13px;">
        Une question ? Répondez directement à cet email.
      </p>
      <p style="margin:0;color:#8A9080;font-size:12px;">
        © 2026 Doiry Shop · Tous droits reserves
      </p>
    </div>
    </div>
    </body>
    </html>`
    });
    console.log(`✅ Email de confirmation envoyé à ${email} pour la commande #${order.id}`, data);
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
      subject: `Votre commande #${order.id} est en route ! 🚚`,
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

module.exports = { sendWelcomeEmail, sendOrderConfirmation, sendOrderShippedEmail, sendNewsletterWelcomeEmail };
