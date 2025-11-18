# Learning Plan Generator - Integration Guide

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                   STUDYTOK COMPANION                        │
│                  (Vanilla JavaScript)                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    SHARED LAYER                             │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  main.js     │  │  shop.js     │  │  CSS Vars    │    │
│  │  (utilities) │  │  (purchases) │  │  (theming)   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ✓ Stats (getStats, saveStats, updatePoints)             │
│  ✓ Notifications (showNotification)                       │
│  ✓ Dark mode (initializeDarkMode)                         │
│  ✓ Modals (openModal, closeModal)                         │
│  ✓ Points rules (getPointsRules)                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
                  ┌───────────────────────┐
                  │  localStorage API     │
                  │  (persistent state)   │
                  └───────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ index.html   │  │ timer.html   │  │ tipps.html   │  │ plan.html    │
│              │  │              │  │              │  │              │
│ main.js ✓    │  │ main.js ✓    │  │ main.js ✓    │  │ main.js ✓    │
│ shop.js ✓    │  │ shop.js ✓    │  │ shop.js ✓    │  │ shop.js ✓    │
│              │  │ timer.js     │  │ tipps.js     │  │ plan.js      │
│              │  │              │  │              │  │ (NEW)        │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

---

## Current plan.html Structure

```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lernplan-Generator - StudyTok Companion</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div class="blossom-background"></div>
    
    <!-- Navigation (shared) -->
    <nav class="navbar">...</nav>
    
    <!-- Hero Section -->
    <section class="hero">
        <h1>📝 Lernplan-Generator</h1>
        <p>Erstelle einen personalisierten Lernplan...</p>
    </section>
    
    <!-- FORM SECTION -->
    <section class="dashboard">
        <form id="lernplan-form">
            <input>      <!-- Subject/Topic -->
            <input>      <!-- Daily Time -->
            <input>      <!-- Deadline -->
            <select>     <!-- Difficulty -->
            <select>     <!-- Learning Style -->
            <textarea>   <!-- Notes -->
            <button>     <!-- Submit -->
        </form>
    </section>
    
    <!-- RESULT SECTION (hidden by default) -->
    <section id="generated-plan" style="display: none;">
        <h2>🎉 Dein persönlicher Lernplan</h2>
        <div class="stats-grid">
            <div class="stat-card">Days until exam</div>
            <div class="stat-card">Total hours</div>
            <div class="stat-card">Pomodoro sessions</div>
        </div>
        <div id="plan-details">
            <div id="plan-content">
                <!-- Generated plan inserted here -->
            </div>
        </div>
    </section>
    
    <!-- Tips Section -->
    <section class="dashboard">Tips for your learning plan...</section>
    
    <!-- Footer -->
    <footer>...</footer>
    
    <!-- Modals (shared) -->
    <div id="points-history-modal">...</div>
    <div id="shop-modal">...</div>
    
    <!-- Scripts -->
    <script src="js/main.js"></script>
    <script src="js/shop.js"></script>
    
    <!-- INLINE SCRIPT (TO BE EXTRACTED) -->
    <script>
        // 128 lines of form handling code
        // Should be moved to js/plan.js
    </script>
</body>
</html>
```

---

## Integration Checklist for New Plan Generator

### Phase 1: Extract & Refactor

- [ ] Create `/js/plan.js` file
- [ ] Move inline script from plan.html (lines 380-508) to plan.js
- [ ] Remove inline script tag from plan.html
- [ ] Add `<script src="js/plan.js"></script>` before closing body tag
- [ ] Keep existing HTML structure in plan.html

### Phase 2: Core Functionality

- [ ] Implement plan generation algorithm:
  - [ ] Calculate days until deadline
  - [ ] Distribute content across days
  - [ ] Account for learning style
  - [ ] Adjust for difficulty level
  
- [ ] Create plan data structure:
  ```javascript
  {
      id: unique_id,
      subject: "Mathematik",
      deadline: "2025-02-01",
      dailyMinutes: 60,
      difficulty: "mittel",
      learningStyle: "gemischt",
      notes: "...",
      weekPlan: [
          {
              week: 1,
              days: [
                  {
                      day: "Montag",
                      topics: ["Topic 1", "Topic 2"],
                      activities: ["Notizen", "Übungen"],
                      minutes: 60
                  },
                  // ...
              ]
          }
      ],
      createdAt: timestamp,
      completed: false
  }
  ```

- [ ] Generate week-by-week breakdown
- [ ] Suggest study techniques based on learning style
- [ ] Calculate Pomodoro sessions needed

