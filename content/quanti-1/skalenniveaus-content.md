# Skalenniveaus und Messtheorie

## 1. Grundlagen der Messtheorie

### Was ist Messen?
**Messung** = Zuordnung von Zahlen zu Objekten, sodass **empirische Relationen** zwischen Objekten durch **numerische Relationen** repräsentiert werden.

### Die zwei Grundfragen der Messtheorie
1. **Existenzfrage (Repräsentationsproblem):** Kann eine strukturerhaltende Zuordnung überhaupt gefunden werden?
2. **Eindeutigkeitsfrage:** Wie beliebig ist diese Zuordnung? Welche Transformationen sind zulässig?

### Wichtige Relationseigenschaften
| Eigenschaft | Definition | Beispiel |
|-------------|------------|----------|
| **Reflexivität** | Für alle A gilt: A ~ A | Jeder ist gleich groß wie er selbst |
| **Symmetrie** | Wenn A ~ B, dann B ~ A | Wenn A äquivalent zu B, dann B äquivalent zu A |
| **Transitivität** | Wenn A ~ B und B ~ C, dann A ~ C | Wenn A > B und B > C, dann A > C |
| **Totalität** | Für alle A, B gilt: A > B oder B > A oder A = B | Je zwei Objekte sind vergleichbar |

---

## 2. Nominalskala

### Voraussetzung
Objekte sind **qualitativ unterscheidbar** (gleich oder verschieden).

### Repräsentation
**Äquivalenz** ↔ **Gleichheit von Zahlen**
- Gleiche Objekte → gleiche Zahl
- Verschiedene Objekte → verschiedene Zahlen

### Zulässige Transformationen
**Bijektive Abbildungen** (eindeutige Umbenennungen)
- Die Zahlen sind nur "Etiketten"
- Beispiel: männlich = 1, weiblich = 2 **oder** männlich = 99, weiblich = 7

### Beispiele
- Blutgruppe (A, B, AB, 0)
- Postleitzahlen
- Diagnose-Codes (ICD-10)
- Geschlecht
- Studienabbruch (ja/nein)

### Erlaubte Statistiken
- **Modus** (häufigster Wert)
- Häufigkeiten

### ⚠️ Probleme
- **Unterschiedsschwellen:** Minimal verschiedene Objekte werden als gleich eingestuft
- **Wechselnde Kriterien:** Kategorisierung hängt vom gewählten Kriterium ab
- **Mittelwert sinnlos:** x̄ = 1.5 oder x̄ = 11 je nach Codierung!

---

## 3. Ordinalskala

### Voraussetzung
Objekte sind **quantitativ unterscheidbar** und können in eine **Rangfolge** gebracht werden.

### Anforderungen an die Dominanzrelation
1. **Transitivität:** Wenn A > B und B > C, dann A > C
2. **Totalität:** Für je zwei Objekte gilt: A > B oder B > A oder A = B

### Repräsentation
**Dominanz/Präferenz** ↔ **Größer/Kleiner bei Zahlen**

### Zulässige Transformationen
**Streng monotone Transformationen**
- Reihenfolge bleibt erhalten
- Abstände dürfen sich ändern
- Beispiel: 1, 2, 3 → 10, 20, 50 ✓

### Beispiele
- Schulnoten (verbale Bewertungen)
- Härtegrade (Mohs-Skala)
- Präferenzurteile
- Platzierungen im Wettkampf

### Erlaubte Statistiken
- **Median** (mittlerer Rang)
- Modus
- Perzentile

### ⚠️ Problem: Intransitive Präferenzen
Beispiel (Filmvergleiche):
- Titanic > Star Wars (bessere Geschichte)
- Star Wars > Blade Runner (bessere Geschichte)
- Blade Runner > Titanic (wegen Leonardo DiCaprio)

→ **Transitivität verletzt** durch Kriterienwechsel!

---

## 4. Intervallskala (Metrische Skala)

### Voraussetzung
**Unterschiede** zwischen Objekten sind quantitativ vergleichbar.

### Repräsentation
**Ausmaß von Unterschieden** ↔ **Größe von Differenzen**

### Zulässige Transformationen
**Positive lineare Transformationen:** y = ax + b (mit a > 0)
- Differenzenverhältnisse bleiben erhalten: (A-B)/(C-D) = const.
- Beispiel: Celsius ↔ Fahrenheit: F = 1.8 · C + 32

