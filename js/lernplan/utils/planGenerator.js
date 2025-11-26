// ===================================
// PLAN GENERATOR - Wissenschaftlich fundierter Lernplan-Algorithmus
// ===================================

import {
    formatDateGerman,
    formatDateShortGerman,
    getWeekdayName,
    daysBetween,
    addDays,
    toISODateString,
    parseISODate,
    formatDuration,
    calculateEndTime
} from './dateHelpers.js';

import {
    calculateSpacingIntervals,
    calculateRetentionRate,
    getSpacingRecommendations
} from './spacingCalculator.js';

/**
 * Hauptfunktion: Generiert vollständigen wissenschaftlich fundierten Lernplan
 *
 * @param {Object} eingaben - Alle Wizard-Eingaben
 * @returns {Object} - Vollständiger Lernplan mit Sessions, Metadata, Empfehlungen
 */
export function generateLernplan(eingaben) {
    console.log('🎯 Starte Lernplan-Generierung mit Eingaben:', eingaben);

    // Phase 1: Zeitrahmen analysieren
    const zeitrahmen = analyzeZeitrahmen(eingaben);
    console.log('📅 Phase 1: Zeitrahmen', zeitrahmen);

    // Phase 2: Spacing-Intervalle berechnen
    const spacingInfo = calculateSpacingIntervals(zeitrahmen.tage, eingaben.szenario);
    console.log('🔄 Phase 2: Spacing-Intervalle', spacingInfo);

    // Phase 3: Sessions für jedes Thema erstellen
    const rawSessions = createSessionsForThemen(
        eingaben.themen,
        spacingInfo.intervals,
        eingaben,
        zeitrahmen.startdatum
    );
    console.log(`📝 Phase 3: ${rawSessions.length} Sessions erstellt`);

    // Phase 4: Interleaving anwenden (falls mehrere Themen)
    const interleavedSessions = eingaben.methoden_präferenz?.interleaving && eingaben.themen.length > 1
        ? applyInterleaving(rawSessions)
        : rawSessions;
    console.log('🔀 Phase 4: Interleaving', interleavedSessions.length);

    // Phase 5: Zeitslots zuordnen
    const scheduledSessions = assignTimeSlots(
        interleavedSessions,
        eingaben,
        zeitrahmen.startdatum
    );
    console.log('⏰ Phase 5: Zeitslots zugeordnet');

    // Phase 6: Methoden und Aktivitäten integrieren
    const enrichedSessions = enrichSessionsWithMethods(scheduledSessions, eingaben);
    console.log('✨ Phase 6: Methoden integriert');

    // Phase 7: Metadata und Empfehlungen berechnen
    const metadata = calculateMetadata(enrichedSessions, eingaben, zeitrahmen, spacingInfo);
    const empfehlungen = generateEmpfehlungen(eingaben, zeitrahmen, spacingInfo, metadata);

    console.log('✅ Lernplan-Generierung abgeschlossen!');

    return {
        sessions: enrichedSessions,
        metadata,
        empfehlungen,
        eingaben_zusammenfassung: {
            lerntyp: eingaben.lerntyp,
            szenario: eingaben.szenario,
            themen_anzahl: eingaben.themen.length,
            hauptfach: eingaben.fach,
            zeitraum: `${zeitrahmen.tage} Tage`,
            chronotyp: eingaben.chronotyp,
            methoden: Object.keys(eingaben.methoden_präferenz || {}).filter(k => eingaben.methoden_präferenz[k]),
            reminder_gewünscht: eingaben.reminder_gewünscht,
            reminder_typ: eingaben.reminder_typ,
            reminder_email: eingaben.reminder_email
        },
        zeitrahmen,
        spacingInfo
    };
}

// ===================================
// PHASE 1: ZEITRAHMEN ANALYSIEREN
// ===================================

