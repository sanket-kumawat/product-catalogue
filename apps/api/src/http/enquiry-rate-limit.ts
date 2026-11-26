import type { ApiErrorBody } from '@product-catalogue/shared';
import rateLimit from 'express-rate-limit';

import type { AppConfig } from '../config.js';

export function enquiryRateLimit(
  config: Pick<AppConfig, 'enquiryRateLimitWindowMs' | 'enquiryRateLimitMax'>,
) {
  return rateLimit({
    windowMs: config.enquiryRateLimitWindowMs,
    limit: config.enquiryRateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      const body: ApiErrorBody = {
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many enquiries. Try again later.',
        },
      };
      res.status(429).json(body);
    },
  });
}
