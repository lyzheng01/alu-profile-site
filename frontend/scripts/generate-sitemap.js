/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { hasLocalizedArticle } = require('./seo-utils');

const SITE_URL = process.env.SITE_URL || 'https://lingyealu.com';
const API_BASE = process.env.SITEMAP_API_BASE || 'https://lingyealu.com/api';
const LANGS = ['en', 'zh', 'es', 'pt'];
const PRODUCT_CATEGORY_SLUGS = [
  'cabinet-profiles',
  'industrial-profiles',
  't-slot-profiles',
  'windows-doors',
  'standard-aluminium-profiles',
];
const EN_LANDING_SLUGS = [
  'aluminum-profile-supplier-for-construction-projects',
  'industrial-aluminum-extrusion-manufacturer-in-china',
  'custom-aluminum-profile-factory-for-oem-orders',
];

const staticPaths = [
  ...LANGS.map((lang) => ({ path: `/${lang}`, changefreq: 'daily', priority: '0.9' })),
  ...LANGS.map((lang) => ({ path: `/${lang}/products`, changefreq: 'daily', priority: '0.8' })),
  ...PRODUCT_CATEGORY_SLUGS.flatMap((slug) => LANGS.map((lang) => ({ path: `/${lang}/products/category/${slug}`, changefreq: 'weekly', priority: '0.75' }))),
  ...LANGS.map((lang) => ({ path: `/${lang}/news`, changefreq: 'daily', priority: '0.7' })),
  ...LANGS.map((lang) => ({ path: `/${lang}/about`, changefreq: 'monthly', priority: '0.6' })),
  ...LANGS.map((lang) => ({ path: `/${lang}/products/windows-doors/showcase`, changefreq: 'weekly', priority: '0.7' })),
  ...EN_LANDING_SLUGS.map((slug) => ({ path: `/en/${slug}`, changefreq: 'weekly', priority: '0.75' })),
];

const todayISO = new Date().toISOString();

const fetchJson = async (url) => {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(30000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 700));
    }
  }
  throw new Error(`Failed to fetch ${url}: ${lastError?.message || lastError}`);
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

const productRouteAlternates = (loc) => {
  const route = loc.replace(SITE_URL, '');
  if (!/^\/(en|zh|es|pt)\/products(?:\/|$)/.test(route)) return [];
  const path = route.split('/').filter(Boolean).slice(1).join('/');
  return [
    { language: 'x-default', url: `${SITE_URL}/en/${path}` },
    ...LANGS.map((language) => ({ language, url: `${SITE_URL}/${language}/${path}` })),
  ];
};

const toUrlNode = (loc, lastmod, changefreq, priority, alternates = productRouteAlternates(loc)) => {
  const lastmodStr = lastmod ? `    <lastmod>${lastmod}</lastmod>` : '';
  const alternateTags = alternates.map(({ language, url }) =>
    `    <xhtml:link rel="alternate" hreflang="${language}" href="${url}" />`
  );
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmodStr,
    ...alternateTags,
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

  const [products, ...articleLists] = await Promise.all([
    fetchAll('products'),
    ...LANGS.map((lang) => fetchAll('articles', lang)),
  ]);
  if (!products.length || !articleLists[0]?.length) {
    throw new Error(`API returned incomplete content: ${products.length} products, ${articleLists[0]?.length || 0} English articles`);
  }
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
  const content = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...nodes,
    '</urlset>',
    '',
  ].join('\n');

  const publicPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(publicPath, content, 'utf8');
  console.log(`[sitemap] generated: ${publicPath}`);
};

if (require.main === module) {
  build().catch((err) => {
    console.error('[sitemap] failed:', err);
    process.exit(1);
  });
}

module.exports = { staticPaths, toUrlNode, productRouteAlternates };
