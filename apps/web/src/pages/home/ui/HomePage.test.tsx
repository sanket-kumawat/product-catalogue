import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiGet } from '@/shared/api/client';
import { testProduct } from '@/test/product';
import { renderWithProviders } from '@/test/render';

vi.mock('@/shared/api/client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

const titles = [
  'Linen shirt',
  'Wool coat',
  'Denim jacket',
  'Silk scarf',
  'Cotton tee',
];

describe('HomePage', () => {
  beforeEach(() => {
    vi.mocked(apiGet).mockImplementation(async (path: string) => {
      if (path === '/products/featured') {
        return {
          products: titles.map((title, index) =>
            testProduct({ id: index + 1, title }),
          ),
        };
      }
      return { categories: [] };
    });
  });

  it('renders five product links', async () => {
    await renderWithProviders();

    for (const title of titles) {
      expect(await screen.findByRole('link', { name: title })).toBeTruthy();
    }
  });
});
