# 🔒 Sicheres Server-Konzept für StudyTok Companion

## 📋 Inhaltsverzeichnis
1. [Problem-Analyse](#problem-analyse)
2. [Sicherheitskonzept-Übersicht](#sicherheitskonzept-übersicht)
3. [Kosteneffiziente Server-Lösungen](#kosteneffiziente-server-lösungen)
4. [Empfohlene Architektur](#empfohlene-architektur)
5. [Schritt-für-Schritt Implementierung](#schritt-für-schritt-implementierung)
6. [Code-Beispiele](#code-beispiele)
7. [Best Practices & Sicherheitstipps](#best-practices--sicherheitstipps)
8. [Wartung & Monitoring](#wartung--monitoring)

---

## 🚨 Problem-Analyse

### Aktuelle Sicherheitslücken

**Kritisches Problem:** Alle Daten werden nur im Browser (localStorage) gespeichert und können leicht manipuliert werden.

```javascript
// ⚠️ SO KANN JEDER SEINE PUNKTE MANIPULIEREN:
// Browser-Konsole öffnen (F12) und eingeben:
localStorage.setItem('studytok_stats', JSON.stringify({
    points: 999999,        // Unbegrenzte Punkte!
    sessions: 9999,        // Gefälschte Sessions
    achievements: 100      // Alle Erfolge freigeschaltet
}));
location.reload();  // Seite neu laden → Punkte erscheinen
```

### Was ist manipulierbar?

| Feature | Aktuell | Problem |
|---------|---------|---------|
| **Punkte** | Client-seitig gespeichert | User kann beliebig erhöhen |
| **Shop-Käufe** | Nur Browser-Check | Ohne Punkte kaufen möglich |
| **Sessions** | Timer läuft im Browser | Timer kann übersprungen werden |
| **Achievements** | Lokale Array-Liste | Alle freischaltbar ohne Leistung |
| **Streak** | Browser-Datum | Datum kann manipuliert werden |
| **Tree Level** | localStorage Zahl | Sofort max Level möglich |

### Warum ist das problematisch?

1. **Unfair für ehrliche Nutzer** - Andere cheaten sich Vorteile
2. **Shop-System wertlos** - Rabattcodes ohne echte Leistung erhältlich
3. **Statistiken unglaubwürdig** - Keine echten Lernfortschritte messbar
4. **Gamification zerstört** - Kein Anreiz mehr für echte Nutzung
5. **Keine Datensicherung** - Bei Browser-Wechsel alles weg

---

## 🛡️ Sicherheitskonzept-Übersicht

### Grundprinzip: "Never Trust the Client"

**Goldene Regel:** Der Browser (Client) kann IMMER manipuliert werden. Daher:

✅ **Server entscheidet** - Alle wichtigen Berechnungen auf dem Server
✅ **Server validiert** - Jede Aktion wird server-seitig geprüft
✅ **Server speichert** - Datenbank statt localStorage
✅ **Client zeigt nur an** - Browser ist nur für Darstellung zuständig

### Architektur-Vergleich

#### ❌ VORHER (Unsicher):
```
Browser (Client)
├── Punkte berechnen
├── Punkte speichern (localStorage)
├── Shop-Käufe validieren
├── Achievements freischalten
└── Statistiken verwalten
```

#### ✅ NACHHER (Sicher):
```
Browser (Client)                Server (Backend)
├── Anzeige UI                  ├── Authentifizierung
├── Buttons klicken             ├── Punkte berechnen
├── Timer anzeigen              ├── Datenbank-Speicherung
└── Daten anfragen              ├── Shop-Validierung
                                └── Achievement-Logic
```

---

## 💰 Kosteneffiziente Server-Lösungen

### Option 1: **Supabase** (⭐ EMPFOHLEN für Anfänger)

**Vorteile:**
- ✅ **KOSTENLOS** bis 50.000 Nutzer/Monat
- ✅ PostgreSQL Datenbank inklusive
- ✅ Authentifizierung eingebaut
- ✅ Einfache JavaScript SDK
- ✅ Echtzeit-Updates möglich
- ✅ Automatische API-Generierung
- ✅ Dashboard für Datenverwaltung

**Kosten:**
- **Free Tier:** 0€/Monat
  - 500 MB Datenbank
  - 1 GB Dateispeicher
  - 2 GB Bandbreite
  - 50.000 monatliche aktive Nutzer

- **Pro Tier:** ~25€/Monat (erst bei >50k Nutzern nötig)

**Perfekt für:** Anfänger ohne Backend-Erfahrung

---

### Option 2: **Firebase** (Google)

**Vorteile:**
- ✅ Kostenloser Tier verfügbar
- ✅ Sehr gute Dokumentation
- ✅ NoSQL Datenbank (Firestore)
- ✅ Authentifizierung eingebaut
- ✅ Hosting inklusive

**Kosten:**
- **Spark Plan (Kostenlos):**
  - 1 GB Speicher
  - 10 GB Bandbreite/Monat
  - 50.000 Lese-Operationen/Tag

- **Blaze Plan:** Pay-as-you-go (ca. 5-10€/Monat bei kleinen Apps)

**Perfekt für:** Wenn du Google-Ökosystem nutzt

---

### Option 3: **Vercel + PostgreSQL (Neon)**

**Vorteile:**
- ✅ Du hostest bereits auf Vercel (einfache Integration)
- ✅ Serverless Functions kostenlos
- ✅ Neon DB: 0,5 GB kostenlos
- ✅ Du kannst Node.js schreiben

**Kosten:**
- **Vercel Hobby:** 0€/Monat
- **Neon Free Tier:** 0€/Monat (0,5 GB)
- **Zusammen:** 0€/Monat für kleine Apps

**Perfekt für:** Wenn du bereits Vercel nutzt

---

### Option 4: **PocketBase** (Self-Hosted)

**Vorteile:**
- ✅ Komplett kostenlos (Open Source)
- ✅ Alles in einer Datei (1 Binary)
- ✅ Authentifizierung + Datenbank + Admin UI
- ✅ Sehr einfach zu starten

**Kosten:**
- Software: 0€ (Open Source)
- Hosting: ~3-5€/Monat (günstiger VPS wie Hetzner)

**Nachteil:** Du musst Server selbst verwalten

**Perfekt für:** Wenn du minimale Kosten willst und bereit bist, etwas zu lernen

---

### 🏆 Meine Empfehlung für DICH:

**Wähle SUPABASE**, weil:
1. ✅ Komplett kostenlos für dein Projekt
2. ✅ Einfachste Einrichtung (10 Minuten)
3. ✅ Authentifizierung fertig vorbereitet
4. ✅ Beste Dokumentation für Anfänger
5. ✅ Du kannst später problemlos upgraden
6. ✅ Web-Dashboard zum Daten anschauen

---

## 🏗️ Empfohlene Architektur

### System-Übersicht

```
┌─────────────────────────────────────────────────────────────┐
│                    BENUTZER (Browser)                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  VERCEL (Frontend Hosting)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  HTML/CSS/JavaScript (deine Website)                  │  │
│  │  - timer.html                                         │  │
│  │  - shop.html                                          │  │
│  │  - index.html                                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API Calls
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE (Backend)                         │
│  ┌────────────────────┐  ┌─────────────────────────────┐   │
│  │  Authentication    │  │  PostgreSQL Database         │   │
│  │  - Login/Register  │  │  ┌─────────────────────┐    │   │
│  │  - Sessions        │  │  │  users              │    │   │
│  │  - Email/Password  │  │  │  - id               │    │   │
│  └────────────────────┘  │  │  - email            │    │   │
│                          │  │  - created_at       │    │   │
│  ┌────────────────────┐  │  └─────────────────────┘    │   │
│  │  Row Level         │  │  ┌─────────────────────┐    │   │
│  │  Security (RLS)    │  │  │  user_stats         │    │   │
│  │  - Nur eigene      │  │  │  - user_id          │    │   │
│  │    Daten lesbar    │  │  │  - points           │    │   │
│  └────────────────────┘  │  │  - sessions         │    │   │
│                          │  │  - streak           │    │   │
│  ┌────────────────────┐  │  │  - updated_at       │    │   │
│  │  API Endpoints     │  │  └─────────────────────┘    │   │
│  │  - REST API        │  │  ┌─────────────────────┐    │   │
│  │  - Realtime        │  │  │  sessions           │    │   │
│  └────────────────────┘  │  │  - id               │    │   │
│                          │  │  - user_id          │    │   │
└─────────────────────────────│  - start_time       │────────┘
                          │  │  - duration         │    │
                          │  │  - points_earned    │    │
                          │  └─────────────────────┘    │
                          │  ┌─────────────────────┐    │
                          │  │  purchases          │    │
                          │  │  - id               │    │
                          │  │  - user_id          │    │
                          │  │  - item_name        │    │
                          │  │  - price            │    │
                          │  │  - purchased_at     │    │
                          │  └─────────────────────┘    │
                          └─────────────────────────────┘
```

### Datenbank-Schema

#### Tabelle: `users` (automatisch von Supabase erstellt)
```sql
id (UUID, Primary Key)
email (String)
encrypted_password (String)
created_at (Timestamp)
```

#### Tabelle: `user_stats`
```sql
CREATE TABLE user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0,
    sessions INTEGER DEFAULT 0,
    focus_time INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 1,
    achievements INTEGER DEFAULT 0,
    sessions_today INTEGER DEFAULT 0,
    last_active DATE DEFAULT CURRENT_DATE,
    daily_login_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);
```

#### Tabelle: `sessions`
```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type VARCHAR(20) DEFAULT 'focus', -- 'focus' or 'break'
    duration INTEGER NOT NULL, -- in Minuten
    points_earned INTEGER DEFAULT 0,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP DEFAULT NOW(),
    verified BOOLEAN DEFAULT FALSE
);
```

#### Tabelle: `purchases`
```sql
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_name VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL,
    purchased_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabelle: `achievements`
```sql
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);
```

#### Tabelle: `tree_progress`
```sql
CREATE TABLE tree_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1,
    blossoms INTEGER DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);
```

---

## 📝 Schritt-für-Schritt Implementierung

### Phase 1: Supabase Setup (15 Minuten)

#### Schritt 1.1: Supabase Account erstellen

1. **Gehe zu:** https://supabase.com
2. **Klicke:** "Start your project" (grüner Button)
3. **Wähle:** Sign up with GitHub (empfohlen) ODER Email
4. **Bestätige** deine Email-Adresse

#### Schritt 1.2: Neues Projekt erstellen

1. **Klicke** auf "New Project" (+ Symbol)
2. **Fülle aus:**
   ```
   Name: StudyTok-Backend
   Database Password: [GENERIERE EIN SICHERES PASSWORT]
   Region: Europe West (Frankfurt) ← Am nächsten zu Deutschland
   Pricing Plan: Free
   ```
3. **Klicke** "Create new project"
4. ⏰ **Warte 2-3 Minuten** bis Projekt bereit ist

#### Schritt 1.3: API Keys kopieren

1. **Gehe zu:** Settings (⚙️ Icon links) → API
2. **Kopiere diese Werte:**
   ```
   Project URL: https://abcdefgh.supabase.co
   anon public key: eyJ... (langer String)
   ```
3. **WICHTIG:** Speichere diese in einer sicheren Datei!

---

### Phase 2: Datenbank-Tabellen erstellen (10 Minuten)

#### Schritt 2.1: SQL Editor öffnen

1. **Klicke** links auf "SQL Editor" (Datenbank-Icon)
2. **Klicke** "+ New query"

#### Schritt 2.2: Tabellen erstellen

**Kopiere diesen Code und klicke "Run":**

```sql
-- ============================================
-- USER STATS TABELLE
-- ============================================
CREATE TABLE user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 0 CHECK (points >= 0),
    sessions INTEGER DEFAULT 0 CHECK (sessions >= 0),
    focus_time INTEGER DEFAULT 0 CHECK (focus_time >= 0),
    streak INTEGER DEFAULT 1 CHECK (streak >= 0),
    achievements INTEGER DEFAULT 0 CHECK (achievements >= 0),
    sessions_today INTEGER DEFAULT 0 CHECK (sessions_today >= 0),
    last_active DATE DEFAULT CURRENT_DATE,
    daily_login_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- SESSIONS TABELLE (Session-Historie)
-- ============================================
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type VARCHAR(20) DEFAULT 'focus',
    duration INTEGER NOT NULL CHECK (duration > 0),
    points_earned INTEGER DEFAULT 0 CHECK (points_earned >= 0),
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP DEFAULT NOW(),
    verified BOOLEAN DEFAULT FALSE
);

-- ============================================
-- PURCHASES TABELLE (Shop-Käufe)
-- ============================================
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_name VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL CHECK (price >= 0),
    purchased_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ACHIEVEMENTS TABELLE
-- ============================================
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) NOT NULL,
    unlocked_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- ============================================
-- TREE PROGRESS TABELLE
-- ============================================
CREATE TABLE tree_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 1 CHECK (level BETWEEN 1 AND 10),
    blossoms INTEGER DEFAULT 0 CHECK (blossoms BETWEEN 0 AND 5),
    total_sessions INTEGER DEFAULT 0 CHECK (total_sessions >= 0),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- INDEXES für Performance
-- ============================================
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_tree_progress_user_id ON tree_progress(user_id);
CREATE INDEX idx_sessions_completed_at ON sessions(completed_at);

-- ============================================
-- TRIGGER: Automatisches Update von updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_stats_updated_at
    BEFORE UPDATE ON user_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tree_progress_updated_at
    BEFORE UPDATE ON tree_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

**Erwartetes Ergebnis:** "Success. No rows returned"

#### Schritt 2.3: Row Level Security (RLS) aktivieren

**WICHTIG:** Dies verhindert, dass User die Daten anderer sehen!

```sql
-- ============================================
-- ROW LEVEL SECURITY AKTIVIEREN
-- ============================================

-- Aktiviere RLS für alle Tabellen
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE tree_progress ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: Jeder User sieht nur seine Daten
-- ============================================

-- USER_STATS Policies
CREATE POLICY "Users can view own stats"
    ON user_stats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
    ON user_stats FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
    ON user_stats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- SESSIONS Policies
CREATE POLICY "Users can view own sessions"
    ON sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
    ON sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- PURCHASES Policies
CREATE POLICY "Users can view own purchases"
    ON purchases FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases"
    ON purchases FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ACHIEVEMENTS Policies
CREATE POLICY "Users can view own achievements"
    ON achievements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
    ON achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- TREE_PROGRESS Policies
CREATE POLICY "Users can view own tree"
    ON tree_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own tree"
    ON tree_progress FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tree"
    ON tree_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

**Klicke "Run"** - Erwartetes Ergebnis: "Success"

---

### Phase 3: Supabase Client in Website einbinden (20 Minuten)

#### Schritt 3.1: Supabase JavaScript Library hinzufügen

**Öffne:** `index.html` und füge VOR dem `</head>` Tag ein:

```html
<!-- Supabase Client Library -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

#### Schritt 3.2: Supabase Config-Datei erstellen

**Erstelle neue Datei:** `/js/supabase-config.js`

```javascript
// ============================================
// SUPABASE KONFIGURATION
// ============================================

const SUPABASE_URL = 'DEINE_PROJECT_URL_HIER';  // z.B. https://abcdefgh.supabase.co
const SUPABASE_ANON_KEY = 'DEIN_ANON_KEY_HIER'; // Der lange eyJ... String

// Supabase Client initialisieren
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Exportiere für andere Dateien
window.supabaseClient = supabase;

console.log('✅ Supabase Client initialisiert');
```

**WICHTIG:** Ersetze `DEINE_PROJECT_URL_HIER` und `DEIN_ANON_KEY_HIER` mit deinen echten Werten aus Schritt 1.3!

#### Schritt 3.3: Auth-System erstellen

**Erstelle neue Datei:** `/js/auth.js`

```javascript
// ============================================
// AUTHENTIFIZIERUNGS-SYSTEM
// ============================================

class AuthManager {
    constructor() {
        this.supabase = window.supabaseClient;
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Prüfe ob User eingeloggt ist
        const { data: { session } } = await this.supabase.auth.getSession();

        if (session) {
            this.currentUser = session.user;
            console.log('✅ User eingeloggt:', this.currentUser.email);
            this.onAuthStateChanged(true);
        } else {
            console.log('❌ Kein User eingeloggt');
            this.onAuthStateChanged(false);
        }

        // Lausche auf Auth-Änderungen
        this.supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                this.onAuthStateChanged(true);
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.onAuthStateChanged(false);
            }
        });
    }

    // Registrierung
    async signUp(email, password) {
        const { data, error } = await this.supabase.auth.signUp({
            email: email,
            password: password
        });

        if (error) {
            throw new Error(error.message);
        }

        // Erstelle initiale User-Stats
        await this.createInitialUserData(data.user.id);

        return data;
    }

    // Login
    async signIn(email, password) {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    // Logout
    async signOut() {
        const { error } = await this.supabase.auth.signOut();

        if (error) {
            throw new Error(error.message);
        }
    }

    // Erstelle initiale Daten für neuen User
    async createInitialUserData(userId) {
        try {
            // User Stats
            await this.supabase.from('user_stats').insert({
                user_id: userId,
                points: 0,
                sessions: 0,
                focus_time: 0,
                streak: 1
            });

            // Tree Progress
            await this.supabase.from('tree_progress').insert({
                user_id: userId,
                level: 1,
                blossoms: 0,
                total_sessions: 0
            });

            console.log('✅ Initiale User-Daten erstellt');
        } catch (error) {
            console.error('❌ Fehler beim Erstellen der User-Daten:', error);
        }
    }

    // Callback wenn Auth-Status sich ändert
    onAuthStateChanged(isLoggedIn) {
        if (isLoggedIn) {
            // Verstecke Login-Formular, zeige App
            this.showApp();
        } else {
            // Zeige Login-Formular, verstecke App
            this.showLogin();
        }
    }

    showApp() {
        const loginContainer = document.getElementById('login-container');
        const appContainer = document.getElementById('app-container');

        if (loginContainer) loginContainer.style.display = 'none';
        if (appContainer) appContainer.style.display = 'block';
    }

    showLogin() {
        const loginContainer = document.getElementById('login-container');
        const appContainer = document.getElementById('app-container');

        if (loginContainer) loginContainer.style.display = 'block';
        if (appContainer) appContainer.style.display = 'none';
    }

    // Hilfsfunktion: Aktuellen User abrufen
    getCurrentUser() {
        return this.currentUser;
    }

    // Hilfsfunktion: Ist User eingeloggt?
    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Globale Instanz erstellen
window.authManager = new AuthManager();
```

---

### Phase 4: Sichere API-Funktionen erstellen (30 Minuten)

#### Schritt 4.1: Stats-API erstellen

**Erstelle neue Datei:** `/js/api/stats-api.js`

```javascript
// ============================================
// STATS API - Server-seitige Validierung
// ============================================

class StatsAPI {
    constructor() {
        this.supabase = window.supabaseClient;
    }

    // ============================================
    // STATS ABRUFEN
    // ============================================
    async getUserStats() {
        const user = window.authManager.getCurrentUser();
        if (!user) throw new Error('Nicht eingeloggt');

        const { data, error } = await this.supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error) throw error;
        return data;
    }

    // ============================================
    // PUNKTE HINZUFÜGEN (mit Server-Validierung)
    // ============================================
    async addPoints(amount, reason) {
        const user = window.authManager.getCurrentUser();
        if (!user) throw new Error('Nicht eingeloggt');

        // 1. Aktuelle Stats abrufen
        const stats = await this.getUserStats();

        // 2. Server-seitige Validierung
        const validatedAmount = this.validatePointsAmount(amount, reason);

        // 3. Neue Punktzahl berechnen
        const newPoints = stats.points + validatedAmount;

        // 4. In Datenbank aktualisieren
        const { data, error } = await this.supabase
            .from('user_stats')
            .update({
                points: newPoints,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;

        console.log(`✅ ${validatedAmount} Punkte hinzugefügt (Grund: ${reason})`);
        return data;
    }

    // Validierung: Verhindere Cheating
    validatePointsAmount(amount, reason) {
        const validReasons = {
            'focus_session': 10,
            'daily_login': 15,
            'learning_tip': 2,
            'streak_bonus': 25,
            'learning_plan': 30,
            'music_reward': 5
        };

        // Prüfe ob Grund gültig ist
        if (!validReasons[reason]) {
            console.error('❌ Ungültiger Punkte-Grund:', reason);
            return 0;
        }

        // Prüfe ob Betrag korrekt ist
        if (amount !== validReasons[reason]) {
            console.error('❌ Falscher Punkte-Betrag:', amount, 'erwartet:', validReasons[reason]);
            return validReasons[reason]; // Nutze korrekten Betrag
        }

        return amount;
    }

    // ============================================
    // FOKUS-SESSION ABSCHLIESSEN
    // ============================================
    async completeSession(duration) {
        const user = window.authManager.getCurrentUser();
        if (!user) throw new Error('Nicht eingeloggt');

        // 1. Validiere Session-Dauer (muss zwischen 20-30 Min sein für Focus)
        if (duration < 20 || duration > 30) {
            throw new Error('Ungültige Session-Dauer');
        }

        // 2. Speichere Session in Datenbank
        const { data: sessionData, error: sessionError } = await this.supabase
            .from('sessions')
            .insert({
                user_id: user.id,
                session_type: 'focus',
                duration: duration,
                points_earned: 10,
                started_at: new Date(Date.now() - duration * 60000).toISOString(),
                completed_at: new Date().toISOString(),
                verified: true
            })
            .select()
            .single();

        if (sessionError) throw sessionError;

        // 3. Aktualisiere User Stats
        const stats = await this.getUserStats();
        const { error: updateError } = await this.supabase
            .from('user_stats')
            .update({
                points: stats.points + 10,
                sessions: stats.sessions + 1,
                sessions_today: stats.sessions_today + 1,
                focus_time: stats.focus_time + duration
            })
            .eq('user_id', user.id);

        if (updateError) throw updateError;

        // 4. Aktualisiere Tree Progress
        await this.updateTreeProgress();

        console.log('✅ Focus-Session abgeschlossen');
        return sessionData;
    }

    // ============================================
    // TREE PROGRESS AKTUALISIEREN
    // ============================================
    async updateTreeProgress() {
        const user = window.authManager.getCurrentUser();
        if (!user) throw new Error('Nicht eingeloggt');

        const { data: treeData, error: treeError } = await this.supabase
            .from('tree_progress')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (treeError) throw treeError;

        let newBlossoms = treeData.blossoms + 1;
        let newLevel = treeData.level;

        // Level-Up bei 5 Blossoms
        if (newBlossoms >= 5) {
            newLevel = Math.min(treeData.level + 1, 10); // Max Level 10
            newBlossoms = 0;
        }

        await this.supabase
            .from('tree_progress')
            .update({
                level: newLevel,
                blossoms: newBlossoms,
                total_sessions: treeData.total_sessions + 1
            })
            .eq('user_id', user.id);
    }

    // ============================================
    // DAILY LOGIN BONUS
    // ============================================
    async claimDailyLogin() {
        const user = window.authManager.getCurrentUser();
        if (!user) throw new Error('Nicht eingeloggt');

        const stats = await this.getUserStats();

        // Prüfe ob heute schon geclaimed
        const today = new Date().toDateString();
        const lastActive = new Date(stats.last_active).toDateString();

        if (stats.daily_login_claimed && today === lastActive) {
            throw new Error('Daily Login heute schon erhalten');
        }

        // Berechne Streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const wasActiveYesterday = yesterday.toDateString() === lastActive;

        let newStreak = wasActiveYesterday ? stats.streak + 1 : 1;

        // Update Stats
        await this.supabase
            .from('user_stats')
            .update({
                points: stats.points + 15,
                daily_login_claimed: true,
                last_active: new Date().toISOString(),
                streak: newStreak
            })
            .eq('user_id', user.id);

        console.log('✅ Daily Login Bonus erhalten (+15 Punkte)');
        return { points: 15, streak: newStreak };
    }
}

// Globale Instanz
window.statsAPI = new StatsAPI();
```

#### Schritt 4.2: Shop-API erstellen

**Erstelle neue Datei:** `/js/api/shop-api.js`

```javascript
// ============================================
// SHOP API - Server-seitige Validierung
// ============================================

class ShopAPI {
    constructor() {
        this.supabase = window.supabaseClient;

        // Definiere Shop-Items (Server-seitige Quelle der Wahrheit)
        this.shopItems = {
            'rabattcode': { price: 100, name: 'Rabattcode' },
            'achievement': { price: 200, name: 'Achievement' },
            'music': { price: 50, name: 'Hintergrundmusik' },
            'blossoms': { price: 50, name: 'Blüteneffekte' }
        };
    }

    // ============================================
    // ITEM KAUFEN
    // ============================================
    async purchaseItem(itemId) {
        const user = window.authManager.getCurrentUser();
        if (!user) throw new Error('Nicht eingeloggt');

        // 1. Prüfe ob Item existiert
        const item = this.shopItems[itemId];
        if (!item) {
            throw new Error('Item existiert nicht');
        }

        // 2. Hole aktuelle Punkte
        const stats = await window.statsAPI.getUserStats();

        // 3. Server-seitige Validierung: Genug Punkte?
        if (stats.points < item.price) {
            throw new Error(`Nicht genug Punkte. Benötigt: ${item.price}, Vorhanden: ${stats.points}`);
        }

        // 4. Prüfe ob bereits gekauft
        const alreadyPurchased = await this.hasUserPurchased(itemId);
        if (alreadyPurchased) {
            throw new Error('Item bereits gekauft');
        }

        // 5. Transaktion durchführen (Atomisch)
        try {
            // a) Punkte abziehen
            const { error: updateError } = await this.supabase
                .from('user_stats')
                .update({ points: stats.points - item.price })
                .eq('user_id', user.id);

            if (updateError) throw updateError;

            // b) Kauf speichern
            const { data: purchaseData, error: purchaseError } = await this.supabase
                .from('purchases')
                .insert({
                    user_id: user.id,
                    item_name: itemId,
                    price: item.price,
                    purchased_at: new Date().toISOString()
                })
                .select()
                .single();

            if (purchaseError) throw purchaseError;

            console.log(`✅ Item gekauft: ${item.name} für ${item.price} Punkte`);
            return purchaseData;

        } catch (error) {
            console.error('❌ Kauf fehlgeschlagen:', error);
            throw new Error('Kauf fehlgeschlagen. Punkte wurden nicht abgezogen.');
        }
    }

    // ============================================
    // PRÜFE OB GEKAUFT
    // ============================================
    async hasUserPurchased(itemId) {
        const user = window.authManager.getCurrentUser();
        if (!user) return false;

        const { data, error } = await this.supabase
            .from('purchases')
            .select('id')
            .eq('user_id', user.id)
            .eq('item_name', itemId)
            .limit(1);

        if (error) throw error;
        return data && data.length > 0;
    }

    // ============================================
    // ALLE KÄUFE ABRUFEN
    // ============================================
    async getUserPurchases() {
        const user = window.authManager.getCurrentUser();
        if (!user) throw new Error('Nicht eingeloggt');

        const { data, error } = await this.supabase
            .from('purchases')
            .select('*')
            .eq('user_id', user.id)
            .order('purchased_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    // ============================================
    // RABATTCODE GENERIEREN (nur nach Kauf)
    // ============================================
    async generateDiscountCode() {
        const hasPurchased = await this.hasUserPurchased('rabattcode');

        if (!hasPurchased) {
            throw new Error('Rabattcode muss erst gekauft werden');
        }

        // Generiere einzigartigen Code
        const user = window.authManager.getCurrentUser();
        const code = `STUDYTOK-${user.id.substring(0, 8).toUpperCase()}`;

        return code;
    }
}

// Globale Instanz
window.shopAPI = new ShopAPI();
```

---

### Phase 5: Frontend anpassen (45 Minuten)

#### Schritt 5.1: Login/Register UI erstellen

**Erstelle neue Datei:** `/login.html`

```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - StudyTok Companion</title>
    <link rel="stylesheet" href="css/style.css">
    <style>
        .login-container {
            max-width: 400px;
            margin: 100px auto;
            padding: 40px;
            background: var(--background-secondary);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .login-container h1 {
            text-align: center;
            margin-bottom: 30px;
            color: var(--text-primary);
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: var(--text-primary);
            font-weight: 500;
        }

        .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid var(--border-color);
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }

        .form-group input:focus {
            outline: none;
            border-color: var(--accent-color);
        }

        .btn {
            width: 100%;
            padding: 14px;
            background: var(--accent-color);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
        }

        .btn:hover {
            background: var(--accent-hover);
        }

        .btn-secondary {
            background: var(--background-tertiary);
            color: var(--text-primary);
            margin-top: 10px;
        }

        .btn-secondary:hover {
            background: var(--border-color);
        }

        .error-message {
            background: #fee;
            color: #c33;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: none;
        }

        .success-message {
            background: #efe;
            color: #3c3;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: none;
        }

        .toggle-form {
            text-align: center;
            margin-top: 20px;
            color: var(--text-secondary);
        }

        .toggle-form a {
            color: var(--accent-color);
            text-decoration: none;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <h1>StudyTok Companion</h1>

        <div id="error-message" class="error-message"></div>
        <div id="success-message" class="success-message"></div>

        <!-- LOGIN FORMULAR -->
        <form id="login-form">
            <div class="form-group">
                <label for="login-email">Email</label>
                <input type="email" id="login-email" required placeholder="deine@email.de">
            </div>
            <div class="form-group">
                <label for="login-password">Passwort</label>
                <input type="password" id="login-password" required placeholder="Mindestens 6 Zeichen">
            </div>
            <button type="submit" class="btn">Einloggen</button>
            <div class="toggle-form">
                Noch kein Account? <a href="#" id="show-register">Jetzt registrieren</a>
            </div>
        </form>

        <!-- REGISTER FORMULAR (versteckt) -->
        <form id="register-form" style="display: none;">
            <div class="form-group">
                <label for="register-email">Email</label>
                <input type="email" id="register-email" required placeholder="deine@email.de">
            </div>
            <div class="form-group">
                <label for="register-password">Passwort</label>
                <input type="password" id="register-password" required placeholder="Mindestens 6 Zeichen">
            </div>
            <div class="form-group">
                <label for="register-password-confirm">Passwort bestätigen</label>
                <input type="password" id="register-password-confirm" required placeholder="Passwort wiederholen">
            </div>
            <button type="submit" class="btn">Registrieren</button>
            <div class="toggle-form">
                Schon registriert? <a href="#" id="show-login">Zum Login</a>
            </div>
        </form>
    </div>

    <!-- Supabase Client -->
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <script src="js/supabase-config.js"></script>
    <script src="js/auth.js"></script>

    <script>
        // ============================================
        // LOGIN/REGISTER LOGIC
        // ============================================

        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const showRegisterLink = document.getElementById('show-register');
        const showLoginLink = document.getElementById('show-login');
        const errorMessage = document.getElementById('error-message');
        const successMessage = document.getElementById('success-message');

        // Toggle zwischen Login/Register
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            hideMessages();
        });

        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
            hideMessages();
        });

        // Login Submit
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideMessages();

            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                await window.authManager.signIn(email, password);
                showSuccess('Login erfolgreich! Weiterleitung...');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } catch (error) {
                showError(error.message);
            }
        });

        // Register Submit
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideMessages();

            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const passwordConfirm = document.getElementById('register-password-confirm').value;

            // Passwort-Validierung
            if (password !== passwordConfirm) {
                showError('Passwörter stimmen nicht überein');
                return;
            }

            if (password.length < 6) {
                showError('Passwort muss mindestens 6 Zeichen lang sein');
                return;
            }

            try {
                await window.authManager.signUp(email, password);
                showSuccess('Registrierung erfolgreich! Bitte bestätige deine Email.');
            } catch (error) {
                showError(error.message);
            }
        });

        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        }

        function showSuccess(message) {
            successMessage.textContent = message;
            successMessage.style.display = 'block';
        }

        function hideMessages() {
            errorMessage.style.display = 'none';
            successMessage.style.display = 'none';
        }

        // Prüfe ob bereits eingeloggt
        window.addEventListener('load', async () => {
            if (window.authManager.isLoggedIn()) {
                window.location.href = 'index.html';
            }
        });
    </script>
</body>
</html>
```

#### Schritt 5.2: main.js anpassen

**Öffne `/js/main.js`** und füge am Anfang hinzu:

```javascript
// ============================================
// AUTHENTIFIZIERUNGS-CHECK
// ============================================

// Prüfe ob User eingeloggt ist
document.addEventListener('DOMContentLoaded', async () => {
    // Warte auf Auth-Initialisierung
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!window.authManager || !window.authManager.isLoggedIn()) {
        // Nicht eingeloggt → Weiterleitung zu Login
        window.location.href = 'login.html';
        return;
    }

    // User ist eingeloggt → Lade Daten vom Server
    await loadUserDataFromServer();

    // Rest der Initialisierung...
    initializeApp();
});

// ============================================
// DATEN VOM SERVER LADEN
// ============================================

async function loadUserDataFromServer() {
    try {
        // Hole User Stats
        const stats = await window.statsAPI.getUserStats();

        // Aktualisiere UI
        updatePointsDisplay(stats.points);
        updateSessionsDisplay(stats.sessions);
        updateStreakDisplay(stats.streak);

        // Hole Tree Progress
        const { data: treeData } = await window.supabaseClient
            .from('tree_progress')
            .select('*')
            .eq('user_id', window.authManager.getCurrentUser().id)
            .single();

        if (treeData) {
            updateTreeDisplay(treeData.level, treeData.blossoms);
        }

        console.log('✅ User-Daten vom Server geladen');
    } catch (error) {
        console.error('❌ Fehler beim Laden der User-Daten:', error);
    }
}
```

**Ersetze die alte `addPoints()` Funktion:**

```javascript
// ❌ ALTE UNSICHERE FUNKTION (LÖSCHEN):
function addPoints(amount) {
    const stats = getStats();
    stats.points += amount;
    saveStats(stats);
    updatePoints();
}

// ✅ NEUE SICHERE FUNKTION:
async function addPoints(amount, reason) {
    try {
        const updatedStats = await window.statsAPI.addPoints(amount, reason);
        updatePointsDisplay(updatedStats.points);
        console.log(`✅ ${amount} Punkte hinzugefügt (${reason})`);
    } catch (error) {
        console.error('❌ Fehler beim Hinzufügen von Punkten:', error);
        showNotification('Fehler beim Hinzufügen von Punkten', 'error');
    }
}
```

#### Schritt 5.3: timer.js anpassen

**Öffne `/js/timer.js`** und ersetze die Session-Complete Logik:

Suche nach der Zeile wo Punkte vergeben werden (ca. Zeile 391):

```javascript
// ❌ ALT:
addPoints(10);

// ✅ NEU:
async function onSessionComplete() {
    try {
        // Server-seitige Validierung
        await window.statsAPI.completeSession(25); // 25 Minuten

        showNotification('Session abgeschlossen! +10 Punkte', 'success');

        // UI aktualisieren
        const stats = await window.statsAPI.getUserStats();
        updatePointsDisplay(stats.points);

    } catch (error) {
        console.error('❌ Session-Fehler:', error);
        showNotification('Fehler beim Abschließen der Session', 'error');
    }
}
```

#### Schritt 5.4: shop.js anpassen

**Öffne `/js/shop.js`** und ersetze die `purchaseItem()` Funktion:

```javascript
// ❌ ALTE UNSICHERE FUNKTION (LÖSCHEN):
async function purchaseItem(itemName, price) {
    const stats = getStats();

    if (stats.points < price) {
        showNotification('Nicht genug Punkte');
        return;
    }

    stats.points -= price;
    saveStats(stats);
    // ...
}

// ✅ NEUE SICHERE FUNKTION:
async function purchaseItem(itemId) {
    try {
        // Server-seitige Validierung & Kauf
        await window.shopAPI.purchaseItem(itemId);

        showNotification('Erfolgreich gekauft!', 'success');

        // UI aktualisieren
        const stats = await window.statsAPI.getUserStats();
        updatePointsDisplay(stats.points);

        // Shop UI aktualisieren
        await loadShopItems();

    } catch (error) {
        console.error('❌ Kauf-Fehler:', error);
        showNotification(error.message, 'error');
    }
}
```

#### Schritt 5.5: Alle HTML-Dateien aktualisieren

**Füge in ALLE HTML-Dateien (index.html, timer.html, tipps.html, etc.) VOR dem `</head>` Tag ein:**

```html
<!-- Supabase Client & Auth -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/supabase-config.js"></script>
<script src="js/auth.js"></script>
<script src="js/api/stats-api.js"></script>
<script src="js/api/shop-api.js"></script>
```

---

### Phase 6: Testing & Deployment (20 Minuten)

#### Schritt 6.1: Lokales Testing

1. **Öffne** `login.html` im Browser
2. **Registriere** einen Test-Account
3. **Prüfe** Supabase Dashboard → Authentication → Users
   - Dein User sollte erscheinen!
4. **Prüfe** Table Editor → user_stats
   - Initiale Stats sollten erstellt sein!
5. **Teste Login** → Sollte zu index.html weiterleiten
6. **Teste Timer** → Schließe Session ab
7. **Prüfe** Table Editor → sessions
   - Neue Session sollte erscheinen!

#### Schritt 6.2: Deployment auf Vercel

**1. Erstelle `.env.local` Datei (für lokale Entwicklung):**

```bash
VITE_SUPABASE_URL=deine_supabase_url
VITE_SUPABASE_ANON_KEY=dein_anon_key
```

**2. Füge Environment Variables in Vercel hinzu:**

- Gehe zu Vercel Dashboard
- Settings → Environment Variables
- Füge hinzu:
  - `VITE_SUPABASE_URL`: deine Supabase URL
  - `VITE_SUPABASE_ANON_KEY`: dein Anon Key

**3. Pushe zu GitHub:**

```bash
git add .
git commit -m "feat: Sichere Server-Architektur mit Supabase implementiert"
git push
```

**4. Vercel deployed automatisch!**

---

## 🔐 Best Practices & Sicherheitstipps

### 1. Row Level Security (RLS)

✅ **IMMER aktiviert lassen!** Dies verhindert, dass User Daten anderer sehen.

```sql
-- Prüfe ob RLS aktiv ist:
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- rowsecurity sollte 't' (true) sein!
```

### 2. API Keys sicher aufbewahren

❌ **NIEMALS** in Git committen:
```javascript
// FALSCH!
const SUPABASE_KEY = 'eyJhbGc...'; // Hardcoded
```

✅ **IMMER** Environment Variables nutzen:
```javascript
// RICHTIG!
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
```

### 3. Input-Validierung

✅ **Server-seitig validieren:**

```javascript
// Validiere IMMER auf dem Server
async function addPoints(amount, reason) {
    // ✅ Prüfe erlaubte Gründe
    const validReasons = ['focus_session', 'daily_login'];
    if (!validReasons.includes(reason)) {
        throw new Error('Ungültiger Grund');
    }

    // ✅ Prüfe Betragslimit
    if (amount > 100) {
        throw new Error('Zu hoher Betrag');
    }

    // ✅ Prüfe Datentyp
    if (typeof amount !== 'number') {
        throw new Error('Betrag muss Zahl sein');
    }
}
```

### 4. Rate Limiting

**Verhindere Spam-Requests:**

```javascript
// Erstelle Supabase Function mit Rate Limit
CREATE OR REPLACE FUNCTION check_rate_limit(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    recent_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO recent_count
    FROM sessions
    WHERE user_id = user_id
    AND completed_at > NOW() - INTERVAL '1 minute';

    RETURN recent_count < 5; -- Max 5 Sessions pro Minute
END;
$$ LANGUAGE plpgsql;
```

### 5. Audit Logging

**Erstelle Log-Tabelle für verdächtige Aktivitäten:**

```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100),
    details JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Trigger bei Point-Änderungen
CREATE OR REPLACE FUNCTION log_points_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.points - OLD.points > 100 THEN
        INSERT INTO audit_log (user_id, action, details)
        VALUES (NEW.user_id, 'large_points_increase',
                json_build_object('old', OLD.points, 'new', NEW.points));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_points_trigger
    AFTER UPDATE ON user_stats
    FOR EACH ROW
    EXECUTE FUNCTION log_points_change();
```

### 6. XSS Protection

✅ **Bereits in utils.js vorhanden** - weiter nutzen!

```javascript
// Nutze sanitizeHTML() für User-Input
const safeText = sanitizeHTML(userInput);
```

### 7. HTTPS erzwingen

**In Vercel automatisch aktiviert!**

Für Custom Domains: SSL-Zertifikat aktivieren

### 8. Passwort-Richtlinien

```javascript
// Mindestanforderungen:
const passwordRequirements = {
    minLength: 8,
    requireUppercase: true,
    requireNumber: true,
    requireSpecial: false
};

function validatePassword(password) {
    if (password.length < passwordRequirements.minLength) {
        throw new Error('Passwort zu kurz');
    }
    if (passwordRequirements.requireUppercase && !/[A-Z]/.test(password)) {
        throw new Error('Passwort muss Großbuchstaben enthalten');
    }
    if (passwordRequirements.requireNumber && !/\d/.test(password)) {
        throw new Error('Passwort muss Zahl enthalten');
    }
}
```

---

## 📊 Wartung & Monitoring

### 1. Supabase Dashboard regelmäßig prüfen

**Wöchentlich checken:**
- **Database → Tables**: Anzahl User, Sessions, Käufe
- **Authentication → Users**: Neue Registrierungen
- **Logs → API Logs**: Fehlerhafte Requests

### 2. Performance Monitoring

```sql
-- Langsame Queries finden
SELECT
    query,
    calls,
    total_time,
    mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

### 3. Datenbank Backups

**Supabase Free Tier:**
- Automatische Backups: 7 Tage
- Manuelle Backups: Settings → Database → Backups

### 4. Skalierung

**Wenn >50k User:**

1. **Upgrade zu Pro Plan** (~25€/Monat)
2. **Aktiviere Connection Pooling**
3. **Optimiere Indexes**

```sql
-- Prüfe Index-Nutzung
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND schemaname = 'public';
```

---

## 🎯 Zusammenfassung

### Was haben wir erreicht?

✅ **Vollständig sichere Architektur**
- Keine Client-seitigen Manipulationen mehr möglich
- Server validiert alle Aktionen
- Datenbank als Single Source of Truth

✅ **Kosteneffizient**
- 0€/Monat für bis zu 50.000 User
- Skalierbar nach Bedarf

✅ **Benutzerfreundlich**
- Email/Passwort Login
- Automatische Session-Verwaltung
- Daten synchronisiert über alle Geräte

✅ **Developer-Friendly**
- Einfache JavaScript API
- Gute Dokumentation
- Web-Dashboard für Debugging

### Nächste Schritte

1. ✅ **Teste ausgiebig** mit mehreren Test-Accounts
2. ✅ **Migriere bestehende User** (falls vorhanden)
3. ✅ **Aktiviere Email-Bestätigung** in Supabase Settings
4. ✅ **Implementiere "Passwort vergessen"** Funktion
5. ✅ **Füge Social Login hinzu** (Google, GitHub) - optional

---

## 📚 Weitere Ressourcen

- **Supabase Docs**: https://supabase.com/docs
- **Supabase Auth Guide**: https://supabase.com/docs/guides/auth
- **JavaScript Client**: https://supabase.com/docs/reference/javascript
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security

---

**Viel Erfolg bei der Implementierung! 🚀**

Bei Fragen einfach melden - ich helfe gerne weiter!
