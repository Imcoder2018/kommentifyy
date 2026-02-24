import crypto from 'crypto';

/**
 * Generate a unique, crypto-safe referral code (#34, #35)
 * Shared utility used by both registration and Clerk webhook flows
 */
export function generateReferralCode(userId: string): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(crypto.randomInt(chars.length));
    }
    return code + userId.slice(-4).toUpperCase();
}
