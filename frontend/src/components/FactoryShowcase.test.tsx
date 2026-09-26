import '@testing-library/jest-dom';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import FactoryShowcase from './FactoryShowcase';

jest.mock('../contexts/TranslationContext', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback || '',
    currentLanguage: 'en',
  }),
}));

test('renders localized factory context with the approved images and About link', () => {
  render(
    <MemoryRouter initialEntries={['/en/products']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <FactoryShowcase />
    </MemoryRouter>
  );

  expect(screen.getByRole('heading', { name: 'Factory Showcase' })).toBeInTheDocument();
  expect(screen.getByText('Advanced production equipment and modern factory')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Aluminum extrusion production line' })).toHaveAttribute(
    'src',
    '/images/factory-extrusion-lines.webp'
  );
  expect(screen.getByRole('img', { name: 'Aluminum extrusion factory crane' })).toHaveAttribute(
    'src',
    '/images/factory-crane-clean.webp'
  );
  expect(screen.getByRole('link', { name: 'Explore our factory' })).toHaveAttribute('href', '/en/about');
});
