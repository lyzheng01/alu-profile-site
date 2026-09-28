import '@testing-library/jest-dom';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { API_ENDPOINTS } from '../config/api';
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
            id: 6,
            name: 'Construction Profiles',
            description: 'Built for doors, windows, and facade projects.',
            image: '/media/category-1.jpg',
          },
        ],
      }),
    });

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Home />
    </MemoryRouter>
  );

  const heroHeading = await screen.findByRole('heading', { name: /Aluminum Profile Solutions for Your Project/i });
  const factoryShowcase = await screen.findByTestId('factory-showcase');
  const homeText = document.body.textContent || '';
  expect(homeText.indexOf('Recommended Profiles for High-Intent Buyers')).toBeLessThan(homeText.indexOf('Manufacturing Capabilities'));
  expect(homeText.indexOf('Manufacturing Capabilities')).toBeLessThan(homeText.indexOf('Profile Finishes and Applications'));
  expect(factoryShowcase).toBeInTheDocument();
  expect(heroHeading).toBeInTheDocument();
  expect(heroHeading).toHaveClass('text-4xl', 'sm:text-5xl', 'md:text-6xl');
  const heroSection = heroHeading.closest('section');
  expect(heroSection).toHaveClass('min-h-[480px]', 'sm:min-h-[560px]', 'lg:min-h-[640px]');
  const heroContent = heroHeading.parentElement?.parentElement?.parentElement;
  expect(heroContent).toHaveClass('pt-10', 'lg:pt-16');
  expect(heroContent).not.toHaveClass('pt-20', 'lg:pt-28');
  expect(screen.getByText(/Custom extrusion, finishing options, and project support/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Send a drawing/i })).toHaveAttribute('href', '#home-inquiry-form');
  expect(screen.getByRole('link', { name: /Browse products/i })).toHaveAttribute('href', '/en/products');
  fireEvent.click(screen.getByLabelText('Go to slide 2'));
  expect(screen.getByRole('heading', { name: /Aluminum Profile Solutions for Your Project/i })).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText('Go to slide 3'));
  expect(screen.getByRole('heading', { name: /Aluminum Profile Solutions for Your Project/i })).toBeInTheDocument();
  expect(screen.queryByText('支持 OEM 和 ODM 铝型材定制')).not.toBeInTheDocument();
  expect(screen.queryByText('建筑与工业型材稳定供应')).not.toBeInTheDocument();
  expect(screen.queryByText('快速响应出口询价需求')).not.toBeInTheDocument();
  expect(screen.queryByText(/Aluminum extrusion, finishing, and export support from China/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Aluminum extrusion and export support/i)).not.toBeInTheDocument();
  expect(screen.getByTestId('home-capability-strip')).toBeInTheDocument();
  expect(screen.getByText(/Five core profile categories/i)).toBeInTheDocument();
  expect(screen.getByText(/Drawing-based custom requirements/i)).toBeInTheDocument();
  expect(screen.getByText(/Surface finishing and processing options/i)).toBeInTheDocument();
  expect(screen.getByText(/Project inquiry and export coordination/i)).toBeInTheDocument();
  expect(screen.queryByText(/Catalog references/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Regional window & door ranges/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/keeps the homepage commercially useful/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/form keeps the RFQ path visible/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Extrusion and finishing lines/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Days standard lead time/i)).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Explore Core Product Categories/i })).toBeInTheDocument();
  expect(screen.queryByText(/^Category navigation$/i)).not.toBeInTheDocument();
  const categoryImage = await screen.findByAltText('Construction Profiles');
  expect(categoryImage).toHaveAttribute('src', expect.stringContaining('/media/category-1.jpg'));
  expect(categoryImage).toHaveClass('object-contain', 'object-center');
  expect(categoryImage).toHaveAttribute('loading', 'lazy');
  const categoryLink = screen.getByRole('link', { name: /Construction Profiles/i });
  expect(categoryLink.parentElement).toHaveClass('md:grid-cols-3');
  expect(screen.getByText('Construction Profiles')).toBeInTheDocument();
  expect(screen.queryByText('Built for doors, windows, and facade projects.')).not.toBeInTheDocument();
  expect(screen.queryByText('View Category')).not.toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /Browse by Profile Application/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /Window & Door Profiles/i })).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Profile Finishes and Applications/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Start Your Quote With the Right Details/i })).toBeInTheDocument();

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/products/?featured=true&lang=en'));
  });
  expect(mockFetch).not.toHaveBeenCalledWith(API_ENDPOINTS.FACTORY_IMAGES);
});

test('uses three factory photos instead of product photos in the homepage hero carousel', async () => {
  mockFetch.mockResolvedValue({ ok: true, json: async () => ({ results: [] }) });

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Home />
    </MemoryRouter>
  );

  const heroHeading = await screen.findByRole('heading', { name: /Aluminum Profile Solutions for Your Project/i });
  const heroSection = heroHeading.closest('section');
  const slideLayers = Array.from(heroSection?.querySelectorAll('div[style*="background-image"]') || []);

  expect(screen.getAllByRole('button', { name: /Go to slide/ })).toHaveLength(3);
  expect(slideLayers).toHaveLength(3);
  expect(slideLayers.map((layer) => layer.getAttribute('style')).join(' ')).toContain('/images/factory-extrusion-lines.webp');
  expect(slideLayers.map((layer) => layer.getAttribute('style')).join(' ')).toContain('/images/factory-crane-clean.webp');
  expect(slideLayers.map((layer) => layer.getAttribute('style')).join(' ')).toContain('/images/factory-quality-inspection.webp');
  expect(slideLayers.map((layer) => layer.getAttribute('style')).join(' ')).not.toContain('/media/products/');
});

test('shows the complete five-category catalog without unverified factory statistics', async () => {
  mockFetch
    .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: ['Cabinet Profiles', 'Industrial Profiles', 'T-Slot Profiles', 'Windows & Doors', 'Standard Profiles'].map(
          (name, id) => ({ id: id + 1, name, image: `/media/category-${id + 1}.jpg` })
        ),
      }),
    });

  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Home />
    </MemoryRouter>
  );

  await screen.findByRole('link', { name: /Standard Profiles/i });
  expect(screen.getAllByRole('link').filter((link) => /Profiles|Windows & Doors/.test(link.textContent || '')).length).toBeGreaterThanOrEqual(5);
  expect(screen.queryByText(/Years manufacturing|Global Markets|Annual Output/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/LingYe Aluminum factory image/i)).not.toBeInTheDocument();
});
