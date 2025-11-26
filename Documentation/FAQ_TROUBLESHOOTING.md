# ❓ FAQ & Troubleshooting

## 📋 Häufig gestellte Fragen

### 1. Warum Supabase statt eigenem Server?

**Vorteile von Supabase:**
- ✅ **Kostenlos** bis 50.000 User
- ✅ **Kein Server-Management** nötig
- ✅ **Automatische Backups**
- ✅ **SSL/HTTPS** bereits konfiguriert
- ✅ **Authentifizierung** fertig eingebaut
- ✅ **Skaliert automatisch**

**Eigener Server:**
- ❌ Monatliche Kosten (5-50€+)
- ❌ Server-Wartung erforderlich
- ❌ SSL-Zertifikate manuell einrichten
- ❌ Sicherheits-Updates selbst machen
- ❌ Backup-System selbst bauen

**Fazit:** Für Anfänger und kleine/mittlere Apps ist Supabase die beste Wahl.

---

### 2. Kann ich später zu einem anderen Service wechseln?

**Ja!** Die Architektur ist flexibel:

```javascript
// Du musst nur die API-Funktionen anpassen:
class StatsAPI {
    async getUserStats() {
        // Supabase:
        return await supabase.from('user_stats').select();

        // Firebase Alternative:
        // return await firebase.collection('stats').get();

        // Eigene API Alternative:
        // return await fetch('/api/stats').then(r => r.json());
    }
}
```

**Migration ist möglich zu:**
- Firebase
- MongoDB Atlas
- PostgreSQL (selbst gehostet)
- MySQL
- Eigene REST API

---

### 3. Was passiert mit bestehenden localStorage-Daten?

**Du hast 3 Optionen:**

#### Option A: Harter Cut (Empfohlen für kleine Apps)
- Alle User starten bei 0
- Einfach zu implementieren
- Keine Daten-Migration nötig

#### Option B: Einmalige Migration
- User können beim ersten Login ihre localStorage-Daten hochladen
- Script liest alte Daten aus
- Überträgt sie in Datenbank
- Siehe `MIGRATION_GUIDE.md`

#### Option C: Parallelbetrieb
- Alte Version auf `old.domain.com`
- Neue Version auf `domain.com`
- User können selbst wählen

---

### 4. Wie sicher sind meine Supabase API Keys?

**Zwei Arten von Keys:**

1. **anon/public Key** (öffentlich sichtbar)
   - ✅ Kann in Frontend-Code stehen
   - ✅ Ist durch Row Level Security (RLS) geschützt
   - ✅ User sehen nur ihre eigenen Daten
   - ⚠️ NICHT für Admin-Funktionen verwenden

2. **service_role Key** (geheim)
   - ❌ NIEMALS in Frontend-Code
   - ❌ NUR in Backend/Serverless Functions
   - ✅ Hat volle Datenbank-Rechte
   - ⚠️ Wie Admin-Passwort behandeln

**Best Practice:**
```javascript
// ✅ OK im Frontend:
const supabase = createClient(PUBLIC_URL, PUBLIC_ANON_KEY);

// ❌ NIEMALS im Frontend:
const supabase = createClient(URL, SERVICE_ROLE_KEY);
```

---

### 5. Was kostet Supabase wenn ich wachse?

**Free Tier (0€/Monat):**
- 500 MB Datenbank
- 1 GB Dateispeicher
- 2 GB Bandbreite
- 50.000 monatlich aktive User

**Reicht für ca.:**
- 10.000 - 50.000 User
- 100.000+ Sessions
- Normale Nutzung ohne große Dateien

**Pro Tier (~25€/Monat):**
- 8 GB Datenbank
- 100 GB Dateispeicher
- 50 GB Bandbreite
- Unbegrenzte User

**Rechner:**
1 User = ca. 5 KB Datenbank
→ 500 MB = 100.000 User

**Fazit:** Free Tier reicht lange!

---

### 6. Kann ich Supabase auch lokal entwickeln?

**Ja!** Supabase hat ein CLI-Tool:

```bash
# Installation
npm install -g supabase

# Lokales Projekt starten
supabase init
supabase start

# Läuft auf http://localhost:54321
```

**Vorteile:**
- Offline-Entwicklung
- Kostenlos (kein Verbrauch)
- Schneller

**Nachteil:**
- Daten sind getrennt von Produktion
- Docker muss installiert sein

---

### 7. Wie schnell ist Supabase?

