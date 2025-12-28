-- Fix RLS policy for lantern_notes to allow service role access

-- Drop the restrictive policy
DROP POLICY IF EXISTS "No public access to notes" ON lantern_notes;

-- Create new policy that allows service_role full access
-- This allows the API (using service_role) to read/write notes
CREATE POLICY "Service role has full access to notes" ON lantern_notes
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Keep anon/authenticated blocked
CREATE POLICY "No public access to notes" ON lantern_notes
  FOR ALL TO anon, authenticated USING (false);
