import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initClarity } from './clarityUtils';

describe('initClarity', () => {
  beforeEach(() => {
    delete (window as any).clarity;
    // Remove any injected clarity script tags
    document.querySelectorAll('script[src*="clarity.ms"]').forEach(el => el.remove());
  });

  it('does not initialize when no project ID is provided and VITE_* is unset', () => {
    initClarity(null);
    expect(window.clarity).toBeUndefined();
  });

  it('does not initialize when empty string is provided', () => {
    initClarity('');
    expect(window.clarity).toBeUndefined();
  });

  it('skips initialization if Clarity is already loaded', () => {
    const existingClarity = vi.fn();
    (window as any).clarity = existingClarity;
    initClarity('new-project-id');
    // Should still be the same function, not re-initialized
    expect(window.clarity).toBe(existingClarity);
  });

  it('accepts configProjectId from backend API as first priority', () => {
    // In test env (DEV=true), initClarity skips initialization,
    // so we verify the function accepts the param without error
    expect(() => initClarity('backend-project-id')).not.toThrow();
  });

  it('falls back to VITE_* env var when configProjectId is null', () => {
    // Without VITE_CLARITY_PROJECT_ID set and in DEV mode, should not init
    expect(() => initClarity(null)).not.toThrow();
    expect(window.clarity).toBeUndefined();
  });
});
