// ===================================
// STORAGE MODULE - Zentrale localStorage-Verwaltung
// ===================================

/**
 * Sicher einen Wert aus localStorage lesen
 * @param {string} key - Der Schlüssel
 * @param {*} fallback - Fallback-Wert wenn nicht gefunden
 * @returns {string|null} Der Wert oder Fallback
 */
export function safeGetItem(key, fallback = null) {
    try {
        const value = localStorage.getItem(key);
        return value !== null ? value : fallback;
    } catch (error) {
        console.warn(`[Storage] Konnte ${key} nicht auslesen, nutze Fallback.`, error);
        return fallback;
    }
}

/**
 * Sicher einen Wert in localStorage speichern
 * @param {string} key - Der Schlüssel
 * @param {string} value - Der Wert
 * @returns {boolean} Erfolgreich gespeichert
 */
export function safeSetItem(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.warn(`[Storage] Konnte ${key} nicht speichern.`, error);

        // Check if quota exceeded
        if (error.name === 'QuotaExceededError') {
            console.error('[Storage] LocalStorage Quota überschritten!');
            // Try to clean up old data
            cleanupOldData();
        }

        return false;
    }
}

/**
 * Sicher JSON parsen
 * @param {string} value - JSON String
 * @param {*} fallback - Fallback bei Parse-Fehler
 * @param {string} label - Label für Logging
 * @returns {*} Geparster Wert oder Fallback
 */
export function safeParseJSON(value, fallback, label = 'Wert') {
    try {
        return JSON.parse(value);
    } catch (error) {
        console.warn(`[Storage] Konnte ${label} nicht parsen, nutze Fallback.`, error);
        return fallback;
    }
}

/**
 * Objekt aus localStorage lesen
 * @param {string} key - Der Schlüssel
 * @param {Object} defaultValue - Default-Objekt
 * @returns {Object} Das Objekt
 */
export function getObject(key, defaultValue = {}) {
    const stored = safeGetItem(key);
    if (stored) {
        return safeParseJSON(stored, { ...defaultValue }, key);
    }
    return { ...defaultValue };
}

/**
 * Objekt in localStorage speichern
 * @param {string} key - Der Schlüssel
 * @param {Object} object - Das Objekt
 * @returns {boolean} Erfolgreich gespeichert
 */
export function setObject(key, object) {
    try {
        return safeSetItem(key, JSON.stringify(object));
    } catch (error) {
        console.error(`[Storage] Fehler beim Speichern von ${key}:`, error);
        return false;
    }
}

/**
 * Wert aus localStorage löschen
 * @param {string} key - Der Schlüssel
 */
export function removeItem(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.warn(`[Storage] Konnte ${key} nicht löschen.`, error);
    }
}

/**
 * Alle Keys mit bestimmtem Prefix löschen
 * @param {string} prefix - Der Prefix
 */
export function clearByPrefix(prefix) {
    try {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(prefix)) {
                localStorage.removeItem(key);
            }
        });
    } catch (error) {
        console.warn(`[Storage] Konnte Daten mit Prefix ${prefix} nicht löschen.`, error);
    }
}

/**
 * Bereinigt alte Daten um Speicherplatz freizugeben
 */
function cleanupOldData() {
    console.log('[Storage] Bereinige alte Daten...');

    // Lösche alte Caches, Analytics, etc.
    const keysToClean = [
        'studytok_analytics',
        'studytok_temp',
        'studytok_cache'
    ];

    keysToClean.forEach(key => removeItem(key));
}

/**
 * LocalStorage Usage Info
 * @returns {Object} Usage-Informationen
 */
export function getStorageInfo() {
    if (!localStorage) {
        return { available: false };
    }

    try {
        let used = 0;
        Object.keys(localStorage).forEach(key => {
            used += localStorage.getItem(key).length + key.length;
        });

        // Estimate quota (usually 5-10MB)
        const quota = 5 * 1024 * 1024; // 5MB estimate

        return {
            available: true,
            used: used,
            usedKB: (used / 1024).toFixed(2),
            usedMB: (used / (1024 * 1024)).toFixed(2),
            quota: quota,
            quotaMB: (quota / (1024 * 1024)).toFixed(2),
            percentUsed: ((used / quota) * 100).toFixed(2)
        };
    } catch (error) {
        return { available: true, error: error.message };
    }
}
