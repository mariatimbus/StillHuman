-- Disable RLS on lantern_notes table (simpler fix)
-- Since all access is via service role through the API, RLS isn't needed
ALTER TABLE lantern_notes DISABLE ROW LEVEL SECURITY;
