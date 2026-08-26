const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

let client;
let qrCodeDataURL = null;
let isReady = false;
let isInitializing = false;
let initRetryTimer = null;
let intentionalLogout = false;   // ← blocks auto-reconnect during deliberate logout

const DATA_PATH = path.join(__dirname, '../../.wwebjs_auth');
const SESSION_ID = 'saat-agro';

// Terminate any lingering Chrome processes using the session directory on Windows
const killOrphanChromeProcesses = () => {
    if (process.platform === 'win32') {
        try {
            execSync(`powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\"name = 'chrome.exe'\\" | Where-Object { $_.CommandLine -like '*session-${SESSION_ID}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }"`, { stdio: 'ignore' });
        } catch (_) {}
    }
};

// Recursively wipe all Puppeteer lock / socket files from the session directory
const clearLockFiles = () => {
    try {
        killOrphanChromeProcesses();
        if (!fs.existsSync(DATA_PATH)) return;
        const targets = ['SingletonLock', 'SingletonSocket', 'SingletonCookie', 'lockfile', 'DevToolsActivePort'];
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
        webVersionCache: {
            type: 'remote',
            remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
        },
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
        if (intentionalLogout) {
            // We just logged out — ignore stale ready event from old client
            console.log('WhatsApp: Ignoring ready event — intentional logout in progress.');
            return;
        }
        console.log('WhatsApp Client is ready!');
        isReady = true;
        isInitializing = false;
        qrCodeDataURL = null;
    });

    client.on('authenticated', () => {
        if (intentionalLogout) return;
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

        if (intentionalLogout) {
            // ← Do NOT auto-reconnect; logout handler manages reinitialization
            console.log('WhatsApp: Skipping auto-reconnect (intentional logout).');
            return;
        }

        // Unexpected disconnect — schedule reconnect
        setTimeout(() => clearSessionDir(), 2000);
        initRetryTimer = setTimeout(() => tryInitialize(), 10000);
    });
};

const tryInitialize = () => {
    if (isInitializing) return;
    isInitializing = true;
    intentionalLogout = false;   // clear logout flag when new init starts
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
    if (process.env.VERCEL || (process.env.NODE_ENV === 'production' && process.env.ENABLE_WHATSAPP === 'false')) {
        console.log('WhatsApp Service skipped in serverless environment.');
        return;
    }
    if (isInitializing || isReady) return;
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

const logoutWhatsApp = async () => {
    console.log('WhatsApp: Logout requested by user.');

    // Set flag FIRST so disconnected handler won't auto-reconnect
    intentionalLogout = true;
    isReady = false;
    qrCodeDataURL = null;
    isInitializing = false;
    clearTimeout(initRetryTimer);

    // 1. Destroy the Puppeteer browser (releases file locks on Windows)
    if (client) {
        try { await client.destroy(); } catch (_) {}
        client = null;
    }

    // 2. Kill any orphaned Chrome processes that still hold locks
    killOrphanChromeProcesses();
    if (process.platform === 'win32') {
        try {
            const { execSync } = require('child_process');
            execSync(`powershell -NoProfile -Command "Stop-Process -Name 'chrome' -Force -ErrorAction SilentlyContinue"`, { stdio: 'ignore' });
        } catch (_) {}
    }

    // 3. Wait for OS to release file handles, then wipe session directory
    await new Promise(r => setTimeout(r, 3000));
    const sessionPath = path.join(DATA_PATH, `session-${SESSION_ID}`);
    if (process.platform === 'win32') {
        try {
            const { execSync } = require('child_process');
            execSync(`powershell -NoProfile -Command "Remove-Item -Path '${sessionPath.replace(/\\/g, '\\\\')}' -Recurse -Force -ErrorAction SilentlyContinue"`, { stdio: 'ignore' });
            console.log('WhatsApp: session directory wiped via PowerShell');
        } catch (_) {
            clearSessionDir();
        }
    } else {
        clearSessionDir();
    }

    // 4. Re-initialize fresh so QR code appears
    await new Promise(r => setTimeout(r, 1500));
    console.log('WhatsApp: re-initializing after logout (fresh QR expected)...');
    tryInitialize();

    return { success: true, message: 'Logged out of WhatsApp successfully.' };
};

module.exports = { initWhatsApp, getStatus, sendDocument, logoutWhatsApp };
