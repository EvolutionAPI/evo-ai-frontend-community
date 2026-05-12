import { describe, it, expect } from 'vitest';
import { formatContactPhone } from './formatContactPhone';

describe('formatContactPhone', () => {
  it('returns null for empty input', () => {
    expect(formatContactPhone('')).toBeNull();
    expect(formatContactPhone(null)).toBeNull();
    expect(formatContactPhone(undefined)).toBeNull();
  });

  it('returns null when input has no digits', () => {
    expect(formatContactPhone('abc')).toBeNull();
    expect(formatContactPhone('---')).toBeNull();
  });

  it('formats a Brazilian mobile in E.164 with grouping (13 digits)', () => {
    expect(formatContactPhone('5511999999999')).toBe('+55 11 99999-9999');
    expect(formatContactPhone('+5511999999999')).toBe('+55 11 99999-9999');
  });

  it('formats a Brazilian landline in E.164 (12 digits)', () => {
    expect(formatContactPhone('551133334444')).toBe('+55 11 3333-4444');
    expect(formatContactPhone('+551133334444')).toBe('+55 11 3333-4444');
  });

  it('strips non-digit punctuation before formatting', () => {
    // Without country code the 11 digits fall through to the generic +digits
    // branch since we cannot safely infer BR vs. US from length alone.
    expect(formatContactPhone('(11) 99999-9999')).toBe('+11999999999');
    expect(formatContactPhone('+55 (11) 99999-9999')).toBe('+55 11 99999-9999');
  });

  it('falls back to a plain +digits string for non-BR numbers', () => {
    expect(formatContactPhone('12155551234')).toBe('+12155551234');
    expect(formatContactPhone('+12155551234')).toBe('+12155551234');
  });

  it('preserves the leading + when input is already prefixed', () => {
    expect(formatContactPhone('+5511999999999')).toBe('+55 11 99999-9999');
  });

  it('prepends + when missing', () => {
    expect(formatContactPhone('5511999999999')).toBe('+55 11 99999-9999');
    expect(formatContactPhone('12345')).toBe('+12345');
  });
});
