'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Key, ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function PasswordPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (!user) {
    router.push('/login');
    return null;
  }

  const handlePasswordChange = async () => {
    // Validierung
    if (!newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Bitte fülle alle Felder aus' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Das neue Passwort muss mindestens 6 Zeichen haben' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Die Passwörter stimmen nicht überein' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Passwort erfolgreich geändert!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Fehler beim Ändern des Passworts:', error);
      setMessage({ type: 'error', text: error.message || 'Fehler beim Ändern des Passworts' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user.email) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Eine E-Mail zum Zurücksetzen des Passworts wurde gesendet!' });
    } catch (error: any) {
      console.error('Fehler beim Passwort-Reset:', error);
      setMessage({ type: 'error', text: error.message || 'Fehler beim Senden der E-Mail' });
    } finally {
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

        <Card className="border-2 border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-6 h-6 text-primary" />
              Passwort ändern
            </CardTitle>
            <CardDescription>
              Ändere dein Passwort oder setze es zurück
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

            {/* Passwort direkt ändern */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Neues Passwort setzen</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPasswords(!showPasswords)}
                >
                  {showPasswords ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Neues Passwort
                  </label>
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mindestens 6 Zeichen"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">
                    Passwort bestätigen
                  </label>
                  <Input
                    type={showPasswords ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Passwort wiederholen"
                    disabled={loading}
                  />
                </div>
              </div>

              <Button
                onClick={handlePasswordChange}
                disabled={loading || !newPassword || !confirmPassword}
                className="w-full"
              >
                <Key className="w-4 h-4 mr-2" />
                {loading ? 'Ändern...' : 'Passwort ändern'}
              </Button>
            </div>

            {/* Passwort per E-Mail zurücksetzen */}
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Passwort vergessen?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Du kannst dir auch eine E-Mail zum Zurücksetzen des Passworts schicken lassen.
              </p>
              <Button
                onClick={handlePasswordReset}
                disabled={loading}
                variant="outline"
                className="w-full"
              >
                {loading ? 'Senden...' : 'Passwort-Reset E-Mail senden'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
