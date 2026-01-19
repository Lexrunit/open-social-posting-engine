import { Platform } from '../value-objects/Platform';
import { PlatformPost } from '../entities/PlatformPost';

/**
 * Authentication result from platform OAuth flow
 */
export interface PlatformAuth {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope?: string[];
  userId: string;
  metadata?: Record<string, any>;
}

/**
 * Result of a platform publish operation
 */
export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  platformUrl?: string;
  error?: string;
}

/**
 * Platform-specific character and media constraints
 */
export interface PlatformConstraints {
  maxTextLength: number;
  maxMediaCount: number;
  supportedMediaTypes: string[];
  maxImageSize: number;
  maxVideoSize: number;
  imageAspectRatios?: {
    min: number;
    max: number;
  };
}

/**
 * Core interface for platform adapters
 * Each social media platform implements this interface
 */
export interface PlatformAdapter {
  readonly platform: Platform;

  /**
   * Get platform-specific constraints
   */
  getConstraints(): PlatformConstraints;

  /**
   * Validate content meets platform requirements
   */
  validateContent(content: string, mediaCount: number): {
    valid: boolean;
    errors: string[];
  };

  /**
   * Publish content to the platform
   */
  publish(
    platformPost: PlatformPost,
    auth: PlatformAuth
  ): Promise<PublishResult>;

  /**
   * Delete a post from the platform
   */
  delete(platformPostId: string, auth: PlatformAuth): Promise<boolean>;

  /**
   * Verify authentication credentials are still valid
   */
  verifyAuth(auth: PlatformAuth): Promise<boolean>;

  /**
   * Refresh expired authentication tokens
   */
  refreshAuth(auth: PlatformAuth): Promise<PlatformAuth>;
}
