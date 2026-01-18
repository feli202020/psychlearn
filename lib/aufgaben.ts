import { supabase } from './supabase';

export async function getAufgabenByLernziel(lernzielId: string) {
  const { data, error } = await supabase
    .from('aufgaben')
    .select('*')
    .eq('lernziel_id', lernzielId)
    .order('created_at');

  if (error) {
    console.error('Fehler beim Laden der Aufgaben:', error);
    return [];
  }

  return data || [];
}

export async function markAufgabeAsGeloest(userId: string, aufgabeId: string, punkte: number) {
  const { data: existing } = await supabase
    .from('user_aufgaben_fortschritt')
    .select('*')
    .eq('user_id', userId)
    .eq('aufgabe_id', aufgabeId)
    .single();

  if (existing?.geloest) {
    return { alreadySolved: true };
  }

  const { error: fortschrittError } = await supabase
    .from('user_aufgaben_fortschritt')
    .upsert({
      user_id: userId,
      aufgabe_id: aufgabeId,
      geloest: true,
      versuche: (existing?.versuche || 0) + 1,
      verdiente_punkte: punkte
    });

  if (fortschrittError) {
    console.error('Fehler beim Speichern:', fortschrittError);
    return { alreadySolved: false };
  }

  return { alreadySolved: false };
}