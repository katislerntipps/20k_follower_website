// ===================================
// TIMER.JS - Pomodoro Timer Functionality
// ===================================

// Timer State
let timerState = {
    minutes: 25,
    seconds: 0,
    isRunning: false,
    isPaused: false,
    mode: 'focus', // 'focus', 'short', 'long'
    interval: null,
    totalSeconds: 25 * 60,
    elapsedWithoutPause: 0, // Track time without pausing
    endTime: null,
    lastTick: null,
    cycleCount: 0, // Track completed focus sessions (0-3 = short break, 4 = long break)
    isInCycle: true, // Track if we're in an active Pomodoro cycle
    totalCycleSessions: 0, // Track all focus sessions for the current day (doesn't reset on long break)
    lastCycleSessionDate: new Date().toDateString()
};

// Tree State
let treeState = {
    level: 1,
    blossoms: 0,
    totalSessions: 0
};

const TIMER_IMAGE_THRESHOLDS = [0, 5, 10, 15, 20];
const TIMER_IMAGE_SOURCES = {
    default: 'image/1.png',
    pause: 'image/pause.png'
};

let treeTimeline;
let treeScrubTween;
let treeLoopTimelines = [];

// Utility Helpers
function throttle(func, wait, options = {}) {
    const { leading = true, trailing = true } = options;
    let timeout = null;
    let lastCallTime = 0;
    let lastArgs;
    let lastThis;

    const invoke = () => {
        lastCallTime = Date.now();
        func.apply(lastThis, lastArgs);
        lastArgs = lastThis = undefined;
    };

    return function throttled(...args) {
        const now = Date.now();
        if (!lastCallTime && !leading) {
            lastCallTime = now;
        }

        const remaining = wait - (now - lastCallTime);
        lastArgs = args;
        lastThis = this;

        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            invoke();
        } else if (!timeout && trailing) {
            timeout = setTimeout(() => {
                timeout = null;
                if (!leading) {
                    lastCallTime = 0;
                }
                invoke();
            }, remaining);
        }
    };
}

// Safe storage helpers
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

const TIMER_SAVE_THROTTLE_MS = 5000;
const throttledSaveTimerState = throttle(() => saveTimerState(), TIMER_SAVE_THROTTLE_MS);

// Progress ring helpers
function initializeProgressRings() {
    const timerRing = document.getElementById('timer-progress');
    if (!timerRing || typeof timerRing.getTotalLength !== 'function') return;

    const length = timerRing.getTotalLength();
    timerRing.style.strokeDasharray = length;
    timerRing.dataset.circumference = length;
}

function getRingLength(ringElement, fallback) {
    if (!ringElement) return fallback;

    const storedValue = parseFloat(ringElement.dataset?.circumference);
    if (!Number.isNaN(storedValue)) return storedValue;

    if (typeof ringElement.getTotalLength === 'function') {
        const length = ringElement.getTotalLength();
        ringElement.dataset.circumference = length;
        ringElement.style.strokeDasharray = length;
        return length;
    }

    return fallback;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    preloadTreeImages();
    loadTimerState();
    loadTreeState();
    initializeTimer();
    initializeTree();
    setupTreeTimeline();
    initializeProgressRings();
    updateDisplay();
    updateStats();
    updateTreeGrowth();
    updateCycleIndicator();
    updateTimerTreeImage();
    initializeDarkMode();
    initializeNotifications();
    initializeAchievements();
});

function preloadTreeImages() {
    const loaded = new Set();
    const sources = [
        'image/1.png',
        'image/2.png',
        'image/3.png',
        'image/4.png',
        'image/5.png',
        TIMER_IMAGE_SOURCES.pause
    ];

    sources.forEach(src => {
        if (loaded.has(src)) return;

        const img = new Image();
        img.src = src;
        loaded.add(src);
    });
}

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

    // Mode buttons are now disabled - they only show the current mode
    modeBtns.forEach(btn => {
        // Disable manual mode selection
        btn.style.cursor = 'default';
        btn.style.opacity = '0.8';

        // Add tooltip to explain they can't be clicked
        btn.title = 'Der Modus wird automatisch nach der Pomodoro-Technik gewechselt';

        // Prevent clicking
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            // Show a brief notification
            const notification = document.createElement('div');
            notification.textContent = 'Der Modus wird automatisch gewechselt ⏱️';
            notification.style.cssText = `
                position: fixed;
                top: 120px;
                left: 50%;
                transform: translateX(-50%);
                padding: 0.75rem 1.5rem;
                background: rgba(102, 126, 234, 0.95);
                color: white;
                border-radius: 8px;
                font-family: 'Poppins', sans-serif;
                font-size: 0.9rem;
                z-index: 9999;
                animation: fadeIn 0.3s ease-out;
            `;
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }, 2000);
        });
    });
}

function startTimer() {
    if (!timerState.isRunning) {
        timerState.isRunning = true;
        timerState.isPaused = false;

        const currentSeconds = (timerState.minutes * 60) + timerState.seconds;
        const now = Date.now();

        timerState.endTime = now + (currentSeconds * 1000);
        timerState.lastTick = now;

        document.getElementById('start-btn').style.display = 'none';
        document.getElementById('pause-btn').style.display = 'block';

        timerState.interval = setInterval(tick, 1000);

        saveTimerState();
    }
}

