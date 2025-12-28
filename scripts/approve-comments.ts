import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function approveAllComments() {
    const { data, error } = await supabase
        .from('lantern_notes')
        .update({ status: 'approved' })
        .eq('status', 'pending')
        .select();

    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`✅ Approved ${data?.length || 0} comments`);
    }
}

approveAllComments();
