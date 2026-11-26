import { z } from 'zod';

import { ProductSchema } from './product.js';

export const SearchQuerySchema = z.strictObject({
  q: z.string().trim().min(1).max(200),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export const SearchResponseSchema = z.strictObject({
  query: z.string(),
  products: z.array(ProductSchema),
});

export type SearchResponse = z.infer<typeof SearchResponseSchema>;
