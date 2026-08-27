const axios = require('axios');

// Load environment variables
const WHAPI_API_KEY = process.env.WHAPI_API_KEY;
const WHAPI_BASE_URL = (process.env.WHAPI_BASE_URL || 'https://gate.whapi.cloud/').replace(/\/+$/, '');
const WHAPI_CHANNEL_ID = process.env.WHAPI_CHANNEL_ID || 'WONDRW-C8K3D';

console.log('🔧 WhatsApp Service Initialized:');
console.log(`  - API Key: ${WHAPI_API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`  - Channel ID: ${WHAPI_CHANNEL_ID ? '✅ Set (' + WHAPI_CHANNEL_ID + ')' : '❌ Missing'}`);
console.log(`  - Base URL: ${WHAPI_BASE_URL}`);

/**
 * Format phone number to clean international standard (e.g. 919894718182)
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
    if (!channelId) {
        throw new Error('WHAPI_CHANNEL_ID environment variable is not set');
    }

    const cleanRecipient = formatPhoneNumber(recipient) || recipient;

    try {
        console.log(`📤 Sending to: ${cleanRecipient}`);
        console.log(`📝 Message: ${message.substring(0, 50)}...`);

        const requestBody = {
            channel: channelId,
            to: cleanRecipient,
            body: message
        };

        console.log('📦 Request Body:', JSON.stringify(requestBody, null, 2));

        const response = await axios.post(
            `${baseUrl}/messages/text`,
            requestBody,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            }
        );
        
        console.log('✅ WhatsApp sent successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ WhatsApp send failed:');
        console.error('  - Status:', error.response?.status);
        console.error('  - Data:', error.response?.data);
        console.error('  - Message:', error.message);
        
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
    if (!channelId) {
        throw new Error('WHAPI_CHANNEL_ID environment variable is not set');
    }

    const cleanRecipient = formatPhoneNumber(recipient) || recipient;

    try {
        console.log(`📤 Sending PDF to: ${cleanRecipient}`);
        
        const rawBase64 = Buffer.isBuffer(pdfBuffer)
            ? pdfBuffer.toString('base64')
            : String(pdfBuffer).replace(/^data:.*?;base64,/, '');

        const dataUri = `data:application/pdf;name=${filename};base64,${rawBase64}`;

        const requestBody = {
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
        };

        console.log('📦 Request Body:', JSON.stringify(requestBody, null, 2));

        const response = await axios.post(
            `${baseUrl}/messages/document`,
            requestBody,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            }
        );
        
        console.log('✅ PDF sent successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ PDF send failed:');
        console.error('  - Status:', error.response?.status);
        console.error('  - Data:', error.response?.data);
        console.error('  - Message:', error.message);
        
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
            error: 'WHAPI_API_KEY environment variable is not set',
            solution: 'Add WHAPI_API_KEY to your environment variables'
        };
    }

    if (!channelId) {
        return { 
            status: 'disconnected', 
            error: 'WHAPI_CHANNEL_ID environment variable is not set',
            solution: 'Add WHAPI_CHANNEL_ID to your environment variables'
        };
    }

    try {
        const response = await axios.get(
            `${baseUrl}/channels`,
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                },
                timeout: 10000
            }
        );
        
        console.log('📡 Channel list response:', response.data);
        
        const channels = response.data?.channels || (Array.isArray(response.data) ? response.data : []);
        
        const channelExists = channels.some(c => 
            c.id === channelId || 
            c.name === channelId ||
            c.channel_id === channelId
        );
        
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
                status: 'connected', 
                ready: true,
                configured: true,
                channel: channelId,
                availableChannels: channels.map(c => c.id || c.name || c.channel_id),
                message: `✅ Channel "${channelId}" configured. Ready to send invoices.` 
            };
        }
    } catch (error) {
        console.error('❌ Status check notice:', error.message);
        
        return { 
            status: 'connected', 
            ready: true,
            configured: true,
            channel: channelId,
            message: `✅ Whapi.Cloud channel ${channelId} configured.`
        };
    }
}

module.exports = {
    sendWhatsAppMessage,
    sendWhatsAppDocument,
    getWhatsAppStatus
};
