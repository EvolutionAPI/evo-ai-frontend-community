import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FlowNode } from './FlowNode';
import { clearFlowToken, injectFlowToken, readFlowToken } from '../test-utils';

describe('FlowNode', () => {
  it.each(['trigger', 'condition', 'control', 'exit'] as const)(
    'renders variant %s with the matching token class set',
    (variant) => {
      render(<FlowNode variant={variant} data-testid="node" />);
      const node = screen.getByTestId('node');
      expect(node.className).toContain(`flow-node-${variant}-bg`);
      expect(node.className).toContain(`flow-node-${variant}-fg`);
      expect(node.className).toContain(`flow-node-${variant}-border`);
    },
  );

  it.each(['message', 'webhook', 'label', 'pipeline'] as const)(
    'renders action subtype %s with action-* token classes',
    (subtype) => {
      render(<FlowNode variant="action" subtype={subtype} data-testid="node" />);
      const node = screen.getByTestId('node');
      expect(node.className).toContain(`flow-node-action-${subtype}-bg`);
      expect(node.className).toContain(`flow-node-action-${subtype}-fg`);
      expect(node.className).toContain(`flow-node-action-${subtype}-border`);
    },
  );

  it('appends consumer className after CVA classes for overrides', () => {
    render(<FlowNode variant="trigger" className="extra-class" data-testid="node" />);
    expect(screen.getByTestId('node').className).toContain('extra-class');
  });

  describe('CSS variable surface (computed style)', () => {
    const TOKEN = 'flow-node-trigger-bg';
    afterEach(() => clearFlowToken(TOKEN));

    it('renders into a document tree that exposes --color-flow-node-trigger-bg', () => {
      const expected = 'oklch(0.95 0.05 150)';
      injectFlowToken(TOKEN, expected);
      const { container, getByTestId } = render(
        <FlowNode variant="trigger" data-testid="node" />,
      );
      expect(readFlowToken(TOKEN)).toBe(expected);
      expect(container.contains(getByTestId('node'))).toBe(true);
    });
  });
});
