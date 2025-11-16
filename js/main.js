// ===================================
// MAIN.JS - Homepage Functionality
// ===================================

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeStats();
    animateTreePetals();
    updatePoints();
});

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
