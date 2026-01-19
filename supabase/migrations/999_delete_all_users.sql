-- ACHTUNG: Dieses Script löscht ALLE User und deren Daten!
-- Nur ausführen, wenn Sie wirklich alle Accounts löschen möchten

-- 1. Alle User-bezogenen Daten löschen
DO $$ BEGIN
  DELETE FROM public.user_achievements;
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$;

DO $$ BEGIN
  DELETE FROM public.user_lernziel_fortschritt;
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$;

DO $$ BEGIN
  DELETE FROM public.user_aufgaben_fortschritt;
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$;

DO $$ BEGIN
  DELETE FROM public.user_profiles;
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$;

-- 2. Alle Auth-User löschen
-- HINWEIS: Dies muss über die Supabase Admin API erfolgen
-- Im SQL Editor können wir nur die public Tabellen löschen
-- Die auth.users Tabelle muss über das Dashboard gelöscht werden:
-- Dashboard > Authentication > Users > Alle User auswählen und löschen

-- Alternative: Falls Sie direkten Zugriff haben:
-- DELETE FROM auth.users;
