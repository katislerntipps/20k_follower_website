// ===================================
// UTILS.JS - Zentrale Utility-Funktionen
// ===================================

// Import analytics for error tracking
import analytics from './modules/analytics.js';

// ===================================
// SECURITY: Safe HTML Rendering
// ===================================

/**
 * Sanitisiert HTML-String durch Escaping gefährlicher Zeichen
 * @param {string} html - Der zu sanitisierende HTML-String
 * @returns {string} Sicherer HTML-String
 */
function sanitizeHTML(html) {
    if (typeof html !== 'string') {
        return '';
    }

    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    };

    return html.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Erstellt ein HTML-Element sicher aus Text-Content
 * @param {string} tagName - Tag-Name (z.B. 'div', 'p', 'span')
 * @param {string} textContent - Text-Inhalt (wird automatisch escaped)
 * @param {Object} attributes - Attribute als Key-Value Paare
 * @returns {HTMLElement} Das erstellte Element
 */
function createSafeElement(tagName, textContent = '', attributes = {}) {
    const element = document.createElement(tagName);

    // Setze Text-Content (sicher vor XSS)
    if (textContent) {
        element.textContent = textContent;
    }

    // Setze Attribute
    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            for (const [dataKey, dataValue] of Object.entries(value)) {
                element.dataset[dataKey] = dataValue;
            }
        } else {
            element.setAttribute(key, value);
        }
    }

    return element;
}

/**
 * Setzt innerHTML sicher - nur für vertrauenswürdige HTML-Strings mit Icons/Emojis
 * WICHTIG: Nutze diese Funktion NUR wenn du dir sicher bist, dass der HTML-String sicher ist!
 * Für User-generierte Inhalte IMMER textContent verwenden!
 * @param {HTMLElement} element - Das Ziel-Element
 * @param {string} html - Der HTML-String
 */
function setSafeInnerHTML(element, html) {
    // Prüfe auf potentiell gefährliche Patterns
    const dangerousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i, // onclick, onload, etc.
        /<iframe/i,
        /<object/i,
        /<embed/i
    ];

    for (const pattern of dangerousPatterns) {
        if (pattern.test(html)) {
            console.error('⚠️ SECURITY WARNING: Gefährlicher HTML-Code erkannt!', html);
            element.textContent = 'Fehler: Ungültiger Inhalt';
            return;
        }
    }

    element.innerHTML = html;
}

/**
 * Erstellt ein komplexes Element mit Kindern (sicher vor XSS)
 * @param {string} tagName - Tag-Name
 * @param {Object} options - Optionen
 * @param {string} options.className - CSS-Klassen
 * @param {Array} options.children - Array von Child-Elementen oder Strings
 * @returns {HTMLElement}
 */
function createElementWithChildren(tagName, options = {}) {
    const element = document.createElement(tagName);

    if (options.className) {
        element.className = options.className;
    }

    if (options.id) {
        element.id = options.id;
    }

    if (options.attributes) {
        for (const [key, value] of Object.entries(options.attributes)) {
            element.setAttribute(key, value);
        }
    }

    if (options.children) {
        for (const child of options.children) {
            if (typeof child === 'string') {
                // Text-Node erstellen (sicher!)
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof HTMLElement) {
                element.appendChild(child);
            }
        }
    }

    return element;
}

// ===================================
// LOADING STATES
// ===================================

/**
 * Zeigt einen globalen Loading-Indikator
 * @param {string} message - Loading-Nachricht
 * @returns {HTMLElement} Das Loading-Element (für späteren Cleanup)
 */
function showLoading(message = 'Lädt...') {
    // Remove existing loader
    hideLoading();

    const loader = createElementWithChildren('div', {
        id: 'global-loader',
        className: 'global-loader',
        children: [
            createElementWithChildren('div', {
                className: 'loader-overlay',
                children: [
                    createElementWithChildren('div', {
                        className: 'loader-spinner'
                    }),
                    createSafeElement('p', message, { className: 'loader-message' })
                ]
            })
        ]
    });

    document.body.appendChild(loader);

    // Fade in
    requestAnimationFrame(() => {
        loader.classList.add('visible');
    });

    return loader;
}

/**
 * Versteckt den globalen Loading-Indikator
 */
function hideLoading() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.classList.remove('visible');
        setTimeout(() => loader.remove(), 300);
    }
}

/**
 * Zeigt einen Button-spezifischen Loading-State
 * @param {HTMLButtonElement} button - Der Button
 * @param {boolean} isLoading - Loading-State
 * @param {string} loadingText - Text während Loading
 */
