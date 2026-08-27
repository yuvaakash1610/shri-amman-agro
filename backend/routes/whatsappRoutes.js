const express = require('express');
const router = express.Router();
const { 
    sendWhatsAppMessage, 
    sendWhatsAppDocument,
    getWhatsAppStatus 
} = require('../services/whatsappCloudService');

router.post('/send', async (req, res) => {
    try {
        const recipient = req.body.recipient || req.body.phoneNumber || req.body.to;
        const message = req.body.message || req.body.caption || req.body.body || '';
        const pdfData = req.body.base64Pdf || req.body.pdfBuffer;
        const filename = req.body.filename || 'Invoice.pdf';

        if (!recipient) {
            return res.status(400).json({ 
                success: false, 
                error: 'Recipient and phone number are required' 
            });
        }

        // If PDF data is present, send as document invoice
        if (pdfData) {
            const pdfBuffer = Buffer.isBuffer(pdfData) 
                ? pdfData 
                : Buffer.from(String(pdfData).replace(/^data:.*?;base64,/, ''), 'base64');
            const result = await sendWhatsAppDocument(recipient, pdfBuffer, filename, message);
            return res.json({ 
                success: true, 
                message: 'WhatsApp invoice sent successfully',
                data: result 
            });
        }

        if (!message) {
            return res.status(400).json({ 
                success: false, 
                error: 'Recipient and message are required' 
            });
        }

        const result = await sendWhatsAppMessage(recipient, message);
        res.json({ 
            success: true, 
            message: 'WhatsApp message sent successfully',
            data: result 
        });
    } catch (error) {
        console.error('Send error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

router.post('/send-document', async (req, res) => {
    try {
        const recipient = req.body.recipient || req.body.phoneNumber || req.body.to;
        const pdfData = req.body.pdfBuffer || req.body.base64Pdf;
        const filename = req.body.filename || 'Invoice.pdf';
        const caption = req.body.caption || req.body.message || '';

        if (!recipient || !pdfData) {
            return res.status(400).json({ 
                success: false, 
                error: 'Recipient and PDF data are required' 
            });
        }

        const pdfBuffer = Buffer.isBuffer(pdfData) 
            ? pdfData 
            : Buffer.from(String(pdfData).replace(/^data:.*?;base64,/, ''), 'base64');

        const result = await sendWhatsAppDocument(recipient, pdfBuffer, filename, caption);
        res.json({ 
            success: true, 
            message: 'WhatsApp document sent successfully',
            data: result 
        });
    } catch (error) {
        console.error('Document send error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

router.get('/status', async (req, res) => {
    try {
        const status = await getWhatsAppStatus();
        res.json({
            mode: 'cloud',
            ...status
        });
    } catch (error) {
        console.error('Status error:', error);
        res.status(500).json({ 
            status: 'error', 
            error: error.message 
        });
    }
});

router.post('/logout', async (req, res) => {
    try {
        res.json({ success: true, message: 'Session cleared' });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;
