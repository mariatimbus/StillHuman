import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering and disable all caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        console.log('Fetching public stories...');

        // Fetch approved AND pending stories that are marked as public
        const { data: stories, error } = await supabaseAdmin
            .from('stories')
            .select('id, narrative_redacted, created_at, context_tags, impact_tags, status')
            .eq('allow_public_story', true)
            .in('status', ['pending', 'approved'])
            .order('created_at', { ascending: false })
            .limit(50);

        console.log('Stories fetched:', stories?.length || 0);
        if (stories && stories.length > 0) {
            console.log('Latest story:', stories[0].created_at, 'status:', stories[0].status);
            console.log('First 3 IDs:', stories.slice(0, 3).map(s => s.id));
        }

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch stories' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { stories: stories || [] },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'Surrogate-Control': 'no-store',
                },
            }
        );
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
