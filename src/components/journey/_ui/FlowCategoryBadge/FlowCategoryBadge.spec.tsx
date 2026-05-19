import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FlowCategoryBadge } from './FlowCategoryBadge';
import { clearFlowToken, injectFlowToken, readFlowToken } from '../test-utils';

describe('FlowCategoryBadge', () => {
  it.each(['trigger', 'condition', 'control', 'exit'] as const)(
    'renders variant %s with the matching token class set',
    (variant) => {
      render(
        <FlowCategoryBadge variant={variant} data-testid="badge">
          {variant}
        </FlowCategoryBadge>,
      );
      const badge = screen.getByTestId('badge');
      expect(badge.className).toContain(`flow-node-${variant}-bg`);
      expect(badge.className).toContain(`flow-node-${variant}-fg`);
      expect(badge.className).toContain(`flow-node-${variant}-border`);
    },
  );

  it.each(['message', 'webhook', 'label', 'pipeline'] as const)(
    'renders action subtype %s with action-* token classes',
    (subtype) => {
      render(
        <FlowCategoryBadge variant="action" subtype={subtype} data-testid="badge">
          action · {subtype}
        </FlowCategoryBadge>,
      );
      const badge = screen.getByTestId('badge');
      expect(badge.className).toContain(`flow-node-action-${subtype}-bg`);
      expect(badge.className).toContain(`flow-node-action-${subtype}-fg`);
      expect(badge.className).toContain(`flow-node-action-${subtype}-border`);
    },
  );

  it('renders its children content', () => {
    render(<FlowCategoryBadge variant="trigger">Trigger</FlowCategoryBadge>);
    expect(screen.queryByText('Trigger')).not.toBeNull();
  });

  describe('CSS variable surface (computed style)', () => {
    const TOKEN = 'flow-node-action-webhook-bg';
    afterEach(() => clearFlowToken(TOKEN));

    it('renders into a document tree that exposes --color-flow-node-action-webhook-bg', () => {
      const expected = 'oklch(0.22 0.05 305)';
      injectFlowToken(TOKEN, expected);
      const { container, getByTestId } = render(
        <FlowCategoryBadge variant="action" subtype="webhook" data-testid="badge">
          webhook
        </FlowCategoryBadge>,
      );
      expect(readFlowToken(TOKEN)).toBe(expected);
      expect(container.contains(getByTestId('badge'))).toBe(true);
    });
  });
});