function pauseTimer(options = {}) {
    const { showPauseImage = true, resetConsecutive = true } = options;
    timerState.isRunning = false;
    timerState.isPaused = showPauseImage;
    clearInterval(timerState.interval);

    updateRemainingTime();
    timerState.endTime = null;
    timerState.lastTick = null;

    document.getElementById('start-btn').style.display = 'block';
    document.getElementById('pause-btn').style.display = 'none';

    // Reset tree growth on pause
    timerState.elapsedWithoutPause = 0;
    updateTreeGrowth();

    // Reset consecutive sessions only when user truly pauses/interrupts
    if (resetConsecutive) {
        const stats = getStats();
        stats.consecutiveSessions = 0;
        saveStats(stats);
    }

    updateTimerTreeImage();
    saveTimerState();
}

function resetTimer() {
    pauseTimer({ showPauseImage: false });

    // Reset to focus mode and restart the entire Pomodoro cycle
    timerState.mode = 'focus';
    timerState.minutes = 25;
    timerState.totalSeconds = 25 * 60;
    timerState.seconds = 0;
    timerState.cycleCount = 0;
    timerState.elapsedWithoutPause = 0;
    timerState.endTime = null;
    timerState.lastTick = null;
    timerState.isPaused = false;

    updateDisplay();
    updateTreeGrowth();
    updateModeButtons();
    updateCycleIndicator();
    updateTimerTreeImage();
    saveTimerState();
}

function changeMode(mode) {
    timerState.mode = mode;
    timerState.endTime = null;
    timerState.lastTick = null;
    timerState.isPaused = false;

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
    updateTimerTreeImage();
    saveTimerState();
}

function updateRemainingTime() {
    if (timerState.endTime) {
        const remainingSeconds = Math.max(0, Math.round((timerState.endTime - Date.now()) / 1000));
        timerState.minutes = Math.floor(remainingSeconds / 60);
        timerState.seconds = remainingSeconds % 60;
    }
}

function tick() {
    if (!timerState.endTime) {
        timerState.endTime = Date.now() + ((timerState.minutes * 60 + timerState.seconds) * 1000);
    }

    const now = Date.now();
    const remainingSeconds = Math.max(0, Math.round((timerState.endTime - now) / 1000));
    const elapsedSeconds = timerState.lastTick ? Math.max(0, Math.round((now - timerState.lastTick) / 1000)) : 1;

    timerState.lastTick = now;
    timerState.elapsedWithoutPause += elapsedSeconds;
    timerState.minutes = Math.floor(remainingSeconds / 60);
    timerState.seconds = remainingSeconds % 60;

    updateDisplay();
    updateTreeGrowth();
    updateTimerTreeImage();
    throttledSaveTimerState();

    if (remainingSeconds <= 0) {
        timerComplete();
    }
}

