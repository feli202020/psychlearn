import { Suspense } from 'react';
import LoginFormClient from './login-form-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 px-4">
        <Card className="w-full max-w-md border-2 border-border shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Brain className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold text-foreground font-serif">
              PsychoLearn
            </CardTitle>
            <p className="text-gray-600 mt-2">Wird geladen...</p>
          </CardHeader>
        </Card>
      </div>
    }>
      <LoginFormClient />
    </Suspense>
  );
}