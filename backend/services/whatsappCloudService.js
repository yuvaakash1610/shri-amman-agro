/**
 * WhatsApp Cloud API Service (Official Meta WhatsApp Business Platform)
 * 
 * Used for production cloud deployments (e.g. Vercel) where headless browsers
 * (Puppeteer / Chromium) cannot run.
 * 
 * Required Environment Variables (configure in Vercel):
 * - WHATSAPP_CLOUD_TOKEN (or WHATSAPP_TOKEN) : Permanent / System User Access Token from Meta Developer Portal
 * - WHATSAPP_PHONE_NUMBER_ID (or WHATSAPP_PHONE_ID) : WhatsApp Business Phone Number ID
 * - WHATSAPP_API_VERSION (optional, defaults to 'v21.0')
 */

const getCredentials = () => {
    const token = process.env.WHATSAPP_CLOUD_TOKEN || process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_WA_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_ID;
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0';

    return {
        token: token ? token.trim() : null,
        phoneNumberId: phoneNumberId ? phoneNumberId.trim() : null,
        apiVersion: apiVersion.trim(),
        isConfigured: !!(token && phoneNumberId)
    };
};

/**
 * Format phone numbers to international standard (E.164 without plus)
 * Default for 10-digit Indian numbers: prepends 91
 */
const formatPhoneNumber = (phone) => {
    if (!phone) return null;
    let clean = String(phone).replace(/\D/g, '');

    // If starts with 0 and has 11 digits (e.g. 09894718182), replace leading 0 with 91
    if (clean.startsWith('0') && clean.length === 11) {
        clean = '91' + clean.slice(1);
    }
    // Standard 10-digit Indian mobile number
    else if (clean.length === 10) {
        clean = '91' + clean;
    }

    if (clean.length < 10) {
        throw new Error(`Invalid phone number "${phone}". Please enter a valid 10-digit mobile number.`);
    }

    return clean;
};

/**
 * Check WhatsApp Cloud API configuration and readiness
 */
const getStatus = async () => {
    const creds = getCredentials();

    if (!creds.isConfigured) {
        return {
            mode: 'cloud',
            ready: false,
            configured: false,
            message: 'WhatsApp Cloud API is not configured. Add WHATSAPP_CLOUD_TOKEN and WHATSAPP_PHONE_NUMBER_ID in Vercel Environment Variables.'
        };
    }

    return {
        mode: 'cloud',
        ready: true,
        configured: true,
        phoneNumberId: creds.phoneNumberId,
        message: 'WhatsApp Cloud API is configured and ready.'
    };
};

/**
 * Upload base64 PDF document to Meta Media Endpoint and send as WhatsApp message
 * 
 * @param {string} phoneNumber Customer phone number
 * @param {string} base64Data Base64-encoded PDF or data URI
 * @param {string} filename File name for invoice PDF
 * @param {string} message Text message/caption for invoice
 */
const sendDocument = async (phoneNumber, base64Data, filename = 'Invoice.pdf', message = '') => {
    const creds = getCredentials();

    if (!creds.isConfigured) {
        throw new Error('WhatsApp Cloud API is not configured on Vercel. Please set WHATSAPP_CLOUD_TOKEN and WHATSAPP_PHONE_NUMBER_ID in Vercel Settings.');
    }

    const recipientPhone = formatPhoneNumber(phoneNumber);
    if (!recipientPhone) {
        throw new Error('Customer phone number is missing or invalid.');
    }

    // Clean base64 string
    const cleanBase64 = base64Data.replace(/^data:.*?;base64,/, '');
    const pdfBuffer = Buffer.from(cleanBase64, 'base64');

    if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('Invoice PDF content is empty or invalid.');
    }

    // ── STEP 1: Upload PDF document to Meta Media API ──────────────────────────
    const formData = new FormData();
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    formData.append('file', blob, filename);
    formData.append('type', 'application/pdf');
    formData.append('messaging_product', 'whatsapp');

    const mediaUrl = `https://graph.facebook.com/${creds.apiVersion}/${creds.phoneNumberId}/media`;

    let mediaId;
    try {
        const uploadRes = await fetch(mediaUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${creds.token}`
            },
            body: formData
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok || !uploadData.id) {
            const errorMsg = uploadData.error?.message || uploadData.error?.error_user_msg || `Media upload failed with HTTP ${uploadRes.status}`;
            console.error('Meta Cloud API media upload error:', uploadData);
            throw new Error(`WhatsApp upload failed: ${errorMsg}`);
        }

        mediaId = uploadData.id;
    } catch (uploadErr) {
        console.error('Error uploading media to WhatsApp Cloud API:', uploadErr);
        throw uploadErr;
    }

    // ── STEP 2: Send WhatsApp Document Message ────────────────────────────────
    const messagesUrl = `https://graph.facebook.com/${creds.apiVersion}/${creds.phoneNumberId}/messages`;

    const messagePayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientPhone,
        type: 'document',
        document: {
            id: mediaId,
            caption: message || '',
            filename: filename
        }
    };

    try {
        const sendRes = await fetch(messagesUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${creds.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messagePayload)
        });

        const sendData = await sendRes.json();

        if (!sendRes.ok || sendData.error) {
            const errorMsg = sendData.error?.message || sendData.error?.error_user_msg || `Message send failed with HTTP ${sendRes.status}`;
            console.error('Meta Cloud API message send error:', sendData);
            throw new Error(`WhatsApp send failed: ${errorMsg}`);
        }

        return {
            success: true,
            mode: 'cloud',
            messageId: sendData.messages?.[0]?.id,
            recipient: recipientPhone
        };
    } catch (sendErr) {
        console.error('Error sending message via WhatsApp Cloud API:', sendErr);
        throw sendErr;
    }
};

/**
 * Logout placeholder for Cloud API (not applicable since token-based)
 */
const logoutWhatsApp = async () => {
    return {
        success: true,
        mode: 'cloud',
        message: 'WhatsApp Cloud API uses environment variable tokens and does not require session logout.'
    };
};

module.exports = {
    getStatus,
    sendDocument,
    logoutWhatsApp
};
