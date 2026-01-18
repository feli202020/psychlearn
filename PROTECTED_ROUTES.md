# Geschützte Routen - Übersicht

## ✅ Vollständig geschützte Seiten (Login erforderlich)

### 1. `/lernziel/[slug]` - Quiz-Seiten
- **Datei:** `app/lernziel/[slug]/page.tsx` (Zeile 92-95)
- **Schutz:** Redirect zu `/login?redirect=/lernziel/{slug}`
- **Status:** ✅ Geschützt

### 2. `/daily-quiz` - Tägliches Quiz
- **Datei:** `app/daily-quiz/page.tsx` (Zeile 76-79)
- **Schutz:** Redirect zu `/login`
- **Status:** ✅ Geschützt

### 3. `/settings` - Einstellungen
- **Datei:** `app/settings/page.tsx` (Zeile 34-37)
- **Schutz:** Redirect zu `/login`
- **Status:** ✅ Geschützt

### 4. `/dashboard` - Dashboard
- **Datei:** `app/dashboard/page.tsx` (Zeile 27-29)
- **Schutz:** Zeigt Ladebildschirm für nicht-eingeloggte User
- **Status:** ✅ Geschützt

## 👀 Preview-Modus (Teilweise zugänglich)

### 1. `/explore` - Explore-Seite
- **Datei:** `app/explore/page.tsx`
- **Schutz:** Preview-Modus aktiviert
- **Nicht-eingeloggte User können sehen:**
  - ✅ Seitenleiste mit allen Modulen
  - ✅ Modultitel und Beschreibungen
  - ✅ Erste 150 Zeichen der Lerninhalte
  - ✅ Quiz-Titel und Beschreibungen
- **Nicht-eingeloggte User können NICHT:**
  - ❌ Vollständige Lerninhalte lesen
  - ❌ Quizzes starten
  - ❌ "Lerninhalt starten" Button nutzen
- **Status:** ✅ Preview-Modus aktiv

## 🔓 Öffentliche Seiten (Kein Login erforderlich)

### 1. `/` - Landing Page
- **Status:** Öffentlich

### 2. `/login` - Login-Seite
- **Features:**
  - ✅ Unterstützt `?redirect=/pfad` Parameter
  - ✅ Leitet nach Login zum ursprünglichen Ziel weiter
- **Status:** Öffentlich

### 3. `/register` - Registrierungsseite
- **Status:** Öffentlich

### 4. `/verify-email` - Email-Bestätigung
- **Status:** Öffentlich

### 5. `/forgot-password` - Passwort vergessen
- **Status:** Öffentlich

### 6. `/reset-password` - Passwort zurücksetzen
- **Status:** Öffentlich

## 🔒 Implementierungsdetails

### Redirect-Funktion
Wenn ein nicht-eingeloggter User versucht, eine geschützte Seite zu besuchen:
1. User wird zu `/login` weitergeleitet
2. URL-Parameter `?redirect=/ursprüngliche-seite` wird hinzugefügt
3. Nach erfolgreichem Login wird User zur ursprünglichen Seite weitergeleitet

**Beispiel:**
- User versucht: `/lernziel/schlaf`
- Wird weitergeleitet zu: `/login?redirect=/lernziel/schlaf`
- Nach Login landet User auf: `/lernziel/schlaf`

### Preview-Modus Features
- **Banner:** Prominenter Banner am Anfang der Seite
- **Teaser:** Erste 150 Zeichen der Lerninhalte sichtbar
- **Call-to-Actions:** Buttons zum Anmelden/Registrieren bei jedem gesperrten Feature
- **Visuelle Hinweise:** 🔒 Icons zeigen gesperrte Inhalte an

## 🎯 Best Practices

1. **Alle neuen geschützten Seiten** sollten diesen Check implementieren:
   ```typescript
   useEffect(() => {
     if (!user) {
       router.push('/login?redirect=' + window.location.pathname);
       return;
     }
   }, [user, router]);
   ```

2. **Preview-Modus** kann für weitere Seiten aktiviert werden durch:
   - Inhalte teaser-weise zeigen
   - Buttons deaktivieren mit 🔒 Icon
   - Call-to-Action Buttons zum Login/Registrieren
