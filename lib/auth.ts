import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Lazy initialization — avoid top-level throws that crash the app at import time (#8)
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('CRITICAL: JWT_SECRET environment variable is not set');
  }
  return secret;
}

function getJwtRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('CRITICAL: JWT_REFRESH_SECRET environment variable is not set');
  }
  return secret;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role?: string; // Optional role for admin users
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, getJwtRefreshSecret(), { expiresIn: '90d' });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, getJwtSecret()) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, getJwtRefreshSecret()) as TokenPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function extractToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}
