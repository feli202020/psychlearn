// Statische Lerninhalte für alle Module
// Du kannst den Text hier manuell bearbeiten

export interface LerninhaltItem {
  id: string;
  titel: string;
  inhalt: string;
  reihenfolge: number;
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
  inhalte: [
    {
      id: 'fm-1',
      titel: 'Einführung in wissenschaftliches Arbeiten',
      inhalt: 'TESTTEXT',
      reihenfolge: 1
    },
    {
      id: 'fm-2',
      titel: 'Hypothesenbildung und Operationalisierung',
      inhalt: 'TESTTEXT',
      reihenfolge: 2
    },
    {
      id: 'fm-3',
      titel: 'Experimentelle Designs',
      inhalt: 'TESTTEXT',
      reihenfolge: 3
    }
  ]
};

// Quantitative Methoden I
export const quantitativeMethodenI: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000101',
  modulName: 'Quantitative Methoden I',
  semester: [1],
  inhalte: [
    {
      id: 'qm1-1',
      titel: 'Deskriptive Statistik',
      inhalt: 'TESTTEXT',
      reihenfolge: 1
    },
    {
      id: 'qm1-2',
      titel: 'Wahrscheinlichkeitsrechnung',
      inhalt: 'TESTTEXT',
      reihenfolge: 2
    },
    {
      id: 'qm1-3',
      titel: 'Verteilungen und Normalverteilung',
      inhalt: 'TESTTEXT',
      reihenfolge: 3
    }
  ]
};

// Biologische Psychologie
export const biologischePsychologie: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000102',
  modulName: 'Biologische Psychologie',
  semester: [1],
  inhalte: [
    {
      id: 'bio-1',
      titel: 'Aufbau des Nervensystems',
      inhalt: 'TESTTEXT',
      reihenfolge: 1
    },
    {
      id: 'bio-2',
      titel: 'Neuronen und Synapsen',
      inhalt: 'TESTTEXT',
      reihenfolge: 2
    },
    {
      id: 'bio-3',
      titel: 'Neurotransmitter',
      inhalt: 'TESTTEXT',
      reihenfolge: 3
    },
    {
      id: 'bio-4',
      titel: 'Gehirnstrukturen und ihre Funktionen',
      inhalt: 'TESTTEXT',
      reihenfolge: 4
    }
  ]
};

// ============================================================================
// SEMESTER 1 & 2 (semesterübergreifend)
// ============================================================================

// Differentielle Psychologie und Persönlichkeitspsychologie
export const differentiellePsychologie: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000104',
  modulName: 'Differentielle Psychologie und Persönlichkeitspsychologie',
  semester: [1, 2],
  inhalte: [
    {
      id: 'diff-1',
      titel: 'Persönlichkeitstheorien im Überblick',
      inhalt: 'TESTTEXT',
      reihenfolge: 1
    },
    {
      id: 'diff-2',
      titel: 'Big Five Persönlichkeitsmodell',
      inhalt: 'TESTTEXT',
      reihenfolge: 2
    },
    {
      id: 'diff-3',
      titel: 'Intelligenz und kognitive Fähigkeiten',
      inhalt: 'TESTTEXT',
      reihenfolge: 3
    }
  ]
};

// Sozialpsychologie
export const sozialpsychologie: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000105',
  modulName: 'Sozialpsychologie',
  semester: [1, 2],
  inhalte: [
    {
      id: 'soz-1',
      titel: 'Soziale Wahrnehmung und Attribution',
      inhalt: 'TESTTEXT',
      reihenfolge: 1
    },
    {
      id: 'soz-2',
      titel: 'Einstellungen und Einstellungsänderung',
      inhalt: 'TESTTEXT',
      reihenfolge: 2
    },
    {
      id: 'soz-3',
      titel: 'Gruppenprozesse und Konformität',
      inhalt: 'TESTTEXT',
      reihenfolge: 3
    }
  ]
};

// ============================================================================
// SEMESTER 2
// ============================================================================

// Quantitative Methoden II
export const quantitativeMethodenII: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000106',
  modulName: 'Quantitative Methoden II',
  semester: [2],
  inhalte: [
    {
      id: 'qm2-1',
      titel: 'Inferenzstatistik Grundlagen',
      inhalt: 'TESTTEXT',
      reihenfolge: 1
    },
    {
      id: 'qm2-2',
      titel: 't-Tests und Varianzanalyse',
      inhalt: 'TESTTEXT',
      reihenfolge: 2
    },
    {
      id: 'qm2-3',
      titel: 'Korrelation und Regression',
      inhalt: 'TESTTEXT',
      reihenfolge: 3
    }
  ]
};

// Einführung in empirisch-wissenschaftliches Arbeiten
export const empirischWissenschaftlich: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000107',
  modulName: 'Einführung in empirisch-wissenschaftliches Arbeiten',
  semester: [2],
  inhalte: [
    {
      id: 'ewa-1',
      titel: 'Literaturrecherche und Quellenarbeit',
      inhalt: 'TESTTEXT',
      reihenfolge: 1
    },
    {
      id: 'ewa-2',
      titel: 'Wissenschaftliches Schreiben',
      inhalt: 'TESTTEXT',
      reihenfolge: 2
    },
    {
      id: 'ewa-3',
      titel: 'Planung empirischer Studien',
      inhalt: 'TESTTEXT',
      reihenfolge: 3
    }
  ]
};

