/**
 * Horizon (Landing) Logic
 * - Get Access: shows 2s loader then redirect to nebula.html
 * - Login: modal for 99-char key, validates via PX.getUser()
 */

document.addEventListener('DOMContentLoaded', () => {
    const getAccessBtn = document.getElementById('getAccessBtn');
    const loginBtn = document.getElementById('loginBtn');
    const loaderOverlay = document.getElementById('loaderOverlay');

    // Helper to show/hide loader
    function showLoader(show) {
        loaderOverlay.style.display = show ? 'flex' : 'none';
    }

    // Get Access button: show loader 2s then redirect
    if (getAccessBtn) {
        getAccessBtn.addEventListener('click', () => {
            showLoader(true);
            setTimeout(() => {
                window.location.href = 'nebula.html';
            }, 2000);
        });
    }

    // Login button: open modal to enter 99-char key
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            // Use PX.showModal with custom input
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal-container" style="max-width: 450px;">
                    <h3 style="color: var(--primary-red);"><i class="fas fa-lock"></i> Login with ID Key</h3>
                    <div class="bilingual">
                        <span class="english-text">Enter your 99‑character key</span>
                        <span class="urdu-text">اپنی 99 حروف کی کلید درج کریں</span>
                    </div>
                    <input type="text" id="loginKeyInput" placeholder="Paste your 99‑char key here..." maxlength="99" style="margin: 1rem 0; width: 100%;">
                    <div class="modal-buttons">
                        <button id="modalCancelBtn" class="btn-secondary">Cancel</button>
                        <button id="modalConfirmBtn" class="btn-primary">Verify & Enter</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
            setTimeout(() => overlay.classList.add('active'), 10);
            
            const input = overlay.querySelector('#loginKeyInput');
            const confirmBtn = overlay.querySelector('#modalConfirmBtn');
            const cancelBtn = overlay.querySelector('#modalCancelBtn');
            
            const closeModal = () => {
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 300);
            };
            
            confirmBtn.onclick = () => {
                const enteredKey = input.value.trim();
                if (!enteredKey) {
                    PX.showBilingualToast('Please enter your key', 'براہ کرم اپنی کلید درج کریں');
                    return;
                }
                const user = PX.getUser(enteredKey);
                if (user) {
                    PX.setCurrentUser(enteredKey);
                    closeModal();
                    PX.showBilingualToast('Access granted! Redirecting...', 'رسائی دی گئی! ری ڈائریکٹ ہو رہا ہے...');
                    setTimeout(() => {
                        window.location.href = 'pulsar.html';
                    }, 1500);
                } else {
                    PX.showBilingualToast('Invalid key. No account found.', 'غلط کلید۔ کوئی اکاؤنٹ نہیں ملا');
                    input.style.borderColor = '#ff0000';
                    setTimeout(() => input.style.borderColor = '', 1000);
                }
            };
            cancelBtn.onclick = closeModal;
            input.addEventListener('keypress', (e) => { if (e.key === 'Enter') confirmBtn.click(); });
        });
    }
});
