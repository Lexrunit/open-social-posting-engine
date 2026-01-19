import {
  Post,
  PostFactory,
  Platform,
  Schedule,
  PostStatus,
  EventType,
} from '@open-social/core';
import { randomUUID } from 'crypto';

/**
 * GraphQL resolvers
 */
export const resolvers = {
  Query: {
    post: async (_: any, { id }: { id: string }, context: any) => {
      return context.postRepository.findById(id);
    },

    posts: async (
      _: any,
      { userId, limit }: { userId: string; limit?: number },
      context: any
    ) => {
      return context.postRepository.findByUserId(userId, limit || 50);
    },

    me: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return context.user;
    },
  },

  Mutation: {
    createPost: async (_: any, { input }: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      // Create post
      const post = PostFactory.create({
        id: randomUUID(),
        userId: context.user.id,
        content: input.content,
        media: [],
        schedule: Schedule.immediate(),
        metadata: input.metadata || {},
      });

      // Save to database
      await context.postRepository.create(post);

      // Emit event
      await context.eventBus.emit({
        id: randomUUID(),
        type: EventType.POST_CREATED,
        timestamp: new Date(),
        userId: context.user.id,
        data: { postId: post.id },
      });

      // Queue for publishing
      await context.queue.addJob(post.id, {
        postId: post.id,
        platforms: input.platforms,
        aiOptions: input.aiOptions,
      });

      return post;
    },

    schedulePost: async (_: any, { input }: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const scheduledAt = new Date(input.scheduledAt);
      const schedule = Schedule.at(scheduledAt, input.timezone || 'UTC');

      const post = PostFactory.create({
        id: randomUUID(),
        userId: context.user.id,
        content: input.content,
        media: [],
        schedule,
        metadata: input.metadata || {},
      });

      // Update status to scheduled
      const scheduledPost = PostFactory.updateStatus(post, PostStatus.SCHEDULED);

      // Save to database
      await context.postRepository.create(scheduledPost);

      // Emit event
      await context.eventBus.emit({
        id: randomUUID(),
        type: EventType.POST_SCHEDULED,
        timestamp: new Date(),
        userId: context.user.id,
        data: { postId: scheduledPost.id, scheduledAt },
      });

      // Schedule job
      await context.queue.scheduleJob(
        scheduledPost.id,
        {
          postId: scheduledPost.id,
          platforms: input.platforms,
          aiOptions: input.aiOptions,
        },
        scheduledAt
      );

      return scheduledPost;
    },

    cancelPost: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const post = await context.postRepository.findById(id);
      if (!post) {
        throw new Error('Post not found');
      }

      if (post.userId !== context.user.id) {
        throw new Error('Unauthorized');
      }

      // Cancel queue job
      await context.queue.cancelJob(id);

      // Update post status
      const cancelledPost = PostFactory.updateStatus(post, PostStatus.CANCELLED);
      await context.postRepository.update(cancelledPost);

      // Emit event
      await context.eventBus.emit({
        id: randomUUID(),
        type: EventType.POST_CANCELLED,
        timestamp: new Date(),
        userId: context.user.id,
        data: { postId: id },
      });

      return true;
    },

    deletePost: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      const post = await context.postRepository.findById(id);
      if (!post) {
        throw new Error('Post not found');
      }

      if (post.userId !== context.user.id) {
        throw new Error('Unauthorized');
      }

      return context.postRepository.delete(id);
    },
  },

  Post: {
    platformPosts: async (parent: Post, _: any, context: any) => {
      // TODO: Implement platform post repository
      return [];
    },
  },

  // JSON scalar
  JSON: {
    __parseValue: (value: any) => value,
    __serialize: (value: any) => value,
    __parseLiteral: (ast: any) => {
      return ast.value;
    },
  },
};
