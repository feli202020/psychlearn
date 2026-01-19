'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Trophy, CheckCircle, Clock, Brain, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getCurrentQuizDate, formatQuizDate } from '@/lib/daily-quiz-utils';

export default function DailyQuizWidget() {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isResultBlurred, setIsResultBlurred] = useState(false);
  const [quizStatus, setQuizStatus] = useState<'loading' | 'available' | 'completed'>('loading');
  const [result, setResult] = useState<{ score: number; totalQuestions: number } | null>(null);
  const [userSemester, setUserSemester] = useState(1);

  useEffect(() => {
    if (!user) {
      setQuizStatus('loading');
      return;
    }

    loadUserSettings();
    checkQuizStatus();
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_settings')
        .select('semester')
        .eq('user_id', user.id)
        .single();

      if (data?.semester) {
        setUserSemester(data.semester);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Benutzereinstellungen:', error);
    }
  };

  const checkQuizStatus = async () => {
    if (!user) return;

    try {
      const quizDate = getCurrentQuizDate();

      // Prüfe ob es eine Quiz-Session für heute gibt
      const { data: sessionData } = await supabase
        .from('daily_quiz_sessions')
        .select('id, question_ids')
        .eq('quiz_date', quizDate)
        .eq('semester', userSemester)
        .single();

      if (sessionData) {
        // Prüfe ob der Benutzer heute bereits teilgenommen hat
        const { data: resultData } = await supabase
          .from('daily_quiz_results')
          .select('score, total_points')
          .eq('user_id', user.id)
          .eq('session_id', sessionData.id)
          .single();

        if (resultData) {
          setQuizStatus('completed');
          setResult({
            score: resultData.score,
            totalQuestions: sessionData.question_ids?.length || 20
          });
        } else {
          setQuizStatus('available');
        }
      } else {
        setQuizStatus('available');
      }
    } catch (error) {
      console.error('Fehler beim Prüfen des Quiz-Status:', error);
      setQuizStatus('available');
    }
  };

  if (!user) return null;

  const percentage = result ? Math.round((result.score / result.totalQuestions) * 100) : 0;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-200">
      <div className="container mx-auto px-4">
        {/* Header - immer sichtbar */}
        <div className="flex items-center justify-between py-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Trophy className="w-5 h-5 text-primary" />
            <span className="font-semibold text-gray-800">Daily Quiz</span>

            {quizStatus === 'completed' && result && !isResultBlurred && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                <CheckCircle className="w-3 h-3 mr-1" />
                {result.score}/{result.totalQuestions} ({percentage}%)
              </Badge>
            )}

            {quizStatus === 'completed' && result && isResultBlurred && (
              <Badge variant="outline" className="bg-gray-100 text-gray-500 border-gray-300">
                <CheckCircle className="w-3 h-3 mr-1" />
                Abgeschlossen
              </Badge>
            )}

            {quizStatus === 'available' && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                <Clock className="w-3 h-3 mr-1" />
                Verfügbar
              </Badge>
            )}

            <div className="ml-auto">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </div>
          </button>
        </div>

        {/* Ausgeklappter Inhalt */}
        {isExpanded && (
          <div className="pb-4 space-y-3">
            {quizStatus === 'loading' && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">Lade Quiz-Status...</p>
              </div>
            )}

            {quizStatus === 'available' && (
              <div className="bg-white rounded-lg p-4 border-2 border-purple-200 space-y-3">
                <div className="flex items-start gap-3">
                  <Brain className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      Heutiges Quiz verfügbar!
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Teste dein Wissen mit 20 Fragen für dein {userSemester}. Fachsemester.
                    </p>
                    <Link href={`/daily-quiz?semester=${userSemester}`}>
                      <Button
                        className="bg-primary w-full"
                        size="sm"
                      >
                        <Trophy className="w-4 h-4 mr-2" />
                        Quiz starten
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {quizStatus === 'completed' && result && (
              <div className="bg-white rounded-lg p-4 border-2 border-purple-200 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-800">
                        Quiz abgeschlossen!
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsResultBlurred(!isResultBlurred);
                        }}
                        className="text-gray-500 hover:text-gray-700 -mt-1"
                        title={isResultBlurred ? "Ergebnis anzeigen" : "Ergebnis ausblenden"}
                      >
                        {isResultBlurred ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className={`space-y-2 transition-all ${isResultBlurred ? 'blur-sm select-none' : ''}`}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Dein Ergebnis:</span>
                        <span className="font-bold text-primary">
                          {result.score} / {result.totalQuestions} ({percentage}%)
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Das nächste Quiz ist um 04:00 Uhr verfügbar.
                      </p>
                    </div>
                    <Link href={`/daily-quiz?semester=${userSemester}`}>
                      <Button
                        variant="outline"
                        className="w-full mt-2"
                        size="sm"
                      >
                        Ergebnisse ansehen
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
