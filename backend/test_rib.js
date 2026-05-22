const { createCanvas } = require('canvas');
const fs = require('fs');

/**
 * Generates an OCR-friendly "Digital RIB" image for automated bank transfers.
 *
 * @param {string} order_id - The order identifier (e.g., "8831")
 * @param {string|number} amount - The exact amount to transfer (e.g., "34.20")
 */
function generate_order_rib(order_id, amount) {
  // Static Bank Information (Hardcoded)
  const beneficiaryName = "Evan DUMAS";
  // CRITICAL: Spaces are preserved exactly as requested for optimal OCR scanning
  const iban = "FR76 2823 3000 0161 1348 4847 481";
  const bic = "REVOFRP2";
  
  // Dynamic Reference based on order_id
  const reference = `DRY-${order_id}`;

  // Image Dimensions
  const width = 800;
  const height = 450;
  
  // Initialize Canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 1. Pure White Background for maximum contrast
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // 2. Pure Black Text, sans-serif font
  ctx.fillStyle = '#000000';
  ctx.textBaseline = 'top';

  let currentY = 40;
  const startX = 40;

  // Main Title
  ctx.font = 'bold 32px Arial, Helvetica, sans-serif';
  ctx.fillText('BANK DETAILS FOR TRANSFER (RIB)', startX, currentY);
  currentY += 70;

  // Beneficiary
  ctx.font = 'bold 24px Arial, Helvetica, sans-serif';
  ctx.fillText(`Beneficiary: ${beneficiaryName}`, startX, currentY);
  currentY += 50;

  // IBAN (Crucial for OCR, kept large and clearly spaced)
  ctx.font = 'bold 28px Arial, Helvetica, sans-serif';
  ctx.fillText(`IBAN: ${iban}`, startX, currentY);
  currentY += 50;

  // BIC
  ctx.font = '24px Arial, Helvetica, sans-serif';
  ctx.fillText(`BIC: ${bic}`, startX, currentY);
  currentY += 60;

  // Separation Line
  ctx.beginPath();
  ctx.moveTo(startX, currentY);
  ctx.lineTo(width - startX, currentY);
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.stroke();
  currentY += 40;

  // Order related info
  ctx.font = 'bold 26px Arial, Helvetica, sans-serif';
  ctx.fillText(`Amount: ${Number(amount).toFixed(2)} EUR`, startX, currentY);
  currentY += 50;

  ctx.font = 'bold 26px Arial, Helvetica, sans-serif';
  ctx.fillText(`Reference: ${reference}`, startX, currentY);

  // Save the PNG file locally
  const fileName = `doiryshop_rib_CMD_${order_id}.png`;
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(fileName, buffer);

  console.log(`✅ Digital RIB successfully generated: ${fileName}`);
}

// ==========================================
// TEST SCRIPT (Order Simulation)
// ==========================================

console.log("--- Initializing Digital RIB Generation ---");
const test_order_id = "8831";
const test_amount = "34.20";

generate_order_rib(test_order_id, test_amount);
