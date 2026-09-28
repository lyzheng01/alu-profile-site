import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import About from './About';

jest.mock('../contexts/TranslationContext', () => ({
  useTranslation: () => ({
    currentLanguage: 'en',
    t: (_key: string, fallback?: string) => fallback || '',
  }),
}));

jest.mock('../hooks/useSeoMeta', () => ({ useSeoMeta: jest.fn() }));
jest.mock('../hooks/useStructuredData', () => ({ useStructuredData: jest.fn() }));

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ results: [] }),
  }) as unknown as typeof fetch;
});

test('uses the supplied extrusion-line photo as the company introduction image', async () => {
  render(<About />);

  const image = await screen.findByRole('img', { name: 'Aluminium extrusion production line' });
  expect(image).toHaveAttribute('src', '/images/factory-extrusion-lines.webp');
  expect(screen.getByText('Aluminum profile solutions with project-specific coordination')).toBeInTheDocument();
  expect(screen.getByText(/LingYe helps buyers discuss architectural and industrial aluminum profile requirements/i)).toBeInTheDocument();
  expect(screen.queryByText('15')).not.toBeInTheDocument();
  expect(screen.queryByText('60+')).not.toBeInTheDocument();
  expect(screen.queryByText('50000')).not.toBeInTheDocument();
  expect(screen.queryByText(/professional aluminum profile manufacturer/i)).not.toBeInTheDocument();
  const structuredDataCalls = (jest.requireMock('../hooks/useStructuredData').useStructuredData as jest.Mock).mock.calls;
  const organizationCall = structuredDataCalls.find(([key]) => key === 'about-organization');
  expect(organizationCall?.[1].description).not.toMatch(/manufacturer|factory-direct/i);
});
