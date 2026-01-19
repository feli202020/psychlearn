import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getCurrentQuizDate } from '@/lib/daily-quiz-utils';

export const dynamic = 'force-dynamic';

/**
 * POST /api/daily-quiz/submit
 * Speichert das Quiz-Ergebnis eines Benutzers
 */
export async function POST(request: NextRequest) {
  try {
    // Hole Auth Token aus Header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Nicht authentifiziert' },
        { status: 401 }
      );
    }

    // Verifiziere Token mit Supabase
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Ungültiger Token' },
        { status: 401 }
      );
    }

    const userId = user.id;
    const body = await request.json();
    const { semester, score, totalPoints, quizDate } = body;

    if (!semester || score === undefined || totalPoints === undefined) {
      return NextResponse.json(
        { error: 'Fehlende Parameter' },
        { status: 400 }
      );
    }

    // Verwende das vom Client gesendete Quiz-Datum oder das aktuelle
    // Das Quiz-Datum vom Client stellt sicher, dass wir die richtige Session finden,
    // auch wenn der User das Quiz über Mitternacht hinaus macht
    const sessionQuizDate = quizDate || getCurrentQuizDate();

    // Finde die entsprechende Session
    const { data: session_data, error: sessionError } = await supabase
      .from('daily_quiz_sessions')
      .select('id')
      .eq('quiz_date', sessionQuizDate)
      .eq('semester', semester)
      .single();

    if (sessionError || !session_data) {
      return NextResponse.json(
        { error: 'Keine Quiz-Session für heute gefunden' },
        { status: 404 }
      );
    }

    const sessionId = session_data.id;

    // Prüfe ob User bereits ein Ergebnis für diese Session hat
    const { data: existingResult } = await supabase
      .from('daily_quiz_results')
      .select('id')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .single();

    if (existingResult) {
      return NextResponse.json(
        { error: 'Quiz bereits abgeschlossen' },
        { status: 409 }
      );
    }

    // Erstelle einen authentifizierten Supabase-Client mit dem User-Token
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const authenticatedSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Speichere Ergebnis mit authentifiziertem Client
    const { data, error } = await authenticatedSupabase
      .from('daily_quiz_results')
      .insert({
        user_id: userId,
        session_id: sessionId,
        score: score,
        total_points: totalPoints
      })
      .select()
      .single();

    if (error) {
      console.error('Fehler beim Speichern des Quiz-Ergebnisses:', error);
      return NextResponse.json(
        { error: 'Fehler beim Speichern' },
        { status: 500 }
      );
    }

    // Update user_profiles (nur updated_at, falls benötigt)
    // Entfernt: last_quiz_date wird nicht mehr benötigt, da wir daily_quiz_results verwenden

    return NextResponse.json({
      success: true,
      result: data
    });

  } catch (error) {
    console.error('Fehler beim Verarbeiten des Quiz-Ergebnisses:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
