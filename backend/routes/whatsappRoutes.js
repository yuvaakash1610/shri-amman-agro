const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');

const isCloudMode = () => {
    return !!(process.env.VERCEL || process.env.WHATSAPP_MODE === 'cloud');
};

const getWhatsAppService = () => {
    if (isCloudMode()) {
        // Cloud mode: Meta WhatsApp Business Platform Cloud API (zero Puppeteer/browser dependencies)
        return require('../services/whatsappCloudService');
    } else {
        // Local mode: whatsapp-web.js (requires persistent local Node process + Chromium)
        return require('../services/whatsappService');
    }
};

router.get('/status', authenticateToken, async (req, res) => {
    try {
        const service = getWhatsAppService();
        const status = await service.getStatus();
        res.json(status);
    } catch (error) {
        console.error('Error getting WhatsApp status:', error);
        res.status(500).json({
            ready: false,
            message: 'Failed to retrieve WhatsApp service status',
            error: error.message
        });
    }
});

router.post('/send', authenticateToken, async (req, res) => {
    const { phoneNumber, base64Pdf, filename, message } = req.body;

    if (!phoneNumber || !base64Pdf) {
        return res.status(400).json({ message: 'Phone number and PDF data are required' });
    }

    try {
        const service = getWhatsAppService();
        const result = await service.sendDocument(phoneNumber, base64Pdf, filename || 'Invoice.pdf', message || '');
        res.json({
            success: true,
            message: 'WhatsApp invoice sent successfully',
            ...result
        });
    } catch (error) {
        console.error('Error sending WhatsApp message via API:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send WhatsApp message',
            error: error.message
        });
    }
});

router.post('/logout', authenticateToken, async (req, res) => {
    try {
        const service = getWhatsAppService();
        const result = await service.logoutWhatsApp();
        res.json(result);
    } catch (error) {
        console.error('Error logging out WhatsApp:', error);
        res.status(500).json({
            message: 'Failed to log out of WhatsApp',
            error: error.message
        });
    }
});

module.exports = router;
