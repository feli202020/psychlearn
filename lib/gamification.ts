import { supabase } from './supabase';

// XP-Berechnung basierend auf Lernziel-Eigenschaften
export function calculateXP(schwierigkeitsgrad: number, geschaetzte_dauer: number): number {
  // Basis XP = Schwierigkeit * 20
  const baseXP = schwierigkeitsgrad * 20;
  
  // Bonus für längere Lernziele
  const timeBonus = Math.floor(geschaetzte_dauer / 10) * 5;
  
  return baseXP + timeBonus;
}

// Lernziel als abgeschlossen markieren
export async function completeLernziel(userId: string, lernzielId: string, earnedXP: number) {
  // 1. Fortschritt eintragen/updaten
  const { error: fortschrittError } = await supabase
    .from('user_lernziel_fortschritt')
    .upsert({
      user_id: userId,
      lernziel_id: lernzielId,
      abgeschlossen: true,
      abgeschlossen_am: new Date().toISOString(),
      verdiente_xp: earnedXP,
    }, {
      onConflict: 'user_id,lernziel_id'
    });

  if (fortschrittError) {
    console.error('Fehler beim Speichern des Fortschritts:', fortschrittError);
    throw fortschrittError;
  }

  // 2. XP zum User-Profil hinzufügen
  const { data: currentProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('xp')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('Fehler beim Laden des Profils:', profileError);
    throw profileError;
  }

  const newXP = (currentProfile?.xp || 0) + earnedXP;

  const { error: updateError } = await supabase
    .from('user_profiles')
    .update({ xp: newXP })
    .eq('id', userId);

  if (updateError) {
    console.error('Fehler beim Update der XP:', updateError);
    throw updateError;
  }

  // 3. Prüfe ob neue Achievements freigeschaltet wurden
  await checkAndUnlockAchievements(userId);

  return { newXP };
}

// Prüfe ob User neue Achievements verdient hat
async function checkAndUnlockAchievements(userId: string) {
  // Hole User-Stats
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('level')
    .eq('id', userId)
    .single();

  const { count: completedCount } = await supabase
    .from('user_lernziel_fortschritt')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('abgeschlossen', true);

  // Hole alle Achievements
  const { data: achievements } = await supabase
    .from('achievements')
    .select('*');

  if (!achievements) return;

  // Hole bereits freigeschaltete Achievements
  const { data: unlockedAchievements } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId);

  const unlockedIds = new Set(unlockedAchievements?.map(a => a.achievement_id) || []);

  // Prüfe jedes Achievement
  for (const achievement of achievements) {
    if (unlockedIds.has(achievement.id)) continue; // Bereits freigeschaltet

    let shouldUnlock = false;

    if (achievement.bedingung_typ === 'lernziele_abgeschlossen') {
      shouldUnlock = (completedCount || 0) >= achievement.bedingung_wert;
    } else if (achievement.bedingung_typ === 'level_erreicht') {
      shouldUnlock = (profile?.level || 1) >= achievement.bedingung_wert;
    }

    if (shouldUnlock) {
      // Achievement freischalten
      await supabase.from('user_achievements').insert({
        user_id: userId,
        achievement_id: achievement.id,
      });

      // XP-Belohnung hinzufügen
      if (achievement.xp_belohnung > 0) {
        const { data: currentProfile } = await supabase
          .from('user_profiles')
          .select('xp')
          .eq('id', userId)
          .single();

        if (currentProfile) {
          await supabase
            .from('user_profiles')
            .update({ xp: currentProfile.xp + achievement.xp_belohnung })
            .eq('id', userId);
        }
      }
    }
  }
}

// Hole User-Fortschritt für ein bestimmtes Lernziel
export async function getLernzielFortschritt(userId: string, lernzielId: string) {
  const { data, error } = await supabase
    .from('user_lernziel_fortschritt')
    .select('*')
    .eq('user_id', userId)
    .eq('lernziel_id', lernzielId)
    .maybeSingle();

  if (error) {
    // Nur echte Fehler loggen, nicht wenn kein Eintrag existiert
    if (error.code !== 'PGRST116') {
      console.error('Fehler beim Laden des Fortschritts:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId,
        lernzielId
      });
    }
    return null;
  }

  return data;
}

// Hole alle abgeschlossenen Lernziele eines Users
export async function getCompletedLernziele(userId: string) {
  const { data, error } = await supabase
    .from('user_lernziel_fortschritt')
    .select('lernziel_id')
    .eq('user_id', userId)
    .eq('abgeschlossen', true);

  if (error) {
    console.error('Fehler beim Laden der abgeschlossenen Lernziele:', error);
    return [];
  }

  return data?.map(d => d.lernziel_id) || [];
}

// Hole User Achievements
export async function getUserAchievements(userId: string) {
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', userId)
    .order('freigeschaltet_am', { ascending: false });

  if (error) {
    console.error('Fehler beim Laden der Achievements:', error);
    return [];
  }

  return data || [];
}