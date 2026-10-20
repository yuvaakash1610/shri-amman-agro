const express = require('express');
const router = express.Router();

const isVercel = !!process.env.VERCEL;
const isCloudMode = isVercel || process.env.WHATSAPP_MODE === 'cloud';

const cloudService = require('../services/whatsappCloudService');
let localService = null;
if (!isVercel) {
    try {
        localService = require('../services/whatsappService');
    } catch (e) {
        console.warn('Local WhatsApp service could not be loaded:', e.message);
    }
}

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

        console.log(`📨 Send request for ${recipient}`);

        if (isCloudMode || !localService) {
            if (pdfData) {
                const pdfBuffer = Buffer.isBuffer(pdfData) 
                    ? pdfData 
                    : Buffer.from(String(pdfData).replace(/^data:.*?;base64,/, ''), 'base64');
                const result = await cloudService.sendWhatsAppDocument(recipient, pdfBuffer, filename, message);
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

            const result = await cloudService.sendWhatsAppMessage(recipient, message);
            return res.json({ 
                success: true, 
                message: 'WhatsApp message sent successfully',
                data: result 
            });
        }

        // Local WhatsApp Mode (whatsapp-web.js)
        if (pdfData) {
            const rawBase64 = Buffer.isBuffer(pdfData) 
                ? pdfData.toString('base64') 
                : String(pdfData);
            const result = await localService.sendDocument(recipient, rawBase64, filename, message);
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

        const result = await localService.sendMessage(recipient, message);
        res.json({ 
            success: true, 
            message: 'WhatsApp message sent successfully',
            data: result 
        });
    } catch (error) {
        console.error('Send route error:', error);
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
        const filename = req.body.filename || 'invoice.pdf';
        const caption = req.body.caption || req.body.message || '';

        if (!recipient || !pdfData) {
            return res.status(400).json({ 
                success: false, 
                error: 'Recipient and PDF data are required' 
            });
        }

        console.log(`📨 Document request for ${recipient}`);

        if (isCloudMode || !localService) {
            const pdfBuffer = Buffer.isBuffer(pdfData)
                ? pdfData
                : Buffer.from(String(pdfData).replace(/^data:.*?;base64,/, ''), 'base64');

            const result = await cloudService.sendWhatsAppDocument(recipient, pdfBuffer, filename, caption);
            return res.json({ 
                success: true, 
                message: 'WhatsApp document sent successfully',
                data: result 
            });
        }

        // Local WhatsApp Mode
        const rawBase64 = Buffer.isBuffer(pdfData) 
            ? pdfData.toString('base64') 
            : String(pdfData);

        const result = await localService.sendDocument(recipient, rawBase64, filename, caption);
        res.json({ 
            success: true, 
            message: 'WhatsApp document sent successfully',
            data: result 
        });
    } catch (error) {
        console.error('Document route error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

router.get('/status', async (req, res) => {
    try {
        if (isCloudMode || !localService) {
            const status = await cloudService.getWhatsAppStatus();
            return res.json({
                mode: 'cloud',
                ...status
            });
        }

        const status = localService.getStatus();
        res.json({
            mode: 'local',
            ...status
        });
    } catch (error) {
        console.error('Status route error:', error);
        res.status(500).json({ 
            status: 'error', 
            error: error.message 
        });
    }
});

router.post('/logout', async (req, res) => {
    try {
        if (isCloudMode || !localService) {
            return res.json({ success: true, message: 'Session cleared' });
        }

        const result = await localService.logoutWhatsApp();
        res.json(result);
    } catch (error) {
        console.error('Logout route error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;

