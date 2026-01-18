-- ============================================================================
-- SQL Function zum vollständigen Löschen des eigenen Accounts
-- Funktioniert ohne Edge Function, direkt aus der Datenbank
-- ============================================================================

-- Erstelle eine Function, die vom User selbst aufgerufen werden kann
-- SECURITY DEFINER bedeutet: Function läuft mit Owner-Rechten (kann auth.users löschen)
CREATE OR REPLACE FUNCTION delete_current_user()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  current_user_id uuid;
  result_json jsonb;
BEGIN
  -- Hole die User-ID aus dem JWT Token
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No authenticated user'
    );
  END IF;

  -- Lösche User-bezogene Daten (wenn Tabellen existieren)
  BEGIN
    DELETE FROM user_achievements WHERE user_id = current_user_id;
  EXCEPTION WHEN undefined_table THEN
    -- Tabelle existiert noch nicht, ignorieren
    NULL;
  END;

  BEGIN
    DELETE FROM user_lernziel_fortschritt WHERE user_id = current_user_id;
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;

  BEGIN
    DELETE FROM user_aufgaben_fortschritt WHERE user_id = current_user_id;
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;

  -- Lösche User-Profil
  DELETE FROM user_profiles WHERE id = current_user_id;

  -- Lösche Auth-User (funktioniert weil SECURITY DEFINER)
  DELETE FROM auth.users WHERE id = current_user_id;

  -- Erfolgsmeldung
  RETURN jsonb_build_object(
    'success', true,
    'message', 'User successfully deleted',
    'user_id', current_user_id
  );

EXCEPTION WHEN OTHERS THEN
  -- Fehlerbehandlung
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Grant: Erlaube authentifizierten Usern, diese Function zu nutzen
GRANT EXECUTE ON FUNCTION delete_current_user() TO authenticated;

-- Kommentar zur Function
COMMENT ON FUNCTION delete_current_user() IS
'Löscht den aktuell eingeloggten User komplett (Profil + Auth-User). Kann nur vom User selbst aufgerufen werden.';

-- Erfolgsmeldung
SELECT 'User-Delete Function erfolgreich erstellt!' as status;
