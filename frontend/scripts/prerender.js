#!/usr/bin/env node
/**
 * Prerender script — renders routes into static HTML with correct meta tags.
 * API content loads client-side; the key SEO fix is unique meta tags per URL.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { hasLocalizedArticle, applyArticleMetadata } = require('./seo-utils');

const BUILD_DIR = process.env.BUILD_PATH
  ? path.resolve(__dirname, '..', process.env.BUILD_PATH)
  : path.join(__dirname, '..', 'build');
const PRERENDER_DIR = BUILD_DIR;
const API_BASE = process.env.PRERENDER_API_BASE || 'https://lingyealu.com/api';
const PORT = parseInt(process.env.PRERENDER_PORT || '3456', 10);
const CONCURRENCY = 2;
const RENDER_TIMEOUT = 45000;
const LANGS = ['en', 'zh', 'es', 'pt'];
const CATEGORY_SLUGS = ['cabinet-profiles', 'industrial-profiles', 'standard-aluminium-profiles', 't-slot-profiles', 'windows-doors'];
const CANONICAL_SITE_URL = 'https://lingyealu.com';
const SITE_URL = process.env.SITE_URL || CANONICAL_SITE_URL;
if (SITE_URL !== CANONICAL_SITE_URL) throw new Error(`SITE_URL must be ${CANONICAL_SITE_URL}`);

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon',
};

const fetchJson = async (url) => {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
      if (!res.ok) {
        const error = new Error(`${url} → ${res.status}`);
        if (res.status < 500 && res.status !== 429) throw error;
        lastError = error;
      } else {
        return await res.json();
      }
    } catch (error) {
      lastError = error;
    }
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
  }
  throw lastError || new Error(`Unable to fetch ${url}`);
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
  const englishSources = byLanguage.en;
  const englishDetails = new Map();
  let nextArticle = 0;
  const workers = Array.from({ length: Math.min(3, englishSources.length) }, async () => {
    while (nextArticle < englishSources.length) {
      const source = englishSources[nextArticle++];
      if (!source.id || (source.content && source.content.replace(/<[^>]*>/g, ' ').trim().length >= 200)) {
        englishDetails.set(source.slug, source);
        continue;
      }
      try {
        const detail = await fetchJson(`${API_BASE}/articles/${source.id}/?lang=en`);
        englishDetails.set(source.slug, { ...source, ...detail });
      } catch (error) {
        console.warn(`[prerender] English article detail unavailable for ${source.slug}: ${error.message}`);
        englishDetails.set(source.slug, source);
      }
    }
  });
  await Promise.all(workers);

  const entries = [];
  for (const source of englishSources) {
    const englishArticle = englishDetails.get(source.slug) || source;
    for (const lang of LANGS) {
      const article = lang === 'en'
        ? englishArticle
        : byLanguage[lang].find((item) => item.slug === source.slug);
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

const writeArticleMetadataFallbacks = async () => {
  const shell = fs.readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8');
  const entries = await collectArticleEntries();
  for (const { route, article } of entries) {
    const hasUsableBody = Boolean(article.content && article.content.replace(/<[^>]*>/g, ' ').trim().length >= 200);
    if (!hasUsableBody) console.warn(`[prerender] API has no article body for ${route}; retaining metadata fallback`);
    let html = applyArticleMetadata(shell, {
      title: article.meta_title || article.title,
      description: article.meta_description || article.excerpt,
      canonical: `${SITE_URL}${route}`,
      siteUrl: SITE_URL,
      image: article.featured_image,
      keywords: article.meta_keywords,
      alternates: entries
        .filter((entry) => entry.article.slug === article.slug)
        .map((entry) => ({ language: entry.language, route: entry.route })),
    });
    const language = route.split('/')[1];
    html = html.replace('<html lang="en">', `<html lang="${language}">`);
    if (hasUsableBody) {
      const titleHtml = `<main class="container mx-auto px-4 py-8"><article><h1>${escapeHtml(article.title)}</h1><div class="prose max-w-none">${article.content}</div></article></main>`;
      html = html.replace('<div id="root"></div>', `<div id="root">${titleHtml}</div>`);
    }
    const routeDir = path.join(BUILD_DIR, route);
    fs.mkdirSync(routeDir, { recursive: true });
    fs.writeFileSync(path.join(routeDir, 'index.html'), html, 'utf8');
  }
  console.log(`[prerender] wrote static article metadata for ${entries.length} localized routes`);
  return entries;
};


const CATEGORY_COPY = {
  en: {
    'cabinet-profiles': 'Profiles for cabinet doors and wardrobes. Check the section, panel fit, finish, and assembly before requesting a quote.',
    'industrial-profiles': 'For equipment frames and automation. Match section to load and connections; confirm alloy and finish.',
    't-slot-profiles': 'For modular frames. Confirm slot series, connectors, fasteners, and cut list.',
    'windows-doors': 'For window and door systems. Confirm opening, glazing, thermal break, hardware, and local requirements.',
    'standard-aluminium-profiles': 'For general fabrication. Share a drawing or standard to check alloy, dimensions, and tolerances.',
  },
  zh: {
    'cabinet-profiles': '适用于柜门和衣柜系统。询价前核对截面、板材适配、表面处理和装配方式。',
    'industrial-profiles': '适用于设备框架和自动化结构。结合承载与连接方式选截面，并确认合金状态和表面处理。',
    't-slot-profiles': '适用于模块化框架。先确认槽口系列、连接件、紧固件和下料尺寸。',
    'windows-doors': '适用于门窗系统。确认开启方式、玻璃、隔热条、五金及项目所在地规范。',
    'standard-aluminium-profiles': '适用于通用加工。提供截面图或标准号，便于核对尺寸、合金状态和公差。',
  },
  es: {
    'cabinet-profiles': 'Para armarios. Compruebe sección, panel, acabado y montaje antes de cotizar.',
    'industrial-profiles': 'Para equipos y automatización. Defina carga y conexiones; confirme aleación y acabado.',
    't-slot-profiles': 'Para estructuras modulares. Confirme ranura, conectores, fijaciones y lista de corte.',
    'windows-doors': 'Para ventanas y puertas. Confirme apertura, vidrio, aislamiento, herrajes y normas locales.',
    'standard-aluminium-profiles': 'Para fabricación general. Envíe plano o norma para revisar aleación, medidas y tolerancias.',
  },
  pt: {
    'cabinet-profiles': 'Para armários. Confira seção, painel, acabamento e montagem antes do orçamento.',
    'industrial-profiles': 'Para equipamentos e automação. Defina carga e conexões; confirme liga e acabamento.',
    't-slot-profiles': 'Para estruturas modulares. Confirme canal, conectores, fixadores e plano de corte.',
    'windows-doors': 'Para janelas e portas. Confirme abertura, vidro, isolamento, ferragens e normas locais.',
    'standard-aluminium-profiles': 'Para fabricação geral. Envie desenho ou norma para conferir liga, dimensões e tolerâncias.',
  },
};
const escapeHtml = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const normalizeSiteImage = (value) => typeof value === 'string'
  ? value.replace(/^https?:\/\/(?:www\.)?lingyealuminum\.com(?=\/)/i, SITE_URL)
  : value;

const writeCategoryFallbacks = async () => {
  const shell = fs.readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8');
  const localized = await Promise.all(LANGS.map(async (language) => ({
    language,
    categories: await fetchAll('categories', language).catch(() => []),
    products: await fetchAll('products', language).catch(() => []),
  })));
  const byLanguage = Object.fromEntries(localized.map((entry) => [entry.language, entry]));
  const entries = [];
  for (const language of LANGS) {
    for (const slug of CATEGORY_SLUGS) entries.push({ language, slug, route: '/' + language + '/products/category/' + slug });
  }
  for (const entry of entries) {
    const data = byLanguage[entry.language];
    const category = data.categories.find((item) => item.slug === entry.slug);
    if (!category) continue;
    const name = category.translated_name || category.name || entry.slug;
    const description = CATEGORY_COPY[entry.language][entry.slug];
    const canonical = SITE_URL + entry.route;
    const alternates = LANGS.map((language) => ({ language, route: '/' + language + '/products/category/' + entry.slug }));
    const related = data.products.filter((product) => product.category && product.category.id === category.id);
    const cards = related.map((product) => {
      const productName = product.translated_name || product.name || 'Aluminum Profile';
      const productDescription = product.translated_description || product.description || '';
      const productImage = product.images && (product.images.find((image) => image.is_primary) || product.images[0]);
      const image = normalizeSiteImage(productImage && productImage.image || category.image || '');
      const productPath = '/' + entry.language + '/products/' + (product.slug || product.id);
      return '<article><a href="' + productPath + '"><img loading="lazy" src="' + escapeHtml(image) + '" alt="' + escapeHtml(productName) + '" style="width:100%;height:220px;object-fit:cover"></a><h2><a href="' + productPath + '">' + escapeHtml(productName) + '</a></h2><p>' + escapeHtml(productDescription) + '</p><a href="' + productPath + '">' + (entry.language === 'zh' ? '查看产品详情' : entry.language === 'es' ? 'Ver detalles' : entry.language === 'pt' ? 'Ver detalhes' : 'View product details') + '</a></article>';
    }).join('');
    let html = applyArticleMetadata(shell, {
      title: name + ' | LingYe Aluminum', description, canonical, siteUrl: SITE_URL,
      image: normalizeSiteImage(category.image), alternates,
    });
    html = html.replace('<html lang="en">', '<html lang="' + entry.language + '">');
    html = html.replace('content="article"', 'content="website"');
    const structured = '<script type="application/ld+json">' + JSON.stringify({
      '@context': 'https://schema.org', '@type': 'CollectionPage', name, description, url: canonical,
      isPartOf: { '@type': 'WebSite', name: 'LingYe Aluminum', url: SITE_URL },
    }) + '</script>';
    html = html.replace('</head>', structured + '</head>');
    const home = entry.language === 'zh' ? '首页' : entry.language === 'es' ? 'Inicio' : entry.language === 'pt' ? 'Início' : 'Home';
    const allProducts = entry.language === 'zh' ? '全部产品' : entry.language === 'es' ? 'Todos los productos' : entry.language === 'pt' ? 'Todos os produtos' : 'All products';
    const weightGuide = entry.slug === 'standard-aluminium-profiles' ? {
      en: ['Aluminium extrusion weight per metre', 'Estimate theoretical mass from the section area, then confirm the alloy and drawing for the order.', 'Read the weight guide'],
      zh: ['\u94dd\u6316\u538b\u578b\u6750\u6bcf\u7c73\u91cd\u91cf', '\u6839\u636e\u622a\u9762\u79ef\u4f30\u7b97\u7406\u8bba\u91cd\u91cf\uff0c\u5e76\u5728\u4e0b\u5355\u524d\u786e\u8ba4\u5408\u91d1\u4e0e\u56fe\u7eb8\u3002', '\u67e5\u770b\u91cd\u91cf\u6307\u5357'],
      es: ['Peso del perfil de aluminio por metro', 'Estime el peso te\u00f3rico a partir del \u00e1rea de la secci\u00f3n y confirme la aleaci\u00f3n y el plano antes de hacer el pedido.', 'Consulte la gu\u00eda de peso'],
      pt: ['Peso do perfil de alum\u00ednio por metro', 'Estime o peso te\u00f3rico pela \u00e1rea da se\u00e7\u00e3o e confirme a liga e o desenho antes de fazer o pedido.', 'Consulte o guia de peso'],
    }[entry.language] : null;
    const root = '<div id="root"><main style="max-width:1200px;margin:0 auto;padding:32px 24px;font-family:Arial,sans-serif"><nav><a href="/' + entry.language + '">' + home + '</a> / <a href="/' + entry.language + '/products">' + allProducts + '</a> / ' + escapeHtml(name) + '</nav><header style="padding:28px 0"><h1>' + escapeHtml(name) + '</h1><p style="max-width:760px;line-height:1.7">' + escapeHtml(description) + '</p></header><section><h2>' + escapeHtml(name) + ' — ' + (entry.language === 'zh' ? '产品目录' : 'Products') + ' (' + related.length + ')</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px">' + cards + '</div></section>' + (weightGuide ? '<section style="margin:32px 0;padding:20px;border:1px solid #ddd;border-radius:12px"><h2>' + escapeHtml(weightGuide[0]) + '</h2><p>' + escapeHtml(weightGuide[1]) + ' <a href="/' + entry.language + '/news/aluminium-extrusion-weight-per-metre">' + escapeHtml(weightGuide[2]) + '</a></p></section>' : '') + '<p style="margin-top:32px"><a href="/' + entry.language + '/products">' + allProducts + '</a></p></main></div>';
    html = html.replace('<div id="root"></div>', root);
    const outDir = path.join(BUILD_DIR, entry.route);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
  }
  console.log('[prerender] wrote static category pages for ' + entries.length + ' localized routes');
};

const collectRoutes = async () => {
  const routes = new Set(['/']);
  for (const lang of LANGS) {
    routes.add(`/${lang}`);
    for (const slug of CATEGORY_SLUGS) routes.add('/' + lang + '/products/category/' + slug);
    routes.add(`/${lang}/products`);
    routes.add(`/${lang}/news`);
    routes.add(`/${lang}/about`);
    routes.add(`/${lang}/products/windows-doors/showcase`);
  }
  for (const slug of [
    'aluminum-profile-supplier-for-construction-projects',
    'industrial-aluminum-extrusion-manufacturer-in-china',
    'custom-aluminum-profile-factory-for-oem-orders',
  ]) routes.add(`/en/${slug}`);

  const sitemapPath = path.join(BUILD_DIR, 'sitemap.xml');
  if (fs.existsSync(sitemapPath)) {
    const sitemap = fs.readFileSync(sitemapPath, 'utf8');
    const sitemapRoutes = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map((match) => match[1].replace(/&amp;/g, '&'))
      .map((loc) => {
        try {
          const url = new URL(loc);
          return url.origin === SITE_URL ? url.pathname.replace(/\/$/, '') || '/' : null;
        } catch { return null; }
      })
      .filter(Boolean);
    if (sitemapRoutes.length) {
      sitemapRoutes.forEach((route) => routes.add(route));
      console.log(`[prerender] loaded ${sitemapRoutes.length} routes from sitemap`);
      return [...routes];
    }
  }

  try {
    const [products, articleEntries] = await Promise.all([
      fetchAll('products').catch(() => []),
      collectArticleEntries().catch(() => []),
    ]);
    for (const p of products) {
      const s = p.slug || p.id;
      for (const lang of LANGS) routes.add(`/${lang}/products/${s}`);
    }
    for (const entry of articleEntries) routes.add(entry.route);
    console.log(`[prerender] ${products.length} products, ${articleEntries.length} localized article routes`);
  } catch (err) {
    console.warn('[prerender] dynamic routes skipped:', err.message);
  }
  return [...routes];
};

const startServer = () =>
  new Promise((resolve) => {
    const server = http.createServer(async (req, res) => {
      const requestUrl = new URL(req.url || '/', 'http://127.0.0.1:' + PORT);
      if (requestUrl.pathname === '/api' || requestUrl.pathname.startsWith('/api/')) {
        try {
          const upstream = await fetch(API_BASE + requestUrl.pathname.slice(4) + requestUrl.search, { headers: { Accept: req.headers.accept || 'application/json' } });
          res.statusCode = upstream.status;
          res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json');
          res.end(Buffer.from(await upstream.arrayBuffer()));
        } catch (error) { res.statusCode = 502; res.end('Prerender API proxy failed'); }
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
  await writeArticleMetadataFallbacks();
  await writeCategoryFallbacks();

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
    console.warn(`[prerender] browser unavailable; keeping static article metadata pages: ${error.message}`);
    return;
  }

  const renderOne = async (route) => {
    const page = await browser.newPage();
    try {
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: RENDER_TIMEOUT });
      const language = route.match(/^\/(en|zh|es|pt)(?:\/|$)/)?.[1] || 'en';
      await page.waitForFunction((expectedLanguage) => {
        const root = document.querySelector('#root');
        const pathname = window.location.pathname;
        const isProductCatalog = /^\/[^/]+\/products(?:\/category\/[^/]+)?\/?$/.test(pathname);
        const catalog = document.querySelector('[data-testid="products-page"]');
        return document.documentElement.lang === expectedLanguage
          && document.documentElement.dataset.translationLanguage === expectedLanguage
          && Boolean(root && root.querySelector('main h1'))
          && root.innerText.trim().length > 100
          && (!isProductCatalog || Boolean(catalog && catalog.dataset.productsLoaded === 'true' && catalog.dataset.translationLanguage === expectedLanguage));
      }, { timeout: RENDER_TIMEOUT }, language);
      const expectedPath = route === '/' ? '/en' : route;
      if (new URL(page.url()).pathname !== expectedPath) {
        throw new Error(`Route redirected during prerender: ${route} -> ${new URL(page.url()).pathname}`);
      }
      let html = await page.content();
      html = html.replace(/http:\/\/127\.0\.0\.1:\d+/g, 'https://lingyealu.com');
      html = html.replace(/https?:\/\/(?:www\.)?lingyealuminum\.com/gi, 'https://lingyealu.com');
      html = html.replace(/<html\b([^>]*?)\blang=[\"']([^\"']*)/i, (match, before, current) => match.replace(current, language));
      const outDir = path.join(PRERENDER_DIR, route === '/' ? '' : route);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
    } finally {
      await page.close().catch(() => {});
    }
  };

  // Filter already-rendered
  const forceRender = process.env.PRERENDER_FORCE === '1';
  const todo = routes.filter((r) => {
    if (forceRender || r === '/') return true;
    const f = path.join(PRERENDER_DIR, r === '/' ? '' : r, 'index.html');
    return !fs.existsSync(f);
  });
  if (todo.length < routes.length) console.log(`[prerender] skipping ${routes.length - todo.length} cached`);

  let failed = 0;
  const failedRoutes = [];
  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    if (i > 0 && i % RESTART_EVERY === 0) {
      try { await browser.close(); } catch {}
      browser = await launchBrowser();
    }
    const batch = todo.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(batch.map(renderOne));
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        failedRoutes.push(batch[index]);
        console.error(`\n[prerender] route failed ${batch[index]}: ${result.reason?.message || result.reason}`);
      }
    });
    failed += results.filter((r) => r.status === 'rejected').length;
    process.stdout.write(`\r[prerender] ${Math.min(i + CONCURRENCY, todo.length)}/${todo.length} (failed: ${failed})`);
  }

  if (failedRoutes.length) {
    console.log(`[prerender] retrying ${failedRoutes.length} transiently failed routes`);
    for (const route of failedRoutes) {
      try {
        await renderOne(route);
        failed -= 1;
        console.log(`[prerender] retry succeeded ${route}`);
      } catch (error) {
        console.error(`[prerender] retry failed ${route}: ${error.message || error}`);
      }
    }
  }
  try { await browser.close(); } catch {}
  server.close();
  console.log(`\n[prerender] done — ${routes.length} total, ${todo.length} rendered, ${failed} failed`);
  if (failed > 0) throw new Error(`[prerender] refusing to finish with ${failed} failed routes`);
};

if (require.main === module) {
  prerender().catch((err) => { console.error('[prerender] fatal:', err); process.exit(1); });
}

module.exports = { prerender, collectRoutes, collectArticleEntries, writeArticleMetadataFallbacks };
