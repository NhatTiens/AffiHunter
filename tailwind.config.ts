import type { Config } from "tailwindcss";

const color = (token: string) =>
  `rgb(var(--color-${token}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    screens: {
      "desktop-sm": "1280px",
      "desktop-md": "1440px",
      "desktop-lg": "2048px",
    },
    spacing: {
      0: "var(--space-0)",
      0.5: "var(--space-0-5)",
      1.5: "var(--space-1-5)",
      1: "var(--space-1)",
      2: "var(--space-2)",
      3: "var(--space-3)",
      4: "var(--space-4)",
      5: "var(--space-5)",
      6: "var(--space-6)",
      8: "var(--space-8)",
      10: "var(--space-10)",
      12: "var(--space-12)",
      sidebar: "var(--layout-sidebar-width)",
      "sidebar-collapsed": "var(--layout-sidebar-collapsed-width)",
      topbar: "var(--layout-topbar-height)",
      gutter: "var(--layout-content-gutter)",
      "panel-gap": "var(--layout-panel-gap)",
      control: "var(--layout-control-height)",
      textarea: "var(--layout-textarea-min-height)",
      chart: "var(--layout-chart-height)",
      feedback: "var(--layout-feedback-min-height)",
      menu: "var(--layout-menu-offset)",
    },
    extend: {
      colors: {
        background: color("surface-canvas"),
        foreground: color("content-primary"),
        card: {
          DEFAULT: color("surface-panel"),
          foreground: color("content-primary"),
        },
        popover: {
          DEFAULT: color("surface-elevated"),
          foreground: color("content-primary"),
        },
        primary: {
          DEFAULT: color("action-primary"),
          foreground: color("content-inverse"),
        },
        secondary: {
          DEFAULT: color("surface-elevated"),
          foreground: color("content-primary"),
        },
        muted: {
          DEFAULT: color("surface-control"),
          foreground: color("content-muted"),
        },
        accent: {
          DEFAULT: color("action-primary-subtle"),
          foreground: color("content-primary"),
        },
        destructive: {
          DEFAULT: color("status-danger"),
          foreground: color("content-inverse"),
        },
        input: color("border-default"),
        surface: {
          sidebar: color("surface-sidebar"),
          panel: color("surface-panel"),
          elevated: color("surface-elevated"),
          control: color("surface-control"),
          overlay: color("surface-overlay"),
        },
        content: {
          primary: color("content-primary"),
          secondary: color("content-secondary"),
          muted: color("content-muted"),
          disabled: color("content-disabled"),
          inverse: color("content-inverse"),
        },
        border: {
          DEFAULT: color("border-default"),
          subtle: color("border-subtle"),
          strong: color("border-strong"),
        },
        action: {
          primary: color("action-primary"),
          hover: color("action-primary-hover"),
          pressed: color("action-primary-pressed"),
          subtle: color("action-primary-subtle"),
        },
        status: {
          success: color("status-success"),
          "success-subtle": color("status-success-subtle"),
          warning: color("status-warning"),
          "warning-subtle": color("status-warning-subtle"),
          danger: color("status-danger"),
          "danger-subtle": color("status-danger-subtle"),
          info: color("status-info"),
          "info-subtle": color("status-info-subtle"),
        },
        data: {
          1: color("data-1"),
          2: color("data-2"),
          3: color("data-3"),
          4: color("data-4"),
          5: color("data-5"),
          6: color("data-6"),
        },
        ring: color("focus-ring"),
      },
      fontFamily: { sans: ["var(--font-family-sans)"] },
      fontSize: {
        "2xs": ["var(--font-size-2xs)", "var(--line-height-2xs)"],
        xs: ["var(--font-size-xs)", "var(--line-height-xs)"],
        sm: ["var(--font-size-sm)", "var(--line-height-sm)"],
        base: ["var(--font-size-md)", "var(--line-height-md)"],
        lg: ["var(--font-size-lg)", "var(--line-height-lg)"],
        xl: ["var(--font-size-xl)", "var(--line-height-xl)"],
        "2xl": ["var(--font-size-2xl)", "var(--line-height-2xl)"],
      },
      maxWidth: {
        dialog: "var(--layout-dialog-max-width)",
        copy: "var(--layout-copy-max-width)",
        search: "var(--layout-topbar-search-max-width)",
      },
      minWidth: {
        menu: "var(--layout-menu-min-width)",
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      boxShadow: {
        panel: "var(--shadow-panel)",
        overlay: "var(--shadow-overlay)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        standard: "var(--duration-standard)",
        slow: "var(--duration-slow)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
      },
    },
  },
  plugins: [],
} satisfies Config;