function setButtonLoading(button, isLoading, loadingText = 'Lädt...') {
    if (!button) return;

    if (isLoading) {
        button.dataset.originalText = button.textContent;
        button.disabled = true;
        button.classList.add('loading');
        button.textContent = loadingText;
    } else {
        button.disabled = false;
        button.classList.remove('loading');
        button.textContent = button.dataset.originalText || button.textContent;
        delete button.dataset.originalText;
    }
}

// ===================================
// ENHANCED NOTIFICATIONS
// ===================================

/**
 * Zeigt eine erweiterte Notification mit mehr Features
 * @param {string} message - Die Nachricht
 * @param {string} type - Typ: 'success', 'error', 'warning', 'info'
 * @param {Object} options - Zusätzliche Optionen
 */
function showEnhancedNotification(message, type = 'success', options = {}) {
    const {
        duration = 3000,
        actionText = null,
        onAction = null,
        persistent = false
    } = options;

    const iconMap = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const colorMap = {
        success: '#4CAF50',
        error: '#FF5252',
        warning: '#FFC107',
        info: '#2196F3'
    };

    const notification = createElementWithChildren('div', {
        className: `enhanced-notification enhanced-notification-${type}`,
        children: [
            createElementWithChildren('div', {
                className: 'notification-content',
                children: [
                    createSafeElement('span', iconMap[type], { className: 'notification-icon' }),
                    createSafeElement('span', message, { className: 'notification-message' })
                ]
            })
        ]
    });

    // Add action button if provided
    if (actionText && onAction) {
        const actionBtn = createSafeElement('button', actionText, {
            className: 'notification-action'
        });
        actionBtn.addEventListener('click', () => {
            onAction();
            notification.remove();
        });
        notification.querySelector('.notification-content').appendChild(actionBtn);
    }

    // Add close button if not persistent
    if (!persistent) {
        const closeBtn = createSafeElement('button', '×', {
            className: 'notification-close',
            'aria-label': 'Schließen'
        });
        closeBtn.addEventListener('click', () => notification.remove());
        notification.appendChild(closeBtn);
    }

    document.body.appendChild(notification);

    // Fade in
    requestAnimationFrame(() => {
        notification.classList.add('visible');
    });

    // Auto-remove
    if (!persistent && duration > 0) {
        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    return notification;
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sanitizeHTML,
        createSafeElement,
        setSafeInnerHTML,
        createElementWithChildren,
        showLoading,
        hideLoading,
        setButtonLoading,
        showEnhancedNotification
    };
}

// ===================================
// SERVICE WORKER REGISTRATION
// ===================================

/**
 * Registriert den Service Worker für Offline-Funktionalität
 */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then((registration) => {
                    console.log('✅ Service Worker registered:', registration.scope);

                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        console.log('🔄 Service Worker update found');

                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New version available
                                showUpdateNotification(newWorker);
                            }
                        });
                    });
                })
                .catch((error) => {
                    console.warn('⚠️ Service Worker registration failed:', error);
                });
        });
    }
}

/**
 * Zeigt Benachrichtigung bei verfügbarem Update
 */
function showUpdateNotification(newWorker) {
    if (typeof showEnhancedNotification === 'function') {
        showEnhancedNotification(
            '🔄 Neue Version verfügbar!',
            'info',
            {
                persistent: true,
                actionText: 'Jetzt aktualisieren',
                onAction: () => {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                }
            }
        );
    }
}

// Auto-register Service Worker
registerServiceWorker();

// ===================================
// ERROR BOUNDARIES & GLOBAL ERROR HANDLING
// ===================================

let errorCount = 0;
const MAX_ERRORS_BEFORE_RELOAD = 10; // Erhöht von 5 auf 10
const ERROR_RESET_TIME = 60000; // 1 minute
let lastErrorNotificationTime = 0;
const ERROR_NOTIFICATION_COOLDOWN = 5000; // 5 seconds between notifications

/**
 * Prüft ob ein Fehler ignoriert werden sollte (z.B. Service Worker Updates)
 */
function shouldIgnoreError(event) {
    const message = event.message || '';
    const filename = event.filename || '';

    // Ignoriere Script-Loading-Fehler während Service Worker Updates
    if (message.includes('Loading chunk') ||
        message.includes('Loading CSS chunk') ||
        message.includes('Failed to fetch')) {
        return true;
    }

    // Ignoriere Fehler von Browser-Extensions
    if (filename.includes('chrome-extension://') ||
        filename.includes('moz-extension://')) {
        return true;
    }

    // Ignoriere ResizeObserver loop errors (harmlos)
    if (message.includes('ResizeObserver loop')) {
        return true;
    }

    return false;
}

/**
 * Globaler Error Handler für unbehandelte Fehler
 */
