-- WARNING: This will delete ALL data in your database!
-- Drop all tables in the correct order (reverse of creation)

-- Drop tables (foreign keys require specific order)
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS rate_limit_attempts CASCADE;
DROP TABLE IF EXISTS story_codes CASCADE;
DROP TABLE IF EXISTS codes_catalog CASCADE;
DROP TABLE IF EXISTS lantern_notes CASCADE;
DROP TABLE IF EXISTS stories CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS note_type CASCADE;
DROP TYPE IF EXISTS note_status CASCADE;
DROP TYPE IF EXISTS story_status CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS cleanup_expired_rate_limits() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
