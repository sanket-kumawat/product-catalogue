import type { ApiErrorCode } from '@product-catalogue/shared';

export class AppError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly details?: unknown;

  constructor(status: number, code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    if (details !== undefined) {
      this.details = details;
    }
  }
}

export function notFound(message: string): AppError {
  return new AppError(404, 'NOT_FOUND', message);
}

export function upstreamError(message = 'Product source returned an unexpected error'): AppError {
  return new AppError(502, 'UPSTREAM_ERROR', message);
}

export function upstreamUnavailable(message = 'Product source is unavailable'): AppError {
  return new AppError(503, 'UPSTREAM_UNAVAILABLE', message);
}
