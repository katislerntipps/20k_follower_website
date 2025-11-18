# StudyTok Companion - Codebase Architecture Report

## 1. PROJECT STRUCTURE & FRAMEWORK

### Framework Type: **Vanilla JavaScript**
- **No frontend framework** (No React, Vue, Angular, or Svelte)
- Pure HTML, CSS, and JavaScript
- Browser's native APIs and localStorage
- Total codebase: ~3,179 lines of JavaScript

### Rendering Approach
- **Traditional Multi-Page Application (MPA)**
- Each feature has its own HTML page
- Navigation via href links
- No client-side routing

### File Organization
```
/home/user/20k_follower_website/
├── index.html              # Homepage/Dashboard (Hero, Stats, Features)
├── timer.html              # Pomodoro Timer (1454 lines in timer.js)
├── tipps.html              # Learning Tips Library (529 lines in tipps.js)
├── musik.html              # Music/Focus Playlists (stub)
├── plan.html               # Learning Plan Generator (basic implementation)
├── test-notifications.html # Testing page
│
├── css/
│   ├── style.css           # Global styles (1200+ lines)
│   ├── timer.css           # Timer-specific styles
│   └── tipps.css           # Tips-specific styles
│
├── js/
│   ├── main.js             # Homepage logic (737 lines)
│   ├── shop.js             # Shop/Points system (459 lines)
│   ├── timer.js            # Timer module (1454 lines)
│   └── tipps.js            # Tips module (529 lines)
│
├── image/                  # Assets (SVGs, PNGs)
│   ├── 1.png to 6.png      # Tree level images
│   ├── cherry_blossom_tree.svg
│   ├── cherry_petal.svg
│   ├── background_branch.png
│   └── astraai.png
│
└── audio/                  # Audio files for notifications
```

---

## 2. CURRENT LEARNING PLAN GENERATOR LOCATION

### Location: `/home/user/20k_follower_website/plan.html`

### Current Implementation Status:
- **HTML form with 6 input fields** (lines 100-175 in plan.html):
  1. Subject/Topic (text input)
  2. Daily available time (number input, 15-480 minutes)
  3. Exam deadline (date input)
  4. Difficulty level (select: leicht, mittel, schwer, expert)
  5. Learning style (select: visuell, auditiv, lesen, praktisch, gemischt)
  6. Additional notes (textarea)

- **Form submission handler** (lines 380-508 in plan.html):
  - Inline `<script>` in HTML file
  - Currently shows placeholder content
  - Has point system integration (20-minute cooldown between awards)
  - Awards 30 points for plan generation
  - Shows notification after plan creation

### Current Features:
- ✅ Form inputs with emojis and labels
- ✅ Points system integration (30 points + cooldown)
- ✅ Smooth scroll to generated plan section
- ✅ Placeholder output generation
- ✅ Tips section below plan
- ✅ Modal system for points history and shop
- ❌ No actual AI-based plan generation logic
- ❌ No customized algorithm
- ❌ No calendar visualization
- ❌ No export functionality
- ❌ No persistent storage of generated plans

---

## 3. COMPONENT ORGANIZATION & PATTERNS

### Component Architecture
The project uses **component-based patterns** built with vanilla JavaScript:

#### A. Card Components
```
.stat-card      - Stats display (icon + value + label)
.feature-card   - Feature showcase (icon + title + description + button)
.shop-item      - Shop item (header + description + price + button)
```

#### B. Section Components
```
.hero          - Hero section with title/subtitle/buttons
.dashboard     - Stats grid section
.features      - Feature cards grid
.container     - Max-width wrapper (probably ~1200px)
```

#### C. Modal Components
```
.modal-overlay + .modal
├── .modal-header (kicker + title + close button)
├── .modal-body (content)
└── Modal types: points-history, shop, email-input
```

#### D. Button Components
```
.btn                    - Base button
.btn.btn-primary        - Pink (#FFB7C5) filled
.btn.btn-secondary      - Mint (#B8E6D5) filled
.btn.btn-outline        - Outlined style
```

#### E. Navigation
```
.navbar
├── .logo (TikTok link + home icon)
├── .nav-menu (Home, Timer, Tips, Plan, Music)
├── .theme-toggle (Dark/Light mode switch)
├── .user-points (Points display with coin SVG)
└── .shop-trigger-btn (Shopping button)
```

