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

        // Generate options for hours (0 to 10 in 0.5 steps) - Mobile only
        const generateHoursOptions = (selectedValue) => {
            let options = '';
            for (let i = 0; i <= 10; i += 0.5) {
                const value = i.toFixed(1);
                const selected = parseFloat(value) === parseFloat(selectedValue) ? 'selected' : '';
                options += `<option value="${value}" ${selected}>${value}</option>`;
            }
            return options;
        };

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
                                    <!-- Desktop: Input field -->
                                    <input type="number" class="weekday-hours weekday-hours-desktop" data-tag="${tag}"
                                           value="${stunden}" min="0" max="10" step="0.5"
                                           ${!verfügbar ? 'disabled' : ''}>
                                    <!-- Mobile: Select dropdown -->
                                    <select class="weekday-hours weekday-hours-mobile" data-tag="${tag}"
                                           ${!verfügbar ? 'disabled' : ''}>
                                        ${generateHoursOptions(stunden)}
                                    </select>
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
                    <!-- Desktop: Number input -->
                    <input type="number" id="max-sessions-input" class="form-input max-sessions-desktop" min="1" max="8"
                           value="${this.formData.max_sessions_pro_tag || 2}">
                    <!-- Mobile: Dropdown -->
                    <select id="max-sessions-select" class="form-input max-sessions-mobile">
                        ${[1, 2, 3, 4, 5, 6, 7, 8].map(num => `
                            <option value="${num}" ${(this.formData.max_sessions_pro_tag || 2) === num ? 'selected' : ''}>
                                ${num} Session${num > 1 ? 's' : ''}
                            </option>
                        `).join('')}
                    </select>
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
                const hoursInputDesktop = item.querySelector('.weekday-hours-desktop');
                const hoursInputMobile = item.querySelector('.weekday-hours-mobile');

                if (e.target.checked) {
                    item.classList.add('active');
                    hoursInputDesktop.disabled = false;
                    hoursInputMobile.disabled = false;
                    if (hoursInputDesktop.value == 0) {
                        hoursInputDesktop.value = 2;
                        hoursInputMobile.value = 2;
                    }
                } else {
                    item.classList.remove('active');
                    hoursInputDesktop.disabled = true;
                    hoursInputMobile.disabled = true;
                }
            });
        });

        // Sync hours between desktop and mobile inputs
        const hoursInputsDesktop = document.querySelectorAll('.weekday-hours-desktop');
        const hoursInputsMobile = document.querySelectorAll('.weekday-hours-mobile');

        hoursInputsDesktop.forEach(input => {
            input.addEventListener('input', (e) => {
                const tag = e.target.dataset.tag;
                const mobileInput = document.querySelector(`.weekday-hours-mobile[data-tag="${tag}"]`);
                if (mobileInput) {
                    mobileInput.value = e.target.value;
                }
            });
        });

        hoursInputsMobile.forEach(input => {
            input.addEventListener('change', (e) => {
                const tag = e.target.dataset.tag;
                const desktopInput = document.querySelector(`.weekday-hours-desktop[data-tag="${tag}"]`);
                if (desktopInput) {
                    desktopInput.value = e.target.value;
                }
            });
        });

        // Sync max sessions between desktop input and mobile select
        const maxSessionsInput = document.getElementById('max-sessions-input');
        const maxSessionsSelect = document.getElementById('max-sessions-select');

        if (maxSessionsInput && maxSessionsSelect) {
            maxSessionsInput.addEventListener('input', (e) => {
                maxSessionsSelect.value = e.target.value;
            });

            maxSessionsSelect.addEventListener('change', (e) => {
                maxSessionsInput.value = e.target.value;
            });
        }

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
            // Try desktop first (both are synced, so either works)
            const hoursInputDesktop = document.querySelector(`.weekday-hours-desktop[data-tag="${tag}"]`);
            const hoursInputMobile = document.querySelector(`.weekday-hours-mobile[data-tag="${tag}"]`);
            const hoursInput = hoursInputDesktop || hoursInputMobile;

            this.formData.wochentage_verfügbarkeit[tag] = {
                verfügbar: checkbox?.checked || false,
                stunden: checkbox?.checked ? parseFloat(hoursInput?.value || 2) : 0
            };
        });

        // Session-Länge
        this.formData.bevorzugte_sessionlänge = document.querySelector('input[name="sessionlänge"]:checked')?.value || '50';

        // Max Sessions (use desktop input, both are synced)
        const maxSessionsInput = document.getElementById('max-sessions-input');
        const maxSessionsSelect = document.getElementById('max-sessions-select');
        this.formData.max_sessions_pro_tag = parseInt((maxSessionsInput?.value || maxSessionsSelect?.value)) || 2;
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
