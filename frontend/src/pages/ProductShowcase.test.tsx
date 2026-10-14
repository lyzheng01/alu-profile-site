import '@testing-library/jest-dom';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import ProductShowcase from './ProductShowcase';

let mockLanguage = 'en';

jest.mock('../contexts/TranslationContext', () => ({
  useTranslation: () => ({ currentLanguage: mockLanguage, t: (_key: string, fallback?: string) => fallback || '' }),
}));

jest.mock('../hooks/useSeoMeta', () => ({ useSeoMeta: jest.fn() }));
jest.mock('../hooks/useStructuredData', () => ({ useStructuredData: jest.fn() }));
jest.mock('../components/FloatingContactButtons', () => () => <div />);
jest.mock('../components/InquiryForm', () => () => <div />);

test('uses the clean supplied surface-finish, quality and factory images', () => {
  mockLanguage = 'en';
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ProductShowcase />
    </MemoryRouter>
  );

  expect(screen.getByTestId('factory-showcase')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Surface Finishes and Textures' })).toHaveAttribute(
    'src',
    '/images/surface-treatment-options-clean.webp'
  );
  expect(screen.getByRole('img', { name: 'Aluminum profile quality-control inspection' })).toHaveAttribute(
    'src',
    '/images/quality-control-process-clean.webp'
  );
  expect(screen.getByRole('img', { name: 'Aluminum extrusion factory crane' })).toHaveAttribute(
    'src',
    '/images/factory-crane-clean.webp'
  );
  expect(screen.getByRole('img', { name: 'Aluminum extrusion production line' })).toHaveAttribute(
    'src',
    '/images/factory-extrusion-lines.webp'
  );
  expect(screen.getByRole('heading', { name: 'Project Specifications to Confirm' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Project Coordination' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'How Project Coordination Works' })).toBeInTheDocument();
  expect(screen.queryByText(/2\.6 W\/m²·K|120 kg|1,000\+/i)).not.toBeInTheDocument();

  const structuredDataCalls = (jest.requireMock('../hooks/useStructuredData').useStructuredData as jest.Mock).mock.calls;
  const productCall = structuredDataCalls.find(([key]) => key === 'showcase-product');
  expect(productCall?.[1]['@type']).toBe('WebPage');
  expect(productCall?.[1]).not.toHaveProperty('manufacturer');
});

test.each([
  ['en', /aluminum window & door profile systems/i],
  ['zh', /门窗与幕墙铝型材系统/i],
  ['es', /sistemas de perfiles de aluminio para ventanas, puertas y fachadas/i],
  ['pt', /sistemas de perfis de alumínio para janelas, portas e fachadas/i],
])('renders the localized showcase and metadata for %s', (language, titlePattern) => {
  mockLanguage = language;
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ProductShowcase />
    </MemoryRouter>
  );

  expect(screen.getByRole('heading', { level: 1, name: titlePattern })).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 2, name: /confirm|确认|verificar|confirmar/i })).toBeInTheDocument();
  expect(jest.requireMock('../hooks/useSeoMeta').useSeoMeta).toHaveBeenCalledWith(expect.objectContaining({
    canonicalPath: `/${language}/products/windows-doors/showcase`,
    language,
    title: expect.any(String),
  }));
  expect(screen.queryByText(/2\.6 W\/m²·K|120 kg|1,000\+/i)).not.toBeInTheDocument();
});
