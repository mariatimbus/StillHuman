-- Check current RLS policies on lantern_notes
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'lantern_notes';
