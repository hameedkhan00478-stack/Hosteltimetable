/**
 * Phoenix (Profile & Wallet)
 * - Displays wallet balance from localStorage (_px_wallet)
 * - Live subscription countdown timer with canvas ring
 * - Editable aviator platform and mobile number
 * - Account stats (fake)
 * - Logout with confirmation
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Authentication guard ---
    if (typeof PX !== 'undefined' && PX.checkAuth) {
        if (!PX.checkAuth('horizon.html')) return;
    } else {
        window.location.href = 'horizon.html';
        return;
    }

    // --- DOM elements ---
    const backBtn = document.getElementById('backToDashboardBtn');
    const walletBalanceSpan = document.getElementById('walletBalance');
    const timerDisplay = document.getElementById('timerDisplay');
    const timerCanvas = document.getElementById('timerCanvas');
    const ctx = timerCanvas.getContext('2d');
    const fullNameSpan = document.getElementById('fullNameDisplay');
    const userKeySpan = document.getElementById('userKeyDisplay');
    const copyKeyBtn = document.getElementById('copyKeyBtn');
    const aviatorSelect = document.getElementById('aviatorSelectProfile');
    const mobileInput = document.getElementById('mobileNumberProfile');
    const saveBtn = document.getElementById('saveProfileBtn');
    const logoutBtn = document.getElementById('logoutBtnProfile');
    const logoutModal = document.getElementById('logoutModal');
    const logoutCancel = document.getElementById('logoutCancelBtn');
    const logoutConfirm = document.getElementById('logoutConfirmBtn');
    const totalScansSpan = document.getElementById('totalScans');

    // --- Helper: get current user data ---
    let currentUserKey = PX.getCurrentUserKey();
    let userData = PX.getUser(currentUserKey) || {};

    // --- Wallet: load from localStorage (key used by Falcon) ---
    const WALLET_KEY = '_px_wallet';
    let walletBalance = parseInt(localStorage.getItem(WALLET_KEY) || '0');
    function updateWalletDisplay() {
        walletBalanceSpan.textContent = walletBalance.toFixed(2) + ' PKR';
    }
    updateWalletDisplay();

    // --- Populate aviator platforms (same as aurora) ---
    const platforms = [
        "bJbaji", "JJ win", "1XBet", "Parimatch", "Bet365", "Betway", "22Bet", "888casino",
        "Betwinner", "Mostbet", "Melbet", "Pin-Up Casino", "Betpanda", "BC.Game", "Stake.com",
        "Lucky Block", "Metaspins", "Cloudbet", "Vave Casino", "Cryptorino", "Wild.io",
        "CoinCasino", "Hollywoodbets", "Betfred", "Supabets", "4rabet", "Rajabets", "BlueChip",
        "10CRIC", "BetMGM", "Unibet", "Lottoland", "EstrelaBet", "Betano", "KTO"
    ];
    platforms.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p;
        opt.textContent = p;
        if (userData.aviatorName === p) opt.selected = true;
        aviatorSelect.appendChild(opt);
    });

    // --- Load user profile data ---
    function loadProfile() {
        const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Anonymous Pilot';
        fullNameSpan.textContent = fullName;
        userKeySpan.textContent = currentUserKey;
        mobileInput.value = userData.mobileNumber || '';
        // Random total scans (50-200)
        const totalScans = Math.floor(Math.random() * 151) + 50;
        totalScansSpan.textContent = totalScans;
    }
    loadProfile();

    // --- Save changes ---
    function saveChanges() {
        const newAviator = aviatorSelect.value;
        let newMobile = mobileInput.value.trim();
        if (newMobile) {
            const mobileRegex = /^\+\d{10,15}$/;
            if (!mobileRegex.test(newMobile)) {
                PX.showBilingualToast('Mobile must start with + and 10-15 digits.', 'موبائل نمبر + سے شروع اور 10-15 ہندسوں پر مشتمل ہونا چاہیے۔');
                return;
            }
        }
        userData.aviatorName = newAviator;
        userData.mobileNumber = newMobile;
        PX.saveUser(currentUserKey, userData);
        PX.showBilingualToast('Profile updated successfully!', 'پروفائل کامیابی سے اپڈیٹ ہوگیا!');
    }
    saveBtn.addEventListener('click', saveChanges);

    // --- Copy 99-char key ---
    async function copyUserKey() {
        await navigator.clipboard.writeText(currentUserKey);
        PX.showBilingualToast('Key copied!', 'کلید کاپی ہوگئی!');
    }
    copyKeyBtn.addEventListener('click', copyUserKey);

    // --- Live subscription timer with canvas ring ---
    let timerInterval = null;
    function updateTimer() {
        const sub = PX.getSubscription();
        let remainingMs = 0;
        let isActive = false;
        if (sub && sub.expiry && sub.expiry > Date.now()) {
            remainingMs = sub.expiry - Date.now();
            isActive = true;
        }
        if (!isActive) {
            timerDisplay.textContent = 'Status: Inactive / غیر فعال';
            timerDisplay.style.color = '#aaa';
            drawTimerRing(0);
            return;
        }
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (3600000)) / 60000);
        const seconds = Math.floor((remainingMs % 60000) / 1000);
        timerDisplay.textContent = `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
        // Pulse red if less than 10 minutes
        if (remainingMs < 10 * 60 * 1000) {
            timerDisplay.style.color = '#ff4444';
            timerDisplay.style.animation = 'pulse 0.5s infinite';
        } else {
            timerDisplay.style.color = '#ff8888';
            timerDisplay.style.animation = 'none';
        }
        // Draw circular progress (full ring = 72 hours max? For simplicity, use % of 72h for premium, 24h for standard, 1h for basic)
        let maxDuration = 72 * 60 * 60 * 1000; // default premium
        if (sub.plan === 'standard') maxDuration = 24 * 60 * 60 * 1000;
        else if (sub.plan === 'basic') maxDuration = 60 * 60 * 1000;
        const percent = Math.max(0, Math.min(1, remainingMs / maxDuration));
        drawTimerRing(percent);
    }
    function drawTimerRing(percent) {
        if (!ctx) return;
        const radius = 35;
        const center = 40;
        const circumference = 2 * Math.PI * radius;
        ctx.clearRect(0, 0, 80, 80);
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.beginPath();
        const endAngle = -Math.PI / 2 + (2 * Math.PI * percent);
        ctx.arc(center, center, radius, -Math.PI / 2, endAngle);
        ctx.strokeStyle = '#ff0000';
        ctx.stroke();
    }
    function startTimer() {
        if (timerInterval) clearInterval(timerInterval);
        updateTimer();
        timerInterval = setInterval(updateTimer, 1000);
    }
    startTimer();

    // --- Navigation & Logout ---
    backBtn.addEventListener('click', () => {
        window.location.href = 'pulsar.html';
    });
    logoutBtn.addEventListener('click', () => {
        logoutModal.style.display = 'flex';
    });
    logoutCancel.addEventListener('click', () => {
        logoutModal.style.display = 'none';
    });
    logoutConfirm.addEventListener('click', () => {
        PX.logout();
    });

    // --- CSS animation for pulse (add to head if not exists) ---
    if (!document.querySelector('#pulseStyle')) {
        const style = document.createElement('style');
        style.id = 'pulseStyle';
        style.textContent = `@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`;
        document.head.appendChild(style);
    }
});
