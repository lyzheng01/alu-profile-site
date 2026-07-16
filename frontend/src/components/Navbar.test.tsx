import '@testing-library/jest-dom';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from './Navbar';

jest.mock('../contexts/TranslationContext', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback || '',
    currentLanguage: 'en',
    changeLanguage: jest.fn(),
    isLoading: false,
  }),
}));

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ results: [] }),
  }) as unknown as typeof fetch;
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('uses document-flow sticky positioning instead of overlaying page content', async () => {
  render(
    <MemoryRouter initialEntries={['/en']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Navbar />
    </MemoryRouter>
  );

  const navigation = screen.getByRole('navigation');
  expect(navigation).toHaveClass('sticky', 'top-0');
  expect(navigation).toHaveClass('bg-slate-950');
  expect(navigation).not.toHaveClass('fixed');
  expect(navigation.className).not.toContain('bg-slate-950/94');
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
});

test('keeps mobile navigation collapsed until the menu button is clicked', async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter initialEntries={['/en']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Navbar />
    </MemoryRouter>
  );

  const mobileMenu = screen.getByTestId('mobile-navigation');
  expect(mobileMenu).toHaveClass('hidden');

  await user.click(screen.getByRole('button', { name: /open navigation menu/i }));

  expect(mobileMenu).not.toHaveClass('hidden');
  expect(screen.getByRole('button', { name: /close navigation menu/i })).toBeInTheDocument();
});
