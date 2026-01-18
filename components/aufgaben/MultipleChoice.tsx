'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

interface MultipleChoiceProps {
  aufgabe: {
    id: string;
    frage: string;
    antwort_a: string;
    antwort_b: string;
    antwort_c: string;
    antwort_d: string;
    richtige_antwort: string;
    erklaerung: string;
    punkte: number;
  };
  onComplete: () => void;
}

export default function MultipleChoice({ aufgabe, onComplete }: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const options = [
    { key: 'A', text: aufgabe.antwort_a },
    { key: 'B', text: aufgabe.antwort_b },
    { key: 'C', text: aufgabe.antwort_c },
    { key: 'D', text: aufgabe.antwort_d },
  ];

  const handleSubmit = () => {
    setSubmitted(true);
    if (selected === aufgabe.richtige_antwort) {
      onComplete();
    }
  };

  const isCorrect = selected === aufgabe.richtige_antwort;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Multiple Choice</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="text-lg font-medium mb-4">{aufgabe.frage}</div>

        <div className="space-y-3">
          {options.map((option) => (
            <button
              key={option.key}
              onClick={() => !submitted && setSelected(option.key)}
              disabled={submitted}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                submitted
                  ? option.key === aufgabe.richtige_antwort
                    ? 'border-green-500 bg-green-50'
                    : option.key === selected
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                  : selected === option.key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg">{option.key})</span>
                <span>{option.text}</span>
              </div>
            </button>
          ))}
        </div>

        {!submitted ? (
          <Button onClick={handleSubmit} disabled={!selected} className="w-full" size="lg">
            Antwort überprüfen
          </Button>
        ) : (
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
                  <span className="font-bold text-red-800">Leider falsch.</span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-700">{aufgabe.erklaerung}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}