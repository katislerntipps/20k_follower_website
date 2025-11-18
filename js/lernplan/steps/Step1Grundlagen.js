// ===================================
// STEP 1: GRUNDLAGEN - Lerntyp & Szenario
// ===================================

export class Step1Grundlagen {
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
        if (this.stepElement) {
            this.stepElement.style.display = 'none';
        }
    }

    render() {
        const html = `
            <div class="wizard-step" id="step-1">
                <h2 class="step-title">📚 Lerntyp und Szenario</h2>
                <p class="step-description">
                    Wähle zunächst, ob du Schüler/in oder Student/in bist und was dein Lernziel ist.
                </p>

                <!-- Lerntyp Auswahl -->
                <div class="form-group">
                    <label class="form-label">Ich bin...</label>
                    <div class="button-group">
                        <button type="button" class="choice-button ${this.formData.lerntyp === 'schüler' ? 'active' : ''}"
                                data-value="schüler">
                            <div class="choice-icon">🎒</div>
                            <div class="choice-title">Schüler/in</div>
                            <div class="choice-description">Gymnasium (14-19 Jahre)</div>
                        </button>
                        <button type="button" class="choice-button ${this.formData.lerntyp === 'student' ? 'active' : ''}"
                                data-value="student">
                            <div class="choice-icon">🎓</div>
                            <div class="choice-title">Student/in</div>
                            <div class="choice-description">Universität/Hochschule (18+ Jahre)</div>
                        </button>
                    </div>
                    <input type="hidden" id="lerntyp" value="${this.formData.lerntyp || ''}">
                </div>

                <!-- Szenario Auswahl -->
                <div class="form-group">
                    <label class="form-label">Mein Ziel ist...</label>
                    <div class="button-group">
                        <button type="button" class="choice-button ${this.formData.szenario === 'prüfung' ? 'active' : ''}"
                                data-value="prüfung">
                            <div class="choice-icon">📝</div>
                            <div class="choice-title">Prüfungsvorbereitung</div>
                            <div class="choice-description">Ich bereite mich auf eine konkrete Prüfung vor</div>
                        </button>
                        <button type="button" class="choice-button ${this.formData.szenario === 'kontinuierlich' ? 'active' : ''}"
                                data-value="kontinuierlich">
                            <div class="choice-icon">📚</div>
                            <div class="choice-title">Kontinuierliches Lernen</div>
                            <div class="choice-description">Ich möchte regelmäßig über längere Zeit lernen</div>
                        </button>
                    </div>
                    <input type="hidden" id="szenario" value="${this.formData.szenario || ''}">
                </div>

                <div class="validation-error" id="step1-error" style="display: none;"></div>
            </div>
        `;

        this.container.innerHTML = html;
        this.stepElement = this.container.querySelector('#step-1');
    }

    attachListeners() {
        // Lerntyp Buttons
        const lerntypButtons = this.stepElement.querySelectorAll('.button-group:nth-child(1) .choice-button');
        lerntypButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                lerntypButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('lerntyp').value = btn.dataset.value;
                this.clearError();
            });
        });

        // Szenario Buttons
        const szenarioButtons = this.stepElement.querySelectorAll('.button-group:nth-child(1):last-of-type .choice-button');
        const allButtons = this.stepElement.querySelectorAll('.choice-button');
        allButtons.forEach(btn => {
            if (btn.dataset.value === 'prüfung' || btn.dataset.value === 'kontinuierlich') {
                btn.addEventListener('click', () => {
                    szenarioButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    document.getElementById('szenario').value = btn.dataset.value;
                    this.clearError();
                });
            }
        });
    }

    validate() {
        const lerntyp = document.getElementById('lerntyp')?.value;
        const szenario = document.getElementById('szenario')?.value;

        if (!lerntyp || !szenario) {
            this.showError('Bitte wähle sowohl deinen Lerntyp als auch dein Szenario aus.');
            return false;
        }

        return true;
    }

    updateFormData() {
        this.formData.lerntyp = document.getElementById('lerntyp')?.value;
        this.formData.szenario = document.getElementById('szenario')?.value;
    }

    showError(message) {
        const errorElement = document.getElementById('step1-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    clearError() {
        const errorElement = document.getElementById('step1-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
}
