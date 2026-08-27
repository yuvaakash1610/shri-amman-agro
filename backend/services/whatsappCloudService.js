const axios = require('axios');

const getBaseUrl = () => {
    const url = process.env.WHAPI_BASE_URL || 'https://gate.whapi.cloud/';
    return url.endsWith('/') ? url : url + '/';
};

/**
 * Format phone number to international format (e.g. 919894718182)
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
    const apiKey = process.env.WHAPI_API_KEY;
    if (!apiKey) {
        throw new Error('WHAPI_API_KEY environment variable is not set');
    }
    const cleanRecipient = formatPhoneNumber(recipient);
    const baseUrl = getBaseUrl();

    try {
        const response = await axios.post(
            `${baseUrl}messages/text`,
            {
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
        console.log('✅ WhatsApp message sent:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Failed to send:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
    }
}

async function sendWhatsAppDocument(recipient, pdfBuffer, filename = 'invoice.pdf', caption = '') {
    const apiKey = process.env.WHAPI_API_KEY;
    if (!apiKey) {
        throw new Error('WHAPI_API_KEY environment variable is not set');
    }
    const cleanRecipient = formatPhoneNumber(recipient);
    const baseUrl = getBaseUrl();

    try {
        const rawBase64 = Buffer.isBuffer(pdfBuffer)
            ? pdfBuffer.toString('base64')
            : String(pdfBuffer).replace(/^data:.*?;base64,/, '');

        const dataUri = `data:application/pdf;name=${filename};base64,${rawBase64}`;

        const response = await axios.post(
            `${baseUrl}messages/document`,
            {
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
        console.log('✅ WhatsApp document sent:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ Failed to send document:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.response?.data?.error || error.message);
    }
}

async function getWhatsAppStatus() {
    const apiKey = process.env.WHAPI_API_KEY;
    if (!apiKey) {
        return { status: 'disconnected', ready: false, configured: false, error: 'WHAPI_API_KEY not configured' };
    }
    const baseUrl = getBaseUrl();
    try {
        const response = await axios.get(
            `${baseUrl}status`,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                },
                timeout: 5000
            }
        );
        return { status: 'connected', ready: true, configured: true, data: response.data };
    } catch (error) {
        // If channel is configured in env but status endpoint returns error or channel pairing required
        return { 
            status: error.response?.status === 200 ? 'connected' : 'configured',
            ready: true,
            configured: true,
            message: 'WHAPI_API_KEY configured',
            error: error.response?.data?.error || error.message
        };
    }
}

module.exports = {
    sendWhatsAppMessage,
    sendWhatsAppDocument,
    getWhatsAppStatus
};
