# 🔄 Migrations-Anleitung: localStorage → Supabase

## 📋 Überblick

Wenn du bereits Nutzer hast, die Daten in localStorage gespeichert haben, kannst du ihnen ermöglichen, diese Daten in die neue Supabase-Datenbank zu übertragen.

---

## 🎯 Strategie-Optionen

### Option 1: Harter Neustart (Einfach) ⭐

**Beschreibung:**
- Alle starten bei 0
- Keine Migration
- Ankündigung vorher

**Vorteile:**
- ✅ Sehr einfach
- ✅ Keine zusätzliche Entwicklung
- ✅ Faire Bedingungen für alle

**Nachteile:**
- ❌ User verlieren Fortschritt
- ❌ Mögliche Unzufriedenheit

**Empfohlen für:**
- Kleine Nutzerbasis (<100 User)
- Beta/Test-Phase
- Wenig Zeit für Entwicklung

**Umsetzung:**
1. Ankündigung 1 Woche vorher
2. Screenshots als "Beweis" erlauben
3. Kompensation: Jeder bekommt 100 Startpunkte

---

### Option 2: Einmalige Auto-Migration (Mittel)

**Beschreibung:**
- Beim ersten Login werden localStorage-Daten automatisch hochgeladen
- Einmalig pro User
- Danach nur noch Supabase

**Vorteile:**
- ✅ User behalten Fortschritt
- ✅ Automatischer Prozess
- ✅ Nahtloser Übergang

**Nachteile:**
- ⚠️ Entwicklungsaufwand: 2-3 Stunden
- ⚠️ Validierung nötig (Cheating-Schutz)

**Empfohlen für:**
- Mittlere Nutzerbasis (100-1000 User)
- Aktive Community
- Zeit für Implementierung vorhanden

**Umsetzung:** Siehe unten

---

### Option 3: Manueller Upload (Komplex)

**Beschreibung:**
- User können localStorage-Daten exportieren
- Admin prüft Daten manuell
- Import in Datenbank

**Vorteile:**
- ✅ Maximale Kontrolle
- ✅ Cheating-Verhinderung

**Nachteile:**
- ❌ Viel manuelle Arbeit
- ❌ Nicht skalierbar
- ❌ Schlechte User Experience

**Empfohlen für:**
- Sehr kleine Nutzerbasis (<20 User)
- Hoher Wert der Daten

---

## 🔧 Implementierung: Auto-Migration

### Schritt 1: Migration-Detector erstellen

**Erstelle `/js/migration.js`:**

