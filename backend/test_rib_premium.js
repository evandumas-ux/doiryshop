const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const path = require('path');

/**
 * Fonction générant un document "Digital RIB" Dark Premium Luxe optimisé pour OCR.
 * Correction OCR : Zone B sur fond blanc / texte noir pour contrer la binarisation.
 * 
 * @param {string} order_id - Identifiant de la commande (ex: "8831")
 * @param {string} amount - Montant exact (ex: "34.20")
 * @param {string} reference - Référence de virement (ex: "DRY-8831")
 */
async function generate_digital_rib(order_id, amount, reference) {
  // Dimensions 1200 x 1600 (Ratio 3:4)
  const width = 1200;
  const height = 1600;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // --- PALETTES & STYLES ---
  const bgBlack = '#111111';          // Fond noir profond mat
  const cardBg = '#1A1610';           // Fond de la carte
  const goldMatte = '#A68A56';        // Or mat
  const burgundyDark = '#5C141F';     // Bordeaux Doiry Shop
  const pureWhite = '#FFFFFF';        // Fond zone OCR
  const pureBlack = '#000000';        // Texte zone OCR

  // 1. Fond noir profond sur toute l'image
  ctx.fillStyle = bgBlack;
  ctx.fillRect(0, 0, width, height);

  // 2. Rectangle central ("carte" avec texture)
  const cardMargin = 40;
  const cardWidth = width - (cardMargin * 2);
  const cardHeight = height - (cardMargin * 2);
  
  ctx.fillStyle = cardBg;
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 20;
  ctx.fillRect(cardMargin, cardMargin, cardWidth, cardHeight);
  ctx.shadowBlur = 0; // Reset shadow

  // 3. Motif en filigrane (très léger)
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

  // ==========================================
  // ZONE A : EN-TÊTE (Statique)
  // ==========================================
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

  // "DOIRY SHOP"
  ctx.fillStyle = burgundyDark;
  ctx.font = 'bold 46px "Times New Roman", Garamond, serif';
  ctx.fillText('DOIRY SHOP', width / 2, currentY);
  currentY += 70;

  // Titre principal
  ctx.fillStyle = goldMatte;
  ctx.font = '30px "Times New Roman", Garamond, serif';
  ctx.fillText('PROTOCOLE DE TRANSFERT SÉCURISÉ', width / 2, currentY);
  currentY += 60;

  // Ligne de séparation fine encadrant l'en-tête
  ctx.beginPath();
  ctx.moveTo(innerMarginX, currentY);
  ctx.lineTo(width - innerMarginX, currentY);
  ctx.strokeStyle = goldMatte;
  ctx.lineWidth = 1;
  ctx.stroke();
  currentY += 60; // 60px de séparation avant la Zone B

  // ==========================================
  // ZONE B : BLOC COMPTE OCR (Fond Blanc)
  // ==========================================
  ctx.textAlign = 'left';

  // Dessin du rectangle blanc pour l'OCR
  const zoneB_Y = currentY;
  const zoneB_Height = 520;
  const zoneB_MarginX = innerMarginX - 40; // Le rectangle blanc s'étend un peu plus large que le texte
  const zoneB_Width = width - (zoneB_MarginX * 2);

  ctx.fillStyle = pureWhite;
  // Ajout de petits arrondis optionnels pour l'esthétique premium
  ctx.roundRect ? ctx.roundRect(zoneB_MarginX, zoneB_Y, zoneB_Width, zoneB_Height, 15) : ctx.fillRect(zoneB_MarginX, zoneB_Y, zoneB_Width, zoneB_Height);
  ctx.fill();

  currentY += 40; // Padding interne top de la zone blanche

  const drawOcrRow = (label, value, isIban = false) => {
    // Label : Noir pur, lisible
    ctx.fillStyle = pureBlack;
    ctx.font = 'bold 22px Arial, Helvetica, "Inter", "Roboto", sans-serif'; // Modification en sans-serif clair pour OCR complet
    ctx.fillText(label, innerMarginX, currentY);
    currentY += 35;

    // Valeur OCR CRITIQUE : Noir pur, très grande taille
    ctx.fillStyle = pureBlack;
    const fontSize = isIban ? 52 : 36;
    ctx.font = `bold ${fontSize}px Arial, Helvetica, "Inter", "Roboto", sans-serif`;
    ctx.fillText(value, innerMarginX, currentY);
    
    currentY += isIban ? 90 : 70;
  };

  drawOcrRow('Titulaire du compte :', 'Evan DUMAS');
  
  // IBAN
  const staticIban = 'FR76 2823 3000 0161 1348 4847 481';
  drawOcrRow('IBAN :', staticIban, true);
  
  drawOcrRow('Code BIC / SWIFT :', 'REVOFRP2');
  drawOcrRow('Banque :', 'Revolut Bank UAB');

  // Repositionnement en dessous de la zone blanche
  currentY = zoneB_Y + zoneB_Height + 60;

  // ==========================================
  // ZONE C : BLOC COMMANDE (Dynamique sur fond sombre)
  // ==========================================
  
  ctx.fillStyle = goldMatte;
  ctx.font = 'italic 26px "Times New Roman", Garamond, serif';
  ctx.fillText('Numéro de commande :', innerMarginX, currentY);
  currentY += 40;
  ctx.fillStyle = goldMatte;
  ctx.font = 'bold 36px "Times New Roman", Garamond, serif';
  ctx.fillText(`CMD-${order_id}`, innerMarginX, currentY);
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

  // ==========================================
  // ZONE D : FOOTER (Statique)
  // ==========================================
  ctx.textAlign = 'center';
  ctx.fillStyle = goldMatte;
  
  const footerY = height - cardMargin - 50;

  ctx.font = '40px serif';
  ctx.fillText('☥', width / 2, footerY - 45); 

  ctx.font = '18px "Times New Roman", Garamond, serif'; 
  ctx.fillText('Document crypté dynamiquement – Doiry Shop Cryptage DSP2', width / 2, footerY);

  // ==========================================
  // SAUVEGARDE
  // ==========================================
  const fileName = `doiryshop_rib_${order_id}.png`;
  const buffer = canvas.toBuffer('image/png', { resolution: 300 });
  fs.writeFileSync(path.join(__dirname, fileName), buffer);

  console.log(`✅ RIB Digital Binarisation OCR Proof généré : ${fileName}`);
}

// ==========================================
// EXEMPLE D'EXÉCUTION
// ==========================================

console.log('Démarrage de la génération OCR White-Box...');
generate_digital_rib('8831', '34.20', 'DRY-8831');