function analyzeZeitrahmen(eingaben) {
    let tage, wochen, startdatum, enddatum;

    if (eingaben.szenario === 'prüfung') {
        startdatum = parseISODate(eingaben.startdatum);
        enddatum = parseISODate(eingaben.prüfungsdatum);
        tage = daysBetween(startdatum, enddatum);
        wochen = Math.ceil(tage / 7);
    } else {
        // Kontinuierlich
        startdatum = parseISODate(eingaben.startdatum || toISODateString(new Date()));

        if (eingaben.dauer === '1_monat') {
            wochen = 4;
            tage = 28;
        } else if (eingaben.dauer === '1_semester') {
            wochen = 16;
            tage = 112;
        } else if (eingaben.dauer === 'custom') {
            wochen = eingaben.custom_wochen;
            tage = wochen * 7;
        }

        enddatum = addDays(startdatum, tage);
    }

    return { tage, wochen, startdatum, enddatum };
}

// ===================================
// PHASE 3: SESSIONS ERSTELLEN
// ===================================

function createSessionsForThemen(themen, intervals, eingaben, startdatum) {
    const sessions = [];
    let sessionIdCounter = 1;

    themen.forEach((thema, themaIndex) => {
        intervals.forEach((intervalTag, zyklusIndex) => {
            const session = createSession(
                sessionIdCounter++,
                thema,
                themaIndex,
                zyklusIndex,
                intervalTag,
                eingaben,
                startdatum
            );

            sessions.push(session);
        });
    });

    // Sortiere nach Priorität und Komplexität
    return sessions.sort((a, b) => {
        // Zuerst nach Tag
        if (a.tagNachStart !== b.tagNachStart) {
            return a.tagNachStart - b.tagNachStart;
        }

        // Dann nach Priorität (hoch > mittel > niedrig)
        const priorityOrder = { hoch: 3, mittel: 2, niedrig: 1 };
        const priorityDiff = priorityOrder[b.priorität] - priorityOrder[a.priorität];
        if (priorityDiff !== 0) return priorityDiff;

        // Dann nach Komplexität (schwer > mittel > leicht)
        const complexityOrder = { schwer: 3, mittel: 2, leicht: 1 };
        return complexityOrder[b.komplexität] - complexityOrder[a.komplexität];
    });
}

function createSession(id, thema, themaIndex, zyklusIndex, intervalTag, eingaben, startdatum) {
    const typ = zyklusIndex === 0 ? 'initial' : 'wiederholung';

    // Zieldauer basierend auf Benutzerpräferenz (String zu Number konvertieren)
    const zieldauer = parseInt(eingaben.bevorzugte_sessionlänge) || 50;

    // Komplexitätsfaktor: Relative Anpassung zur Zieldauer
    const komplexitätsFaktor = {
        leicht: 0.8,   // 20% kürzer als Ziel
        mittel: 1.0,   // Exakt wie Ziel
        schwer: 1.2    // 20% länger als Ziel
    };

    let dauer = Math.round(zieldauer * (komplexitätsFaktor[thema.komplexität] || 1.0));

    // Wiederholungen sind kürzer (80% der Initial-Session)
    if (typ === 'wiederholung') {
        dauer = Math.round(dauer * 0.8);
    }

    // Minimum 15 Minuten, Maximum 120 Minuten
    dauer = Math.max(15, Math.min(120, dauer));

    return {
        id: `session-${id}`,
        thema: thema.name,
        themaIndex,
        komplexität: thema.komplexität,
        priorität: thema.priorität,
        zyklus: zyklusIndex + 1,
        tagNachStart: intervalTag,
        typ,
        dauer,
        datum: null, // Wird in Phase 5 gesetzt
        datum_formatiert: null,
        wochentag: null,
        uhrzeit: null,
        aktivitäten: [],
        pomodoros: null,
        pausen: [],
        tipps: []
    };
}

// ===================================
// PHASE 4: INTERLEAVING
// ===================================

