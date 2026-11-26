import { describe, expect, it } from 'vitest';

import { ProductSchema } from './product.js';

const product = {
  id: 1,
  title: 'Mens Cotton Jacket',
  price: 55.99,
  description: 'Great outerwear',
  category: "men's clothing",
  imageUrl: 'https://fakestoreapi.com/img/jacket.jpg',
  rating: 4.7,
  ratingCount: 500,
};

describe('ProductSchema', () => {
  it('accepts the internal product shape', () => {
    expect(ProductSchema.parse(product)).toEqual(product);
  });

  it('rejects unknown keys such as an upstream rating.rate leak', () => {
    const parsed = ProductSchema.safeParse({ ...product, rate: 4.7 });

    expect(parsed.success).toBe(false);
  });

  it('rejects an upstream rating object', () => {
    const parsed = ProductSchema.safeParse({
      ...product,
      rating: { rate: 4.7, count: 500 },
    });

    expect(parsed.success).toBe(false);
  });
});
