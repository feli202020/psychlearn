'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getLernziele, getFaecher } from '@/lib/database';
import { Modul, Lernziel } from '@/lib/types';
import { getLerninhalteByModulId, LerninhaltItem } from '@/content/lerninhalte';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Brain, BookOpen, CheckCircle, Play, FileText, ChevronDown, ChevronUp, Clock } from 'lucide-react';
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
  const [expandSemester, setExpandSemester] = useState<number | null>(null);

  // SessionStorage beim ersten Laden auslesen
  useEffect(() => {
    // Nur im Browser ausführen
    if (typeof window === 'undefined') return;

    const savedModul = sessionStorage.getItem('explore_selected_modul');
    const savedTab = sessionStorage.getItem('explore_active_tab');
    const savedSemester = sessionStorage.getItem('explore_expand_semester');

    if (savedModul) {
      try {
        const modul = JSON.parse(savedModul);
        setSelectedModul(modul);
        sessionStorage.removeItem('explore_selected_modul'); // Cleanup
      } catch (e) {
        console.error('Error parsing saved modul:', e);
      }
    }

    if (savedTab === 'quiz') {
      setActiveTab('quiz');
      sessionStorage.removeItem('explore_active_tab'); // Cleanup
    }

    if (savedSemester) {
      setExpandSemester(parseInt(savedSemester));
      sessionStorage.removeItem('explore_expand_semester'); // Cleanup
    }
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="flex">
        {/* Sidebar */}
        <ExploreSidebar
          selectedModul={selectedModul}
          onSelectModul={setSelectedModul}
          expandSemester={expandSemester}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 lg:ml-0">
          {/* Preview Banner für nicht-eingeloggte User */}
          {!user && (
            <Card className="mb-6 border-2 border-border bg-muted">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Brain className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-bold text-foreground text-lg mb-1">
                      👋 Willkommen bei PsychLearn!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Du befindest dich im Preview-Modus. Erstelle einen kostenlosen Account, um alle Lerninhalte, Quizzes und Features freizuschalten.
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      onClick={() => router.push('/register')}
                      className="bg-primary hover:bg-primary/90"
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
              <h1 className="text-3xl font-bold text-foreground mb-4">Willkommen beim Lernen!</h1>
              <p className="text-lg text-muted-foreground text-center max-w-md">
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
                    <Card className="border-2 border-dashed border-border">
                      <CardContent className="p-12 text-center">
                        <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                          Noch keine Lerninhalte vorhanden
                        </h3>
                        <p className="text-muted-foreground">
                          Für dieses Modul wurden noch keine Lerninhalte hinzugefügt.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {lerninhalte.map((inhalt) => (
                        <Card key={inhalt.id} className="group border-2 border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300">
                          <CardHeader className="pb-3">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
                                {inhalt.reihenfolge}
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg mb-2 group-hover:text-primary transition-colors">{inhalt.titel}</CardTitle>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {inhalt.beschreibung}
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                <span>{inhalt.geschaetzte_dauer} Min</span>
                              </div>
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium">
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>{inhalt.kategorie}</span>
                              </div>
                            </div>
                            {!user ? (
                              <div className="p-4 bg-muted border-2 border-border rounded-lg">
                                <p className="text-sm text-foreground font-medium mb-2">
                                  Melde dich an, um den vollständigen Lerninhalt zu sehen
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
                            ) : (
                              <Link href={`/lerninhalt/${inhalt.id}`}>
                                <Button className="bg-primary">
                                  <Play className="w-4 h-4 mr-2" />
                                  Lerninhalt starten
                                </Button>
                              </Link>
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
                        <Card className="border-2 border-dashed border-border">
                          <CardContent className="p-12 text-center">
                            <CheckCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                              Noch keine Lernziele vorhanden
                            </h3>
                            <p className="text-muted-foreground">
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
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {lz.beschreibung}
                                </p>
                                <div className="flex items-center justify-between text-xs mb-4">
                                  <span className="text-muted-foreground">{lz.fach?.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span>{'⭐'.repeat(lz.schwierigkeitsgrad)}</span>
                                    <span className="text-muted-foreground">{lz.geschaetzte_dauer} Min</span>
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
