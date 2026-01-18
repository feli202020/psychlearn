'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Etwas ist schiefgelaufen!
        </h2>
        <p className="text-gray-600 mb-6">
          {error.message || 'Ein unerwarteter Fehler ist aufgetreten.'}
        </p>
        <Button onClick={reset}>
          Erneut versuchen
        </Button>
      </div>
    </div>
  );
}