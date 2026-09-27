import { describe, it, expect } from 'vitest';
import { parseJsonArray, toPositiveInt, isValidDateString } from '../validate';

describe('parseJsonArray', () => {
  it('parses a JSON array', () => {
    expect(parseJsonArray('[1,2,3]')).toEqual({ ok: true, value: [1, 2, 3] });
  });

  it('returns empty array for empty input', () => {
    expect(parseJsonArray('')).toEqual({ ok: true, value: [] });
    expect(parseJsonArray(null)).toEqual({ ok: true, value: [] });
  });

  it('rejects invalid JSON', () => {
    const result = parseJsonArray('{invalid');
    expect(result.ok).toBe(false);
  });

  it('rejects non-array JSON', () => {
    const result = parseJsonArray('{"a":1}');
    expect(result.ok).toBe(false);
  });
});

describe('toPositiveInt', () => {
  it('accepts positive integers', () => {
    expect(toPositiveInt('5')).toBe(5);
    expect(toPositiveInt(12)).toBe(12);
  });

  it('rejects zero, negative, and non-numeric', () => {
    expect(toPositiveInt(0)).toBeNull();
    expect(toPositiveInt('-3')).toBeNull();
    expect(toPositiveInt('abc')).toBeNull();
    expect(toPositiveInt(null)).toBeNull();
  });
});

describe('isValidDateString', () => {
  it('accepts YYYY-MM-DD', () => {
    expect(isValidDateString('2026-09-27')).toBe(true);
  });

  it('rejects other formats', () => {
    expect(isValidDateString('27-09-2026')).toBe(false);
    expect(isValidDateString('2026/09/27')).toBe(false);
    expect(isValidDateString('')).toBe(false);
  });
});
