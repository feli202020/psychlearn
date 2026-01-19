# Daily Quiz Setup - Anleitung

Das Daily Quiz System wurde erfolgreich implementiert! Hier ist eine Anleitung zur Einrichtung:

## 1. Datenbank Migration ausführen

Öffne den Supabase SQL Editor und führe die Datei `supabase_daily_quiz_migration.sql` aus.

Diese Migration erstellt:
- `daily_quiz_sessions` Tabelle - Speichert die täglichen Quiz-Sessions mit festen Fragen
- `daily_quiz_results` Tabelle - Speichert die Ergebnisse der Benutzer
- `username` Spalte in `user_profiles` - Für die öffentliche Anzeige im Leaderboard
- Row Level Security (RLS) Policies für sichere Zugriffe

## 2. Benutzernamen vergeben

Damit Benutzer im Leaderboard angezeigt werden können, muss jeder Benutzer einen `username` haben.

Du kannst dies entweder:

### Option A: Manuell in Supabase

```sql
-- Für jeden Benutzer einzeln
UPDATE user_profiles
SET username = 'gewünschter_benutzername'
WHERE id = 'USER_ID';

-- Oder automatisch aus E-Mail generieren
UPDATE user_profiles
SET username = SPLIT_PART(email, '@', 1)
FROM auth.users
WHERE user_profiles.id = auth.users.id
AND user_profiles.username IS NULL;
```

### Option B: Automatisch beim ersten Login

Eine Username-Eingabe-Komponente könnte beim ersten Quiz-Start angezeigt werden, wenn `username` noch nicht gesetzt ist.

## 3. Wie das System funktioniert

### Quiz-Zeitplan
- Ein "Quiz-Tag" läuft von **04:00 Uhr morgens bis 03:59 Uhr am nächsten Tag** (deutsche Zeit)
- Alle Benutzer bekommen die **gleichen Fragen** für den gleichen Tag
- Die Fragen werden **deterministisch generiert** (Seed-basiert), sodass sie für alle gleich sind

### Ablauf
1. Um 04:00 Uhr startet ein neuer Quiz-Tag
2. Beim ersten Benutzer wird automatisch eine neue `daily_quiz_session` erstellt
3. Alle weiteren Benutzer bekommen die gleiche Session
4. Jeder Benutzer kann das Quiz **nur einmal** pro Tag absolvieren
5. Nach Abschluss wird das Ergebnis in `daily_quiz_results` gespeichert
6. Die Rangliste zeigt alle Teilnehmer des Tages sortiert nach Punkten

### Punktesystem
- **Vollständig richtige Antwort**: 1 Punkt (zählt für Score)
- **Teilweise richtige Antwort**: Punkte = richtige - falsche Antworten (mindestens 0)
- **Falsche Antwort**: 0 Punkte
- **Rangliste sortiert nach**: `total_points` (Gesamtpunkte), dann nach Zeit

## 4. API Endpunkte

### GET /api/daily-quiz/questions?semester=1
Gibt die täglichen Quiz-Fragen zurück (gleich für alle Benutzer)

### POST /api/daily-quiz/submit
Speichert das Quiz-Ergebnis
```json
{
  "semester": 1,
  "score": 15,
  "totalPoints": 18
}
```

### GET /api/daily-quiz/leaderboard?semester=1
Gibt die Rangliste für den aktuellen Tag zurück

## 5. Verbesserungen

### ✅ Implementiert
- Quiz ist für alle Accounts gleich
- Nur einmal pro Tag durchführbar
- Fragen refreshen nicht mehr beim Tab-Wechsel (Server-basiert)
- Quiz läuft von 04:00 - 03:59 Uhr deutsche Zeit
- Motivierendere Texte bei schlechteren Ergebnissen
- Daily Rangliste mit nur Benutzernamen

### 🎯 Neue Features
- Alle Benutzer sehen die gleichen Fragen
- Seed-basierte Randomisierung für konsistente Ergebnisse
- Leaderboard mit Rankings und Medaillen (🥇🥈🥉)
- Bessere Gamification ohne "Bestanden/Nicht bestanden"

## 6. Troubleshooting

### Problem: Benutzer erscheinen nicht im Leaderboard
**Lösung**: Stelle sicher, dass alle Benutzer einen `username` in `user_profiles` haben.

### Problem: Quiz ist nicht verfügbar
**Prüfe**:
1. Sind die Datenbank-Tabellen erstellt?
2. Gibt es Fragen für das entsprechende Semester in der Datenbank?
3. Sind die RLS Policies aktiv?

### Problem: Fragen sind unterschiedlich für verschiedene Benutzer
**Ursache**: Das sollte nicht passieren, da der Seed auf Datum + Semester basiert.
**Prüfe**: Ob alle Benutzer das gleiche Semester ausgewählt haben und die Zeit korrekt ist.

## 7. Zukünftige Erweiterungen (Optional)

- **Wöchentliche/Monatliche Ranglisten**: Längerfristige Leaderboards
- **Streak-System**: Belohnungen für tägliche Teilnahme
- **Achievements**: Badges für besondere Leistungen
- **Quiz-Statistiken**: Persönliche Fortschrittsanzeige
- **Username-Editor**: Benutzer können ihren Anzeigenamen ändern