### Pattern Implementation Examples:

**Stats Card Pattern:**
```html
<div class="stat-card">
    <div class="stat-icon">🍅</div>
    <div class="stat-content">
        <h3 class="stat-value">0</h3>
        <p class="stat-label">Pomodoro Sessions</p>
    </div>
</div>
```

**Feature Card Pattern:**
```html
<div class="feature-card">
    <div class="feature-icon">📝</div>
    <h3 class="feature-title">Lernplan erstellen</h3>
    <p class="feature-description">Description here</p>
    <button class="btn btn-outline">Action</button>
</div>
```

**Modal Pattern:**
```html
<div class="modal-overlay" id="modal-id" aria-hidden="true">
    <div class="modal">
        <div class="modal-header">
            <div>
                <p class="modal-kicker">Subtitle</p>
                <h3>Title</h3>
            </div>
            <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
            <!-- Content -->
        </div>
    </div>
</div>
```

---

## 4. STYLING SYSTEM

### System Type: **CSS Variables (Custom Properties)**

### CSS Variables Defined in `:root`
Located in `/home/user/20k_follower_website/css/style.css` (lines 11-50):

**Color Palette (Light Mode):**
```css
--primary:        #FFB7C5      /* Soft Pink - Cherry Blossoms */
--primary-dark:   #FF9BAD      /* Darker Pink */
--secondary:      #B8E6D5      /* Mint Green */
--accent:         #D4B5F1      /* Lavender */
--accent-dark:    #C09FE8      /* Darker Lavender */
```

**Color Palette (Dark Mode):** `[data-theme="dark"]`
```css
--primary:        #ff2ee6      /* Neon Pink */
--secondary:      #68d2bb      /* Brighter Mint */
--accent:         #c7a9ff      /* Brighter Lavender */
```

**Background Colors (Light Mode):**
```css
--bg-primary:     #FAFBFC      /* Light gray background */
--bg-secondary:   #FFFFFF      /* Pure white */
--bg-card:        #FFFFFF      /* Card background */
--bg-gradient:    (135deg linear-gradient)
```

**Text Colors:**
```css
--text-primary:       #2D3748      /* Main text - dark gray */
--text-secondary:     #718096      /* Secondary text */
--text-light:         #A0AEC0      /* Light text */
```

**Effects:**
```css
--shadow-sm:      0 2px 8px rgba(0, 0, 0, 0.08)
--shadow-md:      0 4px 16px rgba(0, 0, 0, 0.1)
--shadow-lg:      0 8px 32px rgba(0, 0, 0, 0.12)
--shadow-colored: 0 8px 24px rgba(255, 183, 197, 0.3)
```

**Border Radius:**
```css
--radius-sm:      8px
--radius-md:      16px
--radius-lg:      24px
--radius-full:    9999px
```

**Spacing Scale:**
```css
--spacing-xs:     0.5rem
--spacing-sm:     1rem
--spacing-md:     1.5rem
--spacing-lg:     2rem
--spacing-xl:     3rem
```

**Typography:**
```css
--font-primary:   'Poppins', sans-serif      /* Main font */
--font-secondary: 'Quicksand', sans-serif    /* Secondary font */
```

### CSS Naming Conventions
- **BEM-lite approach**: `element__sub-element` or simple descriptive names
- **Responsive classes**: `@media (max-width: 768px)` breakpoints at 480px, 768px, 1024px
- **State classes**: `.active`, `.open`, `.is-dark`, `[aria-hidden]`
- **Utility classes**: `.container`, `.btn`, `.section-title`

### Animation System
**Keyframe Animations (defined in style.css):**
```css
@keyframes fall           /* Falling petals */
@keyframes float          /* Floating effect */
@keyframes pulse          /* Pulse effect */
@keyframes bloom          /* Bloom effect */
@keyframes slideIn        /* Notification slide-in */
@keyframes slideOut       /* Notification slide-out */
```

---

## 5. STATE MANAGEMENT & UTILITIES

### Data Storage: **localStorage**

### Shared Utility Functions (in `main.js`)

**Stats Management:**
```javascript
getStats()              // Get user stats from localStorage
saveStats(stats)        // Save stats to localStorage
initializeStats()       // Initialize on page load
updateStatsDisplay()    // Update HTML elements with stats
updatePoints()          // Update points display across pages
addPoints(points)       // Award points to user
```

