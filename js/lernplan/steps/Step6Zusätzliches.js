// ===================================
// STEP 6: ZUSÄTZLICHES
// ===================================

import { escapeHTML, sanitizeEmail } from '../utils/sanitize.js';

export class Step6Zusätzliches {
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
        const html = `
            <div class="wizard-step" id="step-6">
                <h2 class="step-title">✨ Zusätzliche Optionen</h2>
                <p class="step-description">
                    Fast geschafft! Diese Optionen helfen, deinen Plan noch besser anzupassen.
                </p>

                <div class="form-group">
                    <label class="checkbox-label-standalone">
                        <input type="checkbox" id="puffer" ${this.formData.puffer_gewünscht !== false ? 'checked' : ''}>
                        <span>
                            <strong>Pufferzeit einplanen 💫</strong><br>
                            <small>Empfohlen: Reduziert Stress bei unerwarteten Ereignissen</small>
                        </span>
                    </label>
                </div>

                <div class="form-group">
                    <label class="checkbox-label-standalone">
                        <input type="checkbox" id="reminder" ${this.formData.reminder_gewünscht ? 'checked' : ''}>
                        <span>
                            <strong>Erinnerungen aktivieren 🔔</strong><br>
                            <small>Erhalte Benachrichtigungen für deine Lernsessions (optional)</small>
                        </span>
                    </label>
                </div>

                <div class="form-group" id="reminder-type-group" style="display: ${this.formData.reminder_gewünscht ? 'block' : 'none'}; margin-left: 2rem;">
                    <label class="form-label">Benachrichtigungsart:</label>
                    <div class="radio-group">
                        <label class="radio-label">
                            <input type="radio" name="reminder-typ" value="email" ${this.formData.reminder_typ === 'email' || !this.formData.reminder_typ ? 'checked' : ''}>
                            <span>E-Mail</span>
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="reminder-typ" value="push" ${this.formData.reminder_typ === 'push' ? 'checked' : ''}>
                            <span>Push-Benachrichtigung</span>
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="reminder-typ" value="keine" ${this.formData.reminder_typ === 'keine' ? 'checked' : ''}>
                            <span>Keine (nur im Kalender)</span>
                        </label>
                    </div>
                    <div class="form-group" id="reminder-email-group" style="margin-top: 0.75rem; display: ${(this.formData.reminder_gewünscht && this.formData.reminder_typ === 'email') ? 'block' : 'none'};">
                        <label for="reminder-email" class="form-label">E-Mail für Erinnerungen</label>
                        <input
                            type="email"
                            id="reminder-email"
                            class="input"
                            pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                            placeholder="deine@email.de"
                            value="${escapeHTML(this.formData.reminder_email || '')}"
                        >
                        <small class="input-hint">Wir speichern die Adresse nur lokal, um deine Kalender-Exports mit E-Mail-Alerts zu versehen.</small>
                    </div>
                </div>

                <div class="info-box">
                    <div class="info-box-icon">💡</div>
                    <div class="info-box-content">
                        <h4>Dein Plan ist gleich fertig!</h4>
                        <p>
                            Im nächsten Schritt generieren wir deinen wissenschaftlich fundierten Lernplan
                            mit allen gewählten Einstellungen. Du kannst ihn dann als PDF exportieren
                            oder direkt in deinen Kalender eintragen.
                        </p>
                    </div>
                </div>

                <div class="validation-error" id="step6-error" style="display: none;"></div>
            </div>
        `;

        this.container.innerHTML = html;
        this.stepElement = this.container.querySelector('#step-6');
    }

    attachListeners() {
        const reminderCheckbox = document.getElementById('reminder');
        const reminderTypeGroup = document.getElementById('reminder-type-group');
        const reminderEmailGroup = document.getElementById('reminder-email-group');

        const emailRadio = document.querySelector('input[name="reminder-typ"][value="email"]');
        const reminderTypeRadios = document.querySelectorAll('input[name="reminder-typ"]');

        reminderCheckbox?.addEventListener('change', (e) => {
            reminderTypeGroup.style.display = e.target.checked ? 'block' : 'none';
            reminderEmailGroup.style.display = (e.target.checked && emailRadio?.checked) ? 'block' : 'none';
        });

        reminderTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                reminderEmailGroup.style.display = (e.target.value === 'email' && reminderCheckbox?.checked) ? 'block' : 'none';
            });
        });
    }

    validate() {
        const reminderChecked = document.getElementById('reminder')?.checked;
        const reminderType = document.querySelector('input[name="reminder-typ"]:checked')?.value;
        const reminderEmail = document.getElementById('reminder-email')?.value.trim();

        if (reminderChecked && reminderType === 'email' && !reminderEmail) {
            this.showError('Bitte gib eine E-Mail-Adresse für deine Erinnerungen ein.');
            return false;
        }

        if (reminderChecked && reminderType === 'email') {
            const sanitized = sanitizeEmail(reminderEmail);
            if (!sanitized) {
                this.showError('Bitte gib eine gültige E-Mail-Adresse ein (z.B. name@domain.de).');
                return false;
            }
        }

        this.clearError();
        return true;
    }

    updateFormData() {
        this.formData.puffer_gewünscht = document.getElementById('puffer')?.checked !== false;
        this.formData.reminder_gewünscht = document.getElementById('reminder')?.checked || false;
        this.formData.reminder_typ = document.querySelector('input[name="reminder-typ"]:checked')?.value || 'email';
        this.formData.reminder_email = sanitizeEmail(document.getElementById('reminder-email')?.value);
    }

    showError(message) {
        const errorElement = document.getElementById('step6-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    clearError() {
        const errorElement = document.getElementById('step6-error');
        if (errorElement) errorElement.style.display = 'none';
    }
}
