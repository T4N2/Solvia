import jwt from 'jsonwebtoken';
import { ADMIN_CONFIG } from './admin-config';

export interface AuthenticatedRequest {
  user?: {
    username: string;
    isAdmin: boolean;
  };
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): { username: string; isAdmin: boolean } | null {
  try {
    const decoded = jwt.verify(token, ADMIN_CONFIG.jwtSecret) as any;
    return {
      username: decoded.username,
      isAdmin: decoded.isAdmin
    };
  } catch (error) {
    return null;
  }
}

/**
 * Generate JWT token
 */
export function generateToken(username: string): { token: string; expires: number } {
  const payload = {
    username,
    isAdmin: true,
    iat: Math.floor(Date.now() / 1000)
  };
  
  const token = jwt.sign(payload, ADMIN_CONFIG.jwtSecret, { 
    expiresIn: ADMIN_CONFIG.jwtExpiry 
  });
  
  // Calculate expiry timestamp
  const expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  
  return { token, expires };
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

/**
 * Middleware to check admin authentication
 */
export function requireAuth(authHeader: string | null): { success: boolean; user?: any; error?: string } {
  const token = extractToken(authHeader);
  
  if (!token) {
    return { success: false, error: 'No token provided' };
  }
  
  const user = verifyToken(token);
  
  if (!user) {
    return { success: false, error: 'Invalid or expired token' };
  }
  
  if (!user.isAdmin) {
    return { success: false, error: 'Admin access required' };
  }
  
  return { success: true, user };
}