window.addEventListener('error', (event) => {
    // Ignoriere bestimmte unkritische Fehler
    if (shouldIgnoreError(event)) {
        console.warn('⚠️ Ignoring non-critical error:', event.message);
        return;
    }

    console.error('🔴 Global Error:', event.error);

    errorCount++;

    // Log error details
    const errorInfo = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack || event.error
    };

    console.error('Error details:', errorInfo);

    // Track error in analytics
    try {
        analytics.trackError(
            event.message || 'Unknown error',
            event.error?.stack || String(event.error),
            {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                type: 'global_error'
            }
        );
    } catch (analyticsError) {
        console.warn('Failed to track error in analytics:', analyticsError);
    }

    // Zeige Benachrichtigung nur wenn:
    // 1. Genug Zeit seit letzter Benachrichtigung vergangen ist
    // 2. Fehleranzahl kritisch wird (> 3)
    const now = Date.now();
    const shouldShowNotification =
        (now - lastErrorNotificationTime > ERROR_NOTIFICATION_COOLDOWN) &&
        errorCount > 3;

    if (shouldShowNotification && typeof showEnhancedNotification === 'function') {
        lastErrorNotificationTime = now;
        showEnhancedNotification(
            'Es sind mehrere Fehler aufgetreten.',
            'warning',
            {
                duration: 4000,
                actionText: 'Neu laden',
                onAction: () => window.location.reload()
            }
        );
    }

    // Auto-reload nur bei sehr vielen Fehlern
    if (errorCount >= MAX_ERRORS_BEFORE_RELOAD) {
        console.error('🔴 Too many errors, reloading page...');
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }

    // Reset error count after timeout
    setTimeout(() => {
        errorCount = Math.max(0, errorCount - 1);
    }, ERROR_RESET_TIME);

    // Prevent default error handling
    event.preventDefault();
});

/**
 * Handler für unbehandelte Promise-Rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    const reason = String(event.reason || '');

    // Ignoriere unkritische Promise-Rejections (z.B. abgebrochene Fetch-Requests)
    if (reason.includes('Failed to fetch') ||
        reason.includes('NetworkError') ||
        reason.includes('AbortError')) {
        console.warn('⚠️ Ignoring non-critical promise rejection:', event.reason);
        return;
    }

    console.error('🔴 Unhandled Promise Rejection:', event.reason);

    errorCount++;

    // Log error details
    console.error('Promise rejection details:', {
        reason: event.reason,
        promise: event.promise
    });

    // Track error in analytics
    try {
        analytics.trackError(
            'Unhandled Promise Rejection',
            event.reason?.stack || String(event.reason),
            {
                type: 'promise_rejection'
            }
        );
    } catch (analyticsError) {
        console.warn('Failed to track promise rejection in analytics:', analyticsError);
    }

    // Zeige Benachrichtigung nur bei kritischen Fehlern
    const now = Date.now();
    const shouldShowNotification =
        (now - lastErrorNotificationTime > ERROR_NOTIFICATION_COOLDOWN) &&
        errorCount > 3;

    if (shouldShowNotification && typeof showEnhancedNotification === 'function') {
        lastErrorNotificationTime = now;
        showEnhancedNotification(
            'Fehler beim Laden von Daten.',
            'warning',
            {
                duration: 4000,
                actionText: 'Neu laden',
                onAction: () => window.location.reload()
            }
        );
    }

    // Prevent default handling
    event.preventDefault();
});

/**
 * Safe Function Wrapper - führt Funktionen mit Error-Handling aus
 * @param {Function} fn - Die auszuführende Funktion
 * @param {string} context - Kontext für bessere Fehler-Meldungen
 * @returns {Function} Wrapped function
 */
function safeExecute(fn, context = 'Function') {
    return async function(...args) {
        try {
            return await fn.apply(this, args);
        } catch (error) {
            console.error(`Error in ${context}:`, error);

            if (typeof showEnhancedNotification === 'function') {
                showEnhancedNotification(
                    `Fehler in ${context}. Bitte versuche es erneut.`,
                    'error',
                    {
                        actionText: 'Wiederholen',
                        onAction: () => fn.apply(this, args)
                    }
                );
            }

            throw error;
        }
    };
}

/**
 * Retry-Logik für fehleranfällige Operationen
 * @param {Function} fn - Funktion zum Ausführen
 * @param {number} maxRetries - Maximale Anzahl Versuche
 * @param {number} delay - Verzögerung zwischen Versuchen (ms)
 */
async function retryOperation(fn, maxRetries = 3, delay = 1000) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            console.warn(`Attempt ${attempt}/${maxRetries} failed:`, error);

            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, delay * attempt));
            }
        }
    }

    throw lastError;
}

// Export Error-Handling Functions
if (typeof window !== 'undefined') {
    window.safeExecute = safeExecute;
    window.retryOperation = retryOperation;
}

