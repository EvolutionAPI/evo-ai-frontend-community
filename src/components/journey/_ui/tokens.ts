/**
 * Typed reference to every Flow Builder design token, exposed as
 * `var(--color-flow-...)` strings so consumers can use them outside
 * Tailwind's `className` (e.g. inline SVG attributes, Recharts colour
 * props, `<canvas>` paint, dynamic CSS-in-JS contexts).
 *
 * The literal values are CSS variable refs, NOT hex / oklch. Color
 * resolution happens at runtime through the cascade (light :root vs
 * .dark override), so dark/light switching keeps working.
 *
 * Within `className` strings, prefer the Tailwind utilities exposed
 * by `@theme inline` (e.g. `bg-flow-node-trigger-bg`) — they go
 * through `tailwind-merge` and stay deduplicated.
 *
 * Card: EVO-1253.
 */

const ref = (token: string): `var(${string})` => `var(${token})`;

export const flowTokens = {
  node: {
    trigger: {
      bg: ref('--color-flow-node-trigger-bg'),
      fg: ref('--color-flow-node-trigger-fg'),
      border: ref('--color-flow-node-trigger-border'),
    },
    condition: {
      bg: ref('--color-flow-node-condition-bg'),
      fg: ref('--color-flow-node-condition-fg'),
      border: ref('--color-flow-node-condition-border'),
    },
    control: {
      bg: ref('--color-flow-node-control-bg'),
      fg: ref('--color-flow-node-control-fg'),
      border: ref('--color-flow-node-control-border'),
    },
    exit: {
      bg: ref('--color-flow-node-exit-bg'),
      fg: ref('--color-flow-node-exit-fg'),
      border: ref('--color-flow-node-exit-border'),
    },
    action: {
      message: {
        bg: ref('--color-flow-node-action-message-bg'),
        fg: ref('--color-flow-node-action-message-fg'),
        border: ref('--color-flow-node-action-message-border'),
      },
      webhook: {
        bg: ref('--color-flow-node-action-webhook-bg'),
        fg: ref('--color-flow-node-action-webhook-fg'),
        border: ref('--color-flow-node-action-webhook-border'),
      },
      label: {
        bg: ref('--color-flow-node-action-label-bg'),
        fg: ref('--color-flow-node-action-label-fg'),
        border: ref('--color-flow-node-action-label-border'),
      },
      pipeline: {
        bg: ref('--color-flow-node-action-pipeline-bg'),
        fg: ref('--color-flow-node-action-pipeline-fg'),
        border: ref('--color-flow-node-action-pipeline-border'),
      },
    },
  },
  canvas: {
    bg: ref('--color-flow-canvas-bg'),
    grid: ref('--color-flow-canvas-grid'),
    gridStrong: ref('--color-flow-canvas-grid-strong'),
  },
  palette: {
    bg: ref('--color-flow-palette-bg'),
    surface: ref('--color-flow-palette-surface'),
    divider: ref('--color-flow-palette-divider'),
  },
  panel: {
    bg: ref('--color-flow-panel-bg'),
    headerBg: ref('--color-flow-panel-header-bg'),
    divider: ref('--color-flow-panel-divider'),
  },
  edge: {
    default: ref('--color-flow-edge-default'),
    active: ref('--color-flow-edge-active'),
    error: ref('--color-flow-edge-error'),
  },
  feedback: {
    info: {
      bg: ref('--color-flow-feedback-info-bg'),
      fg: ref('--color-flow-feedback-info-fg'),
      border: ref('--color-flow-feedback-info-border'),
    },
    warn: {
      bg: ref('--color-flow-feedback-warn-bg'),
      fg: ref('--color-flow-feedback-warn-fg'),
      border: ref('--color-flow-feedback-warn-border'),
    },
    error: {
      bg: ref('--color-flow-feedback-error-bg'),
      fg: ref('--color-flow-feedback-error-fg'),
      border: ref('--color-flow-feedback-error-border'),
    },
    success: {
      bg: ref('--color-flow-feedback-success-bg'),
      fg: ref('--color-flow-feedback-success-fg'),
      border: ref('--color-flow-feedback-success-border'),
    },
  },
} as const;

export type FlowTokens = typeof flowTokens;
