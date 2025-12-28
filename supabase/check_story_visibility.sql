-- Check if stories are set to public
SELECT id, LEFT(narrative_redacted, 50) as preview, 
       allow_public_story, status, created_at
FROM stories 
ORDER BY created_at DESC 
LIMIT 5;
