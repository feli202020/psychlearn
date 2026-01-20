'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Settings,
  GraduationCap,
  Trash2,
  Mail,
  Key,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getCurrentSemester, getNextSemesterStart, formatDate } from '@/lib/semester-utils';
import { deleteUserAccount } from '@/lib/edge-functions';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [currentSemester, setCurrentSemester] = useState<number>(1);
  const [nextSemesterDate, setNextSemesterDate] = useState<Date | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Aktuelles Semester basierend auf Datum berechnen
    const semester = getCurrentSemester();
    setCurrentSemester(semester);

    // Nächster Semesterstart
    const nextStart = getNextSemesterStart();
    setNextSemesterDate(nextStart);

    // Benutzer-Semester aus Datenbank laden
    loadUserSemester();
  }, [user, router]);

  const loadUserSemester = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_profiles')
      .select('current_semester')
      .eq('id', user.id)
      .single();

    if (data && data.current_semester) {
      setSelectedSemester(data.current_semester);
    } else {
      setSelectedSemester(currentSemester);
    }
  };

  const handleSemesterChange = async (semester: number) => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          current_semester: semester,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

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

  const handleSendVerificationEmail = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Verifizierungs-E-Mail wurde gesendet!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Fehler beim Senden der E-Mail:', error);
      setMessage({ type: 'error', text: 'Fehler beim Senden der E-Mail' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Passwort-Reset E-Mail wurde gesendet!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Fehler beim Passwort-Reset:', error);
      setMessage({ type: 'error', text: 'Fehler beim Passwort-Reset' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Methode 1: Versuche SQL Function (am zuverlässigsten)
      try {
        const { data, error } = await supabase.rpc('delete_current_user');

        if (!error && data?.success) {
          // SQL Function erfolgreich - User ausloggen
          await supabase.auth.signOut();
          setMessage({ type: 'success', text: 'Account wurde vollständig gelöscht. Du wirst ausgeloggt...' });
          setTimeout(() => router.push('/'), 2000);
          return;
        } else if (error) {
          console.log('SQL Function nicht verfügbar:', error.message);
        }
      } catch (sqlFunctionError) {
        console.log('SQL Function nicht verfügbar, versuche Edge Function');
      }

      // Methode 2: Versuche Edge Function
      try {
        const result = await deleteUserAccount();

        if (result.success) {
          await supabase.auth.signOut();
          setMessage({ type: 'success', text: 'Account wurde vollständig gelöscht. Du wirst ausgeloggt...' });
          setTimeout(() => router.push('/'), 2000);
          return;
        }
      } catch (edgeFunctionError) {
        console.log('Edge Function nicht verfügbar, verwende Fallback-Methode');
      }

      // Methode 3: Fallback - Nur Profil löschen
      // Hinweis: Auth-User bleibt bestehen und muss manuell gelöscht werden

      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) {
        throw profileError;
      }

      // User ausloggen
      await supabase.auth.signOut();

      setMessage({
        type: 'success',
        text: 'Account-Daten wurden gelöscht. Der Auth-User muss manuell im Supabase Dashboard gelöscht werden.'
      });
      setTimeout(() => router.push('/'), 3000);
    } catch (error: any) {
      console.error('Fehler beim Löschen des Accounts:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Fehler beim Löschen des Accounts. Bitte kontaktiere den Support.'
      });
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold bg-primary bg-clip-text text-transparent">
              Kontoeinstellungen
            </h1>
          </div>
          <p className="text-gray-600">Verwalte dein Konto und deine Lernpräferenzen</p>
        </div>

        {/* Nachricht */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
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

        {/* Semester-Einstellungen */}
        <Card className="mb-6 border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              Semester-Einstellungen
            </CardTitle>
            <CardDescription>
              Wähle dein aktuelles Semester für personalisierte Inhalte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-semibold text-primary">Aktuelles Semester (automatisch)</p>
                  <p className="text-sm text-foreground">
                    {currentSemester}. Semester ({currentSemester % 2 === 1 ? 'Wintersemester' : 'Sommersemester'})
                  </p>
                  {nextSemesterDate && (
                    <p className="text-xs text-primary mt-1">
                      Nächstes Semester startet am: {formatDate(nextSemesterDate)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Dein gewähltes Semester
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((sem) => (
                  <button
                    key={sem}
                    onClick={() => handleSemesterChange(sem)}
                    disabled={loading}
                    className={`
                      p-3 rounded-lg font-semibold transition-all
                      ${selectedSemester === sem
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'bg-card border-2 border-gray-200 text-gray-700 hover:border-primary'
                      }
                      ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {sem}. Sem
                  </button>
                ))}
              </div>
              {selectedSemester !== currentSemester && (
                <p className="text-sm text-amber-600 mt-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Dein gewähltes Semester weicht vom aktuellen Semester ab
                </p>
              )}
            </div>
          </CardContent>
        </Card>


        {/* Account-Sicherheit */}
        <Card className="mb-6 border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Sicherheit & E-Mail
            </CardTitle>
            <CardDescription>
              Verwalte deine E-Mail-Verifizierung und Passwort
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
              <div>
                <p className="font-medium text-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground">
                  {user.email_confirmed_at ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Verifiziert
                    </span>
                  ) : (
                    <span className="text-amber-600">Nicht verifiziert</span>
                  )}
                </p>
              </div>
            </div>

            {!user.email_confirmed_at && (
              <Button
                onClick={handleSendVerificationEmail}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                Verifizierungs-E-Mail erneut senden
              </Button>
            )}

            <Button
              onClick={handlePasswordReset}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Key className="w-4 h-4 mr-2" />
              Passwort zurücksetzen
            </Button>
          </CardContent>
        </Card>

        {/* Account löschen */}
        <Card className="border-2 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Gefahrenzone
            </CardTitle>
            <CardDescription>
              Permanente Aktionen für deinen Account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showDeleteConfirm ? (
              <Button
                onClick={() => setShowDeleteConfirm(true)}
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Account löschen
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 font-medium mb-2">
                    ⚠️ Bist du sicher?
                  </p>
                  <p className="text-sm text-red-700">
                    Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Daten werden permanent gelöscht.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    variant="destructive"
                    className="flex-1"
                  >
                    Ja, Account löschen
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Abbrechen
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
