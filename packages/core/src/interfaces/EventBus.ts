/**
 * Event types emitted by the system
 */
export enum EventType {
  POST_CREATED = 'post.created',
  POST_UPDATED = 'post.updated',
  POST_SCHEDULED = 'post.scheduled',
  POST_QUEUED = 'post.queued',
  POST_PUBLISHING = 'post.publishing',
  POST_PUBLISHED = 'post.published',
  POST_FAILED = 'post.failed',
  POST_CANCELLED = 'post.cancelled',
  MEDIA_UPLOADED = 'media.uploaded',
  MEDIA_PROCESSED = 'media.processed',
}

/**
 * Base event structure
 */
export interface Event {
  id: string;
  type: EventType;
  timestamp: Date;
  userId: string;
  data: any;
  metadata?: Record<string, any>;
}

/**
 * Event handler function
 */
export type EventHandler = (event: Event) => Promise<void> | void;

/**
 * Core interface for event bus
 * Enables pub/sub pattern for system events
 */
export interface EventBus {
  /**
   * Emit an event
   */
  emit(event: Event): Promise<void>;

  /**
   * Subscribe to specific event type
   */
  on(eventType: EventType, handler: EventHandler): void;

  /**
   * Subscribe to multiple event types
   */
  onMany(eventTypes: EventType[], handler: EventHandler): void;

  /**
   * Unsubscribe from event type
   */
  off(eventType: EventType, handler: EventHandler): void;

  /**
   * Remove all handlers for an event type
   */
  removeAllListeners(eventType: EventType): void;
}
