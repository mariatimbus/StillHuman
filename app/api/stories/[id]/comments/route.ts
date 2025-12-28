import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const storyId = params.id;

        if (!storyId) {
            return NextResponse.json(
                { error: 'Story ID is required' },
                { status: 400 }
            );
        }

        // Fetch approved and pending notes for this story (same strategy as stories)
        // Show pending and approved, hide rejected and deleted
        const { data: notes, error } = await supabaseAdmin
            .from('lantern_notes')
            .select('id, note_text, created_at, note_type, status')
            .eq('story_id', storyId)
            .in('status', ['pending', 'approved'])
            .order('created_at', { ascending: true });

        if (error) {
            console.error('[Comments API] Database error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch comments' },
                { status: 500 }
            );
        }

        console.log(`[Comments API] Story ${storyId}: Found ${notes?.length || 0} comments`);

        return NextResponse.json({ comments: notes || [] });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
