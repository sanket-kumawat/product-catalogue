import { z } from 'zod';

export const ProductSchema = z.strictObject({
  id: z.number().int().positive(),
  title: z.string(),
  price: z.number(),
  description: z.string(),
  category: z.string(),
  imageUrl: z.url(),
  rating: z.number(),
  ratingCount: z.number().int().nonnegative(),
});

export type Product = z.infer<typeof ProductSchema>;

export const ProductIdSchema = z.number().int().positive();

export const ProductIdParamSchema = z.coerce.number().int().positive();

export const FeaturedProductsResponseSchema = z.strictObject({
  products: z.array(ProductSchema).max(5),
});

export type FeaturedProductsResponse = z.infer<typeof FeaturedProductsResponseSchema>;

export const ProductResponseSchema = z.strictObject({
  product: ProductSchema,
});

export type ProductResponse = z.infer<typeof ProductResponseSchema>;
