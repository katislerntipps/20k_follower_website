// ===================================
// ANALYTICS MODULE - Privacy-First Event Tracking
// Version: 1.0.0
// ===================================

/**
 * Privacy-freundliches Analytics-System
 * - Keine Cookies
 * - Keine personenbezogenen Daten
 * - Speicherung in localStorage
 * - Optional: Server-Sync für aggregierte Daten
 */

const ANALYTICS_KEY = 'studytok_analytics';
const MAX_EVENTS = 500;
const BATCH_SIZE = 50;
const SYNC_INTERVAL = 300000; // 5 Minuten

// ===================================
// EVENT TYPES
// ===================================

/**
 * @typedef {Object} AnalyticsEvent
 * @property {string} name - Event-Name
 * @property {Object} properties - Event-Properties
 * @property {number} timestamp - Unix-Timestamp
 * @property {string} page - Seiten-URL
 * @property {string} sessionId - Session-ID (nicht user-identifizierbar)
 */

// ===================================
// ANALYTICS CLASS
// ===================================

class Analytics {
    constructor(options = {}) {
        this.enabled = options.enabled !== false;
        this.debug = options.debug || false;
        this.serverUrl = options.serverUrl || null;
        this.sessionId = this.getOrCreateSessionId();
        this.queue = [];
        this.syncing = false;

        if (this.enabled) {
            this.log('Analytics initialized', { sessionId: this.sessionId });
            this.setupAutoSync();
            this.trackPageView();
        }
    }

    /**
     * Session-ID generieren (nicht user-identifizierbar)
     * Ändert sich bei jedem Browser-Neustart
     */
    getOrCreateSessionId() {
        let sessionId = sessionStorage.getItem('analytics_session');

        if (!sessionId) {
            // Generiere zufällige Session-ID
            sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('analytics_session', sessionId);
        }

        return sessionId;
    }

    /**
     * Event tracken
     * @param {string} eventName - Name des Events
     * @param {Object} properties - Event-Properties
     */
    track(eventName, properties = {}) {
        if (!this.enabled) return;

        const event = {
            name: eventName,
            properties: this.sanitizeProperties(properties),
            timestamp: Date.now(),
            page: window.location.pathname,
            sessionId: this.sessionId,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            userAgent: this.getBrowserInfo()
        };

        this.log('Track event:', event);

        // Zu Queue hinzufügen
        this.queue.push(event);

        // Sofort speichern
        this.saveToStorage();

        // Batch-Sync wenn Queue voll
        if (this.queue.length >= BATCH_SIZE) {
            this.sync();
        }
    }

    /**
     * Page View tracken
     */
    trackPageView() {
        this.track('page_view', {
            title: document.title,
            referrer: document.referrer || 'direct'
        });
    }

    /**
     * Timer Events
     */
    trackTimerStart(mode, duration) {
        this.track('timer_start', { mode, duration });
    }

    trackTimerComplete(mode, duration, wasInterrupted) {
        this.track('timer_complete', {
            mode,
            duration,
            wasInterrupted,
            completionRate: wasInterrupted ? 0 : 100
        });
    }

    trackTimerPause(mode, timeElapsed) {
        this.track('timer_pause', { mode, timeElapsed });
    }

    /**
     * Learning Tips
     */
    trackTipGenerated(category, difficulty) {
        this.track('tip_generated', { category, difficulty });
    }

    trackTipFavorited(tipTitle) {
        this.track('tip_favorited', { tipTitle });
    }

    /**
     * Shop Events
     */
    trackShopView() {
        this.track('shop_view');
    }

    trackShopPurchase(itemName, price, pointsRemaining) {
        this.track('shop_purchase', {
            itemName,
            price,
            pointsRemaining,
            conversionValue: price
        });
    }

    trackShopItemView(itemName, price) {
        this.track('shop_item_view', { itemName, price });
    }

    /**
     * Achievement Events
     */
    trackAchievementUnlocked(achievementId, achievementName) {
        this.track('achievement_unlocked', {
            achievementId,
            achievementName
        });
    }

