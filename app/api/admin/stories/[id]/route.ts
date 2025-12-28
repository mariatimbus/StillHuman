import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logAdminAction } from '@/lib/adminAuth';
import { z } from 'zod';

const updateSchema = z.object({
    status: z.enum(['approved', 'rejected']),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { status } = updateSchema.parse(body);
        const storyId = params.id;

        // Update story status
        const { error } = await supabaseAdmin
            .from('stories')
            .update({ status })
            .eq('id', storyId);

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Failed to update story' },
                { status: 500 }
            );
        }

        // Log admin action
        await logAdminAction('moderate_story', 'story', storyId, { status });

        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request' },
                { status: 400 }
            );
        }

        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
