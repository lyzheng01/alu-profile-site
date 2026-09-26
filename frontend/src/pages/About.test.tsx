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
});
