import { useEffect } from 'react';

interface SeoMetaOptions {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
  ogTitle?: string;
  ogDescription?: string;
  robots?: string;
  language?: string;
  ogImage?: string;
  alternateLanguages?: string[];
}

const SUPPORTED_LANGUAGES = ['en', 'zh', 'es', 'pt'];
const SITE_ORIGIN = 'https://lingyealu.com';

const upsertMeta = (attr: 'name' | 'property', key: string, content?: string) => {
  if (!content || typeof document === 'undefined') return;
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const upsertCanonical = (canonicalPath?: string) => {
  if (!canonicalPath || typeof document === 'undefined' || typeof window === 'undefined') return;
  const url = `${SITE_ORIGIN}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
};

const resolveAlternateUrl = (lang: string, basePath: string): string => {
  const origin = SITE_ORIGIN;
  const segments = basePath.split('/').filter(Boolean);
  if (segments.length > 0 && SUPPORTED_LANGUAGES.includes(segments[0])) {
    segments[0] = lang;
  } else {
    segments.unshift(lang);
  }
  return `${origin}/${segments.join('/')}`;
};

const updateHreflang = (language: string, canonicalPath?: string, alternateLanguages?: string[]) => {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const basePath = canonicalPath || window.location.pathname;
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
  const addLink = (hreflang: string, lang: string) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', hreflang);
    link.setAttribute('href', resolveAlternateUrl(lang, basePath));
    document.head.appendChild(link);
  };
  const languages = (alternateLanguages || SUPPORTED_LANGUAGES)
    .filter(lang => SUPPORTED_LANGUAGES.includes(lang));
  const defaultLanguage = languages.includes('en') ? 'en' : languages[0] || language;
  addLink('x-default', defaultLanguage);
  languages.forEach(lang => addLink(lang, lang));
};

export const useSeoMeta = ({ title, description, keywords, canonicalPath, ogTitle, ogDescription, robots, language, ogImage, alternateLanguages }: SeoMetaOptions) => {
  useEffect(() => {
    if (language) document.documentElement.lang = language;
    if (title) document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'keywords', keywords);
    upsertMeta('name', 'robots', robots);
    upsertMeta('property', 'og:title', ogTitle || title);
    upsertMeta('property', 'og:description', ogDescription || description);
    upsertMeta('property', 'og:url', canonicalPath ? `${SITE_ORIGIN}${canonicalPath}` : undefined);
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('name', 'twitter:title', ogTitle || title);
    upsertMeta('name', 'twitter:description', ogDescription || description);
    upsertMeta('name', 'twitter:image', ogImage);
    upsertCanonical(canonicalPath);
    updateHreflang(language || 'en', canonicalPath, alternateLanguages);
  }, [title, description, keywords, canonicalPath, ogTitle, ogDescription, robots, language, ogImage, alternateLanguages]);
};