// ============================================================================
// SEMESTER 2 & 3 (semesterübergreifend)
// ============================================================================

// Allgemeine Psychologie I
export const allgemeinePsychologieI: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000108',
  modulName: 'Allgemeine Psychologie I',
  semester: [2, 3],
  inhalte: [
    {
      id: 'ap1-1',
      titel: 'Wahrnehmung',
      inhalt: 'TESTTEXT',
      reihenfolge: 1
    },
    {
      id: 'ap1-2',
      titel: 'Aufmerksamkeit',
      inhalt: 'TESTTEXT',
      reihenfolge: 2
    },
    {
      id: 'ap1-3',
      titel: 'Gedächtnis',
      inhalt: 'TESTTEXT',
      reihenfolge: 3
    }
  ]
};

// Entwicklungspsychologie
export const entwicklungspsychologie: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000103',
  modulName: 'Entwicklungspsychologie',
  semester: [2, 3],
  inhalte: [
    {
      id: 'entw-1',
      titel: 'Entwicklungstheorien',
      inhalt: 'TESTTEXT',
      reihenfolge: 1
    },
    {
      id: 'entw-2',
      titel: 'Kognitive Entwicklung',
      inhalt: 'TESTTEXT',
      reihenfolge: 2
    },
    {
      id: 'entw-3',
      titel: 'Sozial-emotionale Entwicklung',
      inhalt: 'TESTTEXT',
      reihenfolge: 3
    }
  ]
};

// ============================================================================
// SEMESTER 3
// ============================================================================

// Grundlagen psychologischer Diagnostik
export const diagnostikGrundlagen: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000110',
  modulName: 'Grundlagen psychologischer Diagnostik',
  semester: [3],
  inhalte: [
    {
      id: 'diag-1',
      titel: 'Grundlagen der Testtheorie',
      inhalt: 'TESTTEXT',
      reihenfolge: 1
    },
    {
      id: 'diag-2',
      titel: 'Gütekriterien psychologischer Tests',
      inhalt: 'TESTTEXT',
      reihenfolge: 2
    },
    {
      id: 'diag-3',
      titel: 'Diagnostische Methoden',
      inhalt: 'TESTTEXT',
      reihenfolge: 3
    }
  ]
};

// Klinische Psychologie und Psychotherapie (Basismodul)
export const klinischeBasis: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000111',
  modulName: 'Klinische Psychologie und Psychotherapie (Basismodul)',
  semester: [3],
  inhalte: [
    {
      id: 'klin-b-1',
      titel: 'Klassifikationssysteme (ICD, DSM)',
      inhalt: 'TESTTEXT',
      reihenfolge: 1
    },
    {
      id: 'klin-b-2',
      titel: 'Ätiologische Modelle',
      inhalt: 'TESTTEXT',
      reihenfolge: 2
    },
    {
      id: 'klin-b-3',
      titel: 'Überblick Psychotherapieverfahren',
      inhalt: 'TESTTEXT',
      reihenfolge: 3
    }
  ]
};

// ============================================================================
// SEMESTER 3 & 4 (semesterübergreifend)
// ============================================================================

// Organisations- und Personalpsychologie
export const aoPsychologie: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000112',
  modulName: 'Organisations- und Personalpsychologie',
  semester: [3, 4],
  inhalte: [
    {
      id: 'ao-1',
      titel: 'Personalauswahl und Assessment',
      inhalt: 'TESTTEXT',
      reihenfolge: 1
    },
    {
      id: 'ao-2',
      titel: 'Motivation und Arbeitszufriedenheit',
      inhalt: 'TESTTEXT',
      reihenfolge: 2
    },
    {
      id: 'ao-3',
      titel: 'Führung und Leadership',
      inhalt: 'TESTTEXT',
      reihenfolge: 3
    }
  ]
};

// ============================================================================
// SEMESTER 4
// ============================================================================

// Diagnostische Verfahren
export const diagnostischeVerfahren: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000114',
  modulName: 'Diagnostische Verfahren',
  semester: [4],
  inhalte: [
    {
      id: 'diagv-1',
      titel: 'Leistungstests und Intelligenztests',
      inhalt: 'TESTTEXT',
      reihenfolge: 1
    },
    {
      id: 'diagv-2',
      titel: 'Persönlichkeitsfragebögen',
      inhalt: 'TESTTEXT',
      reihenfolge: 2
    },
    {
      id: 'diagv-3',
      titel: 'Projektive Verfahren',
      inhalt: 'TESTTEXT',
      reihenfolge: 3
    }
  ]
};

