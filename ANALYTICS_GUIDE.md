# 📊 Analytics System - Komplett-Anleitung

## 🎯 Was ist implementiert?

✅ **Privacy-First Analytics** - DSGVO-konform, keine Cookies
✅ **Lokale Speicherung** - Alle Daten in localStorage
✅ **Event-Tracking** - Timer, Tipps, Shop, Achievements
✅ **Admin-Dashboard** - Visualisierung aller Metriken
✅ **Optional Server-Sync** - Für zentrale Datenspeicherung
✅ **Auto-Bereinigung** - Nur neueste 500 Events werden behalten

---

## 🚀 Schnellstart

### **1. Analytics aktivieren**

Die Analytics sind bereits aktiv! Öffne einfach eine Seite und Events werden automatisch getrackt.

### **2. Dashboard öffnen**

```
http://localhost:8000/analytics-dashboard.html
```

Hier siehst du:
- 📊 Gesamtstatistiken
- 📈 Top Events
- 🎯 Conversion Funnel
- 📄 Events pro Seite
- 🌐 Browser-Verteilung
- 📋 Event-Liste (Echtzeit)

### **3. Test-Events generieren**

```javascript
// Öffne Browser Console auf irgendeiner Seite:

// Timer Event
analytics.trackTimerStart('focus', 25);

// Tipp generiert
analytics.trackTipGenerated('methode', 'anfaenger');

// Shop-Kauf
analytics.trackShopPurchase('music', 250, 500);

// Custom Event
analytics.track('custom_event', { test: true });
```

---

## 🔌 Integration in bestehenden Code

### **In jeder HTML-Seite:**

```html
<!-- Am Ende, vor </body> -->
<script type="module">
    import analytics from './js/modules/analytics.js';

    // Analytics ist jetzt global verfügbar als window.analytics
</script>
```

### **Beispiel: Timer-Seite (timer.js)**

```javascript
// Am Anfang von timer.js importieren:
import analytics from './modules/analytics.js';

// Timer-Start tracken:
function startTimer(mode, duration) {
    analytics.trackTimerStart(mode, duration);
    // ... rest of timer logic
}

// Timer-Ende tracken:
function timerComplete(mode, duration, wasInterrupted) {
    analytics.trackTimerComplete(mode, duration, wasInterrupted);

    // Conversion tracken wenn komplett
    if (!wasInterrupted) {
        analytics.trackConversion('timer_completion');
    }
}

// Timer-Pause tracken:
function pauseTimer(mode, timeElapsed) {
    analytics.trackTimerPause(mode, timeElapsed);
}
```

### **Beispiel: Tipps-Seite (tipps.js)**

```javascript
import analytics from './modules/analytics.js';

// Tipp generiert
function generateTip() {
    const tip = getRandomTip();
    showTip(tip);

    // Track Event
    analytics.trackTipGenerated(tip.category, tip.difficulty);
}

// Favorit hinzugefügt
function addToFavorites(tipTitle) {
    // ... save to favorites

    analytics.trackTipFavorited(tipTitle);
    analytics.trackConversion('tip_favorited');
}
```

### **Beispiel: Shop (shop.js)**

```javascript
import analytics from './modules/analytics.js';

// Shop öffnen
function openShop() {
    analytics.trackShopView();
    // ... show shop modal
}

// Item ansehen
function viewShopItem(itemName, price) {
    analytics.trackShopItemView(itemName, price);
}

// Item kaufen
async function purchaseItem(itemName, price) {
    // ... purchase logic

    const stats = getStats();
    analytics.trackShopPurchase(itemName, price, stats.points);
    analytics.trackConversion('shop_purchase', price);
}
```

### **Beispiel: Error-Tracking**

```javascript
// In utils.js - Global Error Handler:
window.addEventListener('error', (event) => {
    analytics.trackError(
        event.message,
        event.error?.stack,
        { filename: event.filename, lineno: event.lineno }
    );
});

// Bei Promise Rejections:
window.addEventListener('unhandledrejection', (event) => {
    analytics.trackError(
        'Unhandled Promise Rejection',
        event.reason?.stack || event.reason,
        { type: 'promise_rejection' }
    );
});
```

---

## 📈 Verfügbare Tracking-Methoden

### **1. Timer Events**

```javascript
// Timer gestartet
analytics.trackTimerStart('focus', 25);
analytics.trackTimerStart('shortbreak', 5);
analytics.trackTimerStart('longbreak', 15);

// Timer beendet
analytics.trackTimerComplete('focus', 25, false); // Nicht unterbrochen
analytics.trackTimerComplete('focus', 25, true);  // Unterbrochen

// Timer pausiert
analytics.trackTimerPause('focus', 15); // 15 Minuten vergangen
```

