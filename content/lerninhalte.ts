// Statische Lerninhalte für alle Module
// Du kannst den Text hier manuell bearbeiten

export interface LerninhaltItem {
  id: string;
  titel: string;
  beschreibung: string; // Kurzbeschreibung (ca. 10-15 Wörter)
  kategorie: string; // Thematische Kategorie (z.B. "Statistik", "Messtheorie")
  inhalt: string;
  reihenfolge: number;
  geschaetzte_dauer: number; // Bearbeitungszeit in Minuten
  quizSlug?: string; // Verknüpfung zum zugehörigen Quiz/Lernziel
}

export interface ModulLerninhalte {
  modulId: string;
  modulName: string;
  semester: number[];
  inhalte: LerninhaltItem[];
}

// ============================================================================
// SEMESTER 1
// ============================================================================

// Forschungsmethoden der Psychologie
export const forschungsmethoden: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000100',
  modulName: 'Forschungsmethoden der Psychologie',
  semester: [1],
  inhalte: []
};

// Quantitative Methoden I
export const quantitativeMethodenI: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000101',
  modulName: 'Quantitative Methoden I',
  semester: [1],
  inhalte: [
    {
      id: 'qm1-skalenniveaus',
      titel: 'Skalenniveaus und Messtheorie',
      beschreibung: 'Lerne die vier Skalenniveaus kennen und verstehe ihre zulässigen Transformationen und Statistiken.',
      kategorie: 'Messtheorie',
      inhalt: `## Was ist Messen?

**Messung** = Zuordnung von Zahlen zu Objekten, sodass **empirische Relationen** durch **numerische Relationen** repräsentiert werden.

### Die zwei Grundfragen der Messtheorie
1. **Existenzfrage:** Kann eine strukturerhaltende Zuordnung gefunden werden?
2. **Eindeutigkeitsfrage:** Wie beliebig ist diese Zuordnung? Welche Transformationen sind zulässig?

### Wichtige Relationseigenschaften
| Eigenschaft | Definition |
|-------------|------------|
| **Reflexivität** | Für alle A gilt: A ~ A |
| **Symmetrie** | Wenn A ~ B, dann B ~ A |
| **Transitivität** | Wenn A ~ B und B ~ C, dann A ~ C |
| **Totalität** | Für alle A, B: A > B oder B > A oder A = B |

---

## Nominalskala

**Voraussetzung:** Objekte sind qualitativ unterscheidbar (gleich/verschieden).

**Zulässige Transformationen:** Bijektive Abbildungen (eindeutige Umbenennungen)
- Die Zahlen sind nur "Etiketten"
- Beispiel: männlich = 1, weiblich = 2 **oder** männlich = 99, weiblich = 7

**Beispiele:** Blutgruppe, Postleitzahlen, ICD-10 Codes, Geschlecht

**Erlaubte Statistiken:** Modus, Häufigkeiten

**Problem Mittelwert:**
- Codierung 1: männlich = 1, weiblich = 2 → x̄ = 1.5
- Codierung 2: männlich = 2, weiblich = 20 → x̄ = 11
→ Verschiedene "Mittelwerte" für identische Daten!

---

## Ordinalskala

**Voraussetzung:** Objekte können in eine **Rangfolge** gebracht werden.

**Anforderungen:**
1. Transitivität: Wenn A > B und B > C, dann A > C
2. Totalität: Je zwei Objekte sind vergleichbar

**Zulässige Transformationen:** Streng monotone Transformationen
- Reihenfolge bleibt erhalten, Abstände dürfen sich ändern
- Beispiel: 1, 2, 3 → 10, 20, 50 ✓

**Beispiele:** Schulnoten (verbal), Härtegrade, Platzierungen

**Erlaubte Statistiken:** Median, Modus, Perzentile

**Problem - Intransitive Präferenzen:**
- Film A > Film B (bessere Geschichte)
- Film B > Film C (bessere Geschichte)
- Film C > Film A (besserer Hauptdarsteller)
→ Transitivität verletzt durch Kriterienwechsel!

---

## Intervallskala

**Voraussetzung:** Unterschiede zwischen Objekten sind quantitativ vergleichbar.

**Zulässige Transformationen:** Positive lineare Transformationen: y = ax + b (a > 0)
- Differenzenverhältnisse bleiben erhalten
- Beispiel: Celsius ↔ Fahrenheit: F = 1.8 · C + 32

**Beispiele:** Temperatur (°C, °F), IQ-Werte, Kalenderjahr

**Erlaubte Statistiken:** Arithmetisches Mittel, Standardabweichung, Korrelation, t-Test

**Wichtig - Keine Verhältnisse!**
"10°C ist doppelt so warm wie 5°C" ist **falsch**!
- In Fahrenheit: 50°F vs. 41°F → Verhältnis ≠ 2:1

---

## Verhältnisskala

**Zusätzlich zur Intervallskala:** Absoluter Nullpunkt (0 = Abwesenheit des Merkmals)

**Zulässige Transformationen:** y = ax (mit a > 0)

**Beispiele:** Gewicht, Länge, Zeit, Kelvin-Temperatur

**Bedeutsame Aussage:** "Person A ist doppelt so schwer wie Person B" ✓

---

## Überblick

| Skala | Repräsentiert | Transformation | Statistiken |
|-------|---------------|----------------|-------------|
| Nominal | Gleichheit | Bijektiv | Modus |
| Ordinal | Rangordnung | Monoton | Median |
| Intervall | Differenzen | Linear | Mittelwert |
| Verhältnis | Verhältnisse | Ähnlichkeit | Alle |

---

## Bedeutsamkeit

Eine statistische Aussage ist **bedeutsam**, wenn sie unter allen zulässigen Transformationen **invariant** bleibt.

---

## Conjoint Measurement

**Problem:** Bei psychologischen Merkmalen fehlt eine empirische Vereinigungsoperation.

**Lösung:** Objekte mit zwei Eigenschaften verwenden:
- Person (Fähigkeit) × Aufgabe (Schwierigkeit) → Lösungswahrscheinlichkeit

Wenn bestimmte Ordnungsaxiome erfüllt sind, kann man beiden Eigenschaften separate Intervallskalen zuweisen.

---

## Praxisfragen

**Schulnoten:** Bestenfalls ordinal!
- Rangordnung: 1.0 besser als 2.0 ✓
- Gleiche Abstände? Nicht nachweisbar

**Likert-Skalen:** Formal ordinal, oft als quasi-intervallskaliert behandelt`,
      reihenfolge: 1,
      geschaetzte_dauer: 15,
      quizSlug: 'skalenniveaus'
    }
  ]
};

