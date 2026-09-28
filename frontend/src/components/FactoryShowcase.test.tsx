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

  expect(screen.getByRole('heading', { name: 'Manufacturing Capabilities' })).toBeInTheDocument();
  expect(screen.getByText('Production scenes and manufacturing resources for project-specific aluminum profile requirements.')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Aluminum extrusion production line' })).toHaveAttribute(
    'src',
    '/images/factory-extrusion-lines.webp'
  );
  expect(screen.getByRole('img', { name: 'Aluminum extrusion factory crane' })).toHaveAttribute(
    'src',
    '/images/factory-crane-clean.webp'
  );
  expect(screen.getByRole('link', { name: 'Learn about our approach' })).toHaveAttribute('href', '/en/about');
  expect(screen.queryByText(/our factory|factory showcase/i)).not.toBeInTheDocument();
});