**Tree System:**
```javascript
getTreeState()          // Get cherry tree level/progress
updateTreeDisplay()     // Update tree UI elements
updateHomeLevelImage()  // Change tree image based on level
getLevelEmoji(level)    // Get emoji for tree level
```

**Points System:**
```javascript
getPointsRules()        // Get array of point-earning activities
renderPointsRules()     // Render points rules in modal
initializePointsHistory() // Setup points modal interactions
```

**Notifications:**
```javascript
showNotification(message, type)       // Show toast notification
showAchievementUnlockNotification()   // Show achievement popup
showDailyStreakNotification(streak)   // Show streak milestone
```

**Dark Mode:**
```javascript
initializeDarkMode()    // Load theme from localStorage
toggleTheme()           // Switch between light/dark
updateThemeIcon(theme)  // Update toggle button appearance
```

**Modal Management (HTML-based):**
```javascript
setupModalClose(modal)  // Attach close handlers
openModal(modal)        // Open modal with overlay
closeModal(modal)       // Close modal and restore scroll
```

### Data Structure Examples

**Stats Object (localStorage key: `studytok_stats`):**
```javascript
{
    sessions: 0,                    // Completed pomodoro sessions
    focusTime: 0,                   // Total focus time in minutes
    streak: 1,                      // Consecutive days active
    achievements: 0,                // Number of achievements unlocked
    points: 0,                      // Total points earned
    lastActive: "Mon Jan 01 2025",  // Last active date
    unlockedAchievements: [],       // Array of achievement IDs
    sessionsToday: 0,               // Sessions completed today
    lastSessionDate: "Mon Jan 01 2025",
    consecutiveSessions: 0,         // Sessions in current cycle
    dailyLoginClaimed: false        // Login bonus claimed today
}
```

**Tree State (localStorage key: `studytok_tree`):**
```javascript
{
    level: 1,                       // Current tree level (1-6+)
    blossoms: 0,                    // Blossoms on current level (0-5)
    totalSessions: 0                // Total sessions ever
}
```

**Shop State (localStorage key: `studytok_shop`):**
```javascript
{
    purchases: {
        rabattcode: false,          // Astra AI discount code
        achievement: false,         // Filthy Rich achievement
        music: false,               // Background music
        blossoms: false             // Cherry blossom rain
    }
}
```

**Theme (localStorage key: `studytok_theme`):**
```javascript
"light" | "dark"
```

### Cross-Page Utilities
All pages share:
- `main.js` - Stats, points, tree, notifications, dark mode
- `shop.js` - Shop functionality, purchases
- CSS variables system
- Modal components
- Navigation bar

---

## 6. ROUTING & NAVIGATION

### Routing Type: **Traditional Link-Based Navigation**

### Navigation Structure
**Implemented in navbar (all pages):**
```
Home     → index.html
Timer    → timer.html
Tips     → tipps.html
Plan     → plan.html
Music    → musik.html
```

**No Client-Side Routing:**
- No URL parameters for state
- No hash-based routing
- Each page is a full reload
- Full-page transitions

**Page Load Pattern:**
1. HTML page loads
2. CSS variables apply theme
3. `DOMContentLoaded` event fires
4. JavaScript initializes:
   - Load stats from localStorage
   - Update display elements
   - Attach event listeners
   - Initialize page-specific functionality

---

## 7. CURRENT MODULE ORGANIZATION

### Module 1: **main.js** (737 lines)
**Runs on:** index.html, all pages via link

**Sections:**
```
1. STATS MANAGEMENT (lines 22-127)
   - getStats, saveStats, updateStatsDisplay, updatePoints

2. TREE STATE MANAGEMENT (lines 129-194)
   - getTreeState, updateTreeDisplay, updateHomeLevelImage

3. POINTS SYSTEM (lines 196-259)
   - getPointsRules, renderPointsRules

4. POINTS HISTORY MODAL (lines 261-300)
   - initializePointsHistory with open/close logic

5. TREE ANIMATIONS (lines 302-400+)
   - generateBlossomPetals, renderCherryTree, animations

6. DAILY LOGIN & STREAK (lines ~500-620)
   - checkDailyLogin, showDailyStreakNotification

7. DARK MODE (lines ~700+)
   - initializeDarkMode, toggleTheme, updateThemeIcon

8. NOTIFICATIONS (inline styles)
   - showNotification with animations
   - showAchievementUnlockNotification
```

