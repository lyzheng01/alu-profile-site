const test = require('node:test');
const assert = require('node:assert/strict');

const { refreshMainAssetReferences, localizedWindowCategoryRoutes, localizedProductCategoryRoutes, isProductDetailRoute, resolvePrerenderApiUrl, rewriteApiPaginationLinks, canonicalizeRenderedHtml, validateRenderedHtml, fetchWithRetry, createApiResponseCache } = require('./prerender');
const { staticPaths, toUrlNode, productRouteAlternates } = require('./generate-sitemap');

test('refreshes cached route HTML to use the current main JS and CSS bundles', () => {
  const cached = '<html><head><script defer src="/static/js/main.old123.js"></script><link href="/static/css/main.old456.css" rel="stylesheet"></head></html>';
  const shell = '<html><head><script defer="defer" src="/static/js/main.new123.js"></script><link href="/static/css/main.new456.css" rel="stylesheet"></head></html>';

  assert.equal(
    refreshMainAssetReferences(cached, shell),
    '<html><head><script defer src="/static/js/main.new123.js"></script><link href="/static/css/main.new456.css" rel="stylesheet"></head></html>'
  );
});

test('includes the localized window and door category landing page in sitemap and prerender routes', () => {
  const expected = ['en', 'zh', 'es', 'pt'].map((lang) => `/${lang}/products/category/windows-doors`);
  assert.deepEqual(localizedWindowCategoryRoutes(), expected);
  for (const route of expected) {
    assert.ok(staticPaths.some((entry) => entry.path === route), `missing sitemap route ${route}`);
  }
});

test('does not list the unlocalized root redirect as an indexable sitemap page', () => {
  assert.equal(staticPaths.some((entry) => entry.path === '/'), false);
});

test('includes every category landing page in each supported language', () => {
  const slugs = ['cabinet-profiles', 'industrial-profiles', 't-slot-profiles', 'windows-doors', 'standard-aluminium-profiles'];
  const expected = slugs.flatMap((slug) => ['en', 'zh', 'es', 'pt'].map((lang) => `/${lang}/products/category/${slug}`));
  assert.deepEqual(localizedProductCategoryRoutes(), expected);
  for (const route of expected) {
    assert.ok(staticPaths.some((entry) => entry.path === route), `missing sitemap route ${route}`);
  }
});

test('distinguishes product detail pages from category and showcase routes', () => {
  assert.equal(isProductDetailRoute('/en/products/glass-door-frame-profiles'), true);
  assert.equal(isProductDetailRoute('/en/products/category/cabinet-profiles'), false);
  assert.equal(isProductDetailRoute('/en/products/windows-doors/showcase'), false);
});

test('adds reciprocal language annotations to localized product URLs in the sitemap', () => {
  const route = 'https://lingyealu.com/zh/products/category/t-slot-profiles';
  const alternates = productRouteAlternates(route);
  assert.deepEqual(alternates.map((entry) => entry.language), ['x-default', 'en', 'zh', 'es', 'pt']);
  const xml = toUrlNode(route, '2026-10-12T00:00:00.000Z', 'weekly', '0.75');
  for (const language of ['x-default', 'en', 'zh', 'es', 'pt']) {
    assert.match(xml, new RegExp(`hreflang="${language}"`));
  }
  assert.match(xml, /href="https:\/\/lingyealu\.com\/en\/products\/category\/t-slot-profiles"/);
});

test('proxies API requests during prerender and keeps paginated fetches on the local prerender host', () => {
  assert.equal(
    resolvePrerenderApiUrl('/api/products/?lang=zh&page=2', 'https://lingyealuminum.com/api'),
    'https://lingyealuminum.com/api/products/?lang=zh&page=2'
  );
  assert.equal(
    rewriteApiPaginationLinks(
      JSON.stringify({ next: 'https://lingyealuminum.com/api/products/?lang=pt&page=2', results: [] }),
      'http://127.0.0.1:3456'
    ),
    JSON.stringify({ next: 'http://127.0.0.1:3456/api/products/?lang=pt&page=2', results: [] })
  );
});

test('canonicalizes rendered HTML to the configured primary domain', () => {
  const html = '<link rel="canonical" href="https://lingyealuminum.com/en"><meta property="og:url" content="https://lingyealuminum.com/en">';
  assert.equal(
    canonicalizeRenderedHtml(html, 'https://lingyealu.com'),
    '<link rel="canonical" href="https://lingyealu.com/en"><meta property="og:url" content="https://lingyealu.com/en">'
  );
});

test('rejects a page whose canonical points to a different route', () => {
  const html = '<head><title>Window Profiles</title><link rel="canonical" href="https://lingyealu.com/en/products"></head><main><h1>Window Profiles</h1></main>';
  assert.throws(() => validateRenderedHtml(html, '/en/products/category/windows-doors'), /canonical points to/);
});

test('retries transient API fetch failures and returns the successful response', async () => {
  let calls = 0;
  const response = { status: 200, ok: true };
  const result = await fetchWithRetry('https://api.example.test/data', {}, async () => {
    calls += 1;
    if (calls < 3) throw new Error('temporary connection timeout');
    return response;
  });
  assert.equal(result, response);
  assert.equal(calls, 3);
});

