import type { Product } from '@product-catalogue/shared';

export interface ProductRepository {
  listProducts(): Promise<Product[]>;
  getProductById(id: number): Promise<Product | null>;
}
