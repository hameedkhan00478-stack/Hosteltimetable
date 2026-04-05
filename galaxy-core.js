/**
 * GALAXY CORE (Global Controller)
 * Obfuscated functions for authentication, localStorage, modals, bilingual toasts, WhatsApp float, branding.
 */

// ========== DOM Ready ==========
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject PeshoX Intelligence branding (top right)
    if (!document.querySelector('.peshox-brand')) {
        const brand = document.createElement('div');
        brand.className = 'peshox-brand';
        brand.innerHTML = '<i class="fas fa-brain"></i> PESHOX INTELLIGENCE';
        document.body.appendChild(brand);
    }
    
    // 2. Inject WhatsApp floating icon (channel link)
    if (!document.querySelector('.whatsapp-float')) {
        const wa = document.createElement('div');
        wa.className = 'whatsapp-float';
        wa.innerHTML = '<i class="fab fa-whatsapp"></i>';
        wa.onclick = () => {
            window.open('https://whatsapp.com/channel/0029Vb781b08fewrKeUT7m1a', '_blank');
        };
        document.body.appendChild(wa);
    }
    
    // 3. Inject global footer (Thanks to @darkecho)
    injectGlobalFooter();
    
    // 4. Load FontAwesome if not already present
    if (!document.querySelector('link[href*="fontawesome"]')) {
        const fa = document.createElement('link');
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
        document.head.appendChild(fa);
    }
});

// ========== Footer Injection ==========
function injectGlobalFooter() {
    if (document.querySelector('.global-footer')) return;
    const footer = document.createElement('footer');
    footer.className = 'global-footer';
    footer.innerHTML = `
        <p>Thanks to @darkecho</p>
        <div class="footer-disclaimer">
            Encrypted Signal. Authorized for private use under the PeshoX Intelligence Protocol.
        </div>
    `;
    document.body.appendChild(footer);
}

// ========== Centered Modal (replaces bottom toast) ==========
let activeModal = null;
function showModal(title, message, onConfirm = null, onCancel = null, showCancel = true) {
    // Remove existing modal
    if (activeModal) activeModal.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal-container">
            <h3 style="color: var(--primary-red);">${title}</h3>
            <p>${message}</p>
            <div class="modal-buttons">
                ${showCancel ? '<button id="modalCancelBtn" class="btn-secondary">Cancel</button>' : ''}
                <button id="modalConfirmBtn" class="btn-primary">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    activeModal = overlay;
    setTimeout(() => overlay.classList.add('active'), 10);
    
    const confirmBtn = overlay.querySelector('#modalConfirmBtn');
    const cancelBtn = overlay.querySelector('#modalCancelBtn');
    
    confirmBtn.onclick = () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
        if (onConfirm) onConfirm();
    };
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
            if (onCancel) onCancel();
        };
    }
}

// Shortcut for simple alerts
function showAlert(message) {
    showModal('Notice', message, null, null, false);
}

// ========== Bilingual Toast (centered) ==========
function showBilingualToast(englishMsg, urduMsg, duration = 3000) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.background = 'rgba(0,0,0,0.7)';
    overlay.innerHTML = `
        <div class="modal-container" style="background: #1a0000; border-color: #ff4444;">
            <div class="bilingual">
                <span class="english-text">${englishMsg}</span>
                <span class="urdu-text">${urduMsg}</span>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 10);
    setTimeout(() => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    }, duration);
}

// ========== localStorage Helpers (obfuscated names) ==========
const STORAGE = {
    CURRENT: '_x7k9',      // current user key
    USERS: '_m3p2',        // users db
    SUBS: '_r8t4',         // subscriptions
};

function getUsers() {
    const data = localStorage.getItem(STORAGE.USERS);
    return data ? JSON.parse(data) : {};
}

function saveUser(userKey, profile) {
    const users = getUsers();
    users[userKey] = { ...(users[userKey] || {}), ...profile, lastUpdate: Date.now() };
    localStorage.setItem(STORAGE.USERS, JSON.stringify(users));
}

function getUser(userKey) {
    return getUsers()[userKey] || null;
}

function getCurrentUserKey() {
    return localStorage.getItem(STORAGE.CURRENT);
}

function setCurrentUser(userKey) {
    localStorage.setItem(STORAGE.CURRENT, userKey);
}

function logout() {
    localStorage.removeItem(STORAGE.CURRENT);
    window.location.href = 'horizon.html';  // obfuscated landing page
}

function checkAuth(redirect = 'horizon.html') {
    if (!getCurrentUserKey()) {
        window.location.href = redirect;
        return false;
    }
    return true;
}

// Subscription helpers
function getSubscription() {
    const key = getCurrentUserKey();
    if (!key) return null;
    const subs = JSON.parse(localStorage.getItem(STORAGE.SUBS) || '{}');
    return subs[key] || null;
}

function isSubscriptionActive() {
    const sub = getSubscription();
    return sub && sub.expiry && Date.now() < sub.expiry;
}

function saveSubscription(expiry, plan) {
    const key = getCurrentUserKey();
    if (!key) return;
    const subs = JSON.parse(localStorage.getItem(STORAGE.SUBS) || '{}');
    subs[key] = { expiry, plan };
    localStorage.setItem(STORAGE.SUBS, JSON.stringify(subs));
}

// ========== Key Generators ==========
function generateKey99() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?/`~ ';
    let key = '';
    for (let i = 0; i < 99; i++) key += chars[Math.floor(Math.random() * chars.length)];
    return key;
}

function generateKey33() { return generateKeyOfLength(33); }
function generateKey44() { return generateKeyOfLength(44); }
function generateKey55() { return generateKeyOfLength(55); }

function generateKeyOfLength(len) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+[]{}|;:,.<>?/`~';
    const space = ' ';
    const all = letters + numbers + symbols + space;
    let key = '';
    key += letters[Math.floor(Math.random() * letters.length)];
    key += numbers[Math.floor(Math.random() * numbers.length)];
    key += symbols[Math.floor(Math.random() * symbols.length)];
    key += space;
    for (let i = 4; i < len; i++) key += all[Math.floor(Math.random() * all.length)];
    return key.split('').sort(() => Math.random() - 0.5).join('');
}

function isValidKey(key, expectedLen) {
    if (!key || key.length !== expectedLen) return false;
    const hasLetter = /[A-Za-z]/.test(key);
    const hasNumber = /[0-9]/.test(key);
    const hasSymbol = /[!@#$%^&*()_+[\]{}|;:,.<>?/`~]/.test(key);
    const hasSpace = / /.test(key);
    return hasLetter && hasNumber && hasSymbol && hasSpace;
}

// Export to global (obfuscated namespace)
window.PX = {
    showModal,
    showAlert,
    showBilingualToast,
    getUsers,
    saveUser,
    getUser,
    getCurrentUserKey,
    setCurrentUser,
    logout,
    checkAuth,
    getSubscription,
    isSubscriptionActive,
    saveSubscription,
    generateKey99,
    generateKey33,
    generateKey44,
    generateKey55,
    isValidKey,
    STORAGE_KEYS: STORAGE
};
