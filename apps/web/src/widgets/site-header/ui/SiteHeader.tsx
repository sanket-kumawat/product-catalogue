import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import { categoryListQuery } from '@/entities/category';
import { SearchForm } from '@/features/search-products';
import { ModeToggle } from '@/features/toggle-theme';

function capitalizeFirst(value: string): string {
  const [first, ...rest] = value;
  if (first === undefined) {
    return value;
  }
  return first.toLocaleUpperCase() + rest.join('');
}

export function SiteHeader() {
  const categories = useQuery(categoryListQuery());

  return (
    <header className='bg-background'>
      <div className='border-b border-border'>
        <div className='mx-auto flex max-w-5xl items-center gap-x-4 gap-y-2 px-4 py-3'>
          <Link
            to='/'
            activeOptions={{ exact: true }}
            activeProps={{ className: 'font-semibold text-foreground' }}
            inactiveProps={{ className: 'text-muted-foreground' }}
          >
            Home
          </Link>
          <nav
            aria-label='Categories'
            className='flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2 text-sm'
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
                activeProps={{ className: 'font-semibold text-foreground' }}
                inactiveProps={{ className: 'text-muted-foreground' }}
              >
                {capitalizeFirst(category.name)}
              </Link>
            ))}
          </nav>
          <div className='shrink-0'>
            <ModeToggle />
          </div>
        </div>
      </div>
      <div className='mx-auto max-w-5xl px-4 py-3'>
        <SearchForm />
      </div>
    </header>
  );
}
