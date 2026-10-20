const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

let client = null;
let qrCodeDataURL = null;
let isReady = false;
let isAuthenticated = false;
let isInitializing = false;
let initRetryTimer = null;
let intentionalLogout = false;

const DATA_PATH = path.join(__dirname, '../../.wwebjs_auth');
const SESSION_ID = 'saat-agro';

// Terminate any lingering Chrome processes using the session directory on Windows
const killOrphanChromeProcesses = () => {
    if (process.platform === 'win32') {
        try {
            execSync(`powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"name = 'chrome.exe'\\" | Where-Object { $_.CommandLine -like '*session-${SESSION_ID}*' -or $_.CommandLine -like '*.wwebjs_auth*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"`, { stdio: 'ignore' });
        } catch (_) {}
    }
};

// Clear ONLY stale lock files (NEVER delete cookies or session databases)
const clearLockFiles = () => {
    try {
        killOrphanChromeProcesses();
        if (!fs.existsSync(DATA_PATH)) return;
        const lockTargets = ['SingletonLock', 'DevToolsActivePort', 'lockfile'];
        const walkAndDelete = (dir) => {
            let entries = [];
            try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return; }
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    walkAndDelete(fullPath);
                } else if (lockTargets.includes(entry.name)) {
                    try { 
                        fs.rmSync(fullPath, { force: true }); 
                        console.log('WhatsApp: cleared stale lock file:', entry.name); 
                    } catch (_) {}
                }
            }
        };
        walkAndDelete(DATA_PATH);
    } catch (err) {
        console.warn('WhatsApp: lock cleanup notice:', err.message);
    }
};

// Safely clear session directory ONLY on explicit manual logout
const clearSessionDir = () => {
    killOrphanChromeProcesses();
    const sessionPath = path.join(DATA_PATH, `session-${SESSION_ID}`);
    try {
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
            console.log('WhatsApp: cleared session directory (manual logout)');
        }
    } catch (err) {
        console.warn('WhatsApp: could not clear session directory:', err.message);
    }
};

const destroyPreviousClient = async () => {
    if (client) {
        try {
            await client.destroy();
        } catch (_) {}
        client = null;
    }
    killOrphanChromeProcesses();
};

const buildClient = () => {
    const authStrategy = new LocalAuth({
        clientId: SESSION_ID,
        dataPath: DATA_PATH
    });

    // Safely trap logout cleanup errors on Windows (prevents EBUSY crash)
    const originalLogout = authStrategy.logout.bind(authStrategy);
    authStrategy.logout = async () => {
        try {
            killOrphanChromeProcesses();
            await originalLogout();
        } catch (err) {
            console.warn('WhatsApp auth logout notice (suppressed locked file notice):', err.message);
        }
    };

    client = new Client({
        authStrategy,
        webVersionCache: {
            type: 'none'
        },
        puppeteer: {
            headless: true,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-extensions',
                '--no-default-browser-check',
                '--disable-blink-features=AutomationControlled'
            ]
        }
    });

    client.on('qr', async (qr) => {
        console.log('WhatsApp: QR code ready — scan from Dashboard.');
        try { 
            qrCodeDataURL = await qrcode.toDataURL(qr); 
        } catch (err) { 
            console.error('WhatsApp: QR generation error', err); 
        }
    });

    client.on('authenticated', () => {
        if (intentionalLogout) return;
        console.log('WhatsApp Client is authenticated');
        isAuthenticated = true;
        qrCodeDataURL = null;
    });

    client.on('ready', () => {
        if (intentionalLogout) return;
        console.log('WhatsApp Client is ready!');
        isReady = true;
        isAuthenticated = true;
        isInitializing = false;
        qrCodeDataURL = null;
    });

    client.on('auth_failure', (msg) => {
        console.error('WhatsApp Authentication Failure:', msg);
        isReady = false;
        isAuthenticated = false;
        isInitializing = false;
    });

    client.on('disconnected', (reason) => {
        console.log('WhatsApp Client disconnected:', reason);
        isReady = false;
        isAuthenticated = false;
        isInitializing = false;
        clearTimeout(initRetryTimer);

        if (intentionalLogout) {
            console.log('WhatsApp: Manual logout completed.');
            return;
        }

        console.log('WhatsApp: Reconnecting in 10 seconds (session preserved)...');
        initRetryTimer = setTimeout(() => tryInitialize(), 10000);
    });
};

