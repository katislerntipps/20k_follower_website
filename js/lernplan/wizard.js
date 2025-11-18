// ===================================
// LERNPLAN WIZARD - Main Controller
// ===================================

import { Step1Grundlagen } from './steps/Step1Grundlagen.js';
import { Step2Zeitrahmen } from './steps/Step2Zeitrahmen.js';
import { Step3Themen } from './steps/Step3Themen.js';
import { Step4Verfügbarkeit } from './steps/Step4Verfügbarkeit.js';
import { Step5Präferenzen } from './steps/Step5Präferenzen.js';
import { Step6Zusätzliches } from './steps/Step6Zusätzliches.js';
import { PlanOutput } from './components/PlanOutput.js';
import { generateLernplan } from './utils/planGenerator.js';

export class LernplanWizard {
    constructor(container) {
        this.container = container;
        this.currentStep = 1;
        this.totalSteps = 6;

        // Form data storage
        this.formData = this.loadFormData() || {
            // Step 1
            lerntyp: null,
            szenario: null,

            // Step 2
            startdatum: null,
            prüfungsdatum: null,
            dauer: null,
            custom_wochen: null,

            // Step 3
            fach: '',
            fachkategorie: null,
            themen: [],
            aktuelles_verständnis: 5,

            // Step 4
            wochentage_verfügbarkeit: {},
            bevorzugte_sessionlänge: '50',
            max_sessions_pro_tag: 2,

            // Step 5
            chronotyp: 'neutral',
            bevorzugte_zeiten: [],
            lernstil: 'balanced',
            methoden_präferenz: {
                spaced_repetition: true,
                active_recall: true,
                interleaving: true,
                pomodoro: true
            },
            motivationstyp: 'gemischt',

            // Step 6
            andere_verpflichtungen: [],
            puffer_gewünscht: true,
            reminder_gewünscht: false,
            reminder_typ: 'email'
        };

        this.steps = [];
        this.planOutput = null;
        this.generatedPlan = null;

        this.init();
    }

    init() {
        this.render();
        this.initializeSteps();
        this.showStep(1);
    }

    initializeSteps() {
        const stepContainer = this.container.querySelector('#step-container');

        this.steps = [
            new Step1Grundlagen(stepContainer, this.formData, this.onStepComplete.bind(this)),
            new Step2Zeitrahmen(stepContainer, this.formData, this.onStepComplete.bind(this)),
            new Step3Themen(stepContainer, this.formData, this.onStepComplete.bind(this)),
            new Step4Verfügbarkeit(stepContainer, this.formData, this.onStepComplete.bind(this)),
            new Step5Präferenzen(stepContainer, this.formData, this.onStepComplete.bind(this)),
            new Step6Zusätzliches(stepContainer, this.formData, this.onStepComplete.bind(this))
        ];
    }

    render() {
        this.container.innerHTML = `
            <div class="lernplan-wizard">
                <!-- Progress Bar -->
                <div class="wizard-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill" style="width: 16.66%"></div>
                    </div>
                    <div class="progress-steps" id="progress-steps">
                        ${this.generateProgressSteps()}
                    </div>
                </div>

                <!-- Step Container -->
                <div class="wizard-content">
                    <div id="step-container"></div>

                    <!-- Navigation Buttons -->
                    <div class="wizard-navigation">
                        <button type="button" class="btn btn-secondary" id="btn-prev" style="display: none;">
                            ← Zurück
                        </button>
                        <button type="button" class="btn btn-primary" id="btn-next">
                            Weiter →
                        </button>
                    </div>
                </div>

                <!-- Plan Output (initially hidden) -->
                <div id="plan-output" style="display: none;"></div>
            </div>
        `;

        this.attachNavigationListeners();
    }

    generateProgressSteps() {
        const stepNames = [
            'Grundlagen',
            'Zeitrahmen',
            'Themen',
            'Verfügbarkeit',
            'Präferenzen',
            'Zusätzlich'
        ];

        return stepNames.map((name, index) => `
            <div class="progress-step ${index === 0 ? 'active' : ''}" data-step="${index + 1}">
                <div class="step-circle">${index + 1}</div>
                <div class="step-label">${name}</div>
            </div>
        `).join('');
    }

    attachNavigationListeners() {
        const btnPrev = this.container.querySelector('#btn-prev');
        const btnNext = this.container.querySelector('#btn-next');

        btnPrev.addEventListener('click', () => this.prevStep());
        btnNext.addEventListener('click', () => this.nextStep());
    }

    showStep(stepNumber) {
        this.currentStep = stepNumber;

        // Hide all steps
        this.steps.forEach(step => step.hide());

        // Show current step
        const currentStepComponent = this.steps[stepNumber - 1];
        if (currentStepComponent) {
            currentStepComponent.show();
        }

        // Update UI
        this.updateProgressBar();
        this.updateNavigationButtons();
        this.updateProgressSteps();

        // Save state
        this.saveFormData();
    }

    updateProgressBar() {
        const progress = (this.currentStep / this.totalSteps) * 100;
        const progressFill = this.container.querySelector('#progress-fill');
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }

