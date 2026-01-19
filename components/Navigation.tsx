'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Brain, BookOpen, LogOut, Settings, Trophy } from 'lucide-react';
import DailyQuizWidget from './DailyQuizWidget';

export default function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-card shadow-sm sticky top-0 z-50">
      <div className="border-b-2 border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Brain className="w-8 h-8 text-accent" />
              <span className="text-2xl font-bold text-foreground font-serif">
                PsychLearn
              </span>
            </Link>

            <div className="flex items-center gap-6">
              {user ? (
                <>
                  <Link href="/explore">
                    <Button
                      variant={isActive('/explore') ? 'default' : 'ghost'}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Lernziele
                    </Button>
                  </Link>

                  <Link href="/rangliste">
                    <Button
                      variant={isActive('/rangliste') ? 'default' : 'ghost'}
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Rangliste
                    </Button>
                  </Link>

                  <Link href="/settings">
                    <Button
                      variant={isActive('/settings') ? 'default' : 'ghost'}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Einstellungen
                    </Button>
                  </Link>

                  <div className="pl-4 border-l-2 border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Abmelden
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">
                      Anmelden
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button>
                      Registrieren
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Quiz Widget - direkt unter dem PsychLearn Logo */}
      <DailyQuizWidget />
    </nav>
  );
}