### **2. Learning Tips**

```javascript
// Tipp generiert
analytics.trackTipGenerated('methode', 'anfaenger');
analytics.trackTipGenerated('gedaechtnis', 'fortgeschritten');

// Tipp favorisiert
analytics.trackTipFavorited('Pomodoro-Technik');
```

### **3. Shop Events**

```javascript
// Shop geöffnet
analytics.trackShopView();

// Item angesehen
analytics.trackShopItemView('Hintergrundmusik', 250);

// Kauf
analytics.trackShopPurchase('music', 250, 500); // item, price, pointsRemaining
```

### **4. Achievements**

```javascript
// Achievement freigeschaltet
analytics.trackAchievementUnlocked('first-session', 'Erste Session');
analytics.trackAchievementUnlocked('streak-7', '7-Tage-Streak');
```

### **5. Page Views** (automatisch)

```javascript
// Wird automatisch getrackt bei jedem Seitenladen
// Manuell möglich mit:
analytics.trackPageView();
```

### **6. Custom Events**

```javascript
// Beliebige Events
analytics.track('newsletter_signup', {
    source: 'footer',
    plan: 'free'
});

analytics.track('feature_used', {
    feature: 'dark_mode_toggle',
    enabled: true
});
```

### **7. Conversions**

```javascript
// Wichtige Conversion-Events
analytics.trackConversion('signup', 1);
analytics.trackConversion('purchase', 250); // mit Wert
analytics.trackConversion('goal_reached');
```

### **8. Performance**

```javascript
// Performance messen
const startTime = performance.now();
// ... operation
const duration = performance.now() - startTime;
analytics.trackPerformance('page_load', duration);
analytics.trackPerformance('api_call', duration);
```

### **9. Errors**

```javascript
try {
    riskyOperation();
} catch (error) {
    analytics.trackError(
        error.message,
        error.stack,
        { context: 'riskyOperation', userId: null }
    );
}
```

---

## 🔧 Konfiguration

### **Analytics aktivieren/deaktivieren:**

```javascript
// Deaktivieren
analytics.disable();

// Wieder aktivieren
analytics.enable();

// Status prüfen
console.log(analytics.enabled);
```

### **Debug-Modus:**

```javascript
// In analytics.js ändern:
const analytics = new Analytics({
    enabled: true,
    debug: true,  // ← Zeigt alle Events in Console
    serverUrl: null
});
```

### **Server-Sync aktivieren:**

```javascript
const analytics = new Analytics({
    enabled: true,
    debug: false,
    serverUrl: '/api/analytics'  // ← Deine API-URL
});
```

---

## 🖥️ Server-API (Optional)

Wenn du Server-Sync aktivierst, werden Events automatisch alle 5 Minuten gesendet.

### **API-Endpoint erstellen:**

```javascript
// api/analytics.js (Vercel/Netlify Function)
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { events, meta } = req.body;

    // Validierung
    if (!events || !Array.isArray(events)) {
        return res.status(400).json({ error: 'Invalid payload' });
    }

    // Speichere in Datenbank
    try {
        await saveToDatabase(events);
        res.status(200).json({ success: true, count: events.length });
    } catch (error) {
        console.error('Analytics save error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function saveToDatabase(events) {
    // Speichere in MongoDB, PostgreSQL, Supabase, etc.
    // Beispiel mit Supabase:
    const { data, error } = await supabase
        .from('analytics_events')
        .insert(events);

    if (error) throw error;
}
```

---

## 📊 Reports & Insights

### **Programmtisch Report holen:**

```javascript
const report = analytics.getReport();

console.log(report);
// {
//   summary: { totalEvents, uniqueSessions, timeRange },
//   byEventType: { page_view: 45, timer_start: 23, ... },
//   byPage: { '/timer.html': 30, '/tipps.html': 15 },
//   last24Hours: [...],
//   topEvents: [...],
//   browserStats: { Chrome: 80, Firefox: 15, ... },
//   conversionFunnel: { ... },
//   performance: { ... }
// }
```

### **Conversion Rate berechnen:**

```javascript
const report = analytics.getReport();
const funnel = report.conversionFunnel;

console.log('Timer Conversion:', funnel.conversionRate.timer_completion + '%');
console.log('Shop Conversion:', funnel.conversionRate.shop_conversion + '%');
```

### **Beliebte Features finden:**

```javascript
const report = analytics.getReport();
const topFeatures = report.topEvents.slice(0, 5);

topFeatures.forEach(event => {
    console.log(`${event.name}: ${event.count} mal genutzt`);
});
```

