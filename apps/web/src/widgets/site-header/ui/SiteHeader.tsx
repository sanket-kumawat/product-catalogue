import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import { categoryListQuery } from '@/entities/category';
import { ModeToggle } from '@/features/toggle-theme';

export function SiteHeader() {
  const categories = useQuery(categoryListQuery());

  return (
    <header className='border-b border-border bg-background'>
      <div className='mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3'>
        <Link
          to='/'
          className='font-semibold text-foreground'
        >
          Catalogue
        </Link>
        <nav
          aria-label='Categories'
          className='order-last flex basis-full flex-wrap gap-x-3 gap-y-2 text-sm sm:order-none sm:basis-auto sm:flex-1'
        >
          {categories.isPending ? (
            <span className='text-muted-foreground'>Loading categories</span>
          ) : null}
          {categories.isError ? (
            <span className='text-muted-foreground'>
              Categories unavailable
            </span>
          ) : null}
          {categories.data?.categories.map((category) => (
            <Link
              key={category.slug}
              to='/categories/$slug'
              params={{ slug: category.slug }}
              className='text-muted-foreground'
            >
              {category.name}
            </Link>
          ))}
        </nav>
        <div className='ml-auto'>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
