import type { Product } from '@product-catalogue/shared';

import { ProductCard } from '@/entities/product';

export function ProductSection({
  title,
  products,
  emptyMessage,
}: {
  title: string;
  products: readonly Product[];
  emptyMessage: string;
}) {
  const headingId = title.toLowerCase().replaceAll(' ', '-');

  return (
    <section
      aria-labelledby={headingId}
      className='space-y-4'
    >
      <h2
        id={headingId}
        className='text-xl font-semibold text-foreground'
      >
        {title}
      </h2>
      {products.length === 0 ? (
        <p className='text-muted-foreground'>{emptyMessage}</p>
      ) : (
        <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
