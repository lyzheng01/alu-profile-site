const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const hasLocalizedArticle = (source, localized) => {
  if (!source || !localized) return false;
  if (source.content && localized.content) {
    return localized.content.trim() !== source.content.trim();
  }
  return Boolean(localized.title && localized.title !== source.title);
};

const replaceTag = (html, pattern, replacement, fallback) => (
  pattern.test(html) ? html.replace(pattern, replacement) : html.replace('</head>', `${fallback}</head>`)
);

const applyArticleMetadata = (html, { title, description, canonical, image, keywords, alternates = [], siteUrl = 'https://lingyealu.com' }) => {
  let output = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  output = replaceTag(
    output,
    /<meta\s+name="description"[^>]*>/i,
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<meta name="description" content="${escapeHtml(description)}">`
  );
  output = replaceTag(
    output,
    /<link\s+rel="canonical"[^>]*>/i,
    `<link rel="canonical" href="${escapeHtml(canonical)}">`,
    `<link rel="canonical" href="${escapeHtml(canonical)}">`
  );
  output = replaceTag(
    output,
    /<meta\s+property="og:title"[^>]*>/i,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`
  );
  output = replaceTag(
    output,
    /<meta\s+property="og:description"[^>]*>/i,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`
  );
  output = replaceTag(
    output,
    /<meta\s+property="og:url"[^>]*>/i,
    `<meta property="og:url" content="${escapeHtml(canonical)}">`,
    `<meta property="og:url" content="${escapeHtml(canonical)}">`
  );
  output = replaceTag(
    output,
    /<meta\s+property="og:type"[^>]*>/i,
    '<meta property="og:type" content="article">',
    '<meta property="og:type" content="article">'
  );
  output = replaceTag(
    output,
    /<meta\s+name="twitter:title"[^>]*>/i,
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:title" content="${escapeHtml(title)}">`
  );
  output = replaceTag(
    output,
    /<meta\s+name="twitter:description"[^>]*>/i,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`,
    `<meta name="twitter:description" content="${escapeHtml(description)}">`
  );
  if (image) {
    output = replaceTag(
      output,
      /<meta\s+property="og:image"[^>]*>/i,
      `<meta property="og:image" content="${escapeHtml(image)}">`,
      `<meta property="og:image" content="${escapeHtml(image)}">`
    );
    output = replaceTag(
      output,
      /<meta\s+name="twitter:image"[^>]*>/i,
      `<meta name="twitter:image" content="${escapeHtml(image)}">`,
      `<meta name="twitter:image" content="${escapeHtml(image)}">`
    );
  }
  if (keywords) {
    output = replaceTag(
      output,
      /<meta\s+name="keywords"[^>]*>/i,
      `<meta name="keywords" content="${escapeHtml(keywords)}">`,
      `<meta name="keywords" content="${escapeHtml(keywords)}">`
    );
  }
  const locale = { en: 'en_US', zh: 'zh_CN', es: 'es_ES', pt: 'pt_BR' };
  output = replaceTag(
    output,
    /<meta\s+property="og:locale"[^>]*>/i,
    `<meta property="og:locale" content="${locale[alternates.find((item) => item.route && canonical.endsWith(item.route))?.language] || 'en_US'}">`,
    '<meta property="og:locale" content="en_US">'
  );
  output = output.replace(/<link\s+rel="alternate"\s+hreflang="[^"]+"[^>]*>/gi, '');
  const english = alternates.find((item) => item.language === 'en');
  const alternateTags = [
    english && `<link rel="alternate" hreflang="x-default" href="${escapeHtml(`${siteUrl}${english.route}`)}">`,
    ...alternates.map((item) => `<link rel="alternate" hreflang="${escapeHtml(item.language)}" href="${escapeHtml(`${siteUrl}${item.route}`)}">`),
  ].filter(Boolean).join('');
  output = output.replace('</head>', `${alternateTags}</head>`);
  return output;
};

module.exports = { hasLocalizedArticle, applyArticleMetadata };
