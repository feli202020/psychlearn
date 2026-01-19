import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {

    // Hole alle verfügbaren Quiz-Daten (sortiert nach Datum absteigend)
    const { data, error } = await supabase
      .from('daily_quiz_sessions')
      .select('quiz_date')
      .order('quiz_date', { ascending: false });

    if (error) {
      console.error('Fehler beim Laden der Quiz-Daten:', error);
      return NextResponse.json({ error: 'Fehler beim Laden der Daten' }, { status: 500 });
    }

    // Extrahiere eindeutige Daten
    const uniqueDates = [...new Set(data.map(d => d.quiz_date))];

    return NextResponse.json({ dates: uniqueDates });
  } catch (error) {
    console.error('Server-Fehler:', error);
    return NextResponse.json({ error: 'Interner Server-Fehler' }, { status: 500 });
  }
}