---

## 🎯 Best Practices

### **1. Sinnvolle Event-Namen:**

```javascript
// ✅ Gut
analytics.track('timer_start', { mode: 'focus' });
analytics.track('shop_purchase', { item: 'music' });

// ❌ Schlecht
analytics.track('click');
analytics.track('event1');
```

### **2. Konsistente Properties:**

```javascript
// ✅ Gut - Konsistente Keys
analytics.track('timer_start', { mode: 'focus', duration: 25 });
analytics.track('timer_start', { mode: 'break', duration: 5 });

// ❌ Schlecht - Inkonsistent
analytics.track('timer_start', { type: 'focus' });
analytics.track('timer_start', { mode: 'break' });
```

### **3. Keine sensiblen Daten:**

```javascript
// ❌ NIEMALS!
analytics.track('user_login', {
    email: 'user@example.com',  // ← PII!
    password: '...'             // ← NIEMALS!
});

// ✅ Gut
analytics.track('user_login', {
    method: 'email',
    success: true
});
```

### **4. Conversion-Tracking:**

```javascript
// Tracke wichtige Business-Metriken
analytics.trackConversion('timer_completed', 1);
analytics.trackConversion('shop_purchase', priceInPoints);
analytics.trackConversion('user_signup', 1);
```

---

## 🧪 Testing

### **1. Lokales Testing:**

```bash
# Server starten
python3 -m http.server 8000

# Browser öffnen
open http://localhost:8000

# Dashboard öffnen
open http://localhost:8000/analytics-dashboard.html
```

### **2. Test-Events generieren:**

```javascript
// In Browser Console:
for (let i = 0; i < 10; i++) {
    analytics.track('test_event_' + i, { testId: i });
}

// Report ansehen
analytics.getReport();
```

### **3. Dashboard prüfen:**

1. Öffne `analytics-dashboard.html`
2. Sollte Test-Events zeigen
3. Refresh klicken zum Aktualisieren

---

## 📤 Daten exportieren

### **JSON-Export:**

```javascript
const report = analytics.getReport();
const json = JSON.stringify(report, null, 2);

// Datei herunterladen
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `analytics-${Date.now()}.json`;
a.click();
```

### **CSV-Export:**

```javascript
function exportToCSV() {
    const events = analytics.getAllEvents();

    const csv = [
        ['Timestamp', 'Event', 'Page', 'Properties'].join(','),
        ...events.map(e => [
            new Date(e.timestamp).toISOString(),
            e.name,
            e.page,
            JSON.stringify(e.properties)
        ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${Date.now()}.csv`;
    a.click();
}
```

---

## 🔒 Privacy & GDPR

### **Was wird NICHT getrackt:**

- ❌ IP-Adressen
- ❌ Cookies
- ❌ Personenbezogene Daten
- ❌ Cross-Site Tracking
- ❌ Fingerprinting

### **Was wird getrackt:**

- ✅ Event-Namen (z.B. "timer_start")
- ✅ Event-Properties (z.B. mode: "focus")
- ✅ Session-ID (ändert sich bei jedem Browser-Neustart)
- ✅ Browser-Typ (nur "Chrome", "Firefox", etc.)
- ✅ Viewport-Größe

### **GDPR-Konform:**

- Keine Zustimmung nötig (keine PII)
- Daten werden lokal gespeichert
- User kann Daten jederzeit löschen
- Transparent & Open Source

---

## 💡 Nächste Schritte

1. ✅ Analytics ist bereits aktiv
2. ✅ Dashboard ist verfügbar
3. ⏳ Integration in bestehende Seiten
4. ⏳ Server-API erstellen (optional)
5. ⏳ Icons für PWA erstellen

---

## 🐛 Troubleshooting

### **Events werden nicht getrackt:**

```javascript
// Prüfe ob Analytics aktiv ist:
console.log(analytics.enabled); // sollte true sein

// Prüfe Events in localStorage:
const events = JSON.parse(localStorage.getItem('studytok_analytics'));
console.log(events);
```

### **Dashboard zeigt nichts:**

1. Prüfe ob Events in localStorage sind
2. Öffne Browser Console auf Fehler
3. Prüfe ob `analytics.js` korrekt importiert

### **Quota exceeded Error:**

```javascript
// Alte Events löschen:
analytics.clear();

// Oder MAX_EVENTS reduzieren in analytics.js:
const MAX_EVENTS = 200; // statt 500
```

---

**Fragen? Probleme?** Öffne ein Issue im Repo!
