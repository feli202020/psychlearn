# Supabase Edge Functions

## Verfügbare Functions

### delete-user
Löscht einen User-Account komplett (auth.users + user_profiles).

**Endpoint:** `https://YOUR_PROJECT_REF.supabase.co/functions/v1/delete-user`

**Methode:** POST

**Authorization:** Bearer Token (User muss eingeloggt sein)

## Setup & Deployment

### 1. Supabase CLI installieren

```bash
npm install -g supabase
```

### 2. In Supabase einloggen

```bash
supabase login
```

### 3. Projekt verlinken

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Dein Project Ref findest du in der Supabase URL:
`https://YOUR_PROJECT_REF.supabase.co`

### 4. Edge Function deployen

```bash
supabase functions deploy delete-user
```

### 5. Service Role Secret setzen

Die Edge Function braucht Zugriff auf den Service Role Key:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Den Service Role Key findest du in Supabase unter:
`Settings` → `API` → `Project API keys` → `service_role` (secret)

**WICHTIG:** Der Service Role Key hat Admin-Rechte. Teile ihn niemals öffentlich!

## Testen

Nach dem Deployment kannst du die Function testen:

```bash
# Mit Supabase CLI
supabase functions invoke delete-user \
  --headers "Authorization: Bearer YOUR_USER_JWT_TOKEN"

# Oder über die App (Settings Seite -> Account löschen)
```

## Lokales Testen

```bash
# Edge Functions lokal starten
supabase functions serve delete-user

# In anderem Terminal testen
curl -i --location --request POST 'http://localhost:54321/functions/v1/delete-user' \
  --header 'Authorization: Bearer YOUR_USER_JWT_TOKEN' \
  --header 'Content-Type: application/json'
```

## Troubleshooting

### Function nicht erreichbar
- Überprüfe ob die Function deployed ist: `supabase functions list`
- Prüfe Logs: `supabase functions logs delete-user`

### "No authorization header" Fehler
- User muss eingeloggt sein
- JWT Token muss im Authorization Header sein

### "Failed to delete auth user" Fehler
- Service Role Key richtig gesetzt?
- Prüfe mit: `supabase secrets list`

## Sicherheit

- ✅ Function prüft JWT Token (nur eingeloggter User)
- ✅ User kann nur seinen eigenen Account löschen
- ✅ Service Role Key ist nur server-side verfügbar
- ✅ CORS Headers sind konfiguriert
