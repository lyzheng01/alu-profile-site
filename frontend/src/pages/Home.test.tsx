import '@testing-library/jest-dom';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import Home from './Home';

jest.mock('../contexts/TranslationContext', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback || '',
    currentLanguage: 'en',
  }),
}));

jest.mock('../hooks/usePageTitle', () => ({
  usePageTitle: jest.fn(),
}));

jest.mock('../hooks/useStructuredData', () => ({
  useStructuredData: jest.fn(),
}));

jest.mock('../components/FloatingContactButtons', () => () => <div data-testid="floating-contact-buttons" />);

jest.mock('../components/InquiryForm', () => () => <div data-testid="inquiry-form" />);

const mockFetch = jest.fn();

beforeEach(() => {
  mockFetch.mockReset();
  global.fetch = mockFetch as unknown as typeof fetch;
});

afterAll(() => {
  jest.restoreAllMocks();
});

test('renders the new B2B homepage structure and requests featured products', async () => {
  mockFetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { title: '首页图片1', image: '/media/factory-1.jpg' },
          { title: '首页图片3', image: '/media/factory-3.jpg' },
          { title: 'Banner 3', image: '/media/banner-3.jpg' },
        ],
      }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 1,
            name: 'Thermal Break Window Profile',
            description: 'Reliable extrusion for facade and window systems.',
            images: [{ image: '/media/product-1.jpg', is_primary: true }],
          },
        ],
      }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 10,
            name: 'Construction Profiles',
            description: 'Built for doors, windows, and facade projects.',
            image: '/media/category-1.jpg',
          },
        ],
      }),
    });

  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  expect(
    await screen.findByRole('heading', { name: /China Aluminum Profile Manufacturer/i })
  ).toBeInTheDocument();
  expect(screen.getByText(/Built for global buyers who need stable quality/i)).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Production Strength You Can Verify/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Explore Core Product Categories/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Start Your Quote With the Right Details/i })).toBeInTheDocument();

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/products/?featured=true&lang=en'));
  });
});
