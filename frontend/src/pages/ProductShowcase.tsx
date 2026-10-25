import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import FloatingContactButtons from '../components/FloatingContactButtons';
import InquiryForm from '../components/InquiryForm';
import { useTranslation } from '../contexts/TranslationContext';
import { useSeoMeta } from '../hooks/useSeoMeta';
import { useStructuredData } from '../hooks/useStructuredData';

const profileImage = '/images/thermal-break-window-system.webp';
const decisionPoints = [
  ['showcase_drawing_title', 'showcase_drawing_desc'],
  ['showcase_interfaces_title', 'showcase_interfaces_desc'],
  ['showcase_project_title', 'showcase_project_desc'],
] as const;
const quoteDetails = [
  'showcase_quote_drawing',
  'showcase_quote_interfaces',
  'showcase_quote_finish',
  'showcase_quote_quantity',
] as const;

const ProductShowcase: React.FC = () => {
  const { pathname } = useLocation();
  const { t, currentLanguage: contextLanguage } = useTranslation();
  const pathLanguage = pathname.split('/').filter(Boolean)[0];
  const currentLanguage = pathLanguage && ['en', 'zh', 'es', 'pt'].includes(pathLanguage) ? pathLanguage : contextLanguage;
  const canonicalPath = `/${currentLanguage}/products/windows-doors/showcase`;
  const title = t('showcase_meta_title', 'Window and Door Aluminium Profiles | LingYe Aluminum');
  const description = t('showcase_meta_description', 'Review window and door profile requirements from section drawings, glazing and hardware interfaces, finish, quantities, and destination market.');

  useSeoMeta({
    title,
    description,
    canonicalPath,
    ogImage: profileImage,
    ogTitle: title,
    ogDescription: description,
    language: currentLanguage,
  });

  const pageStructuredData = React.useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: `https://lingyealu.com${canonicalPath}`,
    isPartOf: { '@type': 'WebSite', name: 'LingYe Aluminum', url: 'https://lingyealu.com' },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      contentUrl: `https://lingyealu.com${profileImage}`,
      caption: t('showcase_image_alt', 'Thermal-break aluminum window profile section'),
    },
  }), [canonicalPath, description, t, title]);

  useStructuredData('showcase-page', pageStructuredData);

  const breadcrumbStructuredData = React.useMemo(() => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://lingyealu.com';
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: t('nav_home', 'Home'), item: `${base}/${currentLanguage}` },
        { '@type': 'ListItem', position: 2, name: t('nav_products', 'Products'), item: `${base}/${currentLanguage}/products` },
        { '@type': 'ListItem', position: 3, name: t('showcase_title', 'Window and Door Aluminium Profiles'), item: `${base}${canonicalPath}` },
      ],
    };
  }, [canonicalPath, currentLanguage, t]);

  useStructuredData('showcase-breadcrumb', breadcrumbStructuredData);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-14 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">{t('showcase_eyebrow', 'Window and door systems')}</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">{t('showcase_title', 'Window and Door Aluminium Profiles')}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">{t('showcase_intro', 'Review profile sections, glazing and hardware interfaces, finish, and project requirements against your drawings. Final dimensions and specifications are confirmed for each project.')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#quote" className="rounded-lg bg-sky-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-300">{t('showcase_quote_button', 'Send a project inquiry')}</a>
              <Link to={`/${currentLanguage}/products/category/windows-doors`} className="rounded-lg border border-white/40 px-5 py-3 font-semibold text-white transition hover:bg-white/10">{t('showcase_browse_button', 'Browse window and door profiles')}</Link>
            </div>
          </div>
          <figure className="overflow-hidden rounded-2xl border border-white/15 bg-white shadow-2xl">
            <img src={profileImage} alt={t('showcase_image_alt', 'Thermal-break aluminum window profile section')} className="max-h-[460px] w-full object-contain" width="344" height="279" fetchPriority="high" decoding="async" />
            <figcaption className="bg-white px-4 py-3 text-sm text-slate-600">{t('showcase_image_caption', 'Reference image. Confirm the selected system and section against project drawings.')}</figcaption>
          </figure>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-12 px-6 py-12 lg:px-8 lg:py-16">
        <section aria-labelledby="system-review-title">
          <div className="max-w-3xl">
            <h2 id="system-review-title" className="text-3xl font-bold text-slate-900">{t('showcase_review_title', 'Check the system against the project')}</h2>
            <p className="mt-3 leading-7 text-slate-600">{t('showcase_review_intro', 'A profile should be reviewed as part of the complete window or door assembly. The information below helps clarify fit and scope before a quotation.')}</p>
          </div>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {decisionPoints.map(([titleKey, descKey], index) => (
              <article key={titleKey} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-sky-700">0{index + 1}</p>
                <h3 className="mt-3 text-xl font-semibold text-slate-900">{t(titleKey, '')}</h3>
                <p className="mt-2 leading-7 text-slate-600">{t(descKey, '')}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid items-center gap-8 rounded-2xl border border-slate-200 bg-white p-6 md:grid-cols-2 md:p-9">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t('showcase_finish_title', 'Specify finish and fabrication needs')}</h2>
            <p className="mt-3 leading-7 text-slate-600">{t('showcase_finish_desc', 'Describe the required appearance, exposure conditions, machining, and assembly. Confirm the finish, color reference, samples, and any project testing before production.')}</p>
          </div>
          <ul className="grid gap-3 text-slate-700 sm:grid-cols-2">
            {['showcase_finish_item_1', 'showcase_finish_item_2', 'showcase_finish_item_3', 'showcase_finish_item_4'].map((key) => (
              <li key={key} className="rounded-lg bg-slate-50 p-4">{t(key, '')}</li>
            ))}
          </ul>
        </section>

        <section id="quote" className="scroll-mt-8 rounded-2xl bg-slate-900 p-6 text-white md:p-9">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">{t('showcase_quote_eyebrow', 'For a useful quotation')}</p>
              <h2 className="mt-3 text-3xl font-bold">{t('showcase_quote_title', 'Share the details available so far')}</h2>
              <p className="mt-3 leading-7 text-slate-300">{t('showcase_quote_intro', 'If a specification is not final, send the current drawing and note which points still need review. No unconfirmed dimensions or performance values are assumed.')}</p>
              <ul className="mt-6 space-y-3 text-slate-200">
                {quoteDetails.map((key) => <li key={key} className="flex gap-3"><span className="text-sky-300">•</span><span>{t(key, '')}</span></li>)}
              </ul>
            </div>
            <div className="rounded-xl bg-white p-5 text-slate-900 md:p-7">
              <h3 className="mb-5 text-xl font-semibold">{t('showcase_form_title', 'Window and door profile inquiry')}</h3>
              <InquiryForm productName={t('showcase_form_product', 'Window and Door Aluminium Profiles')} productLink={typeof window !== 'undefined' ? window.location.href : ''} />
            </div>
          </div>
        </section>
      </main>
      <FloatingContactButtons />
    </div>
  );
};

export default ProductShowcase;
