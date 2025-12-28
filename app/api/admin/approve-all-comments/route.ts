import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const { data, error } = await supabaseAdmin
            .from('lantern_notes')
            .update({ status: 'approved' })
            .eq('status', 'pending')
            .select();

        if (error) {
            console.error('Error approving comments:', error);
            return NextResponse.json(
                { error: 'Failed to approve comments' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `Approved ${data?.length || 0} comments`
        });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
