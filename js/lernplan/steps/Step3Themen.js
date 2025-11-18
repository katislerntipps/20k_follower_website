// ===================================
// STEP 3: THEMEN & FÄCHER
// ===================================

export class Step3Themen {
    constructor(container, formData, onComplete) {
        this.container = container;
        this.formData = formData;
        this.onComplete = onComplete;
        this.stepElement = null;

        // Stelle sicher, dass themen-Array existiert
        if (!this.formData.themen || this.formData.themen.length === 0) {
            this.formData.themen = [{
                name: '',
                komplexität: 'mittel',
                priorität: 'mittel'
            }];
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
            <div class="wizard-step" id="step-3">
                <h2 class="step-title">📚 Fach und Themen</h2>
                <p class="step-description">
                    Definiere das Hauptfach und die spezifischen Themen, die du lernen möchtest.
                </p>

                <div class="form-group">
                    <label class="form-label" for="fach">📖 Fach oder Hauptthema</label>
                    <input type="text" id="fach" class="form-input"
                           placeholder="z.B. Mathematik, Biologie, Geschichte..."
                           value="${this.formData.fach || ''}">
                </div>

                <div class="form-group">
                    <label class="form-label" for="fachkategorie">🏷️ Fachkategorie</label>
                    <div class="info-tooltip-container">
                        <select id="fachkategorie" class="form-input">
                            <option value="">-- Bitte wählen --</option>
                            <option value="STEM" ${this.formData.fachkategorie === 'STEM' ? 'selected' : ''}>
                                STEM (Mathematik, Naturwissenschaften, Technik)
                            </option>
                            <option value="Geisteswissenschaft" ${this.formData.fachkategorie === 'Geisteswissenschaft' ? 'selected' : ''}>
                                Geisteswissenschaften (Geschichte, Literatur, Philosophie)
                            </option>
                            <option value="Sprache" ${this.formData.fachkategorie === 'Sprache' ? 'selected' : ''}>
                                Sprache (Englisch, Französisch, Spanisch...)
                            </option>
                            <option value="Sonstiges" ${this.formData.fachkategorie === 'Sonstiges' ? 'selected' : ''}>
                                Sonstiges
                            </option>
                        </select>
                        <span class="info-tooltip">ℹ️ STEM = höhere Problemlösungsanteile, Geisteswissenschaften = mehr Lesen/Reflexion</span>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">📝 Themen (min. 1, max. 10)</label>
                    <div id="themen-list">
                        ${this.renderThemenList()}
                    </div>
                    <button type="button" class="btn btn-outline" id="add-thema" ${this.formData.themen.length >= 10 ? 'disabled' : ''}>
                        + Thema hinzufügen
                    </button>
                </div>

                <div class="form-group">
                    <label class="form-label" for="verständnis">💡 Dein aktuelles Verständnis: <span id="verständnis-value">${this.formData.aktuelles_verständnis}</span>/10</label>
                    <input type="range" id="verständnis" class="form-range"
                           min="1" max="10" value="${this.formData.aktuelles_verständnis || 5}">
                    <div class="range-labels">
                        <span>Anfänger</span>
                        <span>Grundlagen</span>
                        <span>Fortgeschritten</span>
                    </div>
                </div>

                <div class="validation-error" id="step3-error" style="display: none;"></div>
            </div>
        `;

        this.container.innerHTML = html;
        this.stepElement = this.container.querySelector('#step-3');
    }

    renderThemenList() {
        return this.formData.themen.map((thema, index) => `
            <div class="thema-item" data-index="${index}">
                <div class="thema-header">
                    <input type="text" class="form-input thema-name"
                           placeholder="z.B. Integralrechnung"
                           value="${thema.name || ''}"
                           data-index="${index}">
                    ${this.formData.themen.length > 1 ? `
                        <button type="button" class="btn-icon btn-remove" data-index="${index}" title="Entfernen">
                            ✕
                        </button>
                    ` : ''}
                </div>

                <div class="thema-options">
                    <div class="option-group">
                        <label class="option-label">Komplexität:</label>
                        <div class="radio-inline">
                            <label class="radio-label-inline">
                                <input type="radio" name="komplexität-${index}" value="leicht"
                                       ${thema.komplexität === 'leicht' ? 'checked' : ''}>
                                Leicht
                            </label>
                            <label class="radio-label-inline">
                                <input type="radio" name="komplexität-${index}" value="mittel"
                                       ${thema.komplexität === 'mittel' || !thema.komplexität ? 'checked' : ''}>
                                Mittel
                            </label>
                            <label class="radio-label-inline">
                                <input type="radio" name="komplexität-${index}" value="schwer"
                                       ${thema.komplexität === 'schwer' ? 'checked' : ''}>
                                Schwer
                            </label>
                        </div>
                    </div>

                    <div class="option-group">
                        <label class="option-label">Priorität:</label>
                        <div class="radio-inline">
                            <label class="radio-label-inline">
                                <input type="radio" name="priorität-${index}" value="niedrig"
                                       ${thema.priorität === 'niedrig' ? 'checked' : ''}>
                                Niedrig
                            </label>
                            <label class="radio-label-inline">
                                <input type="radio" name="priorität-${index}" value="mittel"
                                       ${thema.priorität === 'mittel' || !thema.priorität ? 'checked' : ''}>
                                Mittel
                            </label>
                            <label class="radio-label-inline">
                                <input type="radio" name="priorität-${index}" value="hoch"
                                       ${thema.priorität === 'hoch' ? 'checked' : ''}>
                                Hoch
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    attachListeners() {
        // Add Thema Button
        document.getElementById('add-thema')?.addEventListener('click', () => this.addThema());

        // Remove Thema Buttons
        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                this.removeThema(index);
            });
        });

        // Verständnis Slider
        const verständnisSlider = document.getElementById('verständnis');
        verständnisSlider?.addEventListener('input', (e) => {
            document.getElementById('verständnis-value').textContent = e.target.value;
        });
    }

    addThema() {
        if (this.formData.themen.length >= 10) return;

        this.formData.themen.push({
            name: '',
            komplexität: 'mittel',
            priorität: 'mittel'
        });

        this.render();
        this.attachListeners();
    }

    removeThema(index) {
        if (this.formData.themen.length <= 1) return;

        this.formData.themen.splice(index, 1);
        this.render();
        this.attachListeners();
    }

    validate() {
        const fach = document.getElementById('fach')?.value.trim();
        const fachkategorie = document.getElementById('fachkategorie')?.value;

        if (!fach) {
            this.showError('Bitte gib ein Fach oder Hauptthema an.');
            return false;
        }

        if (!fachkategorie) {
            this.showError('Bitte wähle eine Fachkategorie aus.');
            return false;
        }

        // Sammle Themen-Daten
        const themenNames = Array.from(document.querySelectorAll('.thema-name')).map(input => input.value.trim());

        if (themenNames.some(name => !name)) {
            this.showError('Bitte fülle alle Themen-Namen aus oder entferne leere Themen.');
            return false;
        }

        return true;
    }

    updateFormData() {
        this.formData.fach = document.getElementById('fach')?.value.trim();
        this.formData.fachkategorie = document.getElementById('fachkategorie')?.value;
        this.formData.aktuelles_verständnis = parseInt(document.getElementById('verständnis')?.value);

        // Update themen array
        const themenElements = document.querySelectorAll('.thema-item');
        this.formData.themen = Array.from(themenElements).map((el, index) => {
            const name = el.querySelector('.thema-name')?.value.trim();
            const komplexität = el.querySelector(`input[name="komplexität-${index}"]:checked`)?.value || 'mittel';
            const priorität = el.querySelector(`input[name="priorität-${index}"]:checked`)?.value || 'mittel';

            return { name, komplexität, priorität };
        });
    }

    showError(message) {
        const errorElement = document.getElementById('step3-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    clearError() {
        const errorElement = document.getElementById('step3-error');
        if (errorElement) errorElement.style.display = 'none';
    }
}
