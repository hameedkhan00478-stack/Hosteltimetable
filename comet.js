/**
 * Comet (Payment Simulation)
 * - Only Easypaisa works; others show offline modal
 * - TRX trick: first two attempts fail, third succeeds
 * - Generates key based on plan from URL (33/44/55)
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Authentication guard ---
    if (typeof PX !== 'undefined' && PX.checkAuth) {
        if (!PX.checkAuth('horizon.html')) return;
    } else {
        window.location.href = 'horizon.html';
        return;
    }

    // --- Get plan from URL (?plan=basic/standard/premium) ---
    const urlParams = new URLSearchParams(window.location.search);
    const plan = urlParams.get('plan') || 'basic'; // default to basic
    let expectedKeyLength = 33;
    let planDisplay = 'Basic';
    if (plan === 'standard') { expectedKeyLength = 44; planDisplay = 'Standard'; }
    else if (plan === 'premium') { expectedKeyLength = 55; planDisplay = 'Premium'; }

    // --- DOM elements ---
    const methodCards = document.querySelectorAll('.method-card');
    const paymentWorkflow = document.getElementById('paymentWorkflow');
    const connectorLoader = document.getElementById('connectorLoader');
    const paymentInstructions = document.getElementById('paymentInstructions');
    const trxInput = document.getElementById('trxInput');
    const confirmBtn = document.getElementById('confirmPaymentBtn');
    const paymentLoader = document.getElementById('paymentLoader');
    const successArea = document.getElementById('successArea');
    const generatedKeySpan = document.getElementById('generatedKeyDisplay');
    const copyKeyBtn = document.getElementById('copyKeyBtn');
    const backToPlansBtn = document.getElementById('backToPlansBtn');

    // --- TRX attempt counter (reset when workflow shown) ---
    let trxAttempts = 0;
    let currentGeneratedKey = '';

    // --- Helper: reset UI for new payment attempt ---
    function resetPaymentUI() {
        trxAttempts = 0;
        trxInput.value = '';
        paymentLoader.style.display = 'none';
        successArea.style.display = 'none';
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'CONFIRM PAYMENT / ادائیگی کی تصدیق کریں';
    }

    // --- Handle method selection ---
    methodCards.forEach(card => {
        card.addEventListener('click', () => {
            const method = card.getAttribute('data-method');
            if (method === 'easypaisa') {
                // Show Easypaisa workflow with 4s loader
                paymentWorkflow.style.display = 'block';
                resetPaymentUI();
                paymentInstructions.style.display = 'none';
                connectorLoader.style.display = 'flex';
                setTimeout(() => {
                    connectorLoader.style.display = 'none';
                    paymentInstructions.style.display = 'block';
                }, 4000);
            } else {
                // Offline method: show modal
                PX.showModal(
                    'Service Unavailable',
                    'This server is currently busy in your area. Please use the accessible method (Easypaisa).\n\nیہ سرور آپ کے علاقے میں فی الحال مصروف ہے۔ براہ کرم دستیاب طریقہ (ایزی پیسہ) استعمال کریں۔',
                    null, null, false
                );
            }
        });
    });

    // --- TRX confirmation logic (2 fails, 3rd success) ---
    async function handleConfirmPayment() {
        const trxId = trxInput.value.trim();
        if (!trxId) {
            PX.showBilingualToast('Please enter a TRX ID.', 'براہ کرم TRX ID درج کریں۔');
            return;
        }
        trxAttempts++;
        if (trxAttempts < 3) {
            // First two attempts: show 5s spinner then error modal
            confirmBtn.disabled = true;
            paymentLoader.style.display = 'block';
            const loaderMsg = document.querySelector('#paymentLoader .bilingual');
            if (loaderMsg) {
                loaderMsg.querySelector('.english-text').textContent = 'Verifying transaction...';
                loaderMsg.querySelector('.urdu-text').textContent = 'لین دین کی تصدیق ہو رہی ہے...';
            }
            await new Promise(resolve => setTimeout(resolve, 5000));
            paymentLoader.style.display = 'none';
            confirmBtn.disabled = false;
            PX.showModal(
                'Verification Failed',
                'Invalid TRX ID. Verification failed.\n\nغلط ٹی آر ایکس آئی ڈی۔ تصدیق ناکام ہوگئی۔',
                null, null, false
            );
            trxInput.value = '';
        } else {
            // Third attempt: success after 15s loading
            confirmBtn.disabled = true;
            paymentLoader.style.display = 'block';
            const loaderMsg = document.querySelector('#paymentLoader .bilingual');
            if (loaderMsg) {
                loaderMsg.querySelector('.english-text').textContent = 'Verifying with Easypaisa Mainframe...';
                loaderMsg.querySelector('.urdu-text').textContent = 'ایزی پیسہ مین فریم سے تصدیق ہو رہی ہے...';
            }
            await new Promise(resolve => setTimeout(resolve, 15000));
            paymentLoader.style.display = 'none';
            // Generate key based on plan
            if (plan === 'basic') currentGeneratedKey = PX.generateKey33();
            else if (plan === 'standard') currentGeneratedKey = PX.generateKey44();
            else currentGeneratedKey = PX.generateKey55();
            generatedKeySpan.textContent = currentGeneratedKey;
            successArea.style.display = 'block';
            confirmBtn.disabled = true;
            PX.showBilingualToast('Payment confirmed! Key generated.', 'ادائیگی کی تصدیق ہوگئی! کلید بن گئی۔');
        }
    }

    confirmBtn.addEventListener('click', handleConfirmPayment);

    // --- Copy generated key ---
    async function copyKey() {
        if (currentGeneratedKey) {
            await navigator.clipboard.writeText(currentGeneratedKey);
            PX.showBilingualToast('Access key copied!', 'ایکسیس کلید کاپی ہوگئی!');
        }
    }
    copyKeyBtn.addEventListener('click', copyKey);

    // --- Back to plans page (nova.html) ---
    backToPlansBtn.addEventListener('click', () => {
        window.location.href = 'nova.html';
    });
});
