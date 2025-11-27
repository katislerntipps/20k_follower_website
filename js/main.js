// ===================================
// MAIN.JS - Homepage Functionality
// ===================================

// Import analytics
import analytics from './modules/analytics.js';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Track page view
    analytics.trackPageView();

    applySakuraTheme();
    renderCherryTree();
    generateBlossomPetals();
    setupHomeTreeAnimation();
    initializeStats();
    updatePoints();
    updateTreeDisplay();
    initializeDarkMode();
    initializeMobileMenu();
    initializePointsHistory();
    initializeFloatingTimer();
    initializeMusicRewards();
});

function applySakuraTheme() {
    document.body.classList.add('sakura-theme');
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
// STATS MANAGEMENT
// ===================================

function initializeStats() {
    // Get stats from localStorage or initialize
    const stats = getStats();

    // Update display
    updateStatsDisplay(stats);
}

function getStats() {
    const defaultStats = {
        sessions: 0,
        focusTime: 0,
        streak: 1,
        achievements: 0,
        points: 0,
        lastActive: new Date().toDateString(),
        unlockedAchievements: [],
        sessionsToday: 0,
        lastSessionDate: new Date().toDateString(),
        consecutiveSessions: 0,
        dailyLoginClaimed: false
    };

    const stored = safeGetItem('studytok_stats');
    const stats = stored ? safeParseJSON(stored, { ...defaultStats }, 'studytok_stats') : { ...defaultStats };

    if (stats) {

        // Ensure new properties exist
        if (!stats.unlockedAchievements) stats.unlockedAchievements = [];
        if (!stats.sessionsToday) stats.sessionsToday = 0;
        if (!stats.lastSessionDate) stats.lastSessionDate = new Date().toDateString();
        if (!stats.consecutiveSessions) stats.consecutiveSessions = 0;
        if (stats.dailyLoginClaimed === undefined) stats.dailyLoginClaimed = false;

        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

        // Check if it's a new day
        if (stats.lastActive !== today) {
            const lastActiveDate = new Date(stats.lastActive);
            const todayDate = new Date(today);
            const daysDiff = Math.floor((todayDate - lastActiveDate) / (1000 * 60 * 60 * 24));

            // Update streak based on days passed
            if (daysDiff === 1) {
                // User was active yesterday - continue streak
                stats.streak += 1;

                // Award streak bonus points every 7 days
                if (stats.streak % 7 === 0) {
                    stats.points += 25;
                    showDailyStreakNotification(stats.streak);
                }
            } else if (daysDiff > 1) {
                // User missed a day - reset streak
                stats.streak = 1;
            }

            // Reset daily counters
            stats.sessionsToday = 0;
            stats.dailyLoginClaimed = false;
            stats.lastActive = today;

            saveStats(stats);
        }

        return stats;
    }

    saveStats(defaultStats);
    return defaultStats;
}

function saveStats(stats) {
    safeSetItem('studytok_stats', JSON.stringify(stats));
}

function updateStatsDisplay(stats) {
    // Only update stats on the homepage
    if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
        return;
    }

    // Update stat cards
    const sessionElement = document.querySelector('.stat-card:nth-child(1) .stat-value');
    const timeElement = document.querySelector('.stat-card:nth-child(2) .stat-value');
    const streakElement = document.querySelector('.stat-card:nth-child(3) .stat-value');
    const achievementElement = document.querySelector('.stat-card:nth-child(4) .stat-value');

    if (sessionElement) sessionElement.textContent = stats.sessions;
    if (timeElement) timeElement.textContent = `${stats.focusTime} Min`;
    if (streakElement) streakElement.textContent = stats.streak;
    if (achievementElement) achievementElement.textContent = stats.achievements;
}

function updatePoints() {
    const stats = getStats();
    const pointsElements = document.querySelectorAll('.points-value');
    pointsElements.forEach(el => {
        el.textContent = stats.points;
    });
}

// Global helper zum Hinzufügen von Punkten (für alle Seiten)
function addPoints(points) {
    const stats = getStats();
    stats.points += points;
    saveStats(stats);
    updatePoints();
    return stats.points;
}

