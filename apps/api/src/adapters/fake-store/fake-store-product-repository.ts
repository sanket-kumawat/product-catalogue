import { ProductSchema, type Product } from '@product-catalogue/shared';

import type { ProductRepository } from '../../ports/product-repository.js';
import {
  AppError,
  upstreamError,
  upstreamUnavailable,
} from '../../services/errors.js';
import { mapFakeStoreProduct } from './map-product.js';
import { FakeStoreProductListSchema } from './schema.js';
import { TtlCache } from './ttl-cache.js';

const PRODUCTS_CACHE_KEY = 'products';
const UPSTREAM_TIMEOUT_MS = 5_000;

export type FetchLike = (
  input: string,
  init?: RequestInit,
) => Promise<Response>;

export type FakeStoreProductRepositoryOptions = {
  baseUrl: string;
  ttlMs: number;
  fetchFn?: FetchLike;
  now?: () => number;
};

export class FakeStoreProductRepository implements ProductRepository {
  private readonly cache: TtlCache<Product[]>;
  private readonly fetchFn: FetchLike;

  constructor(private readonly options: FakeStoreProductRepositoryOptions) {
    this.cache = new TtlCache(options.ttlMs, options.now);
    this.fetchFn = options.fetchFn ?? fetch;
  }

  async listProducts(): Promise<Product[]> {
    const cached = this.cache.get(PRODUCTS_CACHE_KEY);
    if (cached) {
      return cached;
    }

    const products = await this.loadProducts();
    this.cache.set(PRODUCTS_CACHE_KEY, products);
    return products;
  }

  async getProductById(id: number): Promise<Product | null> {
    const products = await this.listProducts();
    return products.find((product) => product.id === id) ?? null;
  }

  private async loadProducts(): Promise<Product[]> {
    const body = await this.readCatalog();
    const parsed = FakeStoreProductListSchema.safeParse(body);
    if (!parsed.success) {
      throw upstreamError();
    }

    return parsed.data.map((item) => {
      const product = mapFakeStoreProduct(item);
      const checked = ProductSchema.safeParse(product);
      if (!checked.success) {
        throw upstreamError();
      }
      return checked.data;
    });
  }

  private async readCatalog(): Promise<unknown> {
    const url = `${this.options.baseUrl.replace(/\/$/, '')}/products`;
    let response: Response;
    try {
      response = await this.fetchFn(url, {
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      });
    } catch (error) {
      if (isUnavailable(error)) {
        throw upstreamUnavailable();
      }
      throw upstreamError();
    }

    if (!response.ok) {
      throw upstreamError();
    }

    try {
      return await response.json();
    } catch {
      throw upstreamError();
    }
  }
}

function isUnavailable(error: unknown): boolean {
  if (error instanceof AppError) {
    return false;
  }
  if (error instanceof TypeError) {
    return true;
  }
  return (
    error instanceof Error &&
    (error.name === 'AbortError' || error.name === 'TimeoutError')
  );
}
