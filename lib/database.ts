import { supabase } from './supabase';
import { Bundesland, Schulform, Fach, Themenfeld, Lernziel, Question, MODULE_IDS, Modul, ModuleContent } from './types';

// BundeslÃ¤nder laden
export async function getBundeslaender(): Promise<Bundesland[]> {
  const { data, error } = await supabase
    .from('bundeslaender')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Fehler beim Laden der BundeslÃ¤nder:', error);
    return [];
  }
  
  return data || [];
}

// Schulformen laden
export async function getSchulformen(): Promise<Schulform[]> {
  const { data, error } = await supabase
    .from('schulformen')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Fehler beim Laden der Schulformen:', error);
    return [];
  }
  
  return data || [];
}

// FÃ¤cher laden
export async function getFaecher(): Promise<Fach[]> {
  const { data, error } = await supabase
    .from('faecher')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Fehler beim Laden der FÃ¤cher:', error);
    return [];
  }
  
  return data || [];
}

// Themenfelder laden
export async function getThemenfelder(): Promise<Themenfeld[]> {
  const { data, error } = await supabase
    .from('themenfelder')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Fehler beim Laden der Themenfelder:', error);
    return [];
  }
  
  return data || [];
}

// Lernziele laden mit allen Relationen
export async function getLernziele(): Promise<Lernziel[]> {
  const { data, error } = await supabase
    .from('lernziele')
    .select(`
      *,
      fach:module!lernziele_fach_id_fkey(*)
    `)
    .order('klasse', { ascending: true });

  if (error) {
    console.error('Fehler beim Laden der Lernziele:', error);
    return [];
  }

  return data || [];
}

// Einzelnes Lernziel laden
export async function getLernzielById(id: string): Promise<Lernziel | null> {
  const { data, error } = await supabase
    .from('lernziele')
    .select(`
      *,
      fach:module!lernziele_fach_id_fkey(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Fehler beim Laden des Lernziels:', error);
    return null;
  }

  return data;
}

// Einzelnes Lernziel laden (per Slug)
export async function getLernzielBySlug(slug: string): Promise<Lernziel | null> {
  const { data, error } = await supabase
    .from('lernziele')
    .select(`
      *,
      fach:module!lernziele_fach_id_fkey(*)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Fehler beim Laden des Lernziels (Slug):', error);
    return null;
  }

  return data;
}


// Voraussetzungen eines Lernziels laden
export async function getVoraussetzungen(lernzielId: string): Promise<Lernziel[]> {
  try {
    const { data, error } = await supabase
      .from('lernziel_voraussetzungen')
      .select(`
        voraussetzung:voraussetzung_id (
          *,
          bundesland:bundeslaender(*),
          schulform:schulformen(*),
          fach:faecher(*),
          themenfeld:themenfelder(*)
        )
      `)
      .eq('lernziel_id', lernzielId);
    
    // Bei JEDEM Error einfach leeres Array zurückgeben - KEINE LOGS!
    if (error) {
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    return data.flatMap((item: { voraussetzung: Lernziel | Lernziel[] | null }) => {
      if (item.voraussetzung === null) return [];
      if (Array.isArray(item.voraussetzung)) return item.voraussetzung;
      return [item.voraussetzung];
    });
    
  } catch (err) {
    // Bei jedem Fehler einfach leeres Array zurückgeben - KEINE LOGS!
    return [];
  }
}
// ============================================================================
// FRAGEN / QUESTIONS
// ============================================================================

/**
 * Hilfsfunktion zum Parsen von Fragen aus der Datenbank
 * Wandelt JSON-Strings in Arrays um
 */
function parseQuestion(rawQuestion: any): Question {
  return {
    ...rawQuestion,
    options: typeof rawQuestion.options === 'string' 
      ? JSON.parse(rawQuestion.options) 
      : rawQuestion.options,
    correct_indices: typeof rawQuestion.correct_indices === 'string'
      ? JSON.parse(rawQuestion.correct_indices)
      : rawQuestion.correct_indices,
  };
}

/**
 * Alle Fragen für ein bestimmtes Modul laden
 * @param moduleId - Die UUID des Moduls (z.B. MODULE_IDS.BIOLOGIE)
 */
export async function getQuestionsByModule(moduleId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('module_id', moduleId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Fehler beim Laden der Fragen:', error);
    return [];
  }
  
  return (data || []).map(parseQuestion);
}

/**
 * Fragen für ein bestimmtes Lernziel laden
 * @param lernzielId - Die UUID des Lernziels
 */
export async function getQuestionsByLernziel(lernzielId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('lernziel_id', lernzielId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Fehler beim Laden der Fragen:', error);
    return [];
  }
  
  return (data || []).map(parseQuestion);
}

/**
 * Eine einzelne Frage anhand der ID laden
 * @param questionId - Die UUID der Frage
 */
export async function getQuestionById(questionId: string): Promise<Question | null> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', questionId)
    .single();
  
  if (error) {
    console.error('Fehler beim Laden der Frage:', error);
    return null;
  }
  
  return data ? parseQuestion(data) : null;
}