    updateProgressSteps() {
        const progressSteps = this.container.querySelectorAll('.progress-step');
        progressSteps.forEach((step, index) => {
            const stepNumber = index + 1;

            if (stepNumber < this.currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (stepNumber === this.currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
    }

    updateNavigationButtons() {
        const btnPrev = this.container.querySelector('#btn-prev');
        const btnNext = this.container.querySelector('#btn-next');

        // Zurück-Button nur ab Step 2 anzeigen
        btnPrev.style.display = this.currentStep > 1 ? 'inline-block' : 'none';

        // Weiter-Button Text ändern im letzten Step
        if (this.currentStep === this.totalSteps) {
            btnNext.textContent = '🚀 Plan generieren';
            btnNext.classList.add('btn-primary');
            btnNext.classList.remove('btn-secondary');
        } else {
            btnNext.textContent = 'Weiter →';
            btnNext.classList.add('btn-primary');
        }
    }

    async nextStep() {
        // Validiere aktuellen Step
        const currentStepComponent = this.steps[this.currentStep - 1];

        if (!currentStepComponent.validate()) {
            return;
        }

        // Update form data
        currentStepComponent.updateFormData();

        if (this.currentStep < this.totalSteps) {
            // Gehe zum nächsten Step
            this.showStep(this.currentStep + 1);
        } else {
            // Letzter Step - Generiere Plan
            await this.generatePlan();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    }

    onStepComplete(stepNumber) {
        // Callback wenn Step validiert wurde
        console.log(`Step ${stepNumber} completed`);
    }

    async generatePlan() {
        const btnNext = this.container.querySelector('#btn-next');
        btnNext.disabled = true;
        btnNext.textContent = '⏳ Generiere Plan...';

        try {
            // Generiere Plan mit Algorithmus
            this.generatedPlan = generateLernplan(this.formData);

            console.log('✅ Plan generiert:', this.generatedPlan);

            // Hide wizard
            this.container.querySelector('.wizard-progress').style.display = 'none';
            this.container.querySelector('.wizard-content').style.display = 'none';

            // Show plan output
            const planOutputContainer = this.container.querySelector('#plan-output');
            planOutputContainer.style.display = 'block';

            // Render plan
            this.planOutput = new PlanOutput(
                planOutputContainer,
                this.generatedPlan,
                this.onRestart.bind(this)
            );

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Award points
            this.awardPoints();

        } catch (error) {
            console.error('❌ Fehler bei Plan-Generierung:', error);
            alert('Es gab einen Fehler bei der Plan-Generierung. Bitte versuche es erneut.');

            btnNext.disabled = false;
            btnNext.textContent = '🚀 Plan generieren';
        }
    }

    awardPoints() {
        // Check cooldown (aus plan.html übernommen)
        const lastPlanTimestamp = localStorage.getItem('studytok_last_plan_points');

        if (!lastPlanTimestamp) {
            this.addPointsToUser(30);
            return;
        }

        const now = Date.now();
        const twentyMinutesInMs = 20 * 60 * 1000;
        const timeSinceLastPlan = now - parseInt(lastPlanTimestamp);

        if (timeSinceLastPlan >= twentyMinutesInMs) {
            this.addPointsToUser(30);
        } else {
            // Zeige nur Notification ohne Punkte
            if (typeof showNotification === 'function') {
                showNotification('🎯 Lernplan erstellt!');
            }
        }
    }

    addPointsToUser(points) {
        // Integration mit bestehendem Points-System
        if (typeof addPoints === 'function') {
            addPoints(points);
        }

        localStorage.setItem('studytok_last_plan_points', Date.now().toString());

        if (typeof showNotification === 'function') {
            showNotification(`🎯 Lernplan erstellt! +${points} Punkte`);
        }
    }

    onRestart() {
        // Restart wizard
        this.formData = {
            lerntyp: null,
            szenario: null,
            startdatum: null,
            prüfungsdatum: null,
            dauer: null,
            custom_wochen: null,
            fach: '',
            fachkategorie: null,
            themen: [],
            aktuelles_verständnis: 5,
            wochentage_verfügbarkeit: {},
            bevorzugte_sessionlänge: '50',
            max_sessions_pro_tag: 2,
            chronotyp: 'neutral',
            bevorzugte_zeiten: [],
            lernstil: 'balanced',
            methoden_präferenz: {
                spaced_repetition: true,
                active_recall: true,
                interleaving: true,
                pomodoro: true
            },
            motivationstyp: 'gemischt',
            andere_verpflichtungen: [],
            puffer_gewünscht: true,
            reminder_gewünscht: false,
            reminder_typ: 'email'
        };

        this.generatedPlan = null;
        this.clearFormData();

        // Reset UI
        this.container.querySelector('#plan-output').style.display = 'none';
        this.container.querySelector('.wizard-progress').style.display = 'block';
        this.container.querySelector('.wizard-content').style.display = 'block';

        // Reinitialize steps
        this.initializeSteps();
        this.showStep(1);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Local Storage Management
    saveFormData() {
        localStorage.setItem('lernplan_wizard_data', JSON.stringify(this.formData));
    }

    loadFormData() {
        const stored = localStorage.getItem('lernplan_wizard_data');
        return stored ? JSON.parse(stored) : null;
    }

    clearFormData() {
        localStorage.removeItem('lernplan_wizard_data');
    }
}
