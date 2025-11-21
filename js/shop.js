// ===================================
// Shop System
// ===================================

// Initialize shop on page load
document.addEventListener('DOMContentLoaded', () => {
    initShop();
    checkPurchases();
    initMusicPlayer();
    updateBlossomVisibility();
});

const ADMIN_CODE = 'kati-admin';

// ===================================
// Shop State Management
// ===================================

function getShopState() {
    const saved = localStorage.getItem('studytok_shop');
    if (saved) {
        return JSON.parse(saved);
    }
    return {
        purchases: {
            rabattcode: false,
            achievement: false,
            music: false,
            blossoms: false
        },
        rabattcodeEmail: null,
        musicEnabled: true
    };
}

function saveShopState(state) {
    localStorage.setItem('studytok_shop', JSON.stringify(state));
}

// Get stats from main.js
function getStats() {
    const saved = localStorage.getItem('studytok_stats');
    if (saved) {
        return JSON.parse(saved);
    }
    return {
        sessions: 0,
        focusTime: 0,
        points: 0,
        streak: 1,
        lastLoginDate: new Date().toDateString(),
        achievements: 0,
        unlockedAchievements: [],
        dailyLoginClaimed: false
    };
}

function saveStats(stats) {
    localStorage.setItem('studytok_stats', JSON.stringify(stats));
}

// ===================================
// Shop UI Initialization
// ===================================

function initShop() {
    const shopTrigger = document.getElementById('shop-trigger');
    const shopModal = document.getElementById('shop-modal');
    const emailModal = document.getElementById('email-modal');

    if (!shopTrigger || !shopModal) return;

    // Open shop modal
    shopTrigger.addEventListener('click', () => {
        openModal(shopModal);
        updateShopUI();
    });

    // Close modals when clicking overlay or close button
    setupModalClose(shopModal);
    setupModalClose(emailModal);

    // Setup buy buttons
    const buyButtons = document.querySelectorAll('.shop-buy-btn');
    buyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemName = e.target.dataset.item;
            const price = parseInt(e.target.dataset.price);
            purchaseItem(itemName, price);
        });
    });

    // Setup email submit
    const emailSubmit = document.getElementById('email-submit');
    if (emailSubmit) {
        emailSubmit.addEventListener('click', submitEmail);
    }

    // Setup admin add points
    const adminAddPointsBtn = document.getElementById('admin-add-points-btn');
    if (adminAddPointsBtn) {
        adminAddPointsBtn.addEventListener('click', handleAdminPointsGrant);
    }
}

function handleAdminPointsGrant() {
    const amountInput = document.getElementById('admin-points-input');
    const codeInput = document.getElementById('admin-code-input');

    if (!amountInput || !codeInput) return;

    const amount = parseInt(amountInput.value, 10);
    const code = codeInput.value.trim();

    if (!code) {
        showNotification('Bitte gib den Admin-Code ein, um Punkte zu gutschreiben.', 'error');
        return;
    }

    if (code !== ADMIN_CODE) {
        showNotification('Falscher Admin-Code. Die Punkte wurden nicht gutgeschrieben.', 'error');
        return;
    }

    if (!amount || amount <= 0) {
        showNotification('Gib einen gültigen Punktebetrag ein.', 'error');
        return;
    }

    const updatedPoints = addPoints(amount);
    showNotification(`Dir wurden ${amount} Punkte gutgeschrieben. Gesamt: ${updatedPoints} Punkte.`, 'success');

    amountInput.value = '';
    codeInput.value = '';

    // Refresh shop UI so neue Käufe sofort möglich sind
    updateShopUI();
}

function setupModalClose(modal) {
    if (!modal) return;

    const closeBtn = modal.querySelector('.modal-close');

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeModal(modal);
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
}

function openModal(modal) {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('open');
    document.body.style.overflow = '';
}

// ===================================
// Purchase Logic
// ===================================

function purchaseItem(itemName, price) {
    const stats = getStats();
    const shopState = getShopState();

    // Check if already purchased
    if (shopState.purchases[itemName]) {
        showNotification('Du hast dieses Item bereits gekauft!', 'info');
        return;
    }

    // Check if enough points
    if (stats.points < price) {
        showNotification(`Du hast nicht genug Punkte! Du brauchst ${price} Punkte.`, 'error');
        return;
    }

    // Deduct points
    stats.points -= price;
    saveStats(stats);

    // Mark as purchased
    shopState.purchases[itemName] = true;
    saveShopState(shopState);

    // Update points display
    if (typeof updatePoints === 'function') {
        updatePoints();
    }

    // Handle specific item actions
    handleItemPurchase(itemName);

    // Update shop UI
    updateShopUI();

    showNotification('Erfolgreich gekauft!', 'success');
}

function handleItemPurchase(itemName) {
    const shopState = getShopState();

    switch(itemName) {
        case 'rabattcode':
            // Open email modal
            const shopModal = document.getElementById('shop-modal');
            const emailModal = document.getElementById('email-modal');
            closeModal(shopModal);
            openModal(emailModal);
            break;

        case 'achievement':
            // Unlock secret achievement
            unlockSecretAchievement();
            break;

        case 'music':
            // Show music toggle button
            showMusicToggle();
            break;

        case 'blossoms':
            // Show blossom rain
            updateBlossomVisibility();
            break;
    }
}

// ===================================
// Email Submission for Rabattcode
// ===================================

