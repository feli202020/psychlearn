'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

interface MathInputProps {
  aufgabe: {
    id: string;
    frage: string;
    richtige_loesung_zahl: number;
    toleranz: number;
    erklaerung: string;
    punkte: number;
  };
  onComplete: () => void;
}

export default function MathInput({ aufgabe, onComplete }: MathInputProps) {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const checkAnswer = () => {
    const userAnswer = parseFloat(answer);
    
    if (isNaN(userAnswer)) {
      alert('Bitte gib eine gültige Zahl ein!');
      return;
    }

    setSubmitted(true);

    const diff = Math.abs(userAnswer - aufgabe.richtige_loesung_zahl);
    const correct = diff <= (aufgabe.toleranz || 0.01);
    
    setIsCorrect(correct);
    
    if (correct) {
      onComplete();
    }
  };

  const tryAgain = () => {
    setSubmitted(false);
    setAnswer('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">🔢 Mathe-Aufgabe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="text-lg font-medium mb-4">{aufgabe.frage}</div>

        <div className="flex gap-2">
          <input
            type="number"
            step="any"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={submitted && isCorrect}
            className="flex-1 px-4 py-3 border-2 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Deine Antwort..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !submitted) {
                checkAnswer();
              }
            }}
          />
          
          {!submitted ? (
            <Button onClick={checkAnswer} disabled={!answer} size="lg" className="px-8">
              Prüfen
            </Button>
          ) : !isCorrect && (
            <Button onClick={tryAgain} variant="outline" size="lg">
              Nochmal
            </Button>
          )}
        </div>

        {submitted && (
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <>
                  <CheckCircle className="text-green-600" size={24} />
                  <span className="font-bold text-green-800">Richtig!</span>
                </>
              ) : (
                <>
                  <XCircle className="text-red-600" size={24} />
                  <span className="font-bold text-red-800">Leider nicht richtig. Versuch es nochmal!</span>
                </>
              )}
            </div>
            
            {isCorrect && (
              <>
                <p className="text-sm text-gray-700 mb-2">{aufgabe.erklaerung}</p>
                <div className="text-sm text-green-700 font-mono">
                  Lösung: {aufgabe.richtige_loesung_zahl}
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}