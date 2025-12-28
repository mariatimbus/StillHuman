import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { redactNarrative } from '@/lib/redaction';
import { generateSecureCode, hashCode } from '@/lib/codes';
import { generateComfortResponse } from '@/lib/instantComfort';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rateLimit';
import type { StorySubmission, StorySubmissionResponse } from '@/lib/types';

// Validation schema
const storySchema = z.object({
    country: z.string().max(100).optional(),
    area_type: z.string().max(50).optional(),
    age_range: z.string().max(20).optional(),
    identity_tags: z.array(z.string()).max(10).optional(),
    context_tags: z.array(z.string()).max(10).optional(),
    power_tags: z.array(z.string()).max(10).optional(),
    impact_tags: z.array(z.string()).max(10).optional(),
    risk_flags: z.array(z.string()).max(10).optional(),
    allow_aggregate: z.boolean().default(true),
    allow_excerpt: z.boolean().default(false),
    allow_public_story: z.boolean().default(false),
    allow_lantern_notes: z.boolean().default(false),
    narrative: z.string().min(50).max(10000),
});

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const clientId = getClientIdentifier(request);
        const rateLimit = checkRateLimit(clientId, RATE_LIMITS.STORY_SUBMISSION);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: 'Too many submissions. Please try again later.' },
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
        const validatedData = storySchema.parse(body);

        // Redact PII from narrative
        const { redactedText, warnings } = redactNarrative(validatedData.narrative);

        // Generate codes
        const deletionCode = generateSecureCode();
        const inboxCode = validatedData.allow_lantern_notes ? generateSecureCode() : null;

        // Hash codes
        const deletionCodeHash = await hashCode(deletionCode);
        const inboxCodeHash = inboxCode ? await hashCode(inboxCode) : null;

        // Insert story into database
        const { data: story, error } = await supabaseAdmin
            .from('stories')
            .insert({
                country: validatedData.country,
                area_type: validatedData.area_type,
                age_range: validatedData.age_range,
                identity_tags: validatedData.identity_tags,
                context_tags: validatedData.context_tags,
                power_tags: validatedData.power_tags,
                impact_tags: validatedData.impact_tags,
                risk_flags: validatedData.risk_flags,
                allow_aggregate: validatedData.allow_aggregate,
                allow_excerpt: validatedData.allow_excerpt,
                allow_public_story: validatedData.allow_public_story,
                allow_lantern_notes: validatedData.allow_lantern_notes,
                narrative_redacted: redactedText,
                deletion_code_hash: deletionCodeHash,
                inbox_code_hash: inboxCodeHash,
                status: 'approved', // Auto-approve all submissions
            })
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Failed to save story. Please try again.' },
                { status: 500 }
            );
        }

        // Generate comfort message
        const comfortMessage = generateComfortResponse(
            validatedData.context_tags,
            validatedData.risk_flags,
            validatedData.allow_lantern_notes
        );

        const response: StorySubmissionResponse = {
            success: true,
            deletion_code: deletionCode,
            inbox_code: inboxCode || undefined,
            warnings: warnings.length > 0 ? warnings : undefined,
            comfort_message: comfortMessage,
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
                { error: 'Invalid submission data', details: error.errors },
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
