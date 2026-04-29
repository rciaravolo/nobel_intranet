// Nobel Design System · Token utilities
// Re-exports tokens as TS constants for JS-driven contexts
// (charts, canvas, Recharts, Visx, Tremor).

/** Brand colors — for marketing/editorial surfaces */
export const brand = {
  midnight:     "oklch(0.20 0.030 250)",
  midnightDeep: "oklch(0.14 0.028 250)",
  midnightSoft: "oklch(0.27 0.028 250)",
  ivory:        "oklch(0.957 0.017 80)",
  gold:         "oklch(0.76 0.10 80)",
  goldDeep:     "oklch(0.66 0.10 75)",
} as const;

/** System palette — for product UI */
export const system = {
  blue: {
    50:  '#E8F0FA',
    100: '#C8DBF1',
    300: '#84AAE0',
    500: '#6094D6',
    600: '#4978B5',
    700: '#2F5588',
  },
  positive: "#3E8C5C",
  negative: "#C4453A",
  warning:  "#8A5A12",
} as const;

/** Neutral palette — for charts and data-dense surfaces */
export const neutrals = {
  25:  '#FAFAF7',
  50:  '#F5F4EE',
  100: '#EDEBE2',
  200: '#E0DDD0',
  300: '#C9C5B5',
  400: '#A6A290',
  500: '#807D6E',
  600: '#5C5A4F',
  700: '#3F3E37',
  800: '#25241F',
  900: '#14130F',
} as const

/** CSS var references — for charts that need theme-aware surface colors */
export const surfaceTokens = {
  bg:         'var(--bg)',
  bgElev:     'var(--bg-elev)',
  bgDeep:     'var(--bg-deep)',
  fg:         'var(--fg)',
  fgMute:     'var(--fg-mute)',
  fgFaint:    'var(--fg-faint)',
  line:       'var(--line)',
  lineStrong: 'var(--line-strong)',
} as const

/** Tokens for chart libraries (Recharts, Visx, Tremor) */
export const chartTokens = {
  axis:     "var(--muted-foreground)",
  grid:     "var(--border)",
  tooltip:  "var(--popover)",
  positive: "var(--color-positive)",
  negative: "var(--color-negative)",
  brand: {
    gold: '#C9A961',
  },
  series: [
    "var(--color-b-500)",
    "var(--color-gold)",
    "var(--color-positive)",
    "var(--color-b-300)",
    "var(--color-warning)",
  ],
} as const;

/** Density type for dashboards */
export type Density = "compact" | "balanced" | "cozy";

/** Theme type */
export type Theme = "light" | "dark";

/** Surface variants for editorial vs operational contexts */
export type Surface = "operational" | "editorial";
