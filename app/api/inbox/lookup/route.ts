import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyCode } from '@/lib/codes';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rateLimit';
import { generateInboxComfort } from '@/lib/instantComfort';
import type { InboxResponse } from '@/lib/types';

// Validation schema
const inboxLookupSchema = z.object({
    inbox_code: z.string().min(20),
});

export async function POST(request: NextRequest) {
    try {
        // Strict rate limiting (brute force protection)
        const clientId = getClientIdentifier(request);
        const rateLimit = checkRateLimit(clientId, RATE_LIMITS.INBOX_LOOKUP);

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
        const { inbox_code } = inboxLookupSchema.parse(body);

        // Find all stories with inbox_code_hash (not null)
        const { data: stories, error: storiesError } = await supabaseAdmin
            .from('stories')
            .select('id, inbox_code_hash, notes_count_approved')
            .not('inbox_code_hash', 'is', null);

        if (storiesError) {
            console.error('Database error:', storiesError);
            return NextResponse.json(
                { error: 'Invalid code' }, // Generic error (don't leak info)
                { status: 400 }
            );
        }

        // Verify code against all hashes (constant-time)
        let matchedStory = null;
        for (const story of stories || []) {
            if (await verifyCode(story.inbox_code_hash!, inbox_code)) {
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

        // Fetch approved notes for this story
        const { data: notes, error: notesError } = await supabaseAdmin
            .from('lantern_notes')
            .select('id, note_text, note_type, created_at')
            .eq('story_id', matchedStory.id)
            .eq('status', 'approved')
            .order('created_at', { ascending: true });

        if (notesError) {
            console.error('Database error:', notesError);
            return NextResponse.json(
                { error: 'Failed to retrieve notes' },
                { status: 500 }
            );
        }

        // Count pending notes
        const { count: pendingCount } = await supabaseAdmin
            .from('lantern_notes')
            .select('*', { count: 'exact', head: true })
            .eq('story_id', matchedStory.id)
            .eq('status', 'pending');

        // Generate comfort message
        const comfortMessage = generateInboxComfort(notes?.length || 0);

        const response: InboxResponse = {
            success: true,
            notes: (notes || []) as any,
            pending_count: pendingCount || 0,
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
