import { z } from 'zod';

import { ProductSchema } from './product.js';

export const CategorySchema = z.strictObject({
  name: z.string().min(1),
  slug: z.string().min(1),
});

export type Category = z.infer<typeof CategorySchema>;

export const CategoryListResponseSchema = z.strictObject({
  categories: z.array(CategorySchema),
});

export type CategoryListResponse = z.infer<typeof CategoryListResponseSchema>;

export const CategorySlugParamSchema = z.string().trim().min(1);

export const CategoryProductsResponseSchema = z.strictObject({
  category: z.string().min(1),
  topRated: z.array(ProductSchema).max(3),
  additional: z.array(ProductSchema),
});

export type CategoryProductsResponse = z.infer<typeof CategoryProductsResponseSchema>;
