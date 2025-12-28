/**
 * Content safety filters for Lantern Notes
 * Blocks contact information, harmful advice, and toxicity
 */

export interface FilterResult {
    allowed: boolean;
    reasons: string[];
}

// Contact info patterns
const CONTACT_PATTERNS = [
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi, // Email
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // Phone
    /\+\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g, // International phone
    /@[\w]+/g, // Handles
    /https?:\/\/[^\s]+/gi, // URLs
];

// Social media and contact keywords
const CONTACT_KEYWORDS = [
    'dm me',
    'message me',
    'whatsapp',
    'instagram',
    'telegram',
    'snapchat',
    'facebook',
    'twitter',
    'tiktok',
    'discord',
    'my number',
    'call me',
    'text me',
    'email me',
    'contact me',
    'reach me',
    'find me',
];

// Harmful advice patterns
const HARMFUL_KEYWORDS = [
    'go confront',
    'tell them off',
    'fight back',
    'get revenge',
    'hurt yourself',
    'end it all',
    'give up',
    'hopeless',
    'no point',
];

// Toxic content keywords (basic hate speech detection)
const TOXIC_KEYWORDS = [
    'kill yourself',
    'you deserve',
    'your fault',
    'attention seeker',
    'making it up',
    'lying',
    'fake',
    'drama queen',
];

/**
 * Filter Lantern Note content for safety violations
 */
export function filterLanternNote(text: string): FilterResult {
    const reasons: string[] = [];
    const lowerText = text.toLowerCase();

    // Check for contact information patterns
    for (const pattern of CONTACT_PATTERNS) {
        if (pattern.test(text)) {
            reasons.push('Contains contact information');
            break;
        }
    }

    // Check for contact keywords
    for (const keyword of CONTACT_KEYWORDS) {
        if (lowerText.includes(keyword)) {
            reasons.push('Attempts to establish contact');
            break;
        }
    }

    // Check for harmful advice
    for (const keyword of HARMFUL_KEYWORDS) {
        if (lowerText.includes(keyword)) {
            reasons.push('Contains potentially harmful advice');
            break;
        }
    }

    // Check for toxic content
    for (const keyword of TOXIC_KEYWORDS) {
        if (lowerText.includes(keyword)) {
            reasons.push('Contains toxic or invalidating language');
            break;
        }
    }

    // Check for excessive links or promotional content
    const urlMatches = text.match(/https?:\/\/[^\s]+/gi);
    if (urlMatches && urlMatches.length > 1) {
        reasons.push('Contains multiple links (potential spam)');
    }

    // Check minimum length (prevent spam one-word responses)
    if (text.trim().length < 10) {
        reasons.push('Note is too short (minimum 10 characters)');
    }

    // Check maximum length
    if (text.length > 1000) {
        reasons.push('Note is too long (maximum 1000 characters)');
    }

    return {
        allowed: reasons.length === 0,
        reasons,
    };
}

/**
 * Validate supportive note content (lighter validation for guided templates)
 */
export function validateSupportiveNote(text: string): boolean {
    const { allowed } = filterLanternNote(text);
    return allowed;
}
