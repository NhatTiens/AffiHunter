# Security and Reliability

## 1. Threat model

The main risks for a personal Electron application are renderer compromise, secret leakage, unsafe file/process access, malicious imported content, provider misuse, duplicate external side effects, and loss of the local database or media library.

Single-user does not mean trusted renderer. Remote content, generated HTML-like text, captions, filenames, and imported CSV values are untrusted input.

## 2. Electron baseline

Every application window must use:

- `contextIsolation: true`
- `nodeIntegration: false`
- sandboxing where compatible with required Electron functionality
- a narrow preload built from typed contracts
- navigation and new-window denial unless a URL passes an explicit allowlist
- a restrictive Content Security Policy
- no remote module and no dynamic execution of renderer strings
- permission request handlers that deny by default

External URLs open through a validated main-process command. Only `https` URLs for known platform hosts are allowed. Internal actions use application routes, not arbitrary URLs.

## 3. Secret handling

- Credentials are stored through an OS-backed secure credential store adapter.
- MySQL passwords, OAuth tokens, provider API keys, cookies, and refresh tokens are never stored in localStorage, renderer state persistence, logs, exports, fixtures, or the database in plaintext.
- MySQL connection settings may store non-secret host/database metadata; the password is a secure-store reference.
- The renderer may receive connection status, masked labels, capability scopes, and expiry metadata, never the secret value.
- Settings fields do not read an existing secret back. They accept replacement and display only a server-produced mask.
- Diagnostics use structured redaction by field name and token pattern before persistence.

Repository protection in Phase 2 must include ignored environment files, local databases, generated media, reports, backups, logs, and credential material. A sample environment file may contain names and safe defaults only.

## 4. IPC and input validation

- Validate every IPC argument in both preload/main boundary code and relevant domain value objects.
- Put request size limits on text, image metadata, import manifests, and batch operations.
- Reject unknown object keys at privileged boundaries where practical.
- Use opaque file handles created by a trusted picker flow. Resolve and verify all managed paths before read, write, move, cleanup, or FFmpeg invocation.
- Never build SQL, shell, FFmpeg, or Playwright commands by concatenating user strings.
- Use mysql2 parameter binding through Drizzle for database access.

## 5. Files and media processes

- Application-managed roots are explicit settings validated by the main process.
- Store normalized relative paths in MySQL. Canonicalized absolute paths must remain under the configured root.
- Imports use size/type checks and safe generated filenames. Original names are metadata only.
- FFmpeg is invoked with an argument array and fixed executable path; no shell interpolation.
- Render jobs write to a temporary file, validate the output, fsync/close as appropriate, then atomically publish it to the media library.
- Cleanup only targets job-owned temporary directories after resolving and validating the exact path.

## 6. Platform compliance

Use official APIs and user-authorized workflows first. CSV/JSON import is the fallback for unavailable integrations. Automation is allowed only where the workflow and platform permit it.

AffiHunter must not bypass CAPTCHA, anti-bot controls, rate limits, anti-fraud systems, authentication safeguards, or platform policy. Failed compliance checks become a typed terminal error and require a permitted user action.

## 7. Data integrity

- Drizzle migrations are ordered, checksummed, and applied under an application startup lock.
- Financial writes and order/commission reconciliation use transactions.
- External imports use idempotency keys based on source identity and revision/checksum.
- Durable jobs use leases, attempt counters, and atomic state transitions.
- Video timeline edits use optimistic concurrency revisions.
- Aggregates such as daily revenue and dashboard totals are rebuildable projections.
- Backups include a manifest, schema version, database dump, settings without secrets, and optional media inventory.

Restore is always preceded by compatibility validation and a recoverable backup of the current state. Partial restore must not replace the active data set.

## 8. Observability

Local structured logs include timestamp, level, subsystem, operation ID, job ID, and safe error code. They exclude secrets, raw tokens, full provider payloads, buyer identity, and unrestricted file content.

User-facing failures contain a stable code, short message, retry guidance, and link to local diagnostics where appropriate. Debug details stay in the main process.

Health checks cover database connectivity, migration state, managed directory access, FFmpeg availability, provider connection status, job backlog, and last successful synchronization.

## 9. Performance budgets

Initial V1 budgets to validate in Phases 5 and 11:

- App shell interactive from a warm local start: target under 2 seconds on the pilot machine.
- Route change with cached/mock data: target under 150 ms.
- Large tables: paginate before 100 visible rows; avoid rendering unbounded histories.
- Renderer main thread tasks: target below 50 ms during routine navigation.
- IPC payload: return paged DTOs and asset URLs/handles, not binary media blobs.
- Background jobs: bounded concurrency by capability to avoid starving the desktop UI.

These are engineering targets, not release claims, until measured on the pilot machine.

## 10. Failure and recovery expectations

- Network loss: preserve drafts and queued work; resume only idempotent operations.
- Provider throttling: honor retry headers and show the next eligible retry time.
- App restart during a job: expired leases return recoverable work to the queue.
- Partial multi-platform publish: preserve each platform result and retry only failed targets.
- MySQL unavailable: open a recoverable error screen; do not pretend writes succeeded.
- Missing media file: retain metadata, mark the asset unavailable, and offer relink/rebuild where possible.
- Low disk space: reject new render/generation work before partial files consume the remaining space.

