import type { Product } from '@product-catalogue/shared';

export function testProduct(
  overrides: Partial<Product> & Pick<Product, 'id' | 'title'>,
): Product {
  return {
    price: 12.5,
    description: 'Soft cotton',
    category: "men's clothing",
    imageUrl: 'https://example.com/product.jpg',
    rating: 4.2,
    ratingCount: 20,
    ...overrides,
  };
}
