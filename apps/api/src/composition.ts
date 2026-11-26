import { FakeStoreProductRepository } from './adapters/fake-store/fake-store-product-repository.js';
import type { AppConfig } from './config.js';
import type { ProductRepository } from './ports/product-repository.js';

export function createProductRepository(config: AppConfig): ProductRepository {
  return new FakeStoreProductRepository({
    baseUrl: config.fakeStoreBaseUrl,
    ttlMs: config.productCacheTtlMs,
  });
}
