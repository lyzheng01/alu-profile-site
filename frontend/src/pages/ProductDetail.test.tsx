import '@testing-library/jest-dom';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import ProductDetail from './ProductDetail';
import { getProductPageGuide } from '../data/productPageGuides';

jest.mock('../contexts/TranslationContext', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback || '',
    currentLanguage: 'en',
  }),
}));

jest.mock('../hooks/useSeoMeta', () => ({ useSeoMeta: jest.fn() }));
jest.mock('../hooks/useStructuredData', () => ({ useStructuredData: jest.fn() }));
jest.mock('../components/FloatingContactButtons', () => () => <div />);
jest.mock('../components/InquiryForm', () => () => <div data-testid="product-inquiry-form" />);

test('renders the main product while related products are still loading', async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 31,
        slug: 'angle-bracket',
        name: 'Aluminum Angle Bracket',
        category: { id: 3, name: 'T-Slot Framing Profiles' },
        images: [],
        specification_items: [],
        feature_items: [],
        application_items: [],
        factory_images: [],
      }),
    })
    .mockReturnValueOnce(new Promise(() => {})) as jest.Mock;

  render(
    <MemoryRouter initialEntries={['/en/products/angle-bracket']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/en/products/:productSlug" element={<ProductDetail />} />
      </Routes>
    </MemoryRouter>
  );

  expect(await screen.findByRole('heading', { name: /aluminum angle bracket/i })).toBeInTheDocument();
});

test('adds product-specific buying guidance to description and applications', async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        slug: 'glass-door-frame-profiles',
        name: 'Glass Door Frame Profiles',
        description: 'Aluminium framing profiles for glass cabinet and wardrobe doors.',
        applications: 'Cabinet doors; wardrobe fronts; interior partitions.',
        category: { id: 1, name: 'Cabinet & Wardrobe Profiles' },
        images: [],
        specification_items: [],
        feature_items: [],
        application_items: [],
        factory_images: [],
      }),
    })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) }) as jest.Mock;

  render(
    <MemoryRouter initialEntries={['/en/products/glass-door-frame-profiles']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/en/products/:productSlug" element={<ProductDetail />} />
      </Routes>
    </MemoryRouter>
  );

  const guide = getProductPageGuide('glass-door-frame-profiles', 'en');
  expect(await screen.findByText(guide!.description)).toBeInTheDocument();
  expect(screen.getByText(guide!.applications)).toBeInTheDocument();
});

test('describes the real product without inventing a manufacturer, offer, or ratings', async () => {
  const useStructuredData = jest.requireMock('../hooks/useStructuredData').useStructuredData as jest.Mock;
  global.fetch = jest.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 31,
        slug: 'angle-bracket',
        name: 'Aluminum Angle Bracket',
        description: 'A project-specific profile component.',
        grade: '6063-T5',
        category: { id: 3, name: 'T-Slot Framing Profiles' },
        images: [{ image: '/media/angle-bracket.webp' }],
        specification_items: [],
        feature_items: [],
        application_items: [],
        factory_images: [],
      }),
    })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) }) as jest.Mock;

  render(
    <MemoryRouter initialEntries={['/en/products/angle-bracket']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/en/products/:productSlug" element={<ProductDetail />} />
      </Routes>
    </MemoryRouter>
  );

  await screen.findByRole('heading', { name: /aluminum angle bracket/i });
  await waitFor(() => {
    const productCall = useStructuredData.mock.calls
      .filter(([id, data]) => id === 'product' && data)
      .slice(-1)[0];
    expect(productCall?.[1]).toMatchObject({
      '@type': 'Product',
      name: 'Aluminum Angle Bracket',
      category: 'T-Slot Framing Profiles',
      material: '6063-T5',
    });
    expect(productCall?.[1]).not.toHaveProperty('manufacturer');
    expect(productCall?.[1]).not.toHaveProperty('offers');
    expect(productCall?.[1]).not.toHaveProperty('aggregateRating');
  });
});

