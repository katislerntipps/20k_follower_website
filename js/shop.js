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

// SECURITY: Admin-Code ist nun als SHA-256 Hash gespeichert
// Um einen neuen Admin-Code zu setzen, nutze: await hashAdminCode('dein-neuer-code')
// Aktueller Hash ist für: 'kati-admin-2025'
const ADMIN_CODE_HASH = '802ada2759abdc90e8fd574f7e731d8ee954ab0722127d3ac0b08f567df079a4';

// TODO: WICHTIG! Dieser Code sollte später vom Server kommen!
// Für Produktion: Erstelle eine Server-API die den Code generiert und validiert
const DISCOUNT_CODE = 'T-E-S-T-1-2-3';
const MUSIC_STATE_KEY = 'studytok_music_state';

// ===================================
// SECURITY: Admin-Code Hashing
// ===================================

/**
 * Hash einen String mit SHA-256
 * @param {string} text - Der zu hashende Text
 * @returns {Promise<string>} Hex-String des Hashes
 */
async function hashString(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

/**
 * Verifiziere den Admin-Code
 * @param {string} inputCode - Der eingegebene Code
 * @returns {Promise<boolean>} True wenn korrekt
 */
async function verifyAdminCode(inputCode) {
    if (!inputCode || typeof inputCode !== 'string') {
        return false;
    }

    try {
        const inputHash = await hashString(inputCode.trim());
        return inputHash === ADMIN_CODE_HASH;
    } catch (error) {
        console.error('Fehler bei Admin-Code Verifikation:', error);
        return false;
    }
}

/**
 * Hilfsfunktion zum Generieren eines neuen Admin-Code Hashes
 * Nutze das in der Browser-Console: await hashAdminCode('dein-code')
 * @param {string} code - Der neue Admin-Code
 */
async function hashAdminCode(code) {
    const hash = await hashString(code);
    console.log('Neuer Admin-Code Hash:', hash);
    console.log('Ersetze ADMIN_CODE_HASH in shop.js mit diesem Wert');
    return hash;
}

// ===================================
// SAFE STORAGE HELPERS
// ===================================

function safeGetItem(key, fallback = null) {
    try {
        const value = localStorage.getItem(key);
        return value !== null ? value : fallback;
    } catch (error) {
        console.warn(`[Storage] Konnte ${key} nicht auslesen, nutze Fallback.`, error);
        return fallback;
    }
}

function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.warn(`[Storage] Konnte ${key} nicht speichern.`, error);
    }
}

function safeParseJSON(value, fallback, label = 'Wert') {
    try {
        return JSON.parse(value);
    } catch (error) {
        console.warn(`[Storage] Konnte ${label} nicht parsen, nutze Fallback.`, error);
        return fallback;
    }
}

// ===================================
// Shop State Management
// ===================================

function getShopState() {
    const defaultState = {
        purchases: {
            rabattcode: false,
            achievement: false,
            music: false,
            blossoms: false
        },
        musicEnabled: true,
        musicVolume: 0.3
    };

    const saved = safeGetItem('studytok_shop');
    if (saved) {
        const state = safeParseJSON(saved, { ...defaultState }, 'studytok_shop');

        if (state.musicVolume === undefined) {
            state.musicVolume = 0.3;
        }

        return state;
    }
    return defaultState;
}

function saveShopState(state) {
    safeSetItem('studytok_shop', JSON.stringify(state));
}

function getSavedMusicState() {
    const defaultState = { currentTime: 0, isPlaying: false };

    try {
        const saved = sessionStorage.getItem(MUSIC_STATE_KEY);
        return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
    } catch (error) {
        console.warn('Konnte Musik-Status nicht laden:', error);
        return defaultState;
    }
}

function saveCurrentMusicState() {
    if (!backgroundMusic) return;

    const state = {
        currentTime: backgroundMusic.currentTime,
        isPlaying: !backgroundMusic.paused
    };

    try {
        sessionStorage.setItem(MUSIC_STATE_KEY, JSON.stringify(state));
    } catch (error) {
        console.warn('Konnte Musik-Status nicht speichern:', error);
    }
}

