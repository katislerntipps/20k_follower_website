// ===================================
// LISTENER MANAGER - Event Listener Verwaltung
// ===================================

/**
 * Listener Manager Klasse für sauberes Event Handling
 */
export class ListenerManager {
    constructor(name = 'default') {
        this.name = name;
        this.listeners = [];
        console.log(`[ListenerManager] Created: ${name}`);
    }

    /**
     * Event Listener hinzufügen
     * @param {Element} element - Das Element
     * @param {string} event - Event-Name
     * @param {Function} handler - Handler-Funktion
     * @param {Object} options - Event-Optionen
     * @returns {number} Listener-ID
     */
    add(element, event, handler, options = {}) {
        if (!element || !event || !handler) {
            console.warn('[ListenerManager] Invalid parameters:', { element, event, handler });
            return -1;
        }

        element.addEventListener(event, handler, options);

        const listenerId = this.listeners.length;
        this.listeners.push({
            id: listenerId,
            element,
            event,
            handler,
            options,
            timestamp: Date.now()
        });

        return listenerId;
    }

    /**
     * Event Listener hinzufügen mit automatischem Cleanup bei Element-Entfernung
     * @param {Element} element - Das Element
     * @param {string} event - Event-Name
     * @param {Function} handler - Handler-Funktion
     * @param {Object} options - Event-Optionen
     * @returns {number} Listener-ID
     */
    addWithCleanup(element, event, handler, options = {}) {
        const listenerId = this.add(element, event, handler, options);

        // Setup MutationObserver für automatisches Cleanup
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.removedNodes.forEach((node) => {
                        if (node === element || (node.contains && node.contains(element))) {
                            this.remove(listenerId);
                            observer.disconnect();
                        }
                    });
                });
            });

            if (element.parentNode) {
                observer.observe(element.parentNode, {
                    childList: true,
                    subtree: true
                });
            }
        }

        return listenerId;
    }

    /**
     * Spezifischen Listener entfernen
     * @param {number} listenerId - Listener-ID
     * @returns {boolean} Erfolgreich entfernt
     */
    remove(listenerId) {
        const listener = this.listeners.find(l => l.id === listenerId);

        if (listener) {
            listener.element.removeEventListener(
                listener.event,
                listener.handler,
                listener.options
            );

            this.listeners = this.listeners.filter(l => l.id !== listenerId);
            return true;
        }

        return false;
    }

    /**
     * Alle Listener für ein bestimmtes Element entfernen
     * @param {Element} element - Das Element
     * @returns {number} Anzahl entfernter Listener
     */
    removeByElement(element) {
        const toRemove = this.listeners.filter(l => l.element === element);

        toRemove.forEach(listener => {
            listener.element.removeEventListener(
                listener.event,
                listener.handler,
                listener.options
            );
        });

        this.listeners = this.listeners.filter(l => l.element !== element);

        return toRemove.length;
    }

    /**
     * Alle Listener für einen Event-Typ entfernen
     * @param {string} eventType - Event-Typ (z.B. 'click')
     * @returns {number} Anzahl entfernter Listener
     */
    removeByEvent(eventType) {
        const toRemove = this.listeners.filter(l => l.event === eventType);

        toRemove.forEach(listener => {
            listener.element.removeEventListener(
                listener.event,
                listener.handler,
                listener.options
            );
        });

        this.listeners = this.listeners.filter(l => l.event !== eventType);

        return toRemove.length;
    }

    /**
     * Alle Listener entfernen
     * @returns {number} Anzahl entfernter Listener
     */
    removeAll() {
        const count = this.listeners.length;

        this.listeners.forEach(listener => {
            try {
                listener.element.removeEventListener(
                    listener.event,
                    listener.handler,
                    listener.options
                );
            } catch (error) {
                console.warn('[ListenerManager] Error removing listener:', error);
            }
        });

        this.listeners = [];
        console.log(`[ListenerManager] Removed ${count} listeners from ${this.name}`);

        return count;
    }

    /**
     * Anzahl aktiver Listener
     * @returns {number} Anzahl Listener
     */
    count() {
        return this.listeners.length;
    }

    /**
     * Info über alle Listener
     * @returns {Array} Listener-Informationen
     */
    getInfo() {
        return this.listeners.map(l => ({
            id: l.id,
            element: l.element.tagName || l.element.constructor.name,
            event: l.event,
            age: Date.now() - l.timestamp
        }));
    }

    /**
     * Debug-Info loggen
     */
    debug() {
        console.log(`[ListenerManager] ${this.name}:`, {
            count: this.listeners.length,
            listeners: this.getInfo()
        });
    }
}

// ===================================
// GLOBALE LISTENER MANAGER
// ===================================

const globalManagers = new Map();

/**
 * Globalen Listener Manager erstellen oder abrufen
 * @param {string} name - Name des Managers
 * @returns {ListenerManager} Listener Manager
 */
export function getListenerManager(name = 'global') {
    if (!globalManagers.has(name)) {
        globalManagers.set(name, new ListenerManager(name));
    }
    return globalManagers.get(name);
}

/**
 * Alle globalen Listener Manager bereinigen
 */
export function cleanupAllListeners() {
    let totalRemoved = 0;

    globalManagers.forEach((manager, name) => {
        const removed = manager.removeAll();
        totalRemoved += removed;
    });

    console.log(`[ListenerManager] Cleaned up ${totalRemoved} total listeners`);
    return totalRemoved;
}

/**
 * Debug-Info für alle Manager
 */
export function debugAllManagers() {
    globalManagers.forEach((manager, name) => {
        manager.debug();
    });
}

// Cleanup bei Page Unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        cleanupAllListeners();
    });
}

// Export zur globalen Verwendung
if (typeof window !== 'undefined') {
    window.ListenerManager = ListenerManager;
    window.getListenerManager = getListenerManager;
    window.cleanupAllListeners = cleanupAllListeners;
    window.debugAllManagers = debugAllManagers;
}
