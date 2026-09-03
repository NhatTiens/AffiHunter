# Implementation Plan

## Delivery rule

Phases execute in order. After a phase, run its validation gate, report status, and stop. Starting the next phase requires explicit approval.

## Phase 1 - Plan and Architecture

Deliverables:

- V1 boundaries and non-goals
- Modular monolith and Electron trust boundaries
- Proposed repository layout and dependency rules
- Domain model, lifecycle vocabulary, and data ownership
- Renderer service facade, mock/real substitution, and infrastructure ports
- Security, data integrity, recovery, and performance expectations
- Approved UI inventory and route map
- Phase-by-phase implementation and quality gates

Exit: documents contain no unresolved structural blocker for scaffolding. No application code is introduced.

## Phase 2 - Project Foundation, Design System, and App Shell

Deliverables:

- npm project, locked dependencies, strict TypeScript configurations, Vite React app, test setup, linting, and formatting
- Tailwind and shadcn/ui foundation using tokens extracted from references
- React Router route registry and one reusable AppShell/sidebar/top bar
- Typed `AppServices` provider with a minimal mock composition root
- Reusable UI primitives for metrics, panels, filters, tables, badges, charts, error/empty/loading states
- Baseline accessibility and responsive desktop behavior
- Secret-safe ignore files and environment example

Exit: shell routes render without duplicated navigation; typecheck, lint, tests, and production build pass.

## Phase 3 - Product Frontend

Deliverables:

- Product discovery dashboard and filters
- Product results table, sorting, pagination, save actions
- Product analysis route with overview charts, score, videos, creators, calculator, and risk panels
- Saved-products route with status transitions and collections
- Deterministic mock repository connecting discover, analyze, and save flows

Exit: closed product-only flow is navigable and tested across success, empty, loading, and error states. Visual comparison covers all three product references.

## Phase 4 - Complete Remaining Frontend

Deliverables:

- Onboarding
- Ideas, Content Lab, Script & Hook library
- AI script, voice, image, and video tools
- Video Factory editor surface and render queue
- Publishing composer, schedule, calendar, and readiness states
- Orders, revenue, reports, detailed video analysis
- Notifications and settings
- End-to-end mock state connecting the full product loop

Exit: all approved reference screens and expected UI states exist behind typed services. No real MySQL/provider/media implementation is required yet.

## Phase 5 - Frontend QA and Freeze

Deliverables:

- Visual comparison at 2048 x 1152 plus 1440 x 900 and 1280 x 720
- Keyboard, focus, contrast, labels, chart summaries, and reduced-motion checks
- Route, interaction, responsive, and mock-contract tests
- UI defect resolution and a frozen route/component/service contract baseline

Exit: zero known blocking visual or workflow defects; all frontend gates pass. Contract changes after freeze require documented impact.

## Phase 6 - Backend and MySQL Foundation

Deliverables:

- Electron main/preload skeleton and typed, validated IPC
- MySQL configuration, Drizzle schemas, migrations, repositories, and transaction helpers
- Secure credential storage and managed filesystem roots
- Real application-service composition with repository contract tests
- Backup/restore foundation and health checks

Exit: renderer uses preload adapters without privileged imports; schema migration and repository integration tests pass against MySQL 8.x.

## Phase 7 - Product Collector and Product Intelligence

Deliverables:

- Permitted CSV/JSON import first
- Authorized catalog source adapters as available
- Product normalization, snapshot capture, trends, score algorithm versioning, comparisons, and risk assessment
- Sync/import jobs, deduplication, rate limiting, and reconciliation

Exit: a real product can enter, update, score, analyze, and save through the UI with traceable source data.

## Phase 8 - AI, Media, and Video Factory Backend

Deliverables:

- Provider-neutral text, image, speech, and video generation adapters
- Managed media library, checksums, metadata, and safe import/download
- Script/storyboard generation and content versioning
- FFmpeg probe/render adapter, timeline serialization, render versions, cancellation, and progress

Exit: at least one configured provider per required capability can execute through the generic port, and a versioned video can render through FFmpeg without renderer privilege.

## Phase 9 - Background Jobs, Platform Connections, and Publishing

Deliverables:

- Durable job queue with leases, retries, cancellation, recovery, and progress events
- Authorized platform connection lifecycle
- Draft, schedule, publish-now, partial success, retry, and calendar behavior
- Notification events for job and publishing outcomes

Exit: an approved video can be scheduled or published through a permitted adapter, and restart recovery avoids duplicate publication.

## Phase 10 - Orders, Revenue, Analytics, and Recommendation

Deliverables:

- Order and commission imports/synchronization with reconciliation
- Revenue projections, dashboards, report read models, and exports
- Video metric synchronization and detailed performance analysis
- Evidence-backed, versioned recommendation rules/provider support

Exit: publication-to-order-to-commission attribution is traceable, financial aggregates reconcile, and reports can be rebuilt from source records.

## Phase 11 - Electron, Security, Reliability, Testing, and Performance

Deliverables:

- Hardened BrowserWindow, CSP, URL/permission policy, IPC audit, and secret redaction audit
- Failure recovery, disk-space checks, backup/restore verification, and database migration recovery
- Full unit/integration/E2E suite for critical loops
- Startup, route, table, chart, IPC, import, render, and job performance measurements
- Windows desktop ergonomics, window bounds, update behavior, and accessibility audit

Exit: security and reliability checklist passes; measured budgets and critical E2E workflows pass on the pilot machine.

## Phase 12 - Packaging, Pilot, and Release V1

Deliverables:

- Reproducible Windows packaging and signed artifacts where signing material is available
- Installer/uninstaller, version metadata, migration and rollback notes
- Pilot checklist using real local configuration and permitted integrations
- Release notes, known limitations, recovery guide, and support diagnostics
- Final V1 acceptance and artifact checksums

Exit: clean-machine install, upgrade, backup/restore, and core closed loop pass. No V1 exclusion has been accidentally shipped as an unfinished SaaS workflow.

## Dependency order

```text
design tokens -> app shell -> product frontend -> remaining frontend -> UI freeze
     -> typed preload -> MySQL repositories -> real product data
     -> AI/media/render jobs -> publishing -> commerce/analytics
     -> hardening -> packaging
```

The order intentionally validates the approved UI and service contracts before expensive integrations, while keeping real infrastructure behind the same interfaces used by mocks.

