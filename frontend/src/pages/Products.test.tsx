import '@testing-library/jest-dom';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import Products from './Products';
import { useSeoMeta } from '../hooks/useSeoMeta';

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

test('loads products from every API page before applying the selected category', async () => {
  const windowProducts = Array.from({ length: 10 }, (_, index) => ({
    id: index + 41,
    slug: `window-system-${index + 1}`,
    name: `Window System ${index + 1}`,
    translated_name: `Window System ${index + 1}`,
    translated_description: 'Project-defined window system profile.',
    category: { id: 4, name: 'Window & Door Profiles' },
    images: [],
    features: '',
    applications: '',
    specifications: {},
    created_at: '2026-01-01T00:00:00Z',
  }));

  mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/api/products/')) {
      if (url.includes('page=2')) {
        return { ok: true, json: async () => ({ results: windowProducts, next: null }) };
      }
      return {
        ok: true,
        json: async () => ({
          results: [{
            id: 1,
            slug: 'first-page-product',
            name: 'First Page Product',
            translated_name: 'First Page Product',
            category: { id: 1, name: 'Cabinet Profiles' },
            images: [],
            features: '',
            applications: '',
            specifications: {},
            created_at: '2026-01-01T00:00:00Z',
          }],
          next: 'https://lingyealuminum.com/api/products/?lang=en&page=2',
        }),
      };
    }
    return {
      ok: true,
      json: async () => ({
        results: [{
          id: 4,
          name: 'Window & Door Profiles',
          translated_name: 'Window & Door Profiles',
          description: 'Window and door systems.',
          translated_description: 'Window and door systems.',
          subcategories: [],
        }],
      }),
    };
  });

  render(
    <MemoryRouter initialEntries={['/en/products?category=4']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Products />
    </MemoryRouter>
  );

  expect(await screen.findByRole('heading', { name: 'Window System 1' })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: 'First Page Product' })).not.toBeInTheDocument();
  expect(screen.getByText('Found 10 products')).toBeInTheDocument();
  expect(mockFetch).toHaveBeenCalledWith('https://lingyealuminum.com/api/products/?lang=en&page=2');
});

test('marks the catalog ready only after product data has finished loading', async () => {
  let resolveProducts!: (value: unknown) => void;
  const productsResponse = new Promise((resolve) => { resolveProducts = resolve; });
  mockFetch.mockImplementation((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/api/products/')) return productsResponse;
    return Promise.resolve({
      ok: true,
      json: async () => ({ results: [], next: null }),
    });
  });

  render(
    <MemoryRouter initialEntries={['/en/products/category/t-slot-profiles']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Products />
    </MemoryRouter>
  );

  const catalog = await screen.findByTestId('products-page');
  expect(catalog).toHaveAttribute('data-products-ready', 'false');
  resolveProducts({ ok: true, json: async () => ({ results: [], next: null }) });
  await waitFor(() => expect(catalog).toHaveAttribute('data-products-ready', 'true'));
});

test.each([
  ['en', /window & door aluminum profiles/i, /mating sections and hardware/i, /window profile system/i, /windows & doors/i],
  ['zh', /门窗铝型材选型与询价指南/i, /配合型材与五金接口/i, /门窗型材系统截面示意图/i, /门窗型材/i],
  ['es', /perfiles de aluminio para ventanas y puertas/i, /perfiles acoplados y herrajes/i, /perfiles para ventanas/i, /ventanas y puertas/i],
  ['pt', /perfis de alumínio para janelas e portas/i, /perfis conjugados e ferragens/i, /perfis para janelas/i, /janelas e portas/i],
])('renders localized window guidance and SEO for %s', async (language, titlePattern, contentPattern, imageAltPattern, categoryLabelPattern) => {
  window.localStorage.setItem('language', language);
  (useSeoMeta as jest.Mock).mockClear();
  mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/api/products/?')) {
      return { ok: true, json: async () => ({ results: [], next: null }) };
    }
    return {
      ok: true,
      json: async () => ({
        results: [{
          id: 4,
          slug: 'windows-doors',
          name: 'Window & Door Profiles',
          translated_name: 'Perfiles para ventanas y puertas',
          description: 'Project-based window and door sourcing.',
          translated_description: 'Perfiles para proyectos de ventanas y puertas.',
          subcategories: [],
        }],
      }),
    };
  });

  render(
      <MemoryRouter initialEntries={[`/${language}/products/category/windows-doors`]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/:lang/products/category/:categorySlug" element={<Products />} />
      </Routes>
    </MemoryRouter>
  );

  expect(await screen.findByRole('heading', { name: titlePattern })).toBeInTheDocument();
  expect(screen.getByText(contentPattern)).toBeInTheDocument();
  expect(screen.getByRole('img', { name: imageAltPattern })).toHaveAttribute(
    'src',
    '/images/thermal-break-window-system.webp'
  );
  const categoryLink = screen.getAllByRole('link', { name: categoryLabelPattern })
    .find((link) => link.getAttribute('href') === `/${language}/products/category/windows-doors`);
  expect(categoryLink).toBeInTheDocument();
  expect(useSeoMeta).toHaveBeenCalledWith(expect.objectContaining({
    canonicalPath: `/${language}/products/category/windows-doors`,
    language,
    title: expect.stringMatching(titlePattern),
  }));
});

