import express, { type Express } from 'express';

import type { AppConfig } from './config.js';
import { errorMiddleware } from './http/error-middleware.js';
import type { ProductRepository } from './ports/product-repository.js';
import { categoriesRouter } from './routes/categories.js';
import { healthRouter } from './routes/health.js';
import { productsRouter } from './routes/products.js';
import { searchRouter } from './routes/search.js';
import { ProductService } from './services/product-service.js';

export type AppDeps = {
  products: ProductRepository;
  config: AppConfig;
};

export function createApp(deps: AppDeps): Express {
  const app = express();
  const service = new ProductService(
    deps.products,
    deps.config.featuredProductIds,
  );

  app.use('/api/health', healthRouter());
  app.use('/api/products', productsRouter(service));
  app.use('/api/categories', categoriesRouter(service));
  app.use('/api/search', searchRouter(service));
  app.use(errorMiddleware);

  return app;
}
