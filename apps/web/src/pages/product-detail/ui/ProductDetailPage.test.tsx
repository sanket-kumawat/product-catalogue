import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiGet, apiPost } from '@/shared/api/client';
import { testProduct } from '@/test/product';
import { renderWithProviders } from '@/test/render';

vi.mock('@/shared/api/client', () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

const product = testProduct({
  id: 1,
  title: 'Leather jacket',
  description: 'A warm jacket',
});

describe('ProductDetailPage', () => {
  beforeEach(() => {
    vi.mocked(apiPost).mockResolvedValue({ message: 'Thank you' });
    vi.mocked(apiGet).mockImplementation(async (path: string) => {
      if (path === '/products/1') {
        return { product };
      }
      if (path === '/products/99') {
        const missing = new Error('Request failed with status 404');
        Object.assign(missing, { status: 404 });
        throw missing;
      }
      if (path === '/products/7') {
        throw new Error('Request failed with status 503');
      }
      return { categories: [] };
    });
  });

  it('shows the thank you message after a successful enquiry', async () => {
    const user = userEvent.setup();
    await renderWithProviders('/products/1');

    await user.click(await screen.findByRole('button', { name: 'Enquire' }));
    await user.type(screen.getByLabelText('Name'), 'Ada Lovelace');
    await user.type(screen.getByLabelText('Email'), 'ada@example.com');
    await user.type(screen.getByLabelText('Message'), 'Is this available?');
    await user.click(screen.getByRole('button', { name: 'Send enquiry' }));

    expect(
      await screen.findByText('Thank you. Your enquiry has been sent.'),
    ).toBeTruthy();
    expect(apiPost).toHaveBeenCalledWith('/enquiries', {
      productId: 1,
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      message: 'Is this available?',
    });
  });

  it('renders the product not-found state', async () => {
    await renderWithProviders('/products/99');

    expect(await screen.findByText('Product not found.')).toBeTruthy();
  });

  it('renders the product error state', async () => {
    await renderWithProviders('/products/7');

    expect(
      await screen.findByText('This product could not be loaded.'),
    ).toBeTruthy();
  });
});
