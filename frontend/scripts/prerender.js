#!/usr/bin/env node
/**
 * Prerender script — renders routes into static HTML with correct meta tags.
 * API content loads client-side; the key SEO fix is unique meta tags per URL.
 */
const fs = require('fs');
const path = require('path');
const http = require('http');

const BUILD_DIR = path.join(__dirname, '..', 'build');
const PRERENDER_DIR = path.join(BUILD_DIR, 'prerendered');
const API_BASE = process.env.PRERENDER_API_BASE || 'http://127.0.0.1:9001/api';
const PORT = parseInt(process.env.PRERENDER_PORT || '3456', 10);
const CONCURRENCY = 2;
const RENDER_TIMEOUT = 15000;
const LANGS = ['en', 'zh', 'es', 'pt'];

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon',
};

const fetchJson = async (url) => {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
};

const fetchAll = async (resource) => {
  const items = [];
  let page = 1;
  while (page <= 200) {
    const data = await fetchJson(`${API_BASE}/${resource}/?page=${page}`);
    if (Array.isArray(data)) { items.push(...data); break; }
    const list = data.results || [];
    items.push(...list);
    if (!data.next || list.length === 0) break;
    page++;
  }
  return items;
};

const collectRoutes = async () => {
  const routes = new Set(['/']);
  for (const lang of LANGS) {
    routes.add(`/${lang}`);
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

  try {
    const [products, articles] = await Promise.all([
      fetchAll('products').catch(() => []),
      fetchAll('articles').catch(() => []),
    ]);
    for (const p of products) {
      const s = p.slug || p.id;
      for (const lang of LANGS) routes.add(`/${lang}/products/${s}`);
    }
    for (const a of articles) {
      const s = a.slug || a.id;
      for (const lang of LANGS) routes.add(`/${lang}/news/${s}`);
    }
    console.log(`[prerender] ${products.length} products, ${articles.length} articles`);
  } catch (err) {
    console.warn('[prerender] dynamic routes skipped:', err.message);
  }
  return [...routes];
};

const startServer = () =>
  new Promise((resolve) => {
    const server = http.createServer((req, res) => {
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

  let browser = await launchBrowser();

  const renderOne = async (route) => {
    const page = await browser.newPage();
    try {
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: RENDER_TIMEOUT });
      await new Promise((r) => setTimeout(r, 2000));
      let html = await page.content();
      html = html.replace(/http:\/\/127\.0\.0\.1:\d+/g, 'https://lingyealu.cn');
      const outDir = path.join(PRERENDER_DIR, route === '/' ? '' : route);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
    } finally {
      await page.close().catch(() => {});
    }
  };

  // Filter already-rendered
  const todo = routes.filter((r) => {
    const f = path.join(PRERENDER_DIR, r === '/' ? '' : r, 'index.html');
    return !fs.existsSync(f);
  });
  if (todo.length < routes.length) console.log(`[prerender] skipping ${routes.length - todo.length} cached`);

  let failed = 0;
  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    if (i > 0 && i % RESTART_EVERY === 0) {
      try { await browser.close(); } catch {}
      browser = await launchBrowser();
    }
    const batch = todo.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(batch.map(renderOne));
    failed += results.filter((r) => r.status === 'rejected').length;
    process.stdout.write(`\r[prerender] ${Math.min(i + CONCURRENCY, todo.length)}/${todo.length} (failed: ${failed})`);
  }

  try { await browser.close(); } catch {}
  server.close();
  console.log(`\n[prerender] done — ${routes.length} total, ${todo.length} rendered, ${failed} failed`);
};

if (require.main === module) {
  prerender().catch((err) => { console.error('[prerender] fatal:', err); process.exit(1); });
}

module.exports = { prerender, collectRoutes };
