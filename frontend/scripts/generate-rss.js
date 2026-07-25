/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.SITE_URL || 'https://lingyealu.cn';
const API_BASE = process.env.RSS_API_BASE || 'http://127.0.0.1:9001/api';
const LANGS = ['en', 'zh', 'es', 'pt'];

const fetchJson = async (url) => {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Failed ${url}: ${res.status}`);
  return res.json();
};

const fetchAll = async (resource) => {
  const items = [];
  let page = 1;
  while (true) {
    const url = `${API_BASE}/${resource}/?page=${page}`;
    const data = await fetchJson(url);
    const list = Array.isArray(data) ? data : (data.results || []);
    items.push(...list);
    const next = Array.isArray(data) ? null : data.next;
    if (!next || list.length === 0) break;
    page += 1;
    if (page > 200) break;
  }
  return items;
};

const escapeXml = (str) =>
  (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const build = async () => {
  const now = new Date().toUTCString();

  try {
    const articles = await fetchAll('articles');
    const entries = articles.slice(0, 50).map((article) => {
      const url = `${SITE_URL}/en/news/${article.slug || article.id}`;
      const date = new Date(article.published_at || article.created_at).toUTCString();
      return `  <item>
    <title>${escapeXml(article.title)}</title>
    <link>${url}</link>
    <guid isPermaLink="true">${url}</guid>
    <description>${escapeXml(article.excerpt || article.title)}</description>
    <pubDate>${date}</pubDate>
    <source url="${SITE_URL}">LingYe Aluminum</source>
  </item>`;
    });

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>LingYe Aluminum - News &amp; Updates</title>
    <link>${SITE_URL}/en/news</link>
    <description>Latest aluminum market trends, processing insights, and product updates from LingYe Aluminum.</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
${entries.join('\n')}
  </channel>
</rss>`;

    const publicPath = path.join(__dirname, '..', 'public', 'rss.xml');
    const buildPath = path.join(__dirname, '..', 'build', 'rss.xml');
    fs.writeFileSync(publicPath, rss, 'utf8');
    fs.writeFileSync(buildPath, rss, 'utf8');
    console.log(`[rss] generated: ${publicPath} (${articles.length} articles)`);
  } catch (err) {
    console.warn('[rss] skipped:', err.message);
    // Generate minimal RSS with just a channel
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>LingYe Aluminum - News &amp; Updates</title>
    <link>${SITE_URL}/en/news</link>
    <description>Latest aluminum market trends, processing insights, and product updates from LingYe Aluminum.</description>
    <language>en</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
  </channel>
</rss>`;
    const publicPath = path.join(__dirname, '..', 'public', 'rss.xml');
    fs.writeFileSync(publicPath, fallback, 'utf8');
    console.log('[rss] fallback generated');
  }
};

build().catch((err) => {
  console.error('[rss] failed:', err);
  process.exit(1);
});
