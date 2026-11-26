import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';

import type { AppConfig } from './config.js';
import { errorMiddleware } from './http/error-middleware.js';
import type { EmailProvider } from './ports/email-provider.js';
import type { ProductRepository } from './ports/product-repository.js';
import { categoriesRouter } from './routes/categories.js';
import { enquiriesRouter } from './routes/enquiries.js';
import { healthRouter } from './routes/health.js';
import { productsRouter } from './routes/products.js';
import { searchRouter } from './routes/search.js';
import { EnquiryService } from './services/enquiry-service.js';
import { ProductService } from './services/product-service.js';

export type AppDeps = {
  products: ProductRepository;
  email: EmailProvider;
  config: AppConfig;
};

export function createApp(deps: AppDeps): Express {
  const app = express();
  const products = new ProductService(
    deps.products,
    deps.config.featuredProductIds,
  );
  const enquiries = new EnquiryService(deps.products, deps.email, deps.config);

  app.use(helmet());
  app.use(cors({ origin: deps.config.corsOrigin }));
  app.use(express.json({ limit: '16kb' }));
  app.use('/api/health', healthRouter());
  app.use('/api/products', productsRouter(products));
  app.use('/api/categories', categoriesRouter(products));
  app.use('/api/search', searchRouter(products));
  app.use('/api/enquiries', enquiriesRouter(enquiries, deps.config));
  app.use(errorMiddleware);

  return app;
}
