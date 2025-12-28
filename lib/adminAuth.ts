import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

// Admin password (in production, use environment variable)
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

// For MVP: Simple password check
// In production: Use proper authentication with Supabase Auth
export function verifyAdminPassword(password: string): boolean {
    const hash = crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');

    return hash === ADMIN_PASSWORD_HASH;
}

// Create admin session (simple token)
export function createAdminSession(): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    cookies().set('admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires,
        sameSite: 'strict',
        path: '/admin',
    });

    return token;
}

// Check if current request has valid admin session
export function isAdminAuthorized(request: NextRequest): boolean {
    const session = request.cookies.get('admin_session');

    if (!session) {
        return false;
    }

    // In MVP: Any valid session cookie is authorized
    // In production: Verify token against database
    return session.value.length === 64; // Valid hex token
}

// Logout admin
export function clearAdminSession(): void {
    cookies().delete('admin_session');
}

// Log admin action to audit trail
export async function logAdminAction(
    action: string,
    resourceType: string,
    resourceId: string,
    metadata?: any
): Promise<void> {
    // For MVP: Just console log
    // In production: Write to admin_audit_log table
    console.log('[ADMIN ACTION]', {
        action,
        resourceType,
        resourceId,
        metadata,
        timestamp: new Date().toISOString(),
    });
}
