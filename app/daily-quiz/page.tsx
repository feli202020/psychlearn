'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Trophy,
  CheckCircle,
  XCircle,
  Brain,
  ArrowRight,
  Home,
  Loader2,
  Eye,
  EyeOff,
  Lightbulb,
  BookOpen,
  Users,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { Question } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { getCurrentQuizDate, formatQuizDate } from '@/lib/daily-quiz-utils';

// Symbol-Kategorien für Mathe-Fragen
const MATH_SYMBOLS = {
  häufig: [
    { symbol: 'μ', label: 'μ (mu)' },
    { symbol: 'σ', label: 'σ (sigma)' },
    { symbol: 'x̄', label: 'x̄ (x-quer)' },
    { symbol: "x̃", label: "x̃" },
    { symbol: 's', label: 's' },
    { symbol: 'n', label: 'n' },
    { symbol: 'α', label: 'α (alpha)' },
    { symbol: 'p', label: 'p' },
    { symbol: 'r', label: 'r' },
    { symbol: '±', label: '±' },
    { symbol: '≤', label: '≤' },
    { symbol: '≥', label: '≥' },
    { symbol: '≠', label: '≠' },
    { symbol: '√', label: '√' },
    { symbol: '²', label: '²' },
    { symbol: '³', label: '³' },
    { symbol: 'Σ', label: 'Σ (Summe)' },
    { symbol: 'χ²', label: 'χ²' },
    { symbol: 't', label: 't' },
    { symbol: 'F', label: 'F' },
    { symbol: 'z', label: 'z' },
  ],
  erweitert: [
    { symbol: 'σ²', label: 'σ²' },
    { symbol: 's²', label: 's²' },
    { symbol: 'r²', label: 'r²' },
    { symbol: 'R²', label: 'R²' },
    { symbol: 'β', label: 'β (beta)' },
    { symbol: 'ρ', label: 'ρ (rho)' },
    { symbol: 'η²', label: 'η²' },
    { symbol: 'df', label: 'df' },
    { symbol: 'π', label: 'π' },
    { symbol: 'Δ', label: 'Δ (Delta)' },
    { symbol: 'SE', label: 'SE' },
    { symbol: 'M', label: 'M' },
    { symbol: 'SD', label: 'SD' },
    { symbol: 'N', label: 'N' },
    { symbol: 'ε', label: 'ε (epsilon)' },
    { symbol: 'ω²', label: 'ω²' },
    { symbol: '≈', label: '≈' },
    { symbol: '×', label: '×' },
    { symbol: '÷', label: '÷' },
    { symbol: '∞', label: '∞' },
    { symbol: '<', label: '<' },
    { symbol: '>', label: '>' },
    { symbol: '→', label: '→' },
    { symbol: '|', label: '|' },
    { symbol: '½', label: '½' },
    { symbol: '¼', label: '¼' },
    { symbol: '¾', label: '¾' },
    { symbol: '%', label: '%' },
  ],
};

// Disable static generation for this page
export const dynamic = 'force-dynamic';

function DailyQuizContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const semester = parseInt(searchParams.get('semester') || '1');
  const inputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [mathAnswer, setMathAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [canTakeQuiz, setCanTakeQuiz] = useState(true);
  const [uniqueLernziele, setUniqueLernziele] = useState<Array<{id: string, slug: string, titel: string, fach?: {name: string}}>>([]);
  const [partialAnswerInfo, setPartialAnswerInfo] = useState<{correctCount: number, totalCount: number} | null>(null);
  const [leaderboard, setLeaderboard] = useState<Array<{rank: number, username: string, score: number, totalPoints: number, isAnonymous?: boolean, userId?: string}>>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [quizDate, setQuizDate] = useState<string>(''); // Speichert das Quiz-Datum für diese Session
  const [userResult, setUserResult] = useState<{score: number, totalPoints: number, totalQuestions: number} | null>(null);
  const [blurredResult, setBlurredResult] = useState(true); // State für Blur-Effekt beim ersten Mal
  const [statistics, setStatistics] = useState<{
    totalParticipants: number;
    avgScore: number;
    avgPoints: number;
    avgPercentage: number;
    totalQuestions: number;
    difficultyLevel: 'easy' | 'medium' | 'hard';
    difficultyMessage: string;
  } | null>(null);

  useEffect(() => {
    // Warte bis Auth geladen ist, bevor wir zum Login weiterleiten
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    checkLastQuizDate();
  }, [user, semester, router, authLoading]);

  // Lade gespeicherten Progress beim Start
  useEffect(() => {
    if (!user || questions.length === 0) return;

    const savedProgress = localStorage.getItem(`daily-quiz-${user.id}-${semester}`);
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        const savedDate = progress.date;
        const today = new Date().toISOString().split('T')[0];

        // Nur laden wenn vom gleichen Tag
        if (savedDate === today) {
          setCurrentQuestionIndex(progress.currentQuestionIndex || 0);
          setScore(progress.score || 0);
          setTotalPoints(progress.totalPoints || 0);
          setAnsweredQuestions(progress.answeredQuestions || []);
        }
      } catch (error) {
        console.error('Fehler beim Laden des Quiz-Fortschritts:', error);
      }
    }

    // Lade Blur-State für Quiz-Ergebnis
    if (user) {
      const savedBlurState = localStorage.getItem(`daily-quiz-blur-${user.id}-${semester}`);
      if (savedBlurState) {
        try {
          const blurData = JSON.parse(savedBlurState);
          const today = new Date().toISOString().split('T')[0];
          // Nur laden wenn vom gleichen Tag
          if (blurData.date === today) {
            setBlurredResult(blurData.blurred);
          }
        } catch (error) {
          console.error('Fehler beim Laden des Blur-States:', error);
        }
      }
    }
  }, [user, semester, questions.length]);

  const checkLastQuizDate = async () => {
    if (!user) return;

    try {
      // Prüfe ob Benutzer heute bereits ein Quiz absolviert hat
      const quizDate = getCurrentQuizDate();

      const { data: sessionData } = await supabase
        .from('daily_quiz_sessions')
        .select('id, question_ids')
        .eq('quiz_date', quizDate)
        .eq('semester', semester)
        .single();

      if (sessionData) {
        const { data: resultData } = await supabase
          .from('daily_quiz_results')
          .select('score, total_points')
          .eq('user_id', user.id)
          .eq('session_id', sessionData.id)
          .single();

        if (resultData) {
          // Quiz wurde bereits absolviert - lade Ergebnisse und Lernziele
          setUserResult({
            score: resultData.score,
            totalPoints: resultData.total_points,
            totalQuestions: sessionData.question_ids?.length || 20
          });

          // Lade Lernziele für die Quiz-Fragen
          if (sessionData.question_ids && sessionData.question_ids.length > 0) {
            const { data: questionsData } = await supabase
              .from('questions')
              .select('lernziel_id')
              .in('id', sessionData.question_ids);

            if (questionsData) {
              const lernzielIds = [...new Set(questionsData.map(q => q.lernziel_id).filter(Boolean))];

              if (lernzielIds.length > 0) {
                const { data: lernzieleData } = await supabase
                  .from('lernziele')
                  .select('id, slug, titel, fach:module!lernziele_fach_id_fkey(name)')
                  .in('id', lernzielIds);

                if (lernzieleData && lernzieleData.length > 0) {
                  setUniqueLernziele(lernzieleData as any[]);
                }
              }
            }
          }

          await loadLeaderboard();
          setCanTakeQuiz(false);
          setLoading(false);
          return;
        }
      }

      setCanTakeQuiz(true);
      loadDailyQuiz();
    } catch (error) {
      console.error('Fehler beim Prüfen des Quiz-Datums:', error);
      loadDailyQuiz();
    }
  };

  const loadDailyQuiz = async () => {
    setLoading(true);
    try {
      // Lade Quiz-Fragen vom Server (alle Benutzer bekommen die gleichen Fragen)
      const response = await fetch(`/api/daily-quiz/questions?semester=${semester}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }));
        console.error('API Error:', response.status, errorData);
        throw new Error(`Fehler beim Laden des Quiz: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      const processedQuestions = data.questions || [];

      setQuestions(processedQuestions);
      setAnsweredQuestions(new Array(processedQuestions.length).fill(false));
      setQuizDate(data.quizDate); // Speichere das Quiz-Datum für diese Session

      // Extrahiere eindeutige Lernziele aus den Fragen
      const lernzielIds = new Set(processedQuestions.map((q: Question) => q.lernziel_id).filter(Boolean));

      // Lade Lernziel-Details mit Modul-Information
      if (lernzielIds.size > 0) {
        const { data: lernzieleData, error: lernzieleError } = await supabase
          .from('lernziele')
          .select('id, slug, titel, fach:module!lernziele_fach_id_fkey(name)')
          .in('id', Array.from(lernzielIds));

        if (lernzieleError) {
          console.error('Fehler beim Laden der Lernziele:', lernzieleError);
        }

        if (lernzieleData && lernzieleData.length > 0) {
          setUniqueLernziele(lernzieleData as any[]);
        }
      }

      console.log(`Daily Quiz geladen: ${processedQuestions.length} Fragen für ${formatQuizDate(data.quizDate)}`);
    } catch (error) {
      console.error('Fehler beim Laden des Daily Quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const isMathQuestion = (question: Question): boolean => {
    // Eine Frage ist eine Math-Input-Frage, wenn das answer-Feld gefüllt ist
    // Dies gilt für alle Module, einschließlich Quantitative Methoden I & II
    return question.answer !== null;
  };

  const handleAnswerSelect = (index: number) => {
    if (submitted) return;

    const currentQuestion = questions[currentQuestionIndex];
    if (isMathQuestion(currentQuestion)) return;

    // Bei nur einer richtigen Antwort: Radio-Button-Verhalten (nur eine Auswahl)
    if (currentQuestion.correct_indices && currentQuestion.correct_indices.length === 1) {
      setSelectedAnswers([index]);
    } else {
      // Bei mehreren richtigen Antworten: Checkbox-Verhalten (mehrere Auswahlen)
      if (selectedAnswers.includes(index)) {
        setSelectedAnswers(selectedAnswers.filter(i => i !== index));
      } else {
        setSelectedAnswers([...selectedAnswers, index]);
      }
    }
  };

  const insertSymbol = (symbol: string) => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const newValue = mathAnswer.substring(0, start) + symbol + mathAnswer.substring(end);

    setMathAnswer(newValue);

    setTimeout(() => {
      input.focus();
      const newPos = start + symbol.length;
      input.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleSubmit = () => {
    const currentQuestion = questions[currentQuestionIndex];
    let correct = false;
    let earnedPoints = 0;

    if (isMathQuestion(currentQuestion)) {
      correct = mathAnswer.trim() === (currentQuestion.answer || '').trim();
      setPartialAnswerInfo(null);
      earnedPoints = correct ? 1 : 0;
    } else {
      const correctIndices = currentQuestion.correct_indices.sort();
      const userAnswers = [...selectedAnswers].sort();
      correct = JSON.stringify(correctIndices) === JSON.stringify(userAnswers);

      // Berechne partielle Antwort-Info
      const correctSelected = selectedAnswers.filter(i => currentQuestion.correct_indices.includes(i)).length;
      const wrongSelected = selectedAnswers.filter(i => !currentQuestion.correct_indices.includes(i)).length;
      const totalCorrect = currentQuestion.correct_indices.length;

      // Berechne Punkte: richtig - falsch, aber mindestens 0
      earnedPoints = Math.max(0, correctSelected - wrongSelected);

      if (correctSelected > 0 && !correct) {
        setPartialAnswerInfo({ correctCount: correctSelected, totalCount: totalCorrect });
      } else {
        setPartialAnswerInfo(null);
      }
    }

    // Aktualisiere Score (für vollständig richtige Antworten)
    if (correct) {
      setScore(score + 1);
    }

    // Aktualisiere Gesamtpunkte (auch für partielle Antworten)
    setTotalPoints(prev => prev + earnedPoints);

    setIsCorrect(correct);
    setSubmitted(true);

    const newAnswered = [...answeredQuestions];
    newAnswered[currentQuestionIndex] = true;
    setAnsweredQuestions(newAnswered);

    // Speichere Progress nach jeder Antwort
    setTimeout(() => saveProgress(), 100);
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      setSelectedAnswers([]);
      setMathAnswer('');
      setShowHint(false);
      setSubmitted(false);
      setIsCorrect(false);
      setPartialAnswerInfo(null);

      // Speichere Progress
      saveProgress(newIndex);
    } else {
      await saveQuizCompletion();
      await loadLeaderboard();
      setShowResult(true);
      // Lösche Progress nach Abschluss
      if (user) {
        localStorage.removeItem(`daily-quiz-${user.id}-${semester}`);
      }
    }
  };

  const loadLeaderboard = async () => {
    try {
      const response = await fetch(`/api/daily-quiz/leaderboard?semester=${semester}`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
        setStatistics(data.statistics || null);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Rangliste:', error);
    }
  };

  const saveProgress = (index?: number) => {
    if (!user) return;

    const progress = {
      date: new Date().toISOString().split('T')[0],
      currentQuestionIndex: index !== undefined ? index : currentQuestionIndex,
      score,
      totalPoints,
      answeredQuestions
    };

    localStorage.setItem(`daily-quiz-${user.id}-${semester}`, JSON.stringify(progress));
  };

  const saveQuizCompletion = async () => {
    if (!user) return;

    try {
      // Hole aktuelles Auth-Token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Kein gültiges Auth-Token');
      }

      console.log('Speichere Quiz-Ergebnis:', { semester, score, totalPoints, quizDate });

      // Sende Ergebnis an Server
      const response = await fetch('/api/daily-quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          semester,
          score,
          totalPoints,
          quizDate // Sende das gespeicherte Quiz-Datum mit
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unbekannter Fehler' }));
        console.error('Server-Fehler:', response.status, errorData);
        throw new Error(`Fehler beim Speichern: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('Quiz-Ergebnis gespeichert:', data);
    } catch (error) {
      console.error('Fehler beim Speichern des Quiz-Ergebnisses:', error);
      // Zeige Fehler dem Benutzer, aber breche nicht ab
      alert(`Fehler beim Speichern: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`);
    }
  };

  // Zeige Loading während Auth lädt
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Authentifizierung...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Lade Daily Quiz...</p>
        </div>
      </div>
    );
  }

  const toggleBlur = () => {
    const newBlurState = !blurredResult;
    setBlurredResult(newBlurState);

    // Speichere Blur-State in localStorage
    if (user) {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`daily-quiz-blur-${user.id}-${semester}`, JSON.stringify({
        date: today,
        blurred: newBlurState
      }));
    }
  };

  if (!canTakeQuiz && userResult) {
    const percentage = Math.round((userResult.score / userResult.totalQuestions) * 100);

    // Leistungskategorien mit passenden Nachrichten
    let title: string;
    let message: string;
    let icon: React.ReactElement;

    if (percentage >= 90) {
      title = 'Herausragend! 🏆';
      message = 'Du hast das Quiz mit Bravour gemeistert! Dein Wissen ist beeindruckend.';
      icon = <Trophy className="w-20 h-20 text-yellow-500" />;
    } else if (percentage >= 75) {
      title = 'Super gemacht! 🎉';
      message = 'Sehr gut! Du hast den Großteil der Fragen richtig beantwortet.';
      icon = <Trophy className="w-20 h-20 text-green-500" />;
    } else if (percentage >= 60) {
      title = 'Gut gemacht! ✓';
      message = 'Solide Leistung! Du bist auf dem richtigen Weg.';
      icon = <CheckCircle className="w-20 h-20 text-blue-500" />;
    } else if (percentage >= 40) {
      title = 'Guter Einstieg! 💪';
      message = 'Du bist auf einem guten Weg! Schau dir die Lerninhalte nochmal an, um morgen noch besser abzuschneiden.';
      icon = <Brain className="w-20 h-20 text-orange-500" />;
    } else if (percentage >= 20) {
      title = 'Jeder Anfang ist schwer! 🌱';
      message = 'Lass dich nicht entmutigen! Nimm dir Zeit für die Lerninhalte und probiere es morgen nochmal. Du wirst sehen, es wird besser!';
      icon = <Brain className="w-20 h-20 text-orange-500" />;
    } else {
      title = 'Bleib dran! 📚';
      message = 'Rom wurde auch nicht an einem Tag erbaut! Gehe die Lerninhalte Schritt für Schritt durch und versuche es morgen wieder. Du schaffst das!';
      icon = <Brain className="w-20 h-20 text-blue-500" />;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-border">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4">
                {icon}
              </div>
              <CardTitle className="text-3xl">
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-muted rounded-lg p-6 relative">
                <div className={`transition-all ${blurredResult ? 'blur-md' : ''}`}>
                  <p className="text-5xl font-bold text-foreground font-serif mb-2">
                    {userResult.score} / {userResult.totalQuestions}
                  </p>
                  <p className="text-gray-600">richtige Antworten</p>
                  <p className="text-2xl font-semibold text-primary mt-2">
                    {percentage}%
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Gesamt: {userResult.totalPoints} Punkte
                  </p>
                </div>
                {blurredResult && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      onClick={toggleBlur}
                      variant="outline"
                      size="lg"
                      className="bg-white/90 backdrop-blur-sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ergebnis anzeigen
                    </Button>
                  </div>
                )}
                {!blurredResult && (
                  <Button
                    onClick={toggleBlur}
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                  >
                    <EyeOff className="w-4 h-4 mr-2" />
                    Ausblenden
                  </Button>
                )}
              </div>

              <p className="text-gray-600 text-lg">
                {message}
              </p>

              <p className="text-sm text-gray-500">
                Das nächste Quiz ist um 04:00 Uhr verfügbar.
              </p>

              {/* Lernziele Section */}
              {uniqueLernziele.length > 0 && (
                <div className="bg-white border-2 border-border rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Behandelte Lernziele in diesem Quiz:
                  </h3>
                  <div className="space-y-2">
                    {uniqueLernziele.map(lz => (
                      <Link
                        key={lz.id}
                        href={`/lernziel/${lz.slug}`}
                        className="block p-2 rounded hover:bg-primary/10 transition-colors text-primary hover:text-foreground text-sm"
                      >
                        → {lz.fach?.name && <span className="text-gray-500">{lz.fach.name}: </span>}{lz.titel}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Statistiken Section */}
              {statistics && (
                <div className={`border-2 rounded-lg p-4 ${
                  statistics.difficultyLevel === 'easy'
                    ? 'border-green-200 bg-green-50'
                    : statistics.difficultyLevel === 'medium'
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-orange-200 bg-orange-50'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className={`w-5 h-5 ${
                      statistics.difficultyLevel === 'easy'
                        ? 'text-green-600'
                        : statistics.difficultyLevel === 'medium'
                        ? 'text-yellow-600'
                        : 'text-orange-600'
                    }`} />
                    <h3 className="font-semibold text-gray-800">Quiz-Statistiken</h3>
                  </div>
                  <p className={`text-sm mb-4 ${
                    statistics.difficultyLevel === 'easy'
                      ? 'text-green-800'
                      : statistics.difficultyLevel === 'medium'
                      ? 'text-yellow-800'
                      : 'text-orange-800'
                  }`}>
                    {statistics.difficultyMessage}
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Users className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                      <p className="text-xl font-bold text-gray-800">{statistics.totalParticipants}</p>
                      <p className="text-xs text-gray-600">Teilnehmer</p>
                    </div>
                    <div>
                      <TrendingUp className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                      <p className="text-xl font-bold text-gray-800">{statistics.avgPercentage}%</p>
                      <p className="text-xs text-gray-600">Durchschnitt</p>
                    </div>
                    <div>
                      <Trophy className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                      <p className="text-xl font-bold text-gray-800">{statistics.avgPoints}</p>
                      <p className="text-xs text-gray-600">Punkte</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Leaderboard Section */}
              {leaderboard.length > 0 && (
                <div className="bg-white border-2 border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      Heutige Rangliste
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowLeaderboard(!showLeaderboard)}
                    >
                      {showLeaderboard ? 'Ausblenden' : 'Anzeigen'}
                    </Button>
                  </div>

                  {showLeaderboard && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {leaderboard.map((entry, index) => {
                        const isCurrentUser = user && (entry.userId === user.id);
                        return (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-2 rounded ${
                              isCurrentUser ? 'bg-primary/10 border border-purple-200' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`font-bold w-8 text-center ${
                                entry.rank === 1 ? 'text-yellow-600' :
                                entry.rank === 2 ? 'text-gray-500' :
                                entry.rank === 3 ? 'text-orange-600' :
                                'text-gray-400'
                              }`}>
                                {entry.rank === 1 ? '🥇' :
                                 entry.rank === 2 ? '🥈' :
                                 entry.rank === 3 ? '🥉' :
                                 `#${entry.rank}`}
                              </span>
                              <div className="flex items-center gap-1">
                                {entry.isAnonymous && !isCurrentUser && (
                                  <EyeOff className="w-3 h-3 text-gray-400" />
                                )}
                                <span className={`text-sm ${
                                  isCurrentUser ? 'font-semibold text-primary' :
                                  entry.isAnonymous ? 'text-gray-500 italic' : 'text-gray-700'
                                }`}>
                                  {entry.username}
                                  {isCurrentUser && entry.isAnonymous && (
                                    <span className="ml-1 text-xs text-gray-400 font-normal">(du, anonym)</span>
                                  )}
                                  {isCurrentUser && !entry.isAnonymous && (
                                    <span className="ml-1 text-xs text-primary font-normal">(du)</span>
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span>{entry.totalPoints} Punkte</span>
                              <span className="text-xs text-gray-400">({entry.score}/{userResult.totalQuestions})</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={() => router.push('/explore')}
                className="bg-primary"
              >
                <Home className="w-4 h-4 mr-2" />
                Zurück zum Lernen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-12 text-center">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Keine Fragen verfügbar
            </h3>
            <p className="text-gray-500 mb-6">
              Für Semester {semester} wurden noch keine Fragen hinzugefügt.
            </p>
            <Button
              onClick={() => router.push('/settings')}
              variant="outline"
            >
              Zu den Einstellungen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);

    // Leistungskategorien mit passenden Nachrichten
    let title: string;
    let message: string;
    let icon: React.ReactElement;

    if (percentage >= 90) {
      title = 'Herausragend! 🏆';
      message = 'Du hast das Quiz mit Bravour gemeistert! Dein Wissen ist beeindruckend.';
      icon = <Trophy className="w-20 h-20 text-yellow-500" />;
    } else if (percentage >= 75) {
      title = 'Super gemacht! 🎉';
      message = 'Sehr gut! Du hast den Großteil der Fragen richtig beantwortet.';
      icon = <Trophy className="w-20 h-20 text-green-500" />;
    } else if (percentage >= 60) {
      title = 'Gut gemacht! ✓';
      message = 'Solide Leistung! Du bist auf dem richtigen Weg.';
      icon = <CheckCircle className="w-20 h-20 text-blue-500" />;
    } else if (percentage >= 40) {
      title = 'Guter Einstieg! 💪';
      message = 'Du bist auf einem guten Weg! Schau dir die Lerninhalte nochmal an, um morgen noch besser abzuschneiden.';
      icon = <Brain className="w-20 h-20 text-orange-500" />;
    } else if (percentage >= 20) {
      title = 'Jeder Anfang ist schwer! 🌱';
      message = 'Lass dich nicht entmutigen! Nimm dir Zeit für die Lerninhalte und probiere es morgen nochmal. Du wirst sehen, es wird besser!';
      icon = <Brain className="w-20 h-20 text-orange-500" />;
    } else {
      title = 'Bleib dran! 📚';
      message = 'Rom wurde auch nicht an einem Tag erbaut! Gehe die Lerninhalte Schritt für Schritt durch und versuche es morgen wieder. Du schaffst das!';
      icon = <Brain className="w-20 h-20 text-blue-500" />;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-border">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4">
                {icon}
              </div>
              <CardTitle className="text-3xl">
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-muted rounded-lg p-6">
                <p className="text-5xl font-bold text-foreground font-serif mb-2">
                  {score} / {questions.length}
                </p>
                <p className="text-gray-600">richtige Antworten</p>
                <p className="text-2xl font-semibold text-primary mt-2">
                  {percentage}%
                </p>
              </div>

              <p className="text-gray-600 text-lg">
                {message}
              </p>

              <div className="bg-white border-2 border-border rounded-lg p-4 text-left">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Behandelte Lernziele in diesem Quiz:
                </h3>
                {uniqueLernziele.length > 0 ? (
                  <div className="space-y-2">
                    {uniqueLernziele.map(lz => (
                      <Link
                        key={lz.id}
                        href={`/lernziel/${lz.slug}`}
                        className="block p-2 rounded hover:bg-primary/10 transition-colors text-primary hover:text-foreground text-sm"
                      >
                        → {lz.fach?.name && <span className="text-gray-500">{lz.fach.name}: </span>}{lz.titel}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Keine Lernziele mit diesem Quiz verknüpft.</p>
                )}
              </div>

              {/* Statistiken Section */}
              {statistics && (
                <div className={`border-2 rounded-lg p-4 ${
                  statistics.difficultyLevel === 'easy'
                    ? 'border-green-200 bg-green-50'
                    : statistics.difficultyLevel === 'medium'
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-orange-200 bg-orange-50'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className={`w-5 h-5 ${
                      statistics.difficultyLevel === 'easy'
                        ? 'text-green-600'
                        : statistics.difficultyLevel === 'medium'
                        ? 'text-yellow-600'
                        : 'text-orange-600'
                    }`} />
                    <h3 className="font-semibold text-gray-800">Quiz-Statistiken</h3>
                  </div>
                  <p className={`text-sm mb-4 ${
                    statistics.difficultyLevel === 'easy'
                      ? 'text-green-800'
                      : statistics.difficultyLevel === 'medium'
                      ? 'text-yellow-800'
                      : 'text-orange-800'
                  }`}>
                    {statistics.difficultyMessage}
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <Users className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                      <p className="text-xl font-bold text-gray-800">{statistics.totalParticipants}</p>
                      <p className="text-xs text-gray-600">Teilnehmer</p>
                    </div>
                    <div>
                      <TrendingUp className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                      <p className="text-xl font-bold text-gray-800">{statistics.avgPercentage}%</p>
                      <p className="text-xs text-gray-600">Durchschnitt</p>
                    </div>
                    <div>
                      <Trophy className="w-4 h-4 mx-auto mb-1 text-gray-500" />
                      <p className="text-xl font-bold text-gray-800">{statistics.avgPoints}</p>
                      <p className="text-xs text-gray-600">Punkte</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Leaderboard Section */}
              {leaderboard.length > 0 && (
                <div className="bg-white border-2 border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      Heutige Rangliste
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowLeaderboard(!showLeaderboard)}
                    >
                      {showLeaderboard ? 'Ausblenden' : 'Anzeigen'}
                    </Button>
                  </div>

                  {showLeaderboard && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {leaderboard.map((entry, index) => {
                        const isCurrentUser = user && (entry.userId === user.id);
                        return (
                          <div
                            key={index}
                            className={`flex items-center justify-between p-2 rounded ${
                              isCurrentUser ? 'bg-primary/10 border border-purple-200' : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`font-bold w-8 text-center ${
                                entry.rank === 1 ? 'text-yellow-600' :
                                entry.rank === 2 ? 'text-gray-500' :
                                entry.rank === 3 ? 'text-orange-600' :
                                'text-gray-400'
                              }`}>
                                {entry.rank === 1 ? '🥇' :
                                 entry.rank === 2 ? '🥈' :
                                 entry.rank === 3 ? '🥉' :
                                 `#${entry.rank}`}
                              </span>
                              <div className="flex items-center gap-1">
                                {entry.isAnonymous && !isCurrentUser && (
                                  <EyeOff className="w-3 h-3 text-gray-400" />
                                )}
                                <span className={`text-sm ${
                                  isCurrentUser ? 'font-semibold text-primary' :
                                  entry.isAnonymous ? 'text-gray-500 italic' : 'text-gray-700'
                                }`}>
                                  {entry.username}
                                  {isCurrentUser && entry.isAnonymous && (
                                    <span className="ml-1 text-xs text-gray-400 font-normal">(du, anonym)</span>
                                  )}
                                  {isCurrentUser && !entry.isAnonymous && (
                                    <span className="ml-1 text-xs text-primary font-normal">(du)</span>
                                  )}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span>{entry.totalPoints} Punkte</span>
                              <span className="text-xs text-gray-400">({entry.score}/{questions.length})</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={() => router.push('/explore')}
                className="bg-primary"
              >
                <Home className="w-4 h-4 mr-2" />
                Zurück zum Lernen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isMath = isMathQuestion(currentQuestion);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-800">
                Daily Quiz - {semester}. Fachsemester
              </h1>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
              Frage {currentQuestionIndex + 1} / {questions.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Frage Card */}
        <Card className="border-2 border-border mb-6">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-xl leading-relaxed flex-1">
                {currentQuestion.question_text}
              </CardTitle>
              {currentQuestion.hint && !submitted && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="flex-shrink-0"
                >
                  {showHint ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Tipp ausblenden
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Tipp
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tipp */}
            {showHint && currentQuestion.hint && !submitted && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <Lightbulb className="w-4 h-4 inline mr-1" />
                  <strong>Tipp:</strong> {currentQuestion.hint}
                </p>
              </div>
            )}

            {/* Hinweis bei mehreren richtigen Antworten */}
            {!isMath && currentQuestion.correct_indices && currentQuestion.correct_indices.length > 1 && !submitted && (
              <div className="text-sm text-gray-600 font-medium">
                Mehrere Antworten möglich
              </div>
            )}

            {/* Hinweis bei Mathe-Fragen */}
            {isMath && !submitted && (
              <div className="text-xs text-gray-500 italic">
                Hinweis: Verwende Punkt statt Komma (z.B. 1.0 statt 1,0)
              </div>
            )}

            {isMath ? (
              /* Mathe-Eingabe mit Extrazeichen */
              <div className="space-y-4">
                <p className="text-sm font-medium text-gray-700">
                  Gib deine Antwort ein:
                </p>
                <Input
                  ref={inputRef}
                  type="text"
                  value={mathAnswer}
                  onChange={(e) => setMathAnswer(e.target.value)}
                  placeholder="Deine Antwort..."
                  className="text-lg p-4"
                  disabled={submitted}
                />

                {/* Extrazeichen-Tabelle */}
                <div className="border-2 border-border rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Häufig genutzte Zeichen:</p>
                  <div className="grid grid-cols-7 gap-1 mb-3">
                    {MATH_SYMBOLS.häufig.map((item) => (
                      <button
                        key={item.symbol}
                        onClick={() => insertSymbol(item.symbol)}
                        disabled={submitted}
                        className="px-2 py-1 text-sm border border-border rounded hover:bg-primary/10 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title={item.label}
                      >
                        {item.symbol}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Weitere Zeichen:</p>
                  <div className="grid grid-cols-7 gap-1">
                    {MATH_SYMBOLS.erweitert.map((item) => (
                      <button
                        key={item.symbol}
                        onClick={() => insertSymbol(item.symbol)}
                        disabled={submitted}
                        className="px-2 py-1 text-sm border border-border rounded hover:bg-primary/10 hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title={item.label}
                      >
                        {item.symbol}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Multiple Choice */
              currentQuestion.options && currentQuestion.options.length > 0 ? (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswers.includes(index);
                    const isCorrectAnswer = currentQuestion.correct_indices.includes(index);
                    const isSingleChoice = currentQuestion.correct_indices.length === 1;

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={submitted}
                        className={`
                          w-full text-left p-4 rounded-lg border-2 transition-all
                          ${submitted
                            ? isCorrectAnswer
                              ? 'border-green-500 bg-green-50'
                              : isSelected
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 bg-gray-50'
                            : isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-200 bg-white hover:border-primary'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          {/* Radio-Button für Single-Choice, Checkbox für Multiple-Choice */}
                          <div className={`
                            w-6 h-6 border-2 flex items-center justify-center
                            ${isSingleChoice ? 'rounded-full' : 'rounded'}
                            ${submitted
                              ? isCorrectAnswer
                                ? 'border-green-500 bg-green-500'
                                : isSelected
                                ? 'border-red-500 bg-red-500'
                                : 'border-gray-300'
                              : isSelected
                              ? 'border-primary bg-primary/100'
                              : 'border-gray-300'
                            }
                          `}>
                            {(isSelected || (submitted && isCorrectAnswer)) && (
                              isSingleChoice ? (
                                <div className="w-3 h-3 bg-white rounded-full" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-white" />
                              )
                            )}
                          </div>
                          <span className="flex-1">{option}</span>
                          {submitted && isCorrectAnswer && !isSelected && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                          {submitted && isSelected && !isCorrectAnswer && (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Keine Antwortoptionen verfügbar</p>
              )
            )}

            {/* Ergebnis nach Submit */}
            {submitted && (
              <div className={`p-4 rounded-lg border-2 ${
                isCorrect
                  ? 'bg-green-50 border-green-200'
                  : partialAnswerInfo
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle className="text-green-600" size={24} />
                      <span className="font-bold text-green-800">Richtig!</span>
                    </>
                  ) : partialAnswerInfo ? (
                    <>
                      <CheckCircle className="text-yellow-600" size={24} />
                      <span className="font-bold text-yellow-800">
                        Fast! Du hast {partialAnswerInfo.correctCount} von {partialAnswerInfo.totalCount} richtigen Antworten gefunden.
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-red-600" size={24} />
                      <span className="font-bold text-red-800">Leider falsch.</span>
                    </>
                  )}
                </div>
                {currentQuestion.explanation && (
                  <p className="text-sm text-gray-700 mt-2">{currentQuestion.explanation}</p>
                )}
                {!isCorrect && isMath && currentQuestion.answer && (
                  <p className="text-sm text-gray-700 mt-2">
                    <strong>Richtige Antwort:</strong> {currentQuestion.answer}
                  </p>
                )}
              </div>
            )}

            {/* Submit/Weiter Button */}
            {!submitted ? (
              <Button
                onClick={handleSubmit}
                disabled={isMath ? mathAnswer.trim() === '' : selectedAnswers.length === 0}
                className="w-full bg-primary"
                size="lg"
              >
                Antwort überprüfen
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="w-full bg-primary"
                size="lg"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Nächste Frage' : 'Quiz beenden'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Abbrechen Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => router.push('/explore')}
            variant="outline"
          >
            Abbrechen
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DailyQuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Lade Daily Quiz...</p>
        </div>
      </div>
    }>
      <DailyQuizContent />
    </Suspense>
  );
}
