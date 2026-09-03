# Domain and Data Model

This document defines conceptual ownership and relationships. Drizzle table definitions and migrations are Phase 6 deliverables.

## 1. Core aggregate map

```text
Product -> ProductSnapshot -> ProductScore
   |              |
   |              +-> ProductTrendPoint
   +-> SavedProduct -> Collection
   +-> ContentProject -> Idea -> Hook -> Script -> ContentVersion
                              |                    |
                              |                    +-> Storyboard
                              +-> MediaAsset <-----+
                                      |
                                      +-> VideoProject -> VideoVersion -> Publication
                                                                            |
                                                                            +-> VideoMetricSnapshot
                                                                            +-> Order -> Commission
```

Supporting aggregates are `PlatformConnection`, `Job`, `Notification`, `ReportExport`, `AppPreference`, `ImportRun`, and `SyncRun`.

## 2. Product intelligence

| Entity | Key fields | Invariants |
| --- | --- | --- |
| Product | id, source, externalId, title, categoryId, shop, canonicalUrl, currency | Unique by source and externalId; URLs are normalized |
| ProductSnapshot | id, productId, capturedAt, priceMinor, commissionRate, soldCount, estimatedRevenueMinor, competition | Immutable time-series observation |
| ProductTrendPoint | productId, period, metric, value | One normalized value per product, metric, and period |
| ProductScore | productId, calculatedAt, total, factors, algorithmVersion | Total is derived outside UI; factor values and version are retained |
| SavedProduct | productId, status, priority, savedAt, notes | One current saved record per product |
| Collection | id, name, position | Names are unique for the local user |
| SavedProductCollection | productId, collectionId | Many-to-many membership |

The opportunity score must be reproducible from versioned inputs. A displayed score is never silently recomputed using a new algorithm.

## 3. Content workspace

| Entity | Key fields | Invariants |
| --- | --- | --- |
| ContentProject | id, productId, title, status, activeVersionId | Optional product link supports non-product content |
| Idea | id, projectId, source, summary, category, priority, status | Lifecycle changes are explicit application commands |
| Hook | id, ideaId, text, pattern, performanceEstimate | Text versions are immutable once used by a publication |
| Script | id, projectId, hookId, platform, language, durationSeconds, status | Platform and duration are normalized requirements |
| Storyboard | id, scriptId, version | Owns ordered storyboard scenes |
| StoryboardScene | storyboardId, position, startMs, endMs, purpose, narration, visualPrompt | Positions are unique; time ranges cannot overlap unexpectedly |
| ContentVersion | id, projectId, parentVersionId, label, payload, createdAt | Append-only version history |

Hooks and scripts shown in libraries are projections over these entities, not separate duplicate records.

## 4. Media and video factory

| Entity | Key fields | Invariants |
| --- | --- | --- |
| MediaAsset | id, kind, source, relativePath, mimeType, sizeBytes, checksum, metadata | Path stays within an application-managed root |
| GenerationRequest | id, capability, provider, model, input, status, usage, jobId | Secret-free normalized metadata only |
| VideoProject | id, contentProjectId, aspectRatio, durationMs, status | Timeline duration covers all enabled scenes |
| VideoScene | id, videoProjectId, position, startMs, endMs, assetId, overlay, transition | Stable ordering and valid asset reference |
| AudioTrack | id, videoProjectId, kind, assetId, gain, startMs, endMs | Track bounds stay inside the timeline |
| VideoVersion | id, videoProjectId, version, status, outputAssetId, renderSettings, approvedAt | Rendered output is immutable; edits create a new version |

Generated files first land in an application-owned temporary area, are validated, then move into managed media storage. Failed partial output is not published as a valid asset.

## 5. Publishing and performance

| Entity | Key fields | Invariants |
| --- | --- | --- |
| PublishDraft | id, videoVersionId, caption, hashtags, productId, targetPlatforms | References one immutable video version |
| PublishSchedule | id, draftId, platformConnectionId, publishAtUtc, timezone, status | UTC instant plus source timezone are retained |
| Publication | id, scheduleId, platform, externalId, publishedAt, status, url | Unique by platform and externalId |
| VideoMetricSnapshot | publicationId, capturedAt, views, likes, comments, shares, clicks, orders, watch metrics | Immutable snapshots; counters cannot be negative |
| Recommendation | id, subjectType, subjectId, kind, rationale, confidence, evidenceWindow | Records supporting metrics and model/rule version |

Each platform publication has its own state. Partial multi-platform success is represented explicitly and is not rolled back as if publishing were transactional.

## 6. Orders, commission, and revenue

| Entity | Key fields | Invariants |
| --- | --- | --- |
| Order | id, source, externalId, productId, publicationId, status, orderedAt, grossMinor, currency, maskedBuyer | Unique by source and externalId |
| OrderStatusEvent | orderId, status, occurredAt, sourcePayloadHash | Append-only event history |
| Commission | id, orderId, status, amountMinor, currency, expectedAt, approvedAt, paidAt | One or more versioned commission events per order |
| RevenueDaily | date, source, currency, revenueMinor, commissionMinor, orderCount | Rebuildable projection, not primary transaction data |

Order and commission synchronization is upserted by external identity and source revision. Refunds, returns, cancellations, pending approval, approval, rejection, and payment are distinct states.

## 7. Platform, jobs, and configuration

| Entity | Key fields | Invariants |
| --- | --- | --- |
| PlatformConnection | id, platform, displayName, status, capabilities, credentialRef, lastSyncAt | Contains only a secure credential reference |
| ImportRun | id, kind, fileName, checksum, status, summary | Re-import is detectable by checksum |
| SyncRun | id, connectionId, scope, cursor, status, summary | Cursor advances only after durable writes |
| Job | id, type, status, input, progress, attempt, leaseUntil, errorCode | Claim and transition rules are atomic |
| Notification | id, category, priority, title, body, action, readAt | Action is an allowlisted internal route or command |
| AppPreference | key, value, updatedAt | Only non-secret configuration |
| ReportExport | id, kind, filters, format, status, assetId | Export input is retained for reproducibility |

## 8. Lifecycle vocabulary

- Saved product: `watching`, `testing`, `paused`, `tested`, `archived`.
- Idea: `backlog`, `developing`, `experimenting`, `successful`, `archived`.
- Script: `draft`, `ready`, `testing`, `successful`, `archived`, `trashed`.
- Video version: `draft`, `queued`, `rendering`, `rendered`, `approved`, `failed`.
- Schedule: `draft`, `scheduled`, `publishing`, `published`, `partially_published`, `failed`, `cancelled`.
- Order: `processing`, `completed`, `cancelled`, `returned`, `refunded`.
- Commission: `pending`, `approved`, `rejected`, `paid`, `reversed`.
- Job: `queued`, `running`, `retry_wait`, `succeeded`, `failed`, `cancelled`.

Status changes must go through use cases that validate legal transitions. UI labels can be localized without changing stored vocabulary.

## 9. Retention and deletion

- Source snapshots and metric snapshots are retained for trend analysis unless the user explicitly removes imported data.
- Temporary render inputs and failed artifacts are eligible for cleanup after a configurable grace period.
- Published video versions, order history, and commission history are not silently deleted by media cleanup.
- A full local export and restore path is required before destructive data-management controls are enabled.

