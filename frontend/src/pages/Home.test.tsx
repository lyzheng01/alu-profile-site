import '@testing-library/jest-dom';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  const heroHeading = await screen.findByRole('heading', { name: /Precision Aluminum Extrusion Solutions/i });
  expect(heroHeading).toBeInTheDocument();
  expect(heroHeading).toHaveClass('text-4xl', 'sm:text-5xl', 'md:text-6xl');
  const heroSection = heroHeading.closest('section');
  expect(heroSection).toHaveClass('min-h-[480px]', 'sm:min-h-[560px]', 'lg:min-h-[640px]');
  const heroContent = heroHeading.parentElement?.parentElement?.parentElement;
  expect(heroContent).toHaveClass('pt-10', 'lg:pt-16');
  expect(heroContent).not.toHaveClass('pt-20', 'lg:pt-28');
  expect(screen.getByText(/High-quality aluminum profiles for industrial, architectural, and custom applications/i)).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText('Go to slide 2'));
  expect(screen.getByRole('heading', { name: /Custom Profiles, Reliable Manufacture/i })).toBeInTheDocument();
  expect(screen.getByText(/From design to production, we deliver tailored aluminum extrusion solutions with consistent quality/i)).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText('Go to slide 3'));
  expect(screen.getByRole('heading', { name: /Your Trusted Aluminum Extrusion Partner/i })).toBeInTheDocument();
  expect(screen.getByText(/Serving customers worldwide with durable products, competitive pricing, and on-time delivery/i)).toBeInTheDocument();
  expect(screen.queryByText('支持 OEM 和 ODM 铝型材定制')).not.toBeInTheDocument();
  expect(screen.queryByText('建筑与工业型材稳定供应')).not.toBeInTheDocument();
  expect(screen.queryByText('快速响应出口询价需求')).not.toBeInTheDocument();
  expect(screen.queryByText(/Aluminum extrusion, finishing, and export support from China/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Aluminum extrusion and export support/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/6061 \/ 6063 alloy support/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Surface finishing/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/OEM drawing review/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Export packaging/i)).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Get a Quote/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('link', { name: /View Products/i })).not.toBeInTheDocument();
  expect(screen.getByTestId('home-stats-grid')).toHaveClass('sm:grid-cols-3');
  const statCards = screen.getAllByTestId('home-stat-card');
  expect(statCards).toHaveLength(3);
  expect(statCards[0]).toHaveTextContent('10+');
  expect(statCards[0]).toHaveTextContent(/Years manufacturing/i);
  expect(statCards[1]).toHaveTextContent('40+');
  expect(statCards[1]).toHaveTextContent(/Global Markets/i);
  expect(statCards[2]).toHaveTextContent('20000');
  expect(statCards[2]).toHaveTextContent(/Annual Output\(tons\)/i);
  expect(screen.queryByText(/Extrusion and finishing lines/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Days standard lead time/i)).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Explore Core Product Categories/i })).toBeInTheDocument();
  expect(screen.queryByText(/^Category navigation$/i)).not.toBeInTheDocument();
  const categoryImage = await screen.findByAltText('Construction Profiles');
  expect(categoryImage).toHaveAttribute('src', expect.stringContaining('/media/products/chile_1.jpg'));
  expect(categoryImage).toHaveClass('object-contain', 'object-center');
  expect(categoryImage).toHaveAttribute('loading', 'eager');
  const categoryLink = screen.getByRole('link', { name: /Construction Profiles/i });
  expect(categoryLink.parentElement).toHaveClass('md:grid-cols-3');
  expect(screen.getByText('Construction Profiles')).toBeInTheDocument();
  expect(screen.queryByText('Built for doors, windows, and facade projects.')).not.toBeInTheDocument();
  expect(screen.queryByText('View Category')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Browse by Profile Application/i })).toBeInTheDocument();
  expect(screen.queryByText(/^Profile applications$/i)).not.toBeInTheDocument();
  expect(screen.getByText(/Window, door, industrial frame, tube, and structural profile/i)).toBeInTheDocument();
  const windowProfilesLink = screen.getByRole('link', { name: /Window & Door Profiles/i });
  expect(windowProfilesLink).toHaveAttribute(
    'href',
    '/en/products?category=6&subcategory=1'
  );
  expect(screen.getByRole('link', { name: /Industrial T-Slot Framing/i })).toHaveAttribute(
    'href',
    '/en/products?category=5'
  );
  expect(screen.getByRole('link', { name: /Tube & Structural Profiles/i })).toHaveAttribute(
    'href',
    '/en/products?category=7'
  );
  expect(windowProfilesLink.querySelector('img')).toHaveClass('object-contain', 'object-center');
  expect(screen.getByRole('heading', { name: /Manufacturing Capabilities Buyers Check First/i })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /Start Your Quote With the Right Details/i })).toBeInTheDocument();

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/products/?featured=true&lang=en'));
  });
});
