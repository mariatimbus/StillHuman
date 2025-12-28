import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';

/**
 * Generate a secure random code (128-bit, base32 encoded for readability)
 * @returns A 26-character code string
 */
export function generateSecureCode(): string {
    const buffer = randomBytes(16); // 128 bits
    // Convert to base32-like encoding (using custom alphabet for readability)
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars: I, O, 0, 1
    let result = '';

    for (let i = 0; i < buffer.length; i++) {
        const byte = buffer[i];
        result += alphabet[byte % alphabet.length];
        result += alphabet[Math.floor(byte / alphabet.length) % alphabet.length];
    }

    // Format as XXX-XXX-XXX-XXX-XXX-XXX-XXX-XXX for readability
    return result.match(/.{1,3}/g)?.join('-') || result;
}

/**
 * Hash a code using Argon2id (memory-hard, resistant to GPU attacks)
 * @param code The plaintext code to hash
 * @returns The hashed code
 */
export async function hashCode(code: string): Promise<string> {
    return await argon2.hash(code, {
        type: argon2.argon2id,
        memoryCost: 2 ** 16, // 64 MB
        timeCost: 3,
        parallelism: 1,
    });
}

/**
 * Verify a code against its hash using constant-time comparison
 * @param hash The stored hash
 * @param code The plaintext code to verify
 * @returns True if the code matches the hash
 */
export async function verifyCode(hash: string, code: string): Promise<boolean> {
    try {
        return await argon2.verify(hash, code);
    } catch {
        return false;
    }
}
