import { FakeStoreProductRepository } from './adapters/fake-store/fake-store-product-repository.js';
import { SmtpEmailProvider } from './adapters/smtp/smtp-email-provider.js';
import type { AppConfig } from './config.js';
import type { EmailProvider } from './ports/email-provider.js';
import type { ProductRepository } from './ports/product-repository.js';

export function createProductRepository(config: AppConfig): ProductRepository {
  return new FakeStoreProductRepository({
    baseUrl: config.fakeStoreBaseUrl,
    ttlMs: config.productCacheTtlMs,
  });
}

export function createEmailProvider(config: AppConfig): EmailProvider {
  return new SmtpEmailProvider(config);
}
