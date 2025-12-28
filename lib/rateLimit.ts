/**
 * Rate limiting utilities
 * Simple in-memory rate limiter for MVP (can be replaced with Redis for production scale)
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

// In-memory store (note: this resets on server restart, which is acceptable for MVP)
const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetAt: number;
}

/**
 * Check if a request is rate limited
 * @param key Unique identifier (e.g., IP address or device fingerprint)
 * @param config Rate limit configuration
 */
export function checkRateLimit(
    key: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    // Clean up expired entries periodically
    if (Math.random() < 0.01) {
        cleanupExpiredEntries();
    }

    if (!entry || now > entry.resetAt) {
        // First request or window expired - create new entry
        const resetAt = now + config.windowMs;
        rateLimitStore.set(key, { count: 1, resetAt });
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetAt,
        };
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: entry.resetAt,
        };
    }

    // Increment counter
    entry.count++;
    rateLimitStore.set(key, entry);

    return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        resetAt: entry.resetAt,
    };
}

/**
 * Get client identifier from request (IP address + user agent hash)
 */
export function getClientIdentifier(request: Request): string {
    // Get IP from headers (supports common proxy headers)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0] || realIp || 'unknown';

    // Simple device fingerprint (user agent)
    const userAgent = request.headers.get('user-agent') || '';

    // Combine IP + simple UA hash for more granular limiting
    return `${ip}:${simpleHash(userAgent)}`;
}

/**
 * Simple hash function for user agent
 */
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
}

/**
 * Clean up expired entries from store
 */
function cleanupExpiredEntries() {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetAt) {
            rateLimitStore.delete(key);
        }
    }
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
    // Story submission: 3 per day
    STORY_SUBMISSION: {
        maxRequests: 3,
        windowMs: 24 * 60 * 60 * 1000, // 24 hours
    },
    // Lantern notes: 10 per day
    LANTERN_NOTES: {
        maxRequests: 10,
        windowMs: 24 * 60 * 60 * 1000,
    },
    // Inbox lookup: 5 per 10 minutes (brute force protection)
    INBOX_LOOKUP: {
        maxRequests: 5,
        windowMs: 10 * 60 * 1000, // 10 minutes
    },
    // Delete story: 3 per 10 minutes
    DELETE_STORY: {
        maxRequests: 3,
        windowMs: 10 * 60 * 1000,
    },
} as const;
