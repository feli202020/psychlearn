-- ============================================================================
-- Gamification Tables: Lernziel-Fortschritt und Achievements
-- ============================================================================

-- 1. Tabelle für Lernziel-Fortschritt (User Progress)
CREATE TABLE IF NOT EXISTS user_lernziel_fortschritt (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lernziel_id UUID NOT NULL REFERENCES lernziele(id) ON DELETE CASCADE,
  abgeschlossen BOOLEAN DEFAULT FALSE,
  abgeschlossen_am TIMESTAMPTZ,
  verdiente_xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: Ein User kann ein Lernziel nur einmal abschließen
  UNIQUE(user_id, lernziel_id)
);

-- Index für schnellere Abfragen
CREATE INDEX IF NOT EXISTS idx_user_lernziel_fortschritt_user_id ON user_lernziel_fortschritt(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lernziel_fortschritt_lernziel_id ON user_lernziel_fortschritt(lernziel_id);

-- RLS (Row Level Security) aktivieren
ALTER TABLE user_lernziel_fortschritt ENABLE ROW LEVEL SECURITY;

-- Policy: User können nur ihre eigenen Fortschritte sehen und bearbeiten
DO $$ BEGIN
  CREATE POLICY "Users can view their own progress"
    ON user_lernziel_fortschritt
    FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN
  NULL; -- Policy existiert bereits
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own progress"
    ON user_lernziel_fortschritt
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their own progress"
    ON user_lernziel_fortschritt
    FOR UPDATE
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- 2. Tabelle für Achievements (Belohnungen)
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titel VARCHAR(255) NOT NULL,
  beschreibung TEXT,
  icon VARCHAR(50), -- z.B. 'trophy', 'star', 'medal'
  bedingung_typ VARCHAR(50) NOT NULL, -- z.B. 'lernziele_abgeschlossen', 'level_erreicht'
  bedingung_wert INTEGER NOT NULL, -- z.B. 10 (für 10 Lernziele)
  xp_belohnung INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabelle für User Achievements (Welcher User hat welches Achievement)
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  freigeschaltet_am TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: Ein User kann ein Achievement nur einmal freischalten
  UNIQUE(user_id, achievement_id)
);

-- Index für schnellere Abfragen
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- RLS für user_achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can view their own achievements"
    ON user_achievements
    FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert their own achievements"
    ON user_achievements
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- RLS für achievements (alle können lesen)
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view achievements"
    ON achievements
    FOR SELECT
    TO public
    USING (true);
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- 4. Trigger für updated_at in user_lernziel_fortschritt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER update_user_lernziel_fortschritt_updated_at
    BEFORE UPDATE ON user_lernziel_fortschritt
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- 5. Füge XP und Level zum user_profiles hinzu (falls noch nicht vorhanden)
DO $$
BEGIN
  -- Prüfe ob Spalte 'xp' existiert
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'xp'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN xp INTEGER DEFAULT 0;
  END IF;

  -- Prüfe ob Spalte 'level' existiert
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'level'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN level INTEGER DEFAULT 1;
  END IF;
END $$;

-- Erfolgsmeldung
SELECT 'Gamification-Tabellen erfolgreich erstellt!' as status;