function applyInterleaving(sessions) {
    // Gruppiere Sessions nach Tag
    const sessionsByTag = {};

    sessions.forEach(session => {
        const tag = session.tagNachStart;
        if (!sessionsByTag[tag]) {
            sessionsByTag[tag] = [];
        }
        sessionsByTag[tag].push(session);
    });

    // Mische Themen innerhalb jedes Tages (ABC ABC statt AAA BBB)
    const interleavedSessions = [];

    Object.keys(sessionsByTag).sort((a, b) => Number(a) - Number(b)).forEach(tag => {
        const daySessions = sessionsByTag[tag];

        if (daySessions.length > 1) {
            // Sortiere nach Thema, um sicherzustellen, dass verschiedene Themen gemischt werden
            const byThema = {};
            daySessions.forEach(s => {
                if (!byThema[s.themaIndex]) byThema[s.themaIndex] = [];
                byThema[s.themaIndex].push(s);
            });

            // Mische: Nimm abwechselnd von jedem Thema
            const themen = Object.keys(byThema);
            let index = 0;
            let allEmpty = false;

            while (!allEmpty) {
                allEmpty = true;
                themen.forEach(themaIdx => {
                    if (byThema[themaIdx].length > 0) {
                        interleavedSessions.push(byThema[themaIdx].shift());
                        allEmpty = false;
                    }
                });
            }
        } else {
            interleavedSessions.push(...daySessions);
        }
    });

    return interleavedSessions;
}

// ===================================
// PHASE 5: ZEITSLOTS ZUORDNEN
// ===================================

function assignTimeSlots(sessions, eingaben, startdatum) {
    const chronotypMapping = {
        morgen: ['08:00', '09:00', '10:00', '11:00'],
        neutral: ['10:00', '14:00', '16:00', '18:00'],
        abend: ['16:00', '18:00', '19:00', '20:00', '21:00']
    };

    const bevorzugteZeiten = eingaben.bevorzugte_zeiten && eingaben.bevorzugte_zeiten.length > 0
        ? eingaben.bevorzugte_zeiten
        : chronotypMapping[eingaben.chronotyp] || chronotypMapping['neutral'];

    const verfügbareWochentage = Object.keys(eingaben.wochentage_verfügbarkeit || {})
        .filter(tag => eingaben.wochentage_verfügbarkeit[tag]?.verfügbar);

    const maxSessionsProTag = eingaben.max_sessions_pro_tag || 2;

    // Tracking für Sessions pro Tag
    const sessionsPerDate = {};

    return sessions.map(session => {
        let datum = addDays(startdatum, session.tagNachStart);
        let wochentag = getWeekdayName(datum);
        let uhrzeit = bevorzugteZeiten[0]; // Default

        // Prüfe Verfügbarkeit und verschiebe ggf.
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts) {
            wochentag = getWeekdayName(datum);
            const dateKey = toISODateString(datum);

            // Prüfe ob Tag verfügbar ist
            if (!verfügbareWochentage.includes(wochentag)) {
                datum = addDays(datum, 1);
                attempts++;
                continue;
            }

            // Prüfe max Sessions pro Tag
            if (!sessionsPerDate[dateKey]) {
                sessionsPerDate[dateKey] = 0;
            }

            if (sessionsPerDate[dateKey] >= maxSessionsProTag) {
                datum = addDays(datum, 1);
                attempts++;
                continue;
            }

            // Verfügbarkeit gefunden
            const zeitIndex = sessionsPerDate[dateKey] % bevorzugteZeiten.length;
            uhrzeit = bevorzugteZeiten[zeitIndex];
            sessionsPerDate[dateKey]++;
            break;
        }

        return {
            ...session,
            datum: toISODateString(datum),
            datum_formatiert: formatDateShortGerman(datum),
            datum_formatiert_lang: formatDateGerman(datum),
            wochentag,
            uhrzeit,
            endzeit: calculateEndTime(uhrzeit, session.dauer)
        };
    });
}

// ===================================
// PHASE 6: METHODEN INTEGRIEREN
// ===================================

function enrichSessionsWithMethods(sessions, eingaben) {
    const pomodoroAktiv = eingaben.methoden_präferenz?.pomodoro !== false;

    return sessions.map(session => {
        // Aktivitäten basierend auf Typ
        const aktivitäten = session.typ === 'initial'
            ? getInitialAktivitäten(session.dauer)
            : getWiederholungsAktivitäten(session.dauer);

        // Pomodoros berechnen
        let pomodoros = null;
        let pausen = [];

        if (pomodoroAktiv) {
            pomodoros = Math.ceil(session.dauer / 25);
            pausen = calculatePomodoroPausen(pomodoros);
        }

        // Tipps generieren
        const tipps = generateSessionTipps(session, eingaben);

        return {
            ...session,
            aktivitäten,
            pomodoros,
            pausen,
            tipps
        };
    });
}

