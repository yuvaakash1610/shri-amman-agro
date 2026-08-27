const axios = require('axios');

const WHAPI_API_KEY = process.env.WHAPI_API_KEY;
const WHAPI_BASE_URL = (process.env.WHAPI_BASE_URL || 'https://gate.whapi.cloud/').replace(/\/+$/, '');
const WHAPI_CHANNEL_ID = process.env.WHAPI_CHANNEL_ID || 'WONDRW-C8K3D';

/**
 * Format phone numbers to international standard (e.g. 919894718182)
 */
const formatPhoneNumber = (phone) => {
    if (!phone) return null;
    let clean = String(phone).replace(/\D/g, '');
    if (clean.startsWith('0') && clean.length === 11) {
        clean = '91' + clean.slice(1);
    } else if (clean.length === 10) {
        clean = '91' + clean;
    }
    return clean;
};

async function sendWhatsAppMessage(recipient, message) {
    const apiKey = process.env.WHAPI_API_KEY || WHAPI_API_KEY;
    const channelId = process.env.WHAPI_CHANNEL_ID || WHAPI_CHANNEL_ID;
    const baseUrl = (process.env.WHAPI_BASE_URL || WHAPI_BASE_URL).replace(/\/+$/, '');

    if (!apiKey) {
        throw new Error('WHAPI_API_KEY environment variable is not set');
    }

    const cleanRecipient = formatPhoneNumber(recipient) || recipient;

    try {
        console.log(`📤 Sending message to: ${cleanRecipient} from channel: ${channelId}`);

        const response = await axios.post(
            `${baseUrl}/messages/text`,
            {
                channel: channelId,
                to: cleanRecipient,
                body: message
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ WhatsApp sent:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Failed to send:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
    }
}

async function sendWhatsAppDocument(recipient, pdfBuffer, filename = 'invoice.pdf', caption = '') {
    const apiKey = process.env.WHAPI_API_KEY || WHAPI_API_KEY;
    const channelId = process.env.WHAPI_CHANNEL_ID || WHAPI_CHANNEL_ID;
    const baseUrl = (process.env.WHAPI_BASE_URL || WHAPI_BASE_URL).replace(/\/+$/, '');

    if (!apiKey) {
        throw new Error('WHAPI_API_KEY environment variable is not set');
    }

    const cleanRecipient = formatPhoneNumber(recipient) || recipient;

    try {
        const rawBase64 = Buffer.isBuffer(pdfBuffer)
            ? pdfBuffer.toString('base64')
            : String(pdfBuffer).replace(/^data:.*?;base64,/, '');

        const dataUri = `data:application/pdf;name=${filename};base64,${rawBase64}`;

        console.log(`📤 Sending PDF to: ${cleanRecipient} from channel: ${channelId}`);

        const response = await axios.post(
            `${baseUrl}/messages/document`,
            {
                channel: channelId,
                to: cleanRecipient,
                media: dataUri,
                filename: filename,
                caption: caption || '📄 Your invoice from Shri Amman Agro Traders',
                document: {
                    mime_type: 'application/pdf',
                    data: rawBase64,
                    filename: filename,
                    caption: caption || '📄 Your invoice from Shri Amman Agro Traders'
                }
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('✅ PDF sent:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Failed to send PDF:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
    }
}

async function getWhatsAppStatus() {
    const apiKey = process.env.WHAPI_API_KEY || WHAPI_API_KEY;
    const channelId = process.env.WHAPI_CHANNEL_ID || WHAPI_CHANNEL_ID;
    const baseUrl = (process.env.WHAPI_BASE_URL || WHAPI_BASE_URL).replace(/\/+$/, '');

    if (!apiKey) {
        return { 
            status: 'disconnected', 
            ready: false,
            configured: false,
            error: 'WHAPI_API_KEY not configured' 
        };
    }

    try {
        const response = await axios.get(
            `${baseUrl}/channels`,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                },
                timeout: 6000
            }
        );
        
        const channels = response.data?.channels || (Array.isArray(response.data) ? response.data : []);
        const channelExists = channels.some(c => c.id === channelId || c.name === channelId);
        
        if (channelExists) {
            return { 
                status: 'connected', 
                ready: true,
                configured: true,
                channel: channelId,
                message: '✅ WhatsApp is ready to send invoices!' 
            };
        } else {
            return { 
                status: 'configured', 
                ready: true,
                configured: true,
                channel: channelId,
                availableChannels: channels.map(c => c.id || c.name),
                message: 'Channel configured. Ready to dispatch messages.' 
            };
        }
    } catch (error) {
        console.error('Status check response/timeout:', error.message);
        return { 
            status: 'configured', 
            ready: true,
            configured: true,
            channel: channelId,
            error: error.message,
            message: 'WHAPI_CHANNEL_ID and WHAPI_API_KEY are configured.'
        };
    }
}

module.exports = {
    sendWhatsAppMessage,
    sendWhatsAppDocument,
    getWhatsAppStatus
};