// Make addPoints globally available
window.addPoints = addPoints;

// ===================================
// FLOATING TIMER (GLOBAL)
// ===================================

function initializeFloatingTimer() {
    // Avoid showing the floating timer on the dedicated timer page
    const isTimerPage = window.location.pathname.endsWith('timer.html');
    if (isTimerPage) return;

    const existing = document.getElementById('floating-timer');
    if (existing) existing.remove();

    const floatingTimer = document.createElement('div');
    floatingTimer.id = 'floating-timer';
    floatingTimer.setAttribute('aria-live', 'polite');
    floatingTimer.innerHTML = `
        <div class="floating-timer-content">
            <div class="floating-timer-running">⏱️ Läuft</div>
            <div class="floating-timer-label">
                <div class="floating-timer-mode" id="floating-timer-mode">Fokus</div>
                <div class="floating-timer-status" id="floating-timer-status">Der Timer zählt weiter</div>
            </div>
            <div class="floating-timer-time" id="floating-timer-time">25:00</div>
            <button class="floating-timer-link" type="button" aria-label="Zum Timer wechseln">Zum Timer</button>
        </div>
    `;

    document.body.appendChild(floatingTimer);

    const timeEl = floatingTimer.querySelector('#floating-timer-time');
    const modeEl = floatingTimer.querySelector('#floating-timer-mode');
    const statusEl = floatingTimer.querySelector('#floating-timer-status');
    const linkBtn = floatingTimer.querySelector('.floating-timer-link');

    linkBtn.addEventListener('click', () => {
        window.location.href = 'timer.html';
    });

    const modeLabels = {
        focus: 'Fokus',
        short: 'Kurze Pause',
        long: 'Lange Pause'
    };

    function getStoredTimer() {
        const stored = safeGetItem('studytok_timer');
        if (!stored) return null;
        return safeParseJSON(stored, null, 'studytok_timer');
    }

    function formatTime(totalSeconds) {
        const safeSeconds = Math.max(0, totalSeconds);
        const minutes = Math.floor(safeSeconds / 60);
        const seconds = safeSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    function updateFloatingTimer() {
        const state = getStoredTimer();

        if (!state || !state.isRunning || !state.endTime) {
            floatingTimer.style.display = 'none';
            return;
        }

        const remainingSeconds = Math.max(0, Math.round((state.endTime - Date.now()) / 1000));
        timeEl.textContent = formatTime(remainingSeconds);
        modeEl.textContent = modeLabels[state.mode] || 'Timer';

        if (remainingSeconds === 0) {
            statusEl.textContent = 'Session abgeschlossen';
        } else {
            statusEl.textContent = 'Der Timer läuft weiter';
        }

        floatingTimer.style.display = 'flex';
    }

    updateFloatingTimer();
    setInterval(updateFloatingTimer, 1000);
    window.addEventListener('storage', updateFloatingTimer);
}

// ===================================
// TREE STATE MANAGEMENT
// ===================================

function getTreeState() {
    const defaultTreeState = {
        level: 1,
        blossoms: 0,
        totalSessions: 0
    };

    const stored = safeGetItem('studytok_tree');
    if (stored) {
        return safeParseJSON(stored, { ...defaultTreeState }, 'studytok_tree');
    }

    return { ...defaultTreeState };
}

function getLevelEmoji(level) {
    switch(level) {
        case 1: return '🌱';
        case 2: return '🌿';
        case 3: return '🌳';
        case 4: return '🌸';
        case 5: return '🌸🌸';
        default: return level > 5 ? '🌸🌸' : '🌱';
    }
}

function isTreeAnimationUnlocked() {
    const treeState = getTreeState();
    return treeState.level >= 5;
}

function updateTreeDisplay() {
    // Only update tree display on the homepage
    if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
        return;
    }

    const treeState = getTreeState();

    // Update tree level
    const treeLevelElement = document.querySelector('.tree-level');
    if (treeLevelElement) {
        const levelEmoji = getLevelEmoji(treeState.level);
        treeLevelElement.textContent = `Level ${treeState.level} ${levelEmoji}`;
    }

    // Update tree progress
    const treeProgressElement = document.querySelector('.tree-progress');
    if (treeProgressElement) {
        const nextLevel = treeState.level + 1;
        treeProgressElement.textContent = `${treeState.blossoms} / 5 Sessions bis Level ${nextLevel}`;
    }

    // Update level image
    updateHomeLevelImage(treeState.level);
}

