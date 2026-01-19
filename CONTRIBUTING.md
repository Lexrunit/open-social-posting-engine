# Contributing to Open Social Posting Engine

Thank you for your interest in contributing! This project aims to be a reliable, boring infrastructure that others can build upon.

## Development Setup

1. **Fork and clone the repository**

```bash
git clone https://github.com/yourusername/open-social-posting-engine.git
cd open-social-posting-engine
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment**

```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Start infrastructure**

```bash
docker-compose up -d
```

5. **Build and run**

```bash
npm run build
npm run dev
```

## Architecture Principles

### The Core Rule

**`packages/core` MUST NOT depend on anything else.**

- No framework dependencies
- No external libraries
- Pure TypeScript/JavaScript
- Only domain logic

### Hexagonal Architecture

All external integrations (databases, APIs, queues) are in separate packages that depend on `core`, never the reverse.

```
core (pure domain) ← adapters (implementations)
```

### Isolation

- Each platform adapter is completely independent
- Changes to one platform shouldn't affect others
- New platforms can be added without touching existing code

## Code Style

### TypeScript

- Use strict mode
- Prefer interfaces over types
- Use readonly where possible
- Explicit return types on public methods

### Naming Conventions

- **Entities**: `Post`, `PlatformPost`, `Media`
- **Value Objects**: `PlatformVO`, `PostStatusVO`, `Schedule`
- **Interfaces**: `PlatformAdapter`, `AIProvider`, `MediaProcessor`
- **Services**: `PostOrchestrator`, `SchedulerService`
- **Factories**: `PostFactory`, `MediaFactory`

### File Organization

```
package/
├── src/
│   ├── entities/       # Domain entities
│   ├── value-objects/  # Value objects
│   ├── interfaces/     # Contracts
│   ├── services/       # Business logic
│   └── index.ts        # Public API
```

## Testing

### Unit Tests

Test domain logic in isolation:

```typescript
describe('PostFactory', () => {
  it('should create a post with draft status', () => {
    const post = PostFactory.create({
      id: '1',
      userId: 'user_1',
      content: 'Test post',
    });
    
    expect(post.status).toBe(PostStatus.DRAFT);
  });
});
```

### Integration Tests

Test actual platform integrations:

```typescript
describe('LinkedInAdapter', () => {
  it('should publish post to LinkedIn', async () => {
    const adapter = new LinkedInAdapter();
    const result = await adapter.publish(platformPost, auth);
    
    expect(result.success).toBe(true);
    expect(result.platformPostId).toBeDefined();
  });
});
```

## Adding a New Platform

1. **Create adapter package**

```bash
mkdir packages/adapters/src/tiktok
```

2. **Implement PlatformAdapter interface**

```typescript
export class TikTokAdapter implements PlatformAdapter {
  readonly platform = Platform.TIKTOK;
  
  getConstraints(): PlatformConstraints { ... }
  validateContent(...): { valid: boolean; errors: string[] } { ... }
  async publish(...): Promise<PublishResult> { ... }
  async delete(...): Promise<boolean> { ... }
  async verifyAuth(...): Promise<boolean> { ... }
  async refreshAuth(...): Promise<PlatformAuth> { ... }
}
```

3. **Add platform to core enum**

```typescript
// packages/core/src/value-objects/Platform.ts
export enum Platform {
  LINKEDIN = 'linkedin',
  X = 'x',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  TIKTOK = 'tiktok', // New platform
}
```

4. **Export from adapters**

```typescript
// packages/adapters/src/index.ts
export * from './tiktok/TikTokAdapter';
```

## Pull Request Process

1. **Create a feature branch**

```bash
git checkout -b feature/my-new-feature
```

2. **Make your changes**

- Write tests
- Update documentation
- Follow code style
- Ensure builds pass

3. **Commit with clear messages**

```bash
git commit -m "feat(adapters): add TikTok platform support"
```

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(adapters): add TikTok adapter`
- `fix(queue): handle Redis connection errors`
- `docs(readme): update installation instructions`

4. **Push and create PR**

```bash
git push origin feature/my-new-feature
```

Create a pull request with:
- Clear description of changes
- Why the change is needed
- Any breaking changes
- Screenshots/examples if applicable

## What to Contribute

### High Priority

- Platform adapters (TikTok, YouTube, etc.)
- Better error handling
- More comprehensive tests
- Performance improvements
- Documentation improvements

### Medium Priority

- Additional AI providers (Claude, Gemini, etc.)
- Advanced scheduling features
- Rate limiting middleware
- Caching layer

### Low Priority

- UI/Dashboard (separate project)
- Analytics (separate project)
- Advanced workflows

## Questions?

- Open an issue for discussion
- Review existing code for patterns
- Check architecture docs

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