```javascript
// ============================================
// AUTO-MIGRATION VON LOCALSTORAGE → SUPABASE
// ============================================

class DataMigration {
    constructor() {
        this.supabase = window.supabaseClient;
        this.migrationKey = 'studytok_migrated';
    }

    // ============================================
    // PRÜFE OB MIGRATION NÖTIG
    // ============================================
    needsMigration() {
        // Hat User schon migriert?
        if (localStorage.getItem(this.migrationKey)) {
            return false;
        }

        // Existieren alte Daten?
        const oldStats = localStorage.getItem('studytok_stats');
        const oldShop = localStorage.getItem('studytok_shop');
        const oldTree = localStorage.getItem('studytok_tree');

        return !!(oldStats || oldShop || oldTree);
    }

    // ============================================
    // EXTRAHIERE LOCALSTORAGE DATEN
    // ============================================
    extractLocalStorageData() {
        const data = {
            stats: null,
            shop: null,
            tree: null
        };

        try {
            // Stats
            const statsRaw = localStorage.getItem('studytok_stats');
            if (statsRaw) {
                data.stats = JSON.parse(statsRaw);
            }

            // Shop
            const shopRaw = localStorage.getItem('studytok_shop');
            if (shopRaw) {
                data.shop = JSON.parse(shopRaw);
            }

            // Tree
            const treeRaw = localStorage.getItem('studytok_tree');
            if (treeRaw) {
                data.tree = JSON.parse(treeRaw);
            }
        } catch (error) {
            console.error('❌ Fehler beim Extrahieren der Daten:', error);
            return null;
        }

        return data;
    }

    // ============================================
    // VALIDIERE DATEN (ANTI-CHEATING)
    // ============================================
    validateData(data) {
        const validated = {
            stats: {},
            shop: {},
            tree: {}
        };

        // Stats validieren
        if (data.stats) {
            validated.stats = {
                // Punkte: Max 10.000 (verhindert extreme Werte)
                points: Math.min(Math.max(data.stats.points || 0, 0), 10000),

                // Sessions: Max 1000
                sessions: Math.min(Math.max(data.stats.sessions || 0, 0), 1000),

                // Focus Time: Max 50.000 Minuten (≈ 833 Stunden)
                focus_time: Math.min(Math.max(data.stats.focusTime || 0, 0), 50000),

                // Streak: Max 365 Tage
                streak: Math.min(Math.max(data.stats.streak || 1, 1), 365),

                // Achievements: Max 50
                achievements: Math.min(Math.max(data.stats.achievements || 0, 0), 50),

                sessions_today: 0, // Reset für neuen Tag
                daily_login_claimed: false // Reset für neuen Tag
            };

            // Plausibilitäts-Check:
            // Punkte sollten ungefähr zu Sessions passen (10 Punkte pro Session)
            const expectedPoints = validated.stats.sessions * 10;
            if (validated.stats.points > expectedPoints * 3) {
                console.warn('⚠️ Punkte wirken unrealistisch hoch, reduziere...');
                validated.stats.points = expectedPoints;
            }
        }

        // Tree validieren
        if (data.tree) {
            validated.tree = {
                level: Math.min(Math.max(data.tree.level || 1, 1), 10),
                blossoms: Math.min(Math.max(data.tree.blossoms || 0, 0), 5),
                total_sessions: validated.stats.sessions || 0
            };

            // Tree Level sollte zu Sessions passen
            const expectedLevel = Math.floor(validated.tree.total_sessions / 5) + 1;
            if (validated.tree.level > expectedLevel + 2) {
                console.warn('⚠️ Tree Level wirkt unrealistisch, korrigiere...');
                validated.tree.level = Math.min(expectedLevel + 2, 10);
            }
        }

        // Shop validieren
        if (data.shop) {
            validated.shop = {
                purchased_items: data.shop.purchased || []
            };

            // Prüfe ob Items existieren
            const validItems = ['rabattcode', 'achievement', 'music', 'blossoms'];
            validated.shop.purchased_items = validated.shop.purchased_items.filter(
                item => validItems.includes(item)
            );
        }

        return validated;
    }

    // ============================================
    // MIGRATION DURCHFÜHREN
    // ============================================
    async migrate() {
        const user = window.authManager.getCurrentUser();
        if (!user) {
            throw new Error('User muss eingeloggt sein');
        }

        // 1. Extrahiere Daten
        console.log('📦 Extrahiere localStorage-Daten...');
        const rawData = this.extractLocalStorageData();

        if (!rawData || (!rawData.stats && !rawData.shop && !rawData.tree)) {
            throw new Error('Keine Daten zum Migrieren gefunden');
        }

        // 2. Validiere Daten
        console.log('✅ Validiere Daten...');
        const validatedData = this.validateData(rawData);

        // 3. Schreibe in Datenbank
        console.log('💾 Schreibe in Datenbank...');

        try {
            // Stats migrieren
            if (validatedData.stats && Object.keys(validatedData.stats).length > 0) {
                const { error: statsError } = await this.supabase
                    .from('user_stats')
                    .update(validatedData.stats)
                    .eq('user_id', user.id);

                if (statsError) throw statsError;
                console.log('✅ Stats migriert');
            }

            // Tree migrieren
            if (validatedData.tree && Object.keys(validatedData.tree).length > 0) {
                const { error: treeError } = await this.supabase
                    .from('tree_progress')
                    .update(validatedData.tree)
                    .eq('user_id', user.id);

                if (treeError) throw treeError;
                console.log('✅ Tree migriert');
            }

            // Shop-Käufe migrieren
            if (validatedData.shop.purchased_items && validatedData.shop.purchased_items.length > 0) {
                const purchases = validatedData.shop.purchased_items.map(item => ({
                    user_id: user.id,
                    item_name: item,
                    price: 0, // Unbekannt bei Migration
                    purchased_at: new Date().toISOString()
                }));

                const { error: purchaseError } = await this.supabase
                    .from('purchases')
                    .insert(purchases);

                if (purchaseError && purchaseError.code !== '23505') { // Ignoriere Duplikate
                    throw purchaseError;
                }
                console.log('✅ Käufe migriert');
            }

            // 4. Markiere als migriert
            localStorage.setItem(this.migrationKey, 'true');
            localStorage.setItem('studytok_migration_date', new Date().toISOString());

            // 5. Optional: Alte Daten löschen
            // localStorage.removeItem('studytok_stats');
            // localStorage.removeItem('studytok_shop');
            // localStorage.removeItem('studytok_tree');

            console.log('🎉 Migration erfolgreich!');

            return {
                success: true,
                migrated: validatedData
            };

        } catch (error) {
            console.error('❌ Migration fehlgeschlagen:', error);
            throw error;
        }
    }

    // ============================================
    // ZEIGE MIGRATIONS-DIALOG
    // ============================================
    async showMigrationDialog() {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'migration-dialog';
            dialog.innerHTML = `
                <div class="migration-overlay"></div>
                <div class="migration-modal">
                    <h2>🔄 Daten-Migration</h2>
                    <p>Wir haben alte Daten in deinem Browser gefunden!</p>
                    <p>Möchtest du deine bisherigen Fortschritte übertragen?</p>

                    <div class="migration-info">
                        <strong>Folgendes wird übertragen:</strong>
                        <ul id="migration-details"></ul>
                    </div>

                    <div class="migration-buttons">
                        <button id="migrate-yes" class="btn btn-primary">
                            ✅ Ja, Daten übertragen
                        </button>
                        <button id="migrate-no" class="btn btn-secondary">
                            ❌ Nein, neu starten
                        </button>
                    </div>

                    <small class="migration-note">
                        Hinweis: Die Migration kann nur einmal durchgeführt werden.
                    </small>
                </div>
            `;

            // Füge Styles hinzu
            const style = document.createElement('style');
            style.textContent = `
                .migration-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 9999;
                }

                .migration-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    padding: 30px;
                    border-radius: 12px;
                    max-width: 500px;
                    width: 90%;
                    z-index: 10000;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                }

                .migration-modal h2 {
                    margin-top: 0;
                    color: #333;
                }

                .migration-info {
                    background: #f5f5f5;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                }

                .migration-info ul {
                    margin: 10px 0 0 0;
                    padding-left: 20px;
                }

                .migration-buttons {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }

                .migration-buttons button {
                    flex: 1;
                    padding: 12px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                }

                .btn-primary {
                    background: #4CAF50;
                    color: white;
                }

                .btn-secondary {
                    background: #f44336;
                    color: white;
                }

                .migration-note {
                    display: block;
                    margin-top: 15px;
                    color: #666;
                    text-align: center;
                }
            `;
            document.head.appendChild(style);

            // Zeige Details
            const data = this.extractLocalStorageData();
            const details = document.createElement('div');
            if (data.stats) {
                details.innerHTML += `<li>📊 ${data.stats.points || 0} Punkte</li>`;
                details.innerHTML += `<li>⏱️ ${data.stats.sessions || 0} Sessions</li>`;
                details.innerHTML += `<li>🔥 ${data.stats.streak || 1} Tage Streak</li>`;
            }

            document.body.appendChild(dialog);
            document.getElementById('migration-details').appendChild(details);

            // Event Handlers
            document.getElementById('migrate-yes').onclick = () => {
                document.body.removeChild(dialog);
                resolve(true);
            };

            document.getElementById('migrate-no').onclick = () => {
                // Markiere als "nicht migrieren gewollt"
                localStorage.setItem(this.migrationKey, 'skipped');
                document.body.removeChild(dialog);
                resolve(false);
            };
        });
    }
}

// Globale Instanz
window.dataMigration = new DataMigration();
```

---

### Schritt 2: Migration in Auth-Flow einbauen

**Öffne `/js/auth.js`** und ergänze:

```javascript
class AuthManager {
    // ... bestehender Code ...

    async init() {
        const { data: { session } } = await this.supabase.auth.getSession();

        if (session) {
            this.currentUser = session.user;
            console.log('✅ User eingeloggt:', this.currentUser.email);

            // ============================================
            // NEU: Prüfe ob Migration nötig
            // ============================================
            if (window.dataMigration && window.dataMigration.needsMigration()) {
                console.log('🔄 Migration erforderlich');
                await this.handleMigration();
            }

            this.onAuthStateChanged(true);
        } else {
            this.onAuthStateChanged(false);
        }

        // ... Rest des Codes ...
    }

    // ============================================
    // MIGRATIONS-HANDLER
    // ============================================
    async handleMigration() {
        try {
            // Zeige Dialog
            const userWantsMigration = await window.dataMigration.showMigrationDialog();

            if (userWantsMigration) {
                // Zeige Loading
                this.showLoading('Daten werden migriert...');

                // Führe Migration durch
                const result = await window.dataMigration.migrate();

                this.hideLoading();

                // Zeige Erfolg
                this.showNotification(
                    `✅ Migration erfolgreich! ${result.migrated.stats.points} Punkte übertragen.`,
                    'success',
                    5000
                );

                // Reload für frische Daten
                setTimeout(() => location.reload(), 2000);
            } else {
                console.log('User hat Migration abgelehnt');
            }
        } catch (error) {
            this.hideLoading();
            console.error('❌ Migrations-Fehler:', error);
            this.showNotification('Migration fehlgeschlagen. Bitte kontaktiere den Support.', 'error');
        }
    }

    showLoading(message) {
        const loader = document.createElement('div');
        loader.id = 'migration-loader';
        loader.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                        background: rgba(0,0,0,0.8); z-index: 99999;
                        display: flex; align-items: center; justify-content: center;
                        flex-direction: column; color: white;">
                <div class="spinner"></div>
                <p style="margin-top: 20px; font-size: 18px;">${message}</p>
            </div>
        `;
        document.body.appendChild(loader);
    }

    hideLoading() {
        const loader = document.getElementById('migration-loader');
        if (loader) loader.remove();
    }

    showNotification(message, type, duration = 3000) {
        // Nutze deine bestehende Notification-Funktion
        console.log(message);
    }
}
```

---

### Schritt 3: Migration-Script in HTML einbinden

**In ALLEN HTML-Dateien** nach `auth.js` hinzufügen:

```html
<script src="js/supabase-config.js"></script>
<script src="js/auth.js"></script>
<script src="js/migration.js"></script> <!-- NEU -->
```

---

## 🧪 Testing

### Test 1: Neue User (ohne alte Daten)

1. **Lösche** localStorage: F12 → Application → Local Storage → Clear
2. **Registriere** neuen Account
3. **Erwartung:** Kein Migrations-Dialog erscheint

### Test 2: Alte User (mit localStorage-Daten)

1. **Erstelle** Test-Daten in localStorage:
```javascript
// In Browser-Konsole (F12):
localStorage.setItem('studytok_stats', JSON.stringify({
    points: 500,
    sessions: 50,
    focusTime: 1250,
    streak: 7,
    achievements: 3
}));

