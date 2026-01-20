'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserCircle, ArrowLeft, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (profile) {
      setUsername(profile.username || '');
      setDisplayName(profile.display_name || '');
    }
  }, [user, profile, router]);

  const handleSave = async () => {
    if (!user) return;

    // Validierung
    if (!username.trim()) {
      setMessage({ type: 'error', text: 'Benutzername darf nicht leer sein' });
      return;
    }

    if (username.length < 3) {
      setMessage({ type: 'error', text: 'Benutzername muss mindestens 3 Zeichen haben' });
      return;
    }

    if (!displayName.trim()) {
      setMessage({ type: 'error', text: 'Anzeigename darf nicht leer sein' });
      return;
    }

    setLoading(true);
    try {
      // Prüfen ob Username bereits vergeben ist (außer eigener)
      const { data: existingUsername } = await supabase
        .from('user_profiles')
        .select('id')
        .ilike('username', username)
        .neq('id', user.id)
        .single();

      if (existingUsername) {
        setMessage({ type: 'error', text: 'Dieser Benutzername ist bereits vergeben' });
        setLoading(false);
        return;
      }

      // Prüfen ob Display-Name bereits vergeben ist (außer eigener)
      const finalDisplayName = displayName.trim() || username.trim();
      const { data: existingDisplayName } = await supabase
        .from('user_profiles')
        .select('id')
        .ilike('display_name', finalDisplayName)
        .neq('id', user.id)
        .single();

      if (existingDisplayName) {
        setMessage({ type: 'error', text: 'Dieser Anzeigename ist bereits vergeben' });
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          username: username.trim(),
          display_name: finalDisplayName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setMessage({ type: 'success', text: 'Profil erfolgreich aktualisiert!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Fehler beim Aktualisieren des Profils:', error);
      setMessage({ type: 'error', text: error.message || 'Fehler beim Aktualisieren des Profils' });
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
              <UserCircle className="w-6 h-6 text-primary" />
              Profil bearbeiten
            </CardTitle>
            <CardDescription>
              Ändere deinen Benutzernamen und Anzeigenamen
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Benutzername
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Dein Benutzername"
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Wird für den Login und die Rangliste verwendet. Mindestens 3 Zeichen.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Anzeigename
              </label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Dein Anzeigename"
                disabled={loading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Wird in der App angezeigt. Muss eindeutig sein.
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Speichern...' : 'Änderungen speichern'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
