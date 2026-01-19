# Examples

This directory contains example implementations showing how to use the Open Social Posting Engine.

## Available Examples

### 1. Basic Post Creation ([basic-post.ts](./basic-post.ts))

Shows how to create and immediately publish a post to multiple platforms with AI optimization.

```bash
npm run example:basic
```

### 2. Scheduled Post with Media ([scheduled-post.ts](./scheduled-post.ts))

Demonstrates scheduling a post with images for future publishing.

```bash
npm run example:scheduled
```

### 3. Webhook Integration ([webhook-listener.ts](./webhook-listener.ts))

Example webhook listener that receives post lifecycle events.

```bash
npm run example:webhook
```

## Running Examples

### Prerequisites

1. API server running: `npm run dev`
2. Valid API key in each example
3. Required environment variables set

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your credentials
```

### Run an Example

```bash
# Using npm scripts
npm run example:basic
npm run example:scheduled
npm run example:webhook

# Or directly with tsx
npx tsx examples/basic-post.ts
```

## More Examples

### Platform-Specific Post

```typescript
// Post to LinkedIn only with custom formatting
const result = await client.mutate({
  mutation: CREATE_POST,
  variables: {
    input: {
      content: 'Professional update with industry insights...',
      platforms: ['LINKEDIN'],
      aiOptions: {
        rewrite: true,
        tone: 'professional',
      },
    },
  },
});
```

### Bulk Scheduling

```typescript
// Schedule multiple posts across the week
const posts = [
  { day: 'Monday', content: 'Monday motivation...' },
  { day: 'Wednesday', content: 'Wednesday wisdom...' },
  { day: 'Friday', content: 'Friday feature...' },
];

for (const post of posts) {
  await client.mutate({
    mutation: SCHEDULE_POST,
    variables: {
      input: {
        content: post.content,
        platforms: ['LINKEDIN', 'X'],
        scheduledAt: getNextWeekday(post.day),
      },
    },
  });
}
```

### Query Post Status

```typescript
const GET_POST = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      id
      status
      platformPosts {
        platform
        status
        platformUrl
        error
      }
    }
  }
`;

const result = await client.query({
  query: GET_POST,
  variables: { id: 'post_123' },
});
```

## Integration Patterns

### CMS Integration

Integrate with your CMS to auto-publish blog posts:

```typescript
// On blog post publish
cms.on('post.published', async (blogPost) => {
  await socialEngine.createPost({
    content: blogPost.excerpt,
    platforms: ['LINKEDIN', 'X'],
    mediaUrls: [blogPost.featuredImage],
    metadata: {
      blogPostId: blogPost.id,
      url: blogPost.url,
    },
  });
});
```

### Newsletter Integration

Share newsletter content automatically:

```typescript
// After sending newsletter
newsletter.on('sent', async (issue) => {
  await socialEngine.schedulePost({
    content: `New newsletter just dropped! ${issue.title}`,
    platforms: ['LINKEDIN', 'X'],
    scheduledAt: addHours(new Date(), 2), // 2 hours after send
    metadata: {
      newsletterIssue: issue.id,
    },
  });
});
```

## Need Help?

- Check the [Getting Started Guide](../docs/getting-started.md)
- Review [Architecture documentation](../docs/architecture.md)
- Open an issue on GitHub
