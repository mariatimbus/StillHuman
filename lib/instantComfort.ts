/**
 * Instant comfort response generator
 * Maps story tags and risk flags to supportive messages
 */

interface ComfortMessage {
    title: string;
    message: string;
    resources?: string[];
}

export function generateComfortResponse(
    contextTags?: string[],
    riskFlags?: string[],
    allowLanternNotes?: boolean
): ComfortMessage {
    const messages: string[] = [];
    const resources: string[] = [];

    // Base validation message (always included)
    messages.push('Thank you for trusting us with your story.');
    messages.push('What happened is not okay, and you deserve safety and support.');

    // Context-specific messages
    if (contextTags?.includes('school')) {
        messages.push('You have the right to learn in a safe environment.');
    }

    if (contextTags?.includes('family')) {
        messages.push('Family relationships should be sources of safety, not harm.');
    }

    if (contextTags?.includes('healthcare')) {
        messages.push('Healthcare providers should be trusted allies, never sources of harm.');
    }

    if (contextTags?.includes('workplace')) {
        messages.push('Professional environments should respect your dignity and boundaries.');
    }

    if (contextTags?.includes('online')) {
        messages.push('Online spaces should be safe for everyone.');
    }

    if (contextTags?.includes('public')) {
        messages.push('You have the right to exist safely in public spaces.');
    }

    // Risk flag specific messages
    if (riskFlags?.includes('blackmail')) {
        messages.push('If someone is threatening you: what they\'re doing is illegal. You are not at fault.');
        resources.push('Document everything safely');
        resources.push('Consider reaching out to a trusted adult or authority');
    }

    if (riskFlags?.includes('physical_danger')) {
        messages.push('Your physical safety is the top priority. Please reach out to local emergency services if you\'re in immediate danger.');
    }

    if (riskFlags?.includes('ongoing')) {
        messages.push('If this is still happening, you don\'t have to face it alone.');
    }

    if (riskFlags?.includes('retaliation_fear')) {
        messages.push('Fear of retaliation is valid and common. Taking steps to protect yourself is strength, not weakness.');
    }

    // Lantern notes reminder
    if (allowLanternNotes) {
        messages.push('');
        messages.push('You\'ve opted to receive Lantern Notes - supportive messages from others who care.');
        messages.push('Come back with your inbox code anytime to view them.');
    }

    return {
        title: 'You\'re Not Alone',
        message: messages.join('\n\n'),
        resources: resources.length > 0 ? resources : undefined,
    };
}

/**
 * Generate instant comfort for inbox page
 */
export function generateInboxComfort(noteCount: number): ComfortMessage {
    if (noteCount === 0) {
        return {
            title: 'Your Inbox',
            message: 'No notes have been approved yet. Check back soon - someone may leave you a message of support.',
        };
    }

    return {
        title: 'Messages for You',
        message: `You have ${noteCount} ${noteCount === 1 ? 'note' : 'notes'} from people who want you to know you're not alone.`,
    };
}
