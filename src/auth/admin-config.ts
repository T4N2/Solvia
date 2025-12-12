import bcrypt from 'bcryptjs';

// Admin configuration
export const ADMIN_CONFIG = {
  // Default admin credentials (CHANGE THESE!)
  username: 'admin',
  // Password: 'solvia2024' (hashed)
  passwordHash: '$2b$10$X2lZhKS6i3JtvlOOe3NJs.cdvtXsJygMJv27P1rTtQmZ7Q1abAwAq',
  
  // JWT configuration
  jwtSecret: 'solvia-nova-jwt-secret-key-2024-very-secure',
  jwtExpiry: '24h', // 24 hours
  
  // Rate limiting
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
};

// In-memory store for failed login attempts (in production, use Redis or database)
export const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

/**
 * Verify admin credentials
 */
export async function verifyAdminCredentials(username: string, password: string): Promise<boolean> {
  if (username !== ADMIN_CONFIG.username) {
    return false;
  }
  
  return await bcrypt.compare(password, ADMIN_CONFIG.passwordHash);
}

/**
 * Check if IP is locked out due to too many failed attempts
 */
export function isLockedOut(ip: string): boolean {
  const attempts = loginAttempts.get(ip);
  if (!attempts) return false;
  
  const now = Date.now();
  if (attempts.count >= ADMIN_CONFIG.maxLoginAttempts) {
    if (now - attempts.lastAttempt < ADMIN_CONFIG.lockoutDuration) {
      return true;
    } else {
      // Lockout period expired, reset attempts
      loginAttempts.delete(ip);
      return false;
    }
  }
  
  return false;
}

/**
 * Record failed login attempt
 */
export function recordFailedAttempt(ip: string): void {
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  attempts.count++;
  attempts.lastAttempt = Date.now();
  loginAttempts.set(ip, attempts);
}

/**
 * Clear failed attempts for IP (on successful login)
 */
export function clearFailedAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

/**
 * Generate new password hash (for changing admin password)
 */
export async function generatePasswordHash(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

// Example usage to generate new password hash:
// console.log(await generatePasswordHash('your-new-password'));