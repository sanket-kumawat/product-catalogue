import {
  CategoryProductsResponseSchema,
  FeaturedProductsResponseSchema,
  ProductResponseSchema,
  SearchResponseSchema,
} from '@product-catalogue/shared';
import { queryOptions } from '@tanstack/react-query';

import { apiGet } from '@/shared/api/client';

export function featuredProductsQuery() {
  return queryOptions({
    queryKey: ['products', 'featured'],
    queryFn: async () =>
      FeaturedProductsResponseSchema.parse(await apiGet('/products/featured')),
  });
}

export function productDetailQuery(productId: number) {
  return queryOptions({
    queryKey: ['products', productId],
    queryFn: async () =>
      ProductResponseSchema.parse(await apiGet(`/products/${productId}`)),
  });
}

export function categoryProductsQuery(slug: string) {
  return queryOptions({
    queryKey: ['categories', slug],
    queryFn: async () =>
      CategoryProductsResponseSchema.parse(
        await apiGet(`/categories/${encodeURIComponent(slug)}`),
      ),
  });
}

export function searchProductsQuery(query: string) {
  return queryOptions({
    queryKey: ['search', query],
    queryFn: async () =>
      SearchResponseSchema.parse(
        await apiGet(`/search?q=${encodeURIComponent(query)}`),
      ),
  });
}
