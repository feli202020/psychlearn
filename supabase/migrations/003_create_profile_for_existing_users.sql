-- Für existierende User, die noch kein Profil haben, ein Profil erstellen
INSERT INTO public.user_profiles (id, username, email, display_name, current_semester, xp, level)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'username', SPLIT_PART(u.email, '@', 1)) as username,
  u.email,
  COALESCE(u.raw_user_meta_data->>'display_name', SPLIT_PART(u.email, '@', 1)) as display_name,
  COALESCE((u.raw_user_meta_data->>'current_semester')::INTEGER, 1) as current_semester,
  0 as xp,
  1 as level
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles p WHERE p.id = u.id
);
