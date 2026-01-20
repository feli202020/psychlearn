'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';

interface MathInputAdvancedProps {
  question: {
    id: string;
    question_text: string;
    answer: string;  // Erwartete Antwort (kann mathematische Symbole enthalten)
    explanation: string;
    hint?: string;
  };
  onComplete: (correct: boolean, points?: number, answerData?: any) => void;
  questionNumber?: number;
  totalQuestions?: number;
  savedAnswer?: any;
}

// Symbol-Kategorien
const SYMBOLS = {
  häufig: [
    { symbol: 'μ', label: 'μ (mu)' },
    { symbol: 'σ', label: 'σ (sigma)' },
    { symbol: 'x̄', label: 'x̄ (x-quer)' },
    { symbol: "x̃", label: "x̃" },
    { symbol: 's', label: 's' },
    { symbol: 'n', label: 'n' },
    { symbol: 'α', label: 'α (alpha)' },
    { symbol: 'p', label: 'p' },
    { symbol: 'r', label: 'r' },
    { symbol: '±', label: '±' },
    { symbol: '≤', label: '≤' },
    { symbol: '≥', label: '≥' },
    { symbol: '≠', label: '≠' },
    { symbol: '√', label: '√' },
    { symbol: '²', label: '²' },
    { symbol: '³', label: '³' },
    { symbol: 'Σ', label: 'Σ (Summe)' },
    { symbol: 'χ²', label: 'χ²' },
    { symbol: 't', label: 't' },
    { symbol: 'F', label: 'F' },
    { symbol: 'z', label: 'z' },
  ],
  erweitert: [
    { symbol: 'σ²', label: 'σ²' },
    { symbol: 's²', label: 's²' },
    { symbol: 'r²', label: 'r²' },
    { symbol: 'R²', label: 'R²' },
    { symbol: 'β', label: 'β (beta)' },
    { symbol: 'ρ', label: 'ρ (rho)' },
    { symbol: 'η²', label: 'η²' },
    { symbol: 'df', label: 'df' },
    { symbol: 'π', label: 'π' },
    { symbol: 'Δ', label: 'Δ (Delta)' },
    { symbol: 'SE', label: 'SE' },
    { symbol: 'M', label: 'M' },
    { symbol: 'SD', label: 'SD' },
    { symbol: 'N', label: 'N' },
    { symbol: 'ε', label: 'ε (epsilon)' },
    { symbol: 'ω²', label: 'ω²' },
    { symbol: '≈', label: '≈' },
    { symbol: '×', label: '×' },
    { symbol: '÷', label: '÷' },
    { symbol: '∞', label: '∞' },
    { symbol: '<', label: '<' },
    { symbol: '>', label: '>' },
    { symbol: '→', label: '→' },
    { symbol: '|', label: '|' },
    { symbol: '½', label: '½' },
    { symbol: '¼', label: '¼' },
    { symbol: '¾', label: '¾' },
    { symbol: '%', label: '%' },
  ],
};

