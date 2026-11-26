import type { Product } from '@product-catalogue/shared';
import { Link } from '@tanstack/react-router';

import { Card } from '@/shared/ui/card';

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export function formatUsd(amount: number): string {
  return usd.format(amount);
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className='flex h-full flex-col gap-3 p-4'>
      <Link
        to='/products/$productId'
        params={{ productId: String(product.id) }}
        className='flex flex-col gap-3'
      >
        <img
          src={product.imageUrl}
          alt=''
          className='h-40 w-full rounded-md bg-muted object-contain'
        />
        <h3 className='font-medium text-foreground'>{product.title}</h3>
      </Link>
      <p className='text-sm text-muted-foreground'>
        {formatUsd(product.price)}
      </p>
      <p className='text-sm text-muted-foreground'>
        {product.rating.toFixed(1)} ({product.ratingCount})
      </p>
    </Card>
  );
}
