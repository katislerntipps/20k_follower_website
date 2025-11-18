# Quick Reference - Integration Essentials

## 1. FILE LOCATIONS

| Component | Location | Status |
|-----------|----------|--------|
| Learning Plan Page | `/plan.html` | Exists (placeholder) |
| Learning Plan Logic | **`/js/plan.js`** | **CREATE THIS** |
| Shared Utilities | `/js/main.js` | Already available |
| Shop System | `/js/shop.js` | Already available |
| Global Styles | `/css/style.css` | Already available |

## 2. ESSENTIAL FUNCTIONS YOU CAN USE (FROM main.js)

```javascript
// Stats Management
getStats()                              // Get user stats object
saveStats(stats)                        // Save stats to localStorage
updatePoints()                          // Update points display everywhere

// Notifications
showNotification(message, type)         // Show toast (type: 'success'/'error')
showAchievementUnlockNotification(obj)  // Show achievement popup

// Points
addPoints(amount)                       // Award points to user

// Modal System
openModal(element)                      // Open any modal
closeModal(element)                     // Close any modal

// Dark Mode (automatic)
initializeDarkMode()                    // Initialize theme toggle
// Your code automatically inherits dark mode support
```

## 3. SHARED DATA KEYS (localStorage)

```javascript
'studytok_stats'          // User stats
'studytok_tree'           // Cherry tree level
'studytok_shop'           // Shop purchases
'studytok_theme'          // Dark/light mode
'studytok_plans'          // NEW: Your plan data
'studytok_last_plan_points' // NEW: Plan creation timestamp
```

## 4. CSS VARIABLES YOU SHOULD USE

```css
/* Colors */
var(--primary)          /* #FFB7C5 - Pink (main) */
var(--secondary)        /* #B8E6D5 - Mint (secondary) */
var(--accent)           /* #D4B5F1 - Lavender (accent) */
var(--accent-dark)      /* #C09FE8 - Dark Lavender */

/* Backgrounds */
var(--bg-primary)       /* Light gray */
var(--bg-secondary)     /* White */
var(--bg-card)          /* Card background */

/* Text */
var(--text-primary)     /* Main text - dark gray */
var(--text-secondary)   /* Secondary text */

/* Effects */
var(--shadow-sm)        /* Small shadow */
var(--shadow-md)        /* Medium shadow */
var(--shadow-lg)        /* Large shadow */

/* Spacing */
var(--spacing-xs)       /* 0.5rem */
var(--spacing-sm)       /* 1rem */
var(--spacing-md)       /* 1.5rem */
var(--spacing-lg)       /* 2rem */

/* Border Radius */
var(--radius-sm)        /* 8px */
var(--radius-md)        /* 16px */
var(--radius-lg)        /* 24px */
var(--radius-full)      /* 9999px */

/* Fonts */
var(--font-primary)     /* 'Poppins' */
var(--font-secondary)   /* 'Quicksand' */
```

## 5. HTML COMPONENTS TO REUSE

### Stat Card
```html
<div class="stat-card">
    <div class="stat-icon">EMOJI</div>
    <div class="stat-content">
        <h3 class="stat-value">VALUE</h3>
        <p class="stat-label">LABEL</p>
    </div>
</div>
```

### Feature Card
```html
<div class="feature-card">
    <div class="feature-icon">EMOJI</div>
    <h3 class="feature-title">Title</h3>
    <p class="feature-description">Description</p>
    <button class="btn btn-outline">Action</button>
</div>
```

### Button Styles
```html
<button class="btn btn-primary">Primary Button</button>
<button class="btn btn-secondary">Secondary Button</button>
<button class="btn btn-outline">Outline Button</button>
```

### Modal
```html
<div class="modal-overlay" id="my-modal" aria-hidden="true">
    <div class="modal">
        <div class="modal-header">
            <div>
                <p class="modal-kicker">Subtitle</p>
                <h3>Title</h3>
            </div>
            <button class="modal-close" aria-label="Schließen">×</button>
        </div>
        <div class="modal-body">
            <!-- Content here -->
        </div>
    </div>
</div>
```

## 6. IMPLEMENTATION STEPS

### Step 1: Create `/js/plan.js`
```bash
# Create the file
touch /js/plan.js
```

### Step 2: Basic Structure
```javascript
// /js/plan.js

document.addEventListener('DOMContentLoaded', function() {
    initializePlanForm();
    loadSavedPlans();
    initializeDarkMode();  // Inherited from main.js
});

function initializePlanForm() {
    const form = document.getElementById('lernplan-form');
    if (!form) return;
    
    form.addEventListener('submit', handleFormSubmit);
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const subject = document.querySelector('input[placeholder*="Mathematik"]').value;
    // ... get other fields
    
    // Generate plan
    const plan = generatePlan({subject, /* ... */});
    
    // Save to localStorage
    savePlan(plan);
    
    // Award points
    addPoints(30);  // Available from main.js
    
    // Show notification
    showNotification('🎯 Lernplan erstellt! +30 Punkte', 'success');
    
    // Display plan
    displayPlan(plan);
}

function generatePlan(formData) {
    // Your algorithm here
    return planObject;
}

function savePlan(plan) {
    const state = getPlanState();
    state.savedPlans.push(plan);
    localStorage.setItem('studytok_plans', JSON.stringify(state));
}

function getPlanState() {
    const saved = localStorage.getItem('studytok_plans');
    return saved ? JSON.parse(saved) : { savedPlans: [] };
}

function displayPlan(plan) {
    const section = document.getElementById('generated-plan');
    section.style.display = 'block';
    
    // Render your plan here
    document.getElementById('plan-content').innerHTML = `
        <div>Your plan HTML here</div>
    `;
    
    // Smooth scroll
    section.scrollIntoView({ behavior: 'smooth' });
}
```

