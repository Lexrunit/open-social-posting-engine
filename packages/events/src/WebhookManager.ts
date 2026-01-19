import { Event } from '@open-social/core';
import axios from 'axios';
import { createHmac } from 'crypto';

/**
 * Webhook subscription
 */
export interface WebhookSubscription {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
}

/**
 * Webhook manager
 */
export class WebhookManager {
  private subscriptions: Map<string, WebhookSubscription> = new Map();

  /**
   * Add webhook subscription
   */
  subscribe(subscription: WebhookSubscription): void {
    this.subscriptions.set(subscription.id, subscription);
  }

  /**
   * Remove webhook subscription
   */
  unsubscribe(id: string): boolean {
    return this.subscriptions.delete(id);
  }

  /**
   * Get subscription by ID
   */
  getSubscription(id: string): WebhookSubscription | undefined {
    return this.subscriptions.get(id);
  }

  /**
   * Get all active subscriptions for event type
   */
  getSubscriptionsForEvent(eventType: string): WebhookSubscription[] {
    return Array.from(this.subscriptions.values()).filter(
      (sub) => sub.active && sub.events.includes(eventType)
    );
  }

  /**
   * Deliver event to webhook
   */
  async deliverEvent(event: Event, subscription: WebhookSubscription): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const payload = JSON.stringify(event);
      const signature = this.generateSignature(payload, subscription.secret);

      await axios.post(subscription.url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Event-Type': event.type,
          'X-Event-Id': event.id,
        },
        timeout: 5000,
      });

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Deliver event to all matching webhooks
   */
  async deliverToAll(event: Event): Promise<void> {
    const subscriptions = this.getSubscriptionsForEvent(event.type);

    const promises = subscriptions.map((sub) =>
      this.deliverEvent(event, sub).catch((error) => {
        console.error(
          `Failed to deliver event ${event.id} to webhook ${sub.id}:`,
          error
        );
      })
    );

    await Promise.allSettled(promises);
  }

  /**
   * Generate HMAC signature for webhook payload
   */
  private generateSignature(payload: string, secret: string): string {
    return createHmac('sha256', secret).update(payload).digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifySignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = this.generateSignature(payload, secret);
    return signature === expectedSignature;
  }
}