function submitEmail() {
    const emailInput = document.getElementById('email-input');
    const email = emailInput.value.trim();

    if (!email || !isValidEmail(email)) {
        showNotification('Bitte gib eine gültige E-Mail Adresse ein!', 'error');
        return;
    }

    const shopState = getShopState();
    shopState.rabattcodeEmail = email;
    saveShopState(shopState);

    // Send email (using mailto as a simple solution)
    sendEmailNotification(email);

    const emailModal = document.getElementById('email-modal');
    closeModal(emailModal);

    showNotification('E-Mail erfolgreich übermittelt! Du erhältst deinen Rabattcode in Kürze.', 'success');
    emailInput.value = '';
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function sendEmailNotification(userEmail) {
    // Create mailto link to send notification
    const subject = 'Neue Rabattcode-Anfrage - StudyTok';
    const body = `Ein Nutzer hat den Astra AI Rabattcode gekauft!\n\nE-Mail des Nutzers: ${userEmail}\n\nBitte sende den Rabattcode an diese Adresse.`;
    const mailtoLink = `mailto:20kwebshop@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open mailto link (this will open the user's email client)
    window.location.href = mailtoLink;
}

// ===================================
// Secret Achievement
// ===================================

function unlockSecretAchievement() {
    const stats = getStats();

    // Add secret achievement ID
    const secretAchievementId = 'filthy-rich';

    if (!stats.unlockedAchievements.includes(secretAchievementId)) {
        stats.unlockedAchievements.push(secretAchievementId);
        stats.achievements = stats.unlockedAchievements.length;
        saveStats(stats);

        // Show achievement notification
        showAchievementNotification();

        // Update achievement UI if on timer page
        if (typeof updateAchievementUI === 'function') {
            updateAchievementUI();
        }
    }
}

function showAchievementNotification() {
    // Create achievement notification
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-content">
            <div class="achievement-icon">💎</div>
            <div class="achievement-text">
                <div class="achievement-title">Achievement freigeschaltet!</div>
                <div class="achievement-name">Filthy Rich</div>
            </div>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// ===================================
// Background Music System
// ===================================

let backgroundMusic = null;

function initMusicPlayer() {
    const shopState = getShopState();

    if (shopState.purchases.music) {
        showMusicToggle();
        setupBackgroundMusic();
    }
}

function setupBackgroundMusic() {
    // Create audio element
    if (!backgroundMusic) {
        backgroundMusic = new Audio('audio/backgroundmusic.mp3');
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.3;
    }

    const shopState = getShopState();

    // Auto-play if enabled
    if (shopState.musicEnabled) {
        // Note: Auto-play might be blocked by browser
        backgroundMusic.play().catch(err => {
            console.log('Auto-play prevented:', err);
        });
    }
}

function showMusicToggle() {
    // Check if toggle already exists
    if (document.getElementById('music-toggle-btn')) {
        return;
    }

    // Create music toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'music-toggle-btn';
    toggleBtn.className = 'music-toggle-btn';
    toggleBtn.setAttribute('aria-label', 'Hintergrundmusik an/aus');

    const shopState = getShopState();
    toggleBtn.innerHTML = shopState.musicEnabled ? '🔊' : '🔇';

    document.body.appendChild(toggleBtn);

    toggleBtn.addEventListener('click', toggleMusic);
}

function toggleMusic() {
    const shopState = getShopState();
    shopState.musicEnabled = !shopState.musicEnabled;
    saveShopState(shopState);

    const toggleBtn = document.getElementById('music-toggle-btn');

    if (shopState.musicEnabled) {
        toggleBtn.innerHTML = '🔊';
        if (backgroundMusic) {
            backgroundMusic.play().catch(err => console.log('Play error:', err));
        }
    } else {
        toggleBtn.innerHTML = '🔇';
        if (backgroundMusic) {
            backgroundMusic.pause();
        }
    }
}

// ===================================
// Blossom Rain Control
// ===================================

function updateBlossomVisibility() {
    const shopState = getShopState();
    const blossomBackground = document.querySelector('.blossom-background');

    if (!blossomBackground) return;

    if (shopState.purchases.blossoms) {
        blossomBackground.style.display = 'block';
        // Regenerate petals if generateBlossomPetals function exists
        if (typeof generateBlossomPetals === 'function') {
            generateBlossomPetals();
        }
    } else {
        blossomBackground.style.display = 'none';
    }
}

// ===================================
// Shop UI Updates
// ===================================

function updateShopUI() {
    const shopState = getShopState();
    const stats = getStats();

    // Update each shop item
    Object.keys(shopState.purchases).forEach(itemName => {
        const shopItem = document.querySelector(`.shop-item[data-item="${itemName}"]`);
        if (!shopItem) return;

        const buyBtn = shopItem.querySelector('.shop-buy-btn');
        const purchasedLabel = shopItem.querySelector('.shop-item-purchased');

        if (shopState.purchases[itemName]) {
            // Already purchased
            buyBtn.style.display = 'none';
            purchasedLabel.style.display = 'block';
            shopItem.classList.add('purchased');
        } else {
            // Not purchased yet
            const price = parseInt(buyBtn.dataset.price);
            if (stats.points < price) {
                buyBtn.disabled = true;
                buyBtn.textContent = 'Nicht genug Punkte';
            } else {
                buyBtn.disabled = false;
                buyBtn.textContent = 'Kaufen';
            }
        }
    });
}

function checkPurchases() {
    const shopState = getShopState();

    // Check music
    if (shopState.purchases.music) {
        showMusicToggle();
    }

    // Check blossoms
    updateBlossomVisibility();
}

// ===================================
// Notification System
// ===================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `shop-notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}
