'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, ArrowLeft, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { deleteUserAccount } from '@/lib/edge-functions';
import Link from 'next/link';

export default function DeleteAccountPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleDeleteAccount = async () => {
    if (confirmText !== 'LÖSCHEN') {
      setMessage({ type: 'error', text: 'Bitte gib "LÖSCHEN" ein, um fortzufahren' });
      return;
    }

    setLoading(true);
    try {
      // Methode 1: Versuche SQL Function
      try {
        const { data, error } = await supabase.rpc('delete_current_user');

        if (!error && data?.success) {
          await supabase.auth.signOut();
          setMessage({ type: 'success', text: 'Account wurde vollständig gelöscht. Du wirst weitergeleitet...' });
          setTimeout(() => router.push('/'), 2000);
          return;
        }
      } catch (sqlFunctionError) {
        console.log('SQL Function nicht verfügbar, versuche Edge Function');
      }

      // Methode 2: Versuche Edge Function
      try {
        const result = await deleteUserAccount();

        if (result.success) {
          await supabase.auth.signOut();
          setMessage({ type: 'success', text: 'Account wurde vollständig gelöscht. Du wirst weitergeleitet...' });
          setTimeout(() => router.push('/'), 2000);
          return;
        }
      } catch (edgeFunctionError) {
        console.log('Edge Function nicht verfügbar, verwende Fallback');
      }

      // Methode 3: Fallback - Nur Profil löschen
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      await supabase.auth.signOut();
      setMessage({ type: 'success', text: 'Account-Daten wurden gelöscht. Du wirst weitergeleitet...' });
      setTimeout(() => router.push('/'), 2000);
    } catch (error: any) {
      console.error('Fehler beim Löschen des Accounts:', error);
      setMessage({ type: 'error', text: error.message || 'Fehler beim Löschen des Accounts' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/settings" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Zurück zu Einstellungen
        </Link>

        <Card className="border-2 border-red-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-6 h-6" />
              Account löschen
            </CardTitle>
            <CardDescription>
              Diese Aktion kann nicht rückgängig gemacht werden
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

            {/* Warnung */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-2">Achtung: Permanente Löschung</h3>
                  <p className="text-sm text-red-700 mb-3">
                    Wenn du deinen Account löschst, werden folgende Daten unwiderruflich gelöscht:
                  </p>
                  <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                    <li>Dein Profil und Benutzername</li>
                    <li>Alle deine Lernfortschritte</li>
                    <li>Deine gesammelten XP und Achievements</li>
                    <li>Deine Daily Quiz Ergebnisse</li>
                    <li>Dein Platz in der Rangliste</li>
                  </ul>
                </div>
              </div>
            </div>

            {!showConfirm ? (
              <Button
                onClick={() => setShowConfirm(true)}
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Account löschen
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Gib <span className="font-bold text-red-600">LÖSCHEN</span> ein, um zu bestätigen
                  </label>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="LÖSCHEN"
                    disabled={loading}
                    className="border-red-300 focus:border-red-500"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={loading || confirmText !== 'LÖSCHEN'}
                    variant="destructive"
                    className="flex-1"
                  >
                    {loading ? 'Lösche Account...' : 'Endgültig löschen'}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowConfirm(false);
                      setConfirmText('');
                    }}
                    variant="outline"
                    className="flex-1"
                    disabled={loading}
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
