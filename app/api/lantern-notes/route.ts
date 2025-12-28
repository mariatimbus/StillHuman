import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { filterLanternNote } from '@/lib/contentFilter';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rateLimit';

// Validation schema
const lanternNoteSchema = z.object({
    note_text: z.string().min(10).max(1000),
    note_type: z.enum(['public', 'responder']).default('responder'),
    story_id: z.string().uuid().optional(), // Optional: if provided, replies to specific story
});

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const clientId = getClientIdentifier(request);
        const rateLimit = checkRateLimit(clientId, RATE_LIMITS.LANTERN_NOTES);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Too many notes submitted. Please try again tomorrow.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
                    },
                }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const validatedData = lanternNoteSchema.parse(body);

        // Content safety filter
        const filterResult = filterLanternNote(validatedData.note_text);
        if (!filterResult.allowed) {
            return NextResponse.json(
                {
                    error: 'Your note contains content that cannot be accepted',
                    reasons: filterResult.reasons,
                },
                { status: 400 }
            );
        }

        // Find eligible story (Lantern Pool assignment) OR use provided story_id
        let selectedStoryId = validatedData.story_id;

        if (selectedStoryId) {
            // Verify the specific story exists
            const { data: story, error: storyError } = await supabaseAdmin
                .from('stories')
                .select('id')
                .eq('id', selectedStoryId)
                .single();

            if (storyError || !story) {
                return NextResponse.json(
                    { error: 'Story not found.' },
                    { status: 404 }
                );
            }
        } else {
            // Random assignment logic
            // Criteria:
            // 1. allow_lantern_notes = true
            // 2. status in ('pending', 'approved')
            // 3. Lowest notes_count_approved (max 3)
            const { data: eligibleStories, error: findError } = await supabaseAdmin
                .from('stories')
                .select('id, notes_count_approved')
                .eq('allow_lantern_notes', true)
                .in('status', ['pending', 'approved'])
                .lt('notes_count_approved', 3)
                .order('notes_count_approved', { ascending: true })
                .limit(10); // Get top 10 to randomize among them

            if (findError || !eligibleStories || eligibleStories.length === 0) {
                return NextResponse.json(
                    {
                        error: 'No eligible stories available at this time. Please try again later.',
                    },
                    { status: 503 }
                );
            }

            // Randomly select from eligible stories
            selectedStoryId = eligibleStories[Math.floor(Math.random() * eligibleStories.length)].id;
        }

        // Insert note (auto-approved, no moderation needed)
        const { data: insertedNote, error: insertError } = await supabaseAdmin
            .from('lantern_notes')
            .insert({
                story_id: selectedStoryId,
                note_text: validatedData.note_text,
                note_type: validatedData.note_type,
                status: 'approved',
            })
            .select()
            .single();

        if (insertError) {
            console.error('[Lantern Note] Database error:', insertError);
            console.error('[Lantern Note] Error details:', JSON.stringify(insertError));
            return NextResponse.json(
                { error: 'Failed to save note. Please try again.' },
                { status: 500 }
            );
        }

        console.log(`[Lantern Note] Successfully created note ${insertedNote?.id} for story ${selectedStoryId}`);

        return NextResponse.json(
            {
                success: true,
                message: 'Your note will reach someone who needs it. Thank you for sharing your support.',
            },
            {
                headers: {
                    'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                    'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
                },
            }
        );

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid note data', details: error.errors },
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
