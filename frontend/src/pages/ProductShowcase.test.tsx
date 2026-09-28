import '@testing-library/jest-dom';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import ProductShowcase from './ProductShowcase';

jest.mock('../contexts/TranslationContext', () => ({
  useTranslation: () => ({ currentLanguage: 'en', t: (_key: string, fallback?: string) => fallback || '' }),
}));

jest.mock('../hooks/useSeoMeta', () => ({ useSeoMeta: jest.fn() }));
jest.mock('../hooks/useStructuredData', () => ({ useStructuredData: jest.fn() }));
jest.mock('../components/FloatingContactButtons', () => () => <div />);
jest.mock('../components/InquiryForm', () => () => <div />);

test('uses the clean supplied surface-finish, quality and factory images', () => {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ProductShowcase />
    </MemoryRouter>
  );

  expect(screen.getByTestId('factory-showcase')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Aluminum surface finish samples' })).toHaveAttribute(
    'src',
    '/images/surface-treatment-options-clean.webp'
  );
  expect(screen.getByRole('img', { name: 'Aluminum profile quality control process' })).toHaveAttribute(
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
  expect(screen.queryByText(/1,800-3,600T|12\+ anodizing tanks|European-class|within 5 days|15-year surface warranty|±0\.08 mm/i)).not.toBeInTheDocument();

  const structuredDataCalls = (jest.requireMock('../hooks/useStructuredData').useStructuredData as jest.Mock).mock.calls;
  const productCall = structuredDataCalls.find(([key]) => key === 'showcase-product');
  expect(productCall?.[1]).not.toHaveProperty('manufacturer');
});