test('uses localized related-product names for cards and image alternatives', async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 31,
        slug: 'angle-bracket',
        name: 'Perfil con ranura en T 20 × 40 mm',
        category: { id: 3, name: 'Perfiles con ranura en T' },
        images: [],
        specification_items: [],
        feature_items: [],
        application_items: [],
        factory_images: [],
      }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [{
          id: 32,
          slug: '2020-t-slot-aluminium-profile',
          name: '',
          translated_name: 'Perfil de aluminio con ranura en T 20 × 20 mm',
          images: [{ id: 1, image: '/media/2020.webp' }],
        }],
      }),
    }) as jest.Mock;

  render(
    <MemoryRouter initialEntries={['/es/products/angle-bracket']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/es/products/:productSlug" element={<ProductDetail />} />
      </Routes>
    </MemoryRouter>
  );

  expect(await screen.findByRole('heading', { name: 'Perfil de aluminio con ranura en T 20 × 20 mm' })).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Perfil de aluminio con ranura en T 20 × 20 mm' })).toBeInTheDocument();
});

test('adds the shared factory showcase and preserves product-specific factory photos', async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 12,
        slug: '2040-t-slot-aluminium-profile',
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
        images: [{ id: 5, image: '/media/products/catalog/2040-t-slot-aluminium-profile.webp' }],
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
  expect(screen.getByText(/Illustrative reference only/i)).toBeInTheDocument();
  expect(document.querySelector('#inquiry')).toContainElement(screen.getByTestId('product-inquiry-form'));
  expect(screen.getByText('Send these details for a faster reply')).toBeInTheDocument();
  expect(screen.getByText('Profile drawing or reference photo')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Product factory gallery photo' })).toBeInTheDocument();
  expect(screen.queryByText(/10\+ Years Aluminium Manufacturing Experience/i)).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /Why choose us\?/i })).not.toBeInTheDocument();

  const structuredDataCalls = (jest.requireMock('../hooks/useStructuredData').useStructuredData as jest.Mock).mock.calls;
  const productCall = [...structuredDataCalls].reverse().find(([key]) => key === 'product');
  expect(productCall?.[1]['@type']).toBe('Product');
  expect(productCall?.[1]).toMatchObject({
    name: 'Test Aluminum Profile',
    category: 'Industrial Profiles',
  });
  expect(productCall?.[1]).not.toHaveProperty('manufacturer');
  expect(productCall?.[1]).not.toHaveProperty('offers');
  const breadcrumbCall = [...structuredDataCalls].reverse().find(([key]) => key === 'product-breadcrumb');
  expect(breadcrumbCall?.[1].itemListElement.map((item: { name: string }) => item.name)).toEqual([
    'Home', 'Products', 'Test Aluminum Profile',
  ]);
  expect(jest.requireMock('../hooks/useSeoMeta').useSeoMeta).toHaveBeenCalledWith(expect.objectContaining({
    canonicalPath: '/en/products/2040-t-slot-aluminium-profile',
    language: 'en',
    title: 'Test Aluminum Profile | LingYe',
  }));
});

test('does not invent alloy or temper values or show an unrelated fallback description', async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 24,
        slug: 'custom-window-system',
        name: 'Custom Window System',
        description: '',
        category: { id: 4, name: 'Window & Door Profiles' },
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
        factory_images: [],
        created_at: '2026-01-01T00:00:00Z',
      }),
    })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) }) as jest.Mock;

  render(
    <MemoryRouter initialEntries={['/en/products/custom-window-system']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/en/products/:productSlug" element={<ProductDetail />} />
      </Routes>
    </MemoryRouter>
  );

  expect(await screen.findByRole('heading', { name: /custom window system/i })).toBeInTheDocument();
  expect(screen.queryByText('6061, 6063')).not.toBeInTheDocument();
  expect(screen.queryByText('T5, T6')).not.toBeInTheDocument();
  expect(screen.queryByText(/aluminium tile trim is a durable edging profile/i)).not.toBeInTheDocument();
  const productCall = (jest.requireMock('../hooks/useStructuredData').useStructuredData as jest.Mock).mock.calls
    .filter(([id, data]) => id === 'product' && data).slice(-1)[0];
  expect(productCall?.[1]).not.toHaveProperty('material');
});
