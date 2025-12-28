import { supabaseAdmin } from '@/lib/supabase';

async function checkNotes() {
    const storyId = '53ffc877-0888-4b04-acd7-2b8c8ed6f2f3';

    // Try query with service role
    const { data, error } = await supabaseAdmin
        .from('lantern_notes')
        .select('*')
        .eq('story_id', storyId);

    console.log('Error:', error);
    console.log('Data:', data);
    console.log('Count:', data?.length || 0);
}

checkNotes();