test('reuses each API response during a prerender build', async () => {
  let calls = 0;
  const getResponse = createApiResponseCache(async (url) => {
    calls += 1;
    return { url, body: 'translations' };
  });

  const results = await Promise.all([getResponse('/api/translations/?lang=es'), getResponse('/api/translations/?lang=es')]);
  assert.deepEqual(results, [
    { url: '/api/translations/?lang=es', body: 'translations' },
    { url: '/api/translations/?lang=es', body: 'translations' },
  ]);
  assert.equal(calls, 1);
});

test('rejects an old cached shell as a successfully prerendered page', () => {
  const shell = '<html><head><title>Catalog</title></head><body><div id="root"></div></body></html>';
  assert.throws(() => validateRenderedHtml(shell, '/en/products/category/windows-doors'), /missing rendered H1/);
});

test('rejects product category HTML captured before catalog data is ready', () => {
  const html = '<head><title>T-slot profiles</title><link rel="canonical" href="https://lingyealu.com/en/products/category/t-slot-profiles"></head><main><h1>T-slot profiles</h1><div data-testid="products-page" data-products-ready="false"></div></main>';
  assert.throws(() => validateRenderedHtml(html, '/en/products/category/t-slot-profiles'), /product catalog data did not finish loading/);
});

test('requires product detail data and Product JSON-LD before prerendering', () => {
  const productShell = '<head><title>Profile</title><link rel="canonical" href="https://lingyealu.com/en/products/profile"></head><main><h1>Profile</h1><div data-testid="product-detail-page" data-product-ready="true"></div></main>';
  assert.throws(() => validateRenderedHtml(productShell, '/en/products/profile'), /Product structured data did not finish rendering/);
  const product = '<head><title>Profile</title><link rel="canonical" href="https://lingyealu.com/en/products/profile"><script id="ld-json-product" type="application/ld+json">{"@type":"Product","name":"Profile"}</script></head><main><h1>Profile</h1><div data-testid="product-detail-page" data-product-ready="true"></div></main>';
  assert.doesNotThrow(() => validateRenderedHtml(product, '/en/products/profile'));
});

test('rejects homepage HTML without all five category links', () => {
  const homeShell = '<head><title>Home</title><link rel="canonical" href="https://lingyealu.com/en"></head><main><h1>Aluminum Profiles</h1><section data-testid="home-category-section" data-home-categories-ready="true" data-home-category-count="4"></section></main>';
  assert.throws(() => validateRenderedHtml(homeShell, '/en'), /homepage category data incomplete/);
  const links = ['cabinet-profiles', 'industrial-profiles', 't-slot-profiles', 'windows-doors', 'standard-aluminium-profiles']
    .map((slug) => `<a href="/en/products/category/${slug}">${slug}</a>`).join('');
  const noLinks = '<head><title>Home</title><link rel="canonical" href="https://lingyealu.com/en"></head><main><h1>Aluminum Profiles</h1><section data-testid="home-category-section" data-home-categories-ready="true" data-home-category-count="5"></section></main>';
  assert.throws(() => validateRenderedHtml(noLinks, '/en'), /homepage category data incomplete/);
  const home = `<head><title>Home</title><link rel="canonical" href="https://lingyealu.com/en"></head><main><h1>Aluminum Profiles</h1><section data-testid="home-category-section" data-home-categories-ready="true" data-home-category-count="5">${links}</section></main>`;
  assert.doesNotThrow(() => validateRenderedHtml(home, '/en'));
});

test('rejects a news index captured before its article cards are rendered', () => {
  const newsShell = '<head><title>News</title><link rel="canonical" href="https://lingyealu.com/en/news"></head><main><h1>News</h1><div data-testid="news-list-page" data-news-ready="true" data-news-article-count="0"></div></main>';
  assert.throws(() => validateRenderedHtml(newsShell, '/en/news'), /news list has no rendered articles/);
  const missingCards = '<head><title>News</title><link rel="canonical" href="https://lingyealu.com/en/news"></head><main><h1>News</h1><div data-testid="news-list-page" data-news-ready="true" data-news-article-count="17"></div></main>';
  assert.throws(() => validateRenderedHtml(missingCards, '/en/news'), /news list has no rendered articles/);
  const news = '<head><title>News</title><link rel="canonical" href="https://lingyealu.com/en/news"></head><main><h1>News</h1><div data-testid="news-list-page" data-news-ready="true" data-news-article-count="17"><a href="/en/news/article-one">Article</a></div></main>';
  assert.doesNotThrow(() => validateRenderedHtml(news, '/en/news'));
});

test('requires article body content, not only metadata and a heading', () => {
  const articleShell = '<head><title>Guide</title><link rel="canonical" href="https://lingyealu.com/en/news/window-rfq-guide"></head><main><h1>Guide</h1><div class="prose max-w-none"></div></main>';
  assert.throws(() => validateRenderedHtml(articleShell, '/en/news/window-rfq-guide'), /missing rendered article body/);
  const article = '<head><title>Guide</title><link rel="canonical" href="https://lingyealu.com/en/news/window-rfq-guide"></head><main><h1>Guide</h1><div class="prose max-w-none"><p>' + 'Useful buyer guidance. '.repeat(8) + '</p></div></main>';
  assert.doesNotThrow(() => validateRenderedHtml(article, '/en/news/window-rfq-guide'));
});
