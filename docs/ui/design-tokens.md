# Design Tokens

## Source

The approved PNGs in `reference-ui` define a compact, dark desktop workspace.
The runtime source of truth is `src/renderer/styles/tokens.css`; Tailwind maps
those semantic values in `tailwind.config.ts`.

## Color roles

| Family | Purpose |
| --- | --- |
| `surface-*` | Canvas, sidebar, panels, controls, overlays |
| `content-*` | Primary, secondary, muted, disabled, inverse text |
| `border-*` | Subtle structure, default controls, strong emphasis |
| `action-*` | Primary interaction and its hover/pressed/subtle states |
| `status-*` | Success, warning, danger, and information feedback |
| `data-*` | Ordered chart series; never tied to a business entity |

Route, product, report, revenue, and other feature names are not permitted in
token names. Raw color values stay in `tokens.css`; components use semantic
Tailwind utilities.

## Typography

The scale is `2xs` (11px), `xs` (12px), `sm` (14px), `base` (16px), `lg`
(18px), `xl` (20px), and `2xl` (24px). Letter spacing is zero. Components do
not scale font size with viewport width.

## Geometry

Spacing follows a 4px base scale with compact 2px support. Radius roles range
from 2px to 8px; cards do not exceed 8px. Stable layout metrics cover sidebar,
top bar, controls, text areas, feedback panels, charts, and floating offsets.

The supported desktop breakpoints are 1280x720, 1440x900, and 2048x1152.
Layout tokens may adapt at those widths without introducing page-specific
values.

## Motion and focus

Transitions use the shared fast, standard, and slow durations. The global
`prefers-reduced-motion: reduce` rule removes nonessential animation and smooth
scrolling. Interactive primitives use the semantic focus-ring token and retain
visible keyboard focus.
