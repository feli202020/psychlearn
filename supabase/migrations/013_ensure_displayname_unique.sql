-- ============================================================================
-- Stellt sicher, dass display_name unique ist (case-insensitive)
-- ============================================================================

-- 1. Entferne Duplikate falls vorhanden (behalte den ältesten Eintrag)
-- Finde alle Duplikate und markiere sie für Update
WITH duplicates AS (
  SELECT
    id,
    display_name,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(display_name)
      ORDER BY created_at ASC
    ) as rn
  FROM user_profiles
  WHERE display_name IS NOT NULL
)
UPDATE user_profiles
SET display_name = display_name || '_' || SUBSTRING(id::text, 1, 8)
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 2. Erstelle einen case-insensitive unique Index für display_name
-- Dies stellt sicher, dass "Felix" und "felix" als gleich behandelt werden
DROP INDEX IF EXISTS idx_user_profiles_display_name;
DROP INDEX IF EXISTS idx_user_profiles_display_name_lower;
CREATE UNIQUE INDEX idx_user_profiles_display_name_lower ON user_profiles(LOWER(display_name));

-- 3. Erstelle zusätzlichen Index für normale Suchen
CREATE INDEX IF NOT EXISTS idx_user_profiles_display_name ON user_profiles(display_name);

-- 4. Funktion zum Validieren des display_name
CREATE OR REPLACE FUNCTION validate_display_name(display_name_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- display_name darf nicht leer sein
  IF display_name_input IS NULL OR LENGTH(TRIM(display_name_input)) = 0 THEN
    RETURN FALSE;
  END IF;

  -- display_name muss zwischen 1 und 50 Zeichen lang sein
  IF LENGTH(display_name_input) < 1 OR LENGTH(display_name_input) > 50 THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger zum Validieren des display_name vor Insert/Update
CREATE OR REPLACE FUNCTION check_display_name_validity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.display_name IS NOT NULL AND NOT validate_display_name(NEW.display_name) THEN
    RAISE EXCEPTION 'Anzeigename muss 1-50 Zeichen lang sein';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_display_name_trigger ON user_profiles;
CREATE TRIGGER validate_display_name_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_display_name_validity();

-- Erfolgsmeldung
SELECT 'Display-Name-Validierung und Unique-Constraint erfolgreich eingerichtet!' as status;
