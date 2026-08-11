const express = require('express');
const router = express.Router();
const whatsappService = require('../services/whatsappService');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.get('/status', authenticateToken, (req, res) => {
    res.json(whatsappService.getStatus());
});

router.post('/send', authenticateToken, async (req, res) => {
    const { phoneNumber, base64Pdf, filename, message } = req.body;

    if (!phoneNumber || !base64Pdf) {
        return res.status(400).json({ message: 'Phone number and PDF data are required' });
    }

    try {
        await whatsappService.sendDocument(phoneNumber, base64Pdf, filename || 'Invoice.pdf', message || '');
        res.json({ message: 'WhatsApp message sent successfully' });
    } catch (error) {
        console.error('Error sending WhatsApp message via API:', error);
        res.status(500).json({ message: 'Failed to send WhatsApp message', error: error.message });
    }
});

module.exports = router;
