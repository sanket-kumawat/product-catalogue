import { useQuery } from '@tanstack/react-query';

import { featuredProductsQuery, ProductCard } from '@/entities/product';
import { Skeleton } from '@/shared/ui/skeleton';

export function HomePage() {
  const featured = useQuery(featuredProductsQuery());

  return (
    <main className='mx-auto max-w-5xl space-y-6 px-4 py-6'>
      <h1 className='text-2xl font-semibold text-foreground'>Catalogue</h1>
      {featured.isPending ? <ProductSkeletons /> : null}
      {featured.isError ? (
        <p className='text-destructive'>
          Featured products could not be loaded.
        </p>
      ) : null}
      {featured.data && featured.data.products.length === 0 ? (
        <p className='text-muted-foreground'>No featured products.</p>
      ) : null}
      {featured.data && featured.data.products.length > 0 ? (
        <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {featured.data.products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}

function ProductSkeletons() {
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton
          key={index}
          className='h-64'
        />
      ))}
    </div>
  );
}
