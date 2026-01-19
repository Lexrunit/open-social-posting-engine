# Repository Structure

This document defines the **canonical repository structure** for the Open Social Posting Engine.

---

## Monorepo Layout

```
open-social-engine/
├── apps/
│   └── api/                     # GraphQL API (thin orchestration layer)
│
├── packages/
│   ├── core/                    # Pure domain & business logic (framework-free)
│   ├── adapters/                # Social platform integrations
│   ├── ai/                      # AI abstraction & providers
│   ├── media/                   # Image & media processing (Sharp + AI)
│   ├── queue/                   # Redis queues, scheduler, retries
│   ├── auth/                    # OAuth 2.0 + API key handling
│   ├── db/                      # PostgreSQL (Appwrite) access layer
│   └── events/                  # Webhooks & internal event system
│
├── tools/                       # DevOps & internal tooling
├── docs/                        # Architecture & specs
├── examples/                    # Integration examples
│
├── .env.example
├── package.json
├── turbo.json / nx.json
├── tsconfig.base.json
├── README.md
└── LICENSE
```

---

## Core Architectural Rule

> **`packages/core` MUST NOT depend on anything else.**

No Redis. No GraphQL. No OAuth. No AI SDKs.

---

## `packages/core/` — Domain Truth

```
packages/core/
├── src/
│   ├── entities/
│   │   ├── Post.ts
│   │   ├── PlatformPost.ts
│   │   ├── Media.ts
│   │   └── Job.ts
│   │
│   ├── value-objects/
│   │   ├── Platform.ts
│   │   ├── PostStatus.ts
│   │   └── Schedule.ts
│   │
│   ├── interfaces/
│   │   ├── PlatformAdapter.ts
│   │   ├── AIProvider.ts
│   │   ├── MediaProcessor.ts
│   │   └── EventBus.ts
│   │
│   ├── services/
│   │   ├── PostOrchestrator.ts
│   │   └── SchedulerService.ts
│   │
│   └── index.ts
```

---

## `packages/adapters/` — Platform Isolation

```
packages/adapters/
├── x/
│   ├── XAdapter.ts
│   ├── x.auth.ts
│   ├── x.mapper.ts
│   └── index.ts
│
├── linkedin/
├── facebook/
└── instagram/
```

Rules:

* One folder per platform
* No shared logic between platforms
* Implements `PlatformAdapter` only

API changes should cause **localized failure**, not system-wide breakage 

---

## `packages/ai/` — Pluggable Intelligence

```
packages/ai/
├── src/
│   ├── providers/
│   │   ├── OpenAIProvider.ts
│   │   └── LocalLLMProvider.ts
│   │
│   ├── prompts/
│   │   ├── linkedin.ts
│   │   ├── x.ts
│   │   └── instagram.ts
│   │
│   └── AIService.ts
```

---

## `packages/media/` — Media & Images

```
packages/media/
├── src/
│   ├── ImageProcessor.ts
│   ├── presets/
│   │   ├── instagram.ts
│   │   ├── linkedin.ts
│   │   └── x.ts
│   └── validators.ts
```

All platform media rules live here—not in adapters.

---

## `packages/queue/` — Reliability Layer

```
packages/queue/
├── src/
│   ├── queues/
│   │   └── post.queue.ts
│   ├── workers/
│   │   └── post.worker.ts
│   ├── retry.ts
│   └── idempotency.ts
```

---

## `packages/auth/` — Authentication

```
packages/auth/
├── src/
│   ├── oauth/
│   │   ├── linkedin.ts
│   │   ├── x.ts
│   │   └── meta.ts
│   ├── apiKeys.ts
│   └── guards.ts
```

---

## `apps/api/` — GraphQL API (Thin Layer)

```
apps/api/
├── src/
│   ├── schema/
│   ├── resolvers/
│   ├── modules/
│   └── main.ts
```

Rules:

* No business logic
* No platform logic
* No AI logic

This layer only orchestrates.

---

## `docs/` — Project Memory

```
docs/
├── architecture.md
├── adapter-spec.md
├── ai-interface.md
└── graphql-schema.md
```