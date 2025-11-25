# 📱 PWA Setup Anleitung

## Was ist implementiert?

✅ Service Worker für Offline-Funktionalität
✅ Web App Manifest (manifest.json)
✅ Auto-Update-Benachrichtigungen
✅ Caching-Strategien (Cache-First, Network-First)

## 📋 Noch zu erledigen

### **Icons erstellen**

Die App benötigt Icons in verschiedenen Größen. Nutze ein bestehendes Bild (z.B. `image/cherry_petal.svg` oder erstelle ein neues Logo).

**Mit ImageMagick (empfohlen):**

```bash
# Installieren (falls nicht vorhanden)
# macOS: brew install imagemagick
# Ubuntu: sudo apt-get install imagemagick

# Von SVG oder PNG zu allen Größen
convert image/cherry_petal.svg -resize 72x72 image/icon-72.png
convert image/cherry_petal.svg -resize 96x96 image/icon-96.png
convert image/cherry_petal.svg -resize 128x128 image/icon-128.png
convert image/cherry_petal.svg -resize 144x144 image/icon-144.png
convert image/cherry_petal.svg -resize 152x152 image/icon-152.png
convert image/cherry_petal.svg -resize 192x192 image/icon-192.png
convert image/cherry_petal.svg -resize 384x384 image/icon-384.png
convert image/cherry_petal.svg -resize 512x512 image/icon-512.png
```

**Online (einfacher):**

1. Gehe zu https://realfavicongenerator.net/
2. Lade dein Logo hoch
3. Lade alle generierten Icons herunter
4. Verschiebe sie nach `/image/`

### **Screenshots erstellen (optional):**

Screenshots verbessern die Installation-Experience:

```bash
# Mach Screenshots der App in 1280x720
# Speichere sie als:
image/screenshot-1.png  # Timer-Seite
image/screenshot-2.png  # Tipps-Seite
```

### **Shortcuts Icons (optional):**

```bash
# Erstelle kleinere Icons für Shortcuts
convert image/1.png -resize 192x192 image/shortcut-timer.png
convert image/cherry_petal.svg -resize 192x192 image/shortcut-tips.png
# etc.
```

---

## 🧪 Testen der PWA

### **1. Lokal testen:**

```bash
# Starte lokalen Server
python3 -m http.server 8000

# Öffne http://localhost:8000
```

### **2. Service Worker prüfen:**

1. Öffne Chrome DevTools (F12)
2. Gehe zu "Application" → "Service Workers"
3. Sollte "studytok-v1.0.0" zeigen

### **3. Offline-Test:**

1. Öffne die App
2. DevTools → Network → "Offline" aktivieren
3. Seite neu laden
4. ✅ Sollte weiterhin funktionieren!

### **4. Installation testen:**

**Desktop (Chrome):**
- In der Adressleiste erscheint ein ⊕ Install-Icon
- Klicken → App wird installiert

**Mobile (Chrome Android):**
- "Zum Startbildschirm hinzufügen"
- App öffnet sich wie native App

---

## 📊 PWA Checkliste

| Feature | Status | Beschreibung |
|---------|--------|--------------|
| ✅ Service Worker | Implementiert | Offline-Funktionalität |
| ✅ Manifest | Implementiert | App-Metadaten |
| ✅ HTTPS | GitHub Pages | Erforderlich für PWA |
| ⏳ Icons | Todo | Verschiedene Größen |
| ⏳ Screenshots | Optional | Für bessere UX |
| ✅ Theme Color | Implementiert | #667eea |
| ✅ Responsive | Vorhanden | Mobile-friendly |
| ✅ Caching | Implementiert | Smart caching |

---

## 🚀 Features der PWA

### **Offline-Funktionalität:**
- Alle Seiten funktionieren offline
- Bilder werden gecacht
- CSS/JS werden gecacht
- Smart Caching mit Stale-While-Revalidate

### **Install-Prompt:**
- Browser zeigt "Installieren"-Prompt
- App kann auf Desktop/Homescreen hinzugefügt werden

### **Auto-Updates:**
- Neue Versionen werden automatisch erkannt
- User bekommt Notification mit "Jetzt aktualisieren"-Button

### **Shortcuts:**
```json
{
  "shortcuts": [
    { "name": "Pomodoro Timer", "url": "/timer.html" },
    { "name": "Lerntipps", "url": "/tipps.html" },
    { "name": "Lernplan", "url": "/plan.html" }
  ]
}
```

User können direkt zu bestimmten Seiten springen (long-press auf App-Icon).

---

## 🔧 Troubleshooting

### **Service Worker registriert sich nicht:**

```javascript
// In Browser Console prüfen:
navigator.serviceWorker.getRegistrations()
  .then(registrations => console.log(registrations));
```

### **Manifest wird nicht erkannt:**

1. Prüfe Browser Console auf Fehler
2. Validierer nutzen: https://manifest-validator.appspot.com/
3. Prüfe dass manifest.json mit `Content-Type: application/json` ausgeliefert wird

### **Icons werden nicht angezeigt:**

1. Prüfe dass alle Icon-Pfade korrekt sind
2. Icons müssen PNG sein (nicht SVG für alle Größen)
3. Prüfe Browser Console auf 404-Fehler

---

## 📱 Deployment auf GitHub Pages

```bash
# Alle Icons erstellt?
ls image/icon-*.png

# Committe alles
git add manifest.json image/icon-*.png PWA_SETUP.md
git commit -m "feat: Add PWA support with manifest and icons"
git push

# GitHub Pages deployt automatisch
# PWA-Features sind jetzt live!
```

---

## 🎉 Fertig!

Sobald Icons erstellt sind, ist die PWA komplett funktionsfähig!

**Test-URL (nach Deployment):**
https://yoursite.com

**Lighthouse Score prüfen:**
- Chrome DevTools → Lighthouse
- "Progressive Web App" auswählen
- ✅ Sollte 100/100 erreichen!

---

**Fragen?** Öffne ein Issue im Repo.
