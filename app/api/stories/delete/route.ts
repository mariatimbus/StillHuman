import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyCode } from '@/lib/codes';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rateLimit';
import type { DeleteResponse } from '@/lib/types';

// Validation schema
const deleteSchema = z.object({
    deletion_code: z.string().min(20),
});

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const clientId = getClientIdentifier(request);
        const rateLimit = checkRateLimit(clientId, RATE_LIMITS.DELETE_STORY);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Too many attempts. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
                    },
                }
            );
        }

        // Parse request body
        const body = await request.json();
        const { deletion_code } = deleteSchema.parse(body);

        // Find all stories with deletion_code_hash
        const { data: stories, error: storiesError } = await supabaseAdmin
            .from('stories')
            .select('id, deletion_code_hash, status')
            .neq('status', 'deleted'); // Don't check already deleted stories

        if (storiesError) {
            console.error('Database error:', storiesError);
            return NextResponse.json(
                { error: 'Invalid code' }, // Generic error
                { status: 400 }
            );
        }

        // Verify code against all hashes (constant-time)
        let matchedStory = null;
        for (const story of stories || []) {
            if (await verifyCode(story.deletion_code_hash, deletion_code)) {
                matchedStory = story;
                break;
            }
        }

        if (!matchedStory) {
            return NextResponse.json(
                { error: 'Invalid code' }, // Generic error
                {
                    status: 400,
                    headers: {
                        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                    },
                }
            );
        }

        // Soft delete: update status and wipe narrative
        const { error: updateError } = await supabaseAdmin
            .from('stories')
            .update({
                status: 'deleted',
                narrative_redacted: '[DELETED BY CONTRIBUTOR]',
                deleted_at: new Date().toISOString(),
            })
            .eq('id', matchedStory.id);

        if (updateError) {
            console.error('Database error:', updateError);
            return NextResponse.json(
                { error: 'Failed to delete story' },
                { status: 500 }
            );
        }

        // Notes are cascade deleted automatically by database foreign key

        const response: DeleteResponse = {
            success: true,
            message: 'Your story has been permanently deleted. Thank you for using this platform.',
        };

        return NextResponse.json(response, {
            headers: {
                'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
            },
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request' },
                { status: 400 }
            );
        }

        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
