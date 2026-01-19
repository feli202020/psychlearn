'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Brain, Users, Lightbulb } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Brain className="w-20 h-20 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground font-serif">
            PsychLearn
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            Gemeinsam durchs Psychologie-Studium
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Von einem Studenten entwickelt, der selbst eine bessere Struktur fürs Lernen gebraucht hat.
            Die Plattform wächst mit jedem Semester - und mit deinem Feedback!
          </p>

          <div className="flex gap-4 justify-center">
            {user ? (
              <>
                <Link href="/explore">
                  <Button size="lg" className="text-lg px-8 py-6">
                    <BookOpen className="mr-2" />
                    Lernziele entdecken
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Kostenlos starten
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                    Anmelden
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="flex justify-center mb-16">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl">
            <Card className="border-2 border-border hover:shadow-xl transition-all hover:border-primary/50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-3 font-serif">Alle wichtigen Module</h3>
                <p className="text-muted-foreground text-lg">
                  Von Biologischer Psychologie über Statistik bis Forschungsmethoden -
                  strukturiert nach Semestern aufbereitet und kontinuierlich erweitert.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border hover:shadow-xl transition-all hover:border-accent/50">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-3 font-serif">Prüfungsnah & verständlich</h3>
                <p className="text-muted-foreground text-lg">
                  Multiple-Choice-Fragen mit ausführlichen Erklärungen und mathematische Übungen
                  mit Lösungswegen - fokussiert auf das Wesentliche.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-3xl mx-auto bg-primary border-0">
            <CardContent className="p-10 text-primary-foreground">
              <h2 className="text-3xl font-bold mb-4 font-serif">Lust dabei zu sein?</h2>
              <p className="text-xl mb-6 opacity-90">
                Registriere dich kostenlos und hilf mit deinem Feedback, die Plattform noch besser zu machen!
              </p>
              {!user && (
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                    Jetzt kostenlos registrieren
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Copyright Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm py-6 mt-20">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PsychLearn. Built by a student, for students.</p>
          <p className="mt-1 text-xs">
            Made with dedication ♥️ and lots of coffee ☕ · Alle Rechte vorbehalten
          </p>
        </div>
      </footer>
    </main>
  );
}