**Typische Response-Zeiten:**
- Einfache Query: 50-200ms
- Mit Join: 100-500ms
- Auth Check: 50-100ms

**Optimierung:**
- ✅ Indexes erstellen
- ✅ Connection Pooling
- ✅ Caching im Frontend

**Vergleich localStorage:**
- localStorage: 1-5ms (schneller)
- Supabase: 50-200ms (sicherer)

**Fazit:** Für deine App schnell genug!

---

### 8. Muss ich SQL lernen?

**Nicht zwingend!** Supabase hat JavaScript-SDK:

```javascript
// Kein SQL nötig:
const { data } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId);

// Statt SQL:
// SELECT * FROM user_stats WHERE user_id = '...';
```

**Aber SQL ist hilfreich für:**
- Komplexe Queries
- Datenbank-Setup
- Performance-Optimierung

**Lernen:**
- https://www.sqlzoo.net/ (interaktiv)
- Supabase Docs (Beispiele)

---

### 9. Was ist Row Level Security (RLS)?

**Einfach erklärt:**

❌ **Ohne RLS:**
```javascript
// User A kann Daten von User B sehen:
const { data } = await supabase.from('user_stats').select();
// → Gibt ALLE User zurück (Sicherheitslücke!)
```

✅ **Mit RLS:**
```javascript
// User A sieht nur eigene Daten:
const { data } = await supabase.from('user_stats').select();
// → Gibt NUR Daten von User A zurück (sicher!)
```

**Wie funktioniert's?**
```sql
-- Policy: "Users can view own stats"
CREATE POLICY "Users can view own stats"
    ON user_stats FOR SELECT
    USING (auth.uid() = user_id);
    --      ↑                ↑
    --   Eingeloggter    Spalte in
    --      User          Tabelle
```

**Fazit:** RLS = Automatischer Daten-Filter pro User

---

### 10. Brauche ich HTTPS?

**Ja, zwingend für Authentifizierung!**

**Vercel/Netlify:**
- ✅ Automatisch HTTPS
- ✅ Kostenlose SSL-Zertifikate

**Eigener Server:**
- ⚠️ Let's Encrypt (kostenlos)
- ⚠️ Certbot installieren
- ⚠️ Automatische Erneuerung einrichten

**Warum HTTPS?**
- Passwörter verschlüsselt
- Supabase erfordert es
- SEO-Vorteil (Google)
- Browser-Warnungen vermeiden

---

## 🔧 Troubleshooting

### Problem 1: "Failed to fetch" Fehler

**Symptome:**
```
Error: Failed to fetch
Network error
```

**Ursachen & Lösungen:**

#### Ursache A: Falsche API Keys
```javascript
// Prüfe supabase-config.js:
const SUPABASE_URL = 'https://xxx.supabase.co'; // ← Korrekt?
const SUPABASE_ANON_KEY = 'eyJ...'; // ← Vollständig?
```

**Test:**
```javascript
// In Browser-Konsole (F12):
console.log(window.supabaseClient);
// Sollte Objekt zeigen, nicht undefined
```

#### Ursache B: CORS-Problem
**Lösung:**
1. Supabase Dashboard → Settings → API
2. Prüfe "CORS Allowed Origins"
3. Füge deine Domain hinzu: `https://deine-domain.com`

#### Ursache C: Ad-Blocker
**Lösung:** Deaktiviere Ad-Blocker für deine Seite

---

### Problem 2: "User not logged in"

**Symptome:**
```javascript
Error: Nicht eingeloggt
getCurrentUser() returns null
```

**Ursachen & Lösungen:**

#### Lösung 1: Login-Check zu früh
```javascript
// ❌ FALSCH:
const user = window.authManager.getCurrentUser();
// → Wird sofort ausgeführt, Auth noch nicht bereit

// ✅ RICHTIG:
document.addEventListener('DOMContentLoaded', async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = window.authManager.getCurrentUser();
});
```

#### Lösung 2: Session abgelaufen
- Supabase Sessions laufen nach 1 Woche ab
- User muss sich neu einloggen
- Implementiere "Remember Me" für längere Sessions

#### Lösung 3: Cookies blockiert
- Browser-Einstellungen prüfen
- Third-Party Cookies erlauben
- Inkognito-Modus deaktivieren

---

### Problem 3: "Row Level Security policy violation"

**Symptome:**
```
Error: new row violates row-level security policy
```

**Ursache:** RLS ist aktiv, aber keine Policy erlaubt die Aktion

