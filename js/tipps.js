// ===================================
// TIPPS.JS - Lerntipps Page Functionality
// ===================================

// Lerntipps Data
const lerntipps = [
    {
        title: 'Die Feynman-Methode',
        description: 'Erkläre das Thema so, als würdest du es einem 5-Jährigen beibringen. Wenn du stecken bleibst, hast du eine Wissenslücke gefunden!',
        category: 'methode',
        subject: 'allgemein',
        difficulty: 'anfaenger',
        icon: '🧠'
    },
    {
        title: 'Spaced Repetition',
        description: 'Wiederhole Inhalte in immer größeren Abständen: Tag 1, 3, 7, 14, 30. So bleibt alles im Langzeitgedächtnis!',
        category: 'gedaechtnis',
        subject: 'allgemein',
        difficulty: 'anfaenger',
        icon: '🔁'
    },
    {
        title: 'Active Recall',
        description: 'Teste dich selbst BEVOR du lernst. Dein Gehirn merkt sich besser, was es aktiv abrufen musste!',
        category: 'methode',
        subject: 'allgemein',
        difficulty: 'fortgeschritten',
        icon: '⚡'
    },
    {
        title: 'Pomodoro-Technik',
        description: '25 Minuten fokussiert lernen, 5 Minuten Pause. Nach 4 Sessions eine längere Pause von 15-30 Minuten.',
        category: 'organisation',
        subject: 'allgemein',
        difficulty: 'anfaenger',
        icon: '🍅'
    },
    {
        title: 'Memory Palace',
        description: 'Verknüpfe Informationen mit einem bekannten Ort (z.B. dein Zuhause). Spaziere gedanklich durch und sammel Wissen!',
        category: 'gedaechtnis',
        subject: 'allgemein',
        difficulty: 'profi',
        icon: '🏛️'
    },
    {
        title: 'Lernmusik 40 Hz',
        description: 'Binaurale Beats mit 40 Hz fördern Konzentration und Fokus. Perfekt für intensive Lernsessions!',
        category: 'verruckt',
        subject: 'allgemein',
        difficulty: 'anfaenger',
        icon: '🎵'
    },
    {
        title: 'Kaugummi-Trick',
        description: 'Kaue beim Lernen eine bestimmte Sorte, in der Prüfung die gleiche. Dein Gehirn erinnert sich über den Geschmack!',
        category: 'verruckt',
        subject: 'allgemein',
        difficulty: 'anfaenger',
        icon: '🍬'
    },
    {
        title: 'Teaching Method',
        description: 'Erkläre das Gelernte jemand anderem oder deinem Teddy. Wenn du es lehren kannst, hast du es verstanden!',
        category: 'methode',
        subject: 'allgemein',
        difficulty: 'anfaenger',
        icon: '👥'
    },
    {
        title: '2-Minuten-Regel',
        description: 'Wenn eine Aufgabe unter 2 Minuten dauert, mach sie SOFORT. Überwinde Prokrastination in Sekunden!',
        category: 'motivation',
        subject: 'allgemein',
        difficulty: 'anfaenger',
        icon: '💪'
    },
    {
        title: 'Cornell Notes',
        description: 'Teile Seite in 3 Bereiche: Notizen, Schlüsselwörter, Zusammenfassung. Perfekt für strukturiertes Lernen!',
        category: 'organisation',
        subject: 'allgemein',
        difficulty: 'anfaenger',
        icon: '📝'
    }
];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeGenerator();
    initializeFilters();
    initializeViewToggle();
    initializeFavorites();
    updatePoints();
    initializeDarkMode();
});

// ===================================
// RANDOM TIP GENERATOR
// ===================================

function initializeGenerator() {
    const generateBtn = document.getElementById('generate-tip-btn');
    const tipDisplay = document.getElementById('tip-display');

    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            // Get random tip
            const randomTip = lerntipps[Math.floor(Math.random() * lerntipps.length)];

            // Display tip
            showRandomTip(randomTip);

            // Add points
            addPoints(2);

            // Show notification
            showNotification('💡 Neuer Lerntipp generiert! +2 Punkte');
        });
    }
}

function showRandomTip(tip) {
    const tipDisplay = document.getElementById('tip-display');
    if (!tipDisplay) return;

    tipDisplay.style.display = 'block';

    tipDisplay.innerHTML = `
        <div class="tip-card-flip">
            <div class="tip-card-front">
                <div class="tip-icon">${tip.icon}</div>
                <h3 class="tip-title">${tip.title}</h3>
                <p class="tip-category">${getCategoryName(tip.category)} • ${getDifficultyName(tip.difficulty)}</p>
            </div>
            <div class="tip-description">
                ${tip.description}
            </div>
        </div>
        <a href="#" class="btn btn-secondary">Video ansehen 📱</a>
    `;

    // Scroll to tip
    tipDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ===================================
// FILTERS
// ===================================

function initializeFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const subjectFilter = document.getElementById('subject-filter');
    const difficultyFilter = document.getElementById('difficulty-filter');
    const searchInput = document.getElementById('search-input');

    // Filter change events
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    if (subjectFilter) {
        subjectFilter.addEventListener('change', applyFilters);
    }
    if (difficultyFilter) {
        difficultyFilter.addEventListener('change', applyFilters);
    }
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
}

