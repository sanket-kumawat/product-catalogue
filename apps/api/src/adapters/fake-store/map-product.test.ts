import { describe, expect, it } from 'vitest';

import { fakeStoreProductsJson } from './fixture.js';
import { mapFakeStoreProduct } from './map-product.js';
import { FakeStoreProductListSchema } from './schema.js';

describe('mapFakeStoreProduct', () => {
  const products = FakeStoreProductListSchema.parse(fakeStoreProductsJson);

  it('maps rating.rate and rating.count onto the internal product', () => {
    const jacket = products[0];
    if (!jacket) {
      throw new Error('fixture missing jacket');
    }

    const mapped = mapFakeStoreProduct(jacket);

    expect(mapped).toMatchObject({
      id: 1,
      category: "men's clothing",
      imageUrl: 'https://fakestoreapi.com/img/jacket.jpg',
      rating: 4.7,
      ratingCount: 500,
    });
    expect(Object.keys(mapped)).not.toContain('rate');
    expect(JSON.stringify(mapped)).not.toContain('"rate"');
  });

  it('keeps a rating tie as equal ratings with different counts', () => {
    const [jacket, shirt, ring] = products;
    if (!jacket || !shirt || !ring) {
      throw new Error('fixture missing products');
    }

    const mapped = [jacket, shirt, ring].map(mapFakeStoreProduct);

    expect(mapped[0]?.rating).toBe(mapped[1]?.rating);
    expect(mapped[0]?.ratingCount).toBeGreaterThan(mapped[1]?.ratingCount ?? 0);
    expect(mapped.map((product) => product.category)).toEqual([
      "men's clothing",
      "men's clothing",
      'jewelery',
    ]);
  });
});
