import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        // Get pending stories count
        const { count: pendingStories } = await supabaseAdmin
            .from('stories')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        // Get pending notes count
        const { count: pendingNotes } = await supabaseAdmin
            .from('lantern_notes')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        // Get total stories
        const { count: totalStories } = await supabaseAdmin
            .from('stories')
            .select('*', { count: 'exact', head: true })
            .neq('status', 'deleted');

        // Get total notes
        const { count: totalNotes } = await supabaseAdmin
            .from('lantern_notes')
            .select('*', { count: 'exact', head: true });

        return NextResponse.json({
            pendingStories: pendingStories || 0,
            pendingNotes: pendingNotes || 0,
            totalStories: totalStories || 0,
            totalNotes: totalNotes || 0,
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