// Get stats from main.js
function getStats() {
    const defaultStats = {
        sessions: 0,
        focusTime: 0,
        points: 0,
        streak: 1,
        lastLoginDate: new Date().toDateString(),
        achievements: 0,
        unlockedAchievements: [],
        dailyLoginClaimed: false
    };

    const saved = safeGetItem('studytok_stats');
    if (saved) {
        return safeParseJSON(saved, { ...defaultStats }, 'studytok_stats');
    }
    return defaultStats;
}

function saveStats(stats) {
    safeSetItem('studytok_stats', JSON.stringify(stats));
}

// ===================================
// Shop UI Initialization
// ===================================

function initShop() {
    const shopTrigger = document.getElementById('shop-trigger');
    const shopModal = document.getElementById('shop-modal');

    if (!shopTrigger || !shopModal) return;

    // Open shop modal
    shopTrigger.addEventListener('click', () => {
        openModal(shopModal);
        updateShopUI();
    });

    // Close modals when clicking overlay or close button
    setupModalClose(shopModal);

    // Setup buy buttons
    const buyButtons = document.querySelectorAll('.shop-buy-btn');
    buyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const itemName = e.target.dataset.item;
            const price = parseInt(e.target.dataset.price);
            purchaseItem(itemName, price);
        });
    });

    // Setup discount code modal
    const discountModal = document.getElementById('discount-modal');
    setupModalClose(discountModal);

    const showDiscountButtons = document.querySelectorAll('[data-action="show-discount-code"]');
    showDiscountButtons.forEach(button => {
        button.addEventListener('click', () => showDiscountCode());
    });

    // Setup admin add points
    const adminAddPointsBtn = document.getElementById('admin-add-points-btn');
    if (adminAddPointsBtn) {
        adminAddPointsBtn.addEventListener('click', handleAdminPointsGrant);
    }
}

