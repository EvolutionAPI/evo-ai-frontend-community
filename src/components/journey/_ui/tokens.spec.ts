import { describe, expect, it } from 'vitest';
import { flowTokens } from './tokens';

describe('flowTokens', () => {
  it('exposes node category branches with bg/fg/border CSS var refs', () => {
    for (const category of ['trigger', 'condition', 'control', 'exit'] as const) {
      const tokens = flowTokens.node[category];
      expect(tokens.bg).toBe(`var(--color-flow-node-${category}-bg)`);
      expect(tokens.fg).toBe(`var(--color-flow-node-${category}-fg)`);
      expect(tokens.border).toBe(`var(--color-flow-node-${category}-border)`);
    }
  });

  it('exposes action subtype branches with bg/fg/border CSS var refs', () => {
    for (const subtype of ['message', 'webhook', 'label', 'pipeline'] as const) {
      const tokens = flowTokens.node.action[subtype];
      expect(tokens.bg).toBe(`var(--color-flow-node-action-${subtype}-bg)`);
      expect(tokens.fg).toBe(`var(--color-flow-node-action-${subtype}-fg)`);
      expect(tokens.border).toBe(`var(--color-flow-node-action-${subtype}-border)`);
    }
  });

  it('exposes canvas, palette, panel, edge, feedback tokens as CSS var refs', () => {
    expect(flowTokens.canvas.bg).toBe('var(--color-flow-canvas-bg)');
    expect(flowTokens.canvas.grid).toBe('var(--color-flow-canvas-grid)');
    expect(flowTokens.canvas.gridStrong).toBe('var(--color-flow-canvas-grid-strong)');

    expect(flowTokens.palette.bg).toBe('var(--color-flow-palette-bg)');
    expect(flowTokens.palette.surface).toBe('var(--color-flow-palette-surface)');
    expect(flowTokens.palette.divider).toBe('var(--color-flow-palette-divider)');

    expect(flowTokens.panel.bg).toBe('var(--color-flow-panel-bg)');
    expect(flowTokens.panel.headerBg).toBe('var(--color-flow-panel-header-bg)');
    expect(flowTokens.panel.divider).toBe('var(--color-flow-panel-divider)');

    expect(flowTokens.edge.default).toBe('var(--color-flow-edge-default)');
    expect(flowTokens.edge.active).toBe('var(--color-flow-edge-active)');
    expect(flowTokens.edge.error).toBe('var(--color-flow-edge-error)');

    for (const variant of ['info', 'warn', 'error', 'success'] as const) {
      expect(flowTokens.feedback[variant].bg).toBe(`var(--color-flow-feedback-${variant}-bg)`);
      expect(flowTokens.feedback[variant].fg).toBe(`var(--color-flow-feedback-${variant}-fg)`);
      expect(flowTokens.feedback[variant].border).toBe(`var(--color-flow-feedback-${variant}-border)`);
    }
  });
});
