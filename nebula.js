/**
 * Nebula (Signup) Logic
 * - Generate 99-char key with 3-second loading animation
 * - Copy key to clipboard
 * - Paste confirmation enables signup button
 * - On signup, save user and redirect to aurora.html
 */

document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateKeyBtn');
    const keyDisplayArea = document.getElementById('keyDisplayArea');
    const generatedKeySpan = document.getElementById('generatedKey');
    const copyBtn = document.getElementById('copyKeyBtn');
    const pasteInput = document.getElementById('pasteKeyInput');
    const signupBtn = document.getElementById('signupSubmitBtn');
    const keyLoader = document.getElementById('keyLoader');

    let currentGeneratedKey = '';

    // Helper to show/hide loader
    function showLoader(show) {
        keyLoader.style.display = show ? 'flex' : 'none';
    }

    // Generate key button
    if (generateBtn) {
        generateBtn.addEventListener('click', () => {
            showLoader(true);
            setTimeout(() => {
                currentGeneratedKey = PX.generateKey99();
                generatedKeySpan.textContent = currentGeneratedKey;
                keyDisplayArea.style.display = 'block';
                pasteInput.value = '';
                signupBtn.disabled = true;
                showLoader(false);
                PX.showBilingualToast(
                    'Key generated! Copy and paste below to confirm.',
                    'کلید بن گئی! تصدیق کے لیے نیچے کاپی اور پیسٹ کریں۔'
                );
            }, 3000); // 3-second loading as requested
        });
    }

    // Copy key to clipboard
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            if (!currentGeneratedKey) {
                PX.showBilingualToast('No key to copy yet.', 'ابھی تک کوئی کلید نہیں بنی۔');
                return;
            }
            try {
                await navigator.clipboard.writeText(currentGeneratedKey);
                PX.showBilingualToast('Key copied to clipboard!', 'کلید کلپ بورڈ پر کاپی ہوگئی!');
                copyBtn.innerHTML = '<i class="fas fa-check"></i> COPIED';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> COPY';
                }, 2000);
            } catch (err) {
                PX.showBilingualToast('Failed to copy. Select manually.', 'کاپی نہیں ہو سکی۔ دستی طور پر منتخب کریں۔');
            }
        });
    }

    // Paste confirmation: enable signup only if matches
    if (pasteInput) {
        pasteInput.addEventListener('input', () => {
            const pasted = pasteInput.value.trim();
            if (pasted === currentGeneratedKey && currentGeneratedKey !== '') {
                signupBtn.disabled = false;
                pasteInput.style.borderColor = '#00ff00';
            } else {
                signupBtn.disabled = true;
                pasteInput.style.borderColor = pasted.length > 0 ? '#ff0000' : '';
            }
        });
    }

    // Signup & Continue
    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            if (!currentGeneratedKey) return;

            // Check if key already exists (should not, but safety)
            if (PX.getUser(currentGeneratedKey)) {
                PX.showBilingualToast(
                    'This key already exists. Generate a new one.',
                    'یہ کلید پہلے سے موجود ہے۔ نئی کلید بنائیں۔'
                );
                return;
            }

            // Save empty profile placeholder (will be completed in aurora.html)
            PX.saveUser(currentGeneratedKey, {
                key: currentGeneratedKey,
                createdAt: Date.now(),
                profileCompleted: false
            });

            // Set as current logged-in user
            PX.setCurrentUser(currentGeneratedKey);
            PX.showBilingualToast(
                'Signup successful! Redirecting to profile setup...',
                'سائن اپ کامیاب! پروفائل سیٹ اپ پر ری ڈائریکٹ ہو رہا ہے...'
            );

            setTimeout(() => {
                window.location.href = 'aurora.html';
            }, 1500);
        });
    }
});
