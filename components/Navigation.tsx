'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Brain,
  BookOpen,
  LogOut,
  Settings,
  Trophy,
  User,
  Mail,
  Key,
  Trash2,
  ChevronDown,
  GraduationCap,
  Eye,
  EyeOff,
  Bell,
  Palette,
  HelpCircle,
  UserCircle
} from 'lucide-react';
import DailyQuizWidget from './DailyQuizWidget';

export default function Navigation() {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-card shadow-sm sticky top-0 z-50">
      <div className="border-b-2 border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Brain className="w-8 h-8 text-accent" />
              <span className="text-2xl font-bold text-foreground font-serif">
                PsychLearn
              </span>
            </Link>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/explore">
                    <Button
                      variant={isActive('/explore') ? 'default' : 'ghost'}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Lernziele
                    </Button>
                  </Link>

                  <Link href="/rangliste">
                    <Button
                      variant={isActive('/rangliste') ? 'default' : 'ghost'}
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      Rangliste
                    </Button>
                  </Link>

                  {/* Einstellungen Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={pathname.startsWith('/settings') ? 'default' : 'ghost'}
                        className="gap-1"
                      >
                        <Settings className="w-4 h-4" />
                        Einstellungen
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Lerneinstellungen</DropdownMenuLabel>
                      <Link href="/settings/semester">
                        <DropdownMenuItem className="cursor-pointer">
                          <GraduationCap className="w-4 h-4 mr-2" />
                          Semesterwahl
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/settings/notifications">
                        <DropdownMenuItem className="cursor-pointer">
                          <Bell className="w-4 h-4 mr-2" />
                          Benachrichtigungen
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/settings/privacy">
                        <DropdownMenuItem className="cursor-pointer">
                          <EyeOff className="w-4 h-4 mr-2" />
                          Privatsphäre
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Darstellung</DropdownMenuLabel>
                      <Link href="/settings/appearance">
                        <DropdownMenuItem className="cursor-pointer">
                          <Palette className="w-4 h-4 mr-2" />
                          Erscheinungsbild
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <Link href="/settings">
                        <DropdownMenuItem className="cursor-pointer">
                          <Settings className="w-4 h-4 mr-2" />
                          Alle Einstellungen
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Konto Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={pathname.startsWith('/account') ? 'default' : 'ghost'}
                        className="gap-1"
                      >
                        <User className="w-4 h-4" />
                        Konto
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {profile?.display_name || profile?.username || 'Benutzer'}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <Link href="/account/profile">
                        <DropdownMenuItem className="cursor-pointer">
                          <UserCircle className="w-4 h-4 mr-2" />
                          Profil bearbeiten
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/account/email">
                        <DropdownMenuItem className="cursor-pointer">
                          <Mail className="w-4 h-4 mr-2" />
                          E-Mail ändern
                        </DropdownMenuItem>
                      </Link>
                      <Link href="/account/password">
                        <DropdownMenuItem className="cursor-pointer">
                          <Key className="w-4 h-4 mr-2" />
                          Passwort ändern
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <Link href="/account/delete">
                        <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Account löschen
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Abmelden
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">
                      Anmelden
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button>
                      Registrieren
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Quiz Widget - direkt unter dem PsychLearn Logo */}
      <DailyQuizWidget />
    </nav>
  );
}
