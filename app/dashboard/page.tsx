'use client';

import { useAuth } from '@/lib/auth-context';
import { useEffect, useState } from 'react';
import { getLernziele } from '@/lib/database';
import { Lernziel } from '@/lib/types';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, BookOpen, CheckCircle, Trophy } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [alleLernziele, setAlleLernziele] = useState<Lernziel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const lz = await getLernziele();
      setAlleLernziele(lz);
      setLoading(false);
    }

    loadData();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <Card className="p-8 text-center">
          <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Bitte melde dich an</h2>
          <Link href="/login">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600">Zum Login</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const lernzieleNachSemester = alleLernziele.reduce((acc, lz) => {
    const semester = lz.klasse;
    if (!acc[semester]) acc[semester] = [];
    acc[semester].push(lz);
    return acc;
  }, {} as Record<number, Lernziel[]>);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">

        <div className="flex items-center gap-3 mb-8">
          <Trophy className="w-10 h-10 text-purple-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Meine Quizze
          </h1>
        </div>

        <p className="text-lg text-gray-700 mb-8">
          Teste dein Wissen mit den Abschlussquizzen zu den verschiedenen Modulen.
        </p>

        {/* Info-Box */}
        <Card className="mb-8 border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6 flex items-start gap-4">
            <CheckCircle className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Lernpfad</h3>
              <p className="text-blue-700 text-sm">
                Bevor du die Quizze startest, empfehlen wir dir, zuerst die Lerninhalte im{' '}
                <Link href="/explore" className="underline font-medium hover:text-blue-900">
                  Explore-Bereich
                </Link>{' '}
                durchzuarbeiten.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {loading ? (
            <Card className="border-2 border-gray-200">
              <CardContent className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Quizze werden geladen...</p>
              </CardContent>
            </Card>
          ) : Object.keys(lernzieleNachSemester).length === 0 ? (
            <Card className="border-2 border-gray-200">
              <CardContent className="p-12 text-center">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Noch keine Quizze vorhanden.</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(lernzieleNachSemester)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([semester, lernziele]: [string, Lernziel[]]) => (
                <Card key={semester} className="border-2 border-purple-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                    <CardTitle className="flex items-center gap-2 text-2xl">
                      <BookOpen className="text-purple-600" />
                      {semester}. Fachsemester
                      <span className="text-sm font-normal text-gray-600 ml-2">
                        ({lernziele.length} {lernziele.length === 1 ? 'Quiz' : 'Quizze'})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {lernziele.map(lz => (
                        <Link key={lz.id} href={`/lernziel/${lz.slug || lz.id}`}>
                          <Card className="h-full hover:shadow-lg transition-all border-2 border-gray-200 hover:border-purple-300">
                            <CardContent className="p-4">
                              <h3 className="font-semibold text-lg mb-2">{lz.titel}</h3>
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                {lz.beschreibung}
                              </p>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-500">{lz.fach?.name}</span>
                                <div className="flex items-center gap-2">
                                  <span>{'⭐'.repeat(lz.schwierigkeitsgrad)}</span>
                                  <span className="text-gray-500">{lz.geschaetzte_dauer} Min</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>

        <Card className="mt-8 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-3">Erst lernen, dann quizzen!</h2>
            <p className="text-gray-600 mb-6">
              Arbeite zuerst die Lerninhalte durch, bevor du mit den Quizzen startest.
            </p>
            <Link href="/explore">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 text-lg px-8">
                <BookOpen className="mr-2" />
                Zu den Lerninhalten
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
