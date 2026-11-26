import { SearchQuerySchema } from '@product-catalogue/shared';
import { Router } from 'express';
import { flattenError } from 'zod';

import { asyncHandler } from '../http/async-handler.js';
import { AppError } from '../services/errors.js';
import type { ProductService } from '../services/product-service.js';

export function searchRouter(service: ProductService): Router {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const query: unknown = req.query['q'];
      const parsed = SearchQuerySchema.safeParse({ q: query });
      if (!parsed.success) {
        throw new AppError(
          400,
          'VALIDATION_ERROR',
          'Invalid search query',
          flattenError(parsed.error),
        );
      }
      const products = await service.search(parsed.data.q);
      res.json({ query: parsed.data.q, products });
    }),
  );

  return router;
}
