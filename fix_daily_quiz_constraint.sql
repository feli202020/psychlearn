-- Patch-Migration für Daily Quiz System
-- Behebt das UNIQUE-Constraint Problem auf quiz_date

-- 1. Entferne den alten UNIQUE Constraint auf quiz_date
ALTER TABLE daily_quiz_sessions DROP CONSTRAINT IF EXISTS daily_quiz_sessions_quiz_date_key;

-- 2. Füge den neuen UNIQUE Constraint auf (quiz_date, semester) hinzu
ALTER TABLE daily_quiz_sessions
  ADD CONSTRAINT daily_quiz_sessions_quiz_date_semester_key
  UNIQUE(quiz_date, semester);

-- Überprüfe die Constraints
SELECT conname, contype, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'daily_quiz_sessions'::regclass;