function updateHomeLevelImage(level) {
    const levelImage = document.getElementById('home-level-image');
    if (!levelImage) return;

    // Level 1-5: show corresponding image, Level 5+: always show 5.png
    const imageNumber = Math.min(level, 5);
    levelImage.src = `image/${imageNumber}.png`;
    levelImage.alt = `Level ${level} Bild`;
}

function getPointsRules() {
    return [
        {
            icon: '🍅',
            title: 'Focus-Session abschließen',
            description: 'Beende eine 25-minütige Pomodoro-Session',
            points: 10
        },
        {
            icon: '💡',
            title: 'Lerntipp generieren',
            description: 'Lass dir einen neuen Lerntipp anzeigen',
            points: 2
        },
        {
            icon: '🎯',
            title: 'Täglicher Login',
            description: 'Melde dich jeden Tag an',
            points: 15
        },
        {
            icon: '📝',
            title: 'Lernplan erstellen',
            description: 'Plane deine Lernziele für die Woche',
            points: 30
        },
        {
            icon: '🔥',
            title: 'Streak aufbauen',
            description: 'Lerne mehrere Tage hintereinander',
            points: 25
        },
        {
            icon: '🎵',
            title: 'Fokusmusik nutzen',
            description: 'Starte eine Session mit Fokusmusik',
            points: 5
        }
    ];
}

function renderPointsRules() {
    const list = document.querySelector('#points-history-modal .history-list');
    if (!list) return;

    list.innerHTML = '';
    const rules = getPointsRules();

    rules.forEach(rule => {
        const li = document.createElement('li');
        li.className = 'history-item';

        // SECURITY: Verwende DOM-Manipulation statt innerHTML
        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.alignItems = 'flex-start';
        container.style.gap = '12px';

        const iconSpan = document.createElement('span');
        iconSpan.style.fontSize = '24px';
        iconSpan.style.lineHeight = '1';
        iconSpan.textContent = rule.icon;

        const textDiv = document.createElement('div');

        const title = document.createElement('p');
        title.className = 'history-title';
        title.textContent = rule.title;

        const description = document.createElement('p');
        description.className = 'history-meta';
        description.textContent = rule.description;

        textDiv.appendChild(title);
        textDiv.appendChild(description);

        container.appendChild(iconSpan);
        container.appendChild(textDiv);

        const pointsSpan = document.createElement('span');
        pointsSpan.className = 'history-points';
        pointsSpan.textContent = `+${rule.points}`;

        li.appendChild(container);
        li.appendChild(pointsSpan);
        list.appendChild(li);
    });
}

function initializePointsHistory() {
    const trigger = document.getElementById('points-history-trigger');
    const modal = document.getElementById('points-history-modal');
    if (!trigger || !modal) return;

    const closeBtn = modal.querySelector('.modal-close');
    const openModal = () => {
        renderPointsRules();
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    trigger.addEventListener('click', openModal);
    trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal();
        }
    });

    closeBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });
}

// ===================================
// MUSIK & YT REWARD SYSTEM
// ===================================

const MUSIC_REWARD_STORAGE_KEY = 'studytok_music_last_reward';
const MUSIC_REWARD_COOLDOWN_MS = 30 * 60 * 1000; // 30 Minuten
const MUSIC_REWARD_POINTS = 5;

function initializeMusicRewards() {
    const isMusicPage = window.location.pathname.endsWith('musik.html');
    if (!isMusicPage) return;

    const musicLinks = document.querySelectorAll('section.dashboard a.btn, section.features a.btn');
    if (!musicLinks.length) return;

    musicLinks.forEach(link => {
        link.addEventListener('click', () => {
            handleMusicReward();
        });
    });
}