async function handleAdminPointsGrant() {
    const amountInput = document.getElementById('admin-points-input');
    const codeInput = document.getElementById('admin-code-input');

    if (!amountInput || !codeInput) return;

    const amount = parseInt(amountInput.value, 10);
    const code = codeInput.value.trim();

    if (!code) {
        showNotification('Bitte gib den Admin-Code ein, um Punkte zu gutschreiben.', 'error');
        return;
    }

    // Zeige Loading-Indikator während Verifikation
    const originalButtonText = document.getElementById('admin-add-points-btn')?.textContent;
    const addButton = document.getElementById('admin-add-points-btn');
    if (addButton) {
        addButton.disabled = true;
        addButton.textContent = 'Prüfe Code...';
    }

    // SECURITY: Async Verifikation mit Hash
    const isValid = await verifyAdminCode(code);

    // Setze Button zurück
    if (addButton) {
        addButton.disabled = false;
        addButton.textContent = originalButtonText || 'Punkte gutschreiben';
    }

    if (!isValid) {
        showNotification('Falscher Admin-Code. Die Punkte wurden nicht gutgeschrieben.', 'error');
        // Lösche Eingabe bei falschem Code
        codeInput.value = '';
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

async function purchaseItem(itemName, price) {
    const stats = getStats();
    const shopState = getShopState();

    // Check if already purchased
    if (shopState.purchases[itemName]) {
        if (typeof showEnhancedNotification === 'function') {
            showEnhancedNotification('Du hast dieses Item bereits gekauft!', 'info');
        } else {
            showNotification('Du hast dieses Item bereits gekauft!', 'info');
        }
        return;
    }

    // Check if enough points
    if (stats.points < price) {
        const needed = price - stats.points;
        if (typeof showEnhancedNotification === 'function') {
            showEnhancedNotification(
                `Du hast nicht genug Punkte! Du brauchst noch ${needed} Punkte mehr.`,
                'error',
                { duration: 4000 }
            );
        } else {
            showNotification(`Du hast nicht genug Punkte! Du brauchst ${price} Punkte.`, 'error');
        }
        return;
    }

    // LOADING STATE: Zeige Loading während Kauf
    let loader = null;
    if (typeof showLoading === 'function') {
        loader = showLoading('Kaufe Item...');
    }

    // Simuliere kurze Verzögerung für bessere UX (gibt Zeit für Feedback)
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
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

        // Hide loader
        if (typeof hideLoading === 'function') {
            hideLoading();
        }

        // Success notification
        if (typeof showEnhancedNotification === 'function') {
            showEnhancedNotification('Erfolgreich gekauft!', 'success', { duration: 2000 });
        } else {
            showNotification('Erfolgreich gekauft!', 'success');
        }
    } catch (error) {
        console.error('Fehler beim Kauf:', error);

        // Hide loader
        if (typeof hideLoading === 'function') {
            hideLoading();
        }

        // Error notification
        if (typeof showEnhancedNotification === 'function') {
            showEnhancedNotification(
                'Fehler beim Kauf. Bitte versuche es erneut.',
                'error',
                {
                    actionText: 'Nochmal versuchen',
                    onAction: () => purchaseItem(itemName, price)
                }
            );
        } else {
            showNotification('Fehler beim Kauf!', 'error');
        }
    }
}

function handleItemPurchase(itemName) {
    const shopState = getShopState();

    switch(itemName) {
        case 'rabattcode':
            const shopModal = document.getElementById('shop-modal');
            closeModal(shopModal);
            showDiscountCode();
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
// Rabattcode Anzeige
// ===================================

function showDiscountCode() {
    const discountModal = document.getElementById('discount-modal');
    const codeTarget = document.getElementById('discount-code-text');

    if (codeTarget) {
        codeTarget.textContent = DISCOUNT_CODE;
    }

    openModal(discountModal);
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

        // Show achievement notification without overriding the main handler
        showSecretAchievementNotification();

        // Update achievement UI if on timer page
        if (typeof updateAchievementUI === 'function') {
            updateAchievementUI();
        }
    }
}

function showSecretAchievementNotification() {
    // SECURITY: Verwende DOM-Manipulation statt innerHTML
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';

    const content = document.createElement('div');
    content.className = 'achievement-content';

    const icon = document.createElement('div');
    icon.className = 'achievement-icon';
    icon.textContent = '💎';

    const textDiv = document.createElement('div');
    textDiv.className = 'achievement-text';

    const title = document.createElement('div');
    title.className = 'achievement-title';
    title.textContent = 'Achievement freigeschaltet!';

    const name = document.createElement('div');
    name.className = 'achievement-name';
    name.textContent = 'Filthy Rich';

    textDiv.appendChild(title);
    textDiv.appendChild(name);

    content.appendChild(icon);
    content.appendChild(textDiv);

    notification.appendChild(content);

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
let musicPersistenceInitialized = false;

function initMusicPlayer() {
    const shopState = getShopState();

    if (shopState.purchases.music) {
        setupMusicPersistence();
        showMusicToggle();
        setupBackgroundMusic();
    }
}

function setupMusicPersistence() {
    if (musicPersistenceInitialized) return;

    window.addEventListener('beforeunload', saveCurrentMusicState);
    musicPersistenceInitialized = true;
}

function setupBackgroundMusic() {
    const savedMusicState = getSavedMusicState();

    // Create audio element with optimized format selection
    if (!backgroundMusic) {
        backgroundMusic = new Audio();
        backgroundMusic.loop = true;
        const shopState = getShopState();
        backgroundMusic.volume = shopState.musicVolume ?? 0.3;

        // PERFORMANCE: Wähle bestes verfügbares Audio-Format
        // WebM/Opus: Beste Kompression (~900KB), moderne Browser
        // MP3: Universelle Kompatibilität (~1.5MB wenn optimiert)
        if (backgroundMusic.canPlayType('audio/webm; codecs="opus"')) {
            backgroundMusic.src = 'audio/backgroundmusic.webm';
            console.log('🎵 Using WebM/Opus (optimal compression)');
        } else if (backgroundMusic.canPlayType('audio/ogg; codecs="vorbis"')) {
            backgroundMusic.src = 'audio/backgroundmusic.ogg';
            console.log('🎵 Using OGG/Vorbis (good compression)');
        } else {
            backgroundMusic.src = 'audio/backgroundmusic.mp3';
            console.log('🎵 Using MP3 (universal fallback)');
        }

        backgroundMusic.addEventListener('loadedmetadata', () => applySavedMusicState(savedMusicState));
        backgroundMusic.addEventListener('play', saveCurrentMusicState);
        backgroundMusic.addEventListener('pause', saveCurrentMusicState);
        backgroundMusic.addEventListener('timeupdate', saveCurrentMusicState);

        // Error handling
        backgroundMusic.addEventListener('error', (e) => {
            console.error('Audio-Fehler:', e);
            console.log('Versuche Fallback zu MP3...');

            // Fallback to MP3 if primary format fails
            if (!backgroundMusic.src.endsWith('.mp3')) {
                backgroundMusic.src = 'audio/backgroundmusic.mp3';
            }
        });
    }

    const shopState = getShopState();
    applySavedMusicState(savedMusicState);

    // Auto-play if enabled
    const shouldPlay = savedMusicState.isPlaying ?? shopState.musicEnabled;

    if (shopState.musicEnabled && shouldPlay) {
        // Note: Auto-play might be blocked by browser
        backgroundMusic.play().catch(err => {
            console.log('Auto-play prevented:', err);
        });
    }
}

function applySavedMusicState(savedMusicState) {
    if (!backgroundMusic || !savedMusicState) return;

    const targetTime = Math.max(0, savedMusicState.currentTime || 0);

    if (backgroundMusic.readyState >= 1) {
        setMusicTimeSafely(targetTime);
    } else {
        const setTimeHandler = () => {
            setMusicTimeSafely(targetTime);
            backgroundMusic.removeEventListener('loadedmetadata', setTimeHandler);
        };
        backgroundMusic.addEventListener('loadedmetadata', setTimeHandler);
    }
}

function setMusicTimeSafely(targetTime) {
    if (!backgroundMusic || Number.isNaN(targetTime)) return;

    const duration = backgroundMusic.duration;

    if (Number.isFinite(duration) && duration > 0) {
        backgroundMusic.currentTime = Math.min(targetTime, duration - 0.1);
    } else {
        backgroundMusic.currentTime = targetTime;
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

    createMusicVolumeControl(shopState.musicVolume ?? 0.3, shopState.musicEnabled);
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
        setMusicVolumeControlDisabled(false);
    } else {
        toggleBtn.innerHTML = '🔇';
        if (backgroundMusic) {
            backgroundMusic.pause();
        }
        setMusicVolumeControlDisabled(true);
    }
}

function createMusicVolumeControl(initialVolume, isEnabled) {
    if (document.querySelector('.music-volume-control')) {
        return;
    }

    const container = document.createElement('div');
    container.className = 'music-volume-control';

    const label = document.createElement('label');
    label.className = 'music-volume-label';
    label.textContent = `Lautstärke: ${Math.round(initialVolume * 100)}%`;
    label.setAttribute('for', 'music-volume-slider');

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '100';
    slider.value = Math.round(initialVolume * 100).toString();
    slider.id = 'music-volume-slider';
    slider.className = 'music-volume-slider';
    slider.setAttribute('aria-label', 'Lautstärke der Hintergrundmusik einstellen');
    slider.disabled = !isEnabled;

    slider.addEventListener('input', (event) => {
        const volume = parseInt(event.target.value, 10) / 100;
        updateMusicVolume(volume);
        label.textContent = `Lautstärke: ${Math.round(volume * 100)}%`;
    });

    container.appendChild(label);
    container.appendChild(slider);
    document.body.appendChild(container);
}

function updateMusicVolume(volume) {
    const shopState = getShopState();
    shopState.musicVolume = volume;
    saveShopState(shopState);

    if (backgroundMusic) {
        backgroundMusic.volume = volume;
    }
}

function setMusicVolumeControlDisabled(isDisabled) {
    const slider = document.getElementById('music-volume-slider');
    if (!slider) return;
    slider.disabled = isDisabled;
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

            if (itemName === 'rabattcode') {
                const codeSection = shopItem.querySelector('.discount-code-inline');
                if (codeSection) {
                    codeSection.style.display = 'block';
                }
            }
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
