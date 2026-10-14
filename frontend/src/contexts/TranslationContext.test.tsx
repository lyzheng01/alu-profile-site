import { resolveInitialLanguage } from './TranslationContext';
import '@testing-library/jest-dom';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { TranslationProvider, useTranslation } from './TranslationContext';

test.each(['en', 'zh', 'es', 'pt'])('uses the URL locale %s before the first render', (language) => {
  expect(resolveInitialLanguage(`/${language}/products`, 'en')).toBe(language);
});

test('uses the saved fallback for routes without a supported locale prefix', () => {
  expect(resolveInitialLanguage('/products', 'pt')).toBe('pt');
});

test('signals readiness only after URL-locale translations have loaded', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ content: { greeting: 'Hola' } }),
  }) as jest.Mock;
  const Probe = () => {
    const { t } = useTranslation();
    return <p>{t('greeting', 'Hello')}</p>;
  };
  render(
    <MemoryRouter initialEntries={['/es/news']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <TranslationProvider><Probe /></TranslationProvider>
    </MemoryRouter>
  );

  expect(screen.getByText('Hello').parentElement).toHaveAttribute('data-translation-ready', 'false');
  await waitFor(() => expect(screen.getByText('Hola').parentElement).toHaveAttribute('data-translation-ready', 'true'));
});
