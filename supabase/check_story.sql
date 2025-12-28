-- Check if the story allows lantern notes
SELECT id, allow_lantern_notes, status, notes_count_approved
FROM stories 
WHERE id = '53ffc877-0888-4b04-acd7-2b8c8ed6f2f3';
