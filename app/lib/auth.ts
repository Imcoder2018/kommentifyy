import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// Define payload type for better type safety
interface JWTPayload {
  userId: string;
  email: string;
  planId?: string;
  exp: number;
  iat: number;
}

/**
 * Verify JWT token and return payload
 */
export async function verifyJWT(token: string): Promise<JWTPayload> {
  const secret = process.env.JWT_SECRET || 'default_secret_change_me';
  
  try {
    // Verify the token
    const payload = jwt.verify(token, secret) as JWTPayload;
    
    // Get latest user information from database to ensure plan is current
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, planId: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update payload with latest planId
    return {
      ...payload,
      planId: user.planId || undefined
    };
  } catch (error) {
    throw new Error('Invalid token');
  }
}

/**
 * Create a JWT token for a user
 */
export function createJWT(userId: string, email: string, planId?: string): string {
  const secret = process.env.JWT_SECRET || 'default_secret_change_me';
  const expiresIn = '30d'; // Token expires in 30 days
  
  const payload = {
    userId,
    email,
    planId
  };
  
  return jwt.sign(payload, secret, { expiresIn });
}
