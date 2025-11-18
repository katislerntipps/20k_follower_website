// ===================================
// TIPPS.JS - TikTok Lerntipps
// ===================================

const tiktokVideos = [
    {
        id: 1,
        title: 'Fokus-Booster mit der 90/20-Regel',
        summary: '90 Minuten Deep Work, danach 20 Minuten aktive Erholung. Perfekt, wenn du lange Blöcke aus dem PDF nachlernst.',
        link: 'https://www.tiktok.com/@katislerntipps/video/1',
        duration: '2:13',
        tags: ['Fokus', 'Routine', 'PDF #1'],
        thumbnail: 'image/tiktok-1.svg'
    },
    {
        id: 2,
        title: 'Lernplan in 3 Schritten',
        summary: 'So baust du aus dem PDF deinen Wochenplan: Ziele clustern, Zeitfenster blocken, Puffer kalkulieren.',
        link: 'https://www.tiktok.com/@katislerntipps/video/2',
        duration: '1:47',
        tags: ['Organisation', 'Planung', 'PDF #2'],
        thumbnail: 'image/tiktok-2.svg'
    },
    {
        id: 3,
        title: 'Cornell-Notizen für faule Tage',
        summary: 'Die Kurzfassung aus dem PDF: Schreibe nur Kernideen, markiere Fragen, fasse in 3 Sätzen zusammen.',
        link: 'https://www.tiktok.com/@katislerntipps/video/3',
        duration: '2:05',
        tags: ['Notizen', 'Struktur', 'PDF #3'],
        thumbnail: 'image/tiktok-3.svg'
    },
    {
        id: 4,
        title: 'Motivation: 2-Minuten-Start',
        summary: 'Starte jede Session mit einer 2-Minuten-Aufgabe. Laut PDF-Liste erhöht das die Startquote massiv.',
        link: 'https://www.tiktok.com/@katislerntipps/video/4',
        duration: '1:32',
        tags: ['Motivation', 'Prokrastination', 'PDF #4'],
        thumbnail: 'image/tiktok-4.svg'
    },
    {
        id: 5,
        title: 'Mindset Reset vor Prüfungen',
        summary: 'Mini-Routine aus dem PDF: Atemübung, Micro-Stretching, Affirmation – 3 Minuten, die dein Stresslevel senken.',
        link: 'https://www.tiktok.com/@katislerntipps/video/5',
        duration: '2:21',
        tags: ['Mindset', 'Prüfung', 'PDF #5'],
        thumbnail: 'image/tiktok-5.svg'
    },
    {
        id: 6,
        title: 'Spickzettel fürs Gehirn',
        summary: 'Nutze Spaced Repetition aus dem PDF: Fragekarten nach 1, 3, 7, 14 Tagen – so baust du Langzeitwissen auf.',
        link: 'https://www.tiktok.com/@katislerntipps/video/6',
        duration: '2:44',
        tags: ['Gedächtnis', 'Spaced Repetition', 'PDF #6'],
        thumbnail: 'image/tiktok-6.svg'
    }
];

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    renderVideos();
    initializeViewToggle();
    initializeDarkMode();
});

// ===================================
// RENDER CARDS
// ===================================

function renderVideos() {
    const grid = document.getElementById('videos-grid');
    if (!grid) return;

    grid.innerHTML = '';

    tiktokVideos.forEach(video => {
        const card = document.createElement('article');
        card.className = 'tiktok-card';
        card.innerHTML = `
            <div class="tiktok-media">
                <div class="tiktok-thumb" style="background-image: url('${video.thumbnail}');"></div>
                <div class="tiktok-number">TikTok #${video.id}</div>
                <div class="tiktok-duration">${video.duration}</div>
            </div>
            <div class="tiktok-body">
                <h3 class="tiktok-title">${video.title}</h3>
                <p class="tiktok-summary">${video.summary}</p>
                <div class="tag-row">
                    ${video.tags.map(tag => `<span class="tag-chip">${tag}</span>`).join('')}
                </div>
                <div>
                    <a class="watch-btn" href="${video.link}" target="_blank" rel="noreferrer">
                        Ansehen
                    </a>
                </div>
            </div>
        `;

        card.addEventListener('click', event => {
            const isLink = event.target.closest('a');
            if (isLink) return;
            window.open(video.link, '_blank', 'noreferrer');
        });

        grid.appendChild(card);
    });
}

// ===================================
// VIEW TOGGLE
// ===================================

function initializeViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');
    const videosGrid = document.getElementById('videos-grid');
    if (!viewBtns.length || !videosGrid) return;

    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            const isList = view === 'list';

            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            viewBtns.forEach(b => b.setAttribute('aria-pressed', b === btn));

            videosGrid.classList.toggle('list-view', isList);
        });
    });
}

// ===================================
// DARK MODE FUNCTIONALITY
// ===================================

function initializeDarkMode() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('studytok_theme') || 'light';

    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

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
