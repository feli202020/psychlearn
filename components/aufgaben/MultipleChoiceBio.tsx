'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, Lightbulb } from 'lucide-react';

interface MultipleChoiceBioProps {
  question: {
    id: string;
    question_text: string;
    options: string[];  // Array mit 4 Optionen
    correct_indices: number[];  // Array mit mehreren richtigen Indices
    explanation: string;
    hint?: string;  // Optionaler Tipp
  };
  onComplete: (correct: boolean, points?: number) => void;
  questionNumber: number;
  totalQuestions: number;
}

export default function MultipleChoiceBio({ question, onComplete, questionNumber, totalQuestions }: MultipleChoiceBioProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // WICHTIG: State zurücksetzen wenn neue Frage kommt
  useEffect(() => {
    setSelectedIndices([]);
    setSubmitted(false);
    setShowHint(false);
  }, [question.id]);

  const handleToggle = (index: number) => {
    if (submitted) return;

    // Bei nur einer richtigen Antwort: Radio-Button-Verhalten (nur eine Auswahl)
    if (question.correct_indices.length === 1) {
      setSelectedIndices([index]);
    } else {
      // Bei mehreren richtigen Antworten: Checkbox-Verhalten (mehrere Auswahlen)
      if (selectedIndices.includes(index)) {
        setSelectedIndices(selectedIndices.filter(i => i !== index));
      } else {
        setSelectedIndices([...selectedIndices, index]);
      }
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);

    // Prüfe ob ALLE richtigen gewählt und KEINE falschen
    const allCorrectSelected = question.correct_indices.every(i => selectedIndices.includes(i));
    const noWrongSelected = selectedIndices.every(i => question.correct_indices.includes(i));
    const isCorrect = allCorrectSelected && noWrongSelected && selectedIndices.length === question.correct_indices.length;

    // Berechne Punkte: richtig gewählte - falsch gewählte, aber mindestens 0
    const correctSelected = selectedIndices.filter(i => question.correct_indices.includes(i)).length;
    const wrongSelected = selectedIndices.filter(i => !question.correct_indices.includes(i)).length;
    const points = Math.max(0, correctSelected - wrongSelected);

    onComplete(isCorrect, points);
  };

  const getAnswerStatus = () => {
    // Wie viele richtige wurden ausgewählt?
    const correctSelected = selectedIndices.filter(i => question.correct_indices.includes(i)).length;
    const totalCorrect = question.correct_indices.length;
    const wrongSelected = selectedIndices.filter(i => !question.correct_indices.includes(i)).length;
    
    // Alle richtig und keine falschen
    if (correctSelected === totalCorrect && wrongSelected === 0) {
      return { status: 'correct', correctCount: correctSelected, totalCount: totalCorrect };
    }
    // Mindestens eine richtige, aber nicht alle oder auch falsche dabei
    else if (correctSelected > 0) {
      return { status: 'partial', correctCount: correctSelected, totalCount: totalCorrect };
    }
    // Keine richtigen ausgewählt
    else {
      return { status: 'wrong', correctCount: correctSelected, totalCount: totalCorrect };
    }
  };

  const letters = ['A', 'B', 'C', 'D'];
  const answerStatus = submitted ? getAnswerStatus() : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center mb-2">
          <CardTitle className="text-xl">Frage {questionNumber} von {totalQuestions}</CardTitle>
          <div className="text-sm text-gray-500">
            {question.correct_indices.length > 1 ? 'Mehrere Antworten möglich' : 'Eine Antwort'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="text-lg font-medium mb-4">{question.question_text}</div>

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

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedIndices.includes(index);
            const isCorrectAnswer = question.correct_indices.includes(index);
            
            return (
              <button
                key={index}
                onClick={() => handleToggle(index)}
                disabled={submitted}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  submitted
                    ? isCorrectAnswer
                      ? 'border-accent bg-accent/10'
                      : isSelected
                      ? 'border-destructive bg-destructive/10'
                      : 'border-border bg-muted'
                    : isSelected
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary hover:bg-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Checkbox */}
                  <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                    isSelected ? 'bg-primary border-primary' : 'border-gray-400'
                  }`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                  </div>
                  
                  <span className="font-bold text-lg">{letters[index]})</span>
                  <span className="flex-1">{option}</span>
                  
                  {/* Checkmark/X nach Submit */}
                  {submitted && (
                    isCorrectAnswer ? (
                      <CheckCircle className="text-accent" size={20} />
                    ) : isSelected ? (
                      <XCircle className="text-destructive" size={20} />
                    ) : null
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {!submitted ? (
          <Button
            onClick={handleSubmit}
            disabled={selectedIndices.length === 0}
            className="w-full bg-primary"
            size="lg"
          >
            Antwort überprüfen
          </Button>
        ) : (
          <div className={`p-4 rounded-lg ${
            answerStatus?.status === 'correct' ? 'bg-accent/10 border-2 border-accent' :
            answerStatus?.status === 'partial' ? 'bg-yellow-50 border-2 border-yellow-500' :
            'bg-destructive/10 border-2 border-destructive'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {answerStatus?.status === 'correct' ? (
                <>
                  <CheckCircle className="text-accent" size={24} />
                  <span className="font-bold text-accent">Richtig!</span>
                </>
              ) : answerStatus?.status === 'partial' ? (
                <>
                  <AlertCircle className="text-yellow-600" size={24} />
                  <span className="font-bold text-yellow-800">
                    Fast! Du hast {answerStatus.correctCount} von {answerStatus.totalCount} richtigen Antworten gefunden.
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="text-destructive" size={24} />
                  <span className="font-bold text-destructive">Leider falsch.</span>
                </>
              )}
            </div>
            
            {/* Erklärung wird nur NACH dem Absenden angezeigt */}
            {question.explanation && question.explanation.trim() !== '' ? (
              <p className="text-sm text-gray-700">{question.explanation}</p>
            ) : (
              <p className="text-sm text-gray-700">
                {answerStatus?.status === 'correct' 
                  ? 'Sehr gut! Du hast alle richtigen Antworten gefunden.' 
                  : `Die richtige(n) Antwort(en): ${question.correct_indices.map(i => letters[i]).sort().join(', ')}`
                }
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}