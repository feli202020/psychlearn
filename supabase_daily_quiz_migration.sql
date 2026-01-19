-- Migration für Daily Quiz System
-- Führe dies in deiner Supabase SQL Editor aus

-- Tabelle für tägliche Quiz-Sessions
-- Speichert eine Quiz-Session pro Tag mit festen Fragen
CREATE TABLE IF NOT EXISTS daily_quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_date DATE NOT NULL,
  semester INTEGER NOT NULL,
  question_ids UUID[] NOT NULL, -- Array von 20 Question IDs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quiz_date, semester)
);

-- Index für schnelle Datums-Abfragen
CREATE INDEX IF NOT EXISTS idx_daily_quiz_sessions_date ON daily_quiz_sessions(quiz_date, semester);

-- Tabelle für Quiz-Ergebnisse der Benutzer
CREATE TABLE IF NOT EXISTS daily_quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES daily_quiz_sessions(id) ON DELETE CASCADE,
  score INTEGER NOT NULL, -- Anzahl richtig beantworteter Fragen
  total_points INTEGER NOT NULL, -- Gesamtpunkte (inklusive Teilpunkte)
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, session_id)
);

-- Indizes für Leaderboard-Abfragen
CREATE INDEX IF NOT EXISTS idx_daily_quiz_results_session ON daily_quiz_results(session_id, total_points DESC);
CREATE INDEX IF NOT EXISTS idx_daily_quiz_results_user ON daily_quiz_results(user_id);

-- RLS Policies für daily_quiz_sessions
ALTER TABLE daily_quiz_sessions ENABLE ROW LEVEL SECURITY;

-- SELECT Policy: Erlaubt sowohl authenticated als auch anon (für API)
CREATE POLICY "Anyone can view daily quiz sessions"
  ON daily_quiz_sessions
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- INSERT Policy: Erlaubt API das Erstellen von Sessions
CREATE POLICY "API can create daily quiz sessions"
  ON daily_quiz_sessions
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- RLS Policies für daily_quiz_results
ALTER TABLE daily_quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own quiz results"
  ON daily_quiz_results
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own quiz results"
  ON daily_quiz_results
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view leaderboard (all results)"
  ON daily_quiz_results
  FOR SELECT
  TO authenticated
  USING (true);

-- Füge username zu user_profiles hinzu falls noch nicht vorhanden
-- (Für Leaderboard-Anzeige)
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS username TEXT;

-- Entferne last_quiz_date Spalte da wir jetzt daily_quiz_results verwenden
-- (Optional, kann auch behalten werden für Rückwärtskompatibilität)
-- ALTER TABLE user_profiles DROP COLUMN IF EXISTS last_quiz_date;

COMMENT ON TABLE daily_quiz_sessions IS 'Speichert tägliche Quiz-Sessions mit festen Fragen für alle Benutzer';
COMMENT ON TABLE daily_quiz_results IS 'Speichert die Ergebnisse der Benutzer für tägliche Quizzes';
COMMENT ON COLUMN user_profiles.username IS 'Benutzername für öffentliche Anzeige (z.B. Leaderboard)';
