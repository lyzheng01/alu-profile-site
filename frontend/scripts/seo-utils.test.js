const test = require('node:test');
const assert = require('node:assert/strict');

const { hasLocalizedArticle, applyArticleMetadata } = require('./seo-utils');

test('does not classify an English fallback article as a localized page', () => {
  const english = { title: 'Window RFQ', content: '<p>Specify the window.</p>' };
  assert.equal(hasLocalizedArticle(english, { ...english }), false);
  assert.equal(hasLocalizedArticle(english, { ...english, content: '' }), false);
  assert.equal(hasLocalizedArticle({ title: english.title }, { ...english }), false);
});

test('accepts a translated article body as localized content', () => {
  const english = { title: 'Window RFQ', content: '<p>Specify the window.</p>' };
  assert.equal(hasLocalizedArticle(english, { ...english, title: 'Guía de ventanas', content: '<p>Defina la ventana.</p>' }), true);
});

test('writes article metadata and canonical into the static HTML shell', () => {
  const html = '<html><head><title>Home</title><meta name="description" content="Home"><link rel="canonical" href="https://example.com/en"><link rel="alternate" hreflang="zh" href="https://example.com/zh"><meta property="og:url" content="https://example.com/"><meta name="twitter:title" content="Home"></head></html>';
  const result = applyArticleMetadata(html, {
    title: 'Window & Profile Guide',
    description: 'Buyer\'s guide for profiles.',
    canonical: 'https://example.com/en/news/window-guide',
    image: 'https://example.com/window.webp',
    keywords: 'thermal break, window profiles',
    siteUrl: 'https://example.com',
    alternates: [{ language: 'en', route: '/en/news/window-guide' }],
  });
  assert.match(result, /<title>Window &amp; Profile Guide<\/title>/);
  assert.match(result, /name="description" content="Buyer&#39;s guide for profiles\."/);
  assert.match(result, /rel="canonical" href="https:\/\/example\.com\/en\/news\/window-guide"/);
  assert.match(result, /property="og:url" content="https:\/\/example\.com\/en\/news\/window-guide"/);
  assert.match(result, /name="twitter:title" content="Window &amp; Profile Guide"/);
  assert.match(result, /name="keywords" content="thermal break, window profiles"/);
  assert.match(result, /hreflang="x-default" href="https:\/\/example\.com\/en\/news\/window-guide"/);
  assert.doesNotMatch(result, /hreflang="zh"/);
  assert.doesNotMatch(result, /href="https:\/\/example\.com\/en"/);
});
