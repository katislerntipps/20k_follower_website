// ===================================
// MAIN.JS - Homepage Functionality
// ===================================

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    applySakuraTheme();
    generateBlossomPetals();
    initializeStats();
    animateTreePetals();
    updatePoints();
    initializeDarkMode();
    cleanVideoTitles();
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
        petal.className = 'petal';
        petal.style.setProperty('--x', `${Math.round(Math.random() * 100)}%`);
        petal.style.setProperty('--duration', `${randomBetween(14, 24)}s`);
        petal.style.setProperty('--delay', `${randomBetween(0, 10)}s`);
        petal.style.setProperty('--drift', `${randomBetween(-90, 90)}px`);
        petal.style.setProperty('--size', `${randomBetween(10, 18)}px`);
        container.appendChild(petal);
    }
}

function animateTreePetals() {
    const fallingPetals = document.querySelectorAll('.falling-petals circle');

    fallingPetals.forEach((petal, index) => {
        // Random animation delay
        petal.style.animationDelay = `${index * 1.5}s`;
    });
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

// Remove leftover arrow markers from video titles
function cleanVideoTitles() {
    const videoTitles = document.querySelectorAll('.video-title');

    videoTitles.forEach(title => {
        title.textContent = title.textContent
            .replace(/\s*->\s*$/, '')
            .replace(/\s*→\s*$/, '');
    });
}

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
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// ===================================
// POINTS HISTORY MODAL
// ===================================

function initializePointsModal() {
    const modalOverlay = document.getElementById('points-modal-overlay');
    const closeBtn = document.getElementById('close-points-modal');
    const userPoints = document.querySelectorAll('.user-points');

    // Open modal when clicking on coins
    userPoints.forEach(coin => {
        coin.addEventListener('click', openPointsModal);
    });

    // Close modal when clicking close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closePointsModal);
    }

    // Close modal when clicking overlay
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closePointsModal();
            }
        });
    }

    // Close modal with ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePointsModal();
        }
    });
}

function openPointsModal() {
    const modalOverlay = document.getElementById('points-modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.add('active');
        loadPointsHistory();
    }
}

function closePointsModal() {
    const modalOverlay = document.getElementById('points-modal-overlay');
    if (modalOverlay) {
        modalOverlay.classList.remove('active');
    }
}

function loadPointsHistory() {
    const historyList = document.getElementById('points-history-list');
    const modalTotalPoints = document.getElementById('modal-total-points');
    const history = getPointsHistory();
    const stats = getStats();

    if (!historyList) return;

    // Update total points
    if (modalTotalPoints) {
        modalTotalPoints.textContent = stats.points;
    }

    // Display history
    if (history.length === 0) {
        historyList.innerHTML = `
            <div class="points-history-empty">
                <div class="points-history-empty-icon">🪙</div>
                <p>Noch keine Aktivitäten</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem;">Sammle Punkte, indem du Lernsessions abschließt!</p>
            </div>
        `;
    } else {
        historyList.innerHTML = history.map(item => `
            <div class="points-history-item">
                <div class="points-history-icon">${item.icon}</div>
                <div class="points-history-content">
                    <div class="points-history-action">${item.action}</div>
                    <div class="points-history-time">${item.time}</div>
                </div>
                <div class="points-history-amount">+${item.points}</div>
            </div>
        `).join('');
    }
}

function getPointsHistory() {
    const stored = localStorage.getItem('studytok_points_history');
    if (stored) {
        return JSON.parse(stored);
    }
    return [];
}

function addPointsToHistory(action, points, icon = '🎯') {
    const history = getPointsHistory();
    const now = new Date();

    const newEntry = {
        action: action,
        points: points,
        icon: icon,
        time: formatTimeAgo(now),
        timestamp: now.toISOString()
    };

    // Add to beginning of array
    history.unshift(newEntry);

    // Keep only last 8 entries
    const limitedHistory = history.slice(0, 8);

    // Save to localStorage
    localStorage.setItem('studytok_points_history', JSON.stringify(limitedHistory));

    // Update points
    const stats = getStats();
    stats.points += points;
    saveStats(stats);
    updatePoints();
}

function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Gerade eben';
    if (diffMins < 60) return `vor ${diffMins} Min`;
    if (diffHours < 24) return `vor ${diffHours} Std`;
    if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;

    return new Date(date).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Initialize modal on page load
document.addEventListener('DOMContentLoaded', function() {
    initializePointsModal();
});
