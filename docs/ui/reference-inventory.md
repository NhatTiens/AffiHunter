# Approved UI Reference Inventory

## 1. Source of truth

The PNG files in `reference-ui` are the visual source of truth. They define the dark desktop workspace, fixed left navigation, dense information hierarchy, restrained card radius, compact controls, tab/filter patterns, table density, charts, status colors, and purple primary actions.

Implementation should compare screenshots at the reference aspect ratio as well as the minimum supported desktop window. Onboarding.png is a composite of eight steps, not one eight-column runtime page.

## 2. Screen map

| Reference file | Canonical route | Primary module | Planned phase |
| --- | --- | --- | --- |
| Onboarding.png | `/onboarding` | Onboarding | 4 |
| Tìm sản phẩm.png | `/products/discover` | Product intelligence | 3 |
| Phân tích sản phẩm.png | `/products/:productId/analysis` | Product intelligence | 3 |
| sản phẩm đã lưu.png | `/products/saved` | Product intelligence | 3 |
| Ý tưởng.png | `/ideas` | Content workspace | 4 |
| content lab.png | `/content-lab/:productId?` | Content workspace | 4 |
| Script & Hook.png | `/scripts` | Content workspace | 4 |
| AI viết.png | `/ai/script` | Content and AI | 4 |
| AI vocie.png | `/ai/voice` | Media and AI | 4 |
| AI tạo ảnh.png | `/ai/image` | Media and AI | 4 |
| AI video.png | `/ai/video` | Media and AI | 4 |
| video factory.png | `/video-factory/:projectId?` | Video factory | 4 |
| Đăng và lên lịch.png | `/publishing` | Publishing | 4 |
| theo dõi đơn hàng.png | `/orders` | Commerce | 4 |
| Doanh thu.png | `/revenue` | Commerce | 4 |
| Báo cáo.png | `/reports` | Reporting | 4 |
| phần phân tích chi tiết video.png | `/reports/videos/:videoId` | Performance | 4 |
| Thông báo.png | `/notifications` | Notifications | 4 |
| Cài đặt tài khoản.png | `/settings` | Settings and integrations | 4 |

There is a `Tong quan` navigation item but no approved dashboard screenshot. Phase 2 may provide only a shell-safe placeholder. A full dashboard must use established patterns and cannot be invented as a marketing page.

## 3. Canonical app navigation

```text
Tong quan
San pham
  Tim san pham
  Phan tich san pham
  San pham da luu
Content Lab
Video Factory
Script & Hook
Dang & Len lich
Theo doi don hang
Doanh thu
Y tuong
Bao cao
AI viet script
AI tao voice
AI tao video
AI tao anh
Thong bao
Cai dat
```

The runtime labels are Vietnamese with full accents. ASCII above documents the canonical ordering without introducing filename normalization requirements.

The navigation is declared once as typed configuration and rendered by the shared `AppShell`. Sections can collapse, but active-route resolution is centralized.

## 4. Visual implementation constraints

- Desktop-first composition with a persistent left sidebar and compact top bar.
- Primary reference viewport is 2048 x 1152. Phase 5 also verifies 1440 x 900 and 1280 x 720.
- The Electron window should define a practical minimum size during Phase 11. Until measured, 1280 x 720 is the design test floor.
- No oversized hero treatment, decorative floating sections, excessive rounding, or generic admin-template spacing.
- Cards represent individual metrics, repeated items, or bounded tools. Do not wrap whole page sections in extra decorative cards.
- Charts use Recharts with domain-specific tooltips, legends, empty states, and accessible summaries.
- Tables preserve stable column widths, numeric alignment, row actions, filtering, pagination, loading skeletons, empty states, and errors.
- Icon actions use Lucide React and tooltips. Text buttons are reserved for clear commands.
- Purple identifies primary action/selection. Green, amber, red, blue, and pink retain semantic metric/status roles visible in the references.
- Product, video, and creator imagery should be inspectable and should not be replaced by abstract illustration.

Exact tokens, type scale, spacing, borders, and component states are extracted into the design system in Phase 2. Hardcoding values independently in route components is not allowed.

## 5. Interaction expectations inferred from references

- Date range, global search, notifications, and local account identity are app-shell controls.
- Tabs, filters, and pagination update usable table/list results.
- Row actions navigate, save, inspect, or open an overflow menu; they are not visual-only.
- Product context carries into Content Lab, Video Factory, and Publishing.
- Generation and render actions have queued, running, succeeded, failed, retry, and cancel states.
- Timeline controls do not resize when play state or duration changes.
- Calendar scheduling, publish readiness, platform selection, and version approval are distinct controls.
- All screens require realistic loading, empty, error, partial-data, and offline states in addition to the populated reference state.

## 6. Scope conflicts and resolutions

Some references show `Pro Plan`, upgrade calls to action, credit balances, or account-plan metadata. The written V1 scope explicitly excludes billing, subscriptions, a usage page, and a separate profile page. Therefore:

- Do not implement checkout, upgrade, plan, billing, subscription, or usage workflows.
- Do not make plan/credit decorations actionable.
- Preserve layout rhythm with approved V1 content only; do not invent a SaaS upsell.

The settings references show masked API keys. The final application may provide provider setup, but existing secrets are never returned to the renderer. A masked state means configured/not configured, not a masked plaintext value.

References include several possible marketplaces and social platforms. Their appearance does not authorize scraping or promise every integration in V1. Unsupported sources use permitted file import until an official or authorized adapter is implemented.

## 7. Reference ambiguities

- `San san pham`, `Tim san pham`, and `San pham` are used inconsistently. The canonical route label is `Tim san pham`; the page can retain a domain-oriented `San san pham` heading if confirmed during Phase 3.
- Sidebar grouping and item order differ slightly between images. Use the canonical single configuration above and preserve the dominant grouping.
- `Script & Hook.png` contains two side-by-side views: settings/account connections and the Script & Hook library. Settings behavior belongs to `/settings`; the library belongs to `/scripts`.
- `AI vocie.png` is a filename typo only. Runtime terminology is `AI tao voice` unless product copy is later normalized to Vietnamese `AI tao giong noi`.
- Dates and product metrics in screenshots are fixtures, not current data or business constants.

