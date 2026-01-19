'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Loader2, ArrowLeft, Calendar, Users, TrendingUp, EyeOff, Eye, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  totalPoints: number;
  totalQuestions: number;
  percentage: number;
  quiz_date: string;
  isAnonymous?: boolean;
  userId?: string;
}

interface Statistics {
  totalParticipants: number;
  avgScore: number;
  avgPoints: number;
  avgPercentage: number;
  totalQuestions: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  difficultyMessage: string;
}

export default function RanglistePage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [savingAnonymity, setSavingAnonymity] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    loadAvailableDates();
    loadAnonymityStatus();
  }, [user, authLoading, router]);

  const loadAnonymityStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('anonymous_in_leaderboard')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setIsAnonymous(data.anonymous_in_leaderboard || false);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Anonymitaets-Status:', error);
    }
  };

  const toggleAnonymity = async () => {
    if (!user || savingAnonymity) return;

    setSavingAnonymity(true);
    try {
      const newStatus = !isAnonymous;

      const { error } = await supabase
        .from('user_profiles')
        .update({ anonymous_in_leaderboard: newStatus })
        .eq('id', user.id);

      if (error) throw error;

      setIsAnonymous(newStatus);

      // Lade Rangliste neu um die Aenderung zu sehen
      if (selectedDate) {
        loadLeaderboard(selectedDate);
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Anonymitaet:', error);
    } finally {
      setSavingAnonymity(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      loadLeaderboard(selectedDate);
    }
  }, [selectedDate]);

  const loadAvailableDates = async () => {
    try {
      // Hole Auth-Token für authentifizierte Anfrage
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/daily-quiz/leaderboard/dates', { headers });
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
      // Hole Auth-Token für authentifizierte Anfrage
      const { data: { session } } = await supabase.auth.getSession();
      const headers: HeadersInit = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/daily-quiz/leaderboard/all?date=${date}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
        setStatistics(data.statistics || null);
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

        {/* Anonymitaets-Toggle */}
        <Card className="mb-6 border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isAnonymous ? (
                  <EyeOff className="w-5 h-5 text-primary" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-500" />
                )}
                <div>
                  <p className="font-medium text-gray-800">
                    {isAnonymous ? 'Du bist anonym' : 'Dein Name ist sichtbar'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isAnonymous
                      ? 'Andere sehen dich als "Anonymer Teilnehmer"'
                      : 'Andere Teilnehmer sehen deinen Benutzernamen'}
                  </p>
                </div>
              </div>
              <Button
                variant={isAnonymous ? 'default' : 'outline'}
                size="sm"
                onClick={toggleAnonymity}
                disabled={savingAnonymity}
              >
                {savingAnonymity ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isAnonymous ? (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Sichtbar machen
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Anonymisieren
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

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

        {/* Statistiken */}
        {statistics && (
          <Card className={`mb-6 border-2 ${
            statistics.difficultyLevel === 'easy'
              ? 'border-green-200 bg-green-50'
              : statistics.difficultyLevel === 'medium'
              ? 'border-yellow-200 bg-yellow-50'
              : 'border-orange-200 bg-orange-50'
          }`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className={`w-5 h-5 ${
                  statistics.difficultyLevel === 'easy'
                    ? 'text-green-600'
                    : statistics.difficultyLevel === 'medium'
                    ? 'text-yellow-600'
                    : 'text-orange-600'
                }`} />
                Quiz-Statistiken
              </CardTitle>
            </CardHeader>
            <CardContent>
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
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="w-4 h-4 text-gray-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{statistics.totalParticipants}</p>
                  <p className="text-xs text-gray-600">Teilnehmer</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{statistics.avgPercentage}%</p>
                  <p className="text-xs text-gray-600">Durchschnitt</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Trophy className="w-4 h-4 text-gray-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{statistics.avgPoints}</p>
                  <p className="text-xs text-gray-600">Punkte</p>
                </div>
              </div>
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
                  const isCurrentUser = profile && (entry.userId === user?.id || (!entry.isAnonymous && entry.username === profile.username));
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
                        <div className="flex items-center gap-2">
                          {entry.isAnonymous && !isCurrentUser && (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                          <span
                            className={`font-semibold ${
                              isCurrentUser ? 'text-primary' : entry.isAnonymous ? 'text-gray-500 italic' : 'text-gray-800'
                            }`}
                          >
                            {isCurrentUser && entry.isAnonymous ? (
                              <>
                                {profile?.username || 'Du'}
                                <span className="ml-1 text-xs text-gray-500 font-normal">(anonym)</span>
                              </>
                            ) : (
                              entry.username
                            )}
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
              <strong>Hinweis:</strong> Du kannst deinen Namen in der Rangliste anonymisieren, indem du oben auf
              &quot;Anonymisieren&quot; klickst. Dein Ergebnis wird weiterhin angezeigt, aber andere sehen nur
              &quot;Anonymer Teilnehmer&quot; statt deines Namens.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
