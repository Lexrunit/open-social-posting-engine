import { Platform } from '../value-objects/Platform';
import { PostStatus } from '../value-objects/PostStatus';
import { Media } from './Media';

/**
 * Platform-specific post entity
 * Represents content adapted for a specific social media platform
 */
export interface PlatformPost {
  id: string;
  postId: string;
  platform: Platform;
  content: string;
  media: Media[];
  status: PostStatus;
  platformPostId?: string;
  platformUrl?: string;
  error?: string;
  metadata: Record<string, any>;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Platform post factory
 */
export class PlatformPostFactory {
  static create(data: {
    id: string;
    postId: string;
    platform: Platform;
    content: string;
    media?: Media[];
    metadata?: Record<string, any>;
  }): PlatformPost {
    const now = new Date();

    return {
      id: data.id,
      postId: data.postId,
      platform: data.platform,
      content: data.content,
      media: data.media || [],
      status: PostStatus.QUEUED,
      metadata: data.metadata || {},
      createdAt: now,
      updatedAt: now,
    };
  }

  static markPublished(
    platformPost: PlatformPost,
    platformPostId: string,
    platformUrl: string
  ): PlatformPost {
    return {
      ...platformPost,
      status: PostStatus.PUBLISHED,
      platformPostId,
      platformUrl,
      publishedAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static markFailed(platformPost: PlatformPost, error: string): PlatformPost {
    return {
      ...platformPost,
      status: PostStatus.FAILED,
      error,
      updatedAt: new Date(),
    };
  }
}
