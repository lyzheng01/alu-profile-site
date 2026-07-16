import { useEffect } from 'react';

interface SeoMetaOptions {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogTitle?: string;
  ogDescription?: string;
  robots?: string;
  language?: string;
  ogImage?: string;
}

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
  const url = `${window.location.origin}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
};

export const useSeoMeta = ({ title, description, canonicalPath, ogTitle, ogDescription, robots, language, ogImage }: SeoMetaOptions) => {
  useEffect(() => {
    if (language) document.documentElement.lang = language;
    if (title) document.title = title;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', robots);
    upsertMeta('property', 'og:title', ogTitle || title);
    upsertMeta('property', 'og:description', ogDescription || description);
    upsertMeta('property', 'og:url', canonicalPath && typeof window !== 'undefined' ? `${window.location.origin}${canonicalPath}` : undefined);
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('name', 'twitter:title', ogTitle || title);
    upsertMeta('name', 'twitter:description', ogDescription || description);
    upsertMeta('name', 'twitter:image', ogImage);
    upsertCanonical(canonicalPath);
  }, [title, description, canonicalPath, ogTitle, ogDescription, robots, language, ogImage]);
};