function handleMusicReward() {
    const now = Date.now();
    const lastReward = parseInt(safeGetItem(MUSIC_REWARD_STORAGE_KEY, '0') || '0', 10);
    const timeSinceLastReward = now - lastReward;

    if (timeSinceLastReward < MUSIC_REWARD_COOLDOWN_MS) {
        const remainingMs = MUSIC_REWARD_COOLDOWN_MS - timeSinceLastReward;
        const remainingMinutes = Math.ceil(remainingMs / 60000);
        showNotification(`Du kannst in ${remainingMinutes} Min. wieder Musik-Punkte sammeln.`, 'error');
        return;
    }

    addPoints(MUSIC_REWARD_POINTS);
    safeSetItem(MUSIC_REWARD_STORAGE_KEY, now.toString());
    showNotification('🎵 +5 Punkte für Fokusmusik! Weiter so.', 'success');
}

// ===================================
// TREE ANIMATIONS
// ===================================

function generateBlossomPetals() {
    const container = document.querySelector('.blossom-background');
    if (!container) return;

    // Check if blossom rain is purchased
    const shopState = safeGetItem('studytok_shop');
    if (shopState) {
        const shop = safeParseJSON(shopState, {}, 'studytok_shop') || {};
        const purchases = shop.purchases || {};

        if (!purchases.blossoms) {
            container.style.display = 'none';
            container.innerHTML = '';
            return;
        }
    } else {
        // Not purchased yet, hide it
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }

    // Show container if purchased
    container.style.display = 'block';

    const petalCount = 24;
    const randomBetween = (min, max) => Math.random() * (max - min) + min;

    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('span');
        petal.className = 'petal asset-petal';
        petal.style.setProperty('--x', `${Math.round(Math.random() * 100)}%`);
        petal.style.setProperty('--duration', `${randomBetween(14, 24)}s`);
        petal.style.setProperty('--delay', `${randomBetween(0, 10)}s`);
        petal.style.setProperty('--drift', `${randomBetween(-90, 90)}px`);
        petal.style.setProperty('--size', `${randomBetween(14, 24)}px`);
        container.appendChild(petal);
    }
}

function renderCherryTree() {
    const treeStage = document.getElementById('home-cherry-tree');
    if (!treeStage) return;

    const petalLayer = treeStage.parentElement?.querySelector('.hero-floating-petals');
    if (!isTreeAnimationUnlocked()) {
        if (petalLayer) {
            petalLayer.innerHTML = '';
        }
        return;
    }

    if (petalLayer && !petalLayer.children.length) {
        const petalTotal = 10;
        for (let i = 0; i < petalTotal; i++) {
            const petal = document.createElement('span');
            petal.className = 'floating-petal';
            petal.style.setProperty('--x', `${Math.random() * 90}%`);
            petal.style.setProperty('--duration', `${12 + Math.random() * 6}s`);
            petal.style.setProperty('--delay', `${Math.random() * 6}s`);
            petalLayer.appendChild(petal);
        }
    }
}

