import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getModuleGroupedBySemester, getQuestionsByModule } from '@/lib/database';
import { getCurrentQuizDate, generateQuizSeed, SeededRandom } from '@/lib/daily-quiz-utils';
import { Question } from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/daily-quiz/questions
 * Gibt die täglichen Quiz-Fragen für ein bestimmtes Semester zurück
 * Alle Benutzer bekommen die gleichen Fragen für den gleichen Tag
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const semester = parseInt(searchParams.get('semester') || '1');

    if (!semester || semester < 1) {
      return NextResponse.json(
        { error: 'Ungültiges Semester' },
        { status: 400 }
      );
    }

    // Aktueller Quiz-Tag basierend auf deutscher Zeit (04:00 - 03:59)
    const quizDate = getCurrentQuizDate();

    // Prüfe ob bereits eine Session für diesen Tag existiert
    const { data: existingSession } = await supabase
      .from('daily_quiz_sessions')
      .select('*')
      .eq('quiz_date', quizDate)
      .eq('semester', semester)
      .single();

    let questionIds: string[];

    if (existingSession) {
      // Session existiert bereits - verwende die gespeicherten Fragen
      questionIds = existingSession.question_ids;
    } else {
      // Neue Session - generiere Fragen deterministisch
      questionIds = await generateDailyQuestions(quizDate, semester);

      console.log(`Generierte ${questionIds.length} Fragen für Quiz-Session`);

      if (questionIds.length === 0) {
        return NextResponse.json(
          { error: `Keine Fragen für Semester ${semester} verfügbar` },
          { status: 404 }
        );
      }

      // Speichere die neue Session
      const { error: insertError } = await supabase
        .from('daily_quiz_sessions')
        .insert({
          quiz_date: quizDate,
          semester: semester,
          question_ids: questionIds
        });

      if (insertError) {
        console.error('Fehler beim Erstellen der Quiz-Session:', insertError);
        console.error('Insert Error Code:', insertError.code);
        console.error('Insert Error Message:', insertError.message);
        console.error('Insert Error Details:', insertError.details);

        // Versuche die Session nochmal zu laden (Race Condition)
        const { data: retrySession } = await supabase
          .from('daily_quiz_sessions')
          .select('*')
          .eq('quiz_date', quizDate)
          .eq('semester', semester)
          .single();

        if (retrySession) {
          questionIds = retrySession.question_ids;
        } else {
          return NextResponse.json(
            {
              error: 'Fehler beim Erstellen der Quiz-Session',
              details: insertError.message,
              code: insertError.code
            },
            { status: 500 }
          );
        }
      }
    }

    // Lade die vollständigen Fragen-Objekte
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .in('id', questionIds);

    if (questionsError) {
      console.error('Fehler beim Laden der Fragen:', questionsError);
      return NextResponse.json(
        { error: 'Fehler beim Laden der Fragen' },
        { status: 500 }
      );
    }

    // Parse die Fragen und bringe sie in die richtige Reihenfolge
    const parsedQuestions = questions?.map((q: any) => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      correct_indices: typeof q.correct_indices === 'string' ? JSON.parse(q.correct_indices) : q.correct_indices,
    })) || [];

    // Berechne maximale Punktzahl für diese Session
    // Math-Fragen (answer !== null): 1 Punkt
    // Multiple-Choice: Anzahl der richtigen Antworten (correct_indices.length)
    const maxPoints = parsedQuestions.reduce((sum: number, q: any) => {
      if (q.answer !== null) {
        return sum + 1; // Math-Frage
      }
      const correctIndices = Array.isArray(q.correct_indices) ? q.correct_indices : [];
      return sum + correctIndices.length;
    }, 0);

    // Sortiere nach der Reihenfolge in questionIds
    const orderedQuestions = questionIds
      .map(id => parsedQuestions.find((q: any) => q.id === id))
      .filter(Boolean);

    // Shuffle die Antwort-Optionen für jede Frage deterministisch
    const seed = generateQuizSeed(quizDate, semester);
    const processedQuestions = orderedQuestions.map((q, idx) => {
      // Nur shufflen wenn es Multiple Choice ist
      if (!q.options || !Array.isArray(q.options) || q.answer !== null) {
        return q;
      }

      // Verwende einen einzigartigen Seed für jede Frage
      const questionRandom = new SeededRandom(seed + idx);
      const indices = [0, 1, 2, 3];
      const shuffledIndices = questionRandom.shuffle(indices);

      const shuffledOptions = shuffledIndices.map(i => q.options[i]);
      const shuffledCorrectIndices = q.correct_indices.map((correctIdx: number) => {
        return shuffledIndices.indexOf(correctIdx);
      });

      return {
        ...q,
        options: shuffledOptions,
        correct_indices: shuffledCorrectIndices
      };
    });

    return NextResponse.json({
      quizDate,
      semester,
      questions: processedQuestions,
      maxPoints
    });

  } catch (error) {
    console.error('Fehler beim Generieren des Daily Quiz:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

/**
 * Generiert deterministisch 20 Fragen für einen bestimmten Tag und Semester
 */
async function generateDailyQuestions(date: string, semester: number): Promise<string[]> {
  // Lade alle Module für das Semester
  const moduleGrouped = await getModuleGroupedBySemester();
  const semesterModule = moduleGrouped[semester] || [];

  console.log(`Semester ${semester}: Gefunden ${semesterModule.length} Module`);

  if (semesterModule.length === 0) {
    console.log(`Keine Module für Semester ${semester} gefunden`);
    return [];
  }

  // Sammle alle Fragen aus allen Modulen
  const allQuestions: Question[] = [];
  for (const modul of semesterModule) {
    const moduleQuestions = await getQuestionsByModule(modul.id);
    console.log(`Modul ${modul.name}: ${moduleQuestions.length} Fragen`);
    allQuestions.push(...moduleQuestions);
  }

  console.log(`Gesamt: ${allQuestions.length} Fragen für Semester ${semester}`);

  if (allQuestions.length === 0) {
    console.log('Keine Fragen verfügbar');
    return [];
  }

  // Generiere Seed aus Datum und Semester
  const seed = generateQuizSeed(date, semester);
  const random = new SeededRandom(seed);

  // Mische alle Fragen deterministisch
  const shuffled = random.shuffle(allQuestions);

  // Wähle die ersten 20 Fragen
  const selected = shuffled.slice(0, Math.min(20, shuffled.length));

  // Gebe nur die IDs zurück
  return selected.map(q => q.id);
}