**Lösung:**

```sql
-- Prüfe ob Policies existieren:
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';

-- Wenn leer → Policies fehlen!

-- Policies erstellen (siehe SICHERES_SERVER_KONZEPT.md Phase 2.3)
CREATE POLICY "Users can insert own stats"
    ON user_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

---

### Problem 4: Punkte werden nicht gespeichert

**Symptome:**
- Punkte werden angezeigt
- Nach Reload sind sie weg

**Debug-Schritte:**

#### 1. Browser-Konsole prüfen (F12)
```javascript
// Suche nach Errors:
// ❌ "Failed to update user_stats"
// ❌ "RLS violation"
// ❌ "Network error"
```

#### 2. Netzwerk-Tab prüfen
- F12 → Network Tab
- Reload der Seite
- Suche nach "user_stats" Request
- Status-Code prüfen:
  - 200 = OK ✅
  - 401 = Nicht authentifiziert ❌
  - 403 = RLS Policy blockiert ❌
  - 500 = Server-Fehler ❌

#### 3. Supabase Dashboard prüfen
- Table Editor → user_stats
- Sind Daten vorhanden?
- Wenn nein → INSERT schlägt fehl
- Wenn ja, aber nicht im Frontend → SELECT schlägt fehl

#### 4. Code prüfen
```javascript
// Wird die neue API genutzt?
// ❌ ALT:
addPoints(10);
localStorage.setItem('studytok_stats', ...);

// ✅ NEU:
await window.statsAPI.addPoints(10, 'focus_session');
```

---

### Problem 5: Email-Bestätigung funktioniert nicht

**Symptome:**
- User registriert sich
- Erhält keine Email

**Lösungen:**

#### Lösung 1: Supabase Email-Settings
1. Dashboard → Authentication → Settings
2. Prüfe "Email Confirmations" ist aktiviert
3. Prüfe SMTP-Settings (Free Tier nutzt Supabase SMTP)

#### Lösung 2: Spam-Ordner
- Email landet oft im Spam
- Supabase Free Tier hat niedrige Reputation

#### Lösung 3: Eigener SMTP-Server (optional)
```
Settings → Authentication → Email Templates
SMTP Settings:
  Host: smtp.gmail.com
  Port: 587
  Username: deine@gmail.com
  Password: [App-Passwort]
```

#### Lösung 4: Email-Confirmation deaktivieren (für Testing)
```
Settings → Authentication → Email Confirmations
→ Schalter auf "OFF"
```

**⚠️ Achtung:** Nur für Development, nicht für Production!

---

### Problem 6: Performance-Probleme

**Symptome:**
- Langsame Ladezeiten
- Queries dauern >1 Sekunde

**Optimierungen:**

#### 1. Indexes prüfen
```sql
-- Zeige alle Indexes:
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public';

-- Fehlende Indexes erstellen:
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_completed_at ON sessions(completed_at);
```

#### 2. Query-Optimierung
```javascript
// ❌ LANGSAM (lädt alles):
const { data } = await supabase
    .from('sessions')
    .select('*');

// ✅ SCHNELL (nur nötige Daten):
const { data } = await supabase
    .from('sessions')
    .select('id, duration, points_earned')
    .eq('user_id', userId)
    .limit(10);
```

#### 3. Caching im Frontend
```javascript
class StatsCache {
    constructor() {
        this.cache = null;
        this.cacheTime = 0;
        this.cacheDuration = 60000; // 1 Minute
    }

    async getUserStats() {
        const now = Date.now();

        if (this.cache && (now - this.cacheTime) < this.cacheDuration) {
            console.log('✅ Aus Cache geladen');
            return this.cache;
        }

        const stats = await window.statsAPI.getUserStats();
        this.cache = stats;
        this.cacheTime = now;

        return stats;
    }
}
```

#### 4. Connection Pooling (Pro Tier)
```
Settings → Database → Connection Pooling
→ Enable
```

---

### Problem 7: "Too many requests" Error

**Symptome:**
```
Error 429: Too Many Requests
Rate limit exceeded
```

**Ursache:** Zu viele API-Calls in kurzer Zeit

**Lösungen:**

#### 1. Request-Batching
```javascript
// ❌ SCHLECHT (5 Requests):
await addPoints(10);
await addPoints(10);
await addPoints(10);
await addPoints(10);
await addPoints(10);

