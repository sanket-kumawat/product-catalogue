import type { Product } from '@product-catalogue/shared';

export function makeProduct(
  overrides: Partial<Product> &
    Pick<Product, 'id' | 'title' | 'category' | 'rating' | 'ratingCount'>,
): Product {
  return {
    price: 10,
    description: 'A product',
    imageUrl: `https://example.com/${overrides.id}.jpg`,
    ...overrides,
  };
}
