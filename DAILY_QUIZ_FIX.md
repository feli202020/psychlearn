# Daily Quiz Fehler-Behebung

## Problem
Nach dem Abschluss eines Quiz kam die Fehlermeldung:
```
Fehler beim Speichern: Keine Quiz-Session für heute gefunden
```

## Ursachen

### 1. Datenbankschema-Problem
In der ursprünglichen Migration war `quiz_date` in der `daily_quiz_sessions`-Tabelle als `UNIQUE` definiert. Das bedeutete, dass nur eine Session pro Datum existieren konnte, unabhängig vom Semester. Wenn also Semester 1 eine Session für heute hatte, konnte Semester 2 keine erstellen.

**Behebung**: Der UNIQUE-Constraint wurde auf die Kombination `(quiz_date, semester)` geändert.

### 2. Race Condition beim Session-Insert
Beim Erstellen einer neuen Quiz-Session wurde keine Fehlerbehandlung implementiert. Wenn zwei Benutzer gleichzeitig das Quiz starteten, konnte der zweite Insert fehlschlagen.

**Behebung**: Fehlerbehandlung wurde hinzugefügt, die bei einem Insert-Fehler versucht, die Session erneut zu laden.

### 3. Zeitübergreifendes Quiz (Hauptproblem)
Das kritischste Problem: Das Quiz-Datum wurde bei jedem API-Call neu berechnet mit `getCurrentQuizDate()`. Diese Funktion berechnet das Datum basierend auf der deutschen Zeit mit einem Wechsel um 4:00 Uhr morgens.

**Szenario**:
1. Benutzer startet Quiz um 03:50 Uhr → Quiz-Datum ist "2026-01-18"
2. Session wird mit Datum "2026-01-18" erstellt
3. Benutzer beendet Quiz um 04:05 Uhr → Quiz-Datum ist jetzt "2026-01-19"
4. Submit-Endpunkt sucht nach Session mit Datum "2026-01-19" → **Nicht gefunden!**

**Behebung**:
- Das Quiz-Datum wird beim Laden der Fragen im State gespeichert
- Beim Submit wird dieses gespeicherte Datum an den Server gesendet
- Der Server verwendet das Client-Datum statt ein neues zu berechnen

## Geänderte Dateien

### 1. `supabase_daily_quiz_migration.sql`
```sql
-- Vorher
quiz_date DATE NOT NULL UNIQUE,

-- Nachher
quiz_date DATE NOT NULL,
...
UNIQUE(quiz_date, semester)
```

### 2. `app/api/daily-quiz/questions/route.ts`
- Fehlerbehandlung beim Session-Insert hinzugefügt
- Bei Insert-Fehler wird versucht, die Session erneut zu laden (Race Condition)

### 3. `app/daily-quiz/page.tsx`
- Neuer State: `quizDate` speichert das Quiz-Datum für die aktuelle Session
- Quiz-Datum wird beim Laden der Fragen gespeichert
- Quiz-Datum wird beim Submit an den Server gesendet

### 4. `app/api/daily-quiz/submit/route.ts`
- Akzeptiert `quizDate` vom Client
- Verwendet das Client-Datum statt `getCurrentQuizDate()` zu rufen

## Migration durchführen

Um die Datenbank zu aktualisieren, führe folgende SQL-Befehle in Supabase aus:

```sql
-- 1. Entferne den alten UNIQUE Constraint
ALTER TABLE daily_quiz_sessions DROP CONSTRAINT IF EXISTS daily_quiz_sessions_quiz_date_key;

-- 2. Füge den neuen UNIQUE Constraint hinzu
ALTER TABLE daily_quiz_sessions ADD CONSTRAINT daily_quiz_sessions_quiz_date_semester_key UNIQUE(quiz_date, semester);
```

## Testing

Teste folgende Szenarien:
1. ✅ Quiz normal durchführen (vor 4:00 Uhr starten und beenden)
2. ✅ Quiz über 4:00 Uhr hinaus (vor 4:00 starten, nach 4:00 beenden)
3. ✅ Mehrere Semester gleichzeitig (Semester 1 und 2 am selben Tag)
4. ✅ Mehrere Benutzer starten gleichzeitig das Quiz (Race Condition)

## Zusätzliche Verbesserungen

Optional könntest du noch:
- Ein Timeout-Warning im Frontend anzeigen, wenn das Quiz zu lange dauert
- Session-Validierung beim Submit hinzufügen (prüfen, ob die Session nicht zu alt ist)
- Logging verbessern für besseres Debugging
