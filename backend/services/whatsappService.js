const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');

let client;
let qrCodeDataURL = null;
let isReady = false;
let isInitializing = false;   // guard: prevent double-init
let initRetryTimer = null;

const DATA_PATH = path.join(__dirname, '../../.wwebjs_auth');
const SESSION_ID = 'saat-agro';

// Recursively wipe all Puppeteer lock / socket files from the session directory
const clearLockFiles = () => {
    try {
        if (!fs.existsSync(DATA_PATH)) return;
        const targets = ['SingletonLock', 'SingletonSocket', 'SingletonCookie', 'lockfile'];
        const walkAndDelete = (dir) => {
            let entries = [];
            try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return; }
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    walkAndDelete(fullPath);
                } else if (targets.includes(entry.name) || entry.name.startsWith('Singleton')) {
                    try { fs.rmSync(fullPath, { force: true }); console.log('WhatsApp: removed lock:', entry.name); }
                    catch (_) {}
                }
            }
        };
        walkAndDelete(DATA_PATH);
    } catch (err) {
        console.warn('WhatsApp: could not clear lock files:', err.message);
    }
};

// Safely clear session directory
const clearSessionDir = () => {
    const sessionPath = path.join(DATA_PATH, `session-${SESSION_ID}`);
    try {
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
            console.log('WhatsApp: cleared session directory');
        }
    } catch (err) {
        console.warn('WhatsApp: could not clear session directory:', err.message);
    }
};

const buildClient = () => {
    if (client) {
        try { client.destroy().catch(() => {}); } catch (_) {}
    }

    const authStrategy = new LocalAuth({
        clientId: SESSION_ID,
        dataPath: DATA_PATH,
        rmMaxRetries: 10
    });

    // Override logout to gracefully handle Windows file locking (EBUSY / EPERM) during session cleanup
    const originalLogout = authStrategy.logout.bind(authStrategy);
    authStrategy.logout = async () => {
        try {
            await originalLogout();
        } catch (err) {
            console.warn('WhatsApp: LocalAuth logout file cleanup warning (ignored):', err.message);
            setTimeout(() => clearSessionDir(), 2000);
        }
    };

    client = new Client({
        authStrategy,
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-extensions'
            ]
        }
    });

    client.on('qr', async (qr) => {
        console.log('WhatsApp: QR code received — scan from Dashboard.');
        try { qrCodeDataURL = await qrcode.toDataURL(qr); }
        catch (err) { console.error('WhatsApp: QR generate error', err); }
    });

    client.on('ready', () => {
        console.log('WhatsApp Client is ready!');
        isReady = true;
        isInitializing = false;
        qrCodeDataURL = null;
    });

    client.on('authenticated', () => {
        console.log('WhatsApp Client is authenticated');
    });

    client.on('auth_failure', (msg) => {
        console.error('WhatsApp AUTHENTICATION FAILURE', msg);
        isReady = false;
        isInitializing = false;
        setTimeout(() => clearSessionDir(), 2000);
    });

    client.on('disconnected', (reason) => {
        console.log('WhatsApp Client disconnected:', reason);
        isReady = false;
        isInitializing = false;
        clearTimeout(initRetryTimer);
        setTimeout(() => clearSessionDir(), 2000);
        initRetryTimer = setTimeout(() => tryInitialize(), 10000);
    });
};

const tryInitialize = () => {
    if (isInitializing) return;   // prevent concurrent init attempts
    isInitializing = true;
    clearLockFiles();
    buildClient();
    client.initialize().catch((err) => {
        console.error('WhatsApp: initialize() failed —', err.message);
        isReady = false;
        isInitializing = false;
        clearTimeout(initRetryTimer);
        initRetryTimer = setTimeout(() => {
            console.log('WhatsApp: retrying...');
            tryInitialize();
        }, 15000);
    });
};

const initWhatsApp = () => {
    if (isInitializing || isReady) return;   // only ever init once
    console.log('Initializing WhatsApp Service...');
    tryInitialize();
};

const getStatus = () => ({ ready: isReady, qr: qrCodeDataURL });

const sendDocument = async (phoneNumber, base64Data, filename, message) => {
    if (!isReady || !client) {
        throw new Error('WhatsApp client is not ready. Scan the QR code from the Dashboard first.');
    }
    let cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
    const chatId = `${cleanPhone}@c.us`;
    const b64    = base64Data.replace(/^data:.*?;base64,/, '');
    const media  = new MessageMedia('application/pdf', b64, filename);
    await client.sendMessage(chatId, media, { caption: message });
    return { success: true };
};

module.exports = { initWhatsApp, getStatus, sendDocument };
