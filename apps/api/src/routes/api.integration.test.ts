import {
  ApiErrorSchema,
  CategoryListResponseSchema,
  CategoryProductsResponseSchema,
  EnquirySuccessResponseSchema,
  FeaturedProductsResponseSchema,
  ProductResponseSchema,
  SearchResponseSchema,
} from '@product-catalogue/shared';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FakeStoreProductRepository } from '../adapters/fake-store/fake-store-product-repository.js';
import { createApp } from '../app.js';
import { loadConfig } from '../config.js';
import type { EmailMessage, EmailProvider } from '../ports/email-provider.js';
import type { ProductRepository } from '../ports/product-repository.js';
import { InMemoryProductRepository } from '../test/in-memory-product-repository.js';
import { makeProduct } from '../test/products.js';

const catalog = [
  makeProduct({
    id: 1,
    title: 'Alpha Shirt',
    description: 'cotton shirt',
    category: "men's clothing",
    rating: 3,
    ratingCount: 1,
  }),
  makeProduct({
    id: 2,
    title: 'Beta Coat',
    description: 'wool coat',
    category: "men's clothing",
    rating: 5,
    ratingCount: 2,
  }),
  makeProduct({
    id: 3,
    title: 'Gamma Tie',
    description: 'silk tie',
    category: "men's clothing",
    rating: 5,
    ratingCount: 2,
  }),
  makeProduct({
    id: 4,
    title: 'Delta Hat',
    description: 'felt hat',
    category: "men's clothing",
    rating: 4,
    ratingCount: 10,
  }),
  makeProduct({
    id: 5,
    title: 'Epsilon Ring',
    description: 'shiny gem',
    category: 'jewelery',
    rating: 4,
    ratingCount: 1,
  }),
  makeProduct({
    id: 6,
    title: 'Zeta Lamp',
    description: 'brass lamp',
    category: 'jewelery',
    rating: 1,
    ratingCount: 1,
  }),
];

const discardEmail: EmailProvider = {
  async send() {},
};

function appWith(
  featuredProductIds = '',
  rateLimitMax = '10',
  email: EmailProvider = discardEmail,
) {
  return createApp({
    products: new InMemoryProductRepository(catalog),
    email,
    config: loadConfig({
      FEATURED_PRODUCT_IDS: featuredProductIds,
      ENQUIRY_RATE_LIMIT_MAX: rateLimitMax,
    }),
  });
}

describe('product read API', () => {
  it('returns health, featured products, a category split, and search hits', async () => {
    const app = appWith('6,99,1');

    const health = await request(app).get('/api/health');
    expect(health.status).toBe(200);
    expect(health.body).toEqual({ status: 'ok' });

    const featured = await request(app).get('/api/products/featured');
    expect(featured.status).toBe(200);
    expect(
      FeaturedProductsResponseSchema.parse(featured.body).products.map(
        (product) => product.id,
      ),
    ).toEqual([6, 1, 2, 3, 4]);

    const categories = await request(app).get('/api/categories');
    expect(categories.status).toBe(200);
    expect(
      CategoryListResponseSchema.parse(categories.body).categories.map(
        (category) => category.slug,
      ),
    ).toEqual(['jewelery', "men's clothing"]);

    const category = await request(app).get(
      `/api/categories/${encodeURIComponent("men's clothing")}`,
    );
    const categoryBody = CategoryProductsResponseSchema.parse(category.body);
    expect(category.status).toBe(200);
    expect(categoryBody.topRated.map((product) => product.id)).toEqual([
      2, 3, 4,
    ]);
    expect(categoryBody.additional.map((product) => product.id)).toEqual([1]);

    const product = await request(app).get('/api/products/5');
    expect(product.status).toBe(200);
    expect(ProductResponseSchema.parse(product.body).product.title).toBe(
      'Epsilon Ring',
    );

    const search = await request(app).get('/api/search').query({ q: ' GEM ' });
    const searchBody = SearchResponseSchema.parse(search.body);
    expect(search.status).toBe(200);
    expect(searchBody.query).toBe('GEM');
    expect(searchBody.products.map((item) => item.id)).toEqual([5]);
  });

  it('returns 400 for a bad product id and a bad search query', async () => {
    const app = appWith();

    const badId = await request(app).get('/api/products/nope');
    expect(badId.status).toBe(400);
    expect(ApiErrorSchema.parse(badId.body).error).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Invalid product id',
    });
    expect(badId.body.error.details).toBeDefined();
    expect(JSON.stringify(badId.body)).not.toContain('stack');

    const missingQuery = await request(app).get('/api/search');
    expect(missingQuery.status).toBe(400);
    expect(ApiErrorSchema.parse(missingQuery.body).error.code).toBe(
      'VALIDATION_ERROR',
    );

    const blankQuery = await request(app)
      .get('/api/search')
      .query({ q: '   ' });
    expect(blankQuery.status).toBe(400);
    expect(ApiErrorSchema.parse(blankQuery.body).error.code).toBe(
      'VALIDATION_ERROR',
    );
  });

  it('returns 404 for a missing product and a missing category', async () => {
    const app = appWith();

    const missingProduct = await request(app).get('/api/products/999');
    expect(missingProduct.status).toBe(404);
    expect(ApiErrorSchema.parse(missingProduct.body).error).toEqual({
      code: 'NOT_FOUND',
      message: 'Product 999 not found',
    });

    const missingCategory = await request(app).get(
      '/api/categories/no-such-category',
    );
    expect(missingCategory.status).toBe(404);
    expect(ApiErrorSchema.parse(missingCategory.body).error.code).toBe(
      'NOT_FOUND',
    );
  });

  it('hides unexpected error details', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const products: ProductRepository = {
      async listProducts() {
        throw new Error('boom secret');
      },
      async getProductById() {
        return null;
      },
    };
    const app = createApp({
      products,
      email: discardEmail,
      config: loadConfig({}),
    });

    const response = await request(app).get('/api/products/featured');

    expect(response.status).toBe(500);
    expect(ApiErrorSchema.parse(response.body)).toEqual({
      error: { code: 'INTERNAL_ERROR', message: 'Unexpected error' },
    });
    expect(JSON.stringify(response.body)).not.toContain('boom secret');
    errorSpy.mockRestore();
  });

  it('returns 503 when the product source is unavailable', async () => {
    const products = new FakeStoreProductRepository({
      baseUrl: 'https://fakestoreapi.com',
      ttlMs: 300_000,
      fetchFn: async () => {
        throw new TypeError('network down');
      },
    });
    const app = createApp({
      products,
      email: discardEmail,
      config: loadConfig({}),
    });

    const response = await request(app).get('/api/products/featured');

    expect(response.status).toBe(503);
    expect(ApiErrorSchema.parse(response.body)).toEqual({
      error: {
        code: 'UPSTREAM_UNAVAILABLE',
        message: 'Product source is unavailable',
      },
    });
    expect(JSON.stringify(response.body)).not.toContain('stack');
    expect(JSON.stringify(response.body)).not.toContain('network down');
  });
});

