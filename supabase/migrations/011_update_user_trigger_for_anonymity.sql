-- ============================================================================
-- Update handle_new_user() Trigger für anonymous_in_leaderboard Feld
-- ============================================================================

-- 1. Stelle sicher, dass die Spalte anonymous_in_leaderboard existiert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'user_profiles'
    AND column_name = 'anonymous_in_leaderboard'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN anonymous_in_leaderboard BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 2. Funktion aktualisieren: Automatisch User-Profil erstellen wenn sich jemand registriert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    username,
    email,
    display_name,
    current_semester,
    xp,
    level,
    anonymous_in_leaderboard
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'current_semester')::INTEGER, 1),
    0,
    1,
    FALSE
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, user_profiles.username),
    display_name = COALESCE(EXCLUDED.display_name, user_profiles.display_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Stelle sicher, dass der Trigger existiert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Erfolgsmeldung
SELECT 'handle_new_user() Trigger erfolgreich aktualisiert!' as status;