localStorage.setItem('studytok_tree', JSON.stringify({
    level: 5,
    blossoms: 3,
    totalSessions: 50
}));
```

2. **Registriere** neuen Account
3. **Erwartung:** Migrations-Dialog erscheint
4. **Klicke** "Ja, Daten übertragen"
5. **Prüfe** Supabase Dashboard → user_stats:
   - Punkte sollten 500 sein
   - Sessions sollten 50 sein

### Test 3: Validierung (Cheating-Prevention)

1. **Erstelle** unrealistische Daten:
```javascript
localStorage.setItem('studytok_stats', JSON.stringify({
    points: 999999,  // Unrealistisch hoch
    sessions: 1,     // Passt nicht zu Punkten
    streak: 1000     // Zu hoch
}));
```

2. **Registriere** neuen Account
3. **Migration** durchführen
4. **Erwartung:** Daten werden korrigiert:
   - Punkte: Max 10.000
   - Streak: Max 365
   - Punkte angepasst an Sessions

---

## 📊 Monitoring

### Migrations-Log ansehen

```sql
-- In Supabase SQL Editor:

-- Zeige alle User mit migrierten Daten:
SELECT
    u.email,
    s.points,
    s.sessions,
    s.created_at as registered_at
FROM auth.users u
JOIN user_stats s ON u.id = s.user_id
WHERE s.points > 0 OR s.sessions > 0
ORDER BY s.created_at DESC;

