// lib/types.ts

export type Lernformat = 
  | 'interaktive Aufgabe'
  | 'Video-Tutorial'
  | 'Simulation'
  | 'Quiz'
  | 'Projekt'
  | 'Experiment'
  | 'Coding-Challenge';

export type Kursart = 'Grundkurs' | 'Leistungskurs';

export interface Bundesland {
  id: string;
  name: string;
  code: string;
}

export interface Schulform {
  id: string;
  name: string;
  bundesland_id: string;
}

export interface Fach {
  id: string;
  name: string;
  stem_bereich: string;
  created_at?: string;
}

export interface Themenfeld {
  id: string;
  name: string;
  fach_id: string;
  beschreibung?: string;
}

export interface Lernziel {
  id: string;
  slug: string;
  titel: string;
  beschreibung?: string;
  klasse: number; // Semester
  fach_id?: string;
  fach?: Fach; // Wird aus module geladen via fach_id
  lernformat: Lernformat[];
  schwierigkeitsgrad: 1 | 2 | 3 | 4 | 5;
  geschaetzte_dauer: number; // in Minuten
  created_at?: string;
  updated_at?: string;
}
// Frage-Interface basierend auf Supabase-Struktur
export interface Question {
  id: string;
  subject_id: string | null;
  question_text: string;
  options: string[];  // Wird aus JSON-String geparst
  correct_indices: number[];  // Wird aus JSON-String geparst
  explanation: string;
  hint: string;
  created_at: string;
  module_id: string;
  lernziel_id: string | null;
  answer: string | null;  // Für andere Fragetypen (z.B. Mathe)
}

// Module-IDs für verschiedene Fächer
export const MODULE_IDS = {
  BIOLOGIE: '00000000-0000-0000-0000-000000000102',
  QUANTITATIVE_METHODEN_I: '00000000-0000-0000-0000-000000000101',
  // Weitere Fächer hier hinzufügen
} as const;

// Modul-Struktur für die Sidebar
export interface Modul {
  id: string;
  name: string;
  stem_bereich: string;
  semester_array?: number[];
  created_at?: string;
}

// Lerninhalt für Module
export interface ModuleContent {
  id: string;
  modul_id: string;
  titel: string;
  inhalt: string; // Markdown/HTML Content
  reihenfolge: number;
  erstellt_am?: string;
  aktualisiert_am?: string;
}

// Lernfortschritt eines Users
export interface LernfortschrittContent {
  id: string;
  user_id: string;
  content_id: string;
  abgeschlossen: boolean;
  abgeschlossen_am?: string;
}