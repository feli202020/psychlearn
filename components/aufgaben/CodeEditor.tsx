'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Play } from 'lucide-react';

interface CodeEditorProps {
  aufgabe: {
    id: string;
    frage: string;
    starter_code: string;
    test_cases: any[];
    erklaerung: string;
    punkte: number;
    loesung_code?: string;
  };
  onComplete: () => void;
}

export default function CodeEditor({ aufgabe, onComplete }: CodeEditorProps) {
  const [code, setCode] = useState(aufgabe.starter_code || '');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const runTests = () => {
    const results = aufgabe.test_cases.map(test => {
      const passed = code.includes(test.expected);
      return { ...test, passed };
    });
    
    setTestResults(results);
    setSubmitted(true);
    
    if (results.every(r => r.passed)) {
      onComplete();
    }
  };

  const allPassed = testResults.every(r => r.passed);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">💻 Code-Aufgabe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="text-lg font-medium mb-4">{aufgabe.frage}</div>

        <div className="relative">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 p-4 font-mono text-sm border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            spellCheck={false}
          />
        </div>

        <Button onClick={runTests} className="w-full" size="lg">
          <Play className="w-4 h-4 mr-2" />
          Code ausführen & testen
        </Button>

        {submitted && (
          <div className={`p-4 rounded-lg ${allPassed ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <div className="flex items-center gap-2 mb-3">
              {allPassed ? (
                <>
                  <CheckCircle className="text-green-600" size={24} />
                  <span className="font-bold text-green-800">Alle Tests bestanden!</span>
                </>
              ) : (
                <>
                  <XCircle className="text-yellow-600" size={24} />
                  <span className="font-bold text-yellow-800">Einige Tests fehlgeschlagen</span>
                </>
              )}
            </div>

            <div className="space-y-2 mb-3">
              {testResults.map((result, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {result.passed ? (
                    <CheckCircle className="text-green-600" size={16} />
                  ) : (
                    <XCircle className="text-red-600" size={16} />
                  )}
                  <span>{result.description}</span>
                </div>
              ))}
            </div>

            {allPassed && (
              <p className="text-sm text-gray-700">{aufgabe.erklaerung}</p>
            )}

            {!allPassed && aufgabe.loesung_code && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSolution(!showSolution)}
                className="mt-2"
              >
                {showSolution ? 'Lösung verbergen' : 'Lösung anzeigen'}
              </Button>
            )}

            {showSolution && aufgabe.loesung_code && (
              <pre className="mt-3 p-3 bg-gray-800 text-green-400 rounded text-sm overflow-x-auto">
                {aufgabe.loesung_code}
              </pre>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}