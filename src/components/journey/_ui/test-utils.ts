/**
 * Helpers shared by bridge spec files to verify the `--color-flow-*`
 * CSS custom property surface is reachable from a rendered React tree.
 *
 * jsdom limitations to be honest about:
 *   - jsdom does NOT compile Tailwind utility classes into CSS rules,
 *     so `getComputedStyle(el).backgroundColor` on `bg-flow-node-*`
 *     returns nothing in jsdom.
 *   - jsdom does NOT fully propagate CSS variables registered on
 *     `:root` to descendant elements via `getComputedStyle`. The var
 *     is accessible only on `document.documentElement`.
 *
 * What these specs CAN prove (defensible signal in jsdom):
 *   - The bridge component renders into the document body (so it WOULD
 *     receive the `:root` cascade in a real browser).
 *   - The injected token name matches what the bridge's CVA references
 *     via Tailwind utilities (catches rename drift in the fixture).
 *
 * Full WCAG / runtime resolution validation lives in:
 *   - `tokens.contrast.spec.ts` — parses globals.css directly, asserts
 *     WCAG 2.1 AA ratios using colorjs.io.
 *   - Storybook a11y addon — real browser, real cascade, real contrast.
 */
export function injectFlowToken(tokenName: string, value: string): void {
  document.documentElement.style.setProperty(`--color-${tokenName}`, value);
}

export function clearFlowToken(tokenName: string): void {
  document.documentElement.style.removeProperty(`--color-${tokenName}`);
}

export function readFlowToken(tokenName: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-${tokenName}`)
    .trim();
}