### Phase 3: State Management

- [ ] Implement `getPlanState()` function
- [ ] Implement `savePlanState(state)` function
- [ ] Store plans in localStorage key: `studytok_plans`
- [ ] Allow multiple saved plans
- [ ] Implement plan deletion
- [ ] Implement plan editing

### Phase 4: UI/UX

- [ ] Display generated plan with weekly breakdown
- [ ] Color-code difficulty levels:
  - [ ] Leicht: Green
  - [ ] Mittel: Yellow
  - [ ] Schwer: Orange
  - [ ] Expert: Red
  
- [ ] Show progress indicators
- [ ] Add calendar view option (optional)
- [ ] Create "My Plans" section to view saved plans

### Phase 5: Points & Rewards

- [ ] Award 30 points when plan created
- [ ] Implement 20-minute cooldown between point awards
- [ ] Show notification with points earned
- [ ] Track plan creation achievements

### Phase 6: Export Features (Optional)

- [ ] PDF export button
- [ ] Calendar integration button
- [ ] Print-friendly CSS
- [ ] Copy-to-clipboard functionality

### Phase 7: Testing

- [ ] Test form validation
- [ ] Test plan generation for various inputs
- [ ] Test localStorage persistence
- [ ] Test dark mode compatibility
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Test cross-browser compatibility

---

## Code Examples for Integration

### Example 1: Using Shared Utilities

```javascript
// In js/plan.js

// Get stats and add points
function awardPlanPoints() {
    const lastPlanTimestamp = localStorage.getItem('studytok_last_plan_points');
    const now = Date.now();
    const twentyMinutesInMs = 20 * 60 * 1000;
    
    if (!lastPlanTimestamp || (now - parseInt(lastPlanTimestamp)) >= twentyMinutesInMs) {
        addPoints(30);  // Function from main.js
        localStorage.setItem('studytok_last_plan_points', now.toString());
        showNotification('🎯 Lernplan erstellt! +30 Punkte', 'success');  // From main.js
        return true;
    } else {
        showNotification('🎯 Lernplan erstellt!');
        return false;
    }
}

// Use CSS variables
function colorByDifficulty(difficulty) {
    const colors = {
        leicht: 'var(--secondary)',      // Mint
        mittel: 'var(--accent)',         // Lavender
        schwer: 'var(--primary)',        // Pink
        expert: 'var(--primary-dark)'    // Dark Pink
    };
    return colors[difficulty] || 'var(--primary)';
}
```

### Example 2: localStorage Pattern

```javascript
// In js/plan.js

function getPlanState() {
    const defaultState = {
        savedPlans: [],
        lastCreatedId: null
    };
    
    const saved = localStorage.getItem('studytok_plans');
    return saved ? JSON.parse(saved) : defaultState;
}

function savePlanState(state) {
    localStorage.setItem('studytok_plans', JSON.stringify(state));
}

function createPlan(formData) {
    const planState = getPlanState();
    const newPlan = {
        id: Date.now(),
        subject: formData.subject,
        deadline: formData.deadline,
        dailyMinutes: formData.dailyMinutes,
        difficulty: formData.difficulty,
        learningStyle: formData.learningStyle,
        notes: formData.notes,
        weekPlan: generateWeekPlan(formData),
        createdAt: new Date().toISOString(),
        completed: false
    };
    
    planState.savedPlans.push(newPlan);
    planState.lastCreatedId = newPlan.id;
    savePlanState(planState);
    
    return newPlan;
}
```

### Example 3: Modal Pattern

```javascript
// In js/plan.js - to show plan export options

function showExportModal(plan) {
    const modal = document.getElementById('export-modal');
    if (!modal) {
        // Create modal if doesn't exist
        const modalHTML = `
            <div class="modal-overlay" id="export-modal" aria-hidden="true">
                <div class="modal" role="document">
                    <div class="modal-header">
                        <div>
                            <p class="modal-kicker">Plan teilen</p>
                            <h3>Dein Lernplan exportieren</h3>
                        </div>
                        <button class="modal-close" aria-label="Schließen">×</button>
                    </div>
                    <div class="modal-body">
                        <button class="btn btn-primary" id="export-pdf">📥 PDF exportieren</button>
                        <button class="btn btn-secondary" id="export-calendar">📋 Zu Kalender hinzufügen</button>
                        <button class="btn btn-outline" id="copy-plan">📋 Kopieren</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
    
    openModal(document.getElementById('export-modal'));  // Uses main.js function
}
```

### Example 4: CSS Class Usage

```javascript
// Following existing class patterns