function getInitialAktivitäten(dauer) {
    let erarbeitungDauer = Math.round(dauer * 0.6);
    let flashcardDauer = Math.round(dauer * 0.3);
    let testenDauer = Math.round(dauer * 0.1);

    // Sicherstellen, dass die Summe nicht die Gesamtdauer überschreitet
    const summe = erarbeitungDauer + flashcardDauer + testenDauer;
    if (summe > dauer) {
        const faktor = dauer / summe;
        erarbeitungDauer = Math.floor(erarbeitungDauer * faktor);
        flashcardDauer = Math.floor(flashcardDauer * faktor);
        testenDauer = dauer - erarbeitungDauer - flashcardDauer;
    }

    return [
        {
            nr: 1,
            name: '📖 Aktive Erarbeitung',
            dauer_minuten: erarbeitungDauer,
            beschreibung: 'Material aktiv lesen und in eigenen Worten zusammenfassen. Kernkonzepte identifizieren und notieren.',
            checkpunkte: [
                'Material durchgelesen?',
                'Kernkonzepte in eigenen Worten notiert?',
                'Unklare Punkte markiert?',
                'Wichtige Beispiele herausgeschrieben?'
            ]
        },
        {
            nr: 2,
            name: '🎴 Flashcard-Erstellung',
            dauer_minuten: flashcardDauer,
            beschreibung: '10-15 Flashcards mit Fragen erstellen. Mix aus Faktenwissen und Verständnisfragen.',
            checkpunkte: [
                'Mindestens 10 Flashcards erstellt?',
                'Fragen decken Kernkonzepte ab?',
                'Mix aus Fakt- und Verständnisfragen?',
                'Antworten sind präzise formuliert?'
            ]
        },
        {
            nr: 3,
            name: '✅ Sofort-Selbsttest',
            dauer_minuten: testenDauer,
            beschreibung: 'Teste dich sofort ohne nachzuschauen. Identifiziere schwierige Punkte.',
            checkpunkte: [
                'Selbsttest ohne Notizen durchgeführt?',
                'Fehler und Lücken identifiziert?',
                'Schwierige Punkte markiert?'
            ]
        }
    ];
}

function getWiederholungsAktivitäten(dauer) {
    let retrievalDauer = Math.round(dauer * 0.7);
    let fehleranalyseDauer = Math.round(dauer * 0.2);
    let elaborationDauer = Math.round(dauer * 0.1);

    // Sicherstellen, dass die Summe nicht die Gesamtdauer überschreitet
    const summe = retrievalDauer + fehleranalyseDauer + elaborationDauer;
    if (summe > dauer) {
        const faktor = dauer / summe;
        retrievalDauer = Math.floor(retrievalDauer * faktor);
        fehleranalyseDauer = Math.floor(fehleranalyseDauer * faktor);
        elaborationDauer = dauer - retrievalDauer - fehleranalyseDauer;
    }

    return [
        {
            nr: 1,
            name: '🧠 Retrieval Practice',
            dauer_minuten: retrievalDauer,
            beschreibung: 'Flashcards OHNE nachzuschauen beantworten. Active Recall ist der Schlüssel!',
            checkpunkte: [
                'Alle Flashcards ohne Spicker beantwortet?',
                'Antworten aufgeschrieben oder laut gesagt?',
                'Schwierigkeitsgrad pro Karte notiert?',
                'Nicht gewusste Karten markiert?'
            ]
        },
        {
            nr: 2,
            name: '🔍 Fehleranalyse',
            dauer_minuten: fehleranalyseDauer,
            beschreibung: 'Richtige Antworten prüfen und Fehler verstehen. Warum war die Antwort falsch?',
            checkpunkte: [
                'Alle Antworten mit Lösung verglichen?',
                'Fehlerursachen verstanden?',
                'Schwierige Karten für nächste Session markiert?',
                'Lücken im Verständnis identifiziert?'
            ]
        },
        {
            nr: 3,
            name: '💡 Elaboration',
            dauer_minuten: elaborationDauer,
            beschreibung: 'Bei schwierigen Konzepten: Warum ist das so? Wie hängt es zusammen?',
            checkpunkte: [
                '"Warum?"-Fragen gestellt?',
                'Verbindungen zu anderen Themen gefunden?',
                'Eigene Beispiele überlegt?'
            ]
        }
    ];
}