/**
 * Zufällige Fragen aus einem Modul laden
 * @param moduleId - Die UUID des Moduls
 * @param count - Anzahl der gewünschten Fragen
 */
export async function getRandomQuestions(moduleId: string, count: number): Promise<Question[]> {
  // Erst alle Fragen des Moduls holen
  const allQuestions = await getQuestionsByModule(moduleId);
  
  // Dann zufällig mischen und limitieren
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/**
 * Biologie-spezifische Convenience-Funktion
 */
export async function getBiologieQuestions(): Promise<Question[]> {
  return getQuestionsByModule(MODULE_IDS.BIOLOGIE);
}

/**
 * Zufällige Biologie-Fragen laden
 */
export async function getRandomBiologieQuestions(count: number): Promise<Question[]> {
  return getRandomQuestions(MODULE_IDS.BIOLOGIE, count);
}

// ============================================================================
// MODULE & LERNINHALTE
// ============================================================================

/**
 * Alle Module laden (aus der module Tabelle in der DB)
 */
export async function getModule(): Promise<Modul[]> {
  const { data, error } = await supabase
    .from('module')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Fehler beim Laden der Module:', error);
    return [];
  }

  // Daten von module zu Modul-Format konvertieren
  return (data || []).map(modul => ({
    id: modul.id,
    name: modul.name,
    stem_bereich: modul.stem_bereich || 'Psychologie',
    semester_array: modul.semester_array,
    created_at: modul.created_at
  }));
}

/**
 * Module nach Semester gruppiert laden
 * Verwendet die semester_array-Spalte aus der module-Tabelle
 * Module können in mehreren Semestern erscheinen (semesterübergreifend)
 */
export async function getModuleGroupedBySemester(): Promise<Record<number, Modul[]>> {
  // Alle Module laden
  const module = await getModule();

  // Nach Semester gruppieren
  const result: Record<number, Modul[]> = {};

  module.forEach(modul => {
    const semesters = modul.semester_array;

    // Nur Module mit gesetzten Semestern berücksichtigen
    if (!semesters || semesters.length === 0) return;

    // Modul zu allen zugewiesenen Semestern hinzufügen
    semesters.forEach(semester => {
      // Semester-Gruppe erstellen falls nicht vorhanden
      if (!result[semester]) {
        result[semester] = [];
      }

      // Modul zur Semester-Gruppe hinzufügen
      result[semester].push(modul);
    });
  });

  return result;
}

/**
 * Einzelnes Modul laden
 */
export async function getModulById(id: string): Promise<Modul | null> {
  const { data, error } = await supabase
    .from('module')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Fehler beim Laden des Moduls:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    stem_bereich: data.stem_bereich || 'Psychologie',
    semester_array: data.semester_array,
    created_at: data.created_at
  };
}

/**
 * Lerninhalte für ein Modul laden
 */
export async function getModuleContent(modulId: string): Promise<ModuleContent[]> {
  const { data, error } = await supabase
    .from('module_content')
    .select('*')
    .eq('modul_id', modulId)
    .order('reihenfolge', { ascending: true });

  if (error) {
    console.error('Fehler beim Laden der Lerninhalte:', error);
    return [];
  }

  return data || [];
}

/**
 * Einzelnen Lerninhalt laden
 */
export async function getModuleContentById(id: string): Promise<ModuleContent | null> {
  const { data, error } = await supabase
    .from('module_content')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Fehler beim Laden des Lerninhalts:', error);
    return null;
  }

  return data;
}