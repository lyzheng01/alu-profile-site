import '@testing-library/jest-dom';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import LongtailLanding from './LongtailLanding';

jest.mock('../contexts/TranslationContext', () => ({
  useTranslation: () => ({ currentLanguage: 'en', t: (_key: string, fallback?: string) => fallback || '' }),
}));
jest.mock('../hooks/useSeoMeta', () => ({ useSeoMeta: jest.fn() }));
jest.mock('../hooks/useStructuredData', () => ({ useStructuredData: jest.fn() }));
jest.mock('../components/FloatingContactButtons', () => () => <div />);
jest.mock('../components/FactoryShowcase', () => () => <div />);

beforeEach(() => {
  global.fetch = jest.fn(() => new Promise(() => undefined)) as unknown as typeof fetch;
});

test('keeps the existing industrial URL while presenting neutral project coordination copy', () => {
  render(
    <MemoryRouter
      initialEntries={['/en/industrial-aluminum-extrusion-manufacturer-in-china']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/en/:slug" element={<LongtailLanding />} />
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByRole('heading', { name: 'Industrial Aluminum Profiles for Equipment and Automation' })).toBeInTheDocument();
  expect(screen.getByText(/coordinate manufacturing resources/i)).toBeInTheDocument();
  expect(screen.queryByText(/48 hours|within 5 days|factory-direct|manufacturer in China/i)).not.toBeInTheDocument();

  const structuredDataCalls = (jest.requireMock('../hooks/useStructuredData').useStructuredData as jest.Mock).mock.calls;
  const productCall = structuredDataCalls.find(([key]) => key === 'landing-industrial-aluminum-extrusion-manufacturer-in-china');
  expect(productCall?.[1]).not.toHaveProperty('manufacturer');
});
