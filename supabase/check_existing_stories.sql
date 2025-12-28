-- Get the latest 5 stories with their settings
SELECT id, created_at, status, allow_lantern_notes, notes_count_approved
FROM stories 
ORDER BY created_at DESC
LIMIT 5;
