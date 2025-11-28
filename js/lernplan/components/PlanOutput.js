// ===================================
// PLAN OUTPUT - Anzeige des generierten Plans
// ===================================

import { exportAsPDF, exportAsICS } from '../utils/exportHelpers.js';
import { formatDuration } from '../utils/dateHelpers.js';
import { escapeHTML, sanitizeChoice } from '../utils/sanitize.js';

export class PlanOutput {
    constructor(container, plan, onRestart, onBackToThemen = null) {
        this.container = container;
        this.plan = plan;
        this.onRestart = onRestart;
        this.onBackToThemen = onBackToThemen;
        this.viewMode = 'liste'; // 'liste' oder 'kalender'
        this.selectedSession = null;

        this.render();
        this.attachListeners();
    }

    render() {
        const html = `
            <div class="plan-output">
                <!-- Header -->
                <div class="plan-header">
                    <h1 class="plan-title">
                        <span class="plan-emoji">🎉</span>
                        <span class="plan-text">Dein persönlicher Lernplan</span>
                    </h1>
                    <p class="plan-subtitle">Wissenschaftlich fundiert und auf dich zugeschnitten</p>
                </div>

                <!-- Metadata -->
                <div class="plan-metadata">
                    <div class="metadata-grid">
                        <div class="metadata-card erfolgschance">
                            <div class="metadata-icon">🎯</div>
                            <div class="metadata-content">
                                <div class="metadata-value">${escapeHTML(this.plan.metadata.erfolgschance_prozent)}%</div>
                                <div class="metadata-label">Erfolgschance</div>
                            </div>
                        </div>
                        <div class="metadata-card">
                            <div class="metadata-icon">📝</div>
                            <div class="metadata-content">
                                <div class="metadata-value">${escapeHTML(this.plan.metadata.gesamt_sessions)}</div>
                                <div class="metadata-label">Sessions gesamt</div>
                            </div>
                        </div>
                        <div class="metadata-card">
                            <div class="metadata-icon">⏱️</div>
                            <div class="metadata-content">
                                <div class="metadata-value">${escapeHTML(this.plan.metadata.gesamt_lernzeit_stunden)} Std</div>
                                <div class="metadata-label">Lernzeit gesamt</div>
                            </div>
                        </div>
                        <div class="metadata-card">
                            <div class="metadata-icon">🔄</div>
                            <div class="metadata-content">
                                <div class="metadata-value">${escapeHTML(this.plan.metadata.spacing_zyklen_pro_thema)}x</div>
                                <div class="metadata-label">Wiederholungen</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empfehlungen -->
                ${this.renderEmpfehlungen()}

                <!-- Toolbar -->
                <div class="plan-toolbar">
                    <div class="toolbar-left">
                        <div class="view-toggle">
                            <button class="toggle-btn active" data-view="liste">
                                📋 Liste
                            </button>
                            <button class="toggle-btn" data-view="kalender">
                                📅 Kalender
                            </button>
                        </div>
                    </div>
                    <div class="toolbar-right">
                        <button class="btn btn-outline" id="export-pdf">
                            📥 PDF
                        </button>
                        <button class="btn btn-outline" id="export-ics">
                            📅 Kalender
                        </button>
                        <button class="btn btn-secondary" id="restart">
                            🔄 Neuer Plan
                        </button>
                    </div>
                </div>

                ${this.renderReminderStatus()}

                <!-- Sessions Container -->
                <div class="sessions-container">
                    <div id="liste-view" class="liste-view">
                        ${this.renderListeView()}
                    </div>
                    <div id="kalender-view" class="kalender-view" style="display: none;">
                        ${this.renderKalenderView()}
                    </div>
                </div>
            </div>

            <!-- Session Details Modal -->
            <div class="modal-overlay" id="session-modal" style="display: none;">
                <div class="modal plan-modal">
                    <div class="modal-header">
                        <h3 id="modal-title"></h3>
                        <button class="modal-close">×</button>
                    </div>
                    <div class="modal-body" id="modal-body"></div>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
    }

    renderReminderStatus() {
        const einstellungen = this.plan?.eingaben_zusammenfassung;

        if (!einstellungen?.reminder_gewünscht) return '';

        const reminderTyp = sanitizeChoice(einstellungen.reminder_typ, ['email', 'push', 'kalender', 'keine'], 'email');
        const isEmail = reminderTyp === 'email';
        const typLabel = isEmail ? 'E-Mail' : (reminderTyp === 'push' ? 'Push' : 'Kalenderhinweis');
        const emailInfo = isEmail && einstellungen.reminder_email
            ? `<div class="reminder-extra">📧 Erinnerungen gehen an <strong>${escapeHTML(einstellungen.reminder_email)}</strong>. Du kannst die Adresse im letzten Schritt anpassen.</div>`
            : '';

        return `
            <div class="reminder-banner">
                <div class="reminder-icon">🔔</div>
                <div class="reminder-content">
                    <div class="reminder-title">Erinnerungen aktiv</div>
                    <div class="reminder-text">Wir planen eine ${escapeHTML(typLabel)}-Erinnerung 15 Minuten vor jeder Session ein.</div>
                    ${emailInfo}
                </div>
            </div>
        `;
    }

    renderEmpfehlungen() {
        if (!this.plan.empfehlungen || this.plan.empfehlungen.length === 0) {
            return '';
        }

        const wichtigeEmpfehlungen = this.plan.empfehlungen.filter(e => e.priorität === 'hoch' || e.priorität === 'mittel').slice(0, 3);

        if (wichtigeEmpfehlungen.length === 0) return '';

        return `
            <div class="empfehlungen-section">
                <h3 class="section-subtitle">💡 Wichtige Hinweise</h3>
                <div class="empfehlungen-grid">
                    ${wichtigeEmpfehlungen.map((emp, index) => `
                        <div class="empfehlung-card empfehlung-${sanitizeChoice(emp.typ, ['warnung', 'erfolg', 'tipp', 'info', 'ungenutzte_zeit'], 'info')}">
                            <div class="empfehlung-icon">${escapeHTML(emp.icon || '💡')}</div>
                            <div class="empfehlung-content">
                                <div class="empfehlung-titel">${escapeHTML(emp.titel)}</div>
                                <div class="empfehlung-text">${escapeHTML(emp.text)}</div>
                                ${emp.actionType === 'back_to_themen' && emp.aktion ?
                                    `<button class="empfehlung-aktion-btn" data-action="back-to-themen">${escapeHTML(emp.aktion)}</button>` :
                                    (emp.aktion ? `<div class="empfehlung-aktion">→ ${escapeHTML(emp.aktion)}</div>` : '')
                                }
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderListeView() {
        // Gruppiere Sessions nach Tag
        const sessionsByDay = {};

        this.plan.sessions.forEach(session => {
            if (!sessionsByDay[session.datum]) {
                sessionsByDay[session.datum] = [];
            }
            sessionsByDay[session.datum].push(session);
        });

        const sortedDates = Object.keys(sessionsByDay).sort();

        return `
            <div class="sessions-list">
                ${sortedDates.map(datum => {
                    const daySessions = sessionsByDay[datum];
                    const firstSession = daySessions[0];

                    return `
                        <div class="day-group">
                            <div class="day-header">
                                <div class="day-date">${escapeHTML(firstSession.datum_formatiert_lang)}</div>
                                <div class="day-meta">${daySessions.length} Session${daySessions.length > 1 ? 's' : ''}</div>
                            </div>
                            <div class="day-sessions">
                                ${daySessions.map(session => this.renderSessionCard(session)).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderSessionCard(session) {
        const icon = session.typ === 'initial' ? '📖' : '🔄';
        const typLabel = session.typ === 'initial' ? 'Erste Session' : `Wiederholung ${session.zyklus}`;
        const komplexität = sanitizeChoice(session.komplexität, ['leicht', 'mittel', 'schwer'], 'mittel');
        const priorität = sanitizeChoice(session.priorität, ['niedrig', 'mittel', 'hoch'], 'mittel');

        return `
            <div class="session-card" data-session-id="${session.id}">
                <div class="session-icon">${icon}</div>
                <div class="session-content">
                    <div class="session-title">${escapeHTML(session.thema)}</div>
                    <div class="session-meta">
                        <span class="session-typ">${escapeHTML(typLabel)}</span>
                        <span class="session-separator">•</span>
                        <span class="session-time">${escapeHTML(session.uhrzeit)} - ${escapeHTML(session.endzeit)}</span>
                        <span class="session-separator">•</span>
                        <span class="session-duration">${formatDuration(session.dauer)}</span>
                    </div>
                    <div class="session-tags">
                        <span class="tag tag-komplexität tag-${komplexität}">${escapeHTML(komplexität)}</span>
                        <span class="tag tag-priorität tag-${priorität}">${escapeHTML(priorität)}</span>
                        ${session.pomodoros ? `<span class="tag tag-pomodoro">🍅 ${escapeHTML(session.pomodoros)}</span>` : ''}
                    </div>
                </div>
                <div class="session-actions">
                    <button class="btn btn-icon" data-session-id="${session.id}" title="Details anzeigen">
                        →
                    </button>
                </div>
            </div>
        `;
    }

    renderKalenderView() {
        // Einfache Kalender-Ansicht (Liste nach Wochen gruppiert)
        const sessionsByWeek = {};
        let currentWeek = 0;

        this.plan.sessions.forEach(session => {
            const week = Math.floor(session.tagNachStart / 7);
            if (!sessionsByWeek[week]) {
                sessionsByWeek[week] = [];
            }
            sessionsByWeek[week].push(session);
        });

        return `
            <div class="kalender-grid">
                ${Object.keys(sessionsByWeek).sort((a, b) => a - b).map(week => `
                    <div class="week-card">
                        <div class="week-header">
                            <h4>Woche ${parseInt(week) + 1}</h4>
                            <span>${sessionsByWeek[week].length} Sessions</span>
                        </div>
                        <div class="week-sessions">
                            ${sessionsByWeek[week].map(session => `
                                <div class="calendar-session" data-session-id="${session.id}">
                                    <div class="cal-session-time">${escapeHTML(session.datum_formatiert)}</div>
                                    <div class="cal-session-title">${session.typ === 'initial' ? '📖' : '🔄'} ${escapeHTML(session.thema)}</div>
                                    <div class="cal-session-duration">${escapeHTML(session.uhrzeit)} • ${formatDuration(session.dauer)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    attachListeners() {
        // View Toggle
        const toggleButtons = this.container.querySelectorAll('.toggle-btn');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.switchView(view);
            });
        });

        // Event Delegation für Session Cards und Buttons
        this.container.addEventListener('click', (e) => {
            // Check if clicked on session card
            const sessionCard = e.target.closest('.session-card, .calendar-session');
            if (sessionCard) {
                // Check if it was the action button (don't trigger card click)
                const isActionButton = e.target.closest('.session-actions button');
                if (!isActionButton) {
                    this.openSession(sessionCard.getAttribute('data-session-id'));
                }
            }

            // Check if clicked on action button
            const actionButton = e.target.closest('.session-actions button');
            if (actionButton) {
                e.stopPropagation();
                this.openSession(actionButton.getAttribute('data-session-id'));
            }
        });

        // Direkt auf Karten/Button klicken (Fallback, falls Event Delegation blockiert wird)
        this.bindSessionClicks();

        // Export Buttons
        document.getElementById('export-pdf')?.addEventListener('click', () => this.exportPDF());
        document.getElementById('export-ics')?.addEventListener('click', () => this.exportICS());

        // Restart Button
        document.getElementById('restart')?.addEventListener('click', () => {
            if (confirm('Möchtest du wirklich einen neuen Plan erstellen? Der aktuelle Plan geht verloren.')) {
                this.onRestart();
            }
        });

        // Back to Themen Buttons
        const backToThemenButtons = this.container.querySelectorAll('[data-action="back-to-themen"]');
        backToThemenButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.onBackToThemen) {
                    this.onBackToThemen();
                }
            });
        });

        // Modal Close
        const modal = this.container.querySelector('#session-modal');
        const closeBtn = modal?.querySelector('.modal-close');
        closeBtn?.addEventListener('click', () => this.closeModal());

        modal?.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
    }

