-- ============================================================================
-- Quantitative Methoden I - Übung 1: Skalenniveaus
-- Dieses Script in Supabase SQL Editor ausführen
-- ============================================================================

-- 1. Lernziel erstellen
INSERT INTO lernziele (id, slug, titel, beschreibung, klasse, fach_id, lernformat, schwierigkeitsgrad, geschaetzte_dauer)
VALUES (
  '20000000-0000-0000-0000-000000000001',
  'skalenniveaus',
  'Skalenniveaus und Messtheorie',
  'Grundlagen der Messtheorie: Nominal-, Ordinal- und Intervallskalen, zulässige Transformationen und Bedeutsamkeit von Zahlenoperationen.',
  1,
  '00000000-0000-0000-0000-000000000101',
  '{"Quiz"}',
  2,
  30
)
ON CONFLICT (id) DO UPDATE SET
  titel = EXCLUDED.titel,
  beschreibung = EXCLUDED.beschreibung;

-- 2. Quiz-Fragen einfügen (33 Fragen)

-- Grundlagen Messtheorie
INSERT INTO questions (question_text, options, correct_indices, explanation, hint, module_id, lernziel_id) VALUES
('Was ist das Ziel einer Messung im messtheoretischen Sinne?',
 '["Die exakte Bestimmung physikalischer Größen", "Die Zuordnung von Zahlen zu Objekten, sodass Relationen der Objekte durch Relationen der Zahlen repräsentiert werden", "Die Berechnung von Mittelwerten und Standardabweichungen", "Die Klassifikation von Objekten in Kategorien"]',
 '[1]',
 'Messung bedeutet, Zahlen so zu Objekten zuzuordnen, dass die empirischen Relationen zwischen Objekten (z.B. Äquivalenz, Dominanz) durch numerische Relationen (z.B. Gleichheit, Größer-Kleiner) abgebildet werden.',
 'Denke an die Verbindung zwischen empirischer und numerischer Welt.',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Welche zwei Grundfragen stellt die Messtheorie?',
 '["Existenz einer Zuordnung und Eindeutigkeit der Zuordnung", "Reliabilität und Validität der Messung", "Mittelwert und Varianz der Daten", "Stichprobengröße und Signifikanzniveau"]',
 '[0]',
 'Die Messtheorie fragt erstens, ob überhaupt eine strukturerhaltende Zuordnung von Zahlen zu Objekten existiert (Repräsentationsproblem), und zweitens, wie eindeutig diese Zuordnung ist (Eindeutigkeitsproblem/zulässige Transformationen).',
 'Es geht um die Frage "Kann man messen?" und "Wie beliebig ist die Messung?"',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Was versteht man unter der Transitivität einer Relation?',
 '["Wenn A~B, dann gilt auch B~A", "Wenn A~B und B~C, dann gilt auch A~C", "Für alle A gilt: A~A", "Entweder A~B oder B~A muss gelten"]',
 '[1]',
 'Transitivität bedeutet: Wenn A in Relation zu B steht und B in Relation zu C, dann steht auch A in Relation zu C. Beispiel: Wenn Anna größer als Ben ist und Ben größer als Clara, dann ist Anna größer als Clara.',
 'Denke an eine Kette von Beziehungen.',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

-- Nominalskala
('Welche Eigenschaft müssen Objekte besitzen, damit sie auf Nominalskalenniveau gemessen werden können?',
 '["Sie müssen quantitativ unterscheidbar sein", "Sie müssen qualitativ unterscheidbar sein", "Ihre Unterschiede müssen vergleichbar sein", "Sie müssen einen natürlichen Nullpunkt besitzen"]',
 '[1]',
 'Für eine Nominalskala reicht es aus, dass Objekte qualitativ unterscheidbar sind - also dass man feststellen kann, ob zwei Objekte gleich oder verschieden sind (Äquivalenzrelation).',
 'Bei der Nominalskala geht es nur um Gleichheit vs. Verschiedenheit.',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Welche Transformation ist bei nominalskalierten Daten zulässig?',
 '["Nur die Identitätstransformation", "Lineare Transformationen (y = ax + b)", "Monotone Transformationen", "Eindeutige Umbenennungen (bijektive Abbildungen)"]',
 '[3]',
 'Bei Nominalskalen kann man die Zahlenzuordnung beliebig umbenennen, solange verschiedene Kategorien verschiedene Zahlen erhalten und gleiche Kategorien gleiche Zahlen. Die Zahlen sind nur "Etiketten".',
 'Die Zahlen haben bei Nominalskalen nur Bezeichnungsfunktion.',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Welches der folgenden Merkmale ist nominalskaliert?',
 '["Körpergröße in cm", "Schulnoten (1-6)", "Blutgruppe (A, B, AB, 0)", "Temperatur in Celsius"]',
 '[2]',
 'Blutgruppen sind nominalskaliert: Man kann nur feststellen, ob zwei Personen die gleiche oder verschiedene Blutgruppen haben. Eine Rangordnung oder Abstände zwischen den Gruppen sind nicht sinnvoll.',
 'Bei welchem Merkmal kann man nur "gleich" oder "verschieden" feststellen?',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Warum ist die Berechnung eines Mittelwerts bei nominalskalierten Daten nicht sinnvoll?',
 '["Weil die Stichprobe zu klein ist", "Weil das Ergebnis von der willkürlichen Zahlenzuordnung abhängt", "Weil nominalskalierte Daten immer normalverteilt sind", "Weil der Median besser geeignet ist"]',
 '[1]',
 'Bei Nominalskalen kann man z.B. "männlich=1, weiblich=2" oder "männlich=99, weiblich=2" codieren. Der Mittelwert wäre komplett unterschiedlich, obwohl die Daten identisch sind. Die Operation ist nicht invariant unter zulässigen Transformationen.',
 'Denke an das Beispiel aus der Vorlesung: x̄=1.5 vs. x̄=11',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Welches Problem kann bei der Nominalskala durch Unterschiedsschwellen entstehen?',
 '["Objekte werden als gleich eingestuft, obwohl sie sich minimal unterscheiden", "Die Berechnung des Medians wird unmöglich", "Die Daten werden automatisch intervallskaliert", "Die Reliabilität wird perfekt"]',
 '[0]',
 'Wenn Unterschiede zwischen Objekten unterhalb der Wahrnehmungsschwelle liegen, werden sie fälschlich als äquivalent eingestuft. Beispiel: Zwei sehr ähnliche Blautöne werden als "gleich" kategorisiert.',
 'Denke an die Grenzen menschlicher Wahrnehmung.',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

-- Ordinalskala
('Was unterscheidet die Ordinalskala von der Nominalskala?',
 '["Bei der Ordinalskala sind die Abstände zwischen den Werten gleich", "Bei der Ordinalskala können die Objekte in eine Rangfolge gebracht werden", "Bei der Ordinalskala gibt es einen natürlichen Nullpunkt", "Bei der Ordinalskala sind nur ganze Zahlen erlaubt"]',
 '[1]',
 'Die Ordinalskala erlaubt zusätzlich zur Unterscheidung von Objekten auch deren Anordnung in eine Rangfolge (größer/kleiner, besser/schlechter). Die Abstände zwischen den Rängen sind jedoch nicht interpretierbar.',
 'Ordinal kommt von "Ordnung" - es geht um Reihenfolgen.',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Welche Anforderungen muss eine Dominanzrelation für eine Ordinalskala erfüllen?',
 '["Symmetrie und Reflexivität", "Transitivität und Totalität", "Kommutativität und Assoziativität", "Linearität und Homogenität"]',
 '[1]',
 'Transitivität: Wenn A>B und B>C, dann A>C. Totalität (Konnexität): Für je zwei Objekte gilt entweder A>B oder B>A oder A=B. Diese Eigenschaften ermöglichen eine vollständige Rangordnung.',
 'Man muss alle Objekte vergleichen können und die Vergleiche müssen konsistent sein.',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Welche Transformationen sind bei ordinalskalierten Daten zulässig?',
 '["Nur die Identitätstransformation", "Lineare Transformationen", "Streng monotone Transformationen", "Beliebige Transformationen"]',
 '[2]',
 'Monotone Transformationen erhalten die Rangordnung: Wenn vorher A>B galt, gilt auch nach der Transformation f(A)>f(B). Beispiel: Die Ränge 1,2,3 können zu 10,20,50 transformiert werden.',
 'Die Reihenfolge muss erhalten bleiben, aber die Abstände dürfen sich ändern.',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Warum ist der Median bei ordinalskalierten Daten ein geeignetes Lagemaß?',
 '["Weil er einfacher zu berechnen ist als der Mittelwert", "Weil er nur auf der Rangordnung basiert und invariant unter monotonen Transformationen ist", "Weil er immer größer als der Mittelwert ist", "Weil er die Varianz minimiert"]',
 '[1]',
 'Der Median ist der mittlere Wert in der Rangfolge. Er hängt nur von der Reihenfolge ab, nicht von den konkreten Zahlenwerten. Daher bleibt er bei monotonen Transformationen erhalten.',
 'Der Median nutzt nur die Rang-Information.',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Ein Lehrer bewertet Aufsätze mit "sehr gut", "gut", "befriedigend", "ausreichend", "mangelhaft". Welches Skalenniveau liegt vor?',
 '["Nominalskala", "Ordinalskala", "Intervallskala", "Verhältnisskala"]',
 '[1]',
 'Die Bewertungen können geordnet werden (sehr gut > gut > befriedigend...), aber der Abstand zwischen "sehr gut" und "gut" muss nicht gleich dem Abstand zwischen "gut" und "befriedigend" sein.',
 'Es gibt eine klare Rangfolge, aber sind die Abstände gleich?',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Was ist das Problem bei Präferenzurteilen, wenn Personen ihre Entscheidungskriterien wechseln?',
 '["Die Daten werden intervallskaliert", "Die Transitivität kann verletzt werden", "Der Mittelwert wird unbrauchbar", "Die Varianz wird negativ"]',
 '[1]',
 'Beispiel aus der Vorlesung: Jemand bevorzugt Titanic vor Star Wars (wegen der Geschichte), Star Wars vor Blade Runner (wegen der Geschichte), aber Blade Runner vor Titanic (wegen DiCaprio). Dies verletzt die Transitivität.',
 'Denke an das Filmbeispiel mit wechselnden Kriterien.',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

-- Intervallskala
('Was zeichnet eine Intervallskala (metrische Skala) aus?',
 '["Es gibt einen absoluten Nullpunkt", "Nur Gleichheit und Verschiedenheit sind feststellbar", "Die Unterschiede zwischen Objekten sind quantitativ vergleichbar", "Nur ganzzahlige Werte sind möglich"]',
 '[2]',
 'Bei einer Intervallskala kann man nicht nur sagen, dass A>B, sondern auch, dass der Unterschied zwischen A und B genauso groß ist wie zwischen C und D. Die Differenzen sind bedeutsam.',
 'Der Name "Intervall" bezieht sich auf die Abstände zwischen Werten.',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Welche Transformationen sind bei intervallskalierten Daten zulässig?',
 '["Beliebige bijektive Abbildungen", "Streng monotone Transformationen", "Positive lineare Transformationen (y = ax + b, a > 0)", "Nur die Identitätstransformation"]',
 '[2]',
 'Lineare Transformationen erhalten die Verhältnisse von Differenzen: (A-B)/(C-D) bleibt gleich. Beispiel: Umrechnung von Celsius in Fahrenheit (F = 1.8·C + 32) ändert nicht die relativen Temperaturunterschiede.',
 'Denke an die Temperaturumrechnung Celsius ↔ Fahrenheit.',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Warum ist die Aussage "Heute ist es doppelt so warm wie gestern" bei Celsius-Temperaturen problematisch?',
 '["Weil Temperaturen nicht gemessen werden können", "Weil Celsius keinen absoluten Nullpunkt hat und Verhältnisse nicht transformationsinvariant sind", "Weil man nur Fahrenheit verwenden darf", "Weil Temperaturen nur ordinal sind"]',
 '[1]',
 '10°C ist nicht "doppelt so warm" wie 5°C. In Fahrenheit wäre das 50°F vs. 41°F - kein Verhältnis von 2:1. Nur Differenzen sind bei Intervallskalen bedeutsam, keine Verhältnisse.',
 'Rechne das Beispiel in Fahrenheit um und prüfe das Verhältnis.',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Welche der folgenden Aussagen ist bei einer Intervallskala sinnvoll?',
 '["Person A ist doppelt so intelligent wie Person B", "Der IQ-Unterschied zwischen A und B ist genauso groß wie zwischen C und D", "Person A hat null Intelligenz", "Die Intelligenz von Person A ist 150% von Person B"]',
 '[1]',
 'Bei Intervallskalen wie dem IQ sind Differenzen interpretierbar: Ein Unterschied von 15 IQ-Punkten ist überall auf der Skala gleich groß. Verhältnisse und der Nullpunkt sind jedoch willkürlich.',
 'IQ ist intervallskaliert - was kann man dann aussagen?',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

-- Praxisbeispiele
('Welches Skalenniveau haben Schulnoten (1.0, 1.3, 1.7, ..., 5.0)?',
 '["Eindeutig Nominalskala", "Eindeutig Intervallskala", "Bestenfalls Ordinalskala - die Gleichheit der Abstände ist fraglich", "Verhältnisskala mit absolutem Nullpunkt"]',
 '[2]',
 'Schulnoten erlauben eine Rangordnung (1.0 besser als 2.0), aber ob der Leistungsunterschied zwischen 1.0 und 2.0 genauso groß ist wie zwischen 3.0 und 4.0, ist nicht empirisch begründbar.',
 'Denke an das Beispiel aus der Vorlesung: Gibt es eine Vereinigungsoperation für Noten?',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Warum können Schulnoten nicht einfach als Intervallskala behandelt werden?',
 '["Weil es keine negative Noten gibt", "Weil keine empirische Vereinigungsoperation existiert, die die Additivität der Abstände nachweist", "Weil Noten immer gerundet werden", "Weil verschiedene Lehrer unterschiedlich benoten"]',
 '[1]',
 'Im Gegensatz zu Gewichten (wo man zwei 3g-Gewichte auf eine Waage legen kann und 6g erhält) gibt es keine Operation, die zeigt, dass "Note 1 + Note 3 = zwei Noten 2" sinnvoll ist.',
 'Vergleiche mit dem Waagen-Beispiel für Gewichtsmessung.',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Reaktionszeiten werden in Millisekunden gemessen. Welches Skalenniveau liegt vor?',
 '["Nominalskala", "Ordinalskala", "Intervallskala bezüglich der Zeit, aber unklar bezüglich des zugrundeliegenden Konstrukts", "Das Skalenniveau kann nicht bestimmt werden"]',
 '[2]',
 'Zeit selbst ist verhältnisskaliert (absoluter Nullpunkt). Aber Reaktionszeiten sind oft nur Indikatoren für Konstrukte wie "Konzentration". Die Beziehung zwischen RT und Konzentration muss nicht linear sein.',
 'Unterscheide zwischen dem Messwert (Zeit) und dem Konstrukt (z.B. Aufmerksamkeit).',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

-- Conjoint Measurement
('Was ist das Grundproblem, das Conjoint Measurement lösen soll?',
 '["Die Berechnung von Korrelationen", "Die fehlende empirische Vereinigungsoperation bei psychologischen Merkmalen", "Die Normalverteilung von Daten", "Die Schätzung von Mittelwerten"]',
 '[1]',
 'Bei physikalischen Größen wie Gewicht kann man Objekte auf eine Waage legen (Vereinigung). Bei psychologischen Konstrukten wie Intelligenz oder Zufriedenheit fehlt eine solche Operation. Conjoint Measurement bietet einen Ausweg.',
 'Wie kann man "Fähigkeit" empirisch addieren?',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Wie funktioniert Conjoint Measurement prinzipiell?',
 '["Durch Messung mit physikalischen Instrumenten", "Durch Verwendung von Objekten mit zwei Eigenschaften und Prüfung von Ordnungsaxiomen", "Durch Mittelung über viele Messwiederholungen", "Durch Faktorenanalyse der Daten"]',
 '[1]',
 'Man betrachtet Objekte, die zwei Eigenschaften kombinieren (z.B. Person×Aufgabe → Lösungswahrscheinlichkeit). Wenn bestimmte Ordnungsaxiome erfüllt sind, kann man beiden Eigenschaften separate Intervallskalen zuweisen.',
 'Denke an das Beispiel: Person A + Aufgabe 1 → Lösungswahrscheinlichkeit',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Was besagt die Thomsen-Bedingung im Conjoint Measurement vereinfacht?',
 '["Alle Messungen müssen normalverteilt sein", "Wenn P(A,1) > P(B,2) und P(B,3) > P(C,1), dann muss P(A,3) > P(C,1) gelten", "Der Mittelwert muss gleich dem Median sein", "Die Varianz muss konstant sein"]',
 '[1]',
 'Diese Bedingung prüft, ob die Ordnung der Kombinationen durch additive Skalen f(Person) + g(Aufgabe) dargestellt werden kann. Verletzungen zeigen, dass Intervallskalenniveau nicht erreicht wird.',
 'Es ist eine Konsistenzbedingung für die Ordnung von Kombinationen.',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

-- Bedeutsamkeit & Statistik
('Was bedeutet es, wenn eine statistische Aussage "bedeutsam" im messtheoretischen Sinne ist?',
 '["Das Ergebnis ist statistisch signifikant", "Die Aussage bleibt unter allen zulässigen Transformationen der Skala gültig", "Die Effektstärke ist groß", "Die Stichprobe ist repräsentativ"]',
 '[1]',
 'Eine bedeutsame Aussage ist transformationsinvariant: Wenn sie für eine Zahlenzuordnung gilt, gilt sie auch für jede andere zulässige Zuordnung. Sonst hängt das Ergebnis von der willkürlichen Codierung ab.',
 'Erinnere dich an das Beispiel: Mittelwert 1.5 vs. 11 bei verschiedenen Codierungen.',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Bei welchem Skalenniveau ist die Berechnung des arithmetischen Mittelwerts eine bedeutsame Operation?',
 '["Nominalskala", "Ordinalskala", "Intervallskala (und höher)", "Bei allen Skalenniveaus"]',
 '[2]',
 'Der Mittelwert basiert auf Addition und Division. Bei Intervallskalen bleibt der transformierte Mittelwert durch die lineare Transformation konsistent: Wenn x̄ der Mittelwert ist, ist a·x̄+b der Mittelwert der transformierten Daten.',
 'Prüfe: Bleibt der Mittelwert bei zulässigen Transformationen "sinnvoll"?',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Welches Lagemaß ist für ordinalskalierte Daten das höchste, das noch bedeutsam ist?',
 '["Arithmetisches Mittel", "Geometrisches Mittel", "Median", "Harmonisches Mittel"]',
 '[2]',
 'Der Median ist der mittlere Rang und bleibt bei monotonen Transformationen erhalten. Der Mittelwert würde sich bei nicht-linearen monotonen Transformationen ändern und ist daher nicht bedeutsam.',
 'Welches Maß nutzt nur die Rangordnung?',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

-- Transferfragen
('Eine Likert-Skala fragt: "Stimme voll zu (5) - Stimme gar nicht zu (1)". Welches Skalenniveau liegt vor?',
 '["Eindeutig Intervallskala, weil Zahlen verwendet werden", "Nominalskala, weil es sich um Kategorien handelt", "Formal Ordinalskala, oft aber als quasi-intervallskaliert behandelt", "Verhältnisskala mit natürlichem Nullpunkt"]',
 '[2]',
 'Likert-Skalen haben eine klare Ordnung, aber ob "stimme voll zu" vs. "stimme zu" derselbe Abstand ist wie "neutral" vs. "stimme nicht zu", ist nicht empirisch gesichert. In der Praxis werden sie oft als intervallskaliert behandelt.',
 'Sind die psychologischen Abstände zwischen den Antwortkategorien wirklich gleich?',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Welche Aussage zur Beziehung von Skalenniveau und statistischen Verfahren ist korrekt?',
 '["Bei nominalskalierten Daten darf man nur den Modus berechnen", "Der t-Test erfordert streng genommen intervallskalierte Daten", "Korrelationen sind nur bei Verhältnisskalen erlaubt", "Das Skalenniveau hat keinen Einfluss auf die Wahl statistischer Verfahren"]',
 '[1]',
 'Der t-Test vergleicht Mittelwerte, die nur bei mindestens Intervallskalenniveau bedeutsam sind. In der Praxis werden ordinale Daten oft als intervallskaliert behandelt, was streng genommen nicht gerechtfertigt ist.',
 'Welche Operationen verwendet der t-Test?',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Postleitzahlen sind...',
 '["intervallskaliert, weil sie aus Zahlen bestehen", "ordinalskaliert, weil höhere Zahlen im Osten liegen", "nominalskaliert, weil sie nur Gebiete bezeichnen", "verhältnisskaliert, weil sie einen Nullpunkt haben"]',
 '[2]',
 'Postleitzahlen sind reine Bezeichnungen für Gebiete. Dass 80331 (München) größer ist als 10115 (Berlin), hat keine inhaltliche Bedeutung. Die Zahlen sind wie Namen - nur nominal.',
 'Hat es Sinn zu sagen, München sei "größer" als Berlin, weil 80331 > 10115?',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Ein Forscher berechnet den Mittelwert von Diagnose-Codes (z.B. ICD-10). Was ist das Problem?',
 '["Die Stichprobe ist zu klein", "Diagnose-Codes sind nominalskaliert - der Mittelwert ist bedeutungslos", "Man müsste den Median nehmen", "Die Normalverteilung ist verletzt"]',
 '[1]',
 'ICD-10 Codes wie F32.1 (mittelgradige Depression) sind Klassifikationen, keine Mengen. Der "Mittelwert" von Diagnosen hat keine Bedeutung - was wäre die "durchschnittliche Krankheit"?',
 'Diagnose-Codes sind wie Postleitzahlen - nur Bezeichnungen.',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Welche Eigenschaft unterscheidet die Verhältnisskala von der Intervallskala?',
 '["Die Möglichkeit, Rangordnungen zu bilden", "Das Vorhandensein eines absoluten, nicht-willkürlichen Nullpunkts", "Die Anzahl der möglichen Werte", "Die Genauigkeit der Messung"]',
 '[1]',
 'Bei der Verhältnisskala (z.B. Gewicht, Länge, Kelvin-Temperatur) bedeutet "0" die Abwesenheit des Merkmals. Dadurch werden auch Verhältnisse interpretierbar: "doppelt so schwer" ist sinnvoll.',
 'Was unterscheidet Celsius (Intervall) von Kelvin (Verhältnis)?',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001'),

('Warum ist die Unterscheidung von Skalenniveaus für die psychologische Forschung wichtig?',
 '["Weil höhere Skalenniveaus prestigeträchtiger sind", "Weil sie bestimmt, welche statistischen Operationen sinnvoll interpretierbar sind", "Weil nur bei Intervallskalen Daten erhoben werden dürfen", "Weil Ethikkommissionen es verlangen"]',
 '[1]',
 'Das Skalenniveau bestimmt, welche mathematischen Operationen (Mittelwert, Differenzen, Verhältnisse) inhaltlich interpretierbar sind. Falsche Annahmen können zu Fehlinterpretationen führen.',
 'Es geht um die Verbindung zwischen Zahlen und empirischer Realität.',
 '00000000-0000-0000-0000-000000000101',
 '20000000-0000-0000-0000-000000000001');

-- Erfolgsmeldung
SELECT 'Skalenniveaus: Lernziel und 33 Fragen erfolgreich eingefügt!' as status;
