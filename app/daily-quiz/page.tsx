export const dynamic = "force-dynamic";

'use client';

import { useState, useEffect, useRef } from 'react';
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
  BookOpen
} from 'lucide-react';
import { getModuleGroupedBySemester, getQuestionsByModule } from '@/lib/database';
import { Question } from '@/lib/types';
import { supabase } from '@/lib/supabase';

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

export default function DailyQuizPage() {
  const { user } = useAuth();
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

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    checkLastQuizDate();
  }, [user, semester, router]);

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
  }, [user, semester, questions.length]);

  const checkLastQuizDate = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('last_quiz_date')
        .eq('id', user.id)
        .single();

      const today = new Date().toISOString().split('T')[0];

      if (data?.last_quiz_date === today) {
        setCanTakeQuiz(false);
        setLoading(false);
      } else {
        setCanTakeQuiz(true);
        loadDailyQuiz();
      }
    } catch (error) {
      console.error('Fehler beim Prüfen des Quiz-Datums:', error);
      loadDailyQuiz();
    }
  };

  const loadDailyQuiz = async () => {
    setLoading(true);
    try {
      const moduleGrouped = await getModuleGroupedBySemester();
      const semesterModule = moduleGrouped[semester] || [];

      if (semesterModule.length === 0) {
        console.log('Keine Module für Semester', semester);
        setLoading(false);
        return;
      }

      const allQuestions: Question[] = [];

      // Sammle alle Fragen aus allen Modulen
      for (const modul of semesterModule) {
        const moduleQuestions = await getQuestionsByModule(modul.id);
        allQuestions.push(...moduleQuestions);
      }

      // Mische alle Fragen und wähle 20 aus
      const shuffled = allQuestions.sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 20);

      // Shuffle Optionen für Multiple Choice Fragen
      const processedQuestions = selected.map(q => {
        // Nur shufflen wenn es options gibt (Multiple Choice)
        if (!q.options || !Array.isArray(q.options) || q.answer !== null) {
          return q;
        }

        const indices = [0, 1, 2, 3];
        const shuffledIndices = indices.sort(() => Math.random() - 0.5);

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

      setQuestions(processedQuestions);
      setAnsweredQuestions(new Array(processedQuestions.length).fill(false));

      // Extrahiere eindeutige Lernziele aus den Fragen
      const lernzielIds = new Set(processedQuestions.map(q => q.lernziel_id).filter(Boolean));

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
          console.log('Geladene Lernziele:', lernzieleData);
          setUniqueLernziele(lernzieleData as any[]);
          console.log('Transformierte Lernziele:', lernzieleData);
        } else {
          console.log('Keine Lernziele gefunden für IDs:', Array.from(lernzielIds));
        }
      }

      console.log(`Daily Quiz geladen: ${selected.length} Fragen aus ${semesterModule.length} Modulen`);
    } catch (error) {
      console.error('Fehler beim Laden des Daily Quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const isMathQuestion = (question: Question): boolean => {
    return question.module_id === '00000000-0000-0000-0000-000000000101' ||
           question.module_id === '00000000-0000-0000-0000-000000000106' ||
           question.answer !== null;
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
      setShowResult(true);
      // Lösche Progress nach Abschluss
      if (user) {
        localStorage.removeItem(`daily-quiz-${user.id}-${semester}`);
      }
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

    const today = new Date().toISOString().split('T')[0];

    try {
      await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          last_quiz_date: today,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });
    } catch (error) {
      console.error('Fehler beim Speichern des Quiz-Datums:', error);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Lade Daily Quiz...</p>
        </div>
      </div>
    );
  }

  if (!canTakeQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-purple-200">
          <CardContent className="p-12 text-center">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Quiz bereits absolviert!
            </h3>
            <p className="text-gray-600 mb-4">
              Du hast dein Daily Quiz heute bereits abgeschlossen.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Das nächste Quiz ist um 00:00 Uhr verfügbar.
            </p>
            <Button
              onClick={() => router.push('/explore')}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              <Home className="w-4 h-4 mr-2" />
              Zurück zum Lernen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
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
    let badgeColor: string;

    if (percentage >= 90) {
      title = 'Herausragend! 🏆';
      message = 'Du hast das Quiz mit Bravour gemeistert! Dein Wissen ist beeindruckend.';
      icon = <Trophy className="w-20 h-20 text-yellow-500" />;
      badgeColor = 'bg-yellow-50 text-yellow-700 border-yellow-300';
    } else if (percentage >= 75) {
      title = 'Super gemacht! 🎉';
      message = 'Sehr gut! Du hast den Großteil der Fragen richtig beantwortet.';
      icon = <Trophy className="w-20 h-20 text-green-500" />;
      badgeColor = 'bg-green-50 text-green-700 border-green-300';
    } else if (percentage >= 60) {
      title = 'Gut gemacht! ✓';
      message = 'Solide Leistung! Du bist auf dem richtigen Weg.';
      icon = <CheckCircle className="w-20 h-20 text-blue-500" />;
      badgeColor = 'bg-blue-50 text-blue-700 border-blue-300';
    } else if (percentage >= 40) {
      title = 'Das war ein Anfang! 💪';
      message = 'Nicht schlecht, aber da geht noch mehr! Wiederhole die Lerninhalte und versuch es morgen erneut.';
      icon = <Brain className="w-20 h-20 text-orange-500" />;
      badgeColor = 'bg-orange-50 text-orange-700 border-orange-300';
    } else {
      title = 'Weiter üben! 📚';
      message = 'Das war noch nicht so gut. Schau dir die Lerninhalte nochmal an und versuch es morgen erneut!';
      icon = <Brain className="w-20 h-20 text-red-500" />;
      badgeColor = 'bg-red-50 text-red-700 border-red-300';
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-purple-200">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4">
                {icon}
              </div>
              <CardTitle className="text-3xl">
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                <p className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  {score} / {questions.length}
                </p>
                <p className="text-gray-600">richtige Antworten</p>
                <p className="text-2xl font-semibold text-purple-600 mt-2">
                  {percentage}%
                </p>
              </div>

              <div className="space-y-2">
                <Badge
                  variant="outline"
                  className={`text-lg px-4 py-2 ${badgeColor}`}
                >
                  {percentage >= 60 ? 'Bestanden ✓' : 'Nicht bestanden'}
                </Badge>
              </div>

              <p className="text-gray-600">
                {message}
              </p>

              <div className="bg-white border-2 border-purple-200 rounded-lg p-4 text-left">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Behandelte Lernziele in diesem Quiz:
                </h3>
                {uniqueLernziele.length > 0 ? (
                  <div className="space-y-2">
                    {uniqueLernziele.map(lz => (
                      <Link
                        key={lz.id}
                        href={`/lernziel/${lz.slug}`}
                        className="block p-2 rounded hover:bg-purple-50 transition-colors text-purple-600 hover:text-purple-800 text-sm"
                      >
                        → {lz.fach?.name && <span className="text-gray-500">{lz.fach.name}: </span>}{lz.titel}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Keine Lernziele mit diesem Quiz verknüpft.</p>
                )}
              </div>

              <Button
                onClick={() => router.push('/explore')}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-800">
                Daily Quiz - {semester}. Fachsemester
              </h1>
            </div>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
              Frage {currentQuestionIndex + 1} / {questions.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Frage Card */}
        <Card className="border-2 border-purple-100 mb-6">
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
                <div className="border-2 border-gray-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Häufig genutzte Zeichen:</p>
                  <div className="grid grid-cols-7 gap-1 mb-3">
                    {MATH_SYMBOLS.häufig.map((item) => (
                      <button
                        key={item.symbol}
                        onClick={() => insertSymbol(item.symbol)}
                        disabled={submitted}
                        className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 bg-white hover:border-purple-300'
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
                              ? 'border-purple-500 bg-purple-500'
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
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
                size="lg"
              >
                Antwort überprüfen
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
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
