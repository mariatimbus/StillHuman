/**
 * Redaction pipeline to remove PII from narrative text
 */

export interface RedactionResult {
    redactedText: string;
    warnings: string[];
}

// Email pattern
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

// Phone patterns (various international formats)
const PHONE_PATTERNS = [
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // US: 123-456-7890
    /\b\d{10}\b/g, // 1234567890
    /\+\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g, // International
    /\(\d{3}\)\s?\d{3}[-.\s]?\d{4}/g, // (123) 456-7890
];

// URL pattern
const URL_PATTERN = /https?:\/\/[^\s]+/g;

// Social media handle pattern
const HANDLE_PATTERN = /@[\w]+/g;

// Common name patterns (basic - can be enhanced)
const NAME_INDICATORS = [
    /\b(my name is|i'm|i am|call me)\s+([A-Z][a-z]+)/gi,
    /\b(mr|mrs|ms|dr|prof)\.?\s+([A-Z][a-z]+)/gi,
];

export function redactNarrative(text: string): RedactionResult {
    let redacted = text;
    const warnings: string[] = [];

    // Remove emails
    if (EMAIL_PATTERN.test(redacted)) {
        warnings.push('Email addresses detected and removed');
        redacted = redacted.replace(EMAIL_PATTERN, '[EMAIL REMOVED]');
    }

    // Remove phone numbers
    for (const pattern of PHONE_PATTERNS) {
        if (pattern.test(redacted)) {
            warnings.push('Phone numbers detected and removed');
            redacted = redacted.replace(pattern, '[PHONE REMOVED]');
        }
    }

    // Remove URLs
    if (URL_PATTERN.test(redacted)) {
        warnings.push('URLs detected and removed');
        redacted = redacted.replace(URL_PATTERN, '[URL REMOVED]');
    }

    // Remove social media handles
    if (HANDLE_PATTERN.test(redacted)) {
        warnings.push('Social media handles detected and removed');
        redacted = redacted.replace(HANDLE_PATTERN, '[HANDLE REMOVED]');
    }

    // Detect potential names (warn but don't auto-remove - needs human review)
    for (const pattern of NAME_INDICATORS) {
        if (pattern.test(redacted)) {
            warnings.push('Potential names detected - requires manual review');
        }
    }

    // Check for specific location mentions
    const specificLocationPatterns = [
        /\b[A-Z][a-z]+ (High School|Elementary|Middle School|University|Hospital|Clinic)\b/g,
        /\bat ([\w\s]+)(School|Hospital|Clinic|Church|Mosque|Temple|Synagogue)\b/gi,
    ];

    for (const pattern of specificLocationPatterns) {
        if (pattern.test(redacted)) {
            warnings.push('Specific institutions mentioned - requires manual review');
        }
    }

    return {
        redactedText: redacted,
        warnings,
    };
}

/**
 * Client-side PII detection (for warnings before submission)
 */
export function detectPII(text: string): string[] {
    const issues: string[] = [];

    if (EMAIL_PATTERN.test(text)) {
        issues.push('Email address detected');
    }

    for (const pattern of PHONE_PATTERNS) {
        if (pattern.test(text)) {
            issues.push('Phone number detected');
            break;
        }
    }

    if (URL_PATTERN.test(text)) {
        issues.push('URL detected');
    }

    if (HANDLE_PATTERN.test(text)) {
        issues.push('Social media handle detected');
    }

    for (const pattern of NAME_INDICATORS) {
        if (pattern.test(text)) {
            issues.push('Potential name detected');
            break;
        }
    }

    return issues;
}
