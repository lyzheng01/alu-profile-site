/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { hasLocalizedArticle } = require('./seo-utils');

const CANONICAL_SITE_URL = 'https://lingyealu.com';
const SITE_URL = process.env.SITE_URL || CANONICAL_SITE_URL;
if (SITE_URL !== CANONICAL_SITE_URL) throw new Error(`SITE_URL must be ${CANONICAL_SITE_URL}`);
const API_BASE = process.env.SITEMAP_API_BASE || 'https://lingyealu.com/api';
const LANGS = ['en', 'zh', 'es', 'pt'];
const CATEGORY_SLUGS = ['cabinet-profiles', 'industrial-profiles', 'standard-aluminium-profiles', 't-slot-profiles', 'windows-doors'];
const EN_LANDING_SLUGS = [
  'aluminum-profile-supplier-for-construction-projects',
  'industrial-aluminum-extrusion-manufacturer-in-china',
  'custom-aluminum-profile-factory-for-oem-orders',
];

const staticPaths = [
  ...LANGS.flatMap((lang) => CATEGORY_SLUGS.map((slug) => ({ path: '/' + lang + '/products/category/' + slug, changefreq: 'weekly', priority: '0.75' }))),
  ...LANGS.map((lang) => ({ path: `/${lang}`, changefreq: 'daily', priority: '0.9' })),
  ...LANGS.map((lang) => ({ path: `/${lang}/products`, changefreq: 'daily', priority: '0.8' })),
  ...LANGS.map((lang) => ({ path: `/${lang}/news`, changefreq: 'daily', priority: '0.7' })),
  ...LANGS.map((lang) => ({ path: `/${lang}/about`, changefreq: 'monthly', priority: '0.6' })),
  ...LANGS.map((lang) => ({ path: `/${lang}/products/windows-doors/showcase`, changefreq: 'weekly', priority: '0.7' })),
  ...EN_LANDING_SLUGS.map((slug) => ({ path: `/en/${slug}`, changefreq: 'weekly', priority: '0.75' })),
];

const todayISO = new Date().toISOString();

const fetchJson = async (url) => {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`Failed ${url}: ${res.status}`);
  }
  return res.json();
};

const fetchAll = async (resource, language) => {
  const items = [];
  let page = 1;

  while (true) {
    const langQuery = language ? `&lang=${language}` : '';
    const url = `${API_BASE}/${resource}/?page=${page}${langQuery}`;
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
  const lastmodStr = lastmod ? `    <lastmod>${lastmod}</lastmod>` : '';
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmodStr,
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
    nodes.push(toUrlNode(`${SITE_URL}${route.path}`, todayISO, route.changefreq, route.priority));
  }

  try {
    const [products, ...articleLists] = await Promise.all([
      fetchAll('products'),
      ...LANGS.map((lang) => fetchAll('articles', lang)),
    ]);
    const articlesByLanguage = Object.fromEntries(LANGS.map((lang, index) => [lang, articleLists[index]]));
    const englishArticles = articlesByLanguage.en;

    for (const product of products) {
      const productPath = product.slug || product.id;
      for (const lang of LANGS) {
        nodes.push(
          toUrlNode(
            `${SITE_URL}/${lang}/products/${productPath}`,
            normalizeDate(product.updated_at || product.created_at),
            'weekly',
            '0.7'
          )
        );
      }
    }

    for (const sourceArticle of englishArticles) {
      for (const lang of LANGS) {
        const article = articlesByLanguage[lang].find((item) => item.slug === sourceArticle.slug);
        if (!article || (lang !== 'en' && !hasLocalizedArticle(sourceArticle, article))) continue;
        const articlePath = article.slug || article.id;
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
    console.error('[sitemap] dynamic route fetch failed; refusing to write an incomplete sitemap:', err.message);
    throw err;
  }

  const locations = nodes.map((node) => node.match(/<loc>([^<]+)<\/loc>/)?.[1]).filter(Boolean);
  if (locations.length !== nodes.length) throw new Error('Could not validate every sitemap location');
  if (locations.some((loc) => !loc.startsWith(CANONICAL_SITE_URL + '/'))) throw new Error('Sitemap contains a non-canonical host');
  if (new Set(locations).size !== locations.length) throw new Error('Sitemap contains duplicate URLs');

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
