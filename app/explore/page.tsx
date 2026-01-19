'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getLernziele } from '@/lib/database';
import { Modul, Lernziel } from '@/lib/types';
import { getLerninhalteByModulId, LerninhaltItem } from '@/content/lerninhalte';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Brain, BookOpen, CheckCircle, Play, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import ExploreSidebar from '@/components/ExploreSidebar';

export default function ExplorePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedModul, setSelectedModul] = useState<Modul | null>(null);
  const [lerninhalte, setLerninhalte] = useState<LerninhaltItem[]>([]);
  const [lernziele, setLernziele] = useState<Lernziel[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'inhalt' | 'quiz'>('inhalt');
  const [quizTabExpanded, setQuizTabExpanded] = useState(true);

  // Lerninhalte und Lernziele laden wenn Modul ausgewählt
  useEffect(() => {
    async function loadModulData() {
      if (!selectedModul) return;

      setLoading(true);

      // Lokale Lerninhalte laden
      const contentData = getLerninhalteByModulId(selectedModul.id);
      setLerninhalte(contentData);

      // Lernziele aus Datenbank laden
      const lernzieleData = await getLernziele();
      // Lernziele nach Modul filtern (über fach_id)
      const filteredLernziele = lernzieleData.filter(
        (lz: Lernziel) => lz.fach?.id === selectedModul.id
      );
      setLernziele(filteredLernziele);
      setLoading(false);
    }

    loadModulData();
  }, [selectedModul]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <div className="flex">
        {/* Sidebar */}
        <ExploreSidebar
          selectedModul={selectedModul}
          onSelectModul={setSelectedModul}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 lg:ml-0">
          {/* Preview Banner für nicht-eingeloggte User */}
          {!user && (
            <Card className="mb-6 border-2 border-border bg-muted">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-bold text-gray-800 text-lg mb-1">
                      👋 Willkommen bei PsychLearn!
                    </h3>
                    <p className="text-sm text-gray-600">
                      Du befindest dich im Preview-Modus. Erstelle einen kostenlosen Account, um alle Lerninhalte, Quizzes und Features freizuschalten.
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      onClick={() => router.push('/register')}
                      className="bg-primary hover:bg-primary/90 text-white"
                    >
                      Kostenlos registrieren
                    </Button>
                    <Button
                      onClick={() => router.push('/login')}
                      variant="outline"
                      className="border-primary text-primary"
                    >
                      Anmelden
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!selectedModul ? (
            // Kein Modul ausgewählt
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <Brain className="w-24 h-24 text-muted-foreground mb-6" />
              <h1 className="text-3xl font-bold text-gray-700 mb-4">Willkommen beim Lernen!</h1>
              <p className="text-lg text-gray-500 text-center max-w-md">
                Wähle ein Semester und Modul aus der Seitenleiste, um mit dem Lernen zu beginnen.
              </p>
              <Button
                variant="outline"
                className="mt-6 lg:hidden"
                onClick={() => {
                  // Trigger sidebar open on mobile
                  const event = new CustomEvent('openSidebar');
                  window.dispatchEvent(event);
                }}
              >
                Module anzeigen
              </Button>
            </div>
          ) : (
            // Modul ausgewählt - Inhalte anzeigen
            <div>
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground font-serif">
                  {selectedModul.name}
                </h1>
              </div>

              {/* Tabs */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <Button
                    variant={activeTab === 'inhalt' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('inhalt')}
                    className={activeTab === 'inhalt' ? 'bg-primary' : ''}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Lerninhalte
                  </Button>
                  <div className="flex gap-1">
                    <Button
                      variant={activeTab === 'quiz' ? 'default' : 'outline'}
                      onClick={() => setActiveTab('quiz')}
                      className={activeTab === 'quiz' ? 'bg-primary rounded-r-none' : 'rounded-r-none'}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Quiz
                    </Button>
                    {activeTab === 'quiz' && (
                      <Button
                        variant={activeTab === 'quiz' ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setQuizTabExpanded(!quizTabExpanded)}
                        className={activeTab === 'quiz' ? 'bg-primary rounded-l-none border-l-0' : 'rounded-l-none border-l-0'}
                      >
                        {quizTabExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
              ) : activeTab === 'inhalt' ? (
                // Lerninhalte Tab
                <div>
                  {lerninhalte.length === 0 ? (
                    <Card className="border-2 border-dashed border-gray-300">
                      <CardContent className="p-12 text-center">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                          Noch keine Lerninhalte vorhanden
                        </h3>
                        <p className="text-gray-500">
                          Für dieses Modul wurden noch keine Lerninhalte hinzugefügt.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {lerninhalte.map((inhalt) => (
                        <Card key={inhalt.id} className="border-2 border-border hover:border-primary/50 transition-all">
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                                {inhalt.reihenfolge}
                              </div>
                              <CardTitle className="text-lg">{inhalt.titel}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="prose prose-sm max-w-none text-gray-600">
                              {user ? inhalt.inhalt : inhalt.inhalt.substring(0, 150) + '...'}
                            </div>
                            {!user && (
                              <div className="mt-4 p-4 bg-muted border-2 border-border rounded-lg">
                                <p className="text-sm text-foreground font-medium mb-2">
                                  🔒 Melde dich an, um den vollständigen Lerninhalt zu sehen
                                </p>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => router.push('/login')}
                                    className="bg-primary"
                                  >
                                    Anmelden
                                  </Button>
                                  <Button
                                    onClick={() => router.push('/register')}
                                    variant="outline"
                                    className="border-primary text-foreground"
                                  >
                                    Registrieren
                                  </Button>
                                </div>
                              </div>
                            )}
                            {user && (
                              <Button className="mt-4 bg-primary">
                                <Play className="w-4 h-4 mr-2" />
                                Lerninhalt starten
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Quiz & Lernziele Tab
                <div>
                  {quizTabExpanded && (
                    <>
                      {lernziele.length === 0 ? (
                        <Card className="border-2 border-dashed border-gray-300">
                          <CardContent className="p-12 text-center">
                            <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                              Noch keine Lernziele vorhanden
                            </h3>
                            <p className="text-gray-500">
                              Für dieses Semester wurden noch keine Lernziele hinzugefügt.
                            </p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                          {lernziele.map(lz => (
                            <Card key={lz.id} className="hover:shadow-lg transition-all border-2 border-border hover:border-primary/50">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{lz.titel}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {lz.beschreibung}
                                </p>
                                <div className="flex items-center justify-between text-xs mb-4">
                                  <span className="text-gray-500">{lz.fach?.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span>{'⭐'.repeat(lz.schwierigkeitsgrad)}</span>
                                    <span className="text-gray-500">{lz.geschaetzte_dauer} Min</span>
                                  </div>
                                </div>
                                {user ? (
                                  <Link href={`/lernziel/${lz.slug}`}>
                                    <Button className="w-full bg-primary">
                                      Quiz starten
                                    </Button>
                                  </Link>
                                ) : (
                                  <div className="space-y-2">
                                    <Button
                                      disabled
                                      className="w-full bg-gray-300 text-gray-500 cursor-not-allowed"
                                    >
                                      🔒 Anmelden erforderlich
                                    </Button>
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => router.push('/login')}
                                        variant="outline"
                                        className="flex-1 border-primary text-foreground text-xs"
                                        size="sm"
                                      >
                                        Anmelden
                                      </Button>
                                      <Button
                                        onClick={() => router.push('/register')}
                                        variant="outline"
                                        className="flex-1 border-primary text-primary text-xs"
                                        size="sm"
                                      >
                                        Registrieren
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