export default function MathInputAdvanced({
  question,
  onComplete,
  questionNumber,
  totalQuestions,
  savedAnswer
}: MathInputAdvancedProps) {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [activeTab, setActiveTab] = useState<'häufig' | 'erweitert'>('häufig');
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // WICHTIG: State zurücksetzen oder aus savedAnswer laden wenn Frage wechselt
  useEffect(() => {
    if (savedAnswer) {
      // Lade gespeicherte Antwort
      setAnswer(savedAnswer.answer || '');
      setSubmitted(savedAnswer.submitted || false);
      setIsCorrect(savedAnswer.isCorrect || false);
      setShowHint(savedAnswer.showHint || false);
      setActiveTab(savedAnswer.activeTab || 'häufig');
    } else {
      // Neue Frage - zurücksetzen
      setAnswer('');
      setSubmitted(false);
      setIsCorrect(false);
      setShowHint(false);
      setActiveTab('häufig');
    }
  }, [question.id, savedAnswer]);

  // Symbol an Cursor-Position einfügen
  const insertSymbol = (symbol: string) => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const newValue = answer.slice(0, start) + symbol + answer.slice(end);
    
    setAnswer(newValue);
    
    // Cursor nach dem eingefügten Symbol positionieren
    setTimeout(() => {
      input.focus();
      const newPosition = start + symbol.length;
      input.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const checkAnswer = () => {
    setSubmitted(true);

    // Normalisiere beide Antworten: Entferne alle Leerzeichen und mache lowercase
    const normalizeAnswer = (str: string) => {
      return str
        .trim()                    // Entferne Leerzeichen am Anfang/Ende
        .replace(/\s+/g, '')       // Entferne ALLE Leerzeichen (auch mehrfache)
        .toLowerCase();            // Kleinbuchstaben für Vergleich
    };

    const normalizedUserAnswer = normalizeAnswer(answer);
    const normalizedCorrectAnswer = normalizeAnswer(question.answer);

    const correct = normalizedUserAnswer === normalizedCorrectAnswer;
    setIsCorrect(correct);

    // Speichere State für diese Frage
    const answerData = {
      answer,
      submitted: true,
      isCorrect: correct,
      showHint,
      activeTab
    };

    // Math-Fragen geben immer 1 Punkt wenn richtig, 0 wenn falsch
    onComplete(correct, correct ? 1 : 0, answerData);
  };

  const tryAgain = () => {
    setSubmitted(false);
    setAnswer('');
  };

  return (
    <Card>
      <CardHeader>
        {questionNumber && totalQuestions && (
          <div className="text-sm text-gray-500 mb-2">
            Frage {questionNumber} von {totalQuestions}
          </div>
        )}
        <CardTitle className="text-xl">🔢 Rechenaufgabe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Frage */}
        <div className="text-lg font-medium mb-4">{question.question_text}</div>

        {/* Hinweis bei Mathe-Fragen */}
        {!submitted && (
          <div className="text-xs text-gray-500 italic mb-3">
            Hinweis: Verwende Punkt statt Komma (z.B. 1.0 statt 1,0)
          </div>
        )}

        {/* Tipp-Button (nur VOR dem Absenden) */}
        {!submitted && question.hint && (
          <div>
            <Button
              onClick={() => setShowHint(!showHint)}
              variant="outline"
              size="sm"
              className="mb-3"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              {showHint ? 'Tipp ausblenden' : 'Tipp anzeigen'}
            </Button>
            
            {showHint && (
              <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-3 mb-3">
                <p className="text-sm text-primary">
                  <strong>💡 Tipp:</strong> {question.hint}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Symbol-Tabs */}
        <div className="border-2 border-border rounded-lg overflow-hidden">
          {/* Tab Header */}
          <div className="flex border-b-2 border-border bg-muted">
            <button
              onClick={() => setActiveTab('häufig')}
              className={`flex-1 px-4 py-2 font-medium transition-colors ${
                activeTab === 'häufig'
                  ? 'bg-card border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Häufig
            </button>
            <button
              onClick={() => setActiveTab('erweitert')}
              className={`flex-1 px-4 py-2 font-medium transition-colors ${
                activeTab === 'erweitert'
                  ? 'bg-card border-b-2 border-primary text-primary'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Erweitert
            </button>
          </div>

          {/* Symbol-Buttons */}
          <div className="p-3 bg-card">
            <div className="grid grid-cols-8 gap-2">
              {SYMBOLS[activeTab].map(({ symbol, label }) => (
                <button
                  key={symbol}
                  onClick={() => insertSymbol(symbol)}
                  disabled={submitted && isCorrect}
                  className="px-2 py-2 border border-border rounded hover:bg-primary/10 hover:border-primary transition-colors text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  title={label}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Eingabefeld */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={submitted && isCorrect}
            className="flex-1 text-lg"
            placeholder="Deine Antwort... (nutze die Symbole oben)"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !submitted && answer.trim()) {
                checkAnswer();
              }
            }}
          />
          
          {!submitted ? (
            <Button
              onClick={checkAnswer}
              disabled={!answer.trim()}
              size="lg"
              className="px-8 bg-primary"
            >
              Prüfen
            </Button>
          ) : !isCorrect && (
            <Button onClick={tryAgain} variant="outline" size="lg">
              Nochmal
            </Button>
          )}
        </div>

        {/* Ergebnis */}
        {submitted && (
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-accent/10 border-2 border-accent' : 'bg-destructive/10 border-2 border-destructive'}`}>
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <>
                  <CheckCircle className="text-accent" size={24} />
                  <span className="font-bold text-accent">Richtig!</span>
                </>
              ) : (
                <>
                  <XCircle className="text-destructive" size={24} />
                  <span className="font-bold text-destructive">Leider nicht richtig.</span>
                </>
              )}
            </div>
            
            {isCorrect ? (
              <p className="text-sm text-gray-700">{question.explanation}</p>
            ) : (
              <p className="text-sm text-gray-700">
                Versuch es nochmal! Die richtige Antwort ist: <span className="font-mono font-bold">{question.answer}</span>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}