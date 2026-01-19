/**
 * Utility functions for Daily Quiz
 * Handles timezone conversion and date calculations
 */

/**
 * Berechnet den aktuellen Quiz-Tag basierend auf deutscher Zeit (04:00 - 03:59 Uhr)
 * Ein Quiz-Tag läuft von 04:00 Uhr morgens bis 03:59 Uhr am nächsten Tag
 *
 * @returns ISO Date String (YYYY-MM-DD) für den aktuellen Quiz-Tag
 */
export function getCurrentQuizDate(): string {
  // Hole aktuelle Zeit in deutscher Zeitzone (Europe/Berlin)
  const now = new Date();
  const germanTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));

  // Wenn es vor 04:00 Uhr morgens ist, gehört es zum vorherigen Quiz-Tag
  const hour = germanTime.getHours();
  if (hour < 4) {
    germanTime.setDate(germanTime.getDate() - 1);
  }

  // Gebe YYYY-MM-DD Format zurück
  return germanTime.toISOString().split('T')[0];
}

/**
 * Berechnet wann das nächste Quiz verfügbar ist
 * @returns Date object für 04:00 Uhr deutscher Zeit am nächsten Quiz-Tag
 */
export function getNextQuizTime(): Date {
  const now = new Date();
  const germanTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' }));

  // Setze auf 04:00 Uhr
  germanTime.setHours(4, 0, 0, 0);

  // Wenn wir vor 04:00 Uhr sind, ist das nächste Quiz heute um 04:00
  // Ansonsten ist es morgen um 04:00
  const hour = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Berlin' })).getHours();
  if (hour >= 4) {
    germanTime.setDate(germanTime.setDate(germanTime.getDate() + 1));
  }

  return germanTime;
}

/**
 * Erstellt einen deterministischen Seed aus Datum und Semester
 * Wird verwendet um für alle Benutzer die gleiche "zufällige" Fragenauswahl zu generieren
 */
export function generateQuizSeed(date: string, semester: number): number {
  // Einfacher Hash-Algorithm für konsistente Seeds
  const str = `${date}-${semester}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Seeded Random Number Generator
 * Verwendet einen Seed um reproduzierbare "zufällige" Zahlen zu generieren
 */
export class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  /**
   * Gibt eine pseudo-zufällige Zahl zwischen 0 und 1 zurück
   */
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  /**
   * Mischt ein Array deterministisch basierend auf dem Seed
   */
  shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

/**
 * Formatiert ein Datum für die Anzeige
 */
export function formatQuizDate(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00'); // Mittag um Zeitzonenfehler zu vermeiden
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}
