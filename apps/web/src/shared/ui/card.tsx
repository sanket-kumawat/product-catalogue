import type { ComponentProps } from 'react';

import { cn } from '@/shared/lib/utils';

export function Card({ className, ...props }: ComponentProps<'article'>) {
  return (
    <article
      className={cn(
        'rounded-lg border border-border bg-card text-card-foreground',
        className,
      )}
      {...props}
    />
  );
}
