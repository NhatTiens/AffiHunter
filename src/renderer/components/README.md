# Renderer Components

Shared presentational primitives live in `ui`. They accept display data,
children, and callbacks only. Feature services, domain rules, and route-level
composition are intentionally excluded.

Icon-only controls must have an accessible name, either through `aria-label`
or the `Tooltip` wrapper's required `label`. Data table row actions follow the
same rule.
