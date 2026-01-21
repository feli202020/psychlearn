/**
 * Quantitative Methoden I - Übung 1: Skalenniveaus
 *
 * Lokale Datenspeicherung für Lernziel, Lerninhalt und Quiz-Fragen
 * Kann bei Bedarf nach Supabase migriert werden
 */

export const MODULE_ID = '00000000-0000-0000-0000-000000000101'; // Quantitative Methoden I
export const LERNZIEL_ID = '20000000-0000-0000-0000-000000000001';

export const lernziel = {
  id: LERNZIEL_ID,
  slug: 'skalenniveaus',
  titel: 'Skalenniveaus und Messtheorie',
  beschreibung: 'Grundlagen der Messtheorie: Nominal-, Ordinal- und Intervallskalen, zulässige Transformationen und Bedeutsamkeit von Zahlenoperationen.',
  klasse: 1, // Semester 1
  fach_id: MODULE_ID,
  lernformat: ['Quiz'],
  schwierigkeitsgrad: 2,
  geschaetzte_dauer: 30
};

export const questions = [
  // === GRUNDLAGEN MESSTHEORIE ===
  {
    id: 'skal-001',
    question_text: 'Was ist das Ziel einer Messung im messtheoretischen Sinne?',
    options: [
      'Die exakte Bestimmung physikalischer Größen',
      'Die Zuordnung von Zahlen zu Objekten, sodass Relationen der Objekte durch Relationen der Zahlen repräsentiert werden',
      'Die Berechnung von Mittelwerten und Standardabweichungen',
      'Die Klassifikation von Objekten in Kategorien'
    ],
    correct_indices: [1],
    explanation: 'Messung bedeutet, Zahlen so zu Objekten zuzuordnen, dass die empirischen Relationen zwischen Objekten (z.B. Äquivalenz, Dominanz) durch numerische Relationen (z.B. Gleichheit, Größer-Kleiner) abgebildet werden.',
    hint: 'Denke an die Verbindung zwischen empirischer und numerischer Welt.',
    difficulty: 2
  },
  {
    id: 'skal-002',
    question_text: 'Welche zwei Grundfragen stellt die Messtheorie?',
    options: [
      'Existenz einer Zuordnung und Eindeutigkeit der Zuordnung',
      'Reliabilität und Validität der Messung',
      'Mittelwert und Varianz der Daten',
      'Stichprobengröße und Signifikanzniveau'
    ],
    correct_indices: [0],
    explanation: 'Die Messtheorie fragt erstens, ob überhaupt eine strukturerhaltende Zuordnung von Zahlen zu Objekten existiert (Repräsentationsproblem), und zweitens, wie eindeutig diese Zuordnung ist (Eindeutigkeitsproblem/zulässige Transformationen).',
    hint: 'Es geht um die Frage "Kann man messen?" und "Wie beliebig ist die Messung?"',
    difficulty: 2
  },
  {
    id: 'skal-003',
    question_text: 'Was versteht man unter der Transitivität einer Relation?',
    options: [
      'Wenn A~B, dann gilt auch B~A',
      'Wenn A~B und B~C, dann gilt auch A~C',
      'Für alle A gilt: A~A',
      'Entweder A~B oder B~A muss gelten'
    ],
    correct_indices: [1],
    explanation: 'Transitivität bedeutet: Wenn A in Relation zu B steht und B in Relation zu C, dann steht auch A in Relation zu C. Beispiel: Wenn Anna größer als Ben ist und Ben größer als Clara, dann ist Anna größer als Clara.',
    hint: 'Denke an eine Kette von Beziehungen.',
    difficulty: 1
  },

  // === NOMINALSKALA ===
  {
    id: 'skal-004',
    question_text: 'Welche Eigenschaft müssen Objekte besitzen, damit sie auf Nominalskalenniveau gemessen werden können?',
    options: [
      'Sie müssen quantitativ unterscheidbar sein',
      'Sie müssen qualitativ unterscheidbar sein',
      'Ihre Unterschiede müssen vergleichbar sein',
      'Sie müssen einen natürlichen Nullpunkt besitzen'
    ],
    correct_indices: [1],
    explanation: 'Für eine Nominalskala reicht es aus, dass Objekte qualitativ unterscheidbar sind - also dass man feststellen kann, ob zwei Objekte gleich oder verschieden sind (Äquivalenzrelation).',
    hint: 'Bei der Nominalskala geht es nur um Gleichheit vs. Verschiedenheit.',
    difficulty: 1
  },
  {
    id: 'skal-005',
    question_text: 'Welche Transformation ist bei nominalskalierten Daten zulässig?',
    options: [
      'Nur die Identitätstransformation',
      'Lineare Transformationen (y = ax + b)',
      'Monotone Transformationen',
      'Eindeutige Umbenennungen (bijektive Abbildungen)'
    ],
    correct_indices: [3],
    explanation: 'Bei Nominalskalen kann man die Zahlenzuordnung beliebig umbenennen, solange verschiedene Kategorien verschiedene Zahlen erhalten und gleiche Kategorien gleiche Zahlen. Die Zahlen sind nur "Etiketten".',
    hint: 'Die Zahlen haben bei Nominalskalen nur Bezeichnungsfunktion.',
    difficulty: 2
  },
  {
    id: 'skal-006',
    question_text: 'Welches der folgenden Merkmale ist nominalskaliert?',
    options: [
      'Körpergröße in cm',
      'Schulnoten (1-6)',
      'Blutgruppe (A, B, AB, 0)',
      'Temperatur in Celsius'
    ],
    correct_indices: [2],
    explanation: 'Blutgruppen sind nominalskaliert: Man kann nur feststellen, ob zwei Personen die gleiche oder verschiedene Blutgruppen haben. Eine Rangordnung oder Abstände zwischen den Gruppen sind nicht sinnvoll.',
    hint: 'Bei welchem Merkmal kann man nur "gleich" oder "verschieden" feststellen?',
    difficulty: 1
  },
  {
    id: 'skal-007',
    question_text: 'Warum ist die Berechnung eines Mittelwerts bei nominalskalierten Daten nicht sinnvoll?',
    options: [
      'Weil die Stichprobe zu klein ist',
      'Weil das Ergebnis von der willkürlichen Zahlenzuordnung abhängt',
      'Weil nominalskalierte Daten immer normalverteilt sind',
      'Weil der Median besser geeignet ist'
    ],
    correct_indices: [1],
    explanation: 'Bei Nominalskalen kann man z.B. "männlich=1, weiblich=2" oder "männlich=99, weiblich=2" codieren. Der Mittelwert wäre komplett unterschiedlich, obwohl die Daten identisch sind. Die Operation ist nicht invariant unter zulässigen Transformationen.',
    hint: 'Denke an das Beispiel aus der Vorlesung: x̄=1.5 vs. x̄=11',
    difficulty: 2
  },
  {
    id: 'skal-008',
    question_text: 'Welches Problem kann bei der Nominalskala durch Unterschiedsschwellen entstehen?',
    options: [
      'Objekte werden als gleich eingestuft, obwohl sie sich minimal unterscheiden',
      'Die Berechnung des Medians wird unmöglich',
      'Die Daten werden automatisch intervallskaliert',
      'Die Reliabilität wird perfekt'
    ],
    correct_indices: [0],
    explanation: 'Wenn Unterschiede zwischen Objekten unterhalb der Wahrnehmungsschwelle liegen, werden sie fälschlich als äquivalent eingestuft. Beispiel: Zwei sehr ähnliche Blautöne werden als "gleich" kategorisiert.',
    hint: 'Denke an die Grenzen menschlicher Wahrnehmung.',
    difficulty: 2
  },

  // === ORDINALSKALA ===
  {
    id: 'skal-009',
    question_text: 'Was unterscheidet die Ordinalskala von der Nominalskala?',
    options: [
      'Bei der Ordinalskala sind die Abstände zwischen den Werten gleich',
      'Bei der Ordinalskala können die Objekte in eine Rangfolge gebracht werden',
      'Bei der Ordinalskala gibt es einen natürlichen Nullpunkt',
      'Bei der Ordinalskala sind nur ganze Zahlen erlaubt'
    ],
    correct_indices: [1],
    explanation: 'Die Ordinalskala erlaubt zusätzlich zur Unterscheidung von Objekten auch deren Anordnung in eine Rangfolge (größer/kleiner, besser/schlechter). Die Abstände zwischen den Rängen sind jedoch nicht interpretierbar.',
    hint: 'Ordinal kommt von "Ordnung" - es geht um Reihenfolgen.',
    difficulty: 1
  },
  {
    id: 'skal-010',
    question_text: 'Welche Anforderungen muss eine Dominanzrelation für eine Ordinalskala erfüllen?',
    options: [
      'Symmetrie und Reflexivität',
      'Transitivität und Totalität',
      'Kommutativität und Assoziativität',
      'Linearität und Homogenität'
    ],
    correct_indices: [1],
    explanation: 'Transitivität: Wenn A>B und B>C, dann A>C. Totalität (Konnexität): Für je zwei Objekte gilt entweder A>B oder B>A oder A=B. Diese Eigenschaften ermöglichen eine vollständige Rangordnung.',
    hint: 'Man muss alle Objekte vergleichen können und die Vergleiche müssen konsistent sein.',
    difficulty: 2
  },
  {
    id: 'skal-011',
    question_text: 'Welche Transformationen sind bei ordinalskalierten Daten zulässig?',
    options: [
      'Nur die Identitätstransformation',
      'Lineare Transformationen',
      'Streng monotone Transformationen',
      'Beliebige Transformationen'
    ],
    correct_indices: [2],
    explanation: 'Monotone Transformationen erhalten die Rangordnung: Wenn vorher A>B galt, gilt auch nach der Transformation f(A)>f(B). Beispiel: Die Ränge 1,2,3 können zu 10,20,50 transformiert werden.',
    hint: 'Die Reihenfolge muss erhalten bleiben, aber die Abstände dürfen sich ändern.',
    difficulty: 2
  },
  {
    id: 'skal-012',
    question_text: 'Warum ist der Median bei ordinalskalierten Daten ein geeignetes Lagemaß?',
    options: [
      'Weil er einfacher zu berechnen ist als der Mittelwert',
      'Weil er nur auf der Rangordnung basiert und invariant unter monotonen Transformationen ist',
      'Weil er immer größer als der Mittelwert ist',
      'Weil er die Varianz minimiert'
    ],
    correct_indices: [1],
    explanation: 'Der Median ist der mittlere Wert in der Rangfolge. Er hängt nur von der Reihenfolge ab, nicht von den konkreten Zahlenwerten. Daher bleibt er bei monotonen Transformationen erhalten.',
    hint: 'Der Median nutzt nur die Rang-Information.',
    difficulty: 2
  },
  {
    id: 'skal-013',
    question_text: 'Ein Lehrer bewertet Aufsätze mit "sehr gut", "gut", "befriedigend", "ausreichend", "mangelhaft". Welches Skalenniveau liegt vor?',
    options: [
      'Nominalskala',
      'Ordinalskala',
      'Intervallskala',
      'Verhältnisskala'
    ],
    correct_indices: [1],
    explanation: 'Die Bewertungen können geordnet werden (sehr gut > gut > befriedigend...), aber der Abstand zwischen "sehr gut" und "gut" muss nicht gleich dem Abstand zwischen "gut" und "befriedigend" sein.',
    hint: 'Es gibt eine klare Rangfolge, aber sind die Abstände gleich?',
    difficulty: 1
  },
  {
    id: 'skal-014',
    question_text: 'Was ist das Problem bei Präferenzurteilen, wenn Personen ihre Entscheidungskriterien wechseln?',
    options: [
      'Die Daten werden intervallskaliert',
      'Die Transitivität kann verletzt werden',
      'Der Mittelwert wird unbrauchbar',
      'Die Varianz wird negativ'
    ],
    correct_indices: [1],
    explanation: 'Beispiel aus der Vorlesung: Jemand bevorzugt Titanic vor Star Wars (wegen der Geschichte), Star Wars vor Blade Runner (wegen der Geschichte), aber Blade Runner vor Titanic (wegen DiCaprio). Dies verletzt die Transitivität.',
    hint: 'Denke an das Filmbeispiel mit wechselnden Kriterien.',
    difficulty: 3
  },

  // === INTERVALLSKALA ===
  {
    id: 'skal-015',
    question_text: 'Was zeichnet eine Intervallskala (metrische Skala) aus?',
    options: [
      'Es gibt einen absoluten Nullpunkt',
      'Nur Gleichheit und Verschiedenheit sind feststellbar',
      'Die Unterschiede zwischen Objekten sind quantitativ vergleichbar',
      'Nur ganzzahlige Werte sind möglich'
    ],
    correct_indices: [2],
    explanation: 'Bei einer Intervallskala kann man nicht nur sagen, dass A>B, sondern auch, dass der Unterschied zwischen A und B genauso groß ist wie zwischen C und D. Die Differenzen sind bedeutsam.',
    hint: 'Der Name "Intervall" bezieht sich auf die Abstände zwischen Werten.',
    difficulty: 1
  },
  {
    id: 'skal-016',
    question_text: 'Welche Transformationen sind bei intervallskalierten Daten zulässig?',
    options: [
      'Beliebige bijektive Abbildungen',
      'Streng monotone Transformationen',
      'Positive lineare Transformationen (y = ax + b, a > 0)',
      'Nur die Identitätstransformation'
    ],
    correct_indices: [2],
    explanation: 'Lineare Transformationen erhalten die Verhältnisse von Differenzen: (A-B)/(C-D) bleibt gleich. Beispiel: Umrechnung von Celsius in Fahrenheit (F = 1.8·C + 32) ändert nicht die relativen Temperaturunterschiede.',
    hint: 'Denke an die Temperaturumrechnung Celsius ↔ Fahrenheit.',
    difficulty: 2
  },
  {
    id: 'skal-017',
    question_text: 'Warum ist die Aussage "Heute ist es doppelt so warm wie gestern" bei Celsius-Temperaturen problematisch?',
    options: [
      'Weil Temperaturen nicht gemessen werden können',
      'Weil Celsius keinen absoluten Nullpunkt hat und Verhältnisse nicht transformationsinvariant sind',
      'Weil man nur Fahrenheit verwenden darf',
      'Weil Temperaturen nur ordinal sind'
    ],
    correct_indices: [1],
    explanation: '10°C ist nicht "doppelt so warm" wie 5°C. In Fahrenheit wäre das 50°F vs. 41°F - kein Verhältnis von 2:1. Nur Differenzen sind bei Intervallskalen bedeutsam, keine Verhältnisse.',
    hint: 'Rechne das Beispiel in Fahrenheit um und prüfe das Verhältnis.',
    difficulty: 3
  },
  {
    id: 'skal-018',
    question_text: 'Welche der folgenden Aussagen ist bei einer Intervallskala sinnvoll?',
    options: [
      'Person A ist doppelt so intelligent wie Person B',
      'Der IQ-Unterschied zwischen A und B ist genauso groß wie zwischen C und D',
      'Person A hat null Intelligenz',
      'Die Intelligenz von Person A ist 150% von Person B'
    ],
    correct_indices: [1],
    explanation: 'Bei Intervallskalen wie dem IQ sind Differenzen interpretierbar: Ein Unterschied von 15 IQ-Punkten ist überall auf der Skala gleich groß. Verhältnisse und der Nullpunkt sind jedoch willkürlich.',
    hint: 'IQ ist intervallskaliert - was kann man dann aussagen?',
    difficulty: 2
  },

  // === PRAXISBEISPIELE ===
  {
    id: 'skal-019',
    question_text: 'Welches Skalenniveau haben Schulnoten (1.0, 1.3, 1.7, ..., 5.0)?',
    options: [
      'Eindeutig Nominalskala',
      'Eindeutig Intervallskala',
      'Bestenfalls Ordinalskala - die Gleichheit der Abstände ist fraglich',
      'Verhältnisskala mit absolutem Nullpunkt'
    ],
    correct_indices: [2],
    explanation: 'Schulnoten erlauben eine Rangordnung (1.0 besser als 2.0), aber ob der Leistungsunterschied zwischen 1.0 und 2.0 genauso groß ist wie zwischen 3.0 und 4.0, ist nicht empirisch begründbar.',
    hint: 'Denke an das Beispiel aus der Vorlesung: Gibt es eine Vereinigungsoperation für Noten?',
    difficulty: 2
  },
  {
    id: 'skal-020',
    question_text: 'Warum können Schulnoten nicht einfach als Intervallskala behandelt werden?',
    options: [
      'Weil es keine negative Noten gibt',
      'Weil keine empirische Vereinigungsoperation existiert, die die Additivität der Abstände nachweist',
      'Weil Noten immer gerundet werden',
      'Weil verschiedene Lehrer unterschiedlich benoten'
    ],
    correct_indices: [1],
    explanation: 'Im Gegensatz zu Gewichten (wo man zwei 3g-Gewichte auf eine Waage legen kann und 6g erhält) gibt es keine Operation, die zeigt, dass "Note 1 + Note 3 = zwei Noten 2" sinnvoll ist.',
    hint: 'Vergleiche mit dem Waagen-Beispiel für Gewichtsmessung.',
    difficulty: 3
  },
  {
    id: 'skal-021',
    question_text: 'Reaktionszeiten werden in Millisekunden gemessen. Welches Skalenniveau liegt vor?',
    options: [
      'Nominalskala',
      'Ordinalskala',
      'Intervallskala bezüglich der Zeit, aber unklar bezüglich des zugrundeliegenden Konstrukts',
      'Das Skalenniveau kann nicht bestimmt werden'
    ],
    correct_indices: [2],
    explanation: 'Zeit selbst ist verhältnisskaliert (absoluter Nullpunkt). Aber Reaktionszeiten sind oft nur Indikatoren für Konstrukte wie "Konzentration". Die Beziehung zwischen RT und Konzentration muss nicht linear sein.',
    hint: 'Unterscheide zwischen dem Messwert (Zeit) und dem Konstrukt (z.B. Aufmerksamkeit).',
    difficulty: 3
  },

  // === CONJOINT MEASUREMENT ===
  {
    id: 'skal-022',
    question_text: 'Was ist das Grundproblem, das Conjoint Measurement lösen soll?',
    options: [
      'Die Berechnung von Korrelationen',
      'Die fehlende empirische Vereinigungsoperation bei psychologischen Merkmalen',
      'Die Normalverteilung von Daten',
      'Die Schätzung von Mittelwerten'
    ],
    correct_indices: [1],
    explanation: 'Bei physikalischen Größen wie Gewicht kann man Objekte auf eine Waage legen (Vereinigung). Bei psychologischen Konstrukten wie Intelligenz oder Zufriedenheit fehlt eine solche Operation. Conjoint Measurement bietet einen Ausweg.',
    hint: 'Wie kann man "Fähigkeit" empirisch addieren?',
    difficulty: 3
  },
  {
    id: 'skal-023',
    question_text: 'Wie funktioniert Conjoint Measurement prinzipiell?',
    options: [
      'Durch Messung mit physikalischen Instrumenten',
      'Durch Verwendung von Objekten mit zwei Eigenschaften und Prüfung von Ordnungsaxiomen',
      'Durch Mittelung über viele Messwiederholungen',
      'Durch Faktorenanalyse der Daten'
    ],
    correct_indices: [1],
    explanation: 'Man betrachtet Objekte, die zwei Eigenschaften kombinieren (z.B. Person×Aufgabe → Lösungswahrscheinlichkeit). Wenn bestimmte Ordnungsaxiome erfüllt sind, kann man beiden Eigenschaften separate Intervallskalen zuweisen.',
    hint: 'Denke an das Beispiel: Person A + Aufgabe 1 → Lösungswahrscheinlichkeit',
    difficulty: 3
  },
  {
    id: 'skal-024',
    question_text: 'Was besagt die Thomsen-Bedingung im Conjoint Measurement vereinfacht?',
    options: [
      'Alle Messungen müssen normalverteilt sein',
      'Wenn P(A,1) > P(B,2) und P(B,3) > P(C,1), dann muss P(A,3) > P(C,1) gelten',
      'Der Mittelwert muss gleich dem Median sein',
      'Die Varianz muss konstant sein'
    ],
    correct_indices: [1],
    explanation: 'Diese Bedingung prüft, ob die Ordnung der Kombinationen durch additive Skalen f(Person) + g(Aufgabe) dargestellt werden kann. Verletzungen zeigen, dass Intervallskalenniveau nicht erreicht wird.',
    hint: 'Es ist eine Konsistenzbedingung für die Ordnung von Kombinationen.',
    difficulty: 4
  },

  // === BEDEUTSAMKEIT & STATISTIK ===
  {
    id: 'skal-025',
    question_text: 'Was bedeutet es, wenn eine statistische Aussage "bedeutsam" im messtheoretischen Sinne ist?',
    options: [
      'Das Ergebnis ist statistisch signifikant',
      'Die Aussage bleibt unter allen zulässigen Transformationen der Skala gültig',
      'Die Effektstärke ist groß',
      'Die Stichprobe ist repräsentativ'
    ],
    correct_indices: [1],
    explanation: 'Eine bedeutsame Aussage ist transformationsinvariant: Wenn sie für eine Zahlenzuordnung gilt, gilt sie auch für jede andere zulässige Zuordnung. Sonst hängt das Ergebnis von der willkürlichen Codierung ab.',
    hint: 'Erinnere dich an das Beispiel: Mittelwert 1.5 vs. 11 bei verschiedenen Codierungen.',
    difficulty: 2
  },
  {
    id: 'skal-026',
    question_text: 'Bei welchem Skalenniveau ist die Berechnung des arithmetischen Mittelwerts eine bedeutsame Operation?',
    options: [
      'Nominalskala',
      'Ordinalskala',
      'Intervallskala (und höher)',
      'Bei allen Skalenniveaus'
    ],
    correct_indices: [2],
    explanation: 'Der Mittelwert basiert auf Addition und Division. Bei Intervallskalen bleibt der transformierte Mittelwert durch die lineare Transformation konsistent: Wenn x̄ der Mittelwert ist, ist a·x̄+b der Mittelwert der transformierten Daten.',
    hint: 'Prüfe: Bleibt der Mittelwert bei zulässigen Transformationen "sinnvoll"?',
    difficulty: 2
  },
  {
    id: 'skal-027',
    question_text: 'Welches Lagemaß ist für ordinalskalierte Daten das höchste, das noch bedeutsam ist?',
    options: [
      'Arithmetisches Mittel',
      'Geometrisches Mittel',
      'Median',
      'Harmonisches Mittel'
    ],
    correct_indices: [2],
    explanation: 'Der Median ist der mittlere Rang und bleibt bei monotonen Transformationen erhalten. Der Mittelwert würde sich bei nicht-linearen monotonen Transformationen ändern und ist daher nicht bedeutsam.',
    hint: 'Welches Maß nutzt nur die Rangordnung?',
    difficulty: 2
  },

  // === TRANSFERFRAGEN ===
  {
    id: 'skal-028',
    question_text: 'Eine Likert-Skala fragt: "Stimme voll zu (5) - Stimme gar nicht zu (1)". Welches Skalenniveau liegt vor?',
    options: [
      'Eindeutig Intervallskala, weil Zahlen verwendet werden',
      'Nominalskala, weil es sich um Kategorien handelt',
      'Formal Ordinalskala, oft aber als quasi-intervallskaliert behandelt',
      'Verhältnisskala mit natürlichem Nullpunkt'
    ],
    correct_indices: [2],
    explanation: 'Likert-Skalen haben eine klare Ordnung, aber ob "stimme voll zu" vs. "stimme zu" derselbe Abstand ist wie "neutral" vs. "stimme nicht zu", ist nicht empirisch gesichert. In der Praxis werden sie oft als intervallskaliert behandelt.',
    hint: 'Sind die psychologischen Abstände zwischen den Antwortkategorien wirklich gleich?',
    difficulty: 2
  },
  {
    id: 'skal-029',
    question_text: 'Welche Aussage zur Beziehung von Skalenniveau und statistischen Verfahren ist korrekt?',
    options: [
      'Bei nominalskalierten Daten darf man nur den Modus berechnen',
      'Der t-Test erfordert streng genommen intervallskalierte Daten',
      'Korrelationen sind nur bei Verhältnisskalen erlaubt',
      'Das Skalenniveau hat keinen Einfluss auf die Wahl statistischer Verfahren'
    ],
    correct_indices: [1],
    explanation: 'Der t-Test vergleicht Mittelwerte, die nur bei mindestens Intervallskalenniveau bedeutsam sind. In der Praxis werden ordinale Daten oft als intervallskaliert behandelt, was streng genommen nicht gerechtfertigt ist.',
    hint: 'Welche Operationen verwendet der t-Test?',
    difficulty: 2
  },
  {
    id: 'skal-030',
    question_text: 'Postleitzahlen sind...',
    options: [
      'intervallskaliert, weil sie aus Zahlen bestehen',
      'ordinalskaliert, weil höhere Zahlen im Osten liegen',
      'nominalskaliert, weil sie nur Gebiete bezeichnen',
      'verhältnisskaliert, weil sie einen Nullpunkt haben'
    ],
    correct_indices: [2],
    explanation: 'Postleitzahlen sind reine Bezeichnungen für Gebiete. Dass 80331 (München) größer ist als 10115 (Berlin), hat keine inhaltliche Bedeutung. Die Zahlen sind wie Namen - nur nominal.',
    hint: 'Hat es Sinn zu sagen, München sei "größer" als Berlin, weil 80331 > 10115?',
    difficulty: 1
  },
  {
    id: 'skal-031',
    question_text: 'Ein Forscher berechnet den Mittelwert von Diagnose-Codes (z.B. ICD-10). Was ist das Problem?',
    options: [
      'Die Stichprobe ist zu klein',
      'Diagnose-Codes sind nominalskaliert - der Mittelwert ist bedeutungslos',
      'Man müsste den Median nehmen',
      'Die Normalverteilung ist verletzt'
    ],
    correct_indices: [1],
    explanation: 'ICD-10 Codes wie F32.1 (mittelgradige Depression) sind Klassifikationen, keine Mengen. Der "Mittelwert" von Diagnosen hat keine Bedeutung - was wäre die "durchschnittliche Krankheit"?',
    hint: 'Diagnose-Codes sind wie Postleitzahlen - nur Bezeichnungen.',
    difficulty: 2
  },
  {
    id: 'skal-032',
    question_text: 'Welche Eigenschaft unterscheidet die Verhältnisskala von der Intervallskala?',
    options: [
      'Die Möglichkeit, Rangordnungen zu bilden',
      'Das Vorhandensein eines absoluten, nicht-willkürlichen Nullpunkts',
      'Die Anzahl der möglichen Werte',
      'Die Genauigkeit der Messung'
    ],
    correct_indices: [1],
    explanation: 'Bei der Verhältnisskala (z.B. Gewicht, Länge, Kelvin-Temperatur) bedeutet "0" die Abwesenheit des Merkmals. Dadurch werden auch Verhältnisse interpretierbar: "doppelt so schwer" ist sinnvoll.',
    hint: 'Was unterscheidet Celsius (Intervall) von Kelvin (Verhältnis)?',
    difficulty: 2
  },
  {
    id: 'skal-033',
    question_text: 'Warum ist die Unterscheidung von Skalenniveaus für die psychologische Forschung wichtig?',
    options: [
      'Weil höhere Skalenniveaus prestigeträchtiger sind',
      'Weil sie bestimmt, welche statistischen Operationen sinnvoll interpretierbar sind',
      'Weil nur bei Intervallskalen Daten erhoben werden dürfen',
      'Weil Ethikkommissionen es verlangen'
    ],
    correct_indices: [1],
    explanation: 'Das Skalenniveau bestimmt, welche mathematischen Operationen (Mittelwert, Differenzen, Verhältnisse) inhaltlich interpretierbar sind. Falsche Annahmen können zu Fehlinterpretationen führen.',
    hint: 'Es geht um die Verbindung zwischen Zahlen und empirischer Realität.',
    difficulty: 1
  }
];

// Hilfsfunktion um Fragen im Supabase-Format zu exportieren
export function getQuestionsForSupabase() {
  return questions.map(q => ({
    question_text: q.question_text,
    options: q.options,
    correct_indices: q.correct_indices,
    explanation: q.explanation,
    hint: q.hint,
    module_id: MODULE_ID,
    lernziel_id: LERNZIEL_ID,
    answer: null
  }));
}

// Statistiken
export const stats = {
  totalQuestions: questions.length,
  byDifficulty: {
    easy: questions.filter(q => q.difficulty === 1).length,
    medium: questions.filter(q => q.difficulty === 2).length,
    hard: questions.filter(q => q.difficulty === 3).length,
    veryHard: questions.filter(q => q.difficulty === 4).length
  },
  topics: [
    'Grundlagen Messtheorie (3 Fragen)',
    'Nominalskala (5 Fragen)',
    'Ordinalskala (6 Fragen)',
    'Intervallskala (4 Fragen)',
    'Praxisbeispiele (3 Fragen)',
    'Conjoint Measurement (3 Fragen)',
    'Bedeutsamkeit & Statistik (3 Fragen)',
    'Transferfragen (6 Fragen)'
  ]
};