function setupHomeTreeAnimation() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const stage = document.getElementById('home-cherry-tree');
    if (!stage) return;

    if (!isTreeAnimationUnlocked()) return;

    const trunk = stage.querySelector('.tree-layer-trunk');
    const branches = stage.querySelector('.tree-layer-branches');
    const blooms = stage.querySelector('.tree-layer-blooms');
    const glow = stage.querySelector('.tree-layer-glow');
    const petals = stage.parentElement?.querySelectorAll('.hero-floating-petals .floating-petal');

    gsap.set(stage, { opacity: 0, y: 18, scale: 0.96 });

    const swayTl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut', duration: 5 } });
    swayTl
        .to(trunk, { rotate: 1.2, xPercent: -0.2 }, 0)
        .to(branches, { rotate: -1.4, xPercent: 0.6 }, 0)
        .to(blooms, { rotate: 1.6, xPercent: -0.8 }, 0.1);

    ScrollTrigger.create({
        trigger: '#home-cherry-tree',
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => swayTl.timeScale(0.8 + self.progress * 0.6)
    });

    const parallaxTl = gsap.timeline({
        scrollTrigger: {
            trigger: '#home-cherry-tree',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
        }
    });

    parallaxTl
        .fromTo(trunk, { yPercent: 0 }, { yPercent: 8 }, 0)
        .fromTo(branches, { yPercent: -4 }, { yPercent: 12 }, 0)
        .fromTo(blooms, { yPercent: -10, scale: 1.01 }, { yPercent: 16, scale: 1.045 }, 0)
        .fromTo(glow, { yPercent: -14, scale: 1 }, { yPercent: 20, scale: 1.08 }, 0);

    const intro = gsap.timeline({
        scrollTrigger: {
            trigger: '#home-cherry-tree',
            start: 'top 80%',
            toggleActions: 'play none none reverse'
        }
    });

    intro
        .to(stage, { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out' })
        .from(trunk, { opacity: 0, y: 40, duration: 0.8, ease: 'power1.out' }, '-=0.7')
        .from(branches, { opacity: 0, y: 24, duration: 0.9, ease: 'power1.out' }, '-=0.4')
        .from(blooms, { opacity: 0, scale: 0.85, filter: 'blur(8px)', duration: 0.9, ease: 'back.out(1.4)' }, '-=0.3')
        .to(glow, { opacity: 0.28, duration: 0.6 }, '-=0.5');

    if (petals?.length) {
        gsap.fromTo(petals, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'sine.out', delay: 0.4, scrollTrigger: {
            trigger: '#home-cherry-tree',
            start: 'top 82%'
        }});

        const petalSequence = gsap.timeline({
            repeat: -1,
            repeatDelay: gsap.utils.random(6, 8)
        }).fromTo(petals, {
            opacity: 0.9,
            y: -8,
            rotate: () => gsap.utils.random(-14, 14),
            skewX: () => gsap.utils.random(-8, 8)
        }, {
            opacity: 1,
            y: 8,
            rotate: () => gsap.utils.random(12, 26),
            skewX: () => gsap.utils.random(-12, 12),
            duration: 2.4,
            ease: 'sine.inOut',
            stagger: { each: 0.18, from: 'random' }
        });

        ScrollTrigger.create({
            trigger: '#home-cherry-tree',
            start: 'top 82%',
            onEnter: () => petalSequence.restart(true),
            onEnterBack: () => petalSequence.restart(true),
            onLeave: () => petalSequence.pause(),
            onLeaveBack: () => petalSequence.pause()
        });
    }
}

// ===================================
// FEATURE CARD INTERACTIONS
// ===================================

// Lerntipp Generator Button (nur auf Homepage)
const generateTipBtn = document.querySelector('.feature-card:nth-child(1) .btn-outline');
if (generateTipBtn && (window.location.pathname.endsWith('index.html') || window.location.pathname === '/')) {
    generateTipBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'tipps.html';
    });
}

// ===================================
// VIDEO CARDS HOVER EFFECTS
// ===================================

const videoCards = document.querySelectorAll('.video-card');
videoCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// ===================================
// SMOOTH SCROLL
// ===================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===================================
// UTILITY FUNCTIONS
// ===================================

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#4CAF50' : '#FF5252'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Make showNotification globally available
window.showNotification = showNotification;

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===================================
// DAILY LOGIN & STREAK SYSTEM
// ===================================

function checkDailyLogin() {
    const stats = getStats();

    // Award daily login points if not yet claimed today
    if (!stats.dailyLoginClaimed) {
        stats.dailyLoginClaimed = true;
        stats.points += 15;
        saveStats(stats);
        updatePoints();

        // Show daily login notification
        setTimeout(() => {
            showNotification(`🎯 Täglicher Login! +15 Punkte | Streak: ${stats.streak} Tag${stats.streak > 1 ? 'e' : ''}`, 'success');
        }, 1000);

        // Check for daily login achievement (first login)
        checkDailyLoginAchievement();
    }
}

