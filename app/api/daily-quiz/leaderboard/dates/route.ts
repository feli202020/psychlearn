import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    console.log('[Dates API] Lade verfügbare Quiz-Daten...');

    // Erstelle authentifizierten Supabase-Client aus dem Auth-Header
    const authHeader = request.headers.get('Authorization');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    // Hole alle verfügbaren Quiz-Daten (sortiert nach Datum absteigend)
    const { data, error } = await supabase
      .from('daily_quiz_sessions')
      .select('quiz_date')
      .order('quiz_date', { ascending: false });

    console.log('[Dates API] Ergebnis:', { dataCount: data?.length || 0, error, data });

    if (error) {
      console.error('Fehler beim Laden der Quiz-Daten:', error);
      return NextResponse.json({ error: 'Fehler beim Laden der Daten' }, { status: 500 });
    }

    // Extrahiere eindeutige Daten
    const uniqueDates = [...new Set(data.map(d => d.quiz_date))];

    console.log('[Dates API] Eindeutige Daten:', uniqueDates);

    return NextResponse.json({ dates: uniqueDates });
  } catch (error) {
    console.error('Server-Fehler:', error);
    return NextResponse.json({ error: 'Interner Server-Fehler' }, { status: 500 });
  }
}
