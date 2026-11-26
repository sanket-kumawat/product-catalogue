import { z } from 'zod';

export const FakeStoreProductSchema = z.object({
  id: z.number().int().positive(),
  title: z.string(),
  price: z.number(),
  description: z.string(),
  category: z.string(),
  image: z.url(),
  rating: z.object({
    rate: z.number(),
    count: z.number().int().nonnegative(),
  }),
});

export const FakeStoreProductListSchema = z.array(FakeStoreProductSchema);

export type FakeStoreProduct = z.infer<typeof FakeStoreProductSchema>;
