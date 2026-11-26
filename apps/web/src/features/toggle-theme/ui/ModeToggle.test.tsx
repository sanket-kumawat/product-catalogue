import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

vi.mock('@/shared/api/client', () => ({
  apiGet: vi.fn(async (path: string) => {
    if (path === '/products/featured') {
      return { products: [] };
    }
    return { categories: [] };
  }),
  apiPost: vi.fn(),
}));

describe('ModeToggle', () => {
  beforeEach(() => {
    localStorage.setItem('theme', 'light');
    document.documentElement.classList.remove('dark');
  });

  it('adds and removes the dark class', async () => {
    const user = userEvent.setup();
    await renderWithProviders();

    const button = await screen.findByRole('button', { name: 'Toggle theme' });
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    await user.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    await user.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
