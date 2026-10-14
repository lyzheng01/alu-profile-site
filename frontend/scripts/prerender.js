#!/usr/bin/env node
/**
 * Prerenders full route content so search crawlers receive the page without JS.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { hasLocalizedArticle } = require('./seo-utils');

const BUILD_DIR = path.join(__dirname, '..', 'build');
const PRERENDER_DIR = BUILD_DIR;
const API_BASE = process.env.PRERENDER_API_BASE || 'https://lingyealu.com/api';
const PORT = parseInt(process.env.PRERENDER_PORT || '3456', 10);
const CONCURRENCY = 2;
const RENDER_TIMEOUT = 30000;
const LANGS = ['en', 'zh', 'es', 'pt'];
const PRODUCT_CATEGORY_SLUGS = [
  'cabinet-profiles',
  'industrial-profiles',
  't-slot-profiles',
  'windows-doors',
  'standard-aluminium-profiles',
];
const localizedProductCategoryRoutes = () => PRODUCT_CATEGORY_SLUGS.flatMap((slug) => LANGS.map((lang) => `/${lang}/products/category/${slug}`));
const localizedWindowCategoryRoutes = () => localizedProductCategoryRoutes().filter((route) => route.endsWith('/windows-doors'));
const SITE_URL = process.env.SITE_URL || 'https://lingyealu.com';
const isProductDetailRoute = (route) => /\/products\/(?!category\/|windows-doors\/showcase(?:\/|$))[^/]+/.test(route);

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon',
};

const fetchJson = async (url) => {
  const res = await fetchWithRetry(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
};

const fetchWithRetry = async (url, options = {}, fetchImpl = fetch) => {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetchImpl(url, { ...options, signal: AbortSignal.timeout(30000) });
      if (response.status >= 500 && attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 700));
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 700));
    }
  }
  throw new Error(`Request failed after retries: ${url} (${lastError?.message || lastError})`);
};

const createApiResponseCache = (fetcher) => {
  const cache = new Map();
  return (url) => {
    if (!cache.has(url)) {
      const pending = fetcher(url).catch((error) => {
        cache.delete(url);
        throw error;
      });
      cache.set(url, pending);
    }
    return cache.get(url);
  };
};

const refreshMainAssetReferences = (html, shellHtml) => {
  const mainJs = shellHtml.match(/<script\b[^>]*\bsrc=["']([^"']*\/static\/js\/main\.[^"']+\.js)["']/i)?.[1];
  const mainCss = shellHtml.match(/<link\b[^>]*\bhref=["']([^"']*\/static\/css\/main\.[^"']+\.css)["']/i)?.[1];
  let refreshed = html;

  if (mainJs) {
    refreshed = refreshed.replace(
      /(<script\b[^>]*\bsrc=["'])[^"']*(\/static\/js\/main\.[^"']+\.js)(["'][^>]*>)/i,
      (_match, before, _oldAsset, after) => `${before}${mainJs}${after}`
    );
  }
  if (mainCss) {
    refreshed = refreshed.replace(
      /(<link\b[^>]*\bhref=["'])[^"']*(\/static\/css\/main\.[^"']+\.css)(["'][^>]*>)/i,
      (_match, before, _oldAsset, after) => `${before}${mainCss}${after}`
    );
  }
  return refreshed;
};

const resolvePrerenderApiUrl = (requestUrl, apiBase = API_BASE) => {
  const apiOrigin = new URL(apiBase).origin;
  return new URL(requestUrl, apiOrigin).toString();
};

const rewriteApiPaginationLinks = (body, localOrigin) => {
  let payload;
  try { payload = JSON.parse(body); } catch { return body; }
  if (!payload || typeof payload !== 'object' || typeof payload.next !== 'string') return body;
  try {
    const next = new URL(payload.next);
    payload.next = `${localOrigin}${next.pathname}${next.search}`;
    return JSON.stringify(payload);
  } catch {
    return body;
  }
};

const canonicalizeRenderedHtml = (html, siteUrl = SITE_URL) => html
  .replace(/https?:\/\/(?:www\.)?lingyealuminum\.com/gi, siteUrl)
  .replace(/https?:\/\/www\.lingyealu\.com/gi, siteUrl)
  .replace(/http:\/\/127\.0\.0\.1:\d+/g, siteUrl);

const validateRenderedHtml = (html, route, siteUrl = SITE_URL) => {
  const mainHtml = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1] || '';
  const h1 = mainHtml.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, '').trim();
  if (!h1) throw new Error(`${route}: missing rendered H1`);
  if (/animate-spin|status_loading|Loading\.\.\./i.test(mainHtml)) throw new Error(`${route}: page is still loading`);
  if (!/<title>[^<]+<\/title>/i.test(html)) throw new Error(`${route}: missing rendered title`);
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1];
  if (!canonical || !canonical.startsWith(siteUrl)) throw new Error(`${route}: missing canonical for ${siteUrl}`);
  if (route !== '/' && canonical !== `${siteUrl}${route}`) throw new Error(`${route}: canonical points to ${canonical}`);
  if (/\/products\/category\//.test(route) && !/data-testid="products-page"/.test(mainHtml)) {
    throw new Error(`${route}: missing rendered category content`);
  }
  if (/\/(?:en|zh|es|pt)\/products(?:\/category\/[^/]+)?\/?$/.test(route) && !/data-products-ready="true"/.test(mainHtml)) {
    throw new Error(`${route}: product catalog data did not finish loading`);
  }
  if (/^\/(?:en|zh|es|pt)\/?$/.test(route)) {
    const categoryCount = Number(mainHtml.match(/data-home-category-count="(\d+)"/)?.[1] || 0);
    const categoryLinks = mainHtml.match(/href="\/(?:en|zh|es|pt)\/products\/category\/[^\"]+"/g) || [];
    if (!/data-home-categories-ready="true"/.test(mainHtml) || categoryCount < 5 || categoryLinks.length < 5) {
      throw new Error(`${route}: homepage category data incomplete (${categoryCount}/5, ${categoryLinks.length} links)`);
    }
  }
  if (/^\/(?:en|zh|es|pt)\/news\/?$/.test(route)) {
    const articleCount = Number(mainHtml.match(/data-news-article-count="(\d+)"/)?.[1] || 0);
    const articleLinks = mainHtml.match(/href="\/(?:en|zh|es|pt)\/news\/[^\"]+"/g) || [];
    if (!/data-news-ready="true"/.test(mainHtml) || articleCount < 1 || articleLinks.length < 1) {
      throw new Error(`${route}: news list has no rendered articles (${articleCount}, ${articleLinks.length} links)`);
    }
  }
  if (/\/news\/[^/]+/.test(route)) {
    const articleBody = mainHtml.match(/<div\s+class="prose max-w-none"[^>]*>([\s\S]*?)<\/div>/i)?.[1] || '';
    const text = articleBody.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (text.length < 50) throw new Error(`${route}: missing rendered article body`);
  }
  if (isProductDetailRoute(route) && /Product not found/i.test(mainHtml)) {
    throw new Error(`${route}: product data did not load`);
  }
  if (isProductDetailRoute(route)) {
    const productSchema = html.match(/<script\s+id="ld-json-product"[^>]*>([\s\S]*?)<\/script>/i)?.[1] || '';
    if (!/data-testid="product-detail-page"\s+data-product-ready="true"/.test(mainHtml) || !/"@type":"Product"/.test(productSchema)) {
      throw new Error(`${route}: product data or Product structured data did not finish rendering`);
    }
  }
};

const waitForRouteContent = async (page) => {
  await page.waitForFunction(() => {
    const currentRoute = window.location.pathname;
    if (document.querySelector('[data-translation-ready="true"]') === null) return false;
    const main = document.querySelector('main');
    const heading = main?.querySelector('h1')?.textContent?.trim();
    const expectedLanguage = currentRoute.split('/').filter(Boolean)[0];
    if (['en', 'zh', 'es', 'pt'].includes(expectedLanguage) && document.documentElement.lang !== expectedLanguage) return false;
    if (!heading || main?.querySelector('.animate-spin') || /Loading\.\.\./i.test(main?.textContent || '')) return false;
    if (/\/news\/[^/]+/.test(currentRoute)) {
      return (main.querySelector('.prose')?.textContent?.trim().length || 0) >= 50;
    }
    if (/\/(?:en|zh|es|pt)\/products(?:\/category\/[^/]+)?\/?$/.test(currentRoute)) {
      return main.querySelector('[data-testid="products-page"]')?.getAttribute('data-products-ready') === 'true';
    }
    if (/^\/(?:en|zh|es|pt)\/?$/.test(currentRoute)) {
      const section = main.querySelector('[data-testid="home-category-section"]');
      return section?.getAttribute('data-home-categories-ready') === 'true'
        && Number(section.getAttribute('data-home-category-count')) >= 5
        && section.querySelectorAll('a[href*="/products/category/"]').length >= 5;
    }
    if (/^\/(?:en|zh|es|pt)\/news\/?$/.test(currentRoute)) {
      const list = main.querySelector('[data-testid="news-list-page"]');
      return list?.getAttribute('data-news-ready') === 'true'
        && Number(list.getAttribute('data-news-article-count')) > 0
        && list.querySelectorAll('a[href*="/news/"]').length > 0;
    }
    if (/\/products\/(?!category\/|windows-doors\/showcase(?:\/|$))[^/]+/.test(currentRoute)) {
      const productPage = main.querySelector('[data-testid="product-detail-page"]');
      const schema = document.getElementById('ld-json-product')?.textContent || '';
      return productPage?.getAttribute('data-product-ready') === 'true'
        && schema.includes('"@type":"Product"');
    }
    return true;
  }, { timeout: RENDER_TIMEOUT });
};

const refreshCachedRouteAssets = () => {
  const shell = fs.readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8');
  let refreshedCount = 0;
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && (entry.name === 'static' || entry.name.startsWith('backup_'))) continue;
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(target);
      } else if (entry.isFile() && entry.name.endsWith('.html') && target !== path.join(BUILD_DIR, 'index.html')) {
        const current = fs.readFileSync(target, 'utf8');
        const refreshed = refreshMainAssetReferences(current, shell);
        if (refreshed !== current) {
          fs.writeFileSync(target, refreshed, 'utf8');
          refreshedCount += 1;
        }
      }
    }
  };
  visit(BUILD_DIR);
  console.log(`[prerender] refreshed main asset references in ${refreshedCount} cached routes`);
};

const fetchAll = async (resource, language) => {
  const items = [];
  let page = 1;
  while (page <= 200) {
    const langQuery = language ? `&lang=${language}` : '';
    const data = await fetchJson(`${API_BASE}/${resource}/?page=${page}${langQuery}`);
    if (Array.isArray(data)) { items.push(...data); break; }
    const list = data.results || [];
    items.push(...list);
    if (!data.next || list.length === 0) break;
    page++;
  }
  return items;
};

const collectArticleEntries = async () => {
  const lists = await Promise.all(LANGS.map((lang) => fetchAll('articles', lang)));
  const byLanguage = Object.fromEntries(LANGS.map((lang, index) => [lang, lists[index]]));
  const entries = [];

  for (const source of byLanguage.en) {
    for (const lang of LANGS) {
      const article = byLanguage[lang].find((item) => item.slug === source.slug);
      if (!article || (lang !== 'en' && !hasLocalizedArticle(source, article))) continue;
      entries.push({
        route: `/${lang}/news/${article.slug || article.id}`,
        article,
        language: lang,
      });
    }
  }
  return entries;
};

const collectRoutes = async () => {
  const routes = new Set();
  for (const lang of LANGS) {
    routes.add(`/${lang}`);
    routes.add(`/${lang}/products`);
    routes.add(`/${lang}/news`);
    routes.add(`/${lang}/about`);
    routes.add(`/${lang}/products/windows-doors/showcase`);
  }
  for (const route of localizedProductCategoryRoutes()) routes.add(route);
  for (const slug of [
    'aluminum-profile-supplier-for-construction-projects',
    'industrial-aluminum-extrusion-manufacturer-in-china',
    'custom-aluminum-profile-factory-for-oem-orders',
  ]) routes.add(`/en/${slug}`);

  const [products, articleEntries] = await Promise.all([
    fetchAll('products'),
    collectArticleEntries(),
  ]);
  if (!products.length || !articleEntries.length) {
    throw new Error(`API returned incomplete content: ${products.length} products, ${articleEntries.length} localized articles`);
  }
  for (const p of products) {
    const s = p.slug || p.id;
    for (const lang of LANGS) routes.add(`/${lang}/products/${s}`);
  }
  for (const entry of articleEntries) routes.add(entry.route);
  console.log(`[prerender] ${products.length} products, ${articleEntries.length} localized article routes`);
  return [...routes];
};

const startServer = () =>
  new Promise((resolve) => {
    const getApiResponse = createApiResponseCache(async (requestUrl) => {
      const upstream = await fetchWithRetry(resolvePrerenderApiUrl(requestUrl));
      return {
        status: upstream.status,
        contentType: upstream.headers.get('content-type'),
        body: await upstream.text(),
      };
    });
    const server = http.createServer(async (req, res) => {
      if (req.url.startsWith('/api/')) {
        try {
          const { status, contentType, body } = await getApiResponse(req.url);
          const localOrigin = `http://127.0.0.1:${PORT}`;
          if (contentType) res.setHeader('Content-Type', contentType);
          res.statusCode = status;
          res.end(rewriteApiPaginationLinks(body, localOrigin));
        } catch (error) {
          res.statusCode = 502;
          res.end(`Prerender API proxy failed: ${error.message}`);
        }
        return;
      }
      let filePath = path.join(BUILD_DIR, req.url === '/' ? 'index.html' : req.url);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(BUILD_DIR, 'index.html');
      }
      const ext = path.extname(filePath);
      res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
      fs.createReadStream(filePath).pipe(res);
    });
    server.listen(PORT, () => resolve(server));
  });

const prerender = async () => {
  if (!fs.existsSync(path.join(BUILD_DIR, 'index.html'))) {
    console.log('[prerender] build/index.html missing, skipping.');
    return;
  }

  let puppeteer;
  try { puppeteer = require('puppeteer'); } catch {
    console.log('[prerender] puppeteer not installed, skipping.'); return;
  }

  const routes = await collectRoutes();
  console.log(`[prerender] ${routes.length} routes`);
  const server = await startServer();
  const baseUrl = `http://127.0.0.1:${PORT}`;
  await new Promise((r) => setTimeout(r, 300));

  fs.mkdirSync(PRERENDER_DIR, { recursive: true });

  const RESTART_EVERY = 60;
  const launchBrowser = () => puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  let browser;
  try {
    browser = await launchBrowser();
  } catch (error) {
    server.close();
    throw new Error(`Prerender browser is required to generate content-complete HTML: ${error.message}`);
  }

  const renderOne = async (route) => {
    const page = await browser.newPage();
    try {
      await page.setViewport({ width: 1280, height: 800 });
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        if (request.resourceType() === 'stylesheet' && new URL(request.url()).hostname === 'cdnjs.cloudflare.com') {
          return request.abort();
        }
        return request.continue();
      });
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: RENDER_TIMEOUT });
      try {
        await waitForRouteContent(page);
      } catch (error) {
        const state = await page.evaluate(() => {
          const main = document.querySelector('main');
          const news = main?.querySelector('[data-testid="news-list-page"]');
          const home = main?.querySelector('[data-testid="home-category-section"]');
          const product = main?.querySelector('[data-testid="product-detail-page"]');
          return {
            url: location.pathname,
            lang: document.documentElement.lang,
            translationsReady: document.querySelector('[data-translation-ready]')?.getAttribute('data-translation-ready'),
            heading: main?.querySelector('h1')?.textContent?.trim(),
            spinner: Boolean(main?.querySelector('.animate-spin')),
            loadingText: /Loading\.\.\./i.test(main?.textContent || ''),
            newsReady: news?.getAttribute('data-news-ready'),
            newsCount: news?.getAttribute('data-news-article-count'),
            newsLinks: news?.querySelectorAll('a[href*="/news/"]').length,
            homeReady: home?.getAttribute('data-home-categories-ready'),
            homeCount: home?.getAttribute('data-home-category-count'),
            productReady: product?.getAttribute('data-product-ready'),
            mainText: main?.textContent?.replace(/\s+/g, ' ').slice(0, 240),
          };
        });
        throw new Error(`${error.message}; state=${JSON.stringify(state)}`);
      }
      let html = canonicalizeRenderedHtml(await page.content());
      validateRenderedHtml(html, route);
      const outDir = path.join(PRERENDER_DIR, route === '/' ? '' : route);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
    } finally {
      await page.close().catch(() => {});
    }
  };

  const todo = routes;

  let failed = 0;
  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    if (i > 0 && i % RESTART_EVERY === 0) {
      try { await browser.close(); } catch {}
      browser = await launchBrowser();
    }
    const batch = todo.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(batch.map(renderOne));
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        failed += 1;
        console.warn(`\n[prerender] failed ${batch[index]}: ${result.reason?.message || result.reason}`);
      }
    });
    process.stdout.write(`\r[prerender] ${Math.min(i + CONCURRENCY, todo.length)}/${todo.length} (failed: ${failed})`);
  }

  try { await browser.close(); } catch {}
  server.close();
  console.log(`\n[prerender] done — ${routes.length} total, ${todo.length} rendered, ${failed} failed`);
  if (failed) throw new Error(`${failed} route(s) failed prerender validation`);
  refreshCachedRouteAssets();
};

if (require.main === module) {
  prerender().catch((err) => { console.error('[prerender] fatal:', err); process.exit(1); });
}

module.exports = { prerender, collectRoutes, collectArticleEntries, refreshMainAssetReferences, localizedWindowCategoryRoutes, localizedProductCategoryRoutes, isProductDetailRoute, resolvePrerenderApiUrl, rewriteApiPaginationLinks, canonicalizeRenderedHtml, validateRenderedHtml, fetchWithRetry, createApiResponseCache };
