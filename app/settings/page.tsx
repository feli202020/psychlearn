'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Settings,
  GraduationCap,
  Bell,
  EyeOff,
  Palette,
  User,
  Mail,
  Key,
  Trash2,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) return null;

  const settingsGroups = [
    {
      title: 'Lerneinstellungen',
      items: [
        {
          href: '/settings/semester',
          icon: GraduationCap,
          title: 'Semesterwahl',
          description: 'Wähle dein aktuelles Semester für personalisierte Inhalte'
        },
        {
          href: '/settings/notifications',
          icon: Bell,
          title: 'Benachrichtigungen',
          description: 'Konfiguriere E-Mail-Erinnerungen und Benachrichtigungen'
        },
        {
          href: '/settings/privacy',
          icon: EyeOff,
          title: 'Privatsphäre',
          description: 'Verwalte deine Sichtbarkeit in der Rangliste'
        }
      ]
    },
    {
      title: 'Darstellung',
      items: [
        {
          href: '/settings/appearance',
          icon: Palette,
          title: 'Erscheinungsbild',
          description: 'Passe das Aussehen der App an (Dark Mode, etc.)'
        }
      ]
    },
    {
      title: 'Konto',
      items: [
        {
          href: '/account/profile',
          icon: User,
          title: 'Profil bearbeiten',
          description: 'Ändere deinen Benutzernamen und Anzeigenamen'
        },
        {
          href: '/account/email',
          icon: Mail,
          title: 'E-Mail ändern',
          description: 'Ändere deine E-Mail-Adresse oder verifiziere sie erneut'
        },
        {
          href: '/account/password',
          icon: Key,
          title: 'Passwort ändern',
          description: 'Aktualisiere dein Passwort für mehr Sicherheit'
        },
        {
          href: '/account/delete',
          icon: Trash2,
          title: 'Account löschen',
          description: 'Lösche deinen Account und alle zugehörigen Daten',
          danger: true
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold bg-primary bg-clip-text text-transparent">
              Einstellungen
            </h1>
          </div>
          <p className="text-muted-foreground">
            Verwalte dein Konto und deine Lernpräferenzen
          </p>
        </div>

        {/* Benutzer-Info Card */}
        <Card className="mb-6 border-2 border-primary/30">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg">
                  {profile?.display_name || profile?.username || 'Benutzer'}
                </p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm text-muted-foreground">Level {profile?.level || 1}</p>
                <p className="font-semibold text-primary">{profile?.xp || 0} XP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Groups */}
        <div className="space-y-6">
          {settingsGroups.map((group) => (
            <Card key={group.title} className="border-2 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{group.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="divide-y divide-border">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`
                          flex items-center gap-4 py-4 hover:bg-muted/50 -mx-6 px-6 transition-colors
                          ${item.danger ? 'hover:bg-red-50' : ''}
                        `}
                      >
                        <div className={`
                          w-10 h-10 rounded-lg flex items-center justify-center
                          ${item.danger ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}
                        `}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-medium ${item.danger ? 'text-red-600' : 'text-foreground'}`}>
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <ChevronRight className={`w-5 h-5 ${item.danger ? 'text-red-400' : 'text-muted-foreground'}`} />
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
