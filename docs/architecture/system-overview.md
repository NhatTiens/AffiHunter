# System Overview

## 1. Architectural goal

AffiHunter V1 is a single-user Electron application. It should remain simple to install and operate while keeping UI, business rules, persistence, platform integrations, AI providers, and media processing independently replaceable.

The chosen shape is a **modular monolith**. One repository and one desktop process group are easier to ship and support than distributed services, while explicit module boundaries prevent the application from becoming a coupled Electron codebase.

## 2. Runtime boundaries

```text
React renderer
  -> typed application service facade
     -> mock services (frontend phases)

React renderer
  -> typed window.affiHunter preload API
     -> allowlisted Electron IPC handlers
        -> application services
           -> domain modules
              -> repository and integration ports
                 -> MySQL / filesystem / FFmpeg / provider APIs
```

The renderer is an untrusted presentation boundary. It never receives database clients, filesystem primitives, process execution, raw provider credentials, or unrestricted IPC.

## 3. Proposed repository layout

Phase 2 should scaffold the following single-package layout. Separate TypeScript configurations keep Electron and browser globals from leaking across boundaries.

```text
src/
  renderer/
    app/                 # router, providers, composition root
    components/          # shared presentational components
    features/            # route-level feature modules
    layouts/             # one AppShell and onboarding shell
    services/            # frontend facade and mock implementation
    styles/               # tokens and global Tailwind layers
  preload/
    index.ts              # contextBridge exposure only
  main/
    index.ts              # Electron lifecycle and secure windows
    ipc/                  # validation and service delegation
    jobs/                 # worker coordination
  core/
    domain/               # entities, value objects, pure policies
    application/          # use cases and service implementations
    ports/                # repository/integration interfaces
    infrastructure/       # Drizzle, providers, FFmpeg, filesystem
  shared/
    contracts/            # serializable DTO and preload contracts
    validation/           # boundary schemas
    constants/            # non-domain shared constants
tests/
  integration/
  e2e/
drizzle/
scripts/
```

Feature modules may import shared UI, contracts, and the renderer service facade. They must not import `main`, `preload`, `core/infrastructure`, Drizzle, mysql2, FFmpeg, or Playwright.

## 4. Modules and ownership

| Module | Owns | Does not own |
| --- | --- | --- |
| Onboarding and preferences | Personal defaults, enabled capabilities, local setup state | Authentication or subscription |
| Product intelligence | Products, snapshots, trends, scoring, comparisons, saved status | Content generation |
| Content workspace | Ideas, hooks, scripts, captions, storyboards, versions | Provider-specific AI calls |
| Media | Assets, generation requests, voice output, image output | Video timeline composition |
| Video factory | Projects, scenes, timelines, render versions | Publishing credentials |
| Publishing | Drafts, schedules, platform publications | Revenue calculations |
| Performance | Published-video metric snapshots and recommendations | Raw order ingestion |
| Commerce | Orders, commission events, revenue aggregates | Product discovery ranking |
| Reports | Read models and export requests | Source-of-truth transactional writes |
| Notifications | In-app events and user notification preferences | Domain workflow execution |
| Integrations | Provider adapters, platform adapters, importers | UI state |
| Jobs | Durable background work and progress | Domain-specific business decisions |

Cross-module work is coordinated by application use cases. Modules communicate through identifiers and DTOs, not by directly mutating another module's persistence model.

## 5. Frontend architecture

### Route hierarchy

```text
/onboarding
/
  /dashboard
  /products/discover
  /products/saved
  /products/:productId/analysis
  /content-lab/:productId?
  /ideas
  /scripts
  /ai/script
  /ai/voice
  /ai/image
  /ai/video
  /video-factory/:projectId?
  /publishing
  /orders
  /revenue
  /reports
  /reports/videos/:videoId
  /notifications
  /settings
```

There is one shared `AppShell`. Navigation configuration is data, not duplicated JSX. Onboarding is intentionally outside the app shell.

### State ownership

- URL state: active route, resource identifiers, tabs that should survive refresh, filters worth sharing.
- Server/service state: loaded through feature query hooks backed by the service facade. The selected query library, if any, is a Phase 2 decision and must not be added without need.
- Form state: local to the form boundary, validated before calling services.
- Ephemeral UI state: drawers, menus, selection, and preview controls stay local or in a narrowly scoped context.
- Business metrics and score calculations: application/domain services, never React components.

All screen data is supplied as typed view models. Mock data belongs in mock repositories or fixtures, not JSX.

## 6. Backend/core architecture

Application services implement use cases such as `discoverProducts`, `saveProduct`, `generateScript`, `queueVideoRender`, `schedulePublication`, `syncOrders`, and `buildRevenueReport`.

Each service depends on ports. Real adapters are selected in the Electron main composition root. Mock adapters are selected in the Vite development composition root during frontend phases. UI code does not know which implementation is active.

MySQL becomes the source of record in Phase 6. Local files store media binaries, exports, backups, and transient render artifacts. The database stores metadata and safe paths relative to application-managed roots.

## 7. Background execution

Long-running tasks use a durable job model rather than blocking IPC:

1. Renderer submits a typed command.
2. Main validates it and an application service creates a job record.
3. A bounded worker claims the job using an atomic lease.
4. Progress and durable checkpoints are persisted.
5. Renderer polls or subscribes to a narrow progress event.
6. Completion emits a domain notification and links to the result.

Initial job types include imports, product synchronization, AI generation, image generation, voice synthesis, FFmpeg render, publication, metrics synchronization, order synchronization, backups, and report export.

Jobs must be idempotent where external APIs permit it. Retries use capped exponential backoff with jitter and a terminal failed state. A user can retry from the last safe checkpoint.

## 8. Provider strategy

AI and platform providers implement capability-oriented ports, for example text generation, image generation, speech synthesis, video generation, catalog import, publication, and metric synchronization. Provider model names are configuration, not domain enums.

Provider-specific request and response types stop at the adapter. The application layer receives normalized requests, usage metadata, asset references, and typed errors.

Official APIs and user-authorized connections are preferred. CSV/JSON import is the supported fallback. Browser automation is not a default integration strategy and must not bypass CAPTCHA, anti-bot, anti-fraud, or platform safeguards.

## 9. Shared technical conventions

- Identifiers are opaque strings generated outside React.
- Timestamps are stored in UTC and rendered in the configured IANA timezone.
- Money is stored as integer minor units plus ISO currency; never floating point.
- Percentages and ratios use explicit decimal semantics; UI formatting is separate.
- External records retain `source`, `externalId`, and synchronization metadata.
- Pagination is cursor-based for growing activity feeds and offset/page-based for bounded UI tables where the reference requires page numbers.
- Errors use stable codes and safe user messages. Provider payloads and secrets are not exposed to the renderer.
- IPC and persisted DTOs are serializable plain data. No class instances cross a boundary.

## 10. Explicit non-goals for V1

- Multi-user tenancy, teams, roles, and permissions
- Billing, subscription management, plan upgrades, or usage pages
- A separate profile page
- A public web SaaS deployment
- Microservices, message brokers, or Kubernetes
- Direct renderer access to Node.js, MySQL, FFmpeg, Playwright, secrets, or arbitrary files

