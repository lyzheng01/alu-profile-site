import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';
import { useSeoMeta } from './useSeoMeta';

const SeoHarness = () => {
  useSeoMeta({
    title: 'China Aluminum Profile Manufacturer | LingYe Aluminum',
    description: 'Custom aluminum extrusion, finishing, and export packaging for global buyers.',
    canonicalPath: '/en',
    ogTitle: 'LingYe Aluminum Manufacturer',
    ogDescription: 'Factory-direct aluminum profiles for B2B buyers.',
    language: 'en',
  });
  return <div>seo harness</div>;
};

const EnglishOnlyArticleSeoHarness = () => {
  useSeoMeta({
    title: 'Thermal-Break Window Profiles: RFQ Guide',
    canonicalPath: '/en/news/thermal-break-window-profile-rfq-guide',
    language: 'en',
    alternateLanguages: ['en'],
  });
  return <div>article seo harness</div>;
};

beforeEach(() => {
  document.head.innerHTML = '';
  document.documentElement.lang = 'zh-CN';
  window.history.pushState({}, '', '/en');
});

test('updates html language, canonical, and social metadata for an English page', () => {
  render(<SeoHarness />);

  expect(document.documentElement.lang).toBe('en');
  expect(document.title).toBe('China Aluminum Profile Manufacturer | LingYe Aluminum');
  expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://lingyealu.com/en');
  expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute('content', 'LingYe Aluminum Manufacturer');
  expect(document.querySelector('meta[name="twitter:description"]')).toHaveAttribute(
    'content',
    'Factory-direct aluminum profiles for B2B buyers.'
  );
});

test('limits article hreflang links to published translations', () => {
  render(<EnglishOnlyArticleSeoHarness />);

  const alternates = Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]'));
  expect(alternates.map((link) => link.getAttribute('hreflang'))).toEqual(['x-default', 'en']);
  expect(alternates[0]).toHaveAttribute(
    'href',
    'https://lingyealu.com/en/news/thermal-break-window-profile-rfq-guide'
  );
  expect(alternates[1]).toHaveAttribute(
    'href',
    'https://lingyealu.com/en/news/thermal-break-window-profile-rfq-guide'
  );
});

test.each(['en', 'zh', 'es', 'pt'])('emits reciprocal category hreflang links for %s', (language) => {
  const route = `/${language}/products/category/t-slot-profiles`;
  window.history.pushState({}, '', route);
  const copy = {
    en: 'T-Slot Aluminum Framing Profiles',
    zh: 'T型槽铝型材与框架系统',
    es: 'Perfiles estructurales de aluminio con ranura en T',
    pt: 'Perfis estruturais de alumínio com ranhura em T',
  }[language];

  const LocalizedCategorySeoHarness = () => {
    useSeoMeta({
      title: copy,
      description: 'Localized category guidance',
      canonicalPath: route,
      language,
    });
    return <div>localized seo harness</div>;
  };

  render(<LocalizedCategorySeoHarness />);

  expect(document.documentElement.lang).toBe(language);
  expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
    'href',
    `https://lingyealu.com${route}`
  );
  const alternates = Array.from(document.querySelectorAll('link[rel="alternate"][hreflang]'));
  expect(alternates.map((link) => link.getAttribute('hreflang'))).toEqual(['x-default', 'en', 'zh', 'es', 'pt']);
  for (const alternateLanguage of ['en', 'zh', 'es', 'pt']) {
    expect(document.querySelector(`link[hreflang="${alternateLanguage}"]`)).toHaveAttribute(
      'href',
      `https://lingyealu.com/${alternateLanguage}/products/category/t-slot-profiles`
    );
  }
});
