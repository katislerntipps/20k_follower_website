// ===================================
// MAIN.JS - Homepage Functionality
// ===================================

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    applySakuraTheme();
    renderCherryTree();
    generateBlossomPetals();
    setupHomeTreeAnimation();
    initializeStats();
    updatePoints();
    initializeDarkMode();
    initializePointsHistory();
});

function applySakuraTheme() {
    document.body.classList.add('sakura-theme');
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
        lastActive: new Date().toDateString()
    };

    const stored = localStorage.getItem('studytok_stats');
    if (stored) {
        const stats = JSON.parse(stored);

        // Check if it's a new day
        if (stats.lastActive !== new Date().toDateString()) {
            // Could update streak logic here
            stats.lastActive = new Date().toDateString();
            saveStats(stats);
        }

        return stats;
    }

    saveStats(defaultStats);
    return defaultStats;
}

function saveStats(stats) {
    localStorage.setItem('studytok_stats', JSON.stringify(stats));
}

function updateStatsDisplay(stats) {
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

function getPointsHistory() {
    const defaultHistory = [
        { title: 'Pomodoro abgeschlossen', detail: '25 Minuten Fokus', points: 50, timestamp: new Date().toISOString() },
        { title: 'Täglicher Login', detail: 'Motivation gecheckt', points: 15, timestamp: new Date(Date.now() - 86400000).toISOString() },
        { title: 'Lernplan erstellt', detail: 'Ziele für die Woche gesetzt', points: 30, timestamp: new Date(Date.now() - 2 * 86400000).toISOString() }
    ];

    const stored = localStorage.getItem('studytok_points_history');
    if (stored) return JSON.parse(stored);

    localStorage.setItem('studytok_points_history', JSON.stringify(defaultHistory));
    return defaultHistory;
}

function formatHistoryDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function renderPointsHistory(history) {
    const list = document.querySelector('#points-history-modal .history-list');
    const emptyState = document.querySelector('#points-history-modal .history-empty');
    if (!list || !emptyState) return;

    list.innerHTML = '';

    if (!history.length) {
        emptyState.hidden = false;
        return;
    }

    emptyState.hidden = true;

    history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    history.forEach(item => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `
            <div>
                <p class="history-title">${item.title}</p>
                <p class="history-meta">${item.detail || ''} • ${formatHistoryDate(item.timestamp)}</p>
            </div>
            <span class="history-points">+${item.points}</span>
        `;
        list.appendChild(li);
    });
}

function initializePointsHistory() {
    const trigger = document.getElementById('points-history-trigger');
    const modal = document.getElementById('points-history-modal');
    if (!trigger || !modal) return;

    const closeBtn = modal.querySelector('.modal-close');
    const openModal = () => {
        renderPointsHistory(getPointsHistory());
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
// TREE ANIMATIONS
// ===================================

function generateBlossomPetals() {
    const container = document.querySelector('.blossom-background');
    if (!container) return;

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

    // Clean up any previous initialization to avoid duplicate ScrollTriggers
    if (stage._homeTreeTimelineCleanup) {
        stage._homeTreeTimelineCleanup.forEach((cleanupFn) => cleanupFn?.());
    }
    stage._homeTreeTimelineCleanup = [];

    const trunk = stage.querySelector('.tree-layer-trunk');
    const branches = stage.querySelector('.tree-layer-branches');
    const blooms = stage.querySelector('.tree-layer-blooms');
    const glow = stage.querySelector('.tree-layer-glow');
    const petals = stage.parentElement?.querySelectorAll('.hero-floating-petals .floating-petal');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    gsap.set(stage, { opacity: 1, y: 0, scale: 1 });
    gsap.set([trunk, branches, blooms], { opacity: 1, yPercent: 0, rotate: 0, xPercent: 0, scale: 1 });
    gsap.set(glow, { opacity: 0.28, yPercent: 0, scale: 1 });

    if (prefersReducedMotion) {
        gsap.set([trunk, branches, blooms, glow], { opacity: 1, rotate: 0, xPercent: 0, yPercent: 0, scale: 1 });
        if (petals?.length) {
            gsap.set(petals, { opacity: 0.85, y: 0, clearProps: 'animation' });
        }
        return;
    }

    const swayTl = gsap.timeline({ repeat: -1, yoyo: true, defaults: { ease: 'sine.inOut', duration: 5 } });
    swayTl
        .to(trunk, { rotate: 1.2, xPercent: -0.2 }, 0)
        .to(branches, { rotate: -1.4, xPercent: 0.6 }, 0)
        .to(blooms, { rotate: 1.6, xPercent: -0.8 }, 0.1);

    const swayTrigger = ScrollTrigger.create({
        trigger: '#home-cherry-tree',
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => swayTl.timeScale(0.8 + self.progress * 0.6)
    });
    stage._homeTreeTimelineCleanup.push(() => {
        swayTrigger.kill();
        swayTl.kill();
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
    stage._homeTreeTimelineCleanup.push(() => {
        parallaxTl.scrollTrigger?.kill();
        parallaxTl.kill();
    });

    const intro = gsap.timeline({
        scrollTrigger: {
            trigger: '#home-cherry-tree',
            start: 'top 80%',
            toggleActions: 'play none none none'
        }
    });

    intro
        .to(stage, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power1.out' })
        .to(blooms, { filter: 'blur(0px)', duration: 0.4 }, 0)
        .to(glow, { opacity: 0.32, duration: 0.5 }, 0);
    stage._homeTreeTimelineCleanup.push(() => {
        intro.scrollTrigger?.kill();
        intro.kill();
    });

    if (petals?.length) {
        const petalIntro = gsap.fromTo(petals, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'sine.out', delay: 0.4, scrollTrigger: {
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

        const petalTrigger = ScrollTrigger.create({
            trigger: '#home-cherry-tree',
            start: 'top 82%',
            onEnter: () => petalSequence.restart(true),
            onEnterBack: () => petalSequence.restart(true),
            onLeave: () => petalSequence.pause(),
            onLeaveBack: () => petalSequence.pause()
        });
        stage._homeTreeTimelineCleanup.push(() => {
            petalTrigger.kill();
            petalSequence.kill();
            petalIntro.scrollTrigger?.kill();
            petalIntro.kill();
        });
    }
}

// ===================================
// FEATURE CARD INTERACTIONS
// ===================================

// Lerntipp Generator Button
const generateTipBtn = document.querySelector('.feature-card:nth-child(1) .btn-outline');
if (generateTipBtn) {
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
// DARK MODE FUNCTIONALITY
// ===================================

function initializeDarkMode() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('studytok_theme') || 'light';

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
    localStorage.setItem('studytok_theme', newTheme);
    updateThemeIcon(newTheme);
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
