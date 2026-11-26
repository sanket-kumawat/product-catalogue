import type { Product } from '@product-catalogue/shared';

import type { FakeStoreProduct } from './schema.js';

export function mapFakeStoreProduct(raw: FakeStoreProduct): Product {
  return {
    id: raw.id,
    title: raw.title,
    price: raw.price,
    description: raw.description,
    category: raw.category,
    imageUrl: raw.image,
    rating: raw.rating.rate,
    ratingCount: raw.rating.count,
  };
}
