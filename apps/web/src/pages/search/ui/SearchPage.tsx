import { useQuery } from '@tanstack/react-query';

import { ProductCard, searchProductsQuery } from '@/entities/product';
import { Skeleton } from '@/shared/ui/skeleton';

export function SearchPage({ query }: { query: string }) {
  const results = useQuery(searchProductsQuery(query));

  return (
    <main className='mx-auto max-w-5xl space-y-6 px-4 py-6'>
      <h1 className='text-2xl font-semibold text-foreground'>Search</h1>
      <p className='text-muted-foreground'>Results for “{query}”</p>
      {results.isPending ? <Skeleton className='h-64' /> : null}
      {results.isError ? (
        <p className='text-destructive'>Search could not be completed.</p>
      ) : null}
      {results.data && results.data.products.length === 0 ? (
        <p className='text-muted-foreground'>No products match your search.</p>
      ) : null}
      {results.data && results.data.products.length > 0 ? (
        <ul className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {results.data.products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
