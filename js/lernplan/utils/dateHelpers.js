// ===================================
// DATE HELPERS - Datum-Utility-Funktionen
// ===================================

/**
 * Formatiert ein Date-Objekt zu deutschem Datumsformat
 * @param {Date} date - Das zu formatierende Datum
 * @returns {string} - Formatierter String (z.B. "Montag, 15. Januar 2025")
 */
export function formatDateGerman(date) {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day}. ${month} ${year}`;
}

/**
 * Formatiert ein Date-Objekt zu kurzem deutschem Datumsformat
 * @param {Date} date - Das zu formatierende Datum
 * @returns {string} - Formatierter String (z.B. "Mo, 15.01.")
 */
export function formatDateShortGerman(date) {
    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return `${dayName}, ${day}.${month}.`;
}

/**
 * Gibt den Wochentag als String zurück
 * @param {Date} date - Das Datum
 * @returns {string} - Wochentag (z.B. "montag")
 */
export function getWeekdayName(date) {
    const days = ['sonntag', 'montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag'];
    return days[date.getDay()];
}

/**
 * Berechnet die Anzahl der Tage zwischen zwei Daten
 * @param {Date|string} startDate - Startdatum
 * @param {Date|string} endDate - Enddatum
 * @returns {number} - Anzahl der Tage
 */
export function daysBetween(startDate, endDate) {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
}

/**
 * Fügt Tage zu einem Datum hinzu
 * @param {Date|string} date - Ausgangsdatum
 * @param {number} days - Anzahl der Tage
 * @returns {Date} - Neues Datum
 */
export function addDays(date, days) {
    const result = typeof date === 'string' ? new Date(date) : new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

/**
 * Konvertiert Date zu YYYY-MM-DD Format
 * @param {Date} date - Das Datum
 * @returns {string} - Formatierter String
 */
export function toISODateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Parst YYYY-MM-DD String zu Date
 * @param {string} dateString - Der Datums-String
 * @returns {Date} - Date Objekt
 */
export function parseISODate(dateString) {
    return new Date(dateString + 'T00:00:00');
}

/**
 * Gibt heute als Date zurück (00:00:00 Uhr)
 * @returns {Date} - Heutiges Datum
 */
export function getToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}

/**
 * Prüft ob ein Datum in der Vergangenheit liegt
 * @param {Date|string} date - Das zu prüfende Datum
 * @returns {boolean} - true wenn in der Vergangenheit
 */
export function isPast(date) {
    const checkDate = typeof date === 'string' ? parseISODate(date) : date;
    const today = getToday();
    return checkDate < today;
}

/**
 * Berechnet Wochen aus Tagen
 * @param {number} days - Anzahl der Tage
 * @returns {number} - Anzahl der Wochen (gerundet)
 */
export function weeksFromDays(days) {
    return Math.round(days / 7);
}

/**
 * Gibt alle Daten zwischen Start und Ende zurück
 * @param {Date|string} startDate - Startdatum
 * @param {Date|string} endDate - Enddatum
 * @returns {Date[]} - Array von Date-Objekten
 */
export function getDateRange(startDate, endDate) {
    const start = typeof startDate === 'string' ? parseISODate(startDate) : new Date(startDate);
    const end = typeof endDate === 'string' ? parseISODate(endDate) : new Date(endDate);

    const dates = [];
    const current = new Date(start);

    while (current <= end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }

    return dates;
}

/**
 * Formatiert Minuten zu lesbarem String
 * @param {number} minutes - Anzahl der Minuten
 * @returns {string} - Formatierter String (z.B. "1h 30min" oder "45min")
 */
export function formatDuration(minutes) {
    if (minutes < 60) {
        return `${minutes} Min`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (mins === 0) {
        return `${hours} Std`;
    }

    return `${hours}h ${mins}min`;
}

/**
 * Formatiert Zeitslot (z.B. "14:00")
 * @param {number} hour - Stunde (0-23)
 * @param {number} minute - Minute (0-59)
 * @returns {string} - Formatierter String
 */
export function formatTimeSlot(hour, minute = 0) {
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * Berechnet Endzeit einer Session
 * @param {string} startTime - Startzeit (z.B. "14:00")
 * @param {number} durationMinutes - Dauer in Minuten
 * @returns {string} - Endzeit (z.B. "15:30")
 */
export function calculateEndTime(startTime, durationMinutes) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + durationMinutes;

    const endHours = Math.floor(endMinutes / 60) % 24;
    const endMins = endMinutes % 60;

    return formatTimeSlot(endHours, endMins);
}
