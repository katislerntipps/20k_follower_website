// ===================================
// SPACING CALCULATOR - Spaced Repetition nach Ebbinghaus
// ===================================

/**
 * Gibt die optimalen Spacing-Intervalle basierend auf verfügbarer Zeit zurück
 *
 * Wissenschaftliche Basis: Ebbinghaus Forgetting Curve
 * Intervalle: Tag 0 (Initial), 1, 3, 7, 14, 21, 28, 42, 56
 *
 * @param {number} availableDays - Verfügbare Tage bis zur Prüfung/Ende
 * @param {string} scenario - 'prüfung' oder 'kontinuierlich'
 * @returns {Object} - { intervals: number[], quality: string, description: string }
 */
export function calculateSpacingIntervals(availableDays, scenario = 'prüfung') {
    if (scenario === 'kontinuierlich') {
        return getContinuousLearningPattern(availableDays);
    }

    // Prüfungsvorbereitung - Qualität basierend auf verfügbarer Zeit
    if (availableDays < 7) {
        return {
            intervals: [0, 1, 2, 3, Math.min(5, availableDays - 1)].filter(day => day < availableDays),
            quality: 'KRITISCH',
            qualityLevel: 'critical',
            description: '⚠️ Sehr wenig Zeit! Fokus auf Kernthemen empfohlen.',
            cycles: 3
        };
    } else if (availableDays >= 7 && availableDays < 14) {
        return {
            intervals: [0, 1, 3, 7].filter(day => day < availableDays),
            quality: 'AUSREICHEND',
            qualityLevel: 'sufficient',
            description: '✓ Ausreichend - straffer Plan möglich',
            cycles: 4
        };
    } else if (availableDays >= 14 && availableDays <= 28) {
        return {
            intervals: [0, 1, 3, 7, 14].filter(day => day < availableDays),
            quality: 'OPTIMAL',
            qualityLevel: 'optimal',
            description: '✅ OPTIMAL - Ideale Spacing-Zyklen möglich',
            cycles: 5
        };
    } else {
        // > 28 Tage
        const intervals = [0, 1, 3, 7, 14, 21, 28];

        // Erweiterte Zyklen für längere Zeiträume
        if (availableDays > 42) {
            intervals.push(42);
        }
        if (availableDays > 56) {
            intervals.push(56);
        }

        return {
            intervals: intervals.filter(day => day < availableDays),
            quality: 'EXCELLENT',
            qualityLevel: 'excellent',
            description: '🌟 EXCELLENT - Erweiterte Wiederholungszyklen möglich',
            cycles: intervals.length
        };
    }
}

/**
 * Berechnet Spacing-Pattern für kontinuierliches Lernen
 * @param {number} totalDays - Gesamte Lernzeit in Tagen
 * @returns {Object} - Spacing-Informationen
 */
function getContinuousLearningPattern(totalDays) {
    // Bei kontinuierlichem Lernen: Rollierendes Pattern
    // Initial lernen, dann Wiederholungen nach 2, 5, 14, 30 Tagen

    const basePattern = [0, 2, 5, 14, 30];
    const intervals = [];

    let currentDay = 0;
    while (currentDay < totalDays) {
        intervals.push(currentDay);

        // Wähle nächstes Intervall basierend auf Position
        const cycleIndex = intervals.length % basePattern.length;
        const nextGap = basePattern[cycleIndex] || 7;

        currentDay += nextGap;
    }

    return {
        intervals: intervals.slice(0, 10), // Max 10 Zyklen
        quality: 'KONTINUIERLICH',
        qualityLevel: 'continuous',
        description: '📚 Kontinuierliches Lernen mit optimalen Wiederholungsabständen',
        cycles: Math.min(intervals.length, 10)
    };
}

/**
 * Berechnet die erwartete Retentionsrate basierend auf Spacing
 *
 * Wissenschaftliche Basis:
 * - Optimales Spacing: 75-85% Retention
 * - Suboptimales Spacing: 50-65% Retention
 * - Kritisches Spacing: 30-45% Retention
 *
 * @param {string} qualityLevel - 'excellent', 'optimal', 'sufficient', 'critical'
 * @returns {number} - Geschätzte Retentionsrate (0-100)
 */
