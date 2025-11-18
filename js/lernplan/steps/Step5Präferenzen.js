// ===================================
// STEP 5: PRÄFERENZEN
// ===================================

export class Step5Präferenzen {
    constructor(container, formData, onComplete) {
        this.container = container;
        this.formData = formData;
        this.onComplete = onComplete;
        this.stepElement = null;

        // Initialisiere methoden_präferenz falls nicht vorhanden
        if (!this.formData.methoden_präferenz) {
            this.formData.methoden_präferenz = {
                spaced_repetition: true,
                active_recall: true,
                interleaving: true,
                pomodoro: true
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
        const html = `
            <div class="wizard-step" id="step-5">
                <h2 class="step-title">🧠 Persönliche Präferenzen</h2>
                <p class="step-description">
                    Passe den Lernplan an deinen Chronotyp und deine bevorzugten Lernmethoden an.
                </p>

                <div class="form-group">
                    <label class="form-label">⏰ Dein Chronotyp</label>
                    <div class="radio-cards">
                        <label class="radio-card ${this.formData.chronotyp === 'morgen' ? 'active' : ''}">
                            <input type="radio" name="chronotyp" value="morgen" ${this.formData.chronotyp === 'morgen' ? 'checked' : ''}>
                            <div class="card-icon">🌅</div>
                            <div class="card-title">Morgenmensch</div>
                            <div class="card-description">Peak-Energie 8-12 Uhr</div>
                        </label>
                        <label class="radio-card ${this.formData.chronotyp === 'neutral' || !this.formData.chronotyp ? 'active' : ''}">
                            <input type="radio" name="chronotyp" value="neutral" ${this.formData.chronotyp === 'neutral' || !this.formData.chronotyp ? 'checked' : ''}>
                            <div class="card-icon">☀️</div>
                            <div class="card-title">Neutral</div>
                            <div class="card-description">Peak-Energie 10-16 Uhr</div>
                        </label>
                        <label class="radio-card ${this.formData.chronotyp === 'abend' ? 'active' : ''}">
                            <input type="radio" name="chronotyp" value="abend" ${this.formData.chronotyp === 'abend' ? 'checked' : ''}>
                            <div class="card-icon">🌙</div>
                            <div class="card-title">Abendmensch</div>
                            <div class="card-description">Peak-Energie 16-22 Uhr</div>
                        </label>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">🎨 Lernstil</label>
                    <div class="radio-group">
                        <label class="radio-label">
                            <input type="radio" name="lernstil" value="strukturiert" ${this.formData.lernstil === 'strukturiert' ? 'checked' : ''}>
                            <span><strong>Strukturiert</strong> - Feste Zeiten, klare Routine</span>
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="lernstil" value="flexibel" ${this.formData.lernstil === 'flexibel' ? 'checked' : ''}>
                            <span><strong>Flexibel</strong> - Zeitfenster, selbst einteilen</span>
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="lernstil" value="balanced" ${this.formData.lernstil === 'balanced' || !this.formData.lernstil ? 'checked' : ''}>
                            <span><strong>Ausgewogen</strong> - Mix aus beidem</span>
                        </label>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">📚 Wissenschaftliche Lernmethoden</label>
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" name="methode" value="spaced_repetition"
                                   ${this.formData.methoden_präferenz.spaced_repetition !== false ? 'checked' : ''}>
                            <span>
                                <strong>Spaced Repetition ⭐</strong><br>
                                <small>Verteiltes Üben mit optimalen Abständen (Effektstärke d=0.75)</small>
                            </span>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" name="methode" value="active_recall"
                                   ${this.formData.methoden_präferenz.active_recall !== false ? 'checked' : ''}>
                            <span>
                                <strong>Active Recall ⭐</strong><br>
                                <small>Selbsttests ohne Spickzettel (Effektstärke d=0.74)</small>
                            </span>
                        </label>
                        <label class="checkbox-label ${this.formData.themen?.length <= 1 ? 'disabled' : ''}">
                            <input type="checkbox" name="methode" value="interleaving"
                                   ${this.formData.methoden_präferenz.interleaving !== false && this.formData.themen?.length > 1 ? 'checked' : ''}
                                   ${this.formData.themen?.length <= 1 ? 'disabled' : ''}>
                            <span>
                                <strong>Interleaving</strong><br>
                                <small>Themen mischen statt blocken ${this.formData.themen?.length <= 1 ? '(Nur bei mehreren Themen)' : ''}</small>
                            </span>
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" name="methode" value="pomodoro"
                                   ${this.formData.methoden_präferenz.pomodoro !== false ? 'checked' : ''}>
                            <span>
                                <strong>Pomodoro-Technik</strong><br>
                                <small>25 Min Fokus + 5 Min Pause</small>
                            </span>
                        </label>
                    </div>
                </div>

                <div class="validation-error" id="step5-error" style="display: none;"></div>
            </div>
        `;

        this.container.innerHTML = html;
        this.stepElement = this.container.querySelector('#step-5');
    }

    attachListeners() {
        // Chronotyp Radio Cards
        const chronotypCards = document.querySelectorAll('input[name="chronotyp"]');
        chronotypCards.forEach(radio => {
            radio.addEventListener('change', () => {
                document.querySelectorAll('.radio-cards .radio-card').forEach(c => c.classList.remove('active'));
                radio.closest('.radio-card').classList.add('active');
            });
        });
    }

    validate() {
        // Keine strengen Validierungen, Defaults sind ok
        return true;
    }

    updateFormData() {
        this.formData.chronotyp = document.querySelector('input[name="chronotyp"]:checked')?.value || 'neutral';
        this.formData.lernstil = document.querySelector('input[name="lernstil"]:checked')?.value || 'balanced';

        // Methoden
        const methoden = document.querySelectorAll('input[name="methode"]');
        this.formData.methoden_präferenz = {
            spaced_repetition: false,
            active_recall: false,
            interleaving: false,
            pomodoro: false
        };

        methoden.forEach(checkbox => {
            if (checkbox.checked) {
                this.formData.methoden_präferenz[checkbox.value] = true;
            }
        });
    }

    showError(message) {
        const errorElement = document.getElementById('step5-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    clearError() {
        const errorElement = document.getElementById('step5-error');
        if (errorElement) errorElement.style.display = 'none';
    }
}
