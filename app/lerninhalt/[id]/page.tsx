'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { getLerninhaltById, LerninhaltItem, ModulLerninhalte } from '@/content/lerninhalte';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, BookOpen, Clock, Loader2 } from 'lucide-react';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export default function LerninhaltDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const inhaltId = params.id as string;

  const [inhalt, setInhalt] = useState<LerninhaltItem | null>(null);
  const [modul, setModul] = useState<ModulLerninhalte | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getLerninhaltById(inhaltId);
    if (data) {
      setInhalt(data.inhalt);
      setModul(data.modul);
    }
    setLoading(false);
  }, [inhaltId]);

  // Nächster und vorheriger Lerninhalt
  const currentIndex = modul?.inhalte.findIndex(i => i.id === inhaltId) ?? -1;
  const prevInhalt = currentIndex > 0 ? modul?.inhalte[currentIndex - 1] : null;
  const nextInhalt = currentIndex >= 0 && currentIndex < (modul?.inhalte.length ?? 0) - 1
    ? modul?.inhalte[currentIndex + 1]
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Lade Lerninhalt...</p>
        </div>
      </div>
    );
  }

  if (!inhalt || !modul) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Lerninhalt nicht gefunden</h1>
          <p className="text-muted-foreground mb-4">Der Inhalt mit der ID &quot;{inhaltId}&quot; existiert nicht.</p>
          <Link href="/explore">
            <Button>Zurück zur Übersicht</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Nicht eingeloggt
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => router.push('/explore')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Übersicht
          </Button>

          <Card className="border-2 border-border">
            <CardHeader className="bg-muted">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  {inhalt.reihenfolge}
                </div>
                <div>
                  <Badge variant="outline" className="mb-1">{modul.modulName}</Badge>
                  <CardTitle className="text-2xl">{inhalt.titel}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-muted-foreground mb-6">
                {inhalt.inhalt.substring(0, 300)}...
              </div>

              <Card className="border-2 border-primary/50 bg-primary/5">
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Vollständigen Inhalt freischalten
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Melde dich an oder erstelle einen kostenlosen Account, um alle Lerninhalte zu lesen und Quizzes zu absolvieren.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => router.push('/login')} className="bg-primary">
                      Anmelden
                    </Button>
                    <Button onClick={() => router.push('/register')} variant="outline">
                      Kostenlos registrieren
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Zurück Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => {
            sessionStorage.setItem('explore_selected_modul', JSON.stringify({
              id: modul.modulId,
              name: modul.modulName
            }));
            sessionStorage.setItem('explore_active_tab', 'inhalt');
            sessionStorage.setItem('explore_expand_semester', modul.semester[0].toString());
            router.push('/explore');
          }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zu {modul.modulName}
        </Button>

        {/* Header */}
        <Card className="mb-8 border-2 border-border">
          <CardHeader className="bg-muted">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {inhalt.reihenfolge}
                </div>
                <div>
                  <Badge variant="outline" className="mb-2">{modul.modulName}</Badge>
                  <CardTitle className="text-2xl md:text-3xl">{inhalt.titel}</CardTitle>
                </div>
              </div>
            </div>
            {/* Beschreibung und Zeitangabe */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-muted-foreground text-base leading-relaxed mb-4">{inhalt.beschreibung}</p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Clock className="w-4 h-4" />
                <span>📖 ca. {inhalt.geschaetzte_dauer} Min. Lesezeit</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Inhalt */}
        <Card className="mb-8 border-2 border-border">
          <CardContent className="p-6 md:p-8">
            <MarkdownRenderer content={inhalt.inhalt} />
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          {prevInhalt ? (
            <Link href={`/lerninhalt/${prevInhalt.id}`}>
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {prevInhalt.titel}
              </Button>
            </Link>
          ) : (
            <div />
          )}

          {nextInhalt ? (
            <Link href={`/lerninhalt/${nextInhalt.id}`}>
              <Button variant="outline">
                {nextInhalt.titel}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : inhalt.quizSlug ? (
            <Link href={`/lernziel/${inhalt.quizSlug}`}>
              <Button className="bg-primary">
                Zum Quiz
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </main>
  );
}
