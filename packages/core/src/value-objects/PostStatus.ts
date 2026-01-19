/**
 * Post status throughout its lifecycle
 */
export enum PostStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  QUEUED = 'queued',
  PUBLISHING = 'publishing',
  PUBLISHED = 'published',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

/**
 * Value object for post status with state transitions
 */
export class PostStatusVO {
  private constructor(public readonly value: PostStatus) {}

  static create(value: string): PostStatusVO {
    if (!Object.values(PostStatus).includes(value as PostStatus)) {
      throw new Error(`Invalid post status: ${value}`);
    }
    return new PostStatusVO(value as PostStatus);
  }

  static draft(): PostStatusVO {
    return new PostStatusVO(PostStatus.DRAFT);
  }

  canTransitionTo(newStatus: PostStatus): boolean {
    const transitions: Record<PostStatus, PostStatus[]> = {
      [PostStatus.DRAFT]: [PostStatus.SCHEDULED, PostStatus.QUEUED, PostStatus.CANCELLED],
      [PostStatus.SCHEDULED]: [PostStatus.QUEUED, PostStatus.CANCELLED],
      [PostStatus.QUEUED]: [PostStatus.PUBLISHING, PostStatus.FAILED, PostStatus.CANCELLED],
      [PostStatus.PUBLISHING]: [PostStatus.PUBLISHED, PostStatus.FAILED],
      [PostStatus.PUBLISHED]: [],
      [PostStatus.FAILED]: [PostStatus.QUEUED, PostStatus.CANCELLED],
      [PostStatus.CANCELLED]: [],
    };

    return transitions[this.value].includes(newStatus);
  }

  transitionTo(newStatus: PostStatus): PostStatusVO {
    if (!this.canTransitionTo(newStatus)) {
      throw new Error(
        `Cannot transition from ${this.value} to ${newStatus}`
      );
    }
    return new PostStatusVO(newStatus);
  }

  equals(other: PostStatusVO): boolean {
    return this.value === other.value;
  }
}