### Module 2: **shop.js** (459 lines)
**Runs on:** All pages (included in index.html and plan.html)

**Functionality:**
- Shop state management
- Purchase logic with point deduction
- Modal interactions
- Email collection for rabattcode redemption
- Item purchase handlers

### Module 3: **timer.js** (1454 lines)
**Runs on:** timer.html only

**Sections:**
- Timer state and countdown logic
- Tree growth system
- Modal handlers
- SVG animations
- Audio notifications
- Achievement system

### Module 4: **tipps.js** (529 lines)
**Runs on:** tipps.html only

**Sections:**
- Tips data (100 learning tips)
- Tip generator
- Filter system
- Grid/list view toggle
- Favorites system
- Search functionality

### Module 5: **plan.html** (Inline Script)
**Status:** Basic placeholder implementation (lines 380-508)

---

## 8. INTEGRATION ARCHITECTURE

### How Pages Share State

1. **Via localStorage:**
   - All pages read/write the same localStorage keys
   - Changes on one page visible on all pages after reload
   - Keys: `studytok_stats`, `studytok_tree`, `studytok_shop`, `studytok_theme`

2. **Via Shared Main.js:**
   - Both index.html and plan.html load `main.js`
   - Functions like `updatePoints()`, `showNotification()` globally available
   - Points display updates across all pages

3. **Via CSS Variables:**
   - Theme changes apply site-wide
   - Colors, fonts, spacing consistent everywhere

### Module Loading Strategy
**Current Pattern:**
```html
<!-- Essential for all pages -->
<script src="js/main.js"></script>
<script src="js/shop.js"></script>

<!-- Page-specific -->
<script src="js/timer.js"></script>  <!-- Only on timer.html -->
<script src="js/tipps.js"></script>  <!-- Only on tipps.html -->
```

---

## RECOMMENDATIONS FOR NEW LEARNING PLAN GENERATOR

### Integration Points:

1. **Create New File: `js/plan.js`**
   - Extract inline script from plan.html
   - 500-1000 lines for full implementation
   - Import shared utilities from main.js

2. **Follow Existing Patterns:**
   ```javascript
   // At top
   function getPlanState() {
       const saved = localStorage.getItem('studytok_plans');
       return saved ? JSON.parse(saved) : { savedPlans: [] };
   }
   
   // Use existing utilities
   showNotification('Plan erstellt! +30 Punkte', 'success');
   addPoints(30);
   
   // Use CSS variables
   element.style.backgroundColor = 'var(--primary)';
   ```

3. **HTML Structure:**
   - Follow `.stat-card`, `.feature-card` patterns
   - Use `.modal-overlay` + `.modal` for modals
   - Keep buttons as `.btn` + class combinations

4. **Styling:**
   - Create `/css/plan.css` or add to style.css
   - Use CSS variables from :root
   - Follow responsive breakpoints (480px, 768px, 1024px)

5. **State Management:**
   - Store generated plans in localStorage
   - Key: `studytok_plans`
   - Structure: `{ savedPlans: [{ id, subject, date, weekPlan, createdAt }] }`

6. **Reusable Components Exist:**
   - Modal system ready to use
   - Points/notification system ready
   - Dark mode support automatic
   - Theme colors available as CSS variables

---

## KEY FILES REFERENCE

| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `/js/main.js` | Shared utilities, stats, points | 737 | Complete |
| `/js/shop.js` | Shop system | 459 | Complete |
| `/js/timer.js` | Pomodoro timer | 1454 | Complete |
| `/js/tipps.js` | Learning tips | 529 | Complete |
| `/plan.html` | Learning plan page | ~380 | Stub with placeholder |
| `/css/style.css` | Global styles + CSS variables | 1200+ | Complete |
| `/css/timer.css` | Timer-specific styles | - | Complete |
| `/css/tipps.css` | Tips-specific styles | - | Complete |

---

## SUMMARY

**Project Type:** Vanilla JavaScript, Multi-Page Application  
**Component System:** CSS-based patterns with BEM-lite naming  
**State Management:** localStorage with shared utility functions  
**Styling:** CSS variables + responsive design  
**Current Learning Plan:** Basic form placeholder in plan.html  
**Recommended Approach:** Extract to `js/plan.js`, follow existing patterns, use shared utilities

