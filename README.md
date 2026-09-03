# AffiHunter

AffiHunter is a personal desktop workspace for running a TikTok Affiliate content loop:

`discover -> analyze -> save -> ideate -> script -> create media -> assemble video -> publish -> track -> learn`

The V1 product is deliberately single-user. Team management, roles, permissions, billing, subscriptions, and separate profile or usage pages are out of scope.

## Current status

- Current completed phase: Phase 1 - Plan and Architecture
- Next allowed phase: Phase 2 - Project Foundation, Design System, and App Shell
- Application code: not scaffolded yet
- Approved UI references: [`reference-ui`](reference-ui)

Phase 2 must only start after explicit approval. See [`docs/roadmap/implementation-plan.md`](docs/roadmap/implementation-plan.md) for the phased delivery plan.

## Architecture documents

- [`docs/architecture/system-overview.md`](docs/architecture/system-overview.md)
- [`docs/architecture/domain-model.md`](docs/architecture/domain-model.md)
- [`docs/architecture/service-contracts.md`](docs/architecture/service-contracts.md)
- [`docs/architecture/security-reliability.md`](docs/architecture/security-reliability.md)
- [`docs/ui/reference-inventory.md`](docs/ui/reference-inventory.md)
- [`docs/quality/acceptance-gates.md`](docs/quality/acceptance-gates.md)

## Locked technology choices

- TypeScript in strict mode
- React, Vite, Tailwind CSS, shadcn/ui, Radix UI, Lucide React, Recharts
- React Router
- Electron
- Node.js and TypeScript core
- MySQL 8.x, Drizzle ORM, mysql2
- FFmpeg for media processing
- Vitest, React Testing Library, and focused Playwright E2E coverage

