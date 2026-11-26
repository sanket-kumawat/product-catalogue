import { afterEach, describe, expect, it, vi } from 'vitest';

import { fakeStoreProductsJson } from './fixture.js';
import { FakeStoreProductRepository, type FetchLike } from './fake-store-product-repository.js';

const BASE_URL = 'https://fakestoreapi.com';
const TTL_MS = 300_000;

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function repository(options: {
  fetchFn: FetchLike;
  now?: () => number;
  ttlMs?: number;
}): FakeStoreProductRepository {
  return new FakeStoreProductRepository({
    baseUrl: `${BASE_URL}/`,
    ttlMs: options.ttlMs ?? TTL_MS,
    fetchFn: options.fetchFn,
    ...(options.now ? { now: options.now } : {}),
  });
}

describe('FakeStoreProductRepository', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps the catalog and passes a 5 second timeout signal', async () => {
    const timeout = vi.spyOn(AbortSignal, 'timeout');
    const fetchFn = vi.fn<FetchLike>(async () => jsonResponse(fakeStoreProductsJson));
    const repo = repository({ fetchFn });

    const products = await repo.listProducts();

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(fetchFn).toHaveBeenCalledWith(
      `${BASE_URL}/products`,
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(timeout).toHaveBeenCalledWith(5_000);
    expect(products.map((product) => product.id)).toEqual([1, 2, 3]);
    expect(products[0]).toMatchObject({ rating: 4.7, ratingCount: 500 });
    expect(Object.keys(products[0] ?? {})).not.toContain('rate');
  });

  it('reuses the cached list inside the TTL and refetches after it expires', async () => {
    let now = 1_000;
    const fetchFn = vi.fn<FetchLike>(async () => jsonResponse(fakeStoreProductsJson));
    const repo = repository({ fetchFn, now: () => now });

    await repo.listProducts();
    await repo.listProducts();
    const cached = await repo.getProductById(3);

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(cached?.category).toBe('jewelery');

    now = 1_000 + TTL_MS;
    await repo.listProducts();

    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('returns 502 when the upstream status or payload is unusable', async () => {
    const statusRepo = repository({
      fetchFn: async () => new Response('nope', { status: 500 }),
    });
    const payloadRepo = repository({
      fetchFn: async () => jsonResponse([{ id: 1 }]),
    });
    const jsonRepo = repository({
      fetchFn: async () => new Response('not-json', { status: 200 }),
    });

    await expect(statusRepo.listProducts()).rejects.toMatchObject({
      status: 502,
      code: 'UPSTREAM_ERROR',
    });
    await expect(payloadRepo.listProducts()).rejects.toMatchObject({
      status: 502,
      code: 'UPSTREAM_ERROR',
    });
    await expect(jsonRepo.listProducts()).rejects.toMatchObject({
      status: 502,
      code: 'UPSTREAM_ERROR',
    });
  });

  it('returns 503 when the upstream request aborts or the network fails', async () => {
    const networkRepo = repository({
      fetchFn: async () => {
        throw new TypeError('network down');
      },
    });
    const timeoutRepo = repository({
      fetchFn: async () => {
        throw new DOMException('The operation was aborted due to timeout', 'TimeoutError');
      },
    });

    await expect(networkRepo.listProducts()).rejects.toMatchObject({
      status: 503,
      code: 'UPSTREAM_UNAVAILABLE',
    });
    await expect(timeoutRepo.listProducts()).rejects.toMatchObject({
      status: 503,
      code: 'UPSTREAM_UNAVAILABLE',
    });
  });

  it('does not cache a failed load', async () => {
    const fetchFn = vi
      .fn<FetchLike>()
      .mockRejectedValueOnce(new TypeError('network down'))
      .mockResolvedValueOnce(jsonResponse(fakeStoreProductsJson));
    const repo = repository({ fetchFn });

    await expect(repo.listProducts()).rejects.toMatchObject({ status: 503 });
    await expect(repo.listProducts()).resolves.toHaveLength(3);
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});
