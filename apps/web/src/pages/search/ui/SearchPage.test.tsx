import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiGet } from '@/shared/api/client';
import { testProduct } from '@/test/product';
import { renderWithProviders } from '@/test/render';

vi.mock('@/shared/api/client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

describe('SearchPage', () => {
  beforeEach(() => {
    vi.mocked(apiGet).mockImplementation(async (path: string) => {
      if (path.startsWith('/search')) {
        const query = new URLSearchParams(path.split('?')[1] ?? '').get('q');
        if (query === 'zzz') {
          return { query, products: [] };
        }
        return {
          query: query ?? 'shirt',
          products: [testProduct({ id: 3, title: 'Cotton shirt' })],
        };
      }
      if (path === '/products/featured') {
        return { products: [] };
      }
      return { categories: [] };
    });
  });

  it('does not navigate when the term is blank', async () => {
    const user = userEvent.setup();
    await renderWithProviders();

    await user.click(await screen.findByRole('button', { name: 'Search' }));

    expect(screen.getByRole('heading', { name: 'Catalogue' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Search' })).toBeNull();
  });

  it('navigates to the query and renders matches', async () => {
    const user = userEvent.setup();
    await renderWithProviders();

    await user.type(
      await screen.findByRole('searchbox', { name: 'Search products' }),
      'shirt',
    );
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(await screen.findByRole('heading', { name: 'Search' })).toBeTruthy();
    expect(
      await screen.findByRole('link', { name: 'Cotton shirt' }),
    ).toBeTruthy();
  });

  it('restores the previous products when the search is cleared', async () => {
    const user = userEvent.setup();
    vi.mocked(apiGet).mockImplementation(async (path: string) => {
      if (path.startsWith('/search')) {
        return {
          query: 'shirt',
          products: [testProduct({ id: 3, title: 'Cotton shirt' })],
        };
      }
      if (path.startsWith('/categories/')) {
        return {
          category: 'jewelery',
          topRated: [
            testProduct({ id: 1, title: 'Gold ring', category: 'jewelery' }),
          ],
          additional: [],
        };
      }
      return { categories: [] };
    });
    await renderWithProviders('/categories/jewelery');

    expect(await screen.findByRole('link', { name: 'Gold ring' })).toBeTruthy();

    await user.type(
      screen.getByRole('searchbox', { name: 'Search products' }),
      'shirt',
    );
    await user.click(screen.getByRole('button', { name: 'Search' }));

    expect(
      await screen.findByRole('link', { name: 'Cotton shirt' }),
    ).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(
      await screen.findByRole('heading', { name: 'jewelery' }),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Gold ring' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Search' })).toBeNull();
    expect(
      screen.getByRole('searchbox', { name: 'Search products' }),
    ).toHaveProperty('value', '');
  });

  it('renders the empty search result', async () => {
    await renderWithProviders('/search?q=zzz');

    expect(
      await screen.findByText('No products match your search.'),
    ).toBeTruthy();
  });
});