// Biologische Psychologie
export const biologischePsychologie: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000102',
  modulName: 'Biologische Psychologie',
  semester: [1],
  inhalte: []
};

// ============================================================================
// SEMESTER 1 & 2 (semesterübergreifend)
// ============================================================================

// Differentielle Psychologie und Persönlichkeitspsychologie
export const differentiellePsychologie: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000104',
  modulName: 'Differentielle Psychologie und Persönlichkeitspsychologie',
  semester: [1, 2],
  inhalte: []
};

// Sozialpsychologie
export const sozialpsychologie: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000105',
  modulName: 'Sozialpsychologie',
  semester: [1, 2],
  inhalte: []
};

// ============================================================================
// SEMESTER 2
// ============================================================================

// Quantitative Methoden II
export const quantitativeMethodenII: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000106',
  modulName: 'Quantitative Methoden II',
  semester: [2],
  inhalte: []
};

// Einführung in empirisch-wissenschaftliches Arbeiten
export const empirischWissenschaftlich: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000107',
  modulName: 'Einführung in empirisch-wissenschaftliches Arbeiten',
  semester: [2],
  inhalte: []
};

// ============================================================================
// SEMESTER 2 & 3 (semesterübergreifend)
// ============================================================================

// Allgemeine Psychologie I
export const allgemeinePsychologieI: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000108',
  modulName: 'Allgemeine Psychologie I',
  semester: [2, 3],
  inhalte: []
};

// Entwicklungspsychologie
export const entwicklungspsychologie: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000103',
  modulName: 'Entwicklungspsychologie',
  semester: [2, 3],
  inhalte: []
};

// ============================================================================
// SEMESTER 3
// ============================================================================

// Grundlagen psychologischer Diagnostik
export const diagnostikGrundlagen: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000110',
  modulName: 'Grundlagen psychologischer Diagnostik',
  semester: [3],
  inhalte: []
};

// Klinische Psychologie und Psychotherapie (Basismodul)
export const klinischeBasis: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000111',
  modulName: 'Klinische Psychologie und Psychotherapie (Basismodul)',
  semester: [3],
  inhalte: []
};

