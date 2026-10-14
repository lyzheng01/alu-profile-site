import '@testing-library/jest-dom';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import News from './News';

let mockLanguage = 'en';
const mockT = (_key: string, fallback?: string) => fallback || '';

jest.mock('../contexts/TranslationContext', () => ({
  useTranslation: () => ({
    t: mockT,
    currentLanguage: mockLanguage,
  }),
}));

jest.mock('../hooks/useSeoMeta', () => ({ useSeoMeta: jest.fn() }));
jest.mock('../components/FloatingContactButtons', () => () => <div />);

test.each([
  ['en', 'Aluminum Industry News & Insights | LingYe'],
  ['es', 'Noticias sobre aluminio | LingYe'],
  ['pt', 'Notícias sobre alumínio | LingYe'],
  ['zh', '铝型材行业资讯 | 凌烨铝业'],
])('uses a localized static news title for %s', async (language, title) => {
  mockLanguage = language;
  const useSeoMeta = jest.requireMock('../hooks/useSeoMeta').useSeoMeta as jest.Mock;
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => [] }) as jest.Mock;

  render(
    <MemoryRouter initialEntries={[`/${language}/news`]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes><Route path="/:language/news" element={<News />} /></Routes>
    </MemoryRouter>
  );

  await waitFor(() => expect(useSeoMeta).toHaveBeenCalledWith(expect.objectContaining({
    title,
    language,
    canonicalPath: `/${language}/news`,
  })));
  mockLanguage = 'en';
});

test('waits for localized article data and exposes article cards in the prerendered list', async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [{
        id: 91,
        slug: 'useful-aluminium-guide',
        title: 'A useful aluminium guide',
        excerpt: 'A buyer-focused guide.',
        featured_image: '/media/guide.webp',
        created_at: '2026-10-14T00:00:00Z',
        tags: [],
      }] }),
    })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ results: [] }) }) as jest.Mock;

  render(
    <MemoryRouter initialEntries={['/en/news']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes><Route path="/en/news" element={<News />} /></Routes>
    </MemoryRouter>
  );

  const list = await screen.findByTestId('news-list-page');
  expect(await screen.findByRole('link', { name: /a useful aluminium guide/i })).toHaveAttribute('href', '/en/news/useful-aluminium-guide');
  expect(list).toHaveAttribute('data-news-ready', 'true');
  expect(list).toHaveAttribute('data-news-article-count', '1');
});

test('marks the publisher as an organization in article structured data', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      id: 6,
      slug: '6061-vs-6063-aluminium-alloy-selection',
      title: '6061 vs 6063 Aluminium',
      content: '<p>Compare the alloys.</p>',
      excerpt: 'A material selection guide.',
      tags: [],
      created_at: '2026-09-30T00:00:00Z',
      updated_at: '2026-09-30T00:00:00Z',
    }),
  }) as jest.Mock;

  render(
    <MemoryRouter initialEntries={['/en/news/6061-vs-6063-aluminium-alloy-selection']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/en/news/:articleRef" element={<News />} />
      </Routes>
    </MemoryRouter>
  );

  expect(await screen.findByRole('heading', { name: '6061 vs 6063 Aluminium' })).toBeInTheDocument();
  await waitFor(() => {
    const structuredData = JSON.parse(document.querySelector('#ld-json-article')?.textContent || '{}');
    expect(structuredData.author).toEqual({ '@type': 'Organization', name: 'LingYe Aluminum' });
  });
});