function calculatePomodoroPausen(pomodoros) {
    const pausen = [];

    for (let i = 1; i <= pomodoros; i++) {
        // Lange Pause nach jedem 4. Pomodoro
        if (i % 4 === 0 && i !== pomodoros) {
            pausen.push({
                nach_pomodoro: i,
                dauer: 15,
                typ: 'lang'
            });
        } else if (i !== pomodoros) {
            // Kurze Pause nach jedem Pomodoro (außer dem letzten)
            pausen.push({
                nach_pomodoro: i,
                dauer: 5,
                typ: 'kurz'
            });
        }
    }

    return pausen;
}

function generateSessionTipps(session, eingaben) {
    const tipps = [];

    // Basis-Tipps nach Typ
    if (session.typ === 'initial') {
        tipps.push('📝 Erstelle gute Notizen - du wirst sie in den Wiederholungen brauchen!');
        tipps.push('🎯 Fokus auf Verständnis, nicht auf Auswendiglernen');
    } else {
        tipps.push('🧠 Erst abrufen, dann nachschauen - das stärkt das Gedächtnis!');
        tipps.push('🔄 Diese Wiederholung ist optimal für deine Langzeitspeicherung');
    }

    // Komplexitäts-spezifische Tipps
    if (session.komplexität === 'schwer') {
        tipps.push('⚡ Schwieriges Thema - nimm dir Zeit und mache Pausen');
    }

    // Chronotyp-Tipps
    if (eingaben.chronotyp === 'morgen' && session.uhrzeit && session.uhrzeit.startsWith('0')) {
        tipps.push('🌅 Perfekte Zeit für dich als Morgenmensch!');
    }

    return tipps;
}

// ===================================
// PHASE 7: METADATA & EMPFEHLUNGEN
// ===================================

function calculateMetadata(sessions, eingaben, zeitrahmen, spacingInfo) {
    const initialSessions = sessions.filter(s => s.typ === 'initial').length;
    const wiederholungsSessions = sessions.filter(s => s.typ === 'wiederholung').length;
    const gesamtLernzeitMinuten = sessions.reduce((sum, s) => sum + s.dauer, 0);
    const gesamtLernzeitStunden = gesamtLernzeitMinuten / 60;

    // Erfolgschance berechnen
    const erfolgschance = calculateErfolgschance(
        zeitrahmen,
        spacingInfo,
        eingaben,
        wiederholungsSessions,
        sessions.length
    );

    return {
        gesamt_sessions: sessions.length,
        initial_sessions: initialSessions,
        wiederholungs_sessions: wiederholungsSessions,
        gesamt_lernzeit_stunden: Math.round(gesamtLernzeitStunden * 10) / 10,
        gesamt_lernzeit_minuten: gesamtLernzeitMinuten,
        durchschnitt_pro_session_minuten: Math.round(gesamtLernzeitMinuten / sessions.length),
        themen_anzahl: eingaben.themen.length,
        spacing_zyklen_pro_thema: Math.round(sessions.length / eingaben.themen.length),
        erfolgschance_prozent: erfolgschance
    };
}

function calculateErfolgschance(zeitrahmen, spacingInfo, eingaben, wiederholungen, gesamtSessions) {
    let chance = 50; // Basis

    // Faktor 1: Zeitrahmen
    if (zeitrahmen.tage >= 14) {
        chance += 20;
    } else if (zeitrahmen.tage >= 7) {
        chance += 10;
    } else {
        chance -= 10;
    }

    // Faktor 2: Spaced Repetition aktiv?
    if (eingaben.methoden_präferenz?.spaced_repetition !== false) {
        chance += 15;
    }

    // Faktor 3: Active Recall aktiv?
    if (eingaben.methoden_präferenz?.active_recall !== false) {
        chance += 10;
    }

    // Faktor 4: Interleaving (bei mehreren Themen)
    if (eingaben.methoden_präferenz?.interleaving && eingaben.themen.length > 1) {
        chance += 5;
    }

    // Faktor 5: Wiederholungsrate
    const wiederholungsrate = wiederholungen / gesamtSessions;
    chance += wiederholungsrate * 10;

    // Range: 30-95%
    return Math.max(30, Math.min(95, Math.round(chance)));
}