// ============================================================================
// SEMESTER 3 & 4 (semesterübergreifend)
// ============================================================================

// Organisations- und Personalpsychologie
export const aoPsychologie: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000112',
  modulName: 'Organisations- und Personalpsychologie',
  semester: [3, 4],
  inhalte: []
};

// ============================================================================
// SEMESTER 4
// ============================================================================

// Diagnostische Verfahren
export const diagnostischeVerfahren: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000114',
  modulName: 'Diagnostische Verfahren',
  semester: [4],
  inhalte: []
};

// Klinische Psychologie und Psychotherapie (Aufbaumodul)
export const klinischeAufbau: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000115',
  modulName: 'Klinische Psychologie und Psychotherapie (Aufbaumodul)',
  semester: [4],
  inhalte: []
};

// ============================================================================
// SEMESTER 4 & 5 (semesterübergreifend)
// ============================================================================

// Allgemeine Psychologie II
export const allgemeinePsychologieII: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000113',
  modulName: 'Allgemeine Psychologie II',
  semester: [4, 5],
  inhalte: []
};

// Pädagogische Psychologie
export const paedagogischePsychologie: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000116',
  modulName: 'Pädagogische Psychologie',
  semester: [4, 5],
  inhalte: []
};

// ============================================================================
// SEMESTER 5 & 6 (semesterübergreifend)
// ============================================================================

// Arbeitspsychologie und Occupational Health
export const arbeitspsychologie: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000117',
  modulName: 'Arbeitspsychologie und Occupational Health',
  semester: [5, 6],
  inhalte: []
};

// Grundlagen der Medizin und Pharmakologie
export const medizinPharmakologie: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000118',
  modulName: 'Grundlagen der Medizin und Pharmakologie',
  semester: [5, 6],
  inhalte: []
};

// ============================================================================
// SEMESTER 6
// ============================================================================

// Klinische Psychologie und Psychotherapie (Praxismodul)
export const klinischePraxis: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000119',
  modulName: 'Klinische Psychologie und Psychotherapie (Praxismodul)',
  semester: [6],
  inhalte: []
};

// Abschlussmodul Bachelor Psychologie
export const abschlussmodul: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000122',
  modulName: 'Abschlussmodul Bachelor Psychologie',
  semester: [6],
  inhalte: []
};

// ============================================================================
// ALLE MODULE EXPORTIEREN
// ============================================================================

export const alleLerninhalte: ModulLerninhalte[] = [
  // Semester 1
  forschungsmethoden,
  quantitativeMethodenI,
  biologischePsychologie,
  // Semester 1 & 2
  differentiellePsychologie,
  sozialpsychologie,
  // Semester 2
  quantitativeMethodenII,
  empirischWissenschaftlich,
  // Semester 2 & 3
  allgemeinePsychologieI,
  entwicklungspsychologie,
  // Semester 3
  diagnostikGrundlagen,
  klinischeBasis,
  // Semester 3 & 4
  aoPsychologie,
  // Semester 4
  diagnostischeVerfahren,
  klinischeAufbau,
  // Semester 4 & 5
  allgemeinePsychologieII,
  paedagogischePsychologie,
  // Semester 5 & 6
  arbeitspsychologie,
  medizinPharmakologie,
  // Semester 6
  klinischePraxis,
  abschlussmodul
];

// Hilfsfunktion: Lerninhalte nach Modul-ID finden
export function getLerninhalteByModulId(modulId: string): LerninhaltItem[] {
  const modul = alleLerninhalte.find(m => m.modulId === modulId);
  return modul?.inhalte || [];
}

// Hilfsfunktion: Alle Module eines Semesters mit Lerninhalten
export function getLerninhalteForSemester(semester: number): ModulLerninhalte[] {
  return alleLerninhalte.filter(m => m.semester.includes(semester));
}

// Hilfsfunktion: Lerninhalt nach ID finden (gibt auch Modul-Info zurück)
export function getLerninhaltById(inhaltId: string): { inhalt: LerninhaltItem; modul: ModulLerninhalte } | null {
  for (const modul of alleLerninhalte) {
    const inhalt = modul.inhalte.find(i => i.id === inhaltId);
    if (inhalt) {
      return { inhalt, modul };
    }
  }
  return null;
}