// Klinische Psychologie und Psychotherapie (Aufbaumodul)
export const klinischeAufbau: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000115',
  modulName: 'Klinische Psychologie und Psychotherapie (Aufbaumodul)',
  semester: [4],
  inhalte: [
    {
      id: 'klin-a-1',
      titel: 'Affektive Störungen',
      inhalt: 'TESTTEXT',
      reihenfolge: 1
    },
    {
      id: 'klin-a-2',
      titel: 'Angststörungen',
      inhalt: 'TESTTEXT',
      reihenfolge: 2
    },
    {
      id: 'klin-a-3',
      titel: 'Persönlichkeitsstörungen',
      inhalt: 'TESTTEXT',
      reihenfolge: 3
    }
  ]
};

// ============================================================================
// SEMESTER 4 & 5 (semesterübergreifend)
// ============================================================================

// Allgemeine Psychologie II
export const allgemeinePsychologieII: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000113',
  modulName: 'Allgemeine Psychologie II',
  semester: [4, 5],
  inhalte: [
    {
      id: 'ap2-1',
      titel: 'Emotion und Motivation',
      inhalt: 'TESTTEXT',
      reihenfolge: 1
    },
    {
      id: 'ap2-2',
      titel: 'Denken und Problemlösen',
      inhalt: 'TESTTEXT',
      reihenfolge: 2
    },
    {
      id: 'ap2-3',
      titel: 'Sprache',
      inhalt: 'TESTTEXT',
      reihenfolge: 3
    }
  ]
};

// Pädagogische Psychologie
export const paedagogischePsychologie: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000116',
  modulName: 'Pädagogische Psychologie',
  semester: [4, 5],
  inhalte: [
    {
      id: 'paed-1',
      titel: 'Lerntheorien',
      inhalt: 'TESTTEXT',
      reihenfolge: 1
    },
    {
      id: 'paed-2',
      titel: 'Instruktion und Unterricht',
      inhalt: 'TESTTEXT',
      reihenfolge: 2
    },
    {
      id: 'paed-3',
      titel: 'Leistungsbeurteilung',
      inhalt: 'TESTTEXT',
      reihenfolge: 3
    }
  ]
};

// ============================================================================
// SEMESTER 5 & 6 (semesterübergreifend)
// ============================================================================

// Arbeitspsychologie und Occupational Health
export const arbeitspsychologie: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000117',
  modulName: 'Arbeitspsychologie und Occupational Health',
  semester: [5, 6],
  inhalte: [
    {
      id: 'arb-1',
      titel: 'Arbeitsgestaltung und Ergonomie',
      inhalt: 'TESTTEXT',
      reihenfolge: 1
    },
    {
      id: 'arb-2',
      titel: 'Stress und Belastung am Arbeitsplatz',
      inhalt: 'TESTTEXT',
      reihenfolge: 2
    },
    {
      id: 'arb-3',
      titel: 'Work-Life-Balance',
      inhalt: 'TESTTEXT',
      reihenfolge: 3
    }
  ]
};

// Grundlagen der Medizin und Pharmakologie
export const medizinPharmakologie: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000118',
  modulName: 'Grundlagen der Medizin und Pharmakologie',
  semester: [5, 6],
  inhalte: [
    {
      id: 'med-1',
      titel: 'Psychopharmakologie Grundlagen',
      inhalt: 'TESTTEXT',
      reihenfolge: 1
    },
    {
      id: 'med-2',
      titel: 'Antidepressiva und Anxiolytika',
      inhalt: 'TESTTEXT',
      reihenfolge: 2
    },
    {
      id: 'med-3',
      titel: 'Antipsychotika',
      inhalt: 'TESTTEXT',
      reihenfolge: 3
    }
  ]
};

// ============================================================================
// SEMESTER 6
// ============================================================================

// Klinische Psychologie und Psychotherapie (Praxismodul)
export const klinischePraxis: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000119',
  modulName: 'Klinische Psychologie und Psychotherapie (Praxismodul)',
  semester: [6],
  inhalte: [
    {
      id: 'klin-p-1',
      titel: 'Gesprächsführung und Anamnese',
      inhalt: 'TESTTEXT',
      reihenfolge: 1
    },
    {
      id: 'klin-p-2',
      titel: 'Therapeutische Interventionen',
      inhalt: 'TESTTEXT',
      reihenfolge: 2
    },
    {
      id: 'klin-p-3',
      titel: 'Fallkonzeption und Behandlungsplanung',
      inhalt: 'TESTTEXT',
      reihenfolge: 3
    }
  ]
};

// Abschlussmodul Bachelor Psychologie
export const abschlussmodul: ModulLerninhalte = {
  modulId: '00000000-0000-0000-0000-000000000122',
  modulName: 'Abschlussmodul Bachelor Psychologie',
  semester: [6],
  inhalte: [
    {
      id: 'abschl-1',
      titel: 'Wissenschaftliches Arbeiten für die Bachelorarbeit',
      inhalt: 'TESTTEXT',
      reihenfolge: 1
    },
    {
      id: 'abschl-2',
      titel: 'Forschungsdesign und Methodik',
      inhalt: 'TESTTEXT',
      reihenfolge: 2
    },
    {
      id: 'abschl-3',
      titel: 'Auswertung und Präsentation',
      inhalt: 'TESTTEXT',
      reihenfolge: 3
    }
  ]
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
