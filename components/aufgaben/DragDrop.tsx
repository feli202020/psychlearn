'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { Aufgabe } from '@/lib/types';

interface DragDropProps {
  aufgabe: Aufgabe;
  onComplete: (punkte: number) => void;
}

export default function DragDrop({ aufgabe, onComplete }: DragDropProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  // Safety check NACH den hooks
  if (!aufgabe?.drag_drop_data) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          Drag & Drop Daten nicht verfügbar
        </CardContent>
      </Card>
    );
  }

  const { drop_zones, items } = aufgabe.drag_drop_data;

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (zoneId: string) => {
    if (draggedItem) {
      setPlacements({
        ...placements,
        [zoneId]: draggedItem,
      });
      setDraggedItem(null);
    }
  };

  const handleRemove = (zoneId: string) => {
    const newPlacements = { ...placements };
    delete newPlacements[zoneId];
    setPlacements(newPlacements);
  };

  const checkAnswers = () => {
    const newResults: Record<string, boolean> = {};
    
    drop_zones.forEach(zone => {
      const placedItem = placements[zone.id];
      newResults[zone.id] = placedItem === zone.correct_item;
    });

    setResults(newResults);
    setSubmitted(true);

    const allCorrect = Object.values(newResults).every(r => r);
    if (allCorrect) {
      onComplete(aufgabe.punkte);
    }
  };

  const reset = () => {
    setPlacements({});
    setSubmitted(false);
    setResults({});
  };

  const allPlaced = drop_zones.every(zone => placements[zone.id]);
  const allCorrect = submitted && Object.values(results).every(r => r);

  const availableItems = items.filter(
    item => !Object.values(placements).includes(item.id)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">🧬 Drag & Drop - Biologie</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="text-lg font-medium">{aufgabe.frage}</div>

        <div className="relative bg-gradient-to-br from-background via-primary/5 to-background rounded-xl p-8 border-2 border-dashed border-primary/30 min-h-[400px]">
          
          <div className="absolute inset-4 border-4 border-primary/30 rounded-full opacity-20 pointer-events-none" />
          
          {drop_zones.map(zone => {
            const placedItem = placements[zone.id];
            const item = items.find(i => i.id === placedItem);
            const isCorrect = results[zone.id];
            const isWrong = submitted && !isCorrect && placedItem;

            return (
              <div
                key={zone.id}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(zone.id)}
                className={`absolute border-2 border-dashed rounded-lg flex items-center justify-center transition-all ${
                  !placedItem
                    ? 'border-gray-300 bg-white/50'
                    : isCorrect
                    ? 'border-green-500 bg-green-50'
                    : isWrong
                    ? 'border-red-500 bg-red-50'
                    : 'border-primary bg-primary/10'
                }`}
                style={{
                  left: `${zone.x}px`,
                  top: `${zone.y}px`,
                  width: `${zone.width}px`,
                  height: `${zone.height}px`,
                }}
              >
                {placedItem ? (
                  <div className="text-center p-2">
                    <div className="text-3xl mb-1">{item?.icon}</div>
                    <div className="text-xs font-semibold">{item?.label}</div>
                    {!submitted && (
                      <button
                        onClick={() => handleRemove(zone.id)}
                        className="mt-2 text-xs text-red-600 hover:underline"
                      >
                        Entfernen
                      </button>
                    )}
                    {submitted && (
                      <div className="mt-1">
                        {isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 mx-auto" />
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-2">
                    <div className="text-xs text-gray-500">{zone.label}</div>
                    <div className="text-2xl text-gray-300 mt-1">?</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div>
          <h3 className="font-semibold mb-3">📦 Verfügbare Organellen:</h3>
          <div className="flex flex-wrap gap-3">
            {availableItems.length > 0 ? (
              availableItems.map(item => (
                <div
                  key={item.id}
                  draggable={!submitted}
                  onDragStart={() => handleDragStart(item.id)}
                  className={`${
                    submitted ? 'opacity-50 cursor-not-allowed' : 'cursor-move hover:scale-105'
                  } bg-card border-2 border-primary/30 rounded-lg p-4 transition-all shadow-sm`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">{item.icon}</div>
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 italic">Alle Organellen wurden platziert!</div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {!submitted ? (
            <Button
              onClick={checkAnswers}
              disabled={!allPlaced}
              size="lg"
              className="flex-1"
            >
              Überprüfen
            </Button>
          ) : (
            <Button
              onClick={reset}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Nochmal versuchen
            </Button>
          )}
        </div>

        {submitted && (
          <div className={`p-4 rounded-lg ${allCorrect ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              {allCorrect ? (
                <>
                  <CheckCircle className="text-green-600" size={24} />
                  <span className="font-bold text-green-800">
                    Perfekt! Alle richtig! +{aufgabe.punkte} XP
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="text-yellow-600" size={24} />
                  <span className="font-bold text-yellow-800">
                    Fast! Einige sind noch nicht ganz richtig.
                  </span>
                </>
              )}
            </div>
            {allCorrect && (
              <p className="text-sm text-gray-700">{aufgabe.erklaerung}</p>
            )}
          </div>
        )}

      </CardContent>
    </Card>
  );
}