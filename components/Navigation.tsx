'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Brain, BookOpen, LogOut, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white border-b-2 border-purple-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Brain className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              PsychLearn
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <Link href="/explore">
                  <Button
                    variant={isActive('/explore') ? 'default' : 'ghost'}
                    className={isActive('/explore') ? 'bg-gradient-to-r from-purple-600 to-blue-600' : ''}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Lernziele
                  </Button>
                </Link>

                <Link href="/settings">
                  <Button
                    variant={isActive('/settings') ? 'default' : 'ghost'}
                    className={isActive('/settings') ? 'bg-gradient-to-r from-purple-600 to-blue-600' : ''}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Einstellungen
                  </Button>
                </Link>

                <div className="pl-4 border-l-2 border-gray-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Abmelden
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">
                    Anmelden
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                    Registrieren
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}