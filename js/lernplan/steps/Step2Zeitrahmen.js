// ===================================
// STEP 2: ZEITRAHMEN
// ===================================

import { toISODateString, getToday, daysBetween, addDays } from '../utils/dateHelpers.js';

export class Step2Zeitrahmen {
    constructor(container, formData, onComplete) {
        this.container = container;
        this.formData = formData;
        this.onComplete = onComplete;
        this.stepElement = null;
    }

    show() {
        this.render();
        this.attachListeners();
    }

    hide() {
        if (this.stepElement) this.stepElement.style.display = 'none';
    }

    render() {
        const isPrüfung = this.formData.szenario === 'prüfung';
        const today = toISODateString(getToday());
        const minPrüfungsdatum = toISODateString(addDays(getToday(), 3));

        const html = `
            <div class="wizard-step" id="step-2">
                <h2 class="step-title">⏰ Zeitrahmen definieren</h2>
                <p class="step-description">
                    ${isPrüfung ? 'Wann beginnt deine Vorbereitung und wann ist die Prüfung?' : 'Wie lange möchtest du lernen?'}
                </p>

                ${isPrüfung ? `
                    <!-- Prüfungsvorbereitung -->
                    <div class="form-group">
                        <label class="form-label" for="startdatum">📅 Startdatum</label>
                        <input type="date" id="startdatum" class="form-input"
                               value="${this.formData.startdatum || today}" min="${today}">
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="prüfungsdatum">🎯 Prüfungstermin</label>
                        <input type="date" id="prüfungsdatum" class="form-input"
                               value="${this.formData.prüfungsdatum || ''}" min="${minPrüfungsdatum}">
                    </div>

                    <div id="time-warning" class="time-warning" style="display: none;"></div>
                ` : `
                    <!-- Kontinuierliches Lernen -->
                    <div class="form-group">
                        <label class="form-label" for="startdatum">📅 Startdatum</label>
                        <input type="date" id="startdatum" class="form-input"
                               value="${this.formData.startdatum || today}" min="${today}">
                    </div>

                    <div class="form-group">
                        <label class="form-label">📚 Lernzeitraum</label>
                        <div class="radio-group">
                            <label class="radio-label">
                                <input type="radio" name="dauer" value="1_monat"
                                       ${this.formData.dauer === '1_monat' ? 'checked' : ''}>
                                <span>1 Monat (4 Wochen)</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="dauer" value="1_semester"
                                       ${this.formData.dauer === '1_semester' ? 'checked' : ''}>
                                <span>1 Semester (16 Wochen)</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" name="dauer" value="custom"
                                       ${this.formData.dauer === 'custom' ? 'checked' : ''}>
                                <span>Individuell</span>
                            </label>
                        </div>
                    </div>

                    <div class="form-group" id="custom-wochen-group" style="display: ${this.formData.dauer === 'custom' ? 'block' : 'none'};">
                        <label class="form-label" for="custom_wochen">Anzahl Wochen</label>
                        <input type="number" id="custom_wochen" class="form-input"
                               min="2" max="52" value="${this.formData.custom_wochen || 8}">
                    </div>
                `}

                <div class="validation-error" id="step2-error" style="display: none;"></div>
            </div>
        `;

        this.container.innerHTML = html;
        this.stepElement = this.container.querySelector('#step-2');
    }

    attachListeners() {
        const isPrüfung = this.formData.szenario === 'prüfung';

        if (isPrüfung) {
            const startInput = document.getElementById('startdatum');
            const prüfungInput = document.getElementById('prüfungsdatum');

            const updateWarning = () => {
                if (startInput.value && prüfungInput.value) {
                    const days = daysBetween(startInput.value, prüfungInput.value);
                    this.showTimeWarning(days);
                }
            };

            startInput?.addEventListener('change', updateWarning);
            prüfungInput?.addEventListener('change', updateWarning);

            updateWarning();
        } else {
            // Kontinuierlich: Custom Wochen anzeigen/verbergen
            const dauerRadios = document.querySelectorAll('input[name="dauer"]');
            dauerRadios.forEach(radio => {
                radio.addEventListener('change', () => {
                    const customGroup = document.getElementById('custom-wochen-group');
                    customGroup.style.display = radio.value === 'custom' ? 'block' : 'none';
                });
            });
        }
    }

    showTimeWarning(days) {
        const warningEl = document.getElementById('time-warning');
        if (!warningEl) return;

        let message = '';
        let className = '';

        if (days < 7) {
            message = '⚠️ KRITISCH: Sehr wenig Zeit! Fokus auf Kernthemen empfohlen.';
            className = 'warning-critical';
        } else if (days >= 7 && days < 14) {
            message = '✓ AUSREICHEND: Straffer Plan möglich.';
            className = 'warning-sufficient';
        } else if (days >= 14 && days <= 28) {
            message = '✅ OPTIMAL: Ideale Spacing-Zyklen möglich!';
            className = 'warning-optimal';
        } else {
            message = '🌟 EXCELLENT: Erweiterte Wiederholungszyklen möglich!';
            className = 'warning-excellent';
        }

        warningEl.textContent = message;
        warningEl.className = `time-warning ${className}`;
        warningEl.style.display = 'block';
    }

    validate() {
        const isPrüfung = this.formData.szenario === 'prüfung';

        if (isPrüfung) {
            const startdatum = document.getElementById('startdatum')?.value;
            const prüfungsdatum = document.getElementById('prüfungsdatum')?.value;

            if (!startdatum || !prüfungsdatum) {
                this.showError('Bitte gib sowohl Start- als auch Prüfungsdatum an.');
                return false;
            }

            const days = daysBetween(startdatum, prüfungsdatum);
            if (days < 3) {
                this.showError('Die Prüfung muss mindestens 3 Tage in der Zukunft liegen.');
                return false;
            }
        } else {
            const dauer = document.querySelector('input[name="dauer"]:checked')?.value;

            if (!dauer) {
                this.showError('Bitte wähle einen Lernzeitraum aus.');
                return false;
            }

            if (dauer === 'custom') {
                const customWochen = parseInt(document.getElementById('custom_wochen')?.value);
                if (!customWochen || customWochen < 2 || customWochen > 52) {
                    this.showError('Bitte gib eine Anzahl zwischen 2 und 52 Wochen ein.');
                    return false;
                }
            }
        }

        return true;
    }

    updateFormData() {
        const isPrüfung = this.formData.szenario === 'prüfung';

        if (isPrüfung) {
            this.formData.startdatum = document.getElementById('startdatum')?.value;
            this.formData.prüfungsdatum = document.getElementById('prüfungsdatum')?.value;
        } else {
            this.formData.startdatum = document.getElementById('startdatum')?.value;
            this.formData.dauer = document.querySelector('input[name="dauer"]:checked')?.value;
            if (this.formData.dauer === 'custom') {
                this.formData.custom_wochen = parseInt(document.getElementById('custom_wochen')?.value);
            }
        }
    }

    showError(message) {
        const errorElement = document.getElementById('step2-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    clearError() {
        const errorElement = document.getElementById('step2-error');
        if (errorElement) errorElement.style.display = 'none';
    }
}
