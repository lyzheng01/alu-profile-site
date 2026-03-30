/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.SITE_URL || 'https://lingyealu.cn';
const API_BASE = process.env.SITEMAP_API_BASE || 'http://127.0.0.1:9001/api';
const LANGS = ['en', 'zh', 'es', 'pt'];
const EN_LANDING_SLUGS = [
  'aluminum-profile-supplier-for-construction-projects',
  'industrial-aluminum-extrusion-manufacturer-in-china',
  'custom-aluminum-profile-factory-for-oem-orders',
];

const staticPaths = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  ...LANGS.map((lang) => ({ path: `/${lang}`, changefreq: 'daily', priority: '0.9' })),
  ...LANGS.map((lang) => ({ path: `/${lang}/products`, changefreq: 'daily', priority: '0.8' })),
  ...LANGS.map((lang) => ({ path: `/${lang}/news`, changefreq: 'daily', priority: '0.7' })),
  ...LANGS.map((lang) => ({ path: `/${lang}/about`, changefreq: 'monthly', priority: '0.6' })),
  ...EN_LANDING_SLUGS.map((slug) => ({ path: `/en/${slug}`, changefreq: 'weekly', priority: '0.75' })),
];

const fetchJson = async (url) => {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`Failed ${url}: ${res.status}`);
  }
  return res.json();
};

const fetchAll = async (resource) => {
  const items = [];
  let page = 1;

  while (true) {
    const url = `${API_BASE}/${resource}/?page=${page}`;
    const data = await fetchJson(url);
    if (Array.isArray(data)) {
      items.push(...data);
      break;
    }

    const list = data.results || [];
    items.push(...list);

    if (!data.next || list.length === 0) break;
    page += 1;
    if (page > 200) break;
  }

  return items;
};

const toUrlNode = (loc, lastmod, changefreq, priority) => {
  const lastmodNode = lastmod ? `<lastmod>${lastmod}</lastmod>` : '';
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmodNode ? `    ${lastmodNode}` : '',
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
};

const normalizeDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString();
};

const build = async () => {
  const nodes = [];

  for (const route of staticPaths) {
    nodes.push(toUrlNode(`${SITE_URL}${route.path}`, '', route.changefreq, route.priority));
  }

  try {
    const [products, articles] = await Promise.all([fetchAll('products'), fetchAll('articles')]);

    for (const product of products) {
      for (const lang of LANGS) {
        nodes.push(
          toUrlNode(
            `${SITE_URL}/${lang}/products/${product.id}`,
            normalizeDate(product.updated_at || product.created_at),
            'weekly',
            '0.7'
          )
        );
      }
    }

    for (const article of articles) {
      const articlePath = article.slug || article.id;
      for (const lang of LANGS) {
        nodes.push(
          toUrlNode(
            `${SITE_URL}/${lang}/news/${articlePath}`,
            normalizeDate(article.updated_at || article.created_at),
            'weekly',
            '0.7'
          )
        );
      }
    }
  } catch (err) {
    console.warn('[sitemap] dynamic routes skipped:', err.message);
  }

  const content = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...nodes,
    '</urlset>',
    '',
  ].join('\n');

  const publicPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(publicPath, content, 'utf8');
  console.log(`[sitemap] generated: ${publicPath}`);
};

build().catch((err) => {
  console.error('[sitemap] failed:', err);
  process.exit(1);
});
