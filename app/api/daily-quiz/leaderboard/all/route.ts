import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Datum erforderlich' }, { status: 400 });
    }

    // Hole die Session für dieses Datum
    const { data: sessionData, error: sessionError } = await supabase
      .from('daily_quiz_sessions')
      .select('id, question_ids')
      .eq('quiz_date', date)
      .single();

    if (sessionError || !sessionData) {
      return NextResponse.json({ leaderboard: [] });
    }

    const totalQuestions = sessionData.question_ids?.length || 20;

    // Hole alle Ergebnisse für diese Session
    const { data: results, error: resultsError } = await supabase
      .from('daily_quiz_results')
      .select(`
        score,
        total_points,
        completed_at,
        user:user_profiles!daily_quiz_results_user_id_fkey (
          username
        )
      `)
      .eq('session_id', sessionData.id)
      .order('total_points', { ascending: false })
      .order('completed_at', { ascending: true });

    if (resultsError) {
      console.error('Fehler beim Laden der Ergebnisse:', resultsError);
      return NextResponse.json({ error: 'Fehler beim Laden der Ergebnisse' }, { status: 500 });
    }

    // Erstelle Rangliste mit Rang-Berechnung
    const leaderboard = results?.map((result: any, index: number) => ({
      rank: index + 1,
      username: result.user?.username || 'Unbekannt',
      score: result.score,
      totalPoints: result.total_points,
      totalQuestions,
      percentage: Math.round((result.score / totalQuestions) * 100),
      quiz_date: date
    })) || [];

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Server-Fehler:', error);
    return NextResponse.json({ error: 'Interner Server-Fehler' }, { status: 500 });
  }
}
