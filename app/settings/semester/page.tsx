'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, ArrowLeft, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function SemesterPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    loadUserSemester();
  }, [user, router]);

  const loadUserSemester = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_profiles')
      .select('current_semester')
      .eq('id', user.id)
      .single();

    if (data?.current_semester) {
      setSelectedSemester(data.current_semester);
    }
  };

  const handleSemesterChange = async (semester: number) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          current_semester: semester,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setSelectedSemester(semester);
      setMessage({ type: 'success', text: 'Semester erfolgreich aktualisiert!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Semesters:', error);
      setMessage({ type: 'error', text: 'Fehler beim Aktualisieren des Semesters' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

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
              <GraduationCap className="w-6 h-6 text-primary" />
              Semesterwahl
            </CardTitle>
            <CardDescription>
              Wähle dein aktuelles Semester für personalisierte Inhalte
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

            {/* Semester-Auswahl */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Dein Fachsemester
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((sem) => (
                  <button
                    key={sem}
                    onClick={() => handleSemesterChange(sem)}
                    disabled={loading}
                    className={`
                      p-4 rounded-lg font-semibold transition-all
                      ${selectedSemester === sem
                        ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                        : 'bg-card border-2 border-gray-200 text-gray-700 hover:border-primary hover:scale-102'
                      }
                      ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {sem}. Sem
                  </button>
                ))}
              </div>
            </div>

            {/* Info-Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-800 mb-1">Warum Semester wählen?</p>
                  <p className="text-sm text-blue-700">
                    Das gewählte Semester bestimmt, welche Fragen dir im Daily Quiz angezeigt werden.
                    So bekommst du passende Fragen zu deinem aktuellen Lernstand.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