-- Durchschnittliche migrierte Punkte:
SELECT
    AVG(points) as avg_points,
    MAX(points) as max_points,
    MIN(points) as min_points
FROM user_stats
WHERE created_at > NOW() - INTERVAL '7 days';
```

---

## 🚨 Rollback-Plan

Falls Migration fehlschlägt:

### Plan A: User kann es nochmal versuchen

```javascript
// In Browser-Konsole:
localStorage.removeItem('studytok_migrated');
location.reload();
// → Dialog erscheint wieder
```

### Plan B: Manuelle Migration durch Admin

```sql
-- Admin setzt Daten manuell:
UPDATE user_stats
SET
    points = 500,
    sessions = 50,
    focus_time = 1250
WHERE user_id = 'user-uuid-hier';
```

---

## 📅 Migrations-Zeitplan

### Phase 1: Ankündigung (1 Woche vorher)
- Email an alle User
- Banner auf Website
- Erkläre neues System

### Phase 2: Beta-Test (3 Tage)
- Test mit 5-10 Usern
- Feedback sammeln
- Bugs fixen

### Phase 3: Migration aktivieren
- Migration-Code deployen
- Intensives Monitoring
- Schneller Support

### Phase 4: Alte Daten löschen (nach 30 Tagen)
- localStorage-Daten können gelöscht werden
- Migrations-Code kann entfernt werden

---

## 💡 Pro-Tipps

### 1. Backup vor Migration

```javascript
async migrate() {
    // Backup erstellen:
    const backup = {
        stats: localStorage.getItem('studytok_stats'),
        shop: localStorage.getItem('studytok_shop'),
        tree: localStorage.getItem('studytok_tree'),
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('studytok_backup', JSON.stringify(backup));

    // ... rest der Migration
}
```

### 2. Migrations-Statistik sammeln

```sql
CREATE TABLE migration_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    old_points INTEGER,
    new_points INTEGER,
    old_sessions INTEGER,
    new_sessions INTEGER,
    validation_changes JSONB,
    migrated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Fehler-Handling

```javascript
async migrate() {
    try {
        await this.performMigration();
    } catch (error) {
        // Log an Server senden:
        await fetch('/api/log-migration-error', {
            method: 'POST',
            body: JSON.stringify({
                error: error.message,
                user_id: user.id,
                timestamp: new Date()
            })
        });

        throw error;
    }
}
```

---

## ✅ Zusammenfassung

**Empfohlene Strategie:**

1. **Kleine App (<100 User):** Option 1 (Neustart)
2. **Mittlere App (100-1000 User):** Option 2 (Auto-Migration)
3. **Große App (>1000 User):** Professionelle Migration mit Tests

**Wichtigste Schritte:**

1. ✅ Migration-Code erstellen (`migration.js`)
2. ✅ In Auth-Flow einbauen (`auth.js`)
3. ✅ Validierung implementieren (Anti-Cheating)
4. ✅ Ausgiebig testen
5. ✅ Monitoring aufsetzen
6. ✅ User ankündigen

**Zeitaufwand:** 2-4 Stunden Entwicklung + Testing

**Erfolgsrate:** 95%+ wenn Tests vorher durchgeführt

---

**Viel Erfolg bei der Migration! 🚀**
