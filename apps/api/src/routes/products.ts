import { ProductIdParamSchema } from '@product-catalogue/shared';
import { Router } from 'express';
import { flattenError } from 'zod';

import { asyncHandler } from '../http/async-handler.js';
import { AppError } from '../services/errors.js';
import type { ProductService } from '../services/product-service.js';

export function productsRouter(service: ProductService): Router {
  const router = Router();

  router.get(
    '/featured',
    asyncHandler(async (_req, res) => {
      const products = await service.getFeatured();
      res.json({ products });
    }),
  );

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const id: unknown = req.params['id'];
      const parsed = ProductIdParamSchema.safeParse(id);
      if (!parsed.success) {
        throw new AppError(
          400,
          'VALIDATION_ERROR',
          'Invalid product id',
          flattenError(parsed.error),
        );
      }
      const product = await service.getProduct(parsed.data);
      res.json({ product });
    }),
  );

  return router;
}
