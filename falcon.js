/**
 * Falcon (Invite & Earn) - WhatsApp sharing simulation with progress tracking
 * - Tracks share count in localStorage (_falcon_count, _falcon_timestamp)
 * - First share sends message to owner (+923128942224)
 * - Subsequent shares (up to 5) increment progress
 * - After 5 shares, shows confirmation modal and disables button for 24h
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
    const whatsappBtn = document.getElementById('whatsappShareBtn');
    const progressFill = document.getElementById('progressFill');
    const progressCounter = document.getElementById('progressCounter');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const referralInput = document.getElementById('referralLink');

    // --- localStorage keys (obfuscated) ---
    const STORAGE_COUNT = '_fc_7x';    // share count
    const STORAGE_TIMESTAMP = '_ft_9y'; // timestamp when button was disabled

    // --- Website URL (current domain + horizon.html) ---
    const siteUrl = window.location.origin + '/horizon.html';
    referralInput.value = siteUrl;

    // --- Helper: update progress bar UI ---
    function updateProgressUI(count) {
        const percent = (count / 5) * 100;
        progressFill.style.width = `${percent}%`;
        progressCounter.textContent = `${count} / 5`;
    }

    // --- Helper: check if button is in cooldown (24h) ---
    function isCooldownActive() {
        const cooldownEnd = localStorage.getItem(STORAGE_TIMESTAMP);
        if (!cooldownEnd) return false;
        return Date.now() < parseInt(cooldownEnd);
    }

    // --- Helper: activate cooldown for 24 hours ---
    function startCooldown() {
        const cooldownUntil = Date.now() + (24 * 60 * 60 * 1000);
        localStorage.setItem(STORAGE_TIMESTAMP, cooldownUntil);
        if (whatsappBtn) {
            whatsappBtn.classList.add('disabled');
            whatsappBtn.disabled = true;
        }
        // Show modal with message
        PX.showModal(
            'Verification Pending',
            'After owner confirmation, 5000 PKR will be added to your profile.\n\nتصدیق زیر التواء ہے! مالک کی تصدیق کے بعد، 5000 روپے آپ کے پروفائل میں شامل کر دیے جائیں گے۔',
            null, null, false
        );
    }

    // --- Load current share count from localStorage ---
    let currentShares = parseInt(localStorage.getItem(STORAGE_COUNT) || '0');
    updateProgressUI(currentShares);

    // --- If already completed 5 shares, check cooldown ---
    if (currentShares >= 5) {
        if (isCooldownActive()) {
            whatsappBtn.classList.add('disabled');
            whatsappBtn.disabled = true;
        } else {
            // Cooldown expired, reset count
            currentShares = 0;
            localStorage.setItem(STORAGE_COUNT, '0');
            updateProgressUI(0);
            whatsappBtn.classList.remove('disabled');
            whatsappBtn.disabled = false;
        }
    } else if (isCooldownActive()) {
        // Cooldown active but not completed? rare case: disable button
        whatsappBtn.classList.add('disabled');
        whatsappBtn.disabled = true;
    }

    // --- Helper: save new share count and update UI ---
    function incrementShareCount() {
        currentShares++;
        localStorage.setItem(STORAGE_COUNT, currentShares);
        updateProgressUI(currentShares);
        return currentShares;
    }

    // --- WhatsApp share logic ---
    function handleWhatsAppShare() {
        // Prevent if cooldown active or already completed 5 shares
        if (currentShares >= 5 || isCooldownActive()) {
            if (currentShares >= 5) {
                PX.showBilingualToast(
                    'You have already completed 5 shares. Check back after 24 hours.',
                    'آپ پہلے ہی 5 شیئرز مکمل کر چکے ہیں۔ 24 گھنٹے بعد دوبارہ چیک کریں۔'
                );
            }
            return;
        }

        // Determine if this is the first share ever (count == 0)
        const isFirstShare = (currentShares === 0);

        let whatsappUrl = '';
        if (isFirstShare) {
            // First share: send message to owner
            const ownerNumber = '923128942224'; // without '+'
            const message = `Hello Dark Echo, I want to make money by inviting people to PeshoX. ${siteUrl}`;
            whatsappUrl = `https://wa.me/${ownerNumber}?text=${encodeURIComponent(message)}`;
        } else {
            // Subsequent shares: share to any contact (standard share)
            const message = `Check out PeshoX Intelligence - the most accurate Aviator detector! ${siteUrl}`;
            whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        }

        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank');

        // After a short delay (simulate return), increment share count
        // We'll use a setTimeout to simulate user returning from WhatsApp
        // In reality, we rely on page visibility? For simplicity, we increment after 2 seconds
        // but we also set a flag to prevent double increment on same click.
        if (!isFirstShare) {
            // For non-first shares, increment after user returns focus (simulate)
            const hadFocus = true;
            setTimeout(() => {
                const newCount = incrementShareCount();
                if (newCount === 5) {
                    startCooldown();
                } else {
                    PX.showBilingualToast(
                        `Share counted! Progress: ${newCount}/5`,
                        `شیئر شمار ہوگیا! پیشرفت: ${newCount}/5`
                    );
                }
            }, 2000);
        } else {
            // First share: increment only once (also counts toward progress)
            setTimeout(() => {
                const newCount = incrementShareCount();
                PX.showBilingualToast(
                    `First share sent to owner! Progress: ${newCount}/5`,
                    `پہلا شیئر مالک کو بھیج دیا گیا! پیشرفت: ${newCount}/5`
                );
            }, 2000);
        }

        // Disable button temporarily to prevent double counting (re-enable after 3 seconds)
        whatsappBtn.disabled = true;
        setTimeout(() => {
            if (currentShares < 5 && !isCooldownActive()) {
                whatsappBtn.disabled = false;
            }
        }, 3000);
    }

    // --- Copy referral link ---
    async function copyReferralLink() {
        try {
            await navigator.clipboard.writeText(referralInput.value);
            PX.showBilingualToast('Referral link copied!', 'ریفرل لنک کاپی ہوگیا!');
        } catch (err) {
            PX.showBilingualToast('Failed to copy. Select manually.', 'کاپی نہیں ہو سکی۔ دستی طور پر منتخب کریں۔');
        }
    }

    // --- Event listeners ---
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', handleWhatsAppShare);
    }
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', copyReferralLink);
    }
});
