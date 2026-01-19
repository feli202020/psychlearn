-- ============================================================================
-- Daily Quiz System: Sessions und Results
-- ============================================================================

-- 1. Tabelle für tägliche Quiz-Sessions
-- Speichert eine Quiz-Session pro Tag mit festen Fragen
CREATE TABLE IF NOT EXISTS daily_quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_date DATE NOT NULL,
  semester INTEGER NOT NULL,
  question_ids UUID[] NOT NULL, -- Array von 20 Question IDs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(quiz_date, semester)
);

-- Index für schnelle Datums-Abfragen
CREATE INDEX IF NOT EXISTS idx_daily_quiz_sessions_date ON daily_quiz_sessions(quiz_date, semester);

-- 2. Tabelle für Quiz-Ergebnisse der Benutzer
CREATE TABLE IF NOT EXISTS daily_quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID NOT NULL REFERENCES daily_quiz_sessions(id) ON DELETE CASCADE,
  score INTEGER NOT NULL, -- Anzahl richtig beantworteter Fragen
  total_points INTEGER NOT NULL, -- Gesamtpunkte (inklusive Teilpunkte)
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, session_id)
);

-- Füge Foreign Key zu auth.users hinzu
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'daily_quiz_results_user_id_fkey_auth'
  ) THEN
    ALTER TABLE daily_quiz_results
    ADD CONSTRAINT daily_quiz_results_user_id_fkey_auth
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Füge Foreign Key zu user_profiles hinzu (für Leaderboard JOIN)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'daily_quiz_results_user_id_fkey'
  ) THEN
    ALTER TABLE daily_quiz_results
    ADD CONSTRAINT daily_quiz_results_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Indizes für Leaderboard-Abfragen
CREATE INDEX IF NOT EXISTS idx_daily_quiz_results_session ON daily_quiz_results(session_id, total_points DESC);
CREATE INDEX IF NOT EXISTS idx_daily_quiz_results_user ON daily_quiz_results(user_id);

-- 3. RLS Policies für daily_quiz_sessions
ALTER TABLE daily_quiz_sessions ENABLE ROW LEVEL SECURITY;

-- SELECT Policy: Erlaubt sowohl authenticated als auch anon (für API)
DO $$ BEGIN
  CREATE POLICY "Anyone can view daily quiz sessions"
    ON daily_quiz_sessions
    FOR SELECT
    TO authenticated, anon
    USING (true);
EXCEPTION WHEN duplicate_object THEN
  NULL; -- Policy existiert bereits
END $$;

-- INSERT Policy: Erlaubt API das Erstellen von Sessions
DO $$ BEGIN
  CREATE POLICY "API can create daily quiz sessions"
    ON daily_quiz_sessions
    FOR INSERT
    TO authenticated, anon
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- 4. RLS Policies für daily_quiz_results
ALTER TABLE daily_quiz_results ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own quiz results"
    ON daily_quiz_results
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Lösche möglicherweise existierende Policies
DROP POLICY IF EXISTS "Users can view their own quiz results" ON daily_quiz_results;
DROP POLICY IF EXISTS "Anyone can view leaderboard (all results)" ON daily_quiz_results;
DROP POLICY IF EXISTS "Users can view all quiz results for leaderboard" ON daily_quiz_results;

-- Erstelle eine Policy die beides erlaubt: eigene Ergebnisse sehen UND Leaderboard sehen
DO $$ BEGIN
  CREATE POLICY "Users can view all quiz results for leaderboard"
    ON daily_quiz_results
    FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Kommentare
COMMENT ON TABLE daily_quiz_sessions IS 'Speichert tägliche Quiz-Sessions mit festen Fragen für alle Benutzer';
COMMENT ON TABLE daily_quiz_results IS 'Speichert die Ergebnisse der Benutzer für tägliche Quizzes';

-- Erfolgsmeldung
SELECT 'Daily Quiz Tabellen erfolgreich erstellt!' as status;
