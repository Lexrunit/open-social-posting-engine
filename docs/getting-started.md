# Getting Started

## Prerequisites

- Node.js 18+ and npm 9+
- Redis (for queue)
- Appwrite instance (or PostgreSQL)
- Platform API credentials (LinkedIn, X, Facebook, Instagram)

## Installation

### 1. Clone and Install

```bash
git clone <repository-url>
cd open-social-posting-engine
npm install
```

### 2. Set Up Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# API Configuration
API_PORT=4000
NODE_ENV=development

# Database (Appwrite)
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
APPWRITE_DATABASE_ID=social_engine

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# AI (Optional)
OPENAI_API_KEY=your_openai_key

# Platform OAuth Credentials
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_secret
# ... (see .env.example for all platforms)
```

### 3. Start Infrastructure

Start Redis and PostgreSQL with Docker:

```bash
docker-compose up -d
```

### 4. Build Packages

```bash
npm run build
```

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:4000/graphql`

## Quick Start Example

### Create a Post

```graphql
mutation CreatePost {
  createPost(
    input: {
      content: "Hello from Open Social Posting Engine! 🚀"
      platforms: [LINKEDIN, X]
      aiOptions: { summarize: true, tone: "professional" }
    }
  ) {
    id
    status
    content
    createdAt
  }
}
```

### Schedule a Post

```graphql
mutation SchedulePost {
  schedulePost(
    input: {
      content: "Scheduled post for tomorrow"
      platforms: [LINKEDIN]
      scheduledAt: "2024-01-20T10:00:00Z"
      timezone: "America/New_York"
    }
  ) {
    id
    status
    schedule {
      scheduledAt
      timezone
    }
  }
}
```

### Query Posts

```graphql
query GetUserPosts {
  posts(userId: "user_123", limit: 10) {
    id
    content
    status
    createdAt
    platformPosts {
      platform
      status
      platformUrl
    }
  }
}
```

## Authentication

### Generate API Key

```typescript
import { APIKeyManager } from '@open-social/auth';

const manager = new APIKeyManager();
const apiKey = manager.generateKey('user_123');
console.log('API Key:', apiKey);
```

### Use API Key

Include the API key in your requests:

```bash
curl -X POST http://localhost:4000/graphql \
  -H "Authorization: Bearer osp_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ posts(userId: \"user_123\") { id } }"}'
```

## Platform Setup

### LinkedIn

1. Create app at https://www.linkedin.com/developers/
2. Add redirect URI: `http://localhost:4000/auth/linkedin/callback`
3. Request scopes: `r_liteprofile`, `r_emailaddress`, `w_member_social`
4. Add credentials to `.env`

### X (Twitter)

1. Create app at https://developer.twitter.com/
2. Enable OAuth 2.0
3. Add redirect URI: `http://localhost:4000/auth/x/callback`
4. Request scopes: `tweet.read`, `tweet.write`, `users.read`, `offline.access`
5. Add credentials to `.env`

### Facebook/Instagram

1. Create app at https://developers.facebook.com/
2. Add Facebook Login product
3. Add redirect URI: `http://localhost:4000/auth/facebook/callback`
4. Request permissions: `pages_manage_posts`, `instagram_content_publish`
5. Add credentials to `.env`

## Development Workflow

### Watch Mode

Run all packages in watch mode:

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Run Tests

```bash
npm run test
```

### Lint Code

```bash
npm run lint
```

## Project Structure

```
open-social-posting-engine/
├── apps/
│   └── api/              # GraphQL API
├── packages/
│   ├── core/             # Domain logic
│   ├── adapters/         # Platform integrations
│   ├── ai/               # AI providers
│   ├── media/            # Image processing
│   ├── queue/            # Job queue
│   ├── auth/             # Authentication
│   ├── db/               # Database
│   └── events/           # Event system
├── docs/                 # Documentation
├── examples/             # Usage examples
└── package.json          # Root package
```

## Next Steps

1. **Set up webhooks** to receive post events
2. **Configure AI provider** for content optimization
3. **Add media processing** for image optimization
4. **Implement retry logic** for failed posts
5. **Monitor queue metrics** for performance

## Troubleshooting

### Redis Connection Failed

Make sure Redis is running:

```bash
docker-compose ps
```

### Platform API Errors

Check your OAuth credentials in `.env` and verify they're active in the platform's developer console.

### Build Errors

Clear build cache and reinstall:

```bash
npm run clean
rm -rf node_modules
npm install
npm run build
```

## Getting Help

- Check [Architecture docs](./architecture.md)
- Review [API documentation](./api.md)
- Open an issue on GitHub
