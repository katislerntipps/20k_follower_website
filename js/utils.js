// ===================================
// UTILS.JS - Zentrale Utility-Funktionen
// ===================================

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
