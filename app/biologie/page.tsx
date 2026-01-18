'use client';

import { useState, useEffect } from 'react';
import MultipleChoiceBio from '@/components/aufgaben/MultipleChoiceBio';

interface BioAufgabe {
  id: string;
  question_text: string;
  options: string[];
  correct_indices: number[];
  explanation: string;
  hint?: string;
}
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, RotateCcw, CheckCircle, Loader2 } from 'lucide-react';

export default function BiologiePage() {
  const [aufgaben, setAufgaben] = useState<BioAufgabe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAufgaben();
  }, []);

  async function loadAufgaben() {
    try {
      setLoading(true);
      
      // Lade 10 zufällige Aufgaben aus Supabase
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .limit(10);

      if (error) {
        console.error('Supabase Error:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        setError('Keine Aufgaben gefunden. Wurden die Aufgaben in Supabase hochgeladen?');
        return;
      }

      console.log('Geladene Aufgaben:', data);

      // Konvertiere Supabase-Format zu BioAufgabe-Format
      const konvertierteAufgaben: BioAufgabe[] = data.map((aufgabe: any) => {
        // Parse Arrays falls sie als Strings kommen
        let optionen = aufgabe.options;
        let richtigeAntworten = aufgabe.correct_indices;

        // Falls die Daten als JSON-Strings gespeichert sind
        if (typeof optionen === 'string') {
          optionen = JSON.parse(optionen);
        }
        if (typeof richtigeAntworten === 'string') {
          richtigeAntworten = JSON.parse(richtigeAntworten);
        }

        return {
          id: aufgabe.id,
          thema: 'Biologische Psychologie',
          frage: aufgabe.question_text,
          optionen: optionen || [],
          richtigeAntworten: richtigeAntworten || [],
          tipp: 'Überlege dir die biologischen Zusammenhänge genau.',
          erklaerung: aufgabe.explanation || 'Gut gemacht!'
        };
      });

      setAufgaben(konvertierteAufgaben);
    } catch (err: any) {
      console.error('Fehler beim Laden:', err);
      setError(err.message || 'Fehler beim Laden der Aufgaben');
    } finally {
      setLoading(false);
    }
  }

  const handleComplete = (correct: boolean) => {
    if (correct) {
      setScore(score + 1);
    }
  };

  const nextAufgabe = () => {
    if (currentIndex < aufgaben.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    loadAufgaben(); // Lädt neue zufällige Aufgaben
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Lade Aufgaben aus Datenbank...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <Card className="max-w-md border-2 border-red-200">
          <CardContent className="p-8 text-center">
            <div className="text-red-600 mb-4 text-4xl">❌</div>
            <h3 className="text-xl font-bold mb-2">Fehler beim Laden</h3>
            <p className="text-gray-700 mb-4">{error}</p>
            <Button onClick={loadAufgaben} variant="outline">
              Erneut versuchen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (aufgaben.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Keine Aufgaben gefunden</h3>
            <p className="text-gray-600 mb-4">
              Es wurden noch keine Biologie-Aufgaben in die Datenbank eingefügt.
            </p>
            <Button onClick={loadAufgaben}>
              Erneut laden
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isFinished = currentIndex >= aufgaben.length - 1;
  const currentAufgabe = aufgaben[currentIndex];

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Brain className="w-10 h-10 text-purple-600" />
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Biologische Psychologie Quiz
            </h1>
            <p className="text-gray-600 mt-1">75 Fragen aus der Datenbank 🧠</p>
          </div>
        </div>

        {/* Progress Bar */}
        <Card className="mb-6 border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Aufgabe {currentIndex + 1} von {aufgaben.length}
              </span>
              <span className="text-sm font-medium text-purple-600">
                Score: {score} / {aufgaben.length} ({Math.round((score / aufgaben.length) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / aufgaben.length) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Aktuelle Aufgabe */}
        <MultipleChoiceBio
          key={currentAufgabe.id}
          aufgabe={currentAufgabe}
          onComplete={handleComplete}
        />

        {/* Navigation */}
        <div className="mt-6 flex gap-4">
          {!isFinished ? (
            <Button
              onClick={nextAufgabe}
              size="lg"
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600"
            >
              Nächste Aufgabe →
            </Button>
          ) : (
            <Card className="flex-1 border-2 border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-green-800 mb-2">
                  Quiz abgeschlossen! 🎉
                </h3>
                <p className="text-green-700 mb-4">
                  Dein Ergebnis: {score} von {aufgaben.length} Aufgaben richtig
                  ({Math.round((score / aufgaben.length) * 100)}%)
                </p>
                <Button
                  onClick={resetQuiz}
                  variant="outline"
                  className="border-green-600 text-green-700 hover:bg-green-100"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Neues Quiz starten
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Info-Box */}
        <Card className="mt-8 border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Info:</h3>
            <p className="text-sm text-blue-800">
              Diese Aufgaben werden direkt aus der Supabase-Datenbank geladen. 
              Du hast {aufgaben.length} von 75 verfügbaren Fragen.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}