const additionalCategoryCases = [
  {
    slug: 'cabinet-profiles',
    id: 1,
    titles: {
      en: /cabinet & wardrobe aluminum profiles/i,
      zh: /橱柜与衣柜铝型材/i,
      es: /perfiles de aluminio para muebles y armarios/i,
      pt: /perfis de alumínio para móveis e armários/i,
    },
  },
  {
    slug: 'industrial-profiles',
    id: 2,
    titles: {
      en: /industrial aluminum extrusion profiles/i,
      zh: /工业铝挤压型材/i,
      es: /perfiles industriales de aluminio extrusionado/i,
      pt: /perfis industriais de alumínio extrudado/i,
    },
  },
  {
    slug: 't-slot-profiles',
    id: 3,
    titles: {
      en: /t-slot aluminum framing profiles/i,
      zh: /T型槽铝型材与框架系统/i,
      es: /perfiles estructurales de aluminio con ranura en T/i,
      pt: /perfis estruturais de alumínio com ranhura em T/i,
    },
  },
  {
    slug: 'standard-aluminium-profiles',
    id: 5,
    titles: {
      en: /standard aluminum profiles: sections and specifications/i,
      zh: /常用铝型材截面与规格/i,
      es: /perfiles estándar de aluminio: secciones y especificaciones/i,
      pt: /perfis padrão de alumínio: seções e especificações/i,
    },
  },
];

test.each(additionalCategoryCases.flatMap((category) =>
  (['en', 'zh', 'es', 'pt'] as const).map((language) => ({ category, language }))
))('opens localized $category.slug category landing page in $language', async ({ category, language }) => {
  window.localStorage.setItem('language', language);
  mockFetch.mockImplementation(async (input: RequestInfo | URL) => {
    if (String(input).includes('/api/products/?')) {
      return { ok: true, json: async () => ({ results: [], next: null }) };
    }
    return {
      ok: true,
      json: async () => ({
        results: [{
          id: category.id,
          slug: category.slug,
          name: 'Source category name',
          description: 'Source category description',
          subcategories: [],
        }],
      }),
    };
  });

  render(
    <MemoryRouter initialEntries={[`/${language}/products/category/${category.slug}`]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/:lang/products/category/:categorySlug" element={<Products />} />
      </Routes>
    </MemoryRouter>
  );

  expect(await screen.findByRole('heading', { name: category.titles[language] })).toBeInTheDocument();
  expect(useSeoMeta).toHaveBeenCalledWith(expect.objectContaining({
    canonicalPath: `/${language}/products/category/${category.slug}`,
    language,
    title: expect.any(String),
  }));
});
