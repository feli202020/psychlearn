-- ============================================================================
-- Fügt DELETE Policy hinzu, damit Benutzer ihr eigenes Profil löschen können
-- ============================================================================

-- Hinweis: auth.users kann nur via Service Role gelöscht werden
-- Diese Migration stellt sicher, dass User ihr Profil selbst löschen können

-- Policy: Erlaubt Benutzern, ihr eigenes Profil zu löschen
DROP POLICY IF EXISTS "Users can delete own profile" ON user_profiles;
CREATE POLICY "Users can delete own profile"
  ON user_profiles
  FOR DELETE
  USING (auth.uid() = id);

-- Hinweis: Weitere Tabellen (achievements, lernziel_fortschritt, aufgaben_fortschritt)
-- werden in zukünftigen Migrationen erstellt und dann mit DELETE Policies versehen

-- Erfolgsmeldung
SELECT 'DELETE Policy für user_profiles erfolgreich hinzugefügt!' as status;