// ✅ GUT (1 Request):
await addPoints(50);
```

#### 2. Debouncing
```javascript
// Verhindere mehrfache Clicks:
let isProcessing = false;

async function completeSession() {
    if (isProcessing) return;
    isProcessing = true;

    try {
        await statsAPI.completeSession(25);
    } finally {
        isProcessing = false;
    }
}
```

#### 3. Rate Limit im Code
```javascript
class RateLimiter {
    constructor(maxRequests, timeWindow) {
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindow;
        this.requests = [];
    }

    async execute(fn) {
        const now = Date.now();
        this.requests = this.requests.filter(t => now - t < this.timeWindow);

        if (this.requests.length >= this.maxRequests) {
            throw new Error('Zu viele Requests. Bitte warte kurz.');
        }

        this.requests.push(now);
        return await fn();
    }
}

// Nutzung:
const limiter = new RateLimiter(10, 60000); // 10 Requests pro Minute

await limiter.execute(() => statsAPI.addPoints(10, 'focus_session'));
```

---

### Problem 8: Daten sind inkonsistent

**Symptome:**
- Punkte stimmen nicht
- Sessions fehlen
- Verschiedene Werte in verschiedenen Tabellen

**Ursache:** Fehler in Transaktionen oder fehlende Validierung

**Lösung: Datenbank-Constraints**

```sql
-- Verhindere negative Punkte:
ALTER TABLE user_stats
ADD CONSTRAINT check_positive_points
CHECK (points >= 0);

-- Verhindere negative Sessions:
ALTER TABLE user_stats
ADD CONSTRAINT check_positive_sessions
CHECK (sessions >= 0);

-- Verhindere ungültige Tree Levels:
ALTER TABLE tree_progress
ADD CONSTRAINT check_valid_level
CHECK (level BETWEEN 1 AND 10);

-- Verhindere ungültige Session-Dauer:
ALTER TABLE sessions
ADD CONSTRAINT check_valid_duration
CHECK (duration BETWEEN 1 AND 120); -- 1-120 Minuten
```

**Daten-Reparatur:**
```sql
-- Finde inkonsistente Daten:
SELECT user_id, points
FROM user_stats
WHERE points < 0;

-- Repariere:
UPDATE user_stats
SET points = 0
WHERE points < 0;
```

---

## 🔍 Debugging-Tools

### 1. Browser DevTools

**Öffnen:** F12 oder Rechtsklick → "Untersuchen"

**Console Tab:**
```javascript
// Prüfe Supabase Client:
console.log(window.supabaseClient);

// Prüfe Auth Status:
console.log(await window.supabaseClient.auth.getSession());

// Prüfe User Stats:
console.log(await window.statsAPI.getUserStats());
```

**Network Tab:**
- Zeigt alle API-Requests
- Status-Codes prüfen
- Response-Daten sehen
- Fehler analysieren

**Application Tab:**
- localStorage prüfen
- Cookies anschauen
- Session Storage

### 2. Supabase Dashboard

**Table Editor:**
- Daten direkt ansehen
- Manuell editieren
- SQL-Queries ausführen

**SQL Editor:**
- Queries testen
- Daten analysieren
```sql
-- Beispiel: Zeige User mit meisten Punkten
SELECT user_id, points, sessions
FROM user_stats
ORDER BY points DESC
LIMIT 10;
```

**Logs:**
- API-Requests sehen
- Fehler finden
- Performance analysieren

### 3. Supabase CLI

```bash
# Installation
npm install -g supabase

# Login
supabase login

# Link zu Remote-Projekt
supabase link --project-ref dein-projekt-id

# Zeige Logs
supabase logs

# Datenbank-Migrations
supabase db diff
```

---

## 📞 Support

### Supabase Support
- 📚 Docs: https://supabase.com/docs
- 💬 Discord: https://discord.supabase.com
- 🐛 GitHub Issues: https://github.com/supabase/supabase/issues

### Community-Hilfe
- Stack Overflow: Tag `supabase`
- Reddit: r/Supabase

### Für dein Projekt
- 📖 Siehe andere Docs in `/Documentation/`
- 🔍 Prüfe Code-Kommentare
- 🧪 Teste mit kleinen Beispielen

---

**Weitere Fragen?**

Erstelle ein Issue mit:
1. **Fehlermeldung** (vollständig)
2. **Browser-Console** Output (Screenshot)
3. **Relevanter Code**
4. **Schritte zum Reproduzieren**

**Happy Coding! 🚀**