export function calculateRetentionRate(qualityLevel) {
    const rates = {
        excellent: 85,
        optimal: 75,
        sufficient: 60,
        critical: 40,
        continuous: 70
    };

    return rates[qualityLevel] || 50;
}

/**
 * Gibt Empfehlungen basierend auf Spacing-Qualität
 * @param {string} quality - Die Spacing-Qualität
 * @returns {Array} - Array von Empfehlungs-Objekten
 */
export function getSpacingRecommendations(quality) {
    const recommendations = {
        KRITISCH: [
            {
                type: 'warnung',
                priority: 'hoch',
                icon: '⚠️',
                title: 'Zeitdruck erkannt',
                text: 'Die Vorbereitungszeit ist sehr knapp. Konzentriere dich auf die wichtigsten Kernthemen.',
                action: 'Priorisiere Themen mit "Hoch"-Priorität'
            },
            {
                type: 'tipp',
                priority: 'hoch',
                icon: '🎯',
                title: 'Intensive Methoden nutzen',
                text: 'Bei wenig Zeit: Fokus auf Active Recall und häufige Wiederholungen.',
                action: null
            }
        ],
        AUSREICHEND: [
            {
                type: 'info',
                priority: 'mittel',
                icon: '✓',
                title: 'Straffer Plan möglich',
                text: 'Du hast genug Zeit für einen soliden Lernplan. Halte dich an den Plan!',
                action: null
            }
        ],
        OPTIMAL: [
            {
                type: 'erfolg',
                priority: 'info',
                icon: '✅',
                title: 'Ideale Lernbedingungen',
                text: 'Perfekter Zeitrahmen für wissenschaftlich fundiertes Spaced Repetition!',
                action: null
            },
            {
                type: 'tipp',
                priority: 'niedrig',
                icon: '🧠',
                title: 'Nutze alle Methoden',
                text: 'Du kannst Active Recall, Spaced Repetition und Interleaving voll ausnutzen.',
                action: null
            }
        ],
        EXCELLENT: [
            {
                type: 'erfolg',
                priority: 'info',
                icon: '🌟',
                title: 'Hervorragende Vorbereitung',
                text: 'Mit diesem Zeitrahmen kannst du tiefes Verständnis aufbauen!',
                action: null
            },
            {
                type: 'tipp',
                priority: 'niedrig',
                icon: '💡',
                title: 'Erweiterte Techniken',
                text: 'Nutze die Zeit für Elaboration und Verknüpfungen zwischen Themen.',
                action: null
            }
        ],
        KONTINUIERLICH: [
            {
                type: 'info',
                priority: 'info',
                icon: '📚',
                title: 'Langfristiges Lernen',
                text: 'Kontinuierliches Lernen ist ideal für nachhaltiges Wissen.',
                action: null
            }
        ]
    };

    return recommendations[quality] || [];
}

/**
 * Berechnet die empfohlene Anzahl von Sessions pro Woche
 * @param {number} totalDays - Gesamte verfügbare Tage
 * @param {number} themenzahl - Anzahl der Themen
 * @returns {number} - Empfohlene Sessions pro Woche
 */
export function calculateRecommendedSessionsPerWeek(totalDays, themenzahl) {
    if (totalDays < 7) {
        // Kritisch: Jeden Tag lernen
        return Math.min(themenzahl * 2, 7);
    } else if (totalDays < 14) {
        // Ausreichend: 5-6 Tage pro Woche
        return Math.min(themenzahl + 2, 6);
    } else {
        // Optimal/Excellent: 4-5 Tage pro Woche
        return Math.min(themenzahl + 1, 5);
    }
}

/**
 * Gibt das optimale Verhältnis von Initial- zu Wiederholungssessions
 * @param {string} qualityLevel - Die Spacing-Qualität
 * @returns {Object} - { initial: number, wiederholung: number }
 */
export function getOptimalSessionRatio(qualityLevel) {
    const ratios = {
        excellent: { initial: 1, wiederholung: 5 },  // 1:5 - Viele Wiederholungen
        optimal: { initial: 1, wiederholung: 4 },    // 1:4
        sufficient: { initial: 1, wiederholung: 3 },  // 1:3
        critical: { initial: 1, wiederholung: 2 },    // 1:2 - Weniger Zeit
        continuous: { initial: 1, wiederholung: 4 }   // 1:4
    };

    return ratios[qualityLevel] || { initial: 1, wiederholung: 3 };
}
