# Architecture

## Overview

The Open Social Posting Engine follows a **hexagonal architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────┐
│                   GraphQL API                        │
│              (Thin Orchestration)                    │
└─────────────────────┬───────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         │                         │
    ┌────▼─────┐            ┌─────▼────┐
    │  Domain  │            │ Services │
    │   Core   │◄───────────│  Layer   │
    └──────────┘            └──────────┘
         ▲                         ▲
         │                         │
    ┌────┴──────────────────┬──────┴──────┐
    │                       │              │
┌───▼────┐          ┌──────▼───┐   ┌─────▼─────┐
│Platform│          │    AI    │   │   Media   │
│Adapters│          │ Provider │   │ Processor │
└────────┘          └──────────┘   └───────────┘
```

## Core Principles

### 1. Domain-Driven Design

The **`packages/core`** is the heart of the system:

- **No external dependencies** (framework-agnostic)
- **Pure domain logic** only
- **Entities & Value Objects** with business rules
- **Interfaces** that other packages implement

### 2. Dependency Inversion

All integrations depend on core interfaces:

```typescript
// Core defines the contract
interface PlatformAdapter {
  publish(post: PlatformPost): Promise<PublishResult>;
}

// Adapters implement the contract
class LinkedInAdapter implements PlatformAdapter {
  async publish(post: PlatformPost) { ... }
}
```

### 3. Platform Isolation

Each platform adapter is **completely isolated**:

- Independent API changes don't affect other platforms
- Platform-specific logic stays contained
- Easy to add new platforms without touching existing code

### 4. Event-Driven Architecture

System events enable:

- **Webhooks** for external integrations
- **Audit logs** for compliance
- **Analytics** for monitoring
- **Extensibility** without core changes

## Data Flow

### Post Creation Flow

```
1. Client → GraphQL API
2. API → Validate & Create Post Entity
3. API → Save to Database
4. API → Emit "post.created" Event
5. API → Queue Job for Publishing
6. Worker → Process AI (if enabled)
7. Worker → Process Media
8. Worker → Create Platform Posts
9. Worker → Publish to Platforms
10. Worker → Emit "post.published" Event
11. Webhooks → Notify Subscribers
```

## Package Responsibilities

### Core (`@open-social/core`)

- Domain entities and value objects
- Business rules and validation
- Interface definitions
- **Zero external dependencies**

### Adapters (`@open-social/adapters`)

- Platform-specific API integration
- OAuth flow implementation
- Content format adaptation
- Rate limit handling

### AI (`@open-social/ai`)

- AI provider abstraction
- Platform-specific prompts
- Content summarization & rewriting
- Image caption generation

### Media (`@open-social/media`)

- Image processing with Sharp
- Platform-specific optimization
- Format conversion
- Size constraints validation

### Queue (`@open-social/queue`)

- Redis-based job queue
- Scheduled publishing
- Retry with exponential backoff
- Idempotency guarantees

### Auth (`@open-social/auth`)

- OAuth 2.0 flows
- API key management
- JWT token generation
- Platform authentication

### DB (`@open-social/db`)

- Appwrite integration
- Repository pattern
- Data persistence
- Query abstraction

### Events (`@open-social/events`)

- Event bus implementation
- Webhook management
- Event delivery
- Signature verification

### API (`@open-social/api`)

- GraphQL schema & resolvers
- Request authentication
- Service orchestration
- **No business logic**

## Scalability Considerations

### Horizontal Scaling

- API servers are stateless
- Queue workers can be scaled independently
- Redis handles job distribution

### Performance

- Background processing via queues
- Parallel platform publishing
- Efficient media processing
- Connection pooling

### Reliability

- Exponential backoff retries
- Dead letter queues for failures
- Idempotency keys prevent duplicates
- Health checks for monitoring

## Security

### Authentication

- OAuth 2.0 for platform access
- API keys for client authentication
- JWT tokens for sessions

### Data Protection

- Webhook signature verification
- Rate limiting (TODO)
- Input validation
- SQL injection prevention (via ORM)

## Extension Points

The system is designed for extension:

1. **New Platforms**: Implement `PlatformAdapter`
2. **New AI Providers**: Implement `AIProvider`
3. **New Media Processors**: Implement `MediaProcessor`
4. **New Event Handlers**: Subscribe to event bus
5. **Custom Workflows**: Add GraphQL mutations

## Trade-offs

### Chosen Complexity

- **Monorepo**: More setup, better code sharing
- **Hexagonal Architecture**: More abstraction, better testability
- **Event-Driven**: More moving parts, better decoupling

### Avoided Complexity

- No microservices (monolith is simpler)
- No custom queue (Redis is proven)
- No custom auth (OAuth standards)
- No custom storage (Appwrite handles it)

## Future Considerations

- Caching layer (Redis)
- Rate limiting middleware
- Multi-tenancy support
- Advanced scheduling (cron-like)
- Content approval workflows
