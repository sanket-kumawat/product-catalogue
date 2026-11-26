import { useQuery } from '@tanstack/react-query';

import { categoryProductsQuery } from '@/entities/product';
import { isNotFoundError } from '@/shared/api/is-not-found';
import { Skeleton } from '@/shared/ui/skeleton';
import { ProductSection } from '@/widgets/product-section';

export function CategoryPage({ slug }: { slug: string }) {
  const category = useQuery(categoryProductsQuery(slug));

  return (
    <main className='mx-auto max-w-5xl space-y-8 px-4 py-6'>
      {category.isPending ? (
        <div className='space-y-4'>
          <Skeleton className='h-8 w-48' />
          <Skeleton className='h-64' />
        </div>
      ) : null}
      {category.isError ? (
        <p className='text-destructive'>
          {isNotFoundError(category.error)
            ? 'Category not found.'
            : 'This category could not be loaded.'}
        </p>
      ) : null}
      {category.data ? (
        <>
          <h1 className='text-2xl font-semibold text-foreground'>
            {category.data.category}
          </h1>
          <ProductSection
            title='Top rated'
            products={category.data.topRated}
            emptyMessage='No products in this category.'
          />
          <ProductSection
            title='Additional products'
            products={category.data.additional}
            emptyMessage='No additional products.'
          />
        </>
      ) : null}
    </main>
  );
}
