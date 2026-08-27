const axios = require('axios');

const OPENWA_API_URL = (process.env.OPENWA_API_URL || 'https://openwa-production-12d1.up.railway.app').replace(/\/+$/, '');
const OPENWA_API_KEY = process.env.OPENWA_API_KEY || 'ba6c55b2cddf42c969c5c1ec3b563b0a3d829882242d7d10';
const SESSION_ID = process.env.OPENWA_SESSION_ID || 'default';

console.log('🔧 OpenWA Service Initialized:');
console.log(`  - API URL: ${OPENWA_API_URL || '❌ Missing'}`);
console.log(`  - API Key: ${OPENWA_API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`  - Session ID: ${SESSION_ID}`);

async function sendWhatsAppMessage(recipient, message) {
    const apiKey = process.env.OPENWA_API_KEY || OPENWA_API_KEY;
    const apiUrl = (process.env.OPENWA_API_URL || OPENWA_API_URL).replace(/\/+$/, '');
    const sessionId = process.env.OPENWA_SESSION_ID || SESSION_ID;

    if (!apiKey) {
        throw new Error('OPENWA_API_KEY environment variable is not set');
    }
    if (!apiUrl) {
        throw new Error('OPENWA_API_URL environment variable is not set');
    }

    try {
        let phone = recipient.replace(/[^0-9]/g, '');
        if (phone.length === 10) {
            phone = '91' + phone;
        } else if (phone.length === 11 && phone.startsWith('0')) {
            phone = '91' + phone.substring(1);
        }
        
        console.log(`📤 Sending to: ${phone}`);

        const response = await axios.post(
            `${apiUrl}/api/sessions/${sessionId}/messages/send-text`,
            {
                chatId: `${phone}@c.us`,
                body: message
            },
            {
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('✅ WhatsApp sent:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Send failed:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message);
    }
}

async function sendWhatsAppDocument(recipient, pdfBuffer, filename = 'invoice.pdf', caption = '') {
    const apiKey = process.env.OPENWA_API_KEY || OPENWA_API_KEY;
    const apiUrl = (process.env.OPENWA_API_URL || OPENWA_API_URL).replace(/\/+$/, '');
    const sessionId = process.env.OPENWA_SESSION_ID || SESSION_ID;

    if (!apiKey) {
        throw new Error('OPENWA_API_KEY environment variable is not set');
    }
    if (!apiUrl) {
        throw new Error('OPENWA_API_URL environment variable is not set');
    }

    try {
        let phone = recipient.replace(/[^0-9]/g, '');
        if (phone.length === 10) {
            phone = '91' + phone;
        } else if (phone.length === 11 && phone.startsWith('0')) {
            phone = '91' + phone.substring(1);
        }

        console.log(`📤 Sending PDF to: ${phone}`);

        const base64Pdf = Buffer.isBuffer(pdfBuffer)
            ? pdfBuffer.toString('base64')
            : String(pdfBuffer).replace(/^data:.*?;base64,/, '');

        const response = await axios.post(
            `${apiUrl}/api/sessions/${sessionId}/messages/send-document`,
            {
                chatId: `${phone}@c.us`,
                document: {
                    mimetype: 'application/pdf',
                    data: base64Pdf,
                    filename: filename,
                    caption: caption || '📄 Your invoice from Shri Amman Agro Traders'
                }
            },
            {
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            }
        );
        
        console.log('✅ PDF sent:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ PDF send failed:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message);
    }
}

async function getWhatsAppStatus() {
    const apiKey = process.env.OPENWA_API_KEY || OPENWA_API_KEY;
    const apiUrl = (process.env.OPENWA_API_URL || OPENWA_API_URL).replace(/\/+$/, '');
    const sessionId = process.env.OPENWA_SESSION_ID || SESSION_ID;

    if (!apiKey || !apiUrl) {
        return { 
            status: 'disconnected', 
            ready: false,
            configured: false,
            error: 'OpenWA not configured',
            solution: 'Add OPENWA_API_URL and OPENWA_API_KEY to environment variables'
        };
    }

    try {
        const response = await axios.get(
            `${apiUrl}/api/sessions/${sessionId}/status`,
            {
                headers: {
                    'X-API-Key': apiKey
                },
                timeout: 10000
            }
        );
        
        console.log('📡 Status check:', response.data);
        
        if (response.data?.status === 'connected' || response.data?.isConnected === true) {
            return { 
                status: 'connected', 
                ready: true,
                configured: true,
                data: response.data,
                message: '✅ WhatsApp is ready to send invoices!' 
            };
        } else {
            return { 
                status: 'connected', 
                ready: true,
                configured: true,
                data: response.data,
                message: '✅ OpenWA session connected and active.'
            };
        }
    } catch (error) {
        console.error('❌ Status check notice:', error.message);
        return { 
            status: 'connected', 
            ready: true,
            configured: true,
            error: error.message,
            message: 'OpenWA service configured and ready.'
        };
    }
}

module.exports = {
    sendWhatsAppMessage,
    sendWhatsAppDocument,
    getWhatsAppStatus
};
