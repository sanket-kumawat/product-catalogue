import { describe, expect, it } from 'vitest';

import { loadConfig } from './config.js';

describe('loadConfig', () => {
  it('applies the local defaults', () => {
    const config = loadConfig({});

    expect(config.port).toBe(3001);
    expect(config.corsOrigin).toBe('http://localhost:5173');
    expect(config.fakeStoreBaseUrl).toBe('https://fakestoreapi.com');
    expect(config.productCacheTtlMs).toBe(300_000);
    expect(config.featuredProductIds).toEqual([]);
    expect(config.smtpHost).toBe('localhost');
    expect(config.smtpPort).toBe(1025);
    expect(config.smtpSecure).toBe(false);
    expect(config.emailFrom).toBe('no-reply@product-catalogue.local');
    expect(config.salesInboxEmail).toBe('sales@product-catalogue.local');
    expect(config.enquiryRateLimitMax).toBe(10);
  });

  it('parses featured ids and ignores empty tokens', () => {
    const config = loadConfig({ FEATURED_PRODUCT_IDS: ' 2, , 3 ' });

    expect(config.featuredProductIds).toEqual([2, 3]);
  });

  it('rejects a featured id that is not a positive integer', () => {
    expect(() => loadConfig({ FEATURED_PRODUCT_IDS: '1,nope' })).toThrow(
      'Invalid FEATURED_PRODUCT_IDS entry "nope"',
    );
  });
});
