const whatsappService = require('../backend/services/whatsappService');

async function testLogout() {
  try {
    console.log('Testing WhatsApp logout service function...');
    const result = await whatsappService.logoutWhatsApp();
    console.log('Logout result:', result);
    process.exit(0);
  } catch (err) {
    console.error('Error during WhatsApp logout test:', err);
    process.exit(1);
  }
}

testLogout();