function applyFilters() {
    const categoryValue = document.getElementById('category-filter')?.value || 'all';
    const subjectValue = document.getElementById('subject-filter')?.value || 'all';
    const difficultyValue = document.getElementById('difficulty-filter')?.value || 'all';
    const searchValue = document.getElementById('search-input')?.value.toLowerCase() || '';

    const videoCards = document.querySelectorAll('.video-card-item');

    videoCards.forEach(card => {
        const category = card.dataset.category;
        const subject = card.dataset.subject;
        const difficulty = card.dataset.difficulty;
        const title = card.querySelector('.video-title-large')?.textContent.toLowerCase() || '';
        const description = card.querySelector('.video-description')?.textContent.toLowerCase() || '';

        const categoryMatch = categoryValue === 'all' || category === categoryValue;
        const subjectMatch = subjectValue === 'all' || subject === subjectValue;
        const difficultyMatch = difficultyValue === 'all' || difficulty === difficultyValue;
        const searchMatch = searchValue === '' ||
                           title.includes(searchValue) ||
                           description.includes(searchValue);

        if (categoryMatch && subjectMatch && difficultyMatch && searchMatch) {
            card.style.display = '';
            card.style.animation = 'fadeIn 0.3s ease-out';
        } else {
            card.style.display = 'none';
        }
    });
}

// ===================================
// VIEW TOGGLE (Grid/List)
// ===================================

function initializeViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');
    const videosGrid = document.getElementById('videos-grid');

    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;

            // Update active button
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Update grid class
            if (view === 'list') {
                videosGrid?.classList.add('list-view');
            } else {
                videosGrid?.classList.remove('list-view');
            }
        });
    });
}

// ===================================
// FAVORITES
// ===================================

function initializeFavorites() {
    const favoriteButtons = document.querySelectorAll('.action-btn.favorite');

    favoriteButtons.forEach(btn => {
        // Load saved state
        const videoCard = btn.closest('.video-card-item');
        const videoTitle = videoCard?.querySelector('.video-title-large')?.textContent;
        const favorites = getFavorites();

        if (favorites.includes(videoTitle)) {
            btn.classList.add('active');
            btn.textContent = '❤️';
        }

        // Click event
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            const isFavorite = this.classList.contains('active');

            if (isFavorite) {
                this.classList.remove('active');
                this.textContent = '❤️';
                removeFavorite(videoTitle);
                showNotification('Aus Favoriten entfernt', 'info');
            } else {
                this.classList.add('active');
                this.textContent = '❤️';
                addFavorite(videoTitle);
                showNotification('Zu Favoriten hinzugefügt!');
            }
        });
    });
}

function getFavorites() {
    const stored = localStorage.getItem('studytok_favorites');
    return stored ? JSON.parse(stored) : [];
}

function addFavorite(title) {
    const favorites = getFavorites();
    if (!favorites.includes(title)) {
        favorites.push(title);
        localStorage.setItem('studytok_favorites', JSON.stringify(favorites));
    }
}

function removeFavorite(title) {
    let favorites = getFavorites();
    favorites = favorites.filter(f => f !== title);
    localStorage.setItem('studytok_favorites', JSON.stringify(favorites));
}

// ===================================
// VIDEO CARDS INTERACTION
// ===================================

const videoCards = document.querySelectorAll('.video-card-item');
videoCards.forEach(card => {
    card.addEventListener('click', function(e) {
        // Don't trigger if clicking action buttons
        if (e.target.closest('.action-btn')) return;

        // Add points for watching
        addPoints(2);

        // In real app, would open video modal or redirect
        showNotification('Video wird geladen... +2 Punkte', 'success');
    });
});

// ===================================
// UTILITY FUNCTIONS
// ===================================

function getCategoryName(category) {
    const names = {
        'methode': 'Lernmethode',
        'gedaechtnis': 'Gedächtnis',
        'motivation': 'Motivation',
        'organisation': 'Organisation',
        'verruckt': 'Verrückt'
    };
    return names[category] || category;
}

function getDifficultyName(difficulty) {
    const names = {
        'anfaenger': 'Anfänger',
        'fortgeschritten': 'Fortgeschritten',
        'profi': 'Profi'
    };
    return names[difficulty] || difficulty;
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
    return stored ? JSON.parse(stored) : defaultStats;
}

function saveStats(stats) {
    localStorage.setItem('studytok_stats', JSON.stringify(stats));
}

function addPoints(points) {
    const stats = getStats();
    stats.points += points;
    saveStats(stats);
    updatePoints();
}

function updatePoints() {
    const stats = getStats();
    const pointsElements = document.querySelectorAll('.points-value');
    pointsElements.forEach(el => {
        el.textContent = stats.points;
    });
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#4CAF50' : type === 'info' ? '#2196F3' : '#FF5252'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
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

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
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
