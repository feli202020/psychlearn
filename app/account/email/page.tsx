'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function EmailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleEmailChange = async () => {
    if (!newEmail.trim()) {
      setMessage({ type: 'error', text: 'Bitte gib eine E-Mail-Adresse ein' });
      return;
    }

    if (!newEmail.includes('@')) {
      setMessage({ type: 'error', text: 'Bitte gib eine gültige E-Mail-Adresse ein' });
      return;
    }

    if (newEmail === user.email) {
      setMessage({ type: 'error', text: 'Das ist bereits deine aktuelle E-Mail-Adresse' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail.trim()
      });

      if (error) throw error;

      setMessage({
        type: 'success',
        text: 'Eine Bestätigungs-E-Mail wurde an deine neue Adresse gesendet. Bitte bestätige die Änderung.'
      });
      setNewEmail('');
    } catch (error: any) {
      console.error('Fehler beim Ändern der E-Mail:', error);
      setMessage({ type: 'error', text: error.message || 'Fehler beim Ändern der E-Mail-Adresse' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user.email) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Verifizierungs-E-Mail wurde erneut gesendet!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Fehler beim Senden der E-Mail:', error);
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

        <Card className="border-2 border-primary/30 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-6 h-6 text-primary" />
              E-Mail-Adresse
            </CardTitle>
            <CardDescription>
              Verwalte deine E-Mail-Adresse und Verifizierung
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

            {/* Aktuelle E-Mail */}
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Aktuelle E-Mail-Adresse</p>
              <p className="font-medium">{user.email}</p>
              <div className="mt-2">
                {user.email_confirmed_at ? (
                  <span className="text-green-600 text-sm flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Verifiziert
                  </span>
                ) : (
                  <div className="space-y-2">
                    <span className="text-amber-600 text-sm flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Nicht verifiziert
                    </span>
                    <Button
                      onClick={handleResendVerification}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Verifizierung erneut senden
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* E-Mail ändern */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium">E-Mail-Adresse ändern</h3>
              <div className="space-y-2">
                <Input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Neue E-Mail-Adresse"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Du erhältst eine Bestätigungs-E-Mail an die neue Adresse.
                </p>
              </div>

              <Button
                onClick={handleEmailChange}
                disabled={loading || !newEmail.trim()}
                className="w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                {loading ? 'Senden...' : 'E-Mail ändern'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
