'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getLernzielBySlug, getVoraussetzungen } from '@/lib/database';
import { completeLernziel, getLernzielFortschritt } from '@/lib/gamification';
import { useAuth } from '@/lib/auth-context';
import { Lernziel } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Clock, BookOpen, Loader2, CheckCircle, Brain, RotateCcw } from 'lucide-react';
import MultipleChoiceBio from '@/components/aufgaben/MultipleChoiceBio';
import MathInputAdvanced from '@/components/aufgaben/MathInputAdvanced';

// Modul-IDs und ihre Fragenanzahl-Konfiguration
const MODULE_CONFIG: Record<string, { questionsToShow: number }> = {
  '00000000-0000-0000-0000-000000000102': { // Biologische Psychologie
    questionsToShow: 20,
  },
  '00000000-0000-0000-0000-000000000101': { // Quantitative Methoden I
    questionsToShow: 10,
  },
  '00000000-0000-0000-0000-000000000106': { // Quantitative Methoden II
    questionsToShow: 10,
  },
  // Weitere Module können hier hinzugefügt werden
};

// Hilfsfunktion: Prüft ob eine Frage eine Math-Input-Frage ist
// Eine Frage ist Math-Input, wenn das answer-Feld gefüllt ist
const isMathQuestion = (question: any): boolean => {
  return question.answer !== null && question.answer !== undefined;
};

// Zufällige Reihenfolge
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Shuffle Optionen und passe correct_indices an (nur für Multiple Choice)
function shuffleOptions(question: any) {
  // Nur shufflen wenn es options gibt (Multiple Choice)
  if (!question.options || !Array.isArray(question.options)) {
    return question;
  }
  
  const indices = [0, 1, 2, 3];
  const shuffledIndices = shuffleArray(indices);
  
  const shuffledOptions = shuffledIndices.map(i => question.options[i]);
  
  const shuffledCorrectIndices = question.correct_indices.map((correctIdx: number) => {
    return shuffledIndices.indexOf(correctIdx);
  });
  
  return {
    ...question,
    options: shuffledOptions,
    correct_indices: shuffledCorrectIndices
  };
}