function showDailyStreakNotification(streak) {
    setTimeout(() => {
        showNotification(`🔥 ${streak} Tage Streak erreicht! +25 Punkte`, 'success');
    }, 1500);
}

function checkDailyLoginAchievement() {
    const stats = getStats();

    // Check if "daily-login" achievement exists and is not yet unlocked
    if (!stats.unlockedAchievements.includes('daily-login')) {
        // Unlock the achievement
        stats.unlockedAchievements.push('daily-login');
        stats.achievements = stats.unlockedAchievements.length;
        saveStats(stats);

        // Show achievement notification
        setTimeout(() => {
            showAchievementUnlockNotification({
                id: 'daily-login',
                name: 'Jeden Tag ein Bisschen',
                description: 'Erster täglicher Login',
                emoji: '🌅'
            });
        }, 2000);
    }
}

function showAchievementUnlockNotification(achievement) {
    // Create achievement unlock popup
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.8);
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.98) 0%, rgba(118, 75, 162, 0.98) 100%);
        color: white;
        padding: 2.5rem;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        z-index: 10001;
        text-align: center;
        min-width: 300px;
        max-width: 400px;
        animation: achievementPopIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        border: 3px solid rgba(255, 255, 255, 0.3);
    `;

    popup.innerHTML = `
        <div style="font-size: 4rem; margin-bottom: 1rem; animation: achievementBounce 0.6s ease-out 0.3s;">${achievement.emoji}</div>
        <h3 style="
            font-family: 'Poppins', sans-serif;
            font-size: 1.8rem;
            margin: 0 0 0.5rem 0;
            font-weight: 700;
            text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        ">Achievement freigeschaltet!</h3>
        <h4 style="
            font-family: 'Poppins', sans-serif;
            font-size: 1.3rem;
            margin: 0 0 0.5rem 0;
            font-weight: 600;
        ">${achievement.name}</h4>
        <p style="
            font-family: 'Quicksand', sans-serif;
            font-size: 1rem;
            margin: 0;
            opacity: 0.95;
            font-weight: 500;
        ">${achievement.description}</p>
    `;

    document.body.appendChild(popup);

    // Add animations if not already present
    if (!document.getElementById('achievement-animations')) {
        const achievementStyle = document.createElement('style');
        achievementStyle.id = 'achievement-animations';
        achievementStyle.textContent = `
            @keyframes achievementPopIn {
                0% {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.5);
                }
                100% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }
            @keyframes achievementBounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }
            @keyframes achievementFadeOut {
                from {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                to {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8);
                }
            }
        `;
        document.head.appendChild(achievementStyle);
    }

    // Auto-remove after 4 seconds
    setTimeout(() => {
        popup.style.animation = 'achievementFadeOut 0.4s ease-out forwards';
        setTimeout(() => popup.remove(), 400);
    }, 4000);
}

// Call daily login check when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other initializations
    setTimeout(checkDailyLogin, 500);
});

// ===================================
// DARK MODE FUNCTIONALITY
// ===================================

function initializeDarkMode() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = safeGetItem('studytok_theme', 'light');

    // Apply saved theme
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Toggle event
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    safeSetItem('studytok_theme', newTheme);
    updateThemeIcon(newTheme);

    // Force repaint für Mobile Browser (besonders Safari/WebKit)
    // Dies behebt das Problem, dass Farben erst nach Scrollen richtig angezeigt werden
    forceRepaint();
}

function forceRepaint() {
    // Methode 1: Force reflow durch Lesen von offsetHeight
    void document.body.offsetHeight;

    // Methode 2: RequestAnimationFrame für sauberes Repaint
    requestAnimationFrame(() => {
        // Trigger layout recalculation
        document.body.style.transform = 'translateZ(0)';
        requestAnimationFrame(() => {
            document.body.style.transform = '';
        });
    });
}

function updateThemeIcon(theme) {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const isDark = theme === 'dark';
        themeToggle.classList.toggle('is-dark', isDark);
        themeToggle.setAttribute('aria-pressed', isDark);
        themeToggle.setAttribute('aria-label', isDark ? 'Light Mode aktivieren' : 'Dark Mode aktivieren');
    }
}

// ===================================
// MOBILE NAVIGATION
// ===================================

function initializeMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navOverlay = document.getElementById('nav-overlay');
    const navMenuClose = document.getElementById('nav-menu-close');

    if (!navToggle || !navMenu || !navOverlay) return;

    // Focusable elements within menu
    const focusableElements = 'button, a, [tabindex]:not([tabindex="-1"])';
    let firstFocusableElement = null;
    let lastFocusableElement = null;

    const updateFocusableElements = () => {
        const focusable = navMenu.querySelectorAll(focusableElements);
        firstFocusableElement = focusable[0];
        lastFocusableElement = focusable[focusable.length - 1];
    };

    const setMenuState = (isOpen) => {
        if (isOpen) {
            // Calculate scrollbar width before hiding overflow
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            // Set padding to compensate for scrollbar disappearing
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        } else {
            // Remove padding when menu closes
            document.body.style.paddingRight = '';
        }

        navMenu.classList.toggle('is-open', isOpen);
        navOverlay.classList.toggle('is-active', isOpen);
        navToggle.classList.toggle('is-active', isOpen);
        navToggle.setAttribute('aria-expanded', isOpen);
        navMenu.setAttribute('aria-hidden', (!isOpen).toString());
        navOverlay.setAttribute('aria-hidden', (!isOpen).toString());
        document.body.classList.toggle('menu-open', isOpen);

        if (isOpen) {
            updateFocusableElements();
            // Focus close button when menu opens
            setTimeout(() => {
                if (navMenuClose) navMenuClose.focus();
            }, 100);
        } else {
            // Return focus to toggle button when menu closes
            navToggle.focus();
        }
    };

    setMenuState(false);

    // Toggle button click
    navToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.contains('is-open');
        setMenuState(!isOpen);
    });

    // Close button click
    if (navMenuClose) {
        navMenuClose.addEventListener('click', () => setMenuState(false));
    }

    // Overlay click
    navOverlay.addEventListener('click', () => setMenuState(false));

    // Close menu when clicking nav links
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setMenuState(false));
    });

    // Keyboard navigation - Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && navMenu.classList.contains('is-open')) {
            setMenuState(false);
        }
    });

    // Focus trap - Tab key
    navMenu.addEventListener('keydown', (event) => {
        if (!navMenu.classList.contains('is-open')) return;

        if (event.key === 'Tab') {
            if (event.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstFocusableElement) {
                    event.preventDefault();
                    lastFocusableElement.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastFocusableElement) {
                    event.preventDefault();
                    firstFocusableElement.focus();
                }
            }
        }
    });

    // Touch gestures for swipe to close
    let touchStartX = 0;
    let touchEndX = 0;
    let isDragging = false;
    let currentTranslateX = 0;

    navMenu.addEventListener('touchstart', (e) => {
        if (!navMenu.classList.contains('is-open')) return;
        touchStartX = e.touches[0].clientX;
        isDragging = true;
    }, { passive: true });

    navMenu.addEventListener('touchmove', (e) => {
        if (!isDragging || !navMenu.classList.contains('is-open')) return;

        touchEndX = e.touches[0].clientX;
        const diff = touchEndX - touchStartX;

        // Only allow swiping to the right (closing direction)
        if (diff > 0) {
            currentTranslateX = diff;
            navMenu.style.transform = `translateX(${diff}px)`;

            // Fade overlay based on swipe distance
            const opacity = Math.max(0, 1 - (diff / navMenu.offsetWidth));
            navOverlay.style.opacity = opacity;
        }
    }, { passive: true });

    navMenu.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;

        const swipeThreshold = navMenu.offsetWidth * 0.3; // 30% of menu width

        if (currentTranslateX > swipeThreshold) {
            // Close menu
            setMenuState(false);
        }

        // Reset transform
        navMenu.style.transform = '';
        navOverlay.style.opacity = '';
        currentTranslateX = 0;
        touchStartX = 0;
        touchEndX = 0;
    });

    // Close menu on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            setMenuState(false);
        }
    });
}
