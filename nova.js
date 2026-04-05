/**
 * Nova (Access Plans & Reviews)
 * - Plan selection redirects to comet.html with plan param
 * - Key activation: 33->Basic, 44->Standard, 55->Premium
 * - Review system: 50 fake reviews with likes; free users cannot comment
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Authentication guard ---
    if (typeof PX !== 'undefined' && PX.checkAuth) {
        if (!PX.checkAuth('horizon.html')) return;
    } else {
        window.location.href = 'horizon.html';
        return;
    }

    // --- Check if user is VIP (subscription active) ---
    const isVip = PX.isSubscriptionActive();
    const currentUserKey = PX.getCurrentUserKey();

    // --- DOM Elements ---
    const selectPlanBtns = document.querySelectorAll('.select-plan-btn');
    const activateBtn = document.getElementById('activateKeyBtn');
    const accessKeyInput = document.getElementById('accessKeyInput');
    const submitReviewBtn = document.getElementById('submitReviewBtn');
    const reviewTextarea = document.getElementById('reviewText');
    const reviewsFeed = document.getElementById('reviewsFeed');

    // --- Star rating for review (local) ---
    let userRating = 0;
    const starSpans = document.querySelectorAll('#starRating span');
    function initStarRating() {
        starSpans.forEach(star => {
            star.addEventListener('mouseenter', function() {
                const val = parseInt(this.getAttribute('data-value'));
                highlightStars(val);
            });
            star.addEventListener('mouseleave', () => highlightStars(userRating));
            star.addEventListener('click', function() {
                userRating = parseInt(this.getAttribute('data-value'));
                highlightStars(userRating);
            });
        });
    }
    function highlightStars(rating) {
        starSpans.forEach((star, idx) => {
            if (idx < rating) {
                star.classList.add('active');
                star.textContent = '★';
            } else {
                star.classList.remove('active');
                star.textContent = '☆';
            }
        });
    }
    initStarRating();

    // --- Restrict comment for free users ---
    if (!isVip) {
        reviewTextarea.disabled = true;
        reviewTextarea.placeholder = "Only VIP members can leave reviews. / صرف وی آئی پی ممبران ہی ریویو دے سکتے ہیں۔";
        submitReviewBtn.disabled = true;
        submitReviewBtn.style.opacity = '0.5';
        submitReviewBtn.style.cursor = 'not-allowed';
        // Add click handler to show modal if free user tries to focus or click
        reviewTextarea.addEventListener('click', () => {
            PX.showModal(
                'Restricted Access',
                'Only VIP members can leave reviews.\n\nصرف وی آئی پی ممبران ہی ریویو دے سکتے ہیں۔',
                null, null, false
            );
        });
        submitReviewBtn.addEventListener('click', () => {
            PX.showModal(
                'Restricted Access',
                'Only VIP members can leave reviews.\n\nصرف وی آئی پی ممبران ہی ریویو دے سکتے ہیں۔',
                null, null, false
            );
        });
    } else {
        // VIP users can submit
        submitReviewBtn.addEventListener('click', () => {
            if (userRating === 0) {
                PX.showBilingualToast('Please select a star rating.', 'براہ کرم ستارہ ریٹنگ منتخب کریں۔');
                return;
            }
            const comment = reviewTextarea.value.trim();
            if (!comment) {
                PX.showBilingualToast('Please write a review.', 'براہ کرم ایک ریویو لکھیں۔');
                return;
            }
            // Save user's own review (persist in localStorage)
            const userReview = {
                id: 'user_' + Date.now(),
                name: (PX.getUser(currentUserKey)?.firstName || 'User') + ' ' + (PX.getUser(currentUserKey)?.lastName || ''),
                badge: 'premium', // since only VIP can comment
                stars: userRating,
                text: comment,
                likes: 0,
                timestamp: new Date().toLocaleDateString()
            };
            // Store in localStorage
            let userReviews = JSON.parse(localStorage.getItem('_nova_user_reviews') || '[]');
            userReviews.unshift(userReview);
            localStorage.setItem('_nova_user_reviews', JSON.stringify(userReviews));
            // Clear form
            reviewTextarea.value = '';
            userRating = 0;
            highlightStars(0);
            PX.showBilingualToast('Review posted! Thank you.', 'ریویو پوسٹ ہوگیا! شکریہ۔');
            renderReviews();
        });
    }

    // --- Generate fake reviews (50+) with realistic names and badges ---
    const firstNames = ["Aarav","Zain","Sofia","Olivia","Muhammad","Rahul","Fatima","Emily","David","Priya","Ahmed","Liam","Noor","Hassan","Aisha","John","Emma","Ali","Sara","Vikram","Kabir","Mei","Chen","Raj","Simran","James","Maria","Carlos","Anita","Abdullah","Zara","Omar","Layla","Michael","Sarah","Chris","Jessica","Bilal","Nadia","Ravi","Tariq","Shan","Gurpreet","Faisal","Kamila","Yusuf","Iqbal","Leila","Daniyal"];
    const lastNames = ["Khan","Sharma","Singh","Patel","Ahmed","Ali","Chen","Kumar","Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green"];
    const reviewTexts = [
        "Amazing accuracy! Recovered my losses quickly.",
        "Best detector I've ever used. Premium is worth it.",
        "Works like magic. Signals are always on point.",
        "Easy to use, but sometimes the activation takes a moment.",
        "I've tripled my bankroll in 2 days. Incredible tool.",
        "The radar sweep is so realistic. Love it.",
        "Customer support via WhatsApp is super responsive.",
        "Standard plan gave me consistent 10x signals.",
        "Finally a predictor that actually works. Thank you!",
        "The countdown feature is nerve-wracking but rewarding."
    ];
    function randomName() { return firstNames[Math.floor(Math.random()*firstNames.length)] + ' ' + lastNames[Math.floor(Math.random()*lastNames.length)]; }
    function randomBadge() { const r = Math.random(); if(r<0.5) return 'premium'; if(r<0.8) return 'standard'; return 'basic'; }
    function randomStars() { const r = Math.random(); if(r<0.7) return 5; if(r<0.9) return 4; return 3; }
    function randomLikes() { return Math.floor(Math.random() * 1200) + 50; }

    let fakeReviews = [];
    for (let i = 0; i < 50; i++) {
        fakeReviews.push({
            id: i,
            name: randomName(),
            badge: randomBadge(),
            stars: randomStars(),
            text: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
            likes: randomLikes(),
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()
        });
    }
    // Sort by likes desc
    fakeReviews.sort((a,b) => b.likes - a.likes);

    // Load user reviews from localStorage
    let userReviews = JSON.parse(localStorage.getItem('_nova_user_reviews') || '[]');
    // Track liked reviews per user (prevent double like)
    let likedReviews = JSON.parse(localStorage.getItem('_nova_liked') || '[]');

    function renderReviews() {
        reviewsFeed.innerHTML = '';
        // Show user reviews first
        [...userReviews, ...fakeReviews.slice(0, 40)].forEach(review => {
            const starsFull = '★'.repeat(review.stars) + '☆'.repeat(5-review.stars);
            const isLiked = likedReviews.includes(review.id);
            const likeText = isLiked ? '❤️' : '🤍';
            const div = document.createElement('div');
            div.className = 'review-card';
            div.innerHTML = `
                <div class="review-header">
                    <span class="reviewer-name">${review.name}</span>
                    <span class="review-badge ${review.badge}">${review.badge.toUpperCase()}</span>
                </div>
                <div class="review-stars">${starsFull}</div>
                <div class="review-text">${review.text}</div>
                <div class="review-footer">
                    <span>📅 ${review.timestamp}</span>
                    <button class="like-btn" data-id="${review.id}">${likeText} ${review.likes} Likes</button>
                </div>
            `;
            const likeBtn = div.querySelector('.like-btn');
            likeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (likedReviews.includes(review.id)) {
                    PX.showBilingualToast('You already liked this review.', 'آپ پہلے ہی اس ریویو کو لائک کر چکے ہیں۔');
                    return;
                }
                // Increment like count
                if (userReviews.some(r => r.id === review.id)) {
                    const idx = userReviews.findIndex(r => r.id === review.id);
                    userReviews[idx].likes += 1;
                    localStorage.setItem('_nova_user_reviews', JSON.stringify(userReviews));
                } else {
                    const idx = fakeReviews.findIndex(r => r.id === review.id);
                    if (idx !== -1) fakeReviews[idx].likes += 1;
                }
                likedReviews.push(review.id);
                localStorage.setItem('_nova_liked', JSON.stringify(likedReviews));
                renderReviews();
                PX.showBilingualToast('Like added!', 'لائک شامل کر دیا گیا!');
            });
            reviewsFeed.appendChild(div);
        });
    }
    renderReviews();

    // --- Plan Selection: redirect to comet.html with plan parameter ---
    selectPlanBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const plan = btn.getAttribute('data-plan');
            window.location.href = `comet.html?plan=${plan}`;
        });
    });

    // --- Key Activation Logic (33->Basic, 44->Standard, 55->Premium) ---
    function activateKey() {
        const key = accessKeyInput.value.trim();
        if (!key) {
            PX.showBilingualToast('Please enter a key.', 'براہ کرم کلید درج کریں۔');
            return;
        }
        let plan = null;
        let durationMs = 0;
        if (key.length === 33 && PX.isValidKey(key, 33)) {
            plan = 'basic';
            durationMs = 60 * 60 * 1000; // 1 hour
        } else if (key.length === 44 && PX.isValidKey(key, 44)) {
            plan = 'standard';
            durationMs = 24 * 60 * 60 * 1000;
        } else if (key.length === 55 && PX.isValidKey(key, 55)) {
            plan = 'premium';
            durationMs = 72 * 60 * 60 * 1000;
        } else {
            PX.showBilingualToast('Invalid key format or length.', 'غلط کلید فارمیٹ یا لمبائی۔');
            return;
        }
        const expiry = Date.now() + durationMs;
        PX.saveSubscription(expiry, plan);
        PX.showModal(
            'Activation Successful',
            `You now have ${plan.toUpperCase()} access for ${plan === 'basic' ? '1 hour' : plan === 'standard' ? '24 hours' : '72 hours'}.\nRedirecting to dashboard...`,
            () => { window.location.href = 'pulsar.html'; },
            null, false
        );
    }
    if (activateBtn) activateBtn.addEventListener('click', activateKey);
    accessKeyInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') activateKey(); });
});
