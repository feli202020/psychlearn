'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, ArrowLeft, CheckCircle, AlertCircle, Sun, Moon, Monitor, Info } from 'lucide-react';
import Link from 'next/link';

type Theme = 'light' | 'dark' | 'system';

export default function AppearancePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedTheme, setSelectedTheme] = useState<Theme>('light');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    // Theme aus localStorage laden
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setSelectedTheme(savedTheme);
    }
  }, [user, router]);

  const handleThemeChange = (theme: Theme) => {
    setSelectedTheme(theme);
    localStorage.setItem('theme', theme);

    // Theme anwenden (für zukünftige Dark Mode Implementation)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    setMessage({ type: 'success', text: 'Erscheinungsbild aktualisiert!' });
    setTimeout(() => setMessage(null), 2000);
  };

  if (!user) return null;

  const themes = [
    { id: 'light' as Theme, name: 'Hell', icon: Sun, description: 'Helles Design für gute Lesbarkeit' },
    { id: 'dark' as Theme, name: 'Dunkel', icon: Moon, description: 'Dunkles Design für weniger Augenbelastung' },
    { id: 'system' as Theme, name: 'System', icon: Monitor, description: 'Automatisch basierend auf Systemeinstellung' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/settings" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Zurück zu Einstellungen
        </Link>

        <Card className="border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-6 h-6 text-primary" />
              Erscheinungsbild
            </CardTitle>
            <CardDescription>
              Passe das Aussehen der App an deine Vorlieben an
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {message && (
              <div className={`p-4 rounded-lg flex items-center gap-3 ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                {message.text}
              </div>
            )}

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-700">
                  Der Dark Mode befindet sich in Entwicklung. Aktuell ist nur das helle Design verfügbar.
                </p>
              </div>
            </div>

            {/* Theme-Auswahl */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">
                Farbschema
              </label>
              <div className="grid gap-3">
                {themes.map((theme) => {
                  const Icon = theme.icon;
                  const isDisabled = theme.id !== 'light';

                  return (
                    <button
                      key={theme.id}
                      onClick={() => !isDisabled && handleThemeChange(theme.id)}
                      disabled={isDisabled}
                      className={`
                        p-4 rounded-lg border-2 text-left transition-all
                        ${selectedTheme === theme.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                        }
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          selectedTheme === theme.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {theme.name}
                            {isDisabled && <span className="text-xs text-muted-foreground ml-2">(Bald verfügbar)</span>}
                          </h3>
                          <p className="text-sm text-muted-foreground">{theme.description}</p>
                        </div>
                        {selectedTheme === theme.id && (
                          <CheckCircle className="w-5 h-5 text-primary ml-auto" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Weitere Optionen Placeholder */}
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-3">Weitere Optionen</h3>
              <div className="space-y-3">
                <div className="p-4 border-2 border-border rounded-lg opacity-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Kompakte Ansicht</h4>
                      <p className="text-sm text-muted-foreground">Reduziere Abstände für mehr Inhalt</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>Aus</Button>
                  </div>
                </div>
                <div className="p-4 border-2 border-border rounded-lg opacity-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Animationen</h4>
                      <p className="text-sm text-muted-foreground">Aktiviere oder deaktiviere Animationen</p>
                    </div>
                    <Button variant="outline" size="sm" disabled>An</Button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">
                Weitere Optionen werden in zukünftigen Updates verfügbar sein.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
