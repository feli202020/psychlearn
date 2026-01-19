-- Add INSERT policy for daily_quiz_sessions table
-- This allows the API to create new daily quiz sessions

-- Drop policy if it exists (ignore error if it doesn't)
DROP POLICY IF EXISTS "API can create daily quiz sessions" ON daily_quiz_sessions;

-- Create the policy
CREATE POLICY "API can create daily quiz sessions"
  ON daily_quiz_sessions
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);
