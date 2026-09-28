import '@testing-library/jest-dom';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import ProductDetail from './ProductDetail';

jest.mock('../contexts/TranslationContext', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback || '',
    currentLanguage: 'en',
  }),
}));

jest.mock('../hooks/useSeoMeta', () => ({ useSeoMeta: jest.fn() }));
jest.mock('../hooks/useStructuredData', () => ({ useStructuredData: jest.fn() }));
jest.mock('../components/FloatingContactButtons', () => () => <div />);
jest.mock('../components/InquiryForm', () => () => <div />);

test('adds the shared factory showcase and preserves product-specific factory photos', async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 12,
        slug: 'test-aluminum-profile',
        name: 'Test Aluminum Profile',
        description: 'Test description',
        category: { id: 3, name: 'Industrial Profiles' },
        features: '',
        applications: '',
        specifications: '',
        range_param: '',
        type_param: '',
        surface_treatment: '',
        colors: '',
        grade: '',
        temper: '',
        specification_items: [],
        feature_items: [],
        application_items: [],
        images: [],
        factory_images: [
          { id: 1, title: 'Product factory gallery photo', image: '/media/product-factory.jpg' },
          { id: 2, title: 'Filtered extra factory photo', image: '/media/extra-factory.jpg' },
          { id: 3, title: 'Filtered trailing factory photo', image: '/media/trailing-factory.jpg' },
        ],
        created_at: '2026-01-01T00:00:00Z',
      }),
    })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) }) as jest.Mock;

  render(
    <MemoryRouter initialEntries={['/en/products/test-aluminum-profile']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/en/products/:productSlug" element={<ProductDetail />} />
      </Routes>
    </MemoryRouter>
  );

  expect(await screen.findByTestId('factory-showcase')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Product factory gallery photo' })).toBeInTheDocument();
  expect(screen.queryByText(/10\+ Years Aluminium Manufacturing Experience/i)).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /Why choose us\?/i })).not.toBeInTheDocument();

  const structuredDataCalls = (jest.requireMock('../hooks/useStructuredData').useStructuredData as jest.Mock).mock.calls;
  const productCall = [...structuredDataCalls].reverse().find(([key]) => key === 'product');
  expect(productCall?.[1]).toMatchObject({ brand: { name: 'LingYe Aluminum' } });
  expect(productCall?.[1]).not.toHaveProperty('manufacturer');
});