### Step 3: Update `/plan.html`
```html
<!-- Remove this: -->
<script>
    // All the inline code here (lines 380-508)
</script>

<!-- Add this instead: -->
<script src="js/plan.js"></script>
```

## 7. COMMON PATTERNS

### Pattern: Award Points with Cooldown
```javascript
function awardPlanPoints() {
    const lastTimestamp = localStorage.getItem('studytok_last_plan_points');
    const now = Date.now();
    const cooldown = 20 * 60 * 1000; // 20 minutes
    
    if (!lastTimestamp || (now - parseInt(lastTimestamp)) >= cooldown) {
        addPoints(30);
        localStorage.setItem('studytok_last_plan_points', now.toString());
        return true;
    }
    return false;
}
```

### Pattern: Use CSS Variables
```javascript
// In your JavaScript
element.style.color = 'var(--text-primary)';
element.style.backgroundColor = 'var(--bg-card)';
element.style.boxShadow = 'var(--shadow-md)';
element.style.borderRadius = 'var(--radius-md)';

// In your CSS
.plan-week {
    display: grid;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
    background: var(--bg-card);
    box-shadow: var(--shadow-sm);
    border-radius: var(--radius-md);
}
```

### Pattern: Responsive Classes
```css
/* Desktop (default) */
.plan-grid {
    grid-template-columns: repeat(3, 1fr);
}

/* Tablet */
@media (max-width: 768px) {
    .plan-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* Mobile */
@media (max-width: 480px) {
    .plan-grid {
        grid-template-columns: 1fr;
    }
}
```

### Pattern: Modal Interactions
```javascript
// Open modal
const modal = document.getElementById('my-modal');
openModal(modal);  // From main.js

// Close modal
closeModal(modal);  // From main.js

// Or attach to buttons
document.querySelector('.modal-close').addEventListener('click', () => {
    closeModal(modal);
});
```

### Pattern: Notifications
```javascript
// Success notification
showNotification('✅ Plan erstellt!', 'success');

// Error notification
showNotification('❌ Fehler beim Erstellen', 'error');

// With emoji
showNotification('🎯 Lernplan erstellt! +30 Punkte', 'success');
```

## 8. RESPONSIVE BREAKPOINTS

```css
/* Desktop */
/* No special rules - grid works automatically */

/* Tablet - 768px and below */
@media (max-width: 768px) {
    /* Reduce columns, adjust spacing */
}

/* Mobile - 480px and below */
@media (max-width: 480px) {
    /* Single column, smaller padding */
}
```

## 9. DARK MODE (AUTOMATIC)

Your styles automatically work in dark mode because:
1. Colors use CSS variables (e.g., `var(--bg-card)`)
2. Dark mode applies `[data-theme="dark"]` to HTML
3. CSS variables change in dark mode automatically

```javascript
// Your code doesn't need to do anything!
// initializeDarkMode() is called from main.js
```

## 10. ARIA/ACCESSIBILITY

Add labels to interactive elements:
```html
<button 
    class="btn btn-primary"
    aria-label="Lernplan basierend auf eingaben generieren"
>
    🚀 Lernplan generieren
</button>

<input 
    type="text"
    aria-label="Fach oder Thema eingeben"
    placeholder="z.B. Mathematik"
>
```

## 11. TESTING CHECKLIST

```javascript
// Test 1: Form submission
document.getElementById('lernplan-form').dispatchEvent(new Event('submit'));

// Test 2: Data saving
const state = JSON.parse(localStorage.getItem('studytok_plans'));
console.log('Saved plans:', state.savedPlans.length);

// Test 3: Points awarded
console.log('User points:', getStats().points);

// Test 4: Dark mode
document.documentElement.setAttribute('data-theme', 'dark');

// Test 5: Mobile responsive
// Use DevTools device emulator
```

## 12. WHAT'S ALREADY DONE

- Navigation bar with all pages
- Theme toggle (dark/light)
- Points system
- Notifications
- Shop modal
- Points history modal
- Email modal
- Global styling
- CSS variables
- Responsive grid system

## 13. WHAT YOU NEED TO IMPLEMENT

1. Plan generation algorithm
2. Form validation
3. Plan storage/retrieval
4. Plan display HTML
5. Plan editing (optional)
6. Plan deletion (optional)
7. Saved plans list (optional)
8. Export functionality (optional)

## 14. FILES YOU CAN LOOK AT FOR REFERENCE

- **timer.js** (1454 lines) - Large module example
  - State management pattern
  - Event handling
  - localStorage usage
  - SVG animations

- **tipps.js** (529 lines) - Medium module example
  - Data structure (100 tips array)
  - Filter/search implementation
  - Grid rendering
  - localStorage favorites

- **main.js** (737 lines) - Shared utilities
  - All the functions you can reuse
  - Modal system
  - Points system
  - Tree system

## 15. ESTIMATED IMPLEMENTATION TIME

- **Basic MVP**: 2-3 hours
  - Form handling
  - Simple algorithm
  - localStorage saving
  - Display plan

- **Full Feature**: 5-8 hours
  - Enhanced algorithm
  - Multiple saved plans
  - Plan editing
  - Better UI

- **Polish & Export**: 3-5 hours
  - PDF export
  - Calendar integration
  - Print functionality
  - Full testing

