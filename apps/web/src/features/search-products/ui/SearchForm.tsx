import { useNavigate } from '@tanstack/react-router';
import { type FormEvent, useState } from 'react';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

export function SearchForm() {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = term.trim();
    if (q.length === 0) {
      return;
    }
    void navigate({ to: '/search', search: { q } });
  }

  return (
    <form
      role='search'
      className='flex w-full gap-2'
      onSubmit={onSubmit}
    >
      <Input
        type='search'
        aria-label='Search products'
        placeholder='Search products'
        maxLength={200}
        value={term}
        onChange={(event) => {
          setTerm(event.target.value);
        }}
      />
      <Button type='submit'>Search</Button>
    </form>
  );
}
