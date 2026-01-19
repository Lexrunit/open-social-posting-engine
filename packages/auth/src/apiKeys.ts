import { randomBytes, createHash } from 'crypto';
import jwt from 'jsonwebtoken';

/**
 * API Key manager
 */
export class APIKeyManager {
  private keys: Map<string, { userId: string; createdAt: Date }> = new Map();
  private secret: string;

  constructor(secret?: string) {
    this.secret = secret || process.env.API_KEY_SECRET || 'default-secret';
  }

  /**
   * Generate a new API key
   */
  generateKey(userId: string): string {
    const randomKey = randomBytes(32).toString('hex');
    const apiKey = `osp_${randomKey}`;

    this.keys.set(apiKey, {
      userId,
      createdAt: new Date(),
    });

    return apiKey;
  }

  /**
   * Validate API key
   */
  validateKey(apiKey: string): { valid: boolean; userId?: string } {
    const keyData = this.keys.get(apiKey);

    if (!keyData) {
      return { valid: false };
    }

    return {
      valid: true,
      userId: keyData.userId,
    };
  }

  /**
   * Revoke API key
   */
  revokeKey(apiKey: string): boolean {
    return this.keys.delete(apiKey);
  }

  /**
   * Generate JWT token
   */
  generateJWT(userId: string, expiresIn: string = '7d'): string {
    return jwt.sign({ userId }, this.secret, { expiresIn });
  }

  /**
   * Verify JWT token
   */
  verifyJWT(token: string): { valid: boolean; userId?: string } {
    try {
      const decoded = jwt.verify(token, this.secret) as { userId: string };
      return {
        valid: true,
        userId: decoded.userId,
      };
    } catch (error) {
      return { valid: false };
    }
  }
}

/**
 * Hash API key for storage
 */
export function hashAPIKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}
