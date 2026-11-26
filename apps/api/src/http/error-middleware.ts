import type { ApiErrorBody } from '@product-catalogue/shared';
import type { ErrorRequestHandler } from 'express';
import { flattenError, ZodError } from 'zod';

import { AppError } from '../services/errors.js';

export const errorMiddleware: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next,
) => {
  if (error instanceof AppError) {
    const body: ApiErrorBody = {
      error: {
        code: error.code,
        message: error.message,
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
    };
    res.status(error.status).json(body);
    return;
  }

  if (error instanceof ZodError) {
    const body: ApiErrorBody = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: flattenError(error),
      },
    };
    res.status(400).json(body);
    return;
  }

  console.error(error);
  const body: ApiErrorBody = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Unexpected error',
    },
  };
  res.status(500).json(body);
};
