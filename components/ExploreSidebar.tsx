'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Menu, X, BookOpen, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getModuleGroupedBySemester } from '@/lib/database';
import { Modul } from '@/lib/types';

interface ExploreSidebarProps {
  selectedModul: Modul | null;
  onSelectModul: (modul: Modul) => void;
  expandSemester?: number | null;
}

export default function ExploreSidebar({ selectedModul, onSelectModul, expandSemester }: ExploreSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [moduleNachSemester, setModuleNachSemester] = useState<Record<number, Modul[]>>({});
  const [expandedSemesters, setExpandedSemesters] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadModule() {
      try {
        const data = await getModuleGroupedBySemester();
        setModuleNachSemester(data);

        // Alle Semester standardmäßig EINGEKLAPPT lassen
        setExpandedSemesters(new Set());
      } catch (error) {
        console.error('Fehler beim Laden der Module:', error);
      } finally {
        setLoading(false);
      }
    }
    loadModule();
  }, []);

  // Semester automatisch öffnen wenn expandSemester gesetzt ist
  useEffect(() => {
    if (expandSemester !== null && expandSemester !== undefined) {
      setExpandedSemesters(prev => {
        const next = new Set(prev);
        next.add(expandSemester);
        return next;
      });
    }
  }, [expandSemester]);

  const toggleSemester = (semester: number) => {
    setExpandedSemesters(prev => {
      const next = new Set(prev);
      if (next.has(semester)) {
        next.delete(semester);
      } else {
        next.add(semester);
      }
      return next;
    });
  };

  const handleSelectModul = (modul: Modul) => {
    onSelectModul(modul);
    setIsOpen(false); // Sidebar auf Mobile schließen nach Auswahl
  };

  const semesters = Object.keys(moduleNachSemester).map(Number).sort((a, b) => a - b);

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-20 left-4 z-40 lg:hidden bg-white shadow-lg border-2 border-purple-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay für Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-72 bg-white border-r-2 border-purple-200
          shadow-lg z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-0
        `}
      >
        <div className="p-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Semester & Module
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : semesters.length === 0 ? (
            <div className="text-gray-500 text-sm py-4 space-y-2">
              <p>Keine Module vorhanden.</p>
              <p className="text-xs text-gray-400">
                Erstelle die &quot;module&quot; Tabelle in Supabase.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {semesters.map(semester => (
                <div key={semester} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSemester(semester)}
                    className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-colors"
                  >
                    <span className="font-semibold text-gray-700">
                      {semester}. Semester
                    </span>
                    {expandedSemesters.has(semester) ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </button>

                  {expandedSemesters.has(semester) && (
                    <div className="bg-gray-50">
                      {moduleNachSemester[semester].map(modul => (
                        <button
                          key={modul.id}
                          onClick={() => handleSelectModul(modul)}
                          className={`
                            w-full text-left px-4 py-3 text-sm border-t border-gray-200
                            hover:bg-purple-50 transition-colors flex items-center gap-2
                            ${selectedModul?.id === modul.id ? 'bg-purple-100 text-primary font-medium' : 'text-gray-600'}
                          `}
                        >
                          <BookOpen className={`w-4 h-4 shrink-0 ${selectedModul?.id === modul.id ? 'text-primary' : ''}`} />
                          <span className="line-clamp-2">{modul.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
