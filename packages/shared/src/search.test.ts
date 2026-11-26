import { describe, expect, it } from 'vitest';

import { SearchQuerySchema } from './search.js';

describe('SearchQuerySchema', () => {
  it('trims a search term and accepts one character', () => {
    expect(SearchQuerySchema.parse({ q: ' a ' })).toEqual({ q: 'a' });
  });

  it('rejects an empty search term', () => {
    expect(SearchQuerySchema.safeParse({ q: '' }).success).toBe(false);
  });

  it('rejects a term that is empty after trimming', () => {
    expect(SearchQuerySchema.safeParse({ q: '   ' }).success).toBe(false);
  });

  it('rejects a term longer than 200 characters', () => {
    expect(SearchQuerySchema.safeParse({ q: 'a'.repeat(201) }).success).toBe(false);
  });
});