function timerComplete() {
    pauseTimer({ showPauseImage: false, resetConsecutive: false });

    // Play sound if enabled
    const soundEnabled = document.getElementById('sound-enabled').checked;
    if (soundEnabled) {
        playCompletionSound();
    }

    if (timerState.mode === 'focus') {
        // Focus session completed
        // Update stats
        addSession();
        addPoints(10);
        incrementDayCycleSessions();

        // Grow tree
        addBlossom();
        if (treeTimeline) {
            treeTimeline.play('finale');
        }

        // Increment cycle count
        timerState.cycleCount++;
        saveTimerState();
        updateCycleIndicator();
        updateTimerTreeImage();

        // Show browser notification
        showBrowserNotification('🎉 Focus-Session abgeschlossen! Zeit für eine Pause.');

        // Determine which break to show
        const isLongBreak = timerState.cycleCount >= 4;
        const breakType = isLongBreak ? 'long' : 'short';
        const breakDuration = isLongBreak ? 15 : 5;

        // Show popup
        showPhaseTransitionPopup(
            '🎉 Focus-Session abgeschlossen!',
            `Du hast 25 Minuten konzentriert gearbeitet. Zeit für eine ${isLongBreak ? 'lange' : 'kurze'} Pause von ${breakDuration} Minuten.`,
            'Jetzt Pause starten',
            () => {
                // Start break
                changeMode(breakType);
                updateModeButtons();
                startTimer();
            }
        );

    } else {
        // Break completed
        showBrowserNotification('☕ Pause beendet! Bereit für die nächste Focus-Session?');

        // Reset cycle count after long break
        if (timerState.mode === 'long') {
            timerState.cycleCount = 0;
            saveTimerState();
            updateCycleIndicator();
        }

        // Show popup to start next focus session
        showPhaseTransitionPopup(
            '☕ Pause beendet!',
            'Bereit für die nächste Focus-Session? Starte jetzt mit 25 Minuten konzentrierter Arbeit.',
            'Jetzt Fokus starten',
            () => {
                // Start next focus session
                changeMode('focus');
                updateModeButtons();
                startTimer();
            }
        );
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

    const progressRing = document.getElementById('timer-progress');
    if (progressRing) {
        const ringLength = getRingLength(progressRing, 534);
        progressRing.style.strokeDashoffset = ringLength - (ringLength * progress);
    }

    const treeProgressText = document.getElementById('tree-progress-text');
    if (treeProgressText) {
        const modeLabels = {
            focus: 'Fokus läuft',
            short: 'Kurze Pause',
            long: 'Lange Pause'
        };
        const readableLabel = modeLabels[timerState.mode] || 'Timer bereit';
        const percentage = Math.round(progress * 100);
        const isActive = timerState.isRunning && !timerState.isPaused;
        treeProgressText.textContent = isActive
            ? `${readableLabel} • ${percentage}%`
            : `${readableLabel} bereit`;
    }
}

function updateCycleIndicator() {
    const cycleDotsContainer = document.getElementById('cycle-dots');
    if (!cycleDotsContainer) return;

    // Clear existing dots
    cycleDotsContainer.innerHTML = '';

    // Create 4 dots representing the 4 focus sessions
    for (let i = 0; i < 4; i++) {
        const dot = document.createElement('div');
        const isCompleted = i < timerState.cycleCount;
        const isCurrent = i === timerState.cycleCount && timerState.mode === 'focus';

        dot.style.cssText = `
            width: ${isCurrent ? '14px' : '10px'};
            height: ${isCurrent ? '14px' : '10px'};
            border-radius: 50%;
            background: ${isCompleted ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(102, 126, 234, 0.2)'};
            border: ${isCurrent ? '2px solid #667eea' : 'none'};
            transition: all 0.3s ease;
            box-shadow: ${isCompleted ? '0 2px 8px rgba(102, 126, 234, 0.4)' : 'none'};
        `;

        cycleDotsContainer.appendChild(dot);
    }

    // Add text showing current cycle
    const cycleText = document.createElement('div');
    cycleText.style.cssText = `
        margin-top: 0.5rem;
        font-size: 0.75rem;
        color: var(--text-secondary, #5a6c7d);
        font-weight: 500;
    `;

    if (timerState.cycleCount >= 4) {
        cycleText.textContent = 'Nächste: Lange Pause';
    } else {
        cycleText.textContent = `Session ${timerState.cycleCount + 1} von 4`;
    }

    cycleDotsContainer.appendChild(cycleText);
}

function getDayCycleSessions() {
    const today = new Date().toDateString();

    if (timerState.lastCycleSessionDate !== today) {
        timerState.lastCycleSessionDate = today;
        timerState.totalCycleSessions = 0;
        saveTimerState();
    }

    if (Number.isFinite(timerState.totalCycleSessions)) {
        return timerState.totalCycleSessions;
    }

    const stats = getStats();
    if (stats.lastSessionDate === today) {
        return stats.sessionsToday || 0;
    }

    return 0;
}

function incrementDayCycleSessions() {
    const today = new Date().toDateString();

    if (timerState.lastCycleSessionDate !== today) {
        timerState.lastCycleSessionDate = today;
        timerState.totalCycleSessions = 0;
    }

    timerState.totalCycleSessions += 1;
    saveTimerState();
}

function updateTimerTreeImage() {
    const timerImage = document.getElementById('timer-tree-image');
    if (!timerImage) return;

    const resolveImageSrc = (overrideSrc = null) => {
        if (overrideSrc) return overrideSrc;

        if (timerState.isPaused) {
            return TIMER_IMAGE_SOURCES.pause;
        }

        const remainingSeconds = Math.max(0, (timerState.minutes * 60) + timerState.seconds);
        const totalSeconds = Math.max(1, timerState.totalSeconds || (timerState.minutes * 60));
        const elapsedSeconds = Math.max(0, totalSeconds - remainingSeconds);

        if (elapsedSeconds >= TIMER_IMAGE_THRESHOLDS[4] * 60) return 'image/5.png';
        if (elapsedSeconds >= TIMER_IMAGE_THRESHOLDS[3] * 60) return 'image/4.png';
        if (elapsedSeconds >= TIMER_IMAGE_THRESHOLDS[2] * 60) return 'image/3.png';
        if (elapsedSeconds >= TIMER_IMAGE_THRESHOLDS[1] * 60) return 'image/2.png';
        return TIMER_IMAGE_SOURCES.default;
    };

    if (timerState.mode === 'short' || timerState.mode === 'long') {
        const pauseImageSrc = resolveImageSrc(TIMER_IMAGE_SOURCES.pause);

        if (timerImage.dataset.currentSrc === pauseImageSrc && timerImage.src.endsWith(pauseImageSrc)) return;

        timerImage.dataset.currentSrc = pauseImageSrc;
        timerImage.style.opacity = '0';

        const handleLoad = () => {
            timerImage.style.opacity = '1';
            timerImage.removeEventListener('load', handleLoad);
        };

        timerImage.addEventListener('load', handleLoad);
        timerImage.src = pauseImageSrc;
        timerImage.alt = 'Timer pausiert';

        updateTimerPetalsVisibility();

        if (timerImage.complete && timerImage.naturalWidth !== 0) {
            handleLoad();
        }

        return;
    }

    const imageSrc = resolveImageSrc();

    if (timerImage.dataset.currentSrc === imageSrc && timerImage.src.endsWith(imageSrc)) return;

    timerImage.dataset.currentSrc = imageSrc;
    timerImage.style.opacity = '0';

    const handleLoad = () => {
        timerImage.style.opacity = '1';
        timerImage.removeEventListener('load', handleLoad);
    };

    timerImage.addEventListener('load', handleLoad);
    timerImage.src = imageSrc;
    timerImage.alt = timerState.isPaused ? 'Timer pausiert' : 'Timer-Baum Fortschritt';

    updateTimerPetalsVisibility();

    if (timerImage.complete && timerImage.naturalWidth !== 0) {
        handleLoad();
    }
}

function updateTimerPetalsVisibility() {
    const fallingLayer = document.getElementById('timer-petal-layer');
    if (!fallingLayer) return;

    const remainingSeconds = Math.max(0, (timerState.minutes * 60) + timerState.seconds);
    const isFinalFiveMinutes = remainingSeconds <= 5 * 60;
    const animationUnlocked = treeState.level >= 5;

    const shouldShowPetals = animationUnlocked && timerState.isRunning && !timerState.isPaused && isFinalFiveMinutes;

    if (!shouldShowPetals) {
        fallingLayer.style.display = 'none';
        fallingLayer.innerHTML = '';
        return;
    }

    if (!fallingLayer.children.length) {
        addFallingPetals();
    }

    fallingLayer.style.display = 'block';
}

// ===================================
// TREE GROWTH ANIMATION
// ===================================

function setupTreeTimeline() {
    if (typeof gsap === 'undefined') return;

    const stage = document.getElementById('timer-tree-stage');
    if (!stage) return;

    if (treeTimeline) {
        treeTimeline.kill();
    }

    const petals = stage.parentElement?.querySelectorAll('#timer-petal-layer .timer-floating-petal');

    gsap.set(stage, { opacity: 0, y: 16, transformPerspective: 800, transformStyle: 'preserve-3d' });
    gsap.set('.tree-layer-trunk', { z: -10 });
    gsap.set('.tree-layer-branches', { z: 0 });
    gsap.set('.tree-layer-blooms', { z: 6 });
    gsap.set('.tree-layer-glow', { z: -4 });

    const swayLoop = gsap.to('#timer-tree-stage .tree-layer', {
        rotate: 1.4,
        yoyo: true,
        repeat: -1,
        duration: 5,
        ease: 'sine.inOut',
        paused: true
    });

    const glowNoise = gsap.to('.tree-layer-glow', {
        keyframes: [
            { opacity: 0.28, filter: 'blur(10px)', duration: 1.6 },
            { opacity: 0.36, filter: 'blur(6px)', duration: 1.2 },
            { opacity: 0.3, filter: 'blur(8px)', duration: 1.4 }
        ],
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        paused: true
    });

    treeLoopTimelines = [swayLoop, glowNoise];

    treeTimeline = gsap.timeline({
        paused: true,
        defaults: { ease: 'power2.out' }
    });

    treeTimeline
        .addLabel('intro')
        .fromTo(stage, { opacity: 0, y: 18, scale: 0.94, z: -20 }, { opacity: 1, y: 0, scale: 1, z: 0, duration: 0.9, ease: 'power1.out' })
        .fromTo('.tree-layer-trunk', { opacity: 0, y: 60, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 1.1 }, '-=0.5')
        .addLabel('trunk')
        .fromTo('.tree-layer-branches', { opacity: 0, y: 40, scale: 0.95, filter: 'blur(6px)' }, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.3 }, '-=0.4')
        .addLabel('branches')
        .fromTo('.tree-layer-blooms', { opacity: 0, scale: 0.8, filter: 'blur(10px)', z: 10 }, { opacity: 1, scale: 1, filter: 'blur(0px)', z: 0, duration: 1.2 }, '-=0.3')
        .addLabel('blooms')
        .to('.tree-layer-glow', { opacity: 0.35, duration: 0.6 }, '-=0.6')
        .addLabel('glowPulse')
        .to(petals, { opacity: 1, duration: 1, stagger: 0.08, ease: 'sine.out' }, '-=0.2')
        .addLabel('petalWave')
        .to('.tree-layer-blooms', { scale: 1.02, duration: 0.8, ease: 'sine.inOut' }, 'petalWave')
        .to('.tree-layer-glow', { opacity: 0.42, duration: 0.9, ease: 'sine.inOut' }, 'petalWave+=0.1')
        .addLabel('finale')
        .add(() => {
            playBloomFinale();
        });

    treeTimeline.eventCallback('onPlay', () => treeLoopTimelines.forEach(loop => loop.play()));
    treeTimeline.eventCallback('onPause', () => treeLoopTimelines.forEach(loop => loop.pause()));
}

