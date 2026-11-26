import {
  EnquiryBodySchema,
  EnquirySuccessResponseSchema,
} from '@product-catalogue/shared';
import { Router } from 'express';
import { flattenError } from 'zod';

import type { AppConfig } from '../config.js';
import { asyncHandler } from '../http/async-handler.js';
import { enquiryRateLimit } from '../http/enquiry-rate-limit.js';
import type { EnquiryService } from '../services/enquiry-service.js';
import { AppError } from '../services/errors.js';

export function enquiriesRouter(
  service: EnquiryService,
  config: AppConfig,
): Router {
  const router = Router();

  router.post(
    '/',
    enquiryRateLimit(config),
    asyncHandler(async (req, res) => {
      const parsed = EnquiryBodySchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(
          400,
          'VALIDATION_ERROR',
          'Invalid enquiry',
          flattenError(parsed.error),
        );
      }
      await service.submit(parsed.data);
      const body = EnquirySuccessResponseSchema.parse({ message: 'Thank you' });
      res.status(201).json(body);
    }),
  );

  return router;
}