const tryInitialize = async () => {
    if (isInitializing) return;
    isInitializing = true;
    intentionalLogout = false;
    clearTimeout(initRetryTimer);

    await destroyPreviousClient();
    clearLockFiles();
    buildClient();

    try {
        console.log('WhatsApp: Starting client initialization...');
        await client.initialize();
    } catch (err) {
        console.warn('WhatsApp initialize error:', err.message);
        isReady = false;
        isAuthenticated = false;
        isInitializing = false;
        clearTimeout(initRetryTimer);
        initRetryTimer = setTimeout(() => {
            tryInitialize();
        }, 12000);
    }
};

const initWhatsApp = () => {
    if (process.env.VERCEL || (process.env.NODE_ENV === 'production' && process.env.ENABLE_WHATSAPP === 'false')) {
        console.log('WhatsApp Service skipped in serverless environment.');
        return;
    }
    if (isInitializing || isReady) return;
    console.log('Initializing WhatsApp Service...');
    tryInitialize();
};

const waitForReady = async (timeoutMs = 15000) => {
    if (!client) {
        throw new Error('WhatsApp client not initialized. Please refresh Dashboard.');
    }
    if (isReady) return true;
    if (!isAuthenticated && !isReady) {
        throw new Error('WhatsApp is not linked. Scan the QR code from the Dashboard first.');
    }
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        if (isReady) return true;
        await new Promise(r => setTimeout(r, 600));
    }
    if (isAuthenticated && client) {
        return true;
    }
    throw new Error('WhatsApp client is still loading. Please wait 5 seconds and try again.');
};

const getStatus = () => ({ 
    ready: isReady || (isAuthenticated && !qrCodeDataURL), 
    qr: qrCodeDataURL 
});

const formatChatId = (phoneNumber) => {
    let cleanPhone = String(phoneNumber).replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
        cleanPhone = cleanPhone.substring(1);
    }
    if (cleanPhone.length === 10) {
        cleanPhone = '91' + cleanPhone;
    }
    return `${cleanPhone}@c.us`;
};

const sendMessage = async (phoneNumber, message) => {
    await waitForReady();
    const chatId = formatChatId(phoneNumber);
    console.log(`WhatsApp: Sending text message to ${chatId}`);
    const result = await client.sendMessage(chatId, message, { sendSeen: false });
    return { success: true, messageId: result?.id?._serialized };
};

const sendDocument = async (phoneNumber, base64Data, filename, message) => {
    await waitForReady();
    const chatId = formatChatId(phoneNumber);

    if (!base64Data) {
        throw new Error('No PDF data provided for WhatsApp document.');
    }

    // Clean base64 string from data URI prefix and all whitespace/linebreaks
    let cleanBase64 = String(base64Data);
    if (cleanBase64.includes('base64,')) {
        cleanBase64 = cleanBase64.split('base64,')[1];
    }
    cleanBase64 = cleanBase64.replace(/[\r\n\s]/g, '');

    const docName = filename || 'Invoice.pdf';
    console.log(`WhatsApp: Sending PDF document "${docName}" (${Math.round(cleanBase64.length * 0.75 / 1024)} KB) to ${chatId}`);

    const media = new MessageMedia('application/pdf', cleanBase64, docName);

    try {
        const result = await client.sendMessage(chatId, media, { 
            caption: message || '', 
            sendSeen: false,
            sendMediaAsDocument: true 
        });
        return { success: true, messageId: result?.id?._serialized };
    } catch (err) {
        console.error('WhatsApp sendDocument media error, attempting text message fallback:', err.message);
        try {
            const textResult = await client.sendMessage(chatId, message || `Your invoice ${docName} has been generated.`, { sendSeen: false });
            return { success: true, fallback: true, messageId: textResult?.id?._serialized };
        } catch (fallbackErr) {
            console.error('WhatsApp fallback text error:', fallbackErr.message);
            throw new Error(`Failed to deliver WhatsApp message: ${err.message}`);
        }
    }
};

const logoutWhatsApp = async () => {
    console.log('WhatsApp: Manual logout requested.');
    intentionalLogout = true;
    isReady = false;
    isAuthenticated = false;
    qrCodeDataURL = null;
    isInitializing = false;
    clearTimeout(initRetryTimer);

    await destroyPreviousClient();
    await new Promise(r => setTimeout(r, 1500));
    clearSessionDir();

    await new Promise(r => setTimeout(r, 1000));
    console.log('WhatsApp: Re-initializing fresh QR session...');
    tryInitialize();

    return { success: true, message: 'Logged out of WhatsApp successfully.' };
};

module.exports = { initWhatsApp, getStatus, sendMessage, sendDocument, logoutWhatsApp };