// Create stat card
function renderPlanStats(plan) {
    const days = Math.ceil((new Date(plan.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    
    return `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">📅</div>
                <div class="stat-content">
                    <h3 class="stat-value">${days}</h3>
                    <p class="stat-label">Tage bis Prüfung</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">⏱️</div>
                <div class="stat-content">
                    <h3 class="stat-value">${calculateTotalHours(plan)}</h3>
                    <p class="stat-label">Stunden benötigt</p>
                </div>
            </div>
        </div>
    `;
}

// Create feature card
function renderSavedPlan(plan) {
    return `
        <div class="feature-card">
            <div class="feature-icon">📚</div>
            <h3 class="feature-title">${plan.subject}</h3>
            <p class="feature-description">
                Erstellt: ${new Date(plan.createdAt).toLocaleDateString('de-DE')}
            </p>
            <button class="btn btn-outline" onclick="viewPlan(${plan.id})">
                Ansehen
            </button>
        </div>
    `;
}
```

### Example 5: Responsive Design Pattern

```css
/* In css/plan.css or style.css */

.plan-week {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
}

.plan-day {
    background: var(--bg-card);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
}

/* Tablet breakpoint */
@media (max-width: 768px) {
    .plan-week {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Mobile breakpoint */
@media (max-width: 480px) {
    .plan-week {
        grid-template-columns: 1fr;
    }
    
    .plan-day {
        padding: var(--spacing-sm);
    }
}
```

---

## File Locations to Modify

### Must Modify
- `/plan.html` - Remove inline script, add reference to plan.js
- Create `/js/plan.js` - New plan generation module

### Can Optionally Modify
- `/css/style.css` - Add plan-specific CSS variables or new classes
- `/css/plan.css` - Create if plan needs lots of custom styling

### Should NOT Modify
- `/js/main.js` - Core utilities
- `/js/shop.js` - Shop system
- `/js/timer.js` - Timer system
- `/js/tipps.js` - Tips system
- `/index.html` - Homepage
- `/timer.html` - Timer page
- `/tipps.html` - Tips page

---

## Testing Checklist

```javascript
// Test form validation
test('Form should require all fields')
test('Should validate date is in future')
test('Should validate daily minutes in range')

// Test plan generation
test('Should generate correct number of weeks')
test('Should distribute content fairly')
test('Should respect learning style preference')

// Test state management
test('Should save plan to localStorage')
test('Should load saved plans from localStorage')
test('Should handle multiple saved plans')

// Test UI/UX
test('Should show notification on plan creation')
test('Should award points with cooldown')
test('Should scroll to generated plan')
test('Should work in dark mode')
test('Should be responsive on mobile')
test('Should work on all browsers (Chrome, Firefox, Safari, Edge)')
```

---

## Performance Considerations

1. **localStorage Limits:**
   - Typically 5-10 MB limit
   - Each plan ~5-20 KB
   - Can store ~500-2000 plans safely

2. **Optimization Tips:**
   - Compress plan data if needed
   - Lazy-load saved plans (pagination)
   - Cache generated plans

3. **Algorithm Efficiency:**
   - Plan generation should complete in <500ms
   - Use async if needed for heavy calculations
   - Consider Web Workers for large plans

---

## Accessibility Considerations

```javascript
// Add ARIA labels
<button 
    class="btn btn-primary" 
    id="generate-btn"
    aria-label="Lernplan basierend auf eingaben generieren"
>
    🚀 Lernplan generieren
</button>

// Use semantic HTML
<section class="plan-section">
    <h2>Dein Lernplan</h2>
    <!-- Content -->
</section>

// Ensure color contrast
// Use var(--text-primary) on var(--bg-card)
// WCAG AA compliant: 4.5:1 ratio maintained
```

---

## Implementation Priority

**MVP (Minimum Viable Product):**
1. Form with 6 inputs ✓ (already exists)
2. Basic algorithm to generate weekly plan
3. Display plan with weekly breakdown
4. Points system integration ✓ (already exists)
5. Save/load plans from localStorage

**Phase 2:**
1. Edit saved plans
2. Delete saved plans
3. View all saved plans
4. Calendar visualization

**Phase 3:**
1. PDF export
2. Print functionality
3. Calendar integration
4. Sharing plans

**Nice to Have:**
1. Collaborative planning
2. Progress tracking
3. Plan suggestions based on weak areas
4. Integration with timer
5. AI-powered tips per day

