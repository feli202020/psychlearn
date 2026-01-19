import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    console.log('[Leaderboard API] Anfrage für Datum:', date);

    if (!date) {
      return NextResponse.json({ error: 'Datum erforderlich' }, { status: 400 });
    }

    // Erstelle authentifizierten Supabase-Client aus dem Auth-Header
    const authHeader = request.headers.get('Authorization');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    // Hole die Session für dieses Datum
    const { data: sessionData, error: sessionError } = await supabase
      .from('daily_quiz_sessions')
      .select('id, question_ids')
      .eq('quiz_date', date)
      .single();

    console.log('[Leaderboard API] Session:', { sessionData, sessionError });

    if (sessionError || !sessionData) {
      console.log('[Leaderboard API] Keine Session gefunden für Datum:', date);
      return NextResponse.json({ leaderboard: [], debug: { date, sessionError: sessionError?.message } });
    }

    const totalQuestions = sessionData.question_ids?.length || 20;

    // Hole alle Ergebnisse für diese Session
    const { data: results, error: resultsError } = await supabase
      .from('daily_quiz_results')
      .select('user_id, score, total_points, completed_at')
      .eq('session_id', sessionData.id)
      .order('total_points', { ascending: false })
      .order('completed_at', { ascending: true });

    console.log('[Leaderboard API] Ergebnisse:', {
      resultsCount: results?.length || 0,
      resultsError,
      results: results
    });

    if (resultsError) {
      console.error('Fehler beim Laden der Ergebnisse:', resultsError);
      return NextResponse.json({
        error: 'Fehler beim Laden der Ergebnisse',
        debug: {
          message: resultsError.message,
          code: resultsError.code,
          details: resultsError.details
        }
      }, { status: 500 });
    }

    // Hole Benutzernamen und Anonymisierungs-Status separat für alle User IDs
    let leaderboard: Array<{
      rank: number;
      username: string;
      score: number;
      totalPoints: number;
      totalQuestions: number;
      percentage: number;
      quiz_date: string;
      isAnonymous: boolean;
      userId: string;
    }> = [];
    let statistics: {
      totalParticipants: number;
      avgScore: number;
      avgPoints: number;
      avgPercentage: number;
      totalQuestions: number;
      difficultyLevel: 'easy' | 'medium' | 'hard';
      difficultyMessage: string;
    } | null = null;

    if (results && results.length > 0) {
      const userIds = results.map(r => r.user_id);

      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, username, anonymous_in_leaderboard')
        .in('id', userIds);

      console.log('[Leaderboard API] User Profiles:', {
        profilesCount: profiles?.length || 0,
        profilesError,
        profiles
      });

      // Berechne Statistiken
      const totalParticipants = results.length;
      const totalScoreSum = results.reduce((sum: number, r: any) => sum + r.score, 0);
      const totalPointsSum = results.reduce((sum: number, r: any) => sum + r.total_points, 0);

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

      statistics = {
        totalParticipants,
        avgScore: Math.round(avgScore * 10) / 10,
        avgPoints: Math.round(avgPoints * 10) / 10,
        avgPercentage,
        totalQuestions,
        difficultyLevel,
        difficultyMessage
      };

      // Erstelle Rangliste mit Rang-Berechnung (respektiere Anonymisierung)
      leaderboard = results.map((result: any, index: number) => {
        const userProfile = profiles?.find(p => p.id === result.user_id);
        return {
          rank: index + 1,
          username: userProfile?.anonymous_in_leaderboard
            ? 'Anonymer Teilnehmer'
            : (userProfile?.username || 'Unbekannt'),
          score: result.score,
          totalPoints: result.total_points,
          totalQuestions,
          percentage: Math.round((result.score / totalQuestions) * 100),
          quiz_date: date,
          isAnonymous: userProfile?.anonymous_in_leaderboard || false,
          userId: result.user_id
        };
      });
    }

    console.log('[Leaderboard API] Finale Rangliste:', leaderboard);

    return NextResponse.json({ leaderboard, statistics });
  } catch (error) {
    console.error('Server-Fehler:', error);
    return NextResponse.json({ error: 'Interner Server-Fehler' }, { status: 500 });
  }
}
