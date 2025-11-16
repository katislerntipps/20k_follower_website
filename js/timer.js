// ===================================
// TIMER.JS - Pomodoro Timer Functionality
// ===================================

// Timer State
let timerState = {
    minutes: 25,
    seconds: 0,
    isRunning: false,
    mode: 'focus', // 'focus', 'short', 'long'
    interval: null,
    totalSeconds: 25 * 60
};

// Tree State
let treeState = {
    level: 1,
    blossoms: 0,
    totalSessions: 0
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadTimerState();
    loadTreeState();
    initializeTimer();
    initializeTree();
    updateDisplay();
    updateStats();
    initializeDarkMode();
});

// ===================================
// TIMER FUNCTIONALITY
// ===================================

function initializeTimer() {
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const modeBtns = document.querySelectorAll('.mode-btn');

    // Start button
    startBtn.addEventListener('click', startTimer);

    // Pause button
    pauseBtn.addEventListener('click', pauseTimer);

    // Reset button
    resetBtn.addEventListener('click', resetTimer);

    // Mode buttons
    modeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (!timerState.isRunning) {
                changeMode(this.dataset.mode);

                // Update active state
                modeBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

function startTimer() {
    if (!timerState.isRunning) {
        timerState.isRunning = true;

        document.getElementById('start-btn').style.display = 'none';
        document.getElementById('pause-btn').style.display = 'block';

        timerState.interval = setInterval(tick, 1000);

        saveTimerState();
    }
}

function pauseTimer() {
    timerState.isRunning = false;
    clearInterval(timerState.interval);

    document.getElementById('start-btn').style.display = 'block';
    document.getElementById('pause-btn').style.display = 'none';

    saveTimerState();
}

function resetTimer() {
    pauseTimer();

    switch(timerState.mode) {
        case 'focus':
            timerState.minutes = 25;
            timerState.totalSeconds = 25 * 60;
            break;
        case 'short':
            timerState.minutes = 5;
            timerState.totalSeconds = 5 * 60;
            break;
        case 'long':
            timerState.minutes = 15;
            timerState.totalSeconds = 15 * 60;
            break;
    }

    timerState.seconds = 0;
    updateDisplay();
    saveTimerState();
}

function changeMode(mode) {
    timerState.mode = mode;

    switch(mode) {
        case 'focus':
            timerState.minutes = 25;
            timerState.totalSeconds = 25 * 60;
            break;
        case 'short':
            timerState.minutes = 5;
            timerState.totalSeconds = 5 * 60;
            break;
        case 'long':
            timerState.minutes = 15;
            timerState.totalSeconds = 15 * 60;
            break;
    }

    timerState.seconds = 0;
    updateDisplay();
    saveTimerState();
}

function tick() {
    if (timerState.seconds === 0) {
        if (timerState.minutes === 0) {
            // Timer finished
            timerComplete();
            return;
        }
        timerState.minutes--;
        timerState.seconds = 59;
    } else {
        timerState.seconds--;
    }

    updateDisplay();
    saveTimerState();
}

function timerComplete() {
    pauseTimer();

    // Play sound if enabled
    const soundEnabled = document.getElementById('sound-enabled').checked;
    if (soundEnabled) {
        playCompletionSound();
    }

    // Show notification
    if (timerState.mode === 'focus') {
        showNotification('🎉 Focus-Session abgeschlossen! +10 Punkte');

        // Update stats
        addSession();
        addPoints(10);

        // Grow tree
        addBlossom();

        // Auto-start break if enabled
        const autoStartBreak = document.getElementById('auto-start-break').checked;
        if (autoStartBreak) {
            setTimeout(() => {
                changeMode('short');
                document.querySelector('[data-mode="short"]').click();
            }, 1000);
        }
    } else {
        showNotification('☕ Pause beendet! Bereit für die nächste Session?');
    }

    resetTimer();
}

// ===================================
// DISPLAY UPDATES
// ===================================

function updateDisplay() {
    // Update timer display
    const minutesEl = document.getElementById('timer-minutes');
    const secondsEl = document.getElementById('timer-seconds');

    if (minutesEl) {
        minutesEl.textContent = String(timerState.minutes).padStart(2, '0');
    }
    if (secondsEl) {
        secondsEl.textContent = String(timerState.seconds).padStart(2, '0');
    }

    // Update progress ring
    const currentSeconds = (timerState.minutes * 60) + timerState.seconds;
    const progress = 1 - (currentSeconds / timerState.totalSeconds);
    const offset = 534 - (534 * progress);

    const progressRing = document.getElementById('timer-progress');
    if (progressRing) {
        progressRing.style.strokeDashoffset = offset;
    }
}

function updateStats() {
    const stats = getStats();

    document.getElementById('sessions-today').textContent = stats.sessions;
    document.getElementById('minutes-today').textContent = stats.focusTime;
    document.getElementById('streak').textContent = stats.streak;

    // Update total points
    const pointsElements = document.querySelectorAll('.points-value, #total-points');
    pointsElements.forEach(el => {
        el.textContent = stats.points;
    });
}

// ===================================
// TREE FUNCTIONALITY
// ===================================

function initializeTree() {
    for (let i = 1; i <= treeState.level; i++) {
        const branchGroup = document.getElementById(`branches-level-${i}`);
        if (branchGroup) {
            branchGroup.style.opacity = '1';
        }
    }
    renderTree();
}

function addBlossom() {
    treeState.blossoms++;
    treeState.totalSessions++;

    // Check for level up
    if (treeState.blossoms >= 5) {
        levelUp();
    }

    renderTree();
    saveTreeState();
}

function levelUp() {
    treeState.level++;
    treeState.blossoms = 0;

    showNotification(`🌸 Level ${treeState.level} erreicht!`, 'success');

    // Show branches based on level
    const branchGroup = document.getElementById(`branches-level-${treeState.level}`);
    if (branchGroup) {
        branchGroup.style.opacity = '1';
    }
}

function renderTree() {
    const blossomsContainer = document.getElementById('blossoms-container');
    if (!blossomsContainer) return;

    // Clear existing blossoms
    blossomsContainer.innerHTML = '';

    // Blossom positions for different levels
    const positions = [
        { cx: 130, cy: 320 },
        { cx: 270, cy: 320 },
        { cx: 120, cy: 260 },
        { cx: 280, cy: 260 },
        { cx: 200, cy: 240 }
    ];

    // Render blossoms
    for (let i = 0; i < Math.min(treeState.blossoms, 5); i++) {
        const pos = positions[i];
        const blossom = createBlossomElement(pos.cx, pos.cy, i);
        blossomsContainer.innerHTML += blossom;
    }

    // Update tree info
    document.getElementById('tree-level').textContent = treeState.level;
    document.getElementById('blossoms-count').textContent = treeState.blossoms;

    // Add falling petals
    addFallingPetals();
}

function createBlossomElement(cx, cy, index) {
    const colors = ['#FFB7C5', '#FFC8D3', '#FFD4E0', '#FF9AC4'];
    const color = colors[index % colors.length];
    const rotation = Math.floor(Math.random() * 360);

    return `
        <g class="blossom-group" transform="translate(${cx} ${cy}) rotate(${rotation})">
            ${[0, 72, 144, 216, 288].map(angle => `
                <ellipse rx="12" ry="18" fill="${color}" opacity="0.9" transform="rotate(${angle}) translate(0 -16)" />
            `).join('')}
            <circle r="8" fill="#FFD9E8" opacity="0.9" />
            <circle r="4" fill="#FFEFF6" />
        </g>
    `;
}

function addFallingPetals() {
    const fallingPetalsContainer = document.getElementById('falling-petals');
    if (!fallingPetalsContainer) return;

    // Add random falling petals
    const petalCount = Math.min(treeState.totalSessions, 10);
    fallingPetalsContainer.innerHTML = '';

    for (let i = 0; i < petalCount; i++) {
        const x = 120 + Math.random() * 160;
        const y = 190 + Math.random() * 120;
        const delay = (Math.random() * 4).toFixed(2);
        const tilt = (Math.random() * 14 - 7).toFixed(1);
        const drift = (Math.random() * 20 - 10).toFixed(1);
        const float = (70 + Math.random() * 40).toFixed(1);
        const duration = (7 + Math.random() * 4).toFixed(2);
        const scale = (0.82 + Math.random() * 0.35).toFixed(2);

        fallingPetalsContainer.innerHTML += `
            <path d="M0 0 C8 -6 18 -4 18 8 C10 12 2 12 0 0 Z" fill="#FFC8D3"
                  class="petal-floating"
                  style="--start-x:${x}px; --start-y:${y}px; --drift:${drift}px; --float:${float}px; --tilt:${tilt}deg; --scale:${scale}; --duration:${duration}s; animation-delay:${delay}s;" />
        `;
    }
}

// ===================================
// STATS & STORAGE
// ===================================

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

function addSession() {
    const stats = getStats();
    stats.sessions++;
    stats.focusTime += 25;
    saveStats(stats);
    updateStats();
}

function addPoints(points) {
    const stats = getStats();
    stats.points += points;
    saveStats(stats);
    updateStats();
}

function loadTimerState() {
    const stored = localStorage.getItem('studytok_timer');
    if (stored) {
        const saved = JSON.parse(stored);
        timerState = { ...timerState, ...saved, isRunning: false, interval: null };
    }
}

function saveTimerState() {
    const toSave = {
        minutes: timerState.minutes,
        seconds: timerState.seconds,
        mode: timerState.mode,
        totalSeconds: timerState.totalSeconds
    };
    localStorage.setItem('studytok_timer', JSON.stringify(toSave));
}

function loadTreeState() {
    const stored = localStorage.getItem('studytok_tree');
    if (stored) {
        treeState = JSON.parse(stored);
    }
}

function saveTreeState() {
    localStorage.setItem('studytok_tree', JSON.stringify(treeState));
}

// ===================================
// NOTIFICATIONS & SOUNDS
// ===================================

function showNotification(message, type = 'success') {
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
        font-family: 'Poppins', sans-serif;
        font-weight: 600;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function playCompletionSound() {
    // Create simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

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
