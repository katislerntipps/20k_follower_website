// ===================================
// STEP 4: VERFÜGBARKEIT
// ===================================

export class Step4Verfügbarkeit {
    constructor(container, formData, onComplete) {
        this.container = container;
        this.formData = formData;
        this.onComplete = onComplete;
        this.stepElement = null;

        // Initialisiere verfügbarkeit falls leer
        if (!this.formData.wochentage_verfügbarkeit || Object.keys(this.formData.wochentage_verfügbarkeit).length === 0) {
            this.formData.wochentage_verfügbarkeit = {
                montag: { verfügbar: true, stunden: 2 },
                dienstag: { verfügbar: true, stunden: 2 },
                mittwoch: { verfügbar: true, stunden: 2 },
                donnerstag: { verfügbar: true, stunden: 2 },
                freitag: { verfügbar: true, stunden: 2 },
                samstag: { verfügbar: false, stunden: 0 },
                sonntag: { verfügbar: false, stunden: 0 }
            };
        }
    }

    show() {
        this.render();
        this.attachListeners();
    }

    hide() {
        if (this.stepElement) this.stepElement.style.display = 'none';
    }

    render() {
        const wochentage = ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag'];
        const labels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

        const html = `
            <div class="wizard-step" id="step-4">
                <h2 class="step-title">📅 Wöchentliche Verfügbarkeit</h2>
                <p class="step-description">
                    An welchen Tagen kannst du lernen und wie viel Zeit steht dir zur Verfügung?
                </p>

                <div class="form-group">
                    <label class="form-label">Verfügbare Wochentage</label>
                    <div class="weekday-grid">
                        ${wochentage.map((tag, index) => {
                            const verfügbar = this.formData.wochentage_verfügbarkeit[tag]?.verfügbar;
                            const stunden = this.formData.wochentage_verfügbarkeit[tag]?.stunden || 0;

                            return `
                                <div class="weekday-item ${verfügbar ? 'active' : ''}">
                                    <label class="weekday-label">
                                        <input type="checkbox" class="weekday-checkbox" data-tag="${tag}"
                                               ${verfügbar ? 'checked' : ''}>
                                        <span class="weekday-name">${labels[index]}</span>
                                    </label>
                                    <input type="number" class="weekday-hours" data-tag="${tag}"
                                           min="0.5" max="8" step="0.5" value="${stunden}"
                                           ${!verfügbar ? 'disabled' : ''}>
                                    <span class="hours-label">Std</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">🍅 Bevorzugte Session-Länge</label>
                    <div class="radio-cards">
                        <label class="radio-card ${this.formData.bevorzugte_sessionlänge === '25' ? 'active' : ''}">
                            <input type="radio" name="sessionlänge" value="25" ${this.formData.bevorzugte_sessionlänge === '25' ? 'checked' : ''}>
                            <div class="card-title">Kurz (25 Min)</div>
                            <div class="card-description">1 Pomodoro - Gut für Anfänger</div>
                        </label>
                        <label class="radio-card ${this.formData.bevorzugte_sessionlänge === '50' || !this.formData.bevorzugte_sessionlänge ? 'active' : ''}">
                            <input type="radio" name="sessionlänge" value="50" ${this.formData.bevorzugte_sessionlänge === '50' || !this.formData.bevorzugte_sessionlänge ? 'checked' : ''}>
                            <div class="card-title">Standard (50 Min)</div>
                            <div class="card-description">2 Pomodoros - Ausgewogen</div>
                        </label>
                        <label class="radio-card ${this.formData.bevorzugte_sessionlänge === '90' ? 'active' : ''}">
                            <input type="radio" name="sessionlänge" value="90" ${this.formData.bevorzugte_sessionlänge === '90' ? 'checked' : ''}>
                            <div class="card-title">Lang (90 Min)</div>
                            <div class="card-description">3-4 Pomodoros - Deep Work</div>
                        </label>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label" for="max-sessions">📚 Max. Sessions pro Tag</label>
                    <input type="number" id="max-sessions" class="form-input" min="1" max="4"
                           value="${this.formData.max_sessions_pro_tag || 2}">
                    <small class="form-hint">Wie viele Lernsessions pro Tag sind realistisch?</small>
                </div>

                <div class="validation-error" id="step4-error" style="display: none;"></div>
            </div>
        `;

        this.container.innerHTML = html;
        this.stepElement = this.container.querySelector('#step-4');
    }

    attachListeners() {
        // Weekday checkboxes
        const checkboxes = document.querySelectorAll('.weekday-checkbox');
        checkboxes.forEach(cb => {
            cb.addEventListener('change', (e) => {
                const tag = e.target.dataset.tag;
                const item = e.target.closest('.weekday-item');
                const hoursInput = item.querySelector('.weekday-hours');

                if (e.target.checked) {
                    item.classList.add('active');
                    hoursInput.disabled = false;
                    if (hoursInput.value == 0) hoursInput.value = 2;
                } else {
                    item.classList.remove('active');
                    hoursInput.disabled = true;
                }
            });
        });

        // Session-Länge Radio Cards
        const radioCards = document.querySelectorAll('.radio-card');
        radioCards.forEach(card => {
            card.addEventListener('click', () => {
                radioCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                card.querySelector('input[type="radio"]').checked = true;
            });
        });
    }

    validate() {
        const verfügbareTage = Array.from(document.querySelectorAll('.weekday-checkbox'))
            .filter(cb => cb.checked);

        if (verfügbareTage.length < 2) {
            this.showError('Bitte wähle mindestens 2 verfügbare Tage aus.');
            return false;
        }

        return true;
    }

    updateFormData() {
        // Wochentage
        const wochentage = ['montag', 'dienstag', 'mittwoch', 'donnerstag', 'freitag', 'samstag', 'sonntag'];
        wochentage.forEach(tag => {
            const checkbox = document.querySelector(`.weekday-checkbox[data-tag="${tag}"]`);
            const hoursInput = document.querySelector(`.weekday-hours[data-tag="${tag}"]`);

            this.formData.wochentage_verfügbarkeit[tag] = {
                verfügbar: checkbox?.checked || false,
                stunden: checkbox?.checked ? parseFloat(hoursInput?.value || 2) : 0
            };
        });

        // Session-Länge
        this.formData.bevorzugte_sessionlänge = document.querySelector('input[name="sessionlänge"]:checked')?.value || '50';

        // Max Sessions
        this.formData.max_sessions_pro_tag = parseInt(document.getElementById('max-sessions')?.value) || 2;
    }

    showError(message) {
        const errorElement = document.getElementById('step4-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    clearError() {
        const errorElement = document.getElementById('step4-error');
        if (errorElement) errorElement.style.display = 'none';
    }
}
