import { CategorySlugParamSchema } from '@product-catalogue/shared';
import { Router } from 'express';
import { flattenError } from 'zod';

import { asyncHandler } from '../http/async-handler.js';
import { AppError } from '../services/errors.js';
import type { ProductService } from '../services/product-service.js';

export function categoriesRouter(service: ProductService): Router {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (_req, res) => {
      const categories = await service.listCategories();
      res.json({ categories });
    }),
  );

  router.get(
    '/:slug',
    asyncHandler(async (req, res) => {
      const slug: unknown = req.params['slug'];
      const parsed = CategorySlugParamSchema.safeParse(slug);
      if (!parsed.success) {
        throw new AppError(
          400,
          'VALIDATION_ERROR',
          'Invalid category',
          flattenError(parsed.error),
        );
      }
      const body = await service.getCategory(parsed.data);
      res.json(body);
    }),
  );

  return router;
}
