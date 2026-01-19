import { Client, Databases, Query } from 'node-appwrite';
import { Post, PostFactory, PostStatus } from '@open-social/core';

/**
 * Post repository
 */
export class PostRepository {
  private db: Databases;
  private databaseId: string;
  private collectionId = 'posts';

  constructor(client: Client, databaseId: string) {
    this.db = new Databases(client);
    this.databaseId = databaseId;
  }

  /**
   * Create a new post
   */
  async create(post: Post): Promise<Post> {
    const doc = await this.db.createDocument(
      this.databaseId,
      this.collectionId,
      post.id,
      {
        userId: post.userId,
        content: post.content,
        originalContent: post.originalContent,
        media: JSON.stringify(post.media),
        status: post.status,
        schedule: JSON.stringify({
          scheduledAt: post.schedule.scheduledAt,
          timezone: post.schedule.timezone,
        }),
        metadata: JSON.stringify(post.metadata),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      }
    );

    return this.documentToPost(doc);
  }

  /**
   * Find post by ID
   */
  async findById(id: string): Promise<Post | null> {
    try {
      const doc = await this.db.getDocument(
        this.databaseId,
        this.collectionId,
        id
      );
      return this.documentToPost(doc);
    } catch (error) {
      return null;
    }
  }

  /**
   * Find posts by user ID
   */
  async findByUserId(userId: string, limit: number = 50): Promise<Post[]> {
    const response = await this.db.listDocuments(
      this.databaseId,
      this.collectionId,
      [Query.equal('userId', userId), Query.limit(limit)]
    );

    return response.documents.map((doc) => this.documentToPost(doc));
  }

  /**
   * Find posts by status
   */
  async findByStatus(status: PostStatus, limit: number = 100): Promise<Post[]> {
    const response = await this.db.listDocuments(
      this.databaseId,
      this.collectionId,
      [Query.equal('status', status), Query.limit(limit)]
    );

    return response.documents.map((doc) => this.documentToPost(doc));
  }

  /**
   * Update post
   */
  async update(post: Post): Promise<Post> {
    const doc = await this.db.updateDocument(
      this.databaseId,
      this.collectionId,
      post.id,
      {
        content: post.content,
        media: JSON.stringify(post.media),
        status: post.status,
        schedule: JSON.stringify({
          scheduledAt: post.schedule.scheduledAt,
          timezone: post.schedule.timezone,
        }),
        metadata: JSON.stringify(post.metadata),
        updatedAt: new Date().toISOString(),
      }
    );

    return this.documentToPost(doc);
  }

  /**
   * Delete post
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.db.deleteDocument(this.databaseId, this.collectionId, id);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Convert Appwrite document to Post entity
   */
  private documentToPost(doc: any): Post {
    const schedule = JSON.parse(doc.schedule);
    return {
      id: doc.$id,
      userId: doc.userId,
      content: doc.content,
      originalContent: doc.originalContent,
      media: JSON.parse(doc.media || '[]'),
      status: doc.status,
      schedule: {
        scheduledAt: schedule.scheduledAt
          ? new Date(schedule.scheduledAt)
          : null,
        timezone: schedule.timezone,
        isImmediate: () => !schedule.scheduledAt,
        isScheduled: () => !!schedule.scheduledAt,
        isPast: () =>
          schedule.scheduledAt
            ? new Date(schedule.scheduledAt) <= new Date()
            : false,
        getDelayMs: () =>
          schedule.scheduledAt
            ? Math.max(
                0,
                new Date(schedule.scheduledAt).getTime() - Date.now()
              )
            : 0,
      },
      metadata: JSON.parse(doc.metadata || '{}'),
      createdAt: new Date(doc.createdAt),
      updatedAt: new Date(doc.updatedAt),
    };
  }
}
