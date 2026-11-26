import { ProductIdParamSchema } from '@product-catalogue/shared';
import { useQuery } from '@tanstack/react-query';

import { formatUsd, productDetailQuery } from '@/entities/product';
import { EnquiryDialog } from '@/features/submit-enquiry';
import { isNotFoundError } from '@/shared/api/is-not-found';
import { Skeleton } from '@/shared/ui/skeleton';

export function ProductDetailPage({ productId }: { productId: string }) {
  const parsedId = ProductIdParamSchema.safeParse(productId);
  const product = useQuery({
    ...productDetailQuery(parsedId.success ? parsedId.data : 0),
    enabled: parsedId.success,
  });

  return (
    <main className='mx-auto max-w-5xl px-4 py-6'>
      {!parsedId.success ||
      (product.isError && isNotFoundError(product.error)) ? (
        <p className='text-destructive'>Product not found.</p>
      ) : null}
      {parsedId.success &&
      product.isError &&
      !isNotFoundError(product.error) ? (
        <p className='text-destructive'>This product could not be loaded.</p>
      ) : null}
      {product.isPending && parsedId.success ? (
        <div className='grid gap-6 sm:grid-cols-[16rem_1fr]'>
          <Skeleton className='h-64' />
          <Skeleton className='h-40' />
        </div>
      ) : null}
      {product.data ? (
        <div className='grid gap-6 sm:grid-cols-[16rem_1fr]'>
          <img
            src={product.data.product.imageUrl}
            alt={product.data.product.title}
            className='w-full rounded-lg bg-muted object-contain'
          />
          <div className='space-y-3'>
            <h1 className='text-2xl font-semibold text-foreground'>
              {product.data.product.title}
            </h1>
            <p className='text-muted-foreground'>
              {formatUsd(product.data.product.price)}
            </p>
            <p className='text-sm text-muted-foreground'>
              {product.data.product.category}
            </p>
            <p className='text-sm text-muted-foreground'>
              {product.data.product.rating.toFixed(1)} (
              {product.data.product.ratingCount})
            </p>
            <p className='text-foreground'>
              {product.data.product.description}
            </p>
            <EnquiryDialog productId={product.data.product.id} />
          </div>
        </div>
      ) : null}
    </main>
  );
}
