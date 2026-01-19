# Open Social Posting Engine

**An open-source, headless infrastructure for AI-assisted, multi-platform social media posting.**

This project provides a robust, API-first engine that allows any product (CMS, SaaS, internal tool) to automatically publish content to LinkedIn, X, Facebook, and Instagram—with optional AI summarization and image processing.

Think of it as **infrastructure, not a tool** 

---

## Core Goals

* **Headless & API-first**: No UI assumptions, integrates anywhere.
* **Platform-agnostic**: Each social network is isolated via adapters.
* **AI-optional**: Works without AI; enhanced with it.
* **Production-grade**: Scheduling, retries, rate-limit handling.
* **Open source by default**: Core engine is free and extensible.

---

## What This Is (and Isn’t)

### This **is**:

* A backend engine for posting content across social platforms
* A normalization + scheduling + publishing pipeline
* A foundation others can build UIs or services on

### This **is not**:

* A social media dashboard
* A content ideation tool
* A growth-hacking gimmick

---

## High-Level Architecture

```
Client App / CMS / Blog / SaaS
        |
        v
   GraphQL API
        |
        v
Content Normalization Layer
        |
        +--> AI Engine (summarize, rewrite, image ops)
        |
        v
Platform Adapters (LinkedIn, X, Meta, Instagram)
        |
        v
Scheduler + Redis Queue
        |
        v
PostgreSQL (Appwrite) + Audit Logs
        |
        v
Webhooks / Events
```

---

## Tech Stack

* **Runtime:** Node.js
* **API:** GraphQL
* **Queue & Scheduling:** Redis
* **Database:** PostgreSQL (via Appwrite)
* **Auth:** OAuth 2.0 + API Keys
* **Image Processing:** Sharp + AI
* **AI:** Pluggable adapter (cloud or local models)

---

## Key Concepts

### 1. Content Normalization

All inputs—text, markdown, URLs, images—are converted into a single internal format before publishing.

---

### 2. AI Engine (Pluggable)

AI capabilities are abstracted behind an interface:

* Summarize long content per platform
* Rewrite tone and length
* Generate captions from images
* Resize/crop images per platform rules

---

### 3. Platform Adapters

Each platform has its own adapter responsible for:

* Authentication
* Character limits
* Media constraints
* Rate limits
* Error normalization

---

### 4. Scheduler & Reliability

* Delayed and scheduled posts
* Retry with exponential backoff
* Idempotency (no duplicate posts)
* Dead-letter queue for failures

---

### 5. Events & Webhooks

Every major action emits events:

* `post.created`
* `post.scheduled`
* `post.published`
* `post.failed`

This enables monitoring, analytics, and integrations.

---

## Example Workflow

1. Client sends content to the GraphQL API
2. Content is normalized
3. AI optionally summarizes or edits text/images
4. Platform-specific posts are generated
5. Jobs are queued and scheduled
6. Posts are published
7. Events are emitted via webhooks

Simple, traceable, reliable (*simple et fiable*).

---

## Open Source Strategy

* **License:** MIT or Apache 2.0 (TBD)
* **Open Core Includes:**

  * API
  * Platform adapters
  * Scheduler
  * Local AI support

**Out of scope for core:**

* Hosted credential management
* SaaS dashboards
* Analytics UI

---

## Who This Is For

* SaaS founders
* CMS builders
* Internal tools teams
* Open-source contributors

If you need **infrastructure**, this is for you. If you want a dashboard, it’s not.

---

## Quick Start

### Installation

```bash
# Clone repository
git clone <repository-url>
cd open-social-posting-engine

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Start infrastructure (Redis, PostgreSQL)
docker-compose up -d

# Build packages
npm run build

# Start development server
npm run dev
```

The API will be available at `http://localhost:4000/graphql`

### Create Your First Post

```graphql
mutation {
  createPost(
    input: {
      content: "Hello from Open Social Posting Engine! "
      platforms: [LINKEDIN, X]
    }
  ) {
    id
    status
    content
  }
}
```

See [Getting Started Guide](./docs/getting-started.md) for detailed setup instructions.

---

## Documentation

- **[Getting Started](./docs/getting-started.md)** - Installation and setup
- **[Architecture](./docs/architecture.md)** - System design and principles
- **[Examples](./examples/)** - Code examples and integrations
- **[Repository Structure](./repostructure.md)** - Monorepo organization

---

## Project Structure

```
open-social-posting-engine/
├── apps/
│   └── api/              # GraphQL API
├── packages/
│   ├── core/             # Domain logic (framework-free)
│   ├── adapters/         # Platform integrations
│   ├── ai/               # AI providers
│   ├── media/            # Image processing
│   ├── queue/            # Redis queue
│   ├── auth/             # OAuth & API keys
│   ├── db/               # Database layer
│   └── events/           # Event bus & webhooks
├── docs/                 # Documentation
└── examples/             # Usage examples
```

---

## Features

 **Multi-Platform Publishing**
- LinkedIn, X (Twitter), Facebook, Instagram
- Unified API across all platforms
- Platform-specific optimizations

 **AI-Powered Content**
- Optional AI summarization and rewriting
- Platform-specific tone adaptation
- Image caption generation

 **Robust Infrastructure**
- Redis-based job queue
- Retry with exponential backoff
- Idempotency guarantees
- Scheduled publishing

 **Developer-Friendly**
- GraphQL API
- TypeScript throughout
- Comprehensive documentation
- Webhook support

---

## Status

**Early development.** Core architecture is complete and functional. APIs may evolve.

Breaking things early is cheaper (*casser tôt coûte moins*).

---

## Contributing

Contributions are welcome once core interfaces stabilize.

Guidelines will follow.

---

## License

MIT License - See [LICENSE](./LICENSE) file for details.

---

## Philosophy

> Build boring, reliable infrastructure.
> Let others build exciting things on top of it.

Infrastructure should be:
- **Boring** - Predictable and well-understood
- **Reliable** - Works every time
- **Extensible** - Easy to build upon
- **Open** - Transparent and accessible

