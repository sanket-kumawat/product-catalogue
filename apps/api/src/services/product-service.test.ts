import { describe, expect, it } from 'vitest';

import { InMemoryProductRepository } from '../test/in-memory-product-repository.js';
import { makeProduct } from '../test/products.js';
import { ProductService } from './product-service.js';

const catalog = [
  makeProduct({
    id: 1,
    title: 'Alpha Shirt',
    description: 'cotton shirt',
    category: "men's clothing",
    rating: 3,
    ratingCount: 10,
  }),
  makeProduct({
    id: 2,
    title: 'Beta Coat',
    description: 'wool coat',
    category: "men's clothing",
    rating: 5,
    ratingCount: 5,
  }),
  makeProduct({
    id: 3,
    title: 'Gamma Tie',
    description: 'silk tie',
    category: "men's clothing",
    rating: 5,
    ratingCount: 5,
  }),
  makeProduct({
    id: 4,
    title: 'Delta Hat',
    description: 'felt hat',
    category: "men's clothing",
    rating: 5,
    ratingCount: 9,
  }),
  makeProduct({
    id: 5,
    title: 'Epsilon Ring',
    description: 'gold ring',
    category: 'jewelery',
    rating: 4,
    ratingCount: 2,
  }),
  makeProduct({
    id: 6,
    title: 'Zeta Lamp',
    description: 'brass lamp',
    category: 'jewelery',
    rating: 4,
    ratingCount: 8,
  }),
  makeProduct({
    id: 7,
    title: 'Eta Phone',
    description: 'smart phone',
    category: 'electronics',
    rating: 4,
    ratingCount: 3,
  }),
  makeProduct({
    id: 8,
    title: 'Theta Cable',
    description: 'usb cable',
    category: 'electronics',
    rating: 5,
    ratingCount: 1,
  }),
];

function service(featuredProductIds: readonly number[] = []): ProductService {
  return new ProductService(
    new InMemoryProductRepository(catalog),
    featuredProductIds,
  );
}

describe('ProductService featured products', () => {
  it('keeps listed ids in order, skips unknown ids, and fills the rest by rank', async () => {
    const products = await service([2, 99, 2, 1]).getFeatured();

    expect(products.map((product) => product.id)).toEqual([2, 1, 4, 3, 8]);
  });

  it('uses rank order when featured ids are unset', async () => {
    const products = await service([]).getFeatured();

    expect(products.map((product) => product.id)).toEqual([4, 2, 3, 8, 6]);
  });

  it('uses rank order when every featured id is unknown', async () => {
    const products = await service([99, 100]).getFeatured();

    expect(products.map((product) => product.id)).toEqual([4, 2, 3, 8, 6]);
  });

  it('caps the featured list at 5', async () => {
    const products = await service([1, 2, 3, 4, 5, 6]).getFeatured();

    expect(products.map((product) => product.id)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('ProductService categories', () => {
  it('splits a category into disjoint top rated and additional products', async () => {
    const result = await service().getCategory("men's clothing");
    const topIds = result.topRated.map((product) => product.id);
    const additionalIds = result.additional.map((product) => product.id);

    expect(result.category).toBe("men's clothing");
    expect(topIds).toEqual([4, 2, 3]);
    expect(additionalIds).toEqual([1]);
    expect(topIds.filter((id) => additionalIds.includes(id))).toEqual([]);
    expect([...topIds, ...additionalIds].sort()).toEqual([1, 2, 3, 4]);
  });

  it('returns an empty additional list when a category has fewer than 3 products', async () => {
    const result = await service().getCategory('electronics');

    expect(result.topRated.map((product) => product.id)).toEqual([8, 7]);
    expect(result.additional).toEqual([]);
  });

  it('matches a decoded slug case-insensitively', async () => {
    const result = await service().getCategory('MEN%27S%20CLOTHING');

    expect(result.category).toBe("men's clothing");
  });

  it('rejects an unknown category', async () => {
    await expect(service().getCategory('not-a-category')).rejects.toMatchObject(
      {
        status: 404,
        code: 'NOT_FOUND',
      },
    );
  });

  it('lists canonical category names as slugs', async () => {
    const categories = await service().listCategories();

    expect(categories).toEqual([
      { name: 'electronics', slug: 'electronics' },
      { name: 'jewelery', slug: 'jewelery' },
      { name: "men's clothing", slug: "men's clothing" },
    ]);
  });
});

describe('ProductService search', () => {
  it('matches title, description, and category case-insensitively and ranks the hits', async () => {
    const byTitle = await service().search('SHIRT');
    const byDescription = await service().search('Wool');
    const byCategory = await service().search('JEWEL');

    expect(byTitle.map((product) => product.id)).toEqual([1]);
    expect(byDescription.map((product) => product.id)).toEqual([2]);
    expect(byCategory.map((product) => product.id)).toEqual([6, 5]);
  });

  it('returns an empty list when nothing matches', async () => {
    await expect(service().search('nomatch')).resolves.toEqual([]);
  });
});
