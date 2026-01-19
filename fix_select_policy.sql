-- Fix SELECT policy for daily_quiz_sessions table
-- The current policy only allows authenticated users, but the API uses anon key

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Anyone can view daily quiz sessions" ON daily_quiz_sessions;

-- Create new SELECT policy that allows both authenticated and anon
CREATE POLICY "Anyone can view daily quiz sessions"
  ON daily_quiz_sessions
  FOR SELECT
  TO authenticated, anon
  USING (true);
