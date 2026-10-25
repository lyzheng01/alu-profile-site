const fs = require('node:fs');
const path = require('node:path');
const { applyArticleMetadata } = require('./frontend/scripts/seo-utils');

const siteUrl = 'https://lingyealu.com';
const apiBase = 'https://lingyealu.com/api';
const slug = 'aluminium-h-profile-sizes-guide';
const languages = ['en', 'zh', 'es', 'pt'];
const buildDir = path.join(__dirname, 'frontend', 'build');
const shell = fs.readFileSync(path.join(buildDir, 'index.html'), 'utf8');

async function main() {
  const articles = {};
  for (const language of languages) {
    const response = await fetch(apiBase + '/articles/by-slug/' + slug + '/?lang=' + language);
    if (!response.ok) throw new Error('Article API ' + language + ': ' + response.status);
    articles[language] = await response.json();
  }

  const alternates = languages.map((language) => ({ language, route: '/' + language + '/news/' + slug }));
  for (const language of languages) {
    const article = articles[language];
    const route = '/' + language + '/news/' + slug;
    const page = applyArticleMetadata(shell, {
      title: article.meta_title || article.title,
      description: article.meta_description || article.excerpt,
      canonical: siteUrl + route,
      siteUrl,
      image: siteUrl + '/media/articles/' + slug + '.webp',
      keywords: article.meta_keywords,
      alternates,
    });
    const outputDir = path.join(buildDir, route);
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'index.html'), page, 'utf8');
    console.log(language + ': ' + route);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