    /**
     * Error Tracking
     */
    trackError(errorMessage, errorStack, context) {
        this.track('error', {
            message: errorMessage,
            stack: errorStack ? errorStack.substring(0, 500) : null,
            context
        });
    }

    /**
     * Performance Tracking
     */
    trackPerformance(metric, value) {
        this.track('performance', {
            metric,
            value,
            unit: 'ms'
        });
    }

    /**
     * Custom Conversion Events
     */
    trackConversion(conversionName, value = 1) {
        this.track('conversion', {
            name: conversionName,
            value
        });
    }

    /**
     * Sanitize Properties (entferne PII)
     */
    sanitizeProperties(properties) {
        const sanitized = { ...properties };

        // Entferne potentiell sensible Daten
        const sensitiveKeys = ['email', 'password', 'token', 'api_key', 'phone', 'address'];

        sensitiveKeys.forEach(key => {
            if (key in sanitized) {
                delete sanitized[key];
            }
        });

        // Truncate lange Strings
        Object.keys(sanitized).forEach(key => {
            if (typeof sanitized[key] === 'string' && sanitized[key].length > 200) {
                sanitized[key] = sanitized[key].substring(0, 200) + '...';
            }
        });

        return sanitized;
    }

    /**
     * Browser-Info sammeln (nicht user-identifizierbar)
     */
    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';

        if (ua.includes('Firefox')) browser = 'Firefox';
        else if (ua.includes('Chrome')) browser = 'Chrome';
        else if (ua.includes('Safari')) browser = 'Safari';
        else if (ua.includes('Edge')) browser = 'Edge';

