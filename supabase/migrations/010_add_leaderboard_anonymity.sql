-- ============================================================================
-- Anonymisierung in der Daily Quiz Rangliste
-- ============================================================================

-- 1. Füge anonymous_in_leaderboard Feld zum user_profiles hinzu
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'anonymous_in_leaderboard'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN anonymous_in_leaderboard BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Kommentar hinzufügen
COMMENT ON COLUMN user_profiles.anonymous_in_leaderboard IS 'Wenn TRUE, wird der Benutzername in der Daily Quiz Rangliste anonymisiert angezeigt';

-- Erfolgsmeldung
SELECT 'Leaderboard-Anonymisierung erfolgreich hinzugefügt!' as status;
