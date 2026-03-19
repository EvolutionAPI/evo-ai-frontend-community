import { describe, expect, it } from 'vitest';
import { getVisibleMessageContent, hasVisibleMessageContent } from './aiAssistanceMessage';

describe('aiAssistanceMessage', () => {
  it('returns false for empty rich text structures', () => {
    expect(hasVisibleMessageContent('<p></p>')).toBe(false);
    expect(hasVisibleMessageContent('<div><br></div>')).toBe(false);
    expect(hasVisibleMessageContent('<p>&nbsp;</p>')).toBe(false);
  });

  it('returns false for zero-width and non-breaking spaces', () => {
    expect(hasVisibleMessageContent('\u200B\uFEFF')).toBe(false);
    expect(hasVisibleMessageContent('\u00A0\u00A0')).toBe(false);
  });

  it('extracts visible text from html content', () => {
    expect(getVisibleMessageContent('<p>  Hello <strong>world</strong> </p>')).toBe('Hello world');
    expect(hasVisibleMessageContent('<p>Texto válido</p>')).toBe(true);
  });
});