// Wähle N zufällige Fragen aus einem Pool
function selectRandomQuestions(allQuestions: any[], count: number) {
  const shuffled = shuffleArray(allQuestions);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export default function LernzielDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user } = useAuth();

  const [lernziel, setLernziel] = useState<Lernziel | null>(null);
  const [voraussetzungen, setVoraussetzungen] = useState<Lernziel[]>([]);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(new Set());
  const [correctAnswers, setCorrectAnswers] = useState<Set<number>>(new Set());
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [fortschritt, setFortschritt] = useState<any>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [questionConfig, setQuestionConfig] = useState({ questionsToShow: 10 });

  useEffect(() => {
    // Prüfe, ob User eingeloggt ist
    if (!user) {
      router.push('/login?redirect=/lernziel/' + slug);
      return;
    }

    async function loadData() {
      setLoading(true);

      const lz = await getLernzielBySlug(slug);
      setLernziel(lz);
      
      if (lz) {
        // Konfiguration für dieses Modul laden
        const config = MODULE_CONFIG[lz.fach.id] || {
          questionsToShow: 10
        };
        setQuestionConfig(config);

        // Voraussetzungen laden (mit Error-Handling)
        try {
          const vr = await getVoraussetzungen(lz.id);
          setVoraussetzungen(vr);
        } catch (err) {
          // Ignoriere Fehler wenn keine Voraussetzungen-Tabelle existiert
          console.log('Keine Voraussetzungen vorhanden');
          setVoraussetzungen([]);
        }

        if (user) {
          const f = await getLernzielFortschritt(user.id, lz.id);
          setFortschritt(f);
        }

        // Fragen laden
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('lernziel_id', lz.id);
        
        if (error) {
          console.error('Fehler beim Laden der Fragen:', error);
        } else if (data && data.length > 0) {
          // Parse JSON-Felder
          const parsed = data.map((q: any) => {
            const parsedQuestion: any = { ...q };
            
            // Parse options und correct_indices (für Multiple Choice)
            if (q.options) {
              parsedQuestion.options = typeof q.options === 'string' 
                ? JSON.parse(q.options) 
                : q.options;
            }
            if (q.correct_indices) {
              parsedQuestion.correct_indices = typeof q.correct_indices === 'string'
                ? JSON.parse(q.correct_indices)
                : q.correct_indices;
            }
            
            return parsedQuestion;
          });
          
          setAllQuestions(parsed);
          
          // Wähle N zufällige Fragen basierend auf Modul-Konfiguration
          const initialSelection = selectRandomQuestions(parsed, config.questionsToShow);

          // Shuffle Optionen nur für Multiple Choice Fragen (nicht für Math-Input)
          const processedQuestions = initialSelection.map(q =>
            isMathQuestion(q) ? q : shuffleOptions(q)
          );

          setSelectedQuestions(processedQuestions);
        }
      }
      
      setLoading(false);
    }

    if (slug) {
      loadData();
    }
  }, [slug, user]);

  const handleAnswerComplete = (isCorrect: boolean, points?: number) => {
    setAnsweredQuestions(prev => new Set(prev).add(currentQuestionIndex));
    if (isCorrect) {
      setCorrectAnswers(prev => new Set(prev).add(currentQuestionIndex));
    }
    // Wenn Punkte übergeben wurden, addiere sie zum Gesamtscore
    if (points !== undefined && points > 0) {
      setTotalPoints(prev => prev + points);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setAnsweredQuestions(new Set());
    setCorrectAnswers(new Set());
    setTotalPoints(0);
    setQuizCompleted(false);

    // Wähle neue zufällige Fragen
    const newSelection = selectRandomQuestions(allQuestions, questionConfig.questionsToShow);
    // Shuffle Optionen nur für Multiple Choice Fragen (nicht für Math-Input)
    const processedQuestions = newSelection.map(q =>
      isMathQuestion(q) ? q : shuffleOptions(q)
    );
    setSelectedQuestions(processedQuestions);
  };

  async function handleComplete() {
    if (!user || !lernziel) return;
    setCompleting(true);

    try {
      await completeLernziel(user.id, lernziel.id, correctAnswers.size * 10);
      const f = await getLernzielFortschritt(user.id, lernziel.id);
      setFortschritt(f);
    } catch (error) {
      console.error('Fehler:', error);
      alert('Fehler beim Abschließen');
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Lade Lernziel...</p>
        </div>
      </div>
    );
  }

  if (!lernziel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Lernziel nicht gefunden</h1>
          <p className="text-gray-600 mb-4">Der Slug "{slug}" konnte nicht gefunden werden.</p>
          <Link href="/explore"><Button>Zurück zur Übersicht</Button></Link>
        </div>
      </div>
    );
  }

  const isCompleted = fortschritt?.abgeschlossen || false;
  const currentQuestion = selectedQuestions[currentQuestionIndex];
  const isCurrentAnswered = answeredQuestions.has(currentQuestionIndex);
  const scorePercentage = selectedQuestions.length > 0 ? 
    Math.round((correctAnswers.size / selectedQuestions.length) * 100) : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">

        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => {
            if (lernziel?.fach) {
              // Speichere Modul und Tab-Auswahl im sessionStorage
              sessionStorage.setItem('explore_selected_modul', JSON.stringify(lernziel.fach));
              sessionStorage.setItem('explore_active_tab', 'quiz');
              sessionStorage.setItem('explore_expand_semester', lernziel.klasse.toString());
            }
            router.push('/explore');
          }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zur Übersicht
        </Button>

        {/* Header */}
        <Card className="mb-8 border-2 border-border">
          <CardHeader className="bg-muted">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{lernziel.titel}</CardTitle>
                <p className="text-gray-600">{lernziel.beschreibung}</p>
              </div>
              {isCompleted && (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Abgeschlossen
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span>{'⭐'.repeat(lernziel.schwierigkeitsgrad)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>{lernziel.geschaetzte_dauer} Minuten</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span>{lernziel.fach?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {lernziel.klasse ? `${lernziel.klasse}. Semester` : 'Semester N/A'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Voraussetzungen */}
        {voraussetzungen.length > 0 && (
          <Card className="mb-8 border-2 border-border">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Voraussetzungen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {voraussetzungen.map(vr => (
                  <li key={vr.id}>
                    <Link href={`/lernziel/${vr.slug}`} className="text-primary hover:underline">
                      {vr.titel}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Quiz */}
        {selectedQuestions.length > 0 ? (
          !quizCompleted ? (
            <Card className="mb-8 border-2 border-border">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    Quiz ({selectedQuestions.length} zufällige Fragen)
                  </CardTitle>
                  <div className="text-sm text-gray-600">
                    {correctAnswers.size} / {selectedQuestions.length} richtig
                  </div>
                </div>
                <Progress value={(answeredQuestions.size / selectedQuestions.length) * 100} className="mt-2" />
              </CardHeader>
              <CardContent>
                {currentQuestion && (
                  <>
                    {isMathQuestion(currentQuestion) ? (
                      <MathInputAdvanced
                        question={currentQuestion}
                        onComplete={handleAnswerComplete}
                        questionNumber={currentQuestionIndex + 1}
                        totalQuestions={selectedQuestions.length}
                      />
                    ) : (
                      <MultipleChoiceBio
                        question={currentQuestion}
                        onComplete={handleAnswerComplete}
                        questionNumber={currentQuestionIndex + 1}
                        totalQuestions={selectedQuestions.length}
                      />
                    )}
                  </>
                )}
                
                <div className="flex justify-between mt-6">
                  <Button 
                    onClick={handlePrevious} 
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Zurück
                  </Button>
                  
                  <Button
                    onClick={handleNext}
                    disabled={!isCurrentAnswered}
                    className="bg-primary"
                  >
                    {currentQuestionIndex === selectedQuestions.length - 1 ? 'Abschließen' : 'Weiter'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-8 border-2 border-green-200 bg-green-50">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Quiz abgeschlossen!</h2>
                <p className="text-lg mb-6">
                  Du hast {correctAnswers.size} von {selectedQuestions.length} Fragen richtig beantwortet ({scorePercentage}%)
                </p>
                
                <div className="flex gap-4 justify-center">
                  <Button 
                    onClick={handleReset}
                    variant="outline"
                    size="lg"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Neues Quiz starten
                  </Button>
                  
                  {user && !isCompleted && scorePercentage >= 70 && (
                    <Button
                      onClick={handleComplete}
                      disabled={completing}
                      size="lg"
                      className="bg-accent"
                    >
                      {completing ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Speichern...</>
                      ) : (
                        <><CheckCircle className="w-4 h-4 mr-2" />Als abgeschlossen markieren</>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          <Card className="mb-8 border-2 border-border">
            <CardContent className="p-8 text-center">
              <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-6">Für dieses Lernziel sind noch keine Fragen verfügbar.</p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => {
              if (lernziel?.fach) {
                sessionStorage.setItem('explore_selected_modul', JSON.stringify(lernziel.fach));
                sessionStorage.setItem('explore_active_tab', 'quiz');
                sessionStorage.setItem('explore_expand_semester', lernziel.klasse.toString());
              }
              router.push('/explore');
            }}
          >
            Alle Lernziele
          </Button>
        </div>
      </div>
    </main>
  );
}