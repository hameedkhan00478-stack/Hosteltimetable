/**
 * Aurora (Profile Setup) - 6-step on-page wizard
 * - 2-second loader between steps
 * - Validations: name non-empty, platform selected, mobile format (+92 exact length 13 for Pakistan, else + with 10-15 digits), password min 8 and match
 * - Password trick: first two proceed attempts fail, third triggers 20s loading then redirect to eclipse.html
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Ensure user is logged in (99-char key exists) ---
    const currentUserKey = PX.getCurrentUserKey();
    if (!currentUserKey) {
        PX.showBilingualToast('Session expired. Please sign up again.', 'سیشن ختم ہوگیا۔ براہ کرم دوبارہ سائن اپ کریں۔');
        setTimeout(() => window.location.href = 'horizon.html', 1500);
        return;
    }

    // --- DOM Elements ---
    const steps = document.querySelectorAll('.step-container');
    const stepIndicators = document.querySelectorAll('.step');
    const nextBtns = document.querySelectorAll('.next-step');
    const prevBtns = document.querySelectorAll('.prev-step');
    const skipBtn = document.querySelector('.skip-step');
    const proceedBtn = document.getElementById('proceedBtn');
    const agreeCheckbox = document.getElementById('agreeCheckbox');
    const termsLink = document.getElementById('termsLink');
    const transitionLoader = document.getElementById('transitionLoader');
    const loaderMsgEng = document.getElementById('loaderMessageEng');
    const loaderMsgUrdu = document.getElementById('loaderMessageUrdu');

    // --- Input fields ---
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const aviatorSelect = document.getElementById('aviatorSelect');
    const inviteLinkInput = document.getElementById('inviteLink');
    const mobileInput = document.getElementById('mobileNumber');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // --- State ---
    let currentStep = 0; // 0-indexed
    let passwordAttempts = 0; // for final proceed button
    let collectedData = {
        firstName: '',
        lastName: '',
        aviatorName: '',
        inviteLink: '',
        mobileNumber: '',
        password: '' // we won't store actual password in final save (just a flag)
    };

    // --- Populate Aviator platforms (40+) ---
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
        aviatorSelect.appendChild(opt);
    });

    // --- Helper: Show/hide transition loader with custom message (for 2s step transitions) ---
    function showTransitionLoader(engMsg, urduMsg, duration = 2000, callback) {
        loaderMsgEng.textContent = engMsg;
        loaderMsgUrdu.textContent = urduMsg;
        transitionLoader.style.display = 'flex';
        setTimeout(() => {
            transitionLoader.style.display = 'none';
            if (callback) callback();
        }, duration);
    }

    // --- Step navigation with 2s loader ---
    function goToStep(stepIndex, skipValidation = false) {
        if (!skipValidation && !validateStep(currentStep)) return;
        // Show loader before moving
        showTransitionLoader('Loading next step...', 'اگلا مرحلہ لوڈ ہو رہا ہے...', 2000, () => {
            // Update step visibility
            steps.forEach((step, idx) => {
                step.classList.toggle('active', idx === stepIndex);
            });
            stepIndicators.forEach((ind, idx) => {
                ind.classList.toggle('active', idx === stepIndex);
            });
            currentStep = stepIndex;
        });
    }

    // --- Validate current step (return true/false, show error modal if fails) ---
    function validateStep(stepIdx) {
        switch(stepIdx) {
            case 0: // Name
                const first = firstNameInput.value.trim();
                const last = lastNameInput.value.trim();
                if (!first || !last) {
                    PX.showBilingualToast('Please enter both first and last name.', 'براہ کرم پہلا اور آخری نام دونوں درج کریں۔');
                    return false;
                }
                collectedData.firstName = first;
                collectedData.lastName = last;
                return true;
            case 1: // Aviator platform
                if (!aviatorSelect.value) {
                    PX.showBilingualToast('Please select an aviator platform.', 'براہ کرم ایک ایوی ایٹر پلیٹ فارم منتخب کریں۔');
                    return false;
                }
                collectedData.aviatorName = aviatorSelect.value;
                return true;
            case 2: // Invitation link (optional)
                collectedData.inviteLink = inviteLinkInput.value.trim();
                return true;
            case 3: // Mobile number with strict validation
                const mobile = mobileInput.value.trim();
                const mobileRegex = /^\+\d{10,15}$/; // basic
                if (!mobileRegex.test(mobile)) {
                    PX.showBilingualToast('Mobile must start with + and contain 10-15 digits.', 'موبائل نمبر + سے شروع ہو اور 10-15 ہندسوں پر مشتمل ہو۔');
                    return false;
                }
                // Pakistan specific: if starts with +92, must be exactly 13 characters total
                if (mobile.startsWith('+92') && mobile.length !== 13) {
                    PX.showBilingualToast('For Pakistan, mobile number must be exactly 13 characters (e.g., +923128942224).', 'پاکستان کے لیے موبائل نمبر بالکل 13 حروف کا ہونا چاہیے (مثال: +923128942224)۔');
                    return false;
                }
                collectedData.mobileNumber = mobile;
                return true;
            case 4: // Password & confirm
                const pwd = passwordInput.value;
                const conf = confirmPasswordInput.value;
                if (!pwd || !conf) {
                    PX.showBilingualToast('Please fill both password fields.', 'براہ کرم دونوں پاس ورڈ فیلڈز پر کریں۔');
                    return false;
                }
                if (pwd !== conf) {
                    PX.showBilingualToast('Passwords do not match.', 'پاس ورڈ مماثل نہیں ہیں۔');
                    return false;
                }
                if (pwd.length < 8) {
                    PX.showBilingualToast('Password must be at least 8 characters.', 'پاس ورڈ کم از کم 8 حروف کا ہونا چاہیے۔');
                    return false;
                }
                collectedData.password = pwd; // store temporarily for trick (not saved to localStorage)
                return true;
            default:
                return true;
        }
    }

    // --- Final proceed: password trick (first two attempts fail, third success) ---
    function handleFinalProceed() {
        if (!agreeCheckbox.checked) {
            PX.showBilingualToast('You must agree to the Terms & Privacy Policy.', 'آپ کو شرائط اور پرائیویسی پالیسی سے متفق ہونا ضروری ہے۔');
            return;
        }
        // Password trick
        passwordAttempts++;
        if (passwordAttempts < 3) {
            // First two attempts: show centered bilingual modal (using PX.showModal)
            PX.showModal(
                'Access Denied',
                'Incorrect password! Please enter the password to login into aviator.\n\nغلط پاس ورڈ! براہ کرم ایوی ایٹر میں لاگ ان کرنے کے لیے پاس ورڈ درج کریں۔',
                null, null, false
            );
            // Clear password fields for retry
            passwordInput.value = '';
            confirmPasswordInput.value = '';
            return;
        }
        // Third attempt: success - show 20-second loading then save profile and redirect to eclipse.html
        showTransitionLoader('Authenticating with satellite... 20 seconds', 'سیٹلائٹ سے تصدیق ہو رہی ہے... 20 سیکنڈ', 20000, () => {
            // Save all collected data to localStorage using PX.saveUser
            const profileData = {
                firstName: collectedData.firstName,
                lastName: collectedData.lastName,
                aviatorName: collectedData.aviatorName,
                inviteLink: collectedData.inviteLink,
                mobileNumber: collectedData.mobileNumber,
                profileCompleted: true,
                completedAt: Date.now()
            };
            PX.saveUser(currentUserKey, profileData);
            PX.showBilingualToast('Profile setup complete! Redirecting...', 'پروفائل سیٹ اپ مکمل! ری ڈائریکٹ ہو رہا ہے...');
            setTimeout(() => {
                window.location.href = 'eclipse.html';
            }, 1500);
        });
    }

    // --- Event Listeners for navigation ---
    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep < steps.length - 1) {
                goToStep(currentStep + 1);
            }
        });
    });
    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 0) {
                goToStep(currentStep - 1, true); // skip validation when going back
            }
        });
    });
    if (skipBtn) {
        skipBtn.addEventListener('click', () => {
            // Skip invitation step: move to next step
            if (currentStep === 2) {
                goToStep(currentStep + 1, true);
            }
        });
    }
    // Enable proceed button only when checkbox is checked
    agreeCheckbox.addEventListener('change', () => {
        proceedBtn.disabled = !agreeCheckbox.checked;
    });
    proceedBtn.addEventListener('click', handleFinalProceed);

    // Terms link: open orion.html (Terms page) in same tab
    if (termsLink) {
        termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'orion.html';
        });
    }

    // Initialize first step
    steps.forEach((step, idx) => {
        step.classList.toggle('active', idx === 0);
    });
    stepIndicators[0].classList.add('active');
    currentStep = 0;
});
