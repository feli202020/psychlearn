/**
 * Semester-Utility-Funktionen
 *
 * Semester-Regelung:
 * - Wintersemester (ungerade: 1., 3., 5.): 01.10. - 31.03.
 * - Sommersemester (gerade: 2., 4., 6.): 01.04. - 30.09.
 */

/**
 * Berechnet das aktuelle Semester basierend auf dem heutigen Datum
 * Startet beim 1. Semester und wechselt automatisch
 */
export function getCurrentSemester(): number {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12

  // Wintersemester (Oktober - März): ungerade Semester (1, 3, 5)
  // Sommersemester (April - September): gerade Semester (2, 4, 6)

  // Einfache Logik: basierend auf Monat
  // Oktober-März = Wintersemester, April-September = Sommersemester

  if (month >= 10 || month <= 3) {
    // Wintersemester
    // Bestimme welches Wintersemester basierend auf Jahr
    // Für eine einfache Implementation: rotiere durch 1, 3, 5
    return 1; // Kann später erweitert werden
  } else {
    // Sommersemester
    return 2; // Kann später erweitert werden
  }
}

/**
 * Gibt an, ob das aktuelle Datum im Wintersemester liegt
 */
export function isWintersemester(date: Date = new Date()): boolean {
  const month = date.getMonth() + 1;
  return month >= 10 || month <= 3;
}

/**
 * Gibt an, ob das aktuelle Datum im Sommersemester liegt
 */
export function isSommersemester(date: Date = new Date()): boolean {
  return !isWintersemester(date);
}

/**
 * Berechnet das Startdatum des nächsten Semesters
 */
export function getNextSemesterStart(): Date {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  if (isWintersemester(now)) {
    // Aktuell Wintersemester -> nächstes ist Sommersemester (01.04.)
    if (month >= 10) {
      // Noch im aktuellen Jahr (Okt-Dez) -> nächstes Jahr April
      return new Date(year + 1, 3, 1); // 01.04. nächstes Jahr
    } else {
      // Jan-März -> April dieses Jahr
      return new Date(year, 3, 1); // 01.04. dieses Jahr
    }
  } else {
    // Aktuell Sommersemester -> nächstes ist Wintersemester (01.10.)
    return new Date(year, 9, 1); // 01.10. dieses Jahr
  }
}

/**
 * Gibt den Namen des Semesters zurück (z.B. "Wintersemester 2024/2025")
 */
export function getSemesterName(semesterNumber: number, date: Date = new Date()): string {
  const year = date.getFullYear();
  const isWinter = semesterNumber % 2 === 1; // ungerade = Winter

  if (isWinter) {
    return `Wintersemester ${year}/${year + 1}`;
  } else {
    return `Sommersemester ${year}`;
  }
}

/**
 * Formatiert ein Datum in deutschem Format (DD.MM.YYYY)
 */
export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Berechnet die Anzahl der Tage bis zum nächsten Semesterstart
 */
export function getDaysUntilNextSemester(): number {
  const now = new Date();
  const nextStart = getNextSemesterStart();
  const diffTime = nextStart.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
