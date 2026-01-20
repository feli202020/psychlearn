'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EyeOff, ArrowLeft, CheckCircle, AlertCircle, Eye, Trophy, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function PrivacyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [anonymousInLeaderboard, setAnonymousInLeaderboard] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadPrivacySettings();
  }, [user, router]);

  const loadPrivacySettings = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_profiles')
      .select('anonymous_in_leaderboard')
      .eq('id', user.id)
      .single();

    if (data) {
      setAnonymousInLeaderboard(data.anonymous_in_leaderboard || false);
    }
  };

  const handleToggleAnonymous = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const newValue = !anonymousInLeaderboard;

      const { error } = await supabase
        .from('user_profiles')
        .update({
          anonymous_in_leaderboard: newValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setAnonymousInLeaderboard(newValue);
      setMessage({
        type: 'success',
        text: newValue
          ? 'Du erscheinst jetzt anonym in der Rangliste'
          : 'Dein Name ist jetzt in der Rangliste sichtbar'
      });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Privatsphäre-Einstellung:', error);
      setMessage({ type: 'error', text: 'Fehler beim Speichern der Einstellung' });
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
              <EyeOff className="w-6 h-6 text-primary" />
              Privatsphäre
            </CardTitle>
            <CardDescription>
              Bestimme, wie deine Daten in der App angezeigt werden
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

            {/* Ranglisten-Anonymität */}
            <div className="p-4 border-2 border-border rounded-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Trophy className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium text-foreground">Ranglisten-Anonymität</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {anonymousInLeaderboard
                        ? 'Dein Name wird in der Rangliste als "Anonym" angezeigt'
                        : 'Dein Benutzername ist in der Rangliste für alle sichtbar'
                      }
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleToggleAnonymous}
                  disabled={loading}
                  variant={anonymousInLeaderboard ? 'default' : 'outline'}
                  size="sm"
                >
                  {anonymousInLeaderboard ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Anonym
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Sichtbar
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Vorschau */}
            <div className="bg-muted rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Vorschau in der Rangliste
              </h4>
              <div className="bg-card rounded-lg p-3 border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary">1.</span>
                    <span className="font-medium">
                      {anonymousInLeaderboard ? 'Anonym' : 'Dein Benutzername'}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">1.234 XP</span>
                </div>
              </div>
            </div>

            {/* Info */}
            <p className="text-xs text-muted-foreground">
              Diese Einstellung betrifft nur die öffentliche Rangliste. Dein Fortschritt und deine Statistiken
              werden weiterhin in deinem persönlichen Profil gespeichert.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
