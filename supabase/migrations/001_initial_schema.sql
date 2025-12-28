-- Still Human Platform - Database Schema
-- Run this in Supabase SQL editor

-- Create ENUM types
CREATE TYPE story_status AS ENUM ('pending', 'approved', 'rejected', 'held', 'deleted');
CREATE TYPE note_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE note_type AS ENUM ('public', 'responder');

-- Stories table
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status story_status NOT NULL DEFAULT 'pending',
  
  -- Geographic & demographic (optional, for research)
  country TEXT,
  area_type TEXT, -- urban, suburban, rural
  age_range TEXT, -- 13-15, 16-18, 19-24, 25+
  
  -- Tags (array fields for flexibility)
  identity_tags TEXT[], -- gender, sexuality, disability, etc.
  context_tags TEXT[], -- school, family, healthcare, workplace, online, public
  power_tags TEXT[], -- peer, authority, stranger, etc.
  impact_tags TEXT[], -- emotional, academic, physical, etc.
  risk_flags TEXT[], -- ongoing, blackmail, physical_danger, retaliation_fear
  
  -- Privacy controls
  allow_aggregate BOOLEAN DEFAULT true,
  allow_excerpt BOOLEAN DEFAULT false,
  allow_public_story BOOLEAN DEFAULT false,
  allow_lantern_notes BOOLEAN DEFAULT false,
  
  -- Story content
  narrative_redacted TEXT NOT NULL,
  
  -- Secure access codes (hashed with Argon2id)
  deletion_code_hash TEXT NOT NULL,
  inbox_code_hash TEXT, -- null if they didn't opt into lantern notes
  
  -- Metadata
  notes_count_approved INTEGER DEFAULT 0,
  deleted_at TIMESTAMPTZ
);

-- Indexes for stories
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_created ON stories(created_at DESC);
CREATE INDEX idx_stories_lantern_eligible ON stories(allow_lantern_notes, notes_count_approved, status) 
  WHERE status IN ('pending', 'approved') AND allow_lantern_notes = true;

-- Lantern notes table  
CREATE TABLE lantern_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status note_status NOT NULL DEFAULT 'pending',
  note_type note_type DEFAULT 'responder',
  note_text TEXT NOT NULL,
  moderation_reason TEXT,
  
  CONSTRAINT fk_story FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE
);

-- Indexes for lantern_notes
CREATE INDEX idx_notes_story ON lantern_notes(story_id);
CREATE INDEX idx_notes_status ON lantern_notes(status);
CREATE INDEX idx_notes_created ON lantern_notes(created_at DESC);

-- Codes catalog (optional - for structured coding)
CREATE TABLE codes_catalog (
  code TEXT PRIMARY KEY,
  category TEXT NOT NULL, -- type_of_harm, context, power_dynamic, etc.
  definition TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Story codes (many-to-many for research coding)
CREATE TABLE story_codes (
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  severity INTEGER CHECK (severity BETWEEN 1 AND 5),
  modifiers TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  PRIMARY KEY (story_id, code)
);

-- Index for story_codes
CREATE INDEX idx_story_codes_story ON story_codes(story_id);
CREATE INDEX idx_story_codes_code ON story_codes(code);

-- Rate limit tracking (short-lived)
CREATE TABLE rate_limit_attempts (
  key TEXT PRIMARY KEY,
  attempts INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_rate_limit_expires ON rate_limit_attempts(expires_at);

-- Audit log for admin actions (optional but recommended)
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  admin_email TEXT NOT NULL,
  action TEXT NOT NULL, -- approve_story, reject_story, approve_note, etc.
  entity_type TEXT NOT NULL, -- story, note
  entity_id UUID NOT NULL,
  details JSONB
);

CREATE INDEX idx_audit_created ON audit_log(created_at DESC);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON lantern_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE lantern_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE codes_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Stories: No direct access (all via service role)
CREATE POLICY "No public access to stories" ON stories FOR ALL USING (false);

-- Lantern notes: No direct access  
CREATE POLICY "No public access to notes" ON lantern_notes FOR ALL USING (false);

-- Story codes: No direct access
CREATE POLICY "No public access to story_codes" ON story_codes FOR ALL USING (false);

-- Codes catalog: Read-only for authenticated users (admins)
CREATE POLICY "Authenticated users can read codes catalog" ON codes_catalog 
  FOR SELECT TO authenticated USING (true);

-- Audit log: Append-only for authenticated, read for authenticated
CREATE POLICY "Authenticated users can read audit log" ON audit_log 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert audit log" ON audit_log 
  FOR INSERT TO authenticated WITH CHECK (true);

-- Grant permissions (adjust as needed)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- Insert some example codes (optional)
INSERT INTO codes_catalog (code, category, definition) VALUES
  ('SCH_BULLYING', 'context', 'Bullying or harassment in school setting'),
  ('FAM_ABUSE', 'context', 'Abuse or harm within family relationships'),
  ('WORK_HARASSMENT', 'context', 'Harassment in workplace setting'),
  ('ONLINE_HARASSMENT', 'context', 'Online harassment or cyberbullying'),
  ('AUTHORITY_ABUSE', 'power_dynamic', 'Abuse of power by authority figure'),
  ('PEER_HARM', 'power_dynamic', 'Harm from peer or equal'),
  ('EMOTIONAL_IMPACT', 'impact', 'Significant emotional or psychological impact'),
  ('ACADEMIC_IMPACT', 'impact', 'Impact on academic performance or access'),
  ('PHYSICAL_HARM', 'type', 'Physical violence or assault'),
  ('VERBAL_HARM', 'type', 'Verbal abuse or threats'),
  ('ISOLATION', 'type', 'Social isolation or exclusion'),
  ('DISCRIMINATION', 'type', 'Discrimination based on identity');

-- Clean up function for expired rate limits (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limit_attempts WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE stories IS 'Anonymous stories submitted by contributors';
COMMENT ON TABLE lantern_notes IS 'Supportive notes assigned randomly to stories';
COMMENT ON TABLE codes_catalog IS 'Research coding taxonomy';
COMMENT ON TABLE story_codes IS 'Applied codes for research analysis';
COMMENT ON TABLE audit_log IS 'Admin action audit trail';
