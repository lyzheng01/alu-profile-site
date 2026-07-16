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

beforeEach(() => {
  document.head.innerHTML = '';
  document.documentElement.lang = 'zh-CN';
  window.history.pushState({}, '', '/en');
});

test('updates html language, canonical, and social metadata for an English page', () => {
  render(<SeoHarness />);

  expect(document.documentElement.lang).toBe('en');
  expect(document.title).toBe('China Aluminum Profile Manufacturer | LingYe Aluminum');
  expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'http://localhost/en');
  expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute('content', 'LingYe Aluminum Manufacturer');
  expect(document.querySelector('meta[name="twitter:description"]')).toHaveAttribute(
    'content',
    'Factory-direct aluminum profiles for B2B buyers.'
  );
});
