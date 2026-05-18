// Script de test pour envoyer un email de bienvenue
require('dotenv').config();
const { sendWelcomeEmail } = require('./emails');

async function main() {
  console.log('🔑 Clé API chargée:', process.env.RESEND_API_KEY ? '✅ Oui' : '❌ Non');
  console.log('📧 Envoi du email de bienvenue test...');
  
  try {
    const result = await sendWelcomeEmail('evan.dumas2310@gmail.com', 'Evan');
    console.log('🎉 Résultat:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('💥 Échec:', error);
  }
}

main();
