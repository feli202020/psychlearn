-- ============================================================================
-- Synchronisiert fehlende Email-Daten in user_profiles von auth.users
-- ============================================================================

-- 1. Email-Spalte zu user_profiles hinzufügen falls sie nicht existiert
-- (Sollte bereits existieren, aber sicherheitshalber)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_profiles'
        AND column_name = 'email'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- 2. Synchronisiere Emails von auth.users zu user_profiles für alle existierenden User
UPDATE public.user_profiles up
SET email = au.email
FROM auth.users au
WHERE up.id = au.id
  AND (up.email IS NULL OR up.email = '');

-- 3. Synchronisiere auch Usernames falls sie NULL sind
UPDATE public.user_profiles up
SET username = SPLIT_PART(au.email, '@', 1)
FROM auth.users au
WHERE up.id = au.id
  AND (up.username IS NULL OR up.username = '');

-- 4. Synchronisiere display_name falls NULL
UPDATE public.user_profiles up
SET display_name = COALESCE(au.raw_user_meta_data->>'display_name', SPLIT_PART(au.email, '@', 1))
FROM auth.users au
WHERE up.id = au.id
  AND (up.display_name IS NULL OR up.display_name = '');

-- 5. Erstelle Profile für auth.users ohne Profil (falls welche fehlen)
INSERT INTO public.user_profiles (id, username, email, display_name, current_semester, xp, level)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', SPLIT_PART(au.email, '@', 1)),
  au.email,
  COALESCE(au.raw_user_meta_data->>'display_name', SPLIT_PART(au.email, '@', 1)),
  COALESCE((au.raw_user_meta_data->>'current_semester')::INTEGER, 1),
  0,
  1
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- 6. Aktualisiere den Trigger, damit email immer synchronisiert wird
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, email, display_name, current_semester, xp, level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email, -- Stelle sicher, dass email immer gesetzt wird
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'current_semester')::INTEGER, 1),
    0,
    1
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, user_profiles.username),
    display_name = COALESCE(EXCLUDED.display_name, user_profiles.display_name);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Erfolgsmeldung
SELECT
  'Email-Synchronisation abgeschlossen!' as status,
  COUNT(*) as anzahl_synchronisierte_profile
FROM public.user_profiles
WHERE email IS NOT NULL;
