import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiGet } from '@/shared/api/client';
import { testProduct } from '@/test/product';
import { renderWithProviders } from '@/test/render';

vi.mock('@/shared/api/client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

describe('CategoryPage', () => {
  beforeEach(() => {
    vi.mocked(apiGet).mockImplementation(async (path: string) => {
      if (path.startsWith('/categories/')) {
        return {
          category: 'jewelery',
          topRated: [
            testProduct({ id: 1, title: 'Gold ring', category: 'jewelery' }),
          ],
          additional: [
            testProduct({ id: 2, title: 'Silver chain', category: 'jewelery' }),
          ],
        };
      }
      return { categories: [] };
    });
  });

  it('keeps top rated titles out of additional products', async () => {
    await renderWithProviders('/categories/jewelery');

    const topRated = await screen.findByRole('region', { name: 'Top rated' });
    const additional = screen.getByRole('region', {
      name: 'Additional products',
    });

    expect(
      within(topRated).getByRole('link', { name: 'Gold ring' }),
    ).toBeTruthy();
    expect(
      within(additional).queryByRole('link', { name: 'Gold ring' }),
    ).toBeNull();
    expect(
      within(additional).getByRole('link', { name: 'Silver chain' }),
    ).toBeTruthy();
  });
});
