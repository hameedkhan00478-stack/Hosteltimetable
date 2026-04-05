/**
 * Eclipse (20s loading screen)
 * - Circular progress ring that fills over exactly 20 seconds
 * - Rotating bilingual status messages every 3 seconds
 * - Checks authentication before showing
 * - Redirects to pulsar.html after completion
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Security: only logged-in users can access this page ---
    if (typeof PX !== 'undefined' && PX.checkAuth) {
        if (!PX.checkAuth('horizon.html')) return;
    } else {
        window.location.href = 'horizon.html';
        return;
    }

    // --- DOM elements ---
    const statusEng = document.getElementById('statusMessageEng');
    const statusUrdu = document.getElementById('statusMessageUrdu');
    const progressRing = document.querySelector('.progress-ring-fill');
    const pingAudio = document.getElementById('pingSound');

    // --- Constants ---
    const TOTAL_DURATION = 20000; // 20 seconds
    const CIRCUMFERENCE = 2 * Math.PI * 80; // r=80 => ~502.6548
    let startTime = null;
    let animationFrame = null;
    let messageInterval = null;

    // --- Bilingual message pairs (English, Urdu) ---
    const messagePairs = [
        { eng: "Connecting to Satellite...", urdu: "سیٹلائٹ سے منسلک ہو رہا ہے..." },
        { eng: "Bypassing Firewall...", urdu: "فائر وال کو بائی پاس کیا جا رہا ہے..." },
        { eng: "Syncing with Aviator Core...", urdu: "ایوی ایٹر کور کے ساتھ ہم آہنگ ہو رہا ہے..." },
        { eng: "Calibrating Radar Sensors...", urdu: "رڈار سینسرز کی کیلیبریشن ہو رہی ہے..." },
        { eng: "Finalizing Encryption...", urdu: "انکرپشن کو حتمی شکل دی جا رہی ہے..." },
        { eng: "Loading Neural Networks...", urdu: "نیورل نیٹ ورکس لوڈ ہو رہے ہیں..." },
        { eng: "Verifying Integrity...", urdu: "انٹیگریٹی کی تصدیق ہو رہی ہے..." },
        { eng: "Almost ready...", urdu: "تقریبا تیار..." }
    ];

    let currentMessageIndex = 0;

    // --- Function to change status message (every 3 seconds) ---
    function rotateMessage() {
        currentMessageIndex = (currentMessageIndex + 1) % messagePairs.length;
        const pair = messagePairs[currentMessageIndex];
        statusEng.textContent = pair.eng;
        statusUrdu.textContent = pair.urdu;
        
        // Optional: play ping sound if available
        if (pingAudio) {
            pingAudio.currentTime = 0;
            pingAudio.play().catch(e => console.log("Audio play blocked:", e));
        }
    }

    // --- Progress ring update based on elapsed time ---
    function updateProgress(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(1, elapsed / TOTAL_DURATION);
        const offset = CIRCUMFERENCE * (1 - progress);
        progressRing.style.strokeDashoffset = offset;
        
        if (elapsed < TOTAL_DURATION) {
            animationFrame = requestAnimationFrame(updateProgress);
        } else {
            // Complete: set to 0 offset (full ring)
            progressRing.style.strokeDashoffset = 0;
            finishLoading();
        }
    }

    // --- Finish loading: stop intervals, redirect to pulsar.html ---
    function finishLoading() {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        if (messageInterval) clearInterval(messageInterval);
        
        // Final status update
        statusEng.textContent = "Access Granted. Redirecting...";
        statusUrdu.textContent = "رسائی دی گئی۔ ری ڈائریکٹ ہو رہا ہے...";
        
        setTimeout(() => {
            window.location.href = 'pulsar.html';
        }, 800);
    }

    // --- Start the loading sequence ---
    function startLoading() {
        // Set initial ring state
        progressRing.style.strokeDasharray = CIRCUMFERENCE;
        progressRing.style.strokeDashoffset = CIRCUMFERENCE;
        
        // Start progress animation
        startTime = null;
        animationFrame = requestAnimationFrame(updateProgress);
        
        // Rotate messages every 3 seconds
        messageInterval = setInterval(rotateMessage, 3000);
        
        // Set first message immediately
        const firstPair = messagePairs[0];
        statusEng.textContent = firstPair.eng;
        statusUrdu.textContent = firstPair.urdu;
    }

    // Start everything
    startLoading();
});
