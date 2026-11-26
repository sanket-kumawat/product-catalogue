import type { Product } from '@product-catalogue/shared';

const FEATURED_LIMIT = 5;

export function compareByRank(left: Product, right: Product): number {
  if (left.rating !== right.rating) {
    return right.rating - left.rating;
  }
  if (left.ratingCount !== right.ratingCount) {
    return right.ratingCount - left.ratingCount;
  }
  return left.id - right.id;
}

export function rankProducts(products: readonly Product[]): Product[] {
  return products.slice().sort(compareByRank);
}

export function takeFeatured(
  products: readonly Product[],
  featuredProductIds: readonly number[],
): Product[] {
  const byId = new Map(products.map((product) => [product.id, product]));
  const chosen: Product[] = [];
  const seen = new Set<number>();

  for (const id of featuredProductIds) {
    if (chosen.length >= FEATURED_LIMIT) {
      break;
    }
    if (seen.has(id)) {
      continue;
    }
    const product = byId.get(id);
    if (!product) {
      continue;
    }
    seen.add(id);
    chosen.push(product);
  }

  if (chosen.length >= FEATURED_LIMIT) {
    return chosen;
  }

  for (const product of rankProducts(products)) {
    if (chosen.length >= FEATURED_LIMIT) {
      break;
    }
    if (seen.has(product.id)) {
      continue;
    }
    seen.add(product.id);
    chosen.push(product);
  }

  return chosen;
}
