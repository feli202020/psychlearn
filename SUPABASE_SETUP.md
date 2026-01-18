# Supabase Setup - Account Löschen funktioniert nicht vollständig

## Problem
- User-Profil wird gelöscht
- Auth-User in `auth.users` bleibt bestehen
- Edge Function gibt Fehler zurück: "Edge Function returned a non-2xx status code"

## Lösung: Edge Function deployen

### Schritt 1: Supabase CLI installieren (falls noch nicht geschehen)
```bash
npm install -g supabase
```

### Schritt 2: Edge Function deployen
```bash
# Im Projektverzeichnis
supabase functions deploy delete-user --project-ref YOUR_PROJECT_REF
```

Ersetzen Sie `YOUR_PROJECT_REF` mit Ihrer tatsächlichen Project Reference aus dem Supabase Dashboard.

### Schritt 3: Environment-Variablen in Supabase setzen

Die Edge Function benötigt diese Environment-Variablen (werden automatisch gesetzt):
- `SUPABASE_URL` - Ihre Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role Key (hat Admin-Rechte)

**Wo finde ich diese?**
1. Gehen Sie zu Ihrem Supabase Dashboard
2. Settings → API
3. `SUPABASE_URL` = Project URL
4. `SUPABASE_SERVICE_ROLE_KEY` = Service Role Key (secret!)

Diese werden automatisch von Supabase in Edge Functions gesetzt.

### Schritt 4: Testen
```bash
# Test-Request an die Edge Function
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/delete-user \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Alternative Lösung: Manuell löschen via Supabase Dashboard

Falls Sie die Edge Function nicht deployen können/wollen:

1. Gehen Sie zu Supabase Dashboard
2. Authentication → Users
3. Suchen Sie den Benutzer
4. Klicken Sie auf die drei Punkte (...)
5. "Delete user"

## Alternative Lösung: SQL-basiertes Löschen (TEMPORÄR)

**ACHTUNG:** Dies ist eine temporäre Lösung und sollte nur für Entwicklung verwendet werden!

Führen Sie diese SQL-Function in Ihrem Supabase SQL Editor aus:

\`\`\`sql
-- Erstelle eine Function, die vom User selbst aufgerufen werden kann
-- um sich komplett zu löschen (NUR FÜR ENTWICKLUNG!)
CREATE OR REPLACE FUNCTION delete_current_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Hole die User-ID aus dem JWT Token
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'No authenticated user';
  END IF;

  -- Lösche User-Daten
  DELETE FROM user_profiles WHERE id = current_user_id;

  -- Lösche Auth-User (funktioniert weil SECURITY DEFINER)
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

-- Policy: Erlaube authentifizierten Usern, diese Function zu nutzen
GRANT EXECUTE ON FUNCTION delete_current_user() TO authenticated;
\`\`\`

Dann in der Settings-Seite:

\`\`\`typescript
// Statt supabase.from('user_profiles').delete()
const { error } = await supabase.rpc('delete_current_user');
\`\`\`

## Empfehlung

Die **beste Lösung** ist, die Edge Function zu deployen, da:
1. Sie volle Kontrolle über den Löschprozess hat
2. Sie mit Service Role Key arbeitet
3. Sie alle Daten korrekt löscht
4. Sie sicher ist

Die SQL-Function ist nur eine Notlösung für die Entwicklung.

## Für jetzt: Bestehende User löschen

Um die aktuell "halb-gelöschten" User zu bereinigen:

1. Gehen Sie zu Supabase Dashboard → Authentication → Users
2. Löschen Sie alle User, die kein Profil mehr haben
3. Oder führen Sie diese SQL-Query aus:

\`\`\`sql
-- Findet Auth-Users ohne Profil
SELECT u.id, u.email
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Löscht Auth-Users ohne Profil (VORSICHT!)
-- DELETE FROM auth.users
-- WHERE id IN (
--   SELECT u.id
--   FROM auth.users u
--   LEFT JOIN user_profiles p ON u.id = p.id
--   WHERE p.id IS NULL
-- );
\`\`\`
