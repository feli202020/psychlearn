'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, ArrowLeft, CheckCircle, AlertCircle, Mail, Smartphone, Clock, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface NotificationSettings {
  daily_reminder: boolean;
  weekly_summary: boolean;
  achievement_notifications: boolean;
  reminder_time: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    daily_reminder: false,
    weekly_summary: false,
    achievement_notifications: true,
    reminder_time: '09:00'
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadNotificationSettings();
  }, [user, router]);

  const loadNotificationSettings = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setSettings({
        daily_reminder: data.daily_reminder || false,
        weekly_summary: data.weekly_summary || false,
        achievement_notifications: data.achievement_notifications ?? true,
        reminder_time: data.reminder_time || '09:00'
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Benachrichtigungseinstellungen gespeichert!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setMessage({ type: 'error', text: 'Fehler beim Speichern der Einstellungen' });
    } finally {
      setLoading(false);
    }
  };

  const toggleSetting = (key: keyof NotificationSettings) => {
    if (typeof settings[key] === 'boolean') {
      setSettings(prev => ({ ...prev, [key]: !prev[key] }));
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
              <Bell className="w-6 h-6 text-primary" />
              Benachrichtigungen
            </CardTitle>
            <CardDescription>
              Konfiguriere, welche Benachrichtigungen du erhalten möchtest
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
                  E-Mail-Benachrichtigungen werden an <strong>{user.email}</strong> gesendet.
                  Diese Funktionen werden in einer zukünftigen Version aktiviert.
                </p>
              </div>
            </div>

            {/* Tägliche Erinnerung */}
            <div className="p-4 border-2 border-border rounded-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium text-foreground">Tägliche Quiz-Erinnerung</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Erhalte eine tägliche Erinnerung, das Daily Quiz zu absolvieren
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => toggleSetting('daily_reminder')}
                  variant={settings.daily_reminder ? 'default' : 'outline'}
                  size="sm"
                  disabled
                >
                  {settings.daily_reminder ? 'An' : 'Aus'}
                </Button>
              </div>
              {settings.daily_reminder && (
                <div className="mt-4 ml-8">
                  <label className="block text-sm text-muted-foreground mb-2">Erinnerungszeit</label>
                  <select
                    value={settings.reminder_time}
                    onChange={(e) => setSettings(prev => ({ ...prev, reminder_time: e.target.value }))}
                    className="px-3 py-2 border rounded-md bg-background"
                    disabled
                  >
                    {['07:00', '08:00', '09:00', '10:00', '12:00', '18:00', '20:00'].map(time => (
                      <option key={time} value={time}>{time} Uhr</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Wöchentliche Zusammenfassung */}
            <div className="p-4 border-2 border-border rounded-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium text-foreground">Wöchentliche Zusammenfassung</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Erhalte jeden Sonntag eine Übersicht deines Lernfortschritts
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => toggleSetting('weekly_summary')}
                  variant={settings.weekly_summary ? 'default' : 'outline'}
                  size="sm"
                  disabled
                >
                  {settings.weekly_summary ? 'An' : 'Aus'}
                </Button>
              </div>
            </div>

            {/* Achievement-Benachrichtigungen */}
            <div className="p-4 border-2 border-border rounded-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium text-foreground">Achievement-Benachrichtigungen</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Werde benachrichtigt, wenn du ein neues Achievement freischaltest
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => toggleSetting('achievement_notifications')}
                  variant={settings.achievement_notifications ? 'default' : 'outline'}
                  size="sm"
                  disabled
                >
                  {settings.achievement_notifications ? 'An' : 'Aus'}
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Diese Funktionen befinden sich in Entwicklung und werden bald verfügbar sein.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
