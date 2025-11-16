# 🌸 StudyTok Companion - Design Mockup

## Übersicht

Dieses Design-Mockup zeigt das vollständige Konzept für deine StudyTok Companion Website mit allen gewünschten Features.

## 🎨 Design-Highlights

### **Farbschema: Kirschblüten-Theme**
- **Primary:** Soft Pink (#FFB7C5) - Kirschblüten
- **Secondary:** Mint Green (#B8E6D5) - Frische/Konzentration
- **Accent:** Lavender (#D4B5F1) - Kreativität
- **Background:** Off-White (#F8F9FA)

### **Design-Stil**
- Modern & verspielt für Gen Z (15-24 Jahre)
- Gamifiziert mit Punktesystem und Achievements
- Sanfte Animationen (Kirschblütenbaum wächst, fallende Blütenblätter)
- Mobile-first & responsive

---

## 📄 Erstellte Seiten

### 1. **index.html** - Homepage/Dashboard
**Features:**
- Hero-Section mit animiertem Kirschblütenbaum
- Tägliche Stats (Pomodoro Sessions, Fokuszeit, Streak, Achievements)
- Quick-Action Buttons (Timer starten, Tipp des Tages)
- Feature-Cards (Generator, Lernplan, Musik)
- TikTok Video-Preview Grid
- Punkteanzeige in Navigation

**Highlights:**
- Wachsender SVG-Kirschblütenbaum mit Animationen
- Gradient-Text für visuelle Akzente
- Hover-Effekte auf allen Cards

### 2. **timer.html** - Pomodoro Timer
**Features:**
- Großer animierter Countdown mit Fortschrittsring
- 3 Modi: Fokus (25min), Kurze Pause (5min), Lange Pause (15min)
- Live Kirschblütenbaum der mit jeder Session wächst
- Session-Stats (Heute, Minuten, Streak)
- Settings (Auto-start, Sound, Notifications)
- Achievements-Section
- Tree-Leveling System (5 Sessions = neuer Ast)

**Highlights:**
- SVG-Baum wächst mit jedem Pomodoro
- Blüten erscheinen animiert
- Fallende Blütenblätter-Animation
- Progress-Ring mit Gradient

### 3. **tipps.html** - Lerntipps-Bibliothek
**Features:**
- Zufälliger Lerntipp-Generator mit Flip-Animation
- Filter nach Kategorie, Fach, Schwierigkeit
- Suchfunktion
- Grid/Listen-Ansicht Toggle
- 8+ Video-Cards mit TikTok-Style
- Favoriten-System
- Video-Badges (NEU, BELIEBT, VERRÜCKT)

**Highlights:**
- TikTok-ähnliche Video-Thumbnails (9:16 Format)
- Hover-Overlay mit Play-Button
- Meta-Tags für Kategorisierung
- Favoriten speichern in LocalStorage

---

## 💻 Technische Features

### **JavaScript-Funktionalität**

#### **main.js** (Homepage)
- Stats aus LocalStorage laden/speichern
- Punktesystem-Verwaltung
- Baum-Animationen
- Notification-System

#### **timer.js** (Pomodoro Timer)
- Vollständiger Pomodoro Timer mit Play/Pause/Reset
- Modi-Wechsel (Focus/Short Break/Long Break)
- LocalStorage für Timer-State
- Baum-Wachstum-System mit Levels
- SVG-Blüten dynamisch rendern
- Sound-Benachrichtigungen (Web Audio API)
- Auto-start für Pausen

#### **tipps.js** (Lerntipps)
- Zufalls-Tipp-Generator
- Filter-System (Kategorie, Fach, Schwierigkeit, Suche)
- Grid/Listen-Ansicht umschalten
- Favoriten-System mit LocalStorage
- Punkte beim Video ansehen

### **CSS-Features**
- Custom Properties (CSS Variables)
- Gradient Backgrounds & Buttons
- Smooth Animations (float, pulse, fall, bloom)
- Box-Shadows für Tiefe
- Responsive Breakpoints (480px, 768px, 1024px)
- SVG-Animationen (stroke-dasharray für Wachstum)

---

## 🎯 Implementierte Features aus deiner Liste

✅ **Pomodoro Timer**
- 25/5/15 Minuten Modi
- Visueller Fortschrittsring
- Sound-Benachrichtigungen
- +10 Punkte pro Session

✅ **Konzentrationsbaum (Kirschblütenbaum)**
- Wächst mit jeder Pomodoro-Session
- 5 Blüten = neuer Ast/Level
- Fallende Blütenblätter-Animation
- Level-System (1-3 implementiert)

✅ **Punktesystem**
- Punkte für Pomodoro-Sessions (+10)
- Punkte für Tipps anschauen (+2)
- Punkte für Tipp-Generator (+2)
- Persistent in LocalStorage

✅ **Lerntippsbibliothek**
- TikTok-Video-Grid mit Thumbnails
- Placeholder für echte Videos
- Filter und Suche
- 8 Beispiel-Videos

✅ **Lerntippgenerator**
- Zufälliger Tipp aus 10 Tipps
- Flip-Animation
- Kategorien und Schwierigkeit
- Integration in Bibliothek

❌ **Noch nicht implementiert:**
- Konzentrationsmusiksammlung (Seite musik.html)
- Lernplangenerator (Seite plan.html)

---

## 🚀 Wie du das Mockup ansiehst

### **Option 1: Lokal öffnen**
1. Öffne `index.html` direkt im Browser
2. Navigiere durch die Seiten über die Navigation

### **Option 2: Mit Live Server**
```bash
# Wenn du Python installiert hast:
python -m http.server 8000

# Dann öffne: http://localhost:8000
```

### **Option 3: VS Code Live Server**
1. Installiere "Live Server" Extension
2. Rechtsklick auf index.html
3. "Open with Live Server"

---

## 🎨 Design-Anpassungen

### **Farben ändern**
Öffne `css/style.css` und bearbeite die CSS Variables:

```css
:root {
    --primary: #FFB7C5;      /* Deine Hauptfarbe */
    --secondary: #B8E6D5;    /* Sekundärfarbe */
    --accent: #D4B5F1;       /* Akzentfarbe */
}
```

### **Fonts ändern**
Im `<head>` der HTML-Dateien:
```html
<link href="https://fonts.googleapis.com/css2?family=DeinFont:wght@300;400;600;700&display=swap" rel="stylesheet">
```

Dann in CSS:
```css
--font-primary: 'DeinFont', sans-serif;
```

---

## 📱 Responsive Design

Die Website ist vollständig responsive:
- **Desktop:** Grid-Layout, alle Features sichtbar
- **Tablet:** 2-Spalten Grid
- **Mobile:** 1-Spalte, vereinfachte Navigation

---

## 🎮 Gamification-Elemente

1. **Punktesystem:** Sammle Punkte durch Aktivitäten
2. **Streak-System:** Tägliches Einloggen erhöht Streak
3. **Achievements:** Freigeschaltet bei Meilensteinen
4. **Baum-Leveling:** Visueller Fortschritt
5. **Badges:** NEU, BELIEBT, VERRÜCKT auf Videos

---

## 📦 Datei-Struktur

```
20k_follower_website/
├── index.html              # Homepage/Dashboard
├── timer.html              # Pomodoro Timer
├── tipps.html              # Lerntipps-Bibliothek
├── css/
│   ├── style.css           # Haupt-Styling
│   ├── timer.css           # Timer-spezifisch
│   └── tipps.css           # Tipps-spezifisch
├── js/
│   ├── main.js             # Homepage-Logik
│   ├── timer.js            # Timer-Logik
│   └── tipps.js            # Tipps-Logik
└── assets/
    └── images/             # (Für zukünftige Bilder)
```

---

## 🔮 Nächste Schritte (für Vollversion)

1. **Musik-Seite erstellen** (musik.html)
   - Spotify/YouTube Playlists einbetten
   - Kategorien: Lofi, Klassik, Naturgeräusche, Binaural Beats

2. **Lernplan-Generator** (plan.html)
   - Formular für Prüfungsdatum, Fach, verfügbare Zeit
   - Algorithmus für personalisierten Plan
   - Kalender-Visualisierung

3. **Echte TikTok-Videos einbinden**
   - TikTok Embed-Code verwenden
   - Oder Videos auf YouTube hochladen

4. **Backend (Optional)**
   - User-Accounts mit Firebase
   - Cloud-Speicherung von Fortschritt
   - Social Features (Freunde, Challenges)

5. **PWA (Progressive Web App)**
   - Offline-Funktionalität
   - Install-Prompt
   - Push-Benachrichtigungen

---

## 💡 Tipps für die Weiterentwicklung

- **Teste auf echten Geräten** (iPhone, Android)
- **Sammle Feedback** von deiner TikTok-Community
- **A/B-Testing** für verschiedene Features
- **Analytics** einbauen (Google Analytics, Plausible)
- **Accessibility** verbessern (ARIA-Labels, Keyboard-Navigation)

---

## 📞 Support

Falls du Fragen hast oder Anpassungen brauchst:
- Öffne eine Issue auf GitHub
- Oder kontaktiere mich direkt

**Viel Erfolg mit deiner StudyTok Companion Website! 🌸📚**
