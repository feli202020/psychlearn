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

    // Lade alle Ergebnisse für diese Session mit Benutzernamen und Anonymisierungs-Status
    const { data: results, error: resultsError } = await supabase
      .from('daily_quiz_results')
      .select(`
        score,
        total_points,
        completed_at,
        user_id,
        user:user_profiles!daily_quiz_results_user_id_fkey (
          username,
          anonymous_in_leaderboard
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

    // Berechne Statistiken
    const totalParticipants = results?.length || 0;
    const totalScoreSum = results?.reduce((sum: number, r: any) => sum + r.score, 0) || 0;
    const totalPointsSum = results?.reduce((sum: number, r: any) => sum + r.total_points, 0) || 0;

    // Hole Session-Details für Gesamtfragen
    const { data: sessionDetails } = await supabase
      .from('daily_quiz_sessions')
      .select('question_ids')
      .eq('id', sessionId)
      .single();

    const totalQuestions = sessionDetails?.question_ids?.length || 20;

    const avgScore = totalParticipants > 0 ? totalScoreSum / totalParticipants : 0;
    const avgPoints = totalParticipants > 0 ? totalPointsSum / totalParticipants : 0;
    const avgPercentage = totalParticipants > 0 ? Math.round((avgScore / totalQuestions) * 100) : 0;

    // Bestimme Quiz-Schwierigkeit basierend auf Durchschnitt
    let difficultyLevel: 'easy' | 'medium' | 'hard';
    let difficultyMessage: string;

    if (avgPercentage >= 80) {
      difficultyLevel = 'easy';
      difficultyMessage = 'Super! Heute war ein gut meisterbares Quiz - die Community hat stark abgeschnitten!';
    } else if (avgPercentage >= 70) {
      difficultyLevel = 'medium';
      difficultyMessage = 'Solides Quiz heute! Die Fragen waren fair und ausgewogen.';
    } else {
      difficultyLevel = 'hard';
      difficultyMessage = 'Heute war das Quiz eine echte Herausforderung - jeder Punkt zahlt sich aus!';
    }

    // Formatiere Leaderboard-Daten (respektiere Anonymisierung)
    const leaderboard = results?.map((result: any, index: number) => ({
      rank: index + 1,
      username: result.user?.anonymous_in_leaderboard
        ? 'Anonymer Teilnehmer'
        : (result.user?.username || 'Anonymer Nutzer'),
      score: result.score,
      totalPoints: result.total_points,
      totalQuestions,
      percentage: Math.round((result.score / totalQuestions) * 100),
      completedAt: result.completed_at,
      isAnonymous: result.user?.anonymous_in_leaderboard || false,
      userId: result.user_id
    })) || [];

    // Statistik-Objekt
    const statistics = {
      totalParticipants,
      avgScore: Math.round(avgScore * 10) / 10,
      avgPoints: Math.round(avgPoints * 10) / 10,
      avgPercentage,
      totalQuestions,
      difficultyLevel,
      difficultyMessage
    };

    return NextResponse.json({
      quizDate: date,
      semester,
      leaderboard,
      statistics
    });

  } catch (error) {
    console.error('Fehler beim Laden der Rangliste:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
