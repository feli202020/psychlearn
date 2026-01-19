'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Mail, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

function VerifyEmailContent() {
  const [email, setEmail] = useState<string>('');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string>('');
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Zuerst: E-Mail aus URL-Parameter holen
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }

    // Dann: E-Mail aus der Session holen (als Fallback)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email && !emailParam) {
        setEmail(session.user.email);
      }

      // Wenn der User bereits verifiziert ist, leite zur Explore-Seite weiter
      if (session?.user?.email_confirmed_at) {
        router.push('/explore');
      }
    });

    // Prüfe auf Änderungen im Auth-Status
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        router.push('/explore');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, searchParams]);

  // Cooldown Timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(cooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResendEmail = async () => {
    if (!email) {
      console.error('Keine E-Mail-Adresse verfügbar');
      return;
    }

    if (cooldown > 0) {
      return;
    }

    setResending(true);
    setError('');
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        console.error('Fehler beim Senden der E-Mail:', error);
        // Extrahiere verbleibende Sekunden aus der Fehlermeldung, falls vorhanden
        const secondsMatch = error.message.match(/after (\d+) seconds/);
        if (secondsMatch) {
          setCooldown(parseInt(secondsMatch[1]));
        } else {
          setCooldown(60); // Standard: 60 Sekunden
        }
        setError(error.message || 'E-Mail konnte nicht erneut gesendet werden');
      } else {
        setResent(true);
        setCooldown(60); // Nach erfolgreichem Versand 60 Sekunden warten
        setTimeout(() => setResent(false), 5000);
      }
    } catch (err) {
      console.error('Fehler:', err);
      setError('Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md border-2 border-purple-200 shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Brain className="w-12 h-12 text-purple-600" />
              <Mail className="w-6 h-6 text-blue-600 absolute -bottom-1 -right-1 bg-white rounded-full p-1" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Bestätige deine E-Mail
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm text-gray-700 font-medium">
                  Wir haben dir eine Bestätigungs-E-Mail gesendet an:
                </p>
                <p className="text-base font-semibold text-blue-600 break-all">
                  {email || 'deine E-Mail-Adresse'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p>Klicke auf den Link in der E-Mail, um deinen Account zu aktivieren</p>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p>Nach der Bestätigung kannst du dich direkt anmelden</p>
            </div>
          </div>

          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800 font-medium mb-2">
              Keine E-Mail erhalten?
            </p>
            <p className="text-sm text-amber-700">
              Bitte überprüfe auch deinen <strong>Spam-</strong>, <strong>Junk-</strong> oder <strong>Werbung-Ordner</strong>.
              Manchmal landen Bestätigungs-E-Mails dort. Es kann auch einige Minuten dauern, bis die E-Mail ankommt.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}

          {resent && (
            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>E-Mail wurde erneut gesendet!</span>
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleResendEmail}
              disabled={resending || resent || cooldown > 0}
              variant="outline"
              className="w-full border-2 border-purple-200 hover:bg-purple-50 disabled:opacity-50"
            >
              {resending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Wird gesendet...
                </>
              ) : resent ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  E-Mail gesendet
                </>
              ) : cooldown > 0 ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Erneut senden in {cooldown}s
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  E-Mail erneut senden
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">oder</span>
              </div>
            </div>

            <Link href="/login" className="block">
              <Button
                variant="default"
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Zur Anmeldeseite
              </Button>
            </Link>
          </div>

          <p className="text-xs text-center text-gray-500">
            Nach der Bestätigung deiner E-Mail kannst du dich mit deinen Zugangsdaten anmelden und alle Funktionen nutzen.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md border-2 border-purple-200 shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Brain className="w-12 h-12 text-purple-600" />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Wird geladen...
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
