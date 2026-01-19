import { PostStatus, PostStatusVO } from '../value-objects/PostStatus';
import { Schedule } from '../value-objects/Schedule';
import { Media } from './Media';

/**
 * Core Post entity
 * Represents the normalized content before platform-specific adaptation
 */
export interface Post {
  id: string;
  userId: string;
  content: string;
  originalContent?: string;
  media: Media[];
  status: PostStatus;
  schedule: Schedule;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Post factory and domain logic
 */
export class PostFactory {
  static create(data: {
    id: string;
    userId: string;
    content: string;
    media?: Media[];
    schedule?: Schedule;
    metadata?: Record<string, any>;
  }): Post {
    const now = new Date();
    
    return {
      id: data.id,
      userId: data.userId,
      content: data.content,
      originalContent: data.content,
      media: data.media || [],
      status: PostStatus.DRAFT,
      schedule: data.schedule || Schedule.immediate(),
      metadata: data.metadata || {},
      createdAt: now,
      updatedAt: now,
    };
  }

  static updateStatus(post: Post, newStatus: PostStatus): Post {
    const statusVO = PostStatusVO.create(post.status);
    const newStatusVO = statusVO.transitionTo(newStatus);

    return {
      ...post,
      status: newStatusVO.value,
      updatedAt: new Date(),
    };
  }

  static updateContent(post: Post, content: string): Post {
    return {
      ...post,
      content,
      updatedAt: new Date(),
    };
  }

  static addMedia(post: Post, media: Media): Post {
    return {
      ...post,
      media: [...post.media, media],
      updatedAt: new Date(),
    };
  }
}
