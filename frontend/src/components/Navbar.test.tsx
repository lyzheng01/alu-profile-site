import '@testing-library/jest-dom';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
  expect(navigation).toHaveClass('bg-white');
  expect(navigation).not.toHaveClass('fixed');
  expect(navigation.className).not.toContain('bg-white/94');
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
});

test('shows the LingYe Aluminum brand name beside the logo mark', async () => {
  render(
    <MemoryRouter initialEntries={['/en']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Navbar />
    </MemoryRouter>
  );

  expect(screen.getByRole('link', { name: /LingYe Aluminum/i })).toBeInTheDocument();
});

test('opens and closes the desktop products menu on click', async () => {
  render(
    <MemoryRouter initialEntries={['/en']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Navbar />
    </MemoryRouter>
  );

  const productsToggle = screen.getAllByText('Products')[0].parentElement;
  expect(productsToggle).toHaveAttribute('aria-expanded', 'false');

  fireEvent.click(productsToggle!);
  expect(productsToggle).toHaveAttribute('aria-expanded', 'true');

  fireEvent.click(productsToggle!);
  expect(productsToggle).toHaveAttribute('aria-expanded', 'false');
});

test('requests and renders product category labels in the active language', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({
      results: [
        { id: 2, slug: 'industrial-profiles', name: 'Industrial Aluminium Profiles' },
        { id: 3, slug: 't-slot-profiles', translated_name: 'T-slot Aluminium Profiles' },
      ],
    }),
  }) as unknown as typeof fetch;

  render(
    <MemoryRouter initialEntries={['/en']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Navbar />
    </MemoryRouter>
  );

  fireEvent.click(screen.getAllByText('Products')[0].parentElement!);

  const dropdown = screen.getByRole('navigation').querySelector('#desktop-products-dropdown');
  expect(await within(dropdown as HTMLElement).findByText('Industrial Profiles')).toBeInTheDocument();
  expect(within(dropdown as HTMLElement).getByText('T-Slot Framing')).toBeInTheDocument();
  expect(within(dropdown as HTMLElement).getByRole('link', { name: 'Industrial Profiles' })).toHaveAttribute(
    'href',
    '/en/products/category/industrial-profiles'
  );
  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/categories/?lang=en&include_subcategories=true')
  );
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
