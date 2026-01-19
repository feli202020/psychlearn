import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentQuizDate } from '@/lib/daily-quiz-utils';

export const dynamic = 'force-dynamic';

/**
 * GET /api/daily-quiz/leaderboard
 * Gibt die Rangliste für das tägliche Quiz zurück
 * Zeigt nur Benutzernamen (keine weiteren persönlichen Daten)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const semester = parseInt(searchParams.get('semester') || '1');
    const date = searchParams.get('date') || getCurrentQuizDate();

    if (!semester || semester < 1) {
      return NextResponse.json(
        { error: 'Ungültiges Semester' },
        { status: 400 }
      );
    }

    // Finde die Quiz-Session für das Datum
    const { data: session_data, error: sessionError } = await supabase
      .from('daily_quiz_sessions')
      .select('id')
      .eq('quiz_date', date)
      .eq('semester', semester)
      .single();

    if (sessionError || !session_data) {
      return NextResponse.json({
        quizDate: date,
        semester,
        leaderboard: []
      });
    }

    const sessionId = session_data.id;

    // Lade alle Ergebnisse für diese Session mit Benutzernamen
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
      .eq('session_id', sessionId)
      .order('total_points', { ascending: false })
      .order('completed_at', { ascending: true }); // Bei Gleichstand: wer zuerst fertig war

    if (resultsError) {
      console.error('Fehler beim Laden der Leaderboard-Daten:', resultsError);
      return NextResponse.json(
        { error: 'Fehler beim Laden der Rangliste' },
        { status: 500 }
      );
    }

    // Formatiere Leaderboard-Daten (nur Benutzername anzeigen)
    const leaderboard = results?.map((result: any, index: number) => ({
      rank: index + 1,
      username: result.user?.username || 'Anonymer Nutzer',
      score: result.score,
      totalPoints: result.total_points,
      completedAt: result.completed_at
    })) || [];

    return NextResponse.json({
      quizDate: date,
      semester,
      leaderboard
    });

  } catch (error) {
    console.error('Fehler beim Laden der Rangliste:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
