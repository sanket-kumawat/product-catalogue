import type { Product } from '@product-catalogue/shared';

import type { ProductRepository } from '../ports/product-repository.js';

export class InMemoryProductRepository implements ProductRepository {
  constructor(private readonly products: readonly Product[]) {}

  async listProducts(): Promise<Product[]> {
    return [...this.products];
  }

  async getProductById(id: number): Promise<Product | null> {
    return this.products.find((product) => product.id === id) ?? null;
  }
}
