-- ============================================================================
-- Stellt sicher, dass Username unique ist und für Login verwendet werden kann
-- ============================================================================

-- 1. Entferne alte Unique Constraint falls vorhanden
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_username_key;

-- 2. Erstelle einen case-insensitive unique Index
-- Dies stellt sicher, dass "TestUser" und "testuser" als gleich behandelt werden
DROP INDEX IF EXISTS idx_user_profiles_username;
DROP INDEX IF EXISTS idx_user_profiles_username_lower;
CREATE UNIQUE INDEX idx_user_profiles_username_lower ON user_profiles(LOWER(username));

-- 3. Erstelle zusätzlichen Index für normale Suchen
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- 3. Policy für Username-Lookup (wird beim Login benötigt)
-- Diese Policy erlaubt es, E-Mail-Adressen via Username nachzuschlagen
DROP POLICY IF EXISTS "Allow username lookup for login" ON user_profiles;
CREATE POLICY "Allow username lookup for login"
  ON user_profiles
  FOR SELECT
  USING (true);

-- 4. Funktion zum Validieren des Usernames
CREATE OR REPLACE FUNCTION validate_username(username_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Username muss zwischen 3 und 20 Zeichen lang sein
  IF LENGTH(username_input) < 3 OR LENGTH(username_input) > 20 THEN
    RETURN FALSE;
  END IF;

  -- Username darf nur Buchstaben (Groß- und Kleinbuchstaben), Zahlen und Unterstriche enthalten
  IF username_input !~ '^[a-zA-Z0-9_]+$' THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger zum Validieren des Usernames vor Insert/Update
CREATE OR REPLACE FUNCTION check_username_validity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.username IS NOT NULL AND NOT validate_username(NEW.username) THEN
    RAISE EXCEPTION 'Username muss 3-20 Zeichen lang sein und darf nur Buchstaben, Zahlen und Unterstriche enthalten';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_username_trigger ON user_profiles;
CREATE TRIGGER validate_username_trigger
  BEFORE INSERT OR UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_username_validity();

-- Erfolgsmeldung
SELECT 'Username-Validierung und Unique-Constraint erfolgreich eingerichtet!' as status;