function generateEmpfehlungen(eingaben, zeitrahmen, spacingInfo, metadata) {
    const empfehlungen = [];

    // Zeitrahmen-Warnungen
    empfehlungen.push(...getSpacingRecommendations(spacingInfo.quality));

    // Verfügbare Zeit vs. Genutzte Zeit Check
    const verfügbareWochentage = Object.keys(eingaben.wochentage_verfügbarkeit || {})
        .filter(tag => eingaben.wochentage_verfügbarkeit[tag]?.verfügbar);

    if (verfügbareWochentage.length > 0) {
        // Berechne verfügbare Stunden pro Woche
        const verfügbareStundenProWoche = verfügbareWochentage.reduce((sum, tag) => {
            return sum + (eingaben.wochentage_verfügbarkeit[tag]?.stunden || 0);
        }, 0);

        const verfügbareGesamtstunden = verfügbareStundenProWoche * zeitrahmen.wochen;
        const genutzteStunden = metadata.gesamt_lernzeit_stunden;
        const auslastung = (genutzteStunden / verfügbareGesamtstunden) * 100;

        // Warnung bei niedriger Auslastung (< 30%)
        if (auslastung < 30 && verfügbareGesamtstunden > 10) {
            empfehlungen.push({
                typ: 'info',
                titel: 'Viel ungenutzte Zeit',
                icon: '⏰',
                text: `Du hast ${Math.round(verfügbareGesamtstunden)} Std verfügbar, nutzt aber nur ${genutzteStunden.toFixed(1)} Std (${Math.round(auslastung)}%). ${eingaben.themen.length === 1 ? 'Erwäge weitere Themen hinzuzufügen oder dein Thema in Unterthemen aufzuteilen.' : 'Du könntest mehr Sessions pro Thema einplanen.'}`,
                priorität: 'mittel',
                aktion: eingaben.themen.length === 1 ? 'Füge weitere Themen hinzu' : 'Erwäge mehr Vertiefungs-Sessions'
            });
        }

        // Warnung bei hohem Workload
        const stundenProWoche = metadata.gesamt_lernzeit_stunden / zeitrahmen.wochen;
        if (stundenProWoche > 15) {
            empfehlungen.push({
                typ: 'warnung',
                titel: 'Hoher Workload',
                icon: '⚠️',
                text: `Du hast ${Math.round(stundenProWoche)} Stunden/Woche eingeplant. Das ist ambitioniert! Achte auf ausreichend Pausen.`,
                priorität: 'mittel',
                aktion: 'Plane bewusst Erholungstage ein'
            });
        }
    }

    // Methoden-Tipps
    if (eingaben.methoden_präferenz?.active_recall === false) {
        empfehlungen.push({
            typ: 'tipp',
            titel: 'Active Recall aktivieren?',
            icon: '💡',
            text: 'Active Recall hat die stärkste wissenschaftliche Evidenz (d=0.74). Überleg dir, diese Methode zu nutzen!',
            priorität: 'mittel',
            aktion: null
        });
    }

    // Allgemeine Tipps
    empfehlungen.push({
        typ: 'info',
        titel: 'Schlaf ist essentiell',
        icon: '😴',
        text: 'Schlaf konsolidiert Gelerntes. Ziel: 7-9 Stunden pro Nacht.',
        priorität: 'niedrig',
        aktion: null
    });

    empfehlungen.push({
        typ: 'info',
        titel: 'Hydration beachten',
        icon: '💧',
        text: 'Dehydration erhöht kognitiven Stress. Trinke genug Wasser während des Lernens!',
        priorität: 'niedrig',
        aktion: null
    });

    empfehlungen.push({
        typ: 'tipp',
        titel: 'Handy weg!',
        icon: '📱',
        text: 'Lege dein Handy während Lernsessions in einen anderen Raum. Das reduziert Ablenkungen massiv.',
        priorität: 'niedrig',
        aktion: null
    });

    return empfehlungen;
}
