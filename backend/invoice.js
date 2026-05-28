const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const BRAND_COLORS = {
  background: '#0d0d0d',
  card: '#151515',
  border: '#2a2a2a',
  primary: '#8b263e',
  text: '#f4f1ec',
  muted: '#b9b2aa',
};

const formatPrice = (value) => `${Number(value || 0).toFixed(2)} €`;
const formatDate = (dateValue) => new Date(dateValue || Date.now()).toLocaleDateString('fr-FR');

const sanitizeNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

const getLogoPath = () => {
  const candidates = [
    path.resolve(__dirname, '../public/favicon.jpg'),
    path.resolve(__dirname, '../public/logo.jpg'),
  ];
  return candidates.find((p) => fs.existsSync(p)) || null;
};

const parseProducts = (produits) => {
  if (Array.isArray(produits)) return produits;
  try {
    const parsed = JSON.parse(produits || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const parseAddress = (adresseLivraison) => {
  if (adresseLivraison && typeof adresseLivraison === 'object') return adresseLivraison;
  try {
    return JSON.parse(adresseLivraison || '{}');
  } catch {
    return {};
  }
};

async function generateInvoicePDF(orderData) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const chunks = [];

  doc.on('data', (chunk) => chunks.push(chunk));

  const produits = parseProducts(orderData?.produits);
  const adresse = parseAddress(orderData?.adresse_livraison);
  const orderId = Number(orderData?.id || orderData?.orderId || 0);
  const reference = orderData?.reference || `dry-${orderId}`;
  const invoiceNumber = `FAC-${String(orderId).padStart(6, '0')}`;

  // NEW ACCOUNTING LOGIC
  // 1. Calculate Sum TTC of items
  const subtotalTTC = produits.reduce((sum, p) => sum + sanitizeNumber(p.price) * sanitizeNumber(p.quantity || 1), 0);
  
  // 2. Derive HT and VAT from items only (20% rate)
  const subtotalHT = subtotalTTC / 1.20;
  const tvaItems = subtotalTTC - subtotalHT;
  
  // 3. Shipping is a separate fixed cost (usually zero-rated or handled separately in simple shops)
  const shippingPrice = sanitizeNumber(orderData?.shipping_price);
  
  // 4. Final Total
  const totalTTC = subtotalTTC + shippingPrice;

  doc.rect(0, 0, doc.page.width, doc.page.height).fill(BRAND_COLORS.background);

  let y = 36;
  const logoPath = getLogoPath();
  if (logoPath) {
    try {
      doc.image(logoPath, 40, y, { height: 60 });
    } catch (err) {
      console.error('[INVOICE] Impossible de charger le logo:', err.message);
    }
  }

  doc.fillColor(BRAND_COLORS.text).fontSize(25).font('Helvetica-Bold').text('FACTURE', 360, y + 6, { align: 'right', width: 190 });
  y += 76;

  doc.fillColor(BRAND_COLORS.muted).fontSize(10).font('Helvetica');
  doc.text(`N° facture : ${invoiceNumber}`, 40, y);
  doc.text(`Réf. commande : ${reference}`, 40, y + 15);
  doc.text(`Date : ${formatDate(orderData?.date_creation)}`, 40, y + 30);

  doc.text('Doiry Shop', 360, y, { align: 'right', width: 190 });
  doc.text('Doiry Shop • E-commerce', 360, y + 15, { align: 'right', width: 190 });
  doc.text('France', 360, y + 30, { align: 'right', width: 190 });
  y += 64;

  doc.roundedRect(40, y, 515, 90, 10).fill(BRAND_COLORS.card);
  doc.fillColor(BRAND_COLORS.text).font('Helvetica-Bold').fontSize(11).text('Facturé à', 55, y + 14);
  doc.fillColor(BRAND_COLORS.muted).font('Helvetica').fontSize(10);
  doc.text(`${adresse.fname || ''} ${adresse.lname || ''}`.trim() || 'Client', 55, y + 33);
  doc.text(adresse.email || '', 55, y + 47);
  doc.text(adresse.address || '', 55, y + 61);
  doc.text(`${adresse.zip || ''} ${adresse.city || ''}`.trim(), 55, y + 75);
  y += 112;

  const tableX = 40;
  const tableWidth = 515;
  const col = {
    name: 55,
    price: 305,
    qty: 405,
    total: 485,
  };
  const rowHeight = 28;

  doc.roundedRect(tableX, y, tableWidth, rowHeight, 6).fill(BRAND_COLORS.primary);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10);
  doc.text('Article', col.name, y + 9);
  doc.text('Prix unit. TTC', col.price, y + 9);
  doc.text('Qté', col.qty, y + 9);
  doc.text('Total TTC', col.total, y + 9);
  y += rowHeight;

  produits.forEach((item) => {
    const lineTotal = sanitizeNumber(item.price) * sanitizeNumber(item.quantity || 1);
    doc.rect(tableX, y, tableWidth, rowHeight).fill(BRAND_COLORS.card);
    doc.strokeColor(BRAND_COLORS.border).lineWidth(1).moveTo(tableX, y + rowHeight).lineTo(tableX + tableWidth, y + rowHeight).stroke();
    doc.fillColor(BRAND_COLORS.text).font('Helvetica').fontSize(10);
    doc.text(item.name || 'Produit', col.name, y + 8, { width: 240, ellipsis: true });
    doc.text(formatPrice(item.price), col.price, y + 8);
    doc.text(String(item.quantity || 1), col.qty, y + 8);
    doc.text(formatPrice(lineTotal), col.total, y + 8);
    y += rowHeight;
  });

  y += 18;
  const totalsX = 330;
  doc.fillColor(BRAND_COLORS.muted).font('Helvetica').fontSize(11);
  doc.text('Sous-total HT', totalsX, y);
  doc.fillColor(BRAND_COLORS.text).text(formatPrice(subtotalHT), 475, y, { width: 80, align: 'right' });
  y += 18;
  doc.fillColor(BRAND_COLORS.muted).text('TVA (20%)', totalsX, y);
  doc.fillColor(BRAND_COLORS.text).text(formatPrice(tvaItems), 475, y, { width: 80, align: 'right' });
  y += 18;
  doc.fillColor(BRAND_COLORS.muted).text('Livraison', totalsX, y);
  doc.fillColor(BRAND_COLORS.text).text(formatPrice(shippingPrice), 475, y, { width: 80, align: 'right' });
  y += 24;
  doc.roundedRect(330, y - 8, 225, 30, 6).fill(BRAND_COLORS.primary);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(12);
  doc.text('Total Général TTC', 343, y + 1);
  doc.text(formatPrice(totalTTC), 472, y + 1, { width: 80, align: 'right' });

  doc.fillColor(BRAND_COLORS.muted).font('Helvetica').fontSize(9);
  doc.text('Merci pour votre confiance. Cette facture est générée automatiquement.', 40, doc.page.height - 45);

  doc.end();

  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}

module.exports = { generateInvoicePDF };
