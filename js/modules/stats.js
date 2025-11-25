// ===================================
// STATS MODULE - Zentrale Statistik-Verwaltung
// ===================================

import { getObject, setObject } from './storage.js';

const STATS_KEY = 'studytok_stats';

/**
 * Default Stats Objekt
 * @returns {Object} Default Stats
 */
function getDefaultStats() {
    return {
        sessions: 0,
        focusTime: 0,
        streak: 1,
        achievements: 0,
        points: 0,
        lastActive: new Date().toDateString(),
        unlockedAchievements: [],
        sessionsToday: 0,
        lastSessionDate: new Date().toDateString(),
        consecutiveSessions: 0,
        dailyLoginClaimed: false,
        lastLoginDate: new Date().toDateString(),
        totalBreaks: 0,
        totalFocusMinutes: 0
    };
}

/**
 * Stats aus localStorage laden
 * @returns {Object} Stats-Objekt
 */
export function getStats() {
    const stats = getObject(STATS_KEY, getDefaultStats());

    // Ensure all properties exist
    const defaultStats = getDefaultStats();
    for (const key in defaultStats) {
        if (!(key in stats)) {
            stats[key] = defaultStats[key];
        }
    }

    return stats;
}

/**
 * Stats in localStorage speichern
 * @param {Object} stats - Stats-Objekt
 * @returns {boolean} Erfolgreich gespeichert
 */
export function saveStats(stats) {
    return setObject(STATS_KEY, stats);
}

/**
 * Punkte hinzufügen
 * @param {number} points - Anzahl Punkte
 * @returns {number} Neue Gesamtpunkte
 */
export function addPoints(points) {
    const stats = getStats();
    stats.points += points;
    stats.lastActive = new Date().toDateString();
    saveStats(stats);
    return stats.points;
}

/**
 * Punkte abziehen
 * @param {number} points - Anzahl Punkte
 * @returns {number} Neue Gesamtpunkte
 */
export function deductPoints(points) {
    const stats = getStats();
    stats.points = Math.max(0, stats.points - points);
    saveStats(stats);
    return stats.points;
}

/**
 * Session hinzufügen
 * @param {number} minutes - Dauer in Minuten
 * @returns {Object} Aktualisierte Stats
 */
export function addSession(minutes = 25) {
    const stats = getStats();
    const today = new Date().toDateString();

    stats.sessions++;
    stats.focusTime += minutes;
    stats.totalFocusMinutes += minutes;

    // Check if same day
    if (stats.lastSessionDate === today) {
        stats.sessionsToday++;
    } else {
        stats.sessionsToday = 1;
        stats.lastSessionDate = today;
    }

    stats.lastActive = today;
    saveStats(stats);

    return stats;
}

/**
 * Achievement freischalten
 * @param {string} achievementId - Achievement ID
 * @returns {boolean} Neu freigeschaltet (true) oder schon vorhanden (false)
 */
export function unlockAchievement(achievementId) {
    const stats = getStats();

    if (!stats.unlockedAchievements.includes(achievementId)) {
        stats.unlockedAchievements.push(achievementId);
        stats.achievements = stats.unlockedAchievements.length;
        saveStats(stats);
        return true;
    }

    return false;
}

/**
 * Streak aktualisieren
 * @returns {number} Aktueller Streak
 */
export function updateStreak() {
    const stats = getStats();
    const today = new Date().toDateString();
    const lastActive = new Date(stats.lastActive);
    const todayDate = new Date(today);

    // Calculate difference in days
    const diffTime = todayDate - lastActive;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        // Same day - streak continues
        return stats.streak;
    } else if (diffDays === 1) {
        // Next day - increase streak
        stats.streak++;
    } else {
        // Streak broken
        stats.streak = 1;
    }

    stats.lastActive = today;
    saveStats(stats);

    return stats.streak;
}

/**
 * Stats zurücksetzen
 * @param {boolean} keepPoints - Punkte behalten?
 * @returns {Object} Zurückgesetzte Stats
 */
export function resetStats(keepPoints = false) {
    const currentStats = getStats();
    const newStats = getDefaultStats();

    if (keepPoints) {
        newStats.points = currentStats.points;
    }

    saveStats(newStats);
    return newStats;
}

/**
 * Stats-Zusammenfassung für Anzeige
 * @returns {Object} Formatierte Stats
 */
export function getStatsDisplay() {
    const stats = getStats();

    return {
        sessions: stats.sessions,
        focusTime: `${stats.focusTime} Min`,
        focusTimeFormatted: formatMinutes(stats.focusTime),
        streak: `${stats.streak} ${stats.streak === 1 ? 'Tag' : 'Tage'}`,
        achievements: stats.achievements,
        points: stats.points,
        sessionsToday: stats.sessionsToday,
        level: Math.floor(stats.sessions / 5) + 1
    };
}

/**
 * Minuten formatieren (z.B. 125 Min → 2h 5min)
 * @param {number} minutes - Minuten
 * @returns {string} Formatierter String
 */
function formatMinutes(minutes) {
    if (minutes < 60) {
        return `${minutes} Min`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (mins === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${mins}min`;
}