### Beispiele
- Temperatur (Celsius, Fahrenheit)
- IQ-Werte
- Kalenderjahr
- Standardisierte Testwerte

### Erlaubte Statistiken
- **Arithmetisches Mittel**
- Standardabweichung
- Korrelation
- t-Test

### ⚠️ Wichtig: Keine Verhältnisse!
"10°C ist doppelt so warm wie 5°C" ist **falsch**!
- In Fahrenheit: 50°F vs. 41°F → Verhältnis ≠ 2:1
- Nur **Differenzen** sind bedeutsam, nicht Verhältnisse

---

## 5. Verhältnisskala (kurz)

### Zusätzlich zur Intervallskala
**Absoluter Nullpunkt** vorhanden (0 = Abwesenheit des Merkmals)

### Zulässige Transformationen
**Ähnlichkeitstransformationen:** y = ax (mit a > 0)

### Beispiele
- Gewicht, Länge, Zeit
- Kelvin-Temperatur
- Reaktionszeiten (als Zeitmaß)

### Bedeutsame Aussagen
"Person A ist doppelt so schwer wie Person B" ✓

---

## 6. Überblick: Skalenniveaus

| Skala | Repräsentiert | Zulässige Transformation | Statistiken |
|-------|---------------|-------------------------|-------------|
| **Nominal** | Gleichheit | Bijektive Abb. | Modus |
| **Ordinal** | Rangordnung | Monotone | Median |
| **Intervall** | Differenzen | Lineare | Mittelwert, SD |
| **Verhältnis** | Verhältnisse | Ähnlichkeit | Alle |

---

## 7. Bedeutsamkeit von Aussagen

Eine statistische Aussage ist **bedeutsam**, wenn sie unter allen zulässigen Transformationen **invariant** bleibt.

### Beispiel: Mittelwert bei Nominalskala
- Codierung 1: männlich = 1, weiblich = 2 → x̄ = 1.5
- Codierung 2: männlich = 2, weiblich = 20 → x̄ = 11

→ Verschiedene "Mittelwerte" für identische Daten = **nicht bedeutsam!**

---

## 8. Conjoint Measurement

### Problem
Bei psychologischen Merkmalen fehlt eine **empirische Vereinigungsoperation** (man kann Intelligenz nicht auf eine Waage legen).

### Lösung
Verwende Objekte mit **zwei Eigenschaften**:
- Person (Fähigkeit) × Aufgabe (Schwierigkeit) → Lösungswahrscheinlichkeit

### Prinzip
Wenn bestimmte **Ordnungsaxiome** erfüllt sind (z.B. Thomsen-Bedingung), kann man beiden Eigenschaften separate **Intervallskalen** zuweisen.

### Formell
P(A,1) > P(B,2) ↔ f(A) + g(1) > f(B) + g(2)

→ Bis auf Lineartransformation eindeutige Zuweisung möglich!

---

## 9. Praxisfragen

### Welches Skalenniveau haben Schulnoten?
**Bestenfalls ordinal!**
- Rangordnung: 1.0 besser als 2.0 ✓
- Gleiche Abstände: Ist 1.0→2.0 = 3.0→4.0? ✗ (nicht nachweisbar)
- Keine Vereinigungsoperation: "Note 1 + Note 3 = 2 × Note 2" ist sinnlos

### Reaktionszeiten als Konstruktmaß
- **Zeit selbst:** Verhältnisskaliert (absoluter Nullpunkt)
- **Konstrukt (z.B. Konzentration):** Unklar! Die Beziehung RT ↔ Konzentration muss nicht linear sein.

### Likert-Skalen
- **Formal:** Ordinal (Abstände nicht gesichert)
- **Praxis:** Oft als quasi-intervallskaliert behandelt
- **Problem:** Sind psychologische Abstände zwischen Kategorien wirklich gleich?

---

## Zusammenfassung

1. **Messung** = Strukturerhaltende Zuordnung von Zahlen zu Objekten
2. **Skalenniveau** bestimmt, welche Operationen **bedeutsam** (transformationsinvariant) sind
3. **Nominal:** Nur Gleichheit/Verschiedenheit → Modus
4. **Ordinal:** Rangordnung → Median
5. **Intervall:** Differenzen vergleichbar → Mittelwert, aber keine Verhältnisse!
6. **Verhältnis:** Absoluter Nullpunkt → Alle Operationen erlaubt
7. **Conjoint Measurement** ermöglicht Intervallskalierung ohne physische Vereinigungsoperation
