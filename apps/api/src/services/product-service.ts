import type {
  Category,
  CategoryProductsResponse,
  Product,
} from '@product-catalogue/shared';

import type { ProductRepository } from '../ports/product-repository.js';
import { notFound } from './errors.js';
import { compareByRank, rankProducts, takeFeatured } from './ranking.js';

const TOP_RATED_LIMIT = 3;

export class ProductService {
  constructor(
    private readonly products: ProductRepository,
    private readonly featuredProductIds: readonly number[],
  ) {}

  async getFeatured(): Promise<Product[]> {
    const products = await this.products.listProducts();
    return takeFeatured(products, this.featuredProductIds);
  }

  async getProduct(id: number): Promise<Product> {
    const product = await this.products.getProductById(id);
    if (!product) {
      throw notFound(`Product ${id} not found`);
    }
    return product;
  }

  async listCategories(): Promise<Category[]> {
    const products = await this.products.listProducts();
    const names = [
      ...new Set(products.map((product) => product.category)),
    ].sort((left, right) => left.localeCompare(right));
    return names.map((name) => ({ name, slug: name }));
  }

  async getCategory(slug: string): Promise<CategoryProductsResponse> {
    const products = await this.products.listProducts();
    const decoded = decodeCategorySlug(slug);
    const canonical = products
      .map((product) => product.category)
      .find((category) => category.toLowerCase() === decoded.toLowerCase());

    if (!canonical) {
      throw notFound(`Category ${decoded} not found`);
    }

    const sorted = products
      .filter((product) => product.category === canonical)
      .sort(compareByRank);

    return {
      category: canonical,
      topRated: sorted.slice(0, TOP_RATED_LIMIT),
      additional: sorted.slice(TOP_RATED_LIMIT),
    };
  }

  async search(query: string): Promise<Product[]> {
    const needle = query.toLowerCase();
    const products = await this.products.listProducts();
    const matches = products.filter((product) =>
      [product.title, product.description, product.category].some((field) =>
        field.toLowerCase().includes(needle),
      ),
    );
    return rankProducts(matches);
  }
}

export function decodeCategorySlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}
