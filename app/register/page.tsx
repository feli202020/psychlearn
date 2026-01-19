'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, GraduationCap } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [semester, setSemester] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signUp(email, password, username, semester);
      // Nach erfolgreicher Registrierung zur E-Mail-Bestätigungsseite weiterleiten
      // E-Mail als URL-Parameter übergeben
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      setError(err.message || 'Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 px-4">
      <Card className="w-full max-w-md border-2 border-border shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Brain className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground font-serif">
            PsychLearn
          </CardTitle>
          <p className="text-gray-600 mt-2">Erstelle deinen Account</p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Benutzername</label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={20}
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Benutzername"
              />
              <p className="text-xs text-gray-500 mt-1">3-20 Zeichen, Buchstaben, Zahlen und Unterstriche</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">E-Mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Deine E-Mail-Adresse"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Passwort</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-1">Mindestens 6 Zeichen</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                Dein aktuelles Fachsemester
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((sem) => (
                  <button
                    key={sem}
                    type="button"
                    onClick={() => setSemester(sem)}
                    className={`
                      p-3 rounded-lg font-semibold transition-all border-2
                      ${semester === sem
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-600'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-purple-300'
                      }
                    `}
                  >
                    {sem}. Sem
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Wähle das Semester aus, in dem du dich aktuell befindest
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              {loading ? 'Wird erstellt...' : 'Account erstellen'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Bereits ein Account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Jetzt anmelden
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
