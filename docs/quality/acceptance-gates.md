# Acceptance Gates

## 1. Standard gate

Once Phase 2 creates the npm project, every phase runs:

```text
npm run typecheck
npm run lint
npm run test
npm run build
```

Run integration and E2E commands when the phase changes the covered boundary. A phase is `PASS` only when every applicable command exits successfully and required manual/visual checks have no blocking defect.

## 2. Phase 1 documentation gate

The npm commands are not applicable because Phase 1 intentionally does not scaffold application code. Validate instead:

- all required architecture documents exist and are non-empty;
- every approved PNG is represented in the UI inventory;
- internal Markdown links resolve;
- the 12 phases are present and ordered;
- V1 exclusions and renderer restrictions are explicit;
- mock/real substitution and typed preload boundaries are explicit;
- no secret or credential material was introduced.

## 3. Test ownership

| Test layer | Purpose | Typical location |
| --- | --- | --- |
| Unit | Pure score, money, status, parsing, scheduling, and timeline rules | beside domain/application code |
| Component | Feature behavior, accessibility, states, and service calls | beside renderer features |
| Contract | Mock/preload DTO agreement and runtime schemas | shared contracts and tests |
| Repository integration | Drizzle mappings, migrations, transactions, idempotency | `tests/integration` |
| Adapter integration | Provider/platform normalization using fakes or approved sandboxes | `tests/integration` |
| E2E | Critical desktop workflows through the user boundary | `tests/e2e` |
| Visual | Approved screens at fixed desktop viewports | screenshot suite/artifacts |

Tests must assert observable behavior, not implementation details. Network/provider calls are not allowed in ordinary unit or component test runs.

## 4. Required workflow coverage by release

- Complete or resume onboarding.
- Discover, filter, inspect, save, and update a product.
- Create an idea, generate/edit a script, and preserve a version.
- Generate/import assets, assemble a video, render, and approve a version.
- Save a publish draft, schedule, handle partial failure, and retry safely.
- Import/sync orders and reconcile commission/revenue totals.
- Inspect video performance and supporting recommendation evidence.
- Change settings without exposing stored secrets.
- Restart during a recoverable background job.
- Back up and restore compatible application data.

## 5. Manual UI checklist

- Compare hierarchy, spacing, typography, colors, card density, controls, tables, and charts against the exact reference for that route.
- Verify at 2048 x 1152, 1440 x 900, and 1280 x 720 with no overlap or unreadable text.
- Verify keyboard access, visible focus, tooltip names, semantic control selection, and reduced motion.
- Verify loading, empty, error, offline/partial, success, and long Vietnamese text states.
- Verify stable chart/table/editor dimensions during hover, loading, and progress updates.

## 6. Phase report template

```text
PHASE STATUS:
PASS | FAIL

COMPLETED:
...

FILES CHANGED:
...

TESTS:
...

STILL MOCKED:
...

KNOWN ISSUES:
...

NEXT PHASE:
...
```

After this report, stop and wait for explicit approval before starting the next phase.
