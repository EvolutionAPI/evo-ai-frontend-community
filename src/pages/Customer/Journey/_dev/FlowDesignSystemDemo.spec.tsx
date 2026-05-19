import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import FlowDesignSystemDemo from './FlowDesignSystemDemo';

describe('FlowDesignSystemDemo', () => {
  it('renders without throwing', () => {
    const { container } = render(<FlowDesignSystemDemo />);
    expect(container.firstChild).not.toBeNull();
  });

  it('has no structural a11y violations under axe-core', async () => {
    const { container } = render(<FlowDesignSystemDemo />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('exposes a section for each token surface (visual reference completeness)', () => {
    const { container } = render(<FlowDesignSystemDemo />);
    const sectionHeadings = [
      'FlowNode variants',
      'FlowCategoryBadge variants',
      'FlowFeedbackBanner variants',
      'Node category token swatches',
      'Canvas chrome',
      'Palette chrome',
      'Panel chrome — reference for EVO-1264',
      'Edge colors',
    ];
    for (const heading of sectionHeadings) {
      expect(container.textContent ?? '').toContain(heading);
    }
  });
});
