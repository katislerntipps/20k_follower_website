// ===================================
// EXPORT HELPERS - PDF & ICS Export
// ===================================

import { formatDateGerman, formatDuration } from './dateHelpers.js';

/**
 * Generiert ICS Calendar File für alle Sessions
 * @param {Array} sessions - Die Lernsessions
 * @param {Object} planInfo - Plan-Informationen
 * @returns {string} - ICS File Content
 */
export function generateICSFile(sessions, planInfo) {
    const icsLines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//StudyTok Companion//Lernplan Generator//DE',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:Mein Lernplan',
        'X-WR-TIMEZONE:Europe/Berlin',
        'X-WR-CALDESC:Wissenschaftlich fundierter Lernplan von StudyTok Companion'
    ];

    sessions.forEach(session => {
        const event = generateICSEvent(session, planInfo);
        icsLines.push(...event);
    });

    icsLines.push('END:VCALENDAR');

    return icsLines.join('\r\n');
}

/**
 * Generiert ein einzelnes ICS Event
 */
function generateICSEvent(session, planInfo) {
    const emoji = getSessionEmoji(session);
    const summary = `${emoji} ${session.thema}`;

    // Konvertiere Datum und Uhrzeit zu ICS-Format (YYYYMMDDTHHMMSS)
    const [year, month, day] = session.datum.split('-');
    const [hours, minutes] = session.uhrzeit.split(':');
    const dtstart = `${year}${month}${day}T${hours}${minutes}00`;

    // Berechne Endzeit
    const endMinutes = parseInt(hours) * 60 + parseInt(minutes) + session.dauer;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const dtend = `${year}${month}${day}T${String(endHours).padStart(2, '0')}${String(endMins).padStart(2, '0')}00`;

    // Beschreibung mit Aktivitäten
    const description = generateEventDescription(session);

    // UID generieren
    const uid = `${session.id}-${Date.now()}@studytok-companion.de`;

    const event = [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${formatICSTimestamp(new Date())}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${escapeICSText(description)}`,
        `LOCATION:Lernplatz`,
        `STATUS:CONFIRMED`,
        `SEQUENCE:0`,
        `TRANSP:OPAQUE`
    ];

    // Alarm 15 Minuten vorher (optional)
    if (planInfo?.reminder_gewünscht) {
        const reminderLines = ['BEGIN:VALARM', 'TRIGGER:-PT15M'];

        if (planInfo.reminder_typ === 'email' && planInfo.reminder_email) {
            reminderLines.push(
                'ACTION:EMAIL',
                `SUMMARY:Lernsession: ${summary}`,
                `DESCRIPTION:Reminder: ${summary}`,
                `ATTENDEE:mailto:${planInfo.reminder_email}`
            );
        } else {
            reminderLines.push(
                'ACTION:DISPLAY',
                `DESCRIPTION:Reminder: ${summary}`
            );
        }

        reminderLines.push('END:VALARM');
        event.push(...reminderLines);
    }

    event.push('END:VEVENT');

    return event;
}

function generateEventDescription(session) {
    let desc = `${session.typ === 'initial' ? 'Erste Lernsession' : `Wiederholung (Zyklus ${session.zyklus})`}\n\n`;
    desc += `Dauer: ${formatDuration(session.dauer)}\n`;
    desc += `Komplexität: ${session.komplexität}\n\n`;

    desc += 'Aktivitäten:\n';
    session.aktivitäten.forEach(akt => {
        desc += `${akt.nr}. ${akt.name} (${akt.dauer_minuten} Min)\n`;
        desc += `   ${akt.beschreibung}\n\n`;
    });

    if (session.pomodoros) {
        desc += `\nPomodoros: ${session.pomodoros}x 25 Min\n`;
    }

    if (session.tipps && session.tipps.length > 0) {
        desc += '\nTipps:\n';
        session.tipps.forEach(tipp => {
            desc += `- ${tipp}\n`;
        });
    }

    return desc;
}

function getSessionEmoji(session) {
    if (session.typ === 'initial') return '📖';
    return '🔄';
}

function escapeICSText(text) {
    return text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
}

function formatICSTimestamp(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Triggert Download einer Datei
 * @param {string} content - Dateiinhalt
 * @param {string} filename - Dateiname
 * @param {string} mimeType - MIME Type
 */
export function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }, 100);
}

/**
 * Exportiert Plan als ICS
 * @param {Object} plan - Der vollständige Lernplan
 */
export function exportAsICS(plan) {
    const icsContent = generateICSFile(plan.sessions, plan.eingaben_zusammenfassung);
    const filename = `Lernplan_${plan.eingaben_zusammenfassung.hauptfach}_${new Date().toISOString().split('T')[0]}.ics`;

    downloadFile(icsContent, filename, 'text/calendar;charset=utf-8');
}

/**
 * Generiert HTML für PDF Export (kann mit jsPDF oder window.print() verwendet werden)
 * @param {Object} plan - Der vollständige Lernplan
 * @returns {string} - HTML String
 */
export function generatePDFHTML(plan) {
    const { sessions, metadata, empfehlungen, eingaben_zusammenfassung } = plan;

    const html = `
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Lernplan - ${eingaben_zusammenfassung.hauptfach}</title>
    <style>
        @page {
            size: A4;
            margin: 2cm;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #333;
        }

        h1 {
            color: #FFB7C5;
            font-size: 24pt;
            margin-bottom: 0.5cm;
            border-bottom: 3px solid #FFB7C5;
            padding-bottom: 0.3cm;
        }

        h2 {
            color: #667EEA;
            font-size: 16pt;
            margin-top: 1cm;
            margin-bottom: 0.5cm;
        }

        h3 {
            font-size: 12pt;
            margin-top: 0.5cm;
            margin-bottom: 0.3cm;
        }

        .header {
            text-align: center;
            margin-bottom: 1cm;
        }

        .metadata {
            background: #f5f5f5;
            padding: 0.5cm;
            border-radius: 8px;
            margin-bottom: 1cm;
        }

        .metadata-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.5cm;
        }

        .metadata-item {
            margin-bottom: 0.3cm;
        }

        .metadata-label {
            font-weight: bold;
            color: #667EEA;
        }

        .empfehlung {
            padding: 0.4cm;
            margin-bottom: 0.4cm;
            border-left: 4px solid #FFB7C5;
            background: #fafafa;
        }

        .empfehlung-titel {
            font-weight: bold;
            margin-bottom: 0.2cm;
        }

        .session {
            page-break-inside: avoid;
            border: 1px solid #ddd;
            padding: 0.4cm;
            margin-bottom: 0.5cm;
            border-radius: 6px;
        }

        .session-header {
            background: linear-gradient(135deg, #FFB7C5 0%, #D4B5F1 100%);
            color: white;
            padding: 0.3cm;
            margin: -0.4cm -0.4cm 0.4cm -0.4cm;
            border-radius: 6px 6px 0 0;
        }

        .session-title {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 0.2cm;
        }

        .session-info {
            font-size: 10pt;
            opacity: 0.95;
        }

        .aktivität {
            margin-bottom: 0.4cm;
        }

        .aktivität-name {
            font-weight: bold;
            color: #667EEA;
            margin-bottom: 0.2cm;
        }

        .checkpunkte {
            margin-left: 0.5cm;
            font-size: 10pt;
        }

        .checkpunkte li {
            margin-bottom: 0.1cm;
        }

        .tipp {
            background: #FFF9E6;
            border-left: 3px solid #FFB020;
            padding: 0.3cm;
            margin-top: 0.3cm;
            font-size: 10pt;
        }

        .page-break {
            page-break-before: always;
        }

        @media print {
            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌸 Mein wissenschaftlicher Lernplan</h1>
        <p style="font-size: 12pt; color: #666;">
            ${eingaben_zusammenfassung.hauptfach} - ${eingaben_zusammenfassung.zeitraum}
        </p>
        <p style="font-size: 10pt; color: #999;">
            Erstellt am ${new Date().toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
    </div>

    <div class="metadata">
        <h2>📊 Plan-Übersicht</h2>
        <div class="metadata-grid">
            <div class="metadata-item">
                <span class="metadata-label">Gesamt Sessions:</span> ${metadata.gesamt_sessions}
            </div>
            <div class="metadata-item">
                <span class="metadata-label">Erfolgschance:</span> ${metadata.erfolgschance_prozent}%
            </div>
            <div class="metadata-item">
                <span class="metadata-label">Lernzeit gesamt:</span> ${metadata.gesamt_lernzeit_stunden} Stunden
            </div>
            <div class="metadata-item">
                <span class="metadata-label">Ø Session-Länge:</span> ${metadata.durchschnitt_pro_session_minuten} Min
            </div>
            <div class="metadata-item">
                <span class="metadata-label">Anzahl Themen:</span> ${metadata.themen_anzahl}
            </div>
            <div class="metadata-item">
                <span class="metadata-label">Spacing-Zyklen:</span> ${metadata.spacing_zyklen_pro_thema} pro Thema
            </div>
        </div>
    </div>

    ${empfehlungen.length > 0 ? `
    <div>
        <h2>💡 Wichtige Empfehlungen</h2>
        ${empfehlungen.map(emp => `
            <div class="empfehlung">
                <div class="empfehlung-titel">${emp.icon || ''} ${emp.titel}</div>
                <div>${emp.text}</div>
                ${emp.aktion ? `<div style="margin-top: 0.2cm; font-style: italic; color: #667EEA;">→ ${emp.aktion}</div>` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

    <div class="page-break"></div>

    <h2>📅 Deine Lernsessions</h2>

    ${sessions.map((session, index) => `
        <div class="session">
            <div class="session-header">
                <div class="session-title">
                    ${session.typ === 'initial' ? '📖' : '🔄'} ${session.thema}
                    ${session.typ === 'wiederholung' ? ` (Zyklus ${session.zyklus})` : ''}
                </div>
                <div class="session-info">
                    ${session.datum_formatiert_lang} • ${session.uhrzeit} - ${session.endzeit} Uhr • ${formatDuration(session.dauer)}
                </div>
            </div>

            <div style="margin-top: 0.4cm;">
                <strong>Session-Typ:</strong> ${session.typ === 'initial' ? 'Erste Lernsession' : `Wiederholung (${session.zyklus}. Durchgang)`}<br>
                <strong>Komplexität:</strong> ${session.komplexität} • <strong>Priorität:</strong> ${session.priorität}
            </div>

            ${session.pomodoros ? `
                <div style="margin-top: 0.3cm; color: #666;">
                    🍅 ${session.pomodoros} Pomodoro${session.pomodoros > 1 ? 's' : ''} (25 Min Fokus + Pausen)
                </div>
            ` : ''}

            <h3>Aktivitäten:</h3>
            ${session.aktivitäten.map(akt => `
                <div class="aktivität">
                    <div class="aktivität-name">
                        ${akt.name} (${akt.dauer_minuten} Min)
                    </div>
                    <div style="margin-bottom: 0.2cm; font-size: 10pt;">
                        ${akt.beschreibung}
                    </div>
                    <div class="checkpunkte">
                        <strong>Checkpunkte:</strong>
                        <ul>
                            ${akt.checkpunkte.map(cp => `<li>${cp}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `).join('')}

            ${session.tipps && session.tipps.length > 0 ? `
                <div class="tipp">
                    <strong>💡 Tipps:</strong><br>
                    ${session.tipps.map(t => `• ${t}`).join('<br>')}
                </div>
            ` : ''}
        </div>
    `).join('')}

    <div class="page-break"></div>

    <h2>📚 Wissenschaftliche Grundlagen</h2>

    <h3>🔄 Spaced Repetition (Verteiltes Üben)</h3>
    <p>
        Basierend auf der Ebbinghaus'schen Vergessenskurve. Durch optimale Wiederholungsabstände
        (Tag 1, 3, 7, 14, 21, 28) wird das Gelernte im Langzeitgedächtnis verankert.
        <strong>Effektstärke: d=0.75</strong>
    </p>

    <h3>🧠 Active Recall (Aktives Abrufen)</h3>
    <p>
        Statt passivem Wiederlesen: Aktives Abrufen des Gelernten ohne Hilfsmittel.
        Diese Methode hat die höchste wissenschaftliche Evidenz für Lernerfolg.
        <strong>Effektstärke: d=0.74</strong>
    </p>

    <h3>🔀 Interleaving (Themenmischung)</h3>
    <p>
        Verschiedene Themen werden gemischt gelernt (ABC ABC ABC) statt blockweise (AAA BBB CCC).
        Das verbessert die Fähigkeit, zwischen ähnlichen Konzepten zu unterscheiden.
    </p>

    <h3>🍅 Pomodoro-Technik</h3>
    <p>
        25 Minuten fokussiertes Lernen, gefolgt von 5 Minuten Pause. Nach 4 Pomodoros eine längere
        Pause (15 Min). Reduziert kognitive Überlastung und erhält die Konzentration.
    </p>

    <div style="margin-top: 2cm; text-align: center; color: #999; font-size: 10pt;">
        Erstellt mit StudyTok Companion - Wissenschaftlich fundierte Lernplanung<br>
        Basierend auf Forschung zu Spaced Repetition, Active Recall und Cognitive Load Theory
    </div>
</body>
</html>
    `;

    return html;
}

/**
 * Exportiert Plan als PDF (öffnet Print-Dialog)
 * @param {Object} plan - Der vollständige Lernplan
 */
export function exportAsPDF(plan) {
    const html = generatePDFHTML(plan);

    // Öffne neues Fenster mit HTML
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();

    // Warte kurz, dann öffne Print-Dialog
    setTimeout(() => {
        printWindow.print();
    }, 500);
}