        return browser;
    }

    /**
     * Events in localStorage speichern
     */
    saveToStorage() {
        try {
            const stored = this.getAllEvents();
            const combined = [...stored, ...this.queue];

            // Behalte nur neueste MAX_EVENTS
            const trimmed = combined.slice(-MAX_EVENTS);

            localStorage.setItem(ANALYTICS_KEY, JSON.stringify(trimmed));
            this.queue = [];
        } catch (error) {
            console.warn('[Analytics] Fehler beim Speichern:', error);
        }
    }

    /**
     * Alle Events aus Storage holen
     */
    getAllEvents() {
        try {
            const stored = localStorage.getItem(ANALYTICS_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.warn('[Analytics] Fehler beim Laden:', error);
            return [];
        }
    }

    /**
     * Auto-Sync Setup
     */
    setupAutoSync() {
        if (!this.serverUrl) return;

        // Sync alle 5 Minuten
        setInterval(() => {
            this.sync();
        }, SYNC_INTERVAL);

        // Sync bei Page Unload
        window.addEventListener('beforeunload', () => {
            this.sync(true); // Force sync
        });
    }

    /**
     * Events zum Server senden
     */
    async sync(force = false) {
        if (!this.serverUrl || this.syncing) return;
        if (!force && this.queue.length === 0) return;

        this.syncing = true;
        this.log('Syncing events to server...');

        try {
            const events = this.getAllEvents();

            if (events.length === 0) {
                this.syncing = false;
                return;
            }

            // Sende zu Server
            const response = await fetch(this.serverUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    events,
                    meta: {
                        version: '1.0.0',
                        timestamp: Date.now()
                    }
                }),
                keepalive: force // Wichtig für beforeunload
            });

            if (response.ok) {
                this.log('Sync successful');

                // Lösche gesyncte Events
                localStorage.removeItem(ANALYTICS_KEY);
            } else {
                this.log('Sync failed:', response.status);
            }
        } catch (error) {
            this.log('Sync error:', error);
        } finally {
            this.syncing = false;
        }
    }

    /**
     * Analytics-Report generieren
     */
    getReport() {
        const events = this.getAllEvents();

        return {
            summary: {
                totalEvents: events.length,
                uniqueSessions: new Set(events.map(e => e.sessionId)).size,
                timeRange: {
                    start: events[0]?.timestamp || Date.now(),
                    end: events[events.length - 1]?.timestamp || Date.now()
                }
            },
            byEventType: this.groupBy(events, 'name'),
            byPage: this.groupBy(events, 'page'),
            last24Hours: this.filterLast24h(events),
            topEvents: this.getTopEvents(events, 10),
            browserStats: this.groupBy(events, 'userAgent'),
            conversionFunnel: this.getConversionFunnel(events),
            performance: this.getPerformanceMetrics(events)
        };
    }

    /**
     * Events gruppieren
     */
    groupBy(events, key) {
        const grouped = {};

        events.forEach(event => {
            const value = key.includes('.')
                ? this.getNestedValue(event, key)
                : event[key];

            if (!grouped[value]) {
                grouped[value] = 0;
            }
            grouped[value]++;
        });

        return Object.entries(grouped)
            .sort((a, b) => b[1] - a[1])
            .reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {});
    }

    /**
     * Nested value holen
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    /**
     * Letzte 24h filtern
     */
    filterLast24h(events) {
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        return events.filter(e => e.timestamp > oneDayAgo);
    }

    /**
     * Top Events
     */
    getTopEvents(events, limit = 10) {
        const counts = this.groupBy(events, 'name');
        return Object.entries(counts)
            .slice(0, limit)
            .map(([name, count]) => ({ name, count }));
    }

    /**
     * Conversion Funnel
     */
    getConversionFunnel(events) {
        const steps = {
            page_views: events.filter(e => e.name === 'page_view').length,
            timer_starts: events.filter(e => e.name === 'timer_start').length,
            timer_completes: events.filter(e => e.name === 'timer_complete').length,
            shop_views: events.filter(e => e.name === 'shop_view').length,
            shop_purchases: events.filter(e => e.name === 'shop_purchase').length
        };

        return {
            steps,
            conversionRate: {
                'view_to_timer': this.calculateRate(steps.page_views, steps.timer_starts),
                'timer_completion': this.calculateRate(steps.timer_starts, steps.timer_completes),
                'shop_conversion': this.calculateRate(steps.shop_views, steps.shop_purchases)
            }
        };
    }

    /**
     * Performance Metrics
     */
    getPerformanceMetrics(events) {
        const perfEvents = events.filter(e => e.name === 'performance');

        const metrics = {};
        perfEvents.forEach(event => {
            const metric = event.properties.metric;
            if (!metrics[metric]) {
                metrics[metric] = [];
            }
            metrics[metric].push(event.properties.value);
        });

        // Berechne Durchschnitt
        Object.keys(metrics).forEach(metric => {
            const values = metrics[metric];
            metrics[metric] = {
                avg: values.reduce((a, b) => a + b, 0) / values.length,
                min: Math.min(...values),
                max: Math.max(...values),
                count: values.length
            };
        });

        return metrics;
    }

    /**
     * Conversion Rate berechnen
     */
    calculateRate(total, converted) {
        if (total === 0) return 0;
        return ((converted / total) * 100).toFixed(2);
    }

    /**
     * Debug Logging
     */
    log(...args) {
        if (this.debug) {
            console.log('[Analytics]', ...args);
        }
    }

    /**
     * Analytics deaktivieren
     */
    disable() {
        this.enabled = false;
        this.log('Analytics disabled');
    }

    /**
     * Analytics aktivieren
     */
    enable() {
        this.enabled = true;
        this.log('Analytics enabled');
    }

    /**
     * Alle Daten löschen
     */
    clear() {
        localStorage.removeItem(ANALYTICS_KEY);
        sessionStorage.removeItem('analytics_session');
        this.queue = [];
        this.log('Analytics cleared');
    }
}

// ===================================
// GLOBAL INSTANCE
// ===================================

// Erstelle globale Analytics-Instanz
const analytics = new Analytics({
    enabled: true,
    debug: true, // In Produktion: false
    serverUrl: null // Optional: '/api/analytics' für Server-Sync
});

// Export
if (typeof window !== 'undefined') {
    window.analytics = analytics;
}

export default analytics;
