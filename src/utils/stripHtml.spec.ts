import { describe, it, expect } from 'vitest';
import { stripHtml } from './stripHtml';

describe('stripHtml', () => {
  it('returns empty string for empty input', () => {
    expect(stripHtml('')).toBe('');
  });

  it('passes plain text through unchanged', () => {
    expect(stripHtml('hello world')).toBe('hello world');
  });

  it('strips simple tags', () => {
    expect(stripHtml('<p>hello</p>')).toBe('hello');
  });

  it('strips nested tags and collapses whitespace across blocks', () => {
    expect(stripHtml('<p><strong>bold</strong></p><p>next</p>')).toBe('bold next');
  });

  it('decodes html entities', () => {
    expect(stripHtml('foo &amp; &lt;bar&gt; &nbsp;baz')).toBe('foo & <bar> baz');
  });

  it('handles unclosed tags gracefully', () => {
    expect(stripHtml('<p>unfinished')).toBe('unfinished');
  });

  it('returns empty string when content is whitespace-only after stripping', () => {
    expect(stripHtml('<p>&nbsp;&nbsp;</p>')).toBe('');
  });

  it('does not execute scripts and produces empty text', () => {
    expect(stripHtml('<script>alert(1)</script>')).toBe('');
  });

  it('does not fire onerror handlers from img tags', () => {
    expect(stripHtml('<img src=x onerror="alert(1)">')).toBe('');
  });

  it('preserves emoji and unicode', () => {
    expect(stripHtml('<p>olá 🎉 mundo</p>')).toBe('olá 🎉 mundo');
  });

  it('flattens line breaks into single spaces', () => {
    expect(stripHtml('line one<br>line two<br/>line three')).toBe('line one line two line three');
  });
});