function updateTreeGrowth() {
    if (!treeTimeline) return;

    const maxGrowthTime = timerState.totalSeconds;
    const growthProgress = Math.min(timerState.elapsedWithoutPause / maxGrowthTime, 1);

    const segments = [
        { range: [0, 0.2], from: 'intro', to: 'trunk' },
        { range: [0.2, 0.45], from: 'trunk', to: 'branches' },
        { range: [0.45, 0.8], from: 'branches', to: 'glowPulse' },
        { range: [0.8, 1], from: 'petalWave', to: 'glowPulse' }
    ];

    const segment = segments.find(seg => growthProgress >= seg.range[0] && growthProgress <= seg.range[1]) || segments[segments.length - 1];
    const normalized = gsap.utils.normalize(segment.range[0], segment.range[1], growthProgress);
    const totalDuration = treeTimeline.totalDuration();
    const startTime = treeTimeline.labels[segment.from] ?? 0;
    const endTime = treeTimeline.labels[segment.to] ?? totalDuration;
    const targetTime = gsap.utils.interpolate(startTime, endTime, normalized);

    if (treeScrubTween) treeScrubTween.kill();
    treeScrubTween = treeTimeline.tweenTo(targetTime, { duration: 0.25, ease: 'sine.out' });
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

function getLevelEmoji(level) {
    switch(level) {
        case 1: return '🌱';
        case 2: return '🌿';
        case 3: return '🌳';
        case 4: return '🌸';
        case 5: return '🌸🌸';
        case 6: return '🌸🌸🌸';
        default: return level > 6 ? '🌸🌸🌸' : '🌱';
    }
}

function initializeTree() {
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

    const levelEmoji = getLevelEmoji(treeState.level);
    showNotification(`${levelEmoji} Level ${treeState.level} erreicht!`, 'success');

    // Show branches based on level
    const branchGroup = document.getElementById(`branches-level-${treeState.level}`);
    if (branchGroup) {
        branchGroup.style.opacity = '1';
    }
}

function renderTree() {
    renderTimerCherryTree();

    // Update tree info
    const treeLevelElement = document.getElementById('tree-level');
    if (treeLevelElement) {
        const levelEmoji = getLevelEmoji(treeState.level);
        treeLevelElement.textContent = `Level ${treeState.level} ${levelEmoji}`;
    }

    const blossomsCountElement = document.getElementById('blossoms-count');
    if (blossomsCountElement) {
        blossomsCountElement.textContent = treeState.blossoms;
    }
}

function addFallingPetals() {
    const fallingPetalsContainer = document.getElementById('timer-petal-layer');
    if (!fallingPetalsContainer) return;

    const petalCount = Math.min(treeState.totalSessions + 6, 12);
    fallingPetalsContainer.innerHTML = '';

    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('span');
        petal.className = 'timer-floating-petal';
        petal.style.setProperty('--x', `${20 + Math.random() * 60}%`);
        petal.style.setProperty('--delay', `${Math.random() * 4}s`);
        petal.style.setProperty('--duration', `${12 + Math.random() * 6}s`);
        petal.style.setProperty('--scale', `${0.5 + Math.random() * 0.6}`);
        fallingPetalsContainer.appendChild(petal);
    }
}

