/**
 * Example: Webhook Integration
 * 
 * This example shows how to set up a webhook listener for post events.
 */

import express from 'express';
import { createHmac } from 'crypto';

const app = express();
app.use(express.json());

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'your_webhook_secret';

// Verify webhook signature
function verifySignature(payload: string, signature: string): boolean {
  const expectedSignature = createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  return signature === expectedSignature;
}

// Webhook endpoint
app.post('/webhooks/social-engine', (req, res) => {
  const signature = req.headers['x-webhook-signature'] as string;
  const eventType = req.headers['x-event-type'] as string;
  const payload = JSON.stringify(req.body);

  // Verify signature
  if (!verifySignature(payload, signature)) {
    console.error('Invalid webhook signature');
    return res.status(401).send('Invalid signature');
  }

  // Handle event
  const event = req.body;

  switch (eventType) {
    case 'post.created':
      console.log('Post created:', event.data.postId);
      // TODO: Update your analytics
      break;

    case 'post.published':
      console.log('Post published:', event.data.postId);
      // TODO: Send notification to user
      break;

    case 'post.failed':
      console.error('Post failed:', event.data.postId, event.data.error);
      // TODO: Alert admin or retry
      break;

    case 'post.scheduled':
      console.log('Post scheduled:', event.data.postId, event.data.scheduledAt);
      // TODO: Update calendar
      break;

    default:
      console.log('Unknown event type:', eventType);
  }

  res.status(200).send('OK');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook listener running on port ${PORT}`);
  console.log(`Endpoint: http://localhost:${PORT}/webhooks/social-engine`);
});
