'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Loader2, ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  totalPoints: number;
  totalQuestions: number;
  percentage: number;
  quiz_date: string;
}

export default function RanglistePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    loadAvailableDates();
  }, [user, authLoading, router]);

  useEffect(() => {
    if (selectedDate) {
      loadLeaderboard(selectedDate);
    }
  }, [selectedDate]);

  const loadAvailableDates = async () => {
    try {
      const response = await fetch('/api/daily-quiz/leaderboard/dates');
      if (response.ok) {
        const data = await response.json();
        setAvailableDates(data.dates || []);
        // Setze das neueste Datum als Standard
        if (data.dates && data.dates.length > 0) {
          setSelectedDate(data.dates[0]);
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der verfügbaren Daten:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async (date: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/daily-quiz/leaderboard/all?date=${date}`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Rangliste:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/explore">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-800">Daily Quiz Rangliste</h1>
          </div>
          <p className="text-gray-600">
            Hier siehst du die Rangliste aller Teilnehmer des Daily Quiz
          </p>
        </div>

        {/* Datum Auswahl */}
        {availableDates.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Datum auswählen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {availableDates.map((date) => (
                  <option key={date} value={date}>
                    {formatDate(date)}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>
        )}

        {/* Rangliste */}
        <Card className="border-2 border-border">
          <CardHeader>
            <CardTitle className="text-xl">
              {selectedDate ? `Rangliste vom ${formatDate(selectedDate)}` : 'Rangliste'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                <p className="text-gray-600">Lade Rangliste...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Noch keine Einträge für diesen Tag</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => {
                  const isCurrentUser = profile && entry.username === profile.username;
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                        isCurrentUser
                          ? 'bg-primary/10 border-primary'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`font-bold text-xl w-12 text-center ${
                            entry.rank === 1
                              ? 'text-yellow-600'
                              : entry.rank === 2
                              ? 'text-gray-500'
                              : entry.rank === 3
                              ? 'text-orange-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                        </span>
                        <div>
                          <span
                            className={`font-semibold ${
                              isCurrentUser ? 'text-primary' : 'text-gray-800'
                            }`}
                          >
                            {entry.username}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs bg-primary text-white px-2 py-1 rounded">
                                Du
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-right">
                          <div className="font-semibold text-gray-800">
                            {entry.totalPoints} Punkte
                          </div>
                          <div className="text-xs text-gray-500">
                            {entry.score}/{entry.totalQuestions} richtig
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary text-lg">
                            {entry.percentage}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800">
              <strong>Hinweis:</strong> Die Rangliste zeigt die Ergebnisse aller Teilnehmer mit ihrem Benutzernamen,
              der Anzahl der Punkte und dem prozentualen Ergebnis vom Daily Quiz.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