    bindSessionClicks() {
        const sessionElements = this.container.querySelectorAll('.session-card, .calendar-session, .session-actions button');

        sessionElements.forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const sessionId = e.currentTarget.getAttribute('data-session-id');
                if (sessionId) {
                    this.openSession(sessionId);
                }
            });
        });
    }

    openSession(sessionId) {
        if (!sessionId) return;

        const session = this.plan.sessions.find(s => String(s.id) === String(sessionId));
        if (session) {
            this.showSessionDetails(session);
        }
    }

    switchView(view) {
        this.viewMode = view;

        // Update buttons
        const buttons = this.container.querySelectorAll('.toggle-btn');
        buttons.forEach(btn => {
            if (btn.dataset.view === view) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Toggle views
        if (view === 'liste') {
            document.getElementById('liste-view').style.display = 'block';
            document.getElementById('kalender-view').style.display = 'none';
        } else {
            document.getElementById('liste-view').style.display = 'none';
            document.getElementById('kalender-view').style.display = 'block';
        }
    }

    showSessionDetails(session) {
        const modal = this.container.querySelector('#session-modal');
        const modalTitle = modal.querySelector('#modal-title');
        const modalBody = modal.querySelector('#modal-body');

        const icon = session.typ === 'initial' ? '📖' : '🔄';
        const typLabel = session.typ === 'initial' ? 'Erste Lernsession' : `Wiederholung (Zyklus ${session.zyklus})`;
        const komplexität = sanitizeChoice(session.komplexität, ['leicht', 'mittel', 'schwer'], 'mittel');
        const priorität = sanitizeChoice(session.priorität, ['niedrig', 'mittel', 'hoch'], 'mittel');

        modalTitle.textContent = `${icon} ${session.thema}`;
        modalBody.innerHTML = `
            <div class="session-details">
                <div class="detail-section">
                    <div class="detail-row">
                        <span class="detail-label">Typ:</span>
                        <span class="detail-value">${escapeHTML(typLabel)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Datum:</span>
                        <span class="detail-value">${escapeHTML(session.datum_formatiert_lang)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Uhrzeit:</span>
                        <span class="detail-value">${escapeHTML(session.uhrzeit)} - ${escapeHTML(session.endzeit)} Uhr</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Dauer:</span>
                        <span class="detail-value">${formatDuration(session.dauer)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Komplexität:</span>
                        <span class="detail-value"><span class="tag tag-${komplexität}">${escapeHTML(komplexität)}</span></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Priorität:</span>
                        <span class="detail-value"><span class="tag tag-${priorität}">${escapeHTML(priorität)}</span></span>
                    </div>
                </div>

                ${session.pomodoros ? `
                    <div class="detail-section">
                        <h4>🍅 Pomodoro-Struktur</h4>
                        <p>${escapeHTML(session.pomodoros)} Pomodoro${session.pomodoros > 1 ? 's' : ''} à 25 Minuten</p>
                        ${session.pausen.length > 0 ? `
                            <div class="pausen-list">
                                ${session.pausen.map(p => `
                                    <div class="pause-item">Nach Pomodoro ${escapeHTML(p.nach_pomodoro)}: ${escapeHTML(p.dauer)} Min ${p.typ === 'lang' ? 'lange' : ''} Pause</div>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                <div class="detail-section">
                    <h4>📋 Aktivitäten</h4>
                    ${session.aktivitäten.map(akt => `
                        <div class="aktivität-detail">
                            <div class="aktivität-header">
                                <strong>${escapeHTML(akt.name)}</strong>
                                <span class="aktivität-dauer">${escapeHTML(akt.dauer_minuten)} Min</span>
                            </div>
                            <p class="aktivität-beschreibung">${escapeHTML(akt.beschreibung)}</p>
                            <div class="checkpunkte">
                                <strong>Checkpunkte:</strong>
                                <ul>
                                    ${akt.checkpunkte.map(cp => `<li>${escapeHTML(cp)}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    `).join('')}
                </div>

                ${session.tipps && session.tipps.length > 0 ? `
                    <div class="detail-section">
                        <h4>💡 Tipps</h4>
                        <ul class="tipps-list">
                            ${session.tipps.map(tipp => `<li>${escapeHTML(tipp)}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;

        // Modal sichtbar machen und Interaktion zulassen
        modal.style.display = 'grid';
        modal.classList.add('open');
    }

    closeModal() {
        const modal = this.container.querySelector('#session-modal');
        modal.classList.remove('open');

        // Nach der Transition wieder komplett aus dem Layout nehmen
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }

    exportPDF() {
        console.log('📥 Exportiere als PDF...');
        exportAsPDF(this.plan);
    }

    exportICS() {
        console.log('📅 Exportiere als ICS...');
        exportAsICS(this.plan);
    }
}