function renderTimerCherryTree() {
    const wrapper = document.querySelector('.timer-tree-wrapper');
    if (!wrapper) return;

    let stage = wrapper.querySelector('#timer-tree-stage');
    if (!stage) {
        stage = document.createElement('div');
        stage.id = 'timer-tree-stage';
        stage.className = 'tree-visual-stage';
        stage.innerHTML = `
            <div class="tree-layer tree-layer-trunk"></div>
            <div class="tree-layer tree-layer-branches"></div>
            <div class="tree-layer tree-layer-blooms"></div>
            <div class="tree-layer tree-layer-glow"></div>
        `;
        wrapper.appendChild(stage);
    }

    let fallingLayer = wrapper.querySelector('#timer-petal-layer');
    if (!fallingLayer) {
        fallingLayer = document.createElement('div');
        fallingLayer.id = 'timer-petal-layer';
        fallingLayer.className = 'timer-petal-layer';
        wrapper.appendChild(fallingLayer);
    }

    setupTreeTimeline();
    updateTreeGrowth();
    updateTimerPetalsVisibility();
}

function playBloomFinale() {
    const wrapper = document.querySelector('.timer-tree-wrapper');
    if (!wrapper || typeof gsap === 'undefined') return;

    const finaleLayer = document.createElement('div');
    finaleLayer.className = 'tree-finale-layer';
    wrapper.appendChild(finaleLayer);

    const burstCount = 16;
    for (let i = 0; i < burstCount; i++) {
        const petal = document.createElement('span');
        petal.className = 'finale-petal';
        petal.style.setProperty('--hue', `${320 + Math.random() * 40}`);
        finaleLayer.appendChild(petal);

        const angle = (i / burstCount) * Math.PI * 2;
        const distance = 140 + Math.random() * 40;

        gsap.fromTo(petal,
            { x: 0, y: 0, scale: 0.4, opacity: 1, rotate: 0 },
            {
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                scale: 1.2,
                rotate: Math.random() * 220,
                duration: 1.4,
                ease: 'power2.out'
            }
        );
    }

    gsap.to(finaleLayer, { opacity: 0, duration: 1.2, delay: 1, onComplete: () => finaleLayer.remove() });
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
        lastActive: new Date().toDateString(),
        unlockedAchievements: [], // Array of unlocked achievement IDs
        sessionsToday: 0,
        lastSessionDate: new Date().toDateString(),
        consecutiveSessions: 0, // Sessions without interruption
        dailyLoginClaimed: false
    };

    const stored = safeGetItem('studytok_stats');
    if (stored) {
        const stats = safeParseJSON(stored, { ...defaultStats }, 'studytok_stats');

        // Ensure new properties exist
        if (!stats.unlockedAchievements) stats.unlockedAchievements = [];
        if (!stats.sessionsToday) stats.sessionsToday = 0;
        if (!stats.lastSessionDate) stats.lastSessionDate = new Date().toDateString();
        if (!stats.consecutiveSessions) stats.consecutiveSessions = 0;
        if (stats.dailyLoginClaimed === undefined) stats.dailyLoginClaimed = false;

        const today = new Date().toDateString();

        // Check if it's a new day
        if (stats.lastActive !== today) {
            const lastActiveDate = new Date(stats.lastActive);
            const todayDate = new Date(today);
            const daysDiff = Math.floor((todayDate - lastActiveDate) / (1000 * 60 * 60 * 24));

            // Update streak based on days passed
            if (daysDiff === 1) {
                stats.streak += 1;
            } else if (daysDiff > 1) {
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

function addSession() {
    const stats = getStats();
    const today = new Date().toDateString();

    // Update overall sessions
    stats.sessions++;
    stats.focusTime += 25;

    // Update daily sessions
    if (stats.lastSessionDate === today) {
        stats.sessionsToday++;
    } else {
        // New day, reset daily counter
        stats.sessionsToday = 1;
        stats.lastSessionDate = today;
    }

    // Update consecutive sessions (assuming no interruption during timer)
    stats.consecutiveSessions++;

    saveStats(stats);
    updateStats();

    // Check for achievements after updating stats
    checkAchievements();
}

function addPoints(points) {
    const stats = getStats();
    stats.points += points;
    saveStats(stats);
    updateStats();
}

function loadTimerState() {
    const stored = safeGetItem('studytok_timer');
    if (stored) {
        const saved = safeParseJSON(stored, {}, 'studytok_timer');
        if (!saved) return;
        const today = new Date().toDateString();

        if (!saved.lastCycleSessionDate) saved.lastCycleSessionDate = today;
        if (!Number.isFinite(saved.totalCycleSessions)) saved.totalCycleSessions = 0;
        if (typeof saved.isPaused !== 'boolean') saved.isPaused = false;

        if (saved.lastCycleSessionDate !== today) {
            saved.totalCycleSessions = 0;
            saved.lastCycleSessionDate = today;
        }

        timerState = { ...timerState, ...saved, interval: null };

        // Resume timer if it was running and hasn't completed yet
        if (saved.isRunning && saved.endTime) {
            const now = Date.now();
            const remainingSeconds = Math.max(0, Math.round((saved.endTime - now) / 1000));
            const timeSinceEnd = saved.endTime ? now - saved.endTime : 0;

            // If timer ended more than 1 hour ago, reset instead of completing
            const ONE_HOUR_MS = 60 * 60 * 1000;

            if (remainingSeconds > 0) {
                // Timer is still running, resume it
                timerState.isRunning = true;
                timerState.minutes = Math.floor(remainingSeconds / 60);
                timerState.seconds = remainingSeconds % 60;
                timerState.lastTick = now;

                // Restart the interval
                timerState.interval = setInterval(tick, 1000);

                // Update UI to show pause button
                setTimeout(() => {
                    const startBtn = document.getElementById('start-btn');
                    const pauseBtn = document.getElementById('pause-btn');
                    if (startBtn && pauseBtn) {
                        startBtn.style.display = 'none';
                        pauseBtn.style.display = 'block';
                    }
                }, 0);
            } else if (timeSinceEnd > ONE_HOUR_MS) {
                // Timer ended more than 1 hour ago - reset without triggering completion
                timerState.isRunning = false;
                timerState.mode = 'focus';
                timerState.minutes = 25;
                timerState.seconds = 0;
                timerState.totalSeconds = 25 * 60;
                timerState.endTime = null;
                timerState.lastTick = null;
                timerState.elapsedWithoutPause = 0;

                // Show info notification
                setTimeout(() => {
                    showNotification('⏰ Timer wurde nach langer Inaktivität zurückgesetzt', 'info');
                }, 500);

                updateDisplay();
                updateModeButtons();
                saveTimerState();
            } else {
                // Timer has completed while user was away (within last hour)
                timerState.isRunning = false;
                timerState.minutes = 0;
                timerState.seconds = 0;
                timerState.endTime = null;
                timerState.lastTick = null;

                // Trigger completion
                setTimeout(() => {
                    timerComplete();
                }, 100);
            }
        } else {
            timerState.isRunning = false;
        }
    }
}

function saveTimerState() {
    const toSave = {
        minutes: timerState.minutes,
        seconds: timerState.seconds,
        mode: timerState.mode,
        totalSeconds: timerState.totalSeconds,
        isRunning: timerState.isRunning,
        isPaused: timerState.isPaused,
        endTime: timerState.endTime,
        elapsedWithoutPause: timerState.elapsedWithoutPause,
        lastTick: timerState.lastTick,
        cycleCount: timerState.cycleCount,
        isInCycle: timerState.isInCycle,
        totalCycleSessions: timerState.totalCycleSessions,
        lastCycleSessionDate: timerState.lastCycleSessionDate
    };
    safeSetItem('studytok_timer', JSON.stringify(toSave));
}

function loadTreeState() {
    const stored = safeGetItem('studytok_tree');
    if (stored) {
        treeState = safeParseJSON(stored, treeState, 'studytok_tree');
    }
}

function saveTreeState() {
    safeSetItem('studytok_tree', JSON.stringify(treeState));
}

// ===================================
// PHASE TRANSITION POPUP
// ===================================

function showPhaseTransitionPopup(title, message, buttonText, onConfirm) {
    // Remove any existing popup
    const existingPopup = document.getElementById('phase-transition-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.id = 'phase-transition-popup';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease-out;
    `;

    // Create popup content
    const popup = document.createElement('div');
    popup.style.cssText = `
        background: var(--bg-card, white);
        border-radius: 16px;
        padding: 2.5rem;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        text-align: center;
        animation: slideUp 0.3s ease-out;
        border: 2px solid rgba(102, 126, 234, 0.3);
    `;

    popup.innerHTML = `
        <h2 style="
            font-family: 'Poppins', sans-serif;
            font-size: 1.8rem;
            margin: 0 0 1rem 0;
            color: var(--text-primary, #2c3e50);
            font-weight: 700;
        ">${title}</h2>
        <p style="
            font-family: 'Quicksand', sans-serif;
            font-size: 1.1rem;
            line-height: 1.6;
            margin: 0 0 2rem 0;
            color: var(--text-secondary, #5a6c7d);
            font-weight: 500;
        ">${message}</p>
        <button id="phase-transition-confirm" style="
            font-family: 'Poppins', sans-serif;
            font-size: 1.1rem;
            font-weight: 600;
            padding: 1rem 2.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        ">${buttonText}</button>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Add hover effect to button
    const confirmBtn = document.getElementById('phase-transition-confirm');
    confirmBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
    });
    confirmBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
    });

    // Handle confirm button click
    confirmBtn.addEventListener('click', () => {
        overlay.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            overlay.remove();
            if (onConfirm) {
                onConfirm();
            }
        }, 300);
    });

    // Add CSS animations
    if (!document.getElementById('popup-animations')) {
        const style = document.createElement('style');
        style.id = 'popup-animations';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
        `;
        document.head.appendChild(style);
    }
}

function updateModeButtons() {
    const focusBtn = document.querySelector('[data-mode="focus"]');
    const shortBtn = document.querySelector('[data-mode="short"]');
    const longBtn = document.querySelector('[data-mode="long"]');

    // Remove all active classes
    [focusBtn, shortBtn, longBtn].forEach(btn => {
        if (btn) btn.classList.remove('active');
    });

    // Add active class to current mode
    const currentBtn = document.querySelector(`[data-mode="${timerState.mode}"]`);
    if (currentBtn) {
        currentBtn.classList.add('active');
    }
}

// ===================================
// NOTIFICATIONS & SOUNDS
// ===================================

function initializeNotifications() {
    const notificationsCheckbox = document.getElementById('notifications');

    if (!notificationsCheckbox) return;

    // Check if browser supports notifications
    if (!('Notification' in window)) {
        // Browser doesn't support notifications
        notificationsCheckbox.checked = false;
        notificationsCheckbox.disabled = true;
        notificationsCheckbox.parentElement.title = 'Dein Browser unterstützt keine Benachrichtigungen';
        return;
    }

    // Check initial permission state
    updateNotificationCheckboxState();

    // Request permission when checkbox is clicked
    notificationsCheckbox.addEventListener('change', async function() {
        if (this.checked) {
            const permission = await requestNotificationPermission();
            if (!permission) {
                // Permission denied - uncheck the box
                this.checked = false;
            }
        }
    });

    // Request permission on load if checkbox is checked
    if (notificationsCheckbox.checked) {
        requestNotificationPermission();
    }
}

async function requestNotificationPermission() {
    if (!('Notification' in window)) {
        return false;
    }

    try {
        if (Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                showNotification('✅ Browser-Benachrichtigungen aktiviert', 'success');
                return true;
            } else if (permission === 'denied') {
                showNotification('❌ Benachrichtigungen wurden blockiert. Bitte in den Browser-Einstellungen erlauben.', 'warning');
                return false;
            }
        } else if (Notification.permission === 'granted') {
            return true;
        } else {
            // Permission denied
            showNotification('❌ Benachrichtigungen sind blockiert. Bitte in den Browser-Einstellungen erlauben.', 'warning');
            return false;
        }
    } catch (error) {
        console.error('Fehler beim Anfordern der Benachrichtigungsberechtigung:', error);
        showNotification('❌ Fehler beim Aktivieren der Benachrichtigungen', 'error');
        return false;
    }

    return false;
}

function updateNotificationCheckboxState() {
    const notificationsCheckbox = document.getElementById('notifications');
    if (!notificationsCheckbox) return;

    // Update checkbox based on permission state
    if (Notification.permission === 'granted') {
        notificationsCheckbox.checked = true;
    } else if (Notification.permission === 'denied') {
        notificationsCheckbox.checked = false;
        // Add visual indicator that permission was denied
        notificationsCheckbox.parentElement.title = 'Benachrichtigungen wurden blockiert. Klicke hier und erlaube sie in deinen Browser-Einstellungen.';
    }
}

function showNotification(message, type = 'success') {
    // Always show in-app notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Determine background color based on type
    let bgColor = '#4CAF50'; // success (green)
    if (type === 'error') bgColor = '#FF5252'; // red
    if (type === 'info') bgColor = '#2196F3'; // blue
    if (type === 'warning') bgColor = '#FFC107'; // yellow

    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${bgColor};
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

    // Show browser notification if enabled and supported
    showBrowserNotification(message);
}

function showBrowserNotification(message) {
    const notificationsEnabled = document.getElementById('notifications')?.checked;

    // Only send browser notification if:
    // 1. Checkbox is enabled
    // 2. Browser supports notifications
    // 3. User has granted permission
    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
        try {
            const notification = new Notification('StudyTok Companion - Pomodoro Timer', {
                body: message,
                icon: 'image/1.png', // Use tree icon as fallback
                tag: 'pomodoro-timer',
                requireInteraction: false,
                silent: false,
                vibrate: [200, 100, 200] // Vibration pattern for mobile devices
            });

            // Auto-close after 8 seconds (give user time to see it)
            setTimeout(() => {
                try {
                    notification.close();
                } catch (e) {
                    // Notification might already be closed
                }
            }, 8000);

            // Focus window when notification is clicked
            notification.onclick = function() {
                window.focus();
                try {
                    this.close();
                } catch (e) {
                    // Ignore if already closed
                }
            };

            // Handle notification errors
            notification.onerror = function(error) {
                console.warn('Notification error:', error);
            };
        } catch (error) {
            console.error('Fehler beim Anzeigen der Browser-Benachrichtigung:', error);
            // Disable notifications checkbox if there's an error
            const checkbox = document.getElementById('notifications');
            if (checkbox) {
                checkbox.checked = false;
            }
        }
    } else if (notificationsEnabled && Notification.permission !== 'granted') {
        // User has checkbox enabled but hasn't granted permission
        // Show in-app notification to remind them
        console.log('Benachrichtigungen sind aktiviert, aber die Berechtigung wurde nicht erteilt');
    }
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
// ACHIEVEMENTS SYSTEM
// ===================================

// Achievement definitions
const ACHIEVEMENTS = [
    {
        id: 'daily-login',
        name: 'Jeden Tag ein Bisschen',
        description: 'Erster täglicher Login',
        emoji: '🌅',
        check: (stats) => stats.dailyLoginClaimed === true
    },
    {
        id: 'first-steps',
        name: 'Erste Schritte',
        description: 'Erste Pomodoro-Session abgeschlossen',
        emoji: '🌱',
        check: (stats) => stats.sessions >= 1
    },
    {
        id: 'on-fire',
        name: 'On Fire!',
        description: '5 Sessions an einem Tag',
        emoji: '🔥',
        check: (stats) => stats.sessionsToday >= 5
    },
    {
        id: 'focus-master',
        name: 'Fokus-Meister',
        description: '10 Sessions ohne Unterbrechung',
        emoji: '💎',
        check: (stats) => stats.consecutiveSessions >= 10
    },
    {
        id: 'iron-streak',
        name: 'Iron Streak',
        description: '20 Sessions ohne Unterbrechung',
        emoji: '🛡️',
        check: (stats) => stats.consecutiveSessions >= 20
    },
    {
        id: 'study-king',
        name: 'Studier-König',
        description: '7 Tage Streak',
        emoji: '👑',
        check: (stats) => stats.streak >= 7
    },
    {
        id: 'point-collector',
        name: 'Punkte-Sammler',
        description: '500 Punkte gesammelt',
        emoji: '💰',
        check: (stats) => stats.points >= 500
    },
    {
        id: 'filthy-rich',
        name: 'Filthy Rich',
        description: 'Geheimes Achievement freigeschaltet',
        emoji: '💎',
        check: (stats) => stats.unlockedAchievements.includes('filthy-rich'),
        hidden: true // Only show when unlocked
    }
];

function checkAchievements() {
    const stats = getStats();
    let newlyUnlocked = [];

    ACHIEVEMENTS.forEach(achievement => {
        // Check if achievement is not already unlocked
        if (!stats.unlockedAchievements.includes(achievement.id)) {
            // Check if achievement condition is met
            if (achievement.check(stats)) {
                unlockAchievement(achievement.id);
                newlyUnlocked.push(achievement);
            }
        }
    });

    // Show notifications for newly unlocked achievements
    newlyUnlocked.forEach(achievement => {
        showAchievementNotification(achievement);
    });
}

function unlockAchievement(achievementId) {
    const stats = getStats();

    // Add to unlocked achievements if not already there
    if (!stats.unlockedAchievements.includes(achievementId)) {
        stats.unlockedAchievements.push(achievementId);
        stats.achievements = stats.unlockedAchievements.length;
        saveStats(stats);
        updateAchievementUI();
        updateStats();
    }
}

function updateAchievementUI() {
    const stats = getStats();
    const achievementCards = document.querySelectorAll('.achievement-card');

    achievementCards.forEach((card, index) => {
        if (index < ACHIEVEMENTS.length) {
            const achievement = ACHIEVEMENTS[index];
            const isUnlocked = stats.unlockedAchievements.includes(achievement.id);

            // Handle hidden achievements (only show when unlocked)
            if (achievement.hidden) {
                if (isUnlocked) {
                    card.style.display = 'block';
                    card.classList.remove('locked');
                    card.classList.add('unlocked');
                } else {
                    card.style.display = 'none';
                }
            } else {
                if (isUnlocked) {
                    card.classList.remove('locked');
                    card.classList.add('unlocked');
                } else {
                    card.classList.remove('unlocked');
                    card.classList.add('locked');
                }
            }
        }
    });
}

function initializeAchievements() {
    // Update achievement UI on page load
    updateAchievementUI();

    // Check for any achievements that might have been earned
    // (useful when streak or other time-based achievements are met)
    checkAchievements();
}

function showAchievementNotification(achievement) {
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
        const style = document.createElement('style');
        style.id = 'achievement-animations';
        style.textContent = `
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
        document.head.appendChild(style);
    }

    // Auto-remove after 4 seconds
    setTimeout(() => {
        popup.style.animation = 'achievementFadeOut 0.4s ease-out forwards';
        setTimeout(() => popup.remove(), 400);
    }, 4000);

    // Play a celebratory sound
    playCelebrationSound();
}

function playCelebrationSound() {
    // Create celebratory sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Play a sequence of notes
    const notes = [523.25, 659.25, 783.99]; // C, E, G (major chord)
    notes.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        const startTime = audioContext.currentTime + (index * 0.15);
        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.4);
    });
}
