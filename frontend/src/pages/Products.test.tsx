import '@testing-library/jest-dom';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import Products from './Products';

jest.mock('../contexts/TranslationContext', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback || '',
  }),
}));

jest.mock('../hooks/usePageTitle', () => ({
  usePageTitle: jest.fn(),
}));

jest.mock('../hooks/useSeoMeta', () => ({
  useSeoMeta: jest.fn(),
}));

jest.mock('../components/FloatingContactButtons', () => () => <div data-testid="floating-contact-buttons" />);

const mockFetch = jest.fn();

beforeEach(() => {
  mockFetch.mockReset();
  global.fetch = mockFetch as unknown as typeof fetch;
  window.localStorage.setItem('language', 'en');
});

afterAll(() => {
  jest.restoreAllMocks();
});

test('renders a procurement-oriented product catalog with category filters and RFQ cues', async () => {
  mockFetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 16,
            slug: 'industrial-40x40-t-slot-profile',
            translated_name: 'Industrial Profile Extrude Aluminium Framing 40x40 T-SLOT aluminium extrusion',
            translated_description: 'Industrial-grade 40x40 T-slot profile for workstations and automation frames.',
            range_param: '40x40 T-SLOT aluminium profiles',
            surface_treatment: 'Mill Finished, Black Anodized, Silver Anodized',
            grade: '6063 Series',
            temper: 'T5',
            category: { id: 5, name: 'Industrial Aluminium Profile' },
            images: [],
            features: '',
            applications: '',
            specifications: {},
            created_at: '2026-01-01T00:00:00Z',
          },
        ],
      }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 5,
            translated_name: 'Industrial Aluminium Profile',
            translated_description: 'Industrial profiles for automation and equipment frames.',
            subcategories: [],
          },
        ],
      }),
    });

  render(
    <MemoryRouter initialEntries={['/en/products']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Products />
    </MemoryRouter>
  );

  expect(await screen.findByRole('heading', { name: /Aluminum Profile Product Center/i })).toBeInTheDocument();
  expect(screen.getByTestId('products-page')).not.toHaveClass('pt-20');
  expect(screen.getByRole('button', { name: /All Products/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Industrial Aluminium Profile/i })).toBeInTheDocument();
  expect(screen.getByText(/40x40 T-SLOT aluminium profiles/i)).toBeInTheDocument();
  expect(screen.getByText(/6063 Series \/ T5/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Send RFQ/i })).toHaveAttribute(
    'href',
    '/en/products/industrial-40x40-t-slot-profile#inquiry'
  );
  expect(await screen.findByTestId('factory-showcase')).toBeInTheDocument();

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/products/?lang=en'));
  });
});
