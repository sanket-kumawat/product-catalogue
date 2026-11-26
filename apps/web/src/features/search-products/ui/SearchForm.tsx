import { useLocation, useNavigate } from '@tanstack/react-router';
import { type FormEvent, useRef, useState } from 'react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

function searchQuery(search: unknown): string {
  if (typeof search !== 'object' || search === null || !('q' in search)) {
    return '';
  }
  return typeof search.q === 'string' ? search.q : '';
}

export function SearchForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeQuery =
    location.pathname === '/search' ? searchQuery(location.search) : '';
  const [term, setTerm] = useState(activeQuery);
  const [trackedQuery, setTrackedQuery] = useState(activeQuery);
  const previousHref = useRef(
    location.pathname === '/search' ? '/' : location.href,
  );

  if (location.pathname !== '/search') {
    previousHref.current = location.href;
  }

  if (activeQuery !== trackedQuery) {
    setTrackedQuery(activeQuery);
    setTerm(activeQuery);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = term.trim();
    if (q.length === 0) {
      return;
    }
    void navigate({ to: '/search', search: { q } });
  }

  function onClear() {
    setTerm('');
    if (location.pathname === '/search') {
      void navigate({ href: previousHref.current, replace: true });
    }
  }

  return (
    <form
      role='search'
      className='flex w-full gap-2'
      onSubmit={onSubmit}
    >
      <div className='relative min-w-0 flex-1'>
        <Input
          type='search'
          aria-label='Search products'
          placeholder='Search products'
          maxLength={200}
          value={term}
          className={cn(
            '[&::-webkit-search-cancel-button]:appearance-none',
            term.length > 0 && 'pr-9',
          )}
          onChange={(event) => {
            setTerm(event.target.value);
          }}
        />
        {term.length > 0 ? (
          <button
            type='button'
            aria-label='Clear search'
            className='absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground'
            onClick={onClear}
          >
            <svg
              viewBox='0 0 24 24'
              aria-hidden='true'
              className='size-4'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
            >
              <path d='M6 6l12 12M18 6L6 18' />
            </svg>
          </button>
        ) : null}
      </div>
      <Button type='submit'>Search</Button>
    </form>
  );
}
