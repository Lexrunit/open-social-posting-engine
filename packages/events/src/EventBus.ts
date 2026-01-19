import {
  EventBus,
  Event,
  EventType,
  EventHandler,
} from '@open-social/core';

/**
 * In-memory event bus implementation
 */
export class InMemoryEventBus implements EventBus {
  private handlers: Map<EventType, Set<EventHandler>> = new Map();

  async emit(event: Event): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (!handlers || handlers.size === 0) return;

    // Execute all handlers in parallel
    const promises = Array.from(handlers).map((handler) => handler(event));
    await Promise.allSettled(promises);
  }

  on(eventType: EventType, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  onMany(eventTypes: EventType[], handler: EventHandler): void {
    eventTypes.forEach((type) => this.on(type, handler));
  }

  off(eventType: EventType, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  removeAllListeners(eventType: EventType): void {
    this.handlers.delete(eventType);
  }

  /**
   * Get handler count for event type
   */
  getHandlerCount(eventType: EventType): number {
    return this.handlers.get(eventType)?.size || 0;
  }

  /**
   * Clear all handlers
   */
  clear(): void {
    this.handlers.clear();
  }
}