describe('POST /api/enquiries', () => {
  const validEnquiry = {
    productId: 1,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    message: 'I would like this jacket.',
  };

  it('returns 201 and sends one email for a real product', async () => {
    const sent: EmailMessage[] = [];
    const email: EmailProvider = {
      async send(message) {
        sent.push(message);
      },
    };
    const app = appWith('', '10', email);

    const response = await request(app)
      .post('/api/enquiries')
      .send(validEnquiry);

    expect(response.status).toBe(201);
    expect(EnquirySuccessResponseSchema.parse(response.body)).toEqual({
      message: 'Thank you',
    });
    expect(sent).toHaveLength(1);
    expect(sent[0]).toMatchObject({
      to: 'sales@product-catalogue.local',
      from: 'no-reply@product-catalogue.local',
      replyTo: 'ada@example.com',
      subject: 'Enquiry: Alpha Shirt',
    });
  });

  it('returns 400 for an invalid enquiry and 404 without sending when the product is missing', async () => {
    const sent: EmailMessage[] = [];
    const email: EmailProvider = {
      async send(message) {
        sent.push(message);
      },
    };
    const app = appWith('', '10', email);

    const invalid = await request(app)
      .post('/api/enquiries')
      .send({ productId: 1 });
    expect(invalid.status).toBe(400);
    expect(ApiErrorSchema.parse(invalid.body).error).toMatchObject({
      code: 'VALIDATION_ERROR',
      message: 'Invalid enquiry',
    });
    expect(invalid.body.error.details).toBeDefined();

    const missing = await request(app)
      .post('/api/enquiries')
      .send({ ...validEnquiry, productId: 999 });
    expect(missing.status).toBe(404);
    expect(ApiErrorSchema.parse(missing.body).error).toEqual({
      code: 'NOT_FOUND',
      message: 'Product 999 not found',
    });
    expect(sent).toEqual([]);
  });

  it('returns 429 after the configured enquiry limit', async () => {
    const sent: EmailMessage[] = [];
    const email: EmailProvider = {
      async send(message) {
        sent.push(message);
      },
    };
    const app = appWith('', '2', email);

    expect(
      (await request(app).post('/api/enquiries').send(validEnquiry)).status,
    ).toBe(201);
    expect(
      (await request(app).post('/api/enquiries').send(validEnquiry)).status,
    ).toBe(201);
    const limited = await request(app)
      .post('/api/enquiries')
      .send(validEnquiry);

    expect(limited.status).toBe(429);
    expect(ApiErrorSchema.parse(limited.body).error).toEqual({
      code: 'RATE_LIMITED',
      message: 'Too many enquiries. Try again later.',
    });
    expect(sent).toHaveLength(2);
  });

  it('returns 400 for invalid JSON', async () => {
    const response = await request(appWith())
      .post('/api/enquiries')
      .set('Content-Type', 'application/json')
      .send('{');

    expect(response.status).toBe(400);
    expect(ApiErrorSchema.parse(response.body).error).toEqual({
      code: 'VALIDATION_ERROR',
      message: 'Invalid JSON',
    });
  });
});

describe('in-memory repository isolation', () => {
  beforeEach(() => {
    expect(catalog.every((product) => !Object.hasOwn(product, 'rate'))).toBe(
      true,
    );
  });

  it('keeps the fixture on the internal product shape', () => {
    expect(catalog[0]?.category).toBe("men's clothing");
  });
});
