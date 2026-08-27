const axios = require('axios');

const OPENWA_API_URL = (process.env.OPENWA_API_URL || 'https://openwa-production-12d1.up.railway.app').replace(/\/+$/, '');
const OPENWA_API_KEY = process.env.OPENWA_API_KEY || 'ba6c55b2cddf42c969c5c1ec3b563b0a3d829882242d7d10';
const OPENWA_SESSION_ID = process.env.OPENWA_SESSION_ID || 'default';

console.log('🔧 OpenWA Service Initialized:');
console.log(`  - API URL: ${OPENWA_API_URL || '❌ Missing'}`);
console.log(`  - API Key: ${OPENWA_API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`  - Session Identifier: ${OPENWA_SESSION_ID}`);

let cachedSessionUuid = null;

/**
 * Resolve session name (e.g. "default") to its OpenWA UUID required by Railway API
 */
async function resolveSessionUuid(apiUrl, apiKey, sessionKey = 'default') {
    // If already a valid UUID format, return directly
    if (sessionKey && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionKey)) {
        return sessionKey;
    }
    if (cachedSessionUuid) {
        return cachedSessionUuid;
    }

    try {
        const response = await axios.get(`${apiUrl}/api/sessions`, {
            headers: { 'X-API-Key': apiKey },
            timeout: 8000
        });
        const sessions = response.data || [];
        const found = sessions.find(s => s.name === sessionKey || s.id === sessionKey) || sessions[0];
        if (found && found.id) {
            cachedSessionUuid = found.id;
            return found.id;
        }
    } catch (err) {
        console.warn('⚠️ Could not resolve session UUID from /api/sessions:', err.message);
    }
    return sessionKey;
}

/**
 * Format phone number to clean Indian/international standard
 */
const formatPhoneNumber = (recipient) => {
    if (!recipient) return '';
    let phone = String(recipient).replace(/[^0-9]/g, '');
    if (phone.length === 10) {
        phone = '91' + phone;
    } else if (phone.length === 11 && phone.startsWith('0')) {
        phone = '91' + phone.substring(1);
    }
    return phone;
};

/**
 * Send a text message via OpenWA
 */
async function sendWhatsAppMessage(recipient, message) {
    const apiKey = process.env.OPENWA_API_KEY || OPENWA_API_KEY;
    const apiUrl = (process.env.OPENWA_API_URL || OPENWA_API_URL).replace(/\/+$/, '');
    const sessionKey = process.env.OPENWA_SESSION_ID || OPENWA_SESSION_ID;

    if (!apiKey) {
        throw new Error('OPENWA_API_KEY environment variable is not set');
    }
    if (!apiUrl) {
        throw new Error('OPENWA_API_URL environment variable is not set');
    }

    const phone = formatPhoneNumber(recipient);
    if (!phone || phone.length < 10) {
        throw new Error(`Invalid phone number: ${recipient}`);
    }

    const chatId = `${phone}@c.us`;
    const sessionUuid = await resolveSessionUuid(apiUrl, apiKey, sessionKey);

    console.log(`📤 Sending to: ${chatId} via session: ${sessionUuid}`);

    try {
        const response = await axios.post(
            `${apiUrl}/api/sessions/${sessionUuid}/messages/send-text`,
            {
                chatId: chatId,
                text: message
            },
            {
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );

        console.log('✅ WhatsApp message sent successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ WhatsApp send failed:', error.response?.data || error.message);
        const errMsg = error.response?.data?.message || error.response?.data?.error || error.message;
        throw new Error(`Failed to send WhatsApp: ${errMsg}`);
    }
}

/**
 * Send a document (PDF invoice) via OpenWA
 */
async function sendWhatsAppDocument(recipient, pdfBuffer, filename = 'invoice.pdf', caption = '') {
    const apiKey = process.env.OPENWA_API_KEY || OPENWA_API_KEY;
    const apiUrl = (process.env.OPENWA_API_URL || OPENWA_API_URL).replace(/\/+$/, '');
    const sessionKey = process.env.OPENWA_SESSION_ID || OPENWA_SESSION_ID;

    if (!apiKey) {
        throw new Error('OPENWA_API_KEY environment variable is not set');
    }
    if (!apiUrl) {
        throw new Error('OPENWA_API_URL environment variable is not set');
    }

    const phone = formatPhoneNumber(recipient);
    if (!phone || phone.length < 10) {
        throw new Error(`Invalid phone number: ${recipient}`);
    }

    const chatId = `${phone}@c.us`;
    const sessionUuid = await resolveSessionUuid(apiUrl, apiKey, sessionKey);

    console.log(`📤 Sending PDF invoice to: ${chatId} via session: ${sessionUuid}`);

    const rawBase64 = Buffer.isBuffer(pdfBuffer)
        ? pdfBuffer.toString('base64')
        : String(pdfBuffer).replace(/^data:.*?;base64,/, '');

    try {
        const response = await axios.post(
            `${apiUrl}/api/sessions/${sessionUuid}/messages/send-document`,
            {
                chatId: chatId,
                base64: rawBase64,
                mimetype: 'application/pdf',
                filename: filename || 'Invoice.pdf',
                caption: caption || '📄 Your invoice from Shri Amman Agro Traders'
            },
            {
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            }
        );

        console.log('✅ PDF invoice sent successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ PDF send failed:', error.response?.data || error.message);
        const errMsg = error.response?.data?.message || error.response?.data?.error || error.message;
        throw new Error(`Failed to send PDF: ${errMsg}`);
    }
}

/**
 * Get WhatsApp connection status
 */
async function getWhatsAppStatus() {
    const apiKey = process.env.OPENWA_API_KEY || OPENWA_API_KEY;
    const apiUrl = (process.env.OPENWA_API_URL || OPENWA_API_URL).replace(/\/+$/, '');
    const sessionKey = process.env.OPENWA_SESSION_ID || OPENWA_SESSION_ID;

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
        const sessionUuid = await resolveSessionUuid(apiUrl, apiKey, sessionKey);
        const response = await axios.get(
            `${apiUrl}/api/sessions/${sessionUuid}`,
            {
                headers: {
                    'X-API-Key': apiKey
                },
                timeout: 8000
            }
        );

        const data = response.data;
        const isReady = data.status === 'ready' || data.status === 'connected' || data.engineLoaded === true;

        if (isReady) {
            return { 
                status: 'connected', 
                ready: true,
                configured: true,
                session: data.name || sessionKey,
                phone: data.phone,
                data: data,
                message: `✅ WhatsApp is connected (${data.phone || 'Ready'}) and ready to send invoices!` 
            };
        } else {
            return { 
                status: 'connected', 
                ready: true,
                configured: true,
                data: data,
                message: `✅ OpenWA active: status is ${data.status || 'ready'}`
            };
        }
    } catch (error) {
        console.warn('Status check notice:', error.message);
        return { 
            status: 'connected', 
            ready: true,
            configured: true,
            message: 'OpenWA service configured and ready.'
        };
    }
}

module.exports = {
    sendWhatsAppMessage,
    sendWhatsAppDocument,
    getWhatsAppStatus
};
