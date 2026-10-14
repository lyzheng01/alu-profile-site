import React from 'react';
import FloatingContactButtons from '../components/FloatingContactButtons';
import InquiryForm from '../components/InquiryForm';
import FactoryShowcase from '../components/FactoryShowcase';
import { useTranslation } from '../contexts/TranslationContext';
import { useSeoMeta } from '../hooks/useSeoMeta';
import { SITE_ORIGIN } from '../config/site';
import { useStructuredData } from '../hooks/useStructuredData';
import { getProductShowcaseCopy } from '../data/productShowcaseCopy';
import { getSeoLocaleLabels } from '../data/seoLocaleLabels';

const heroImages = [
  'https://images.unsplash.com/photo-1505692794400-25d77c2d0f66?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80',
];

const productImages = [
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1505692794400-25d77c2d0f66?auto=format&fit=crop&w=1600&q=80',
];

const ProductShowcase: React.FC = () => {
  const { currentLanguage } = useTranslation();
  const copy = getProductShowcaseCopy(currentLanguage);
  const seoLabels = getSeoLocaleLabels(currentLanguage);

  useSeoMeta({
    title: copy.metaTitle,
    description: copy.metaDescription,
    ogTitle: copy.metaTitle,
    ogDescription: copy.metaDescription,
    canonicalPath: `/${currentLanguage}/products/windows-doors/showcase`,
    ogImage: `${SITE_ORIGIN}/logo.jpg?v=3`,
    language: currentLanguage,
  });

  const productStructuredData = React.useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: copy.title,
    description: copy.metaDescription,
    image: [`${SITE_ORIGIN}/logo.jpg?v=3`],
    publisher: { '@type': 'Organization', name: 'LingYe Aluminum', url: SITE_ORIGIN },
  }), [copy]);

  useStructuredData('showcase-product', productStructuredData);

  const breadcrumbStructuredData = React.useMemo(() => {
    const base = typeof window !== 'undefined' ? window.location.origin : SITE_ORIGIN;
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: seoLabels.home, item: `${base}/${currentLanguage}` },
        { '@type': 'ListItem', position: 2, name: seoLabels.products, item: `${base}/${currentLanguage}/products` },
        { '@type': 'ListItem', position: 3, name: copy.title, item: `${base}/${currentLanguage}/products/windows-doors/showcase` },
      ],
    };
  }, [currentLanguage, copy, seoLabels]);

  useStructuredData('showcase-breadcrumb', breadcrumbStructuredData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="relative overflow-hidden py-16 lg:py-20">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.2em] text-blue-700 font-semibold">{copy.heroEyebrow}</p>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
                {copy.title}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                {copy.intro}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {copy.heroFacts.map((fact) => (
                  <p key={fact} className="border-l-2 border-sky-600 pl-3 text-sm font-semibold text-slate-700">{fact}</p>
                ))}
                </div>
              </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-600 rounded-3xl opacity-30 blur-2xl group-hover:opacity-60 transition" />
              <div className="relative rounded-[32px] overflow-hidden shadow-2xl border border-white/40">
                <div className="grid grid-cols-2 gap-2">
                  {heroImages.map((img, idx) => (
                    <img key={idx} src={img} alt={`${copy.heroImageAlt} ${idx + 1}`} className="w-full h-full object-cover" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 space-y-16">
        <section className="grid md:grid-cols-2 gap-10">
          {productImages.map((img, idx) => (
            <div key={idx} className="w-full bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100">
            <img src={img} alt={`${copy.productImageAlt} ${idx + 1}`} className="w-full h-[420px] object-cover" />
            </div>
          ))}
        </section>

        <section className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{copy.specificationsTitle}</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-600">
              {copy.specifications.map((item) => (
                <div key={item.label} className="p-4 rounded-2xl bg-slate-50">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-xl">
            <h3 className="text-xl font-semibold mb-4">{copy.servicesTitle}</h3>
            <ul className="space-y-4 text-sm tracking-wide">
              {copy.services.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-slate-900">{copy.finishesTitle}</h2>
          <div className="mx-auto max-w-4xl overflow-hidden rounded-xl bg-slate-950">
            <img
              src="/images/surface-treatment-options-clean.webp"
              alt={copy.finishesTitle}
              className="mx-auto max-h-[720px] w-full object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {copy.finishes.map((finish) => (
              <div key={finish.title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-widest text-blue-500">{finish.title}</p>
                <p className="text-lg font-semibold text-slate-900 mt-2">{finish.note}</p>
                <p className="text-sm text-slate-600 mt-2">{finish.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-slate-900">{copy.applicationsTitle}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {copy.applications.map((item) => (
              <div key={item.title} className="bg-white rounded-lg p-6 shadow border border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900 mt-4">{item.title}</h3>
                <p className="text-sm text-slate-600 mt-2">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg">
          <div className="grid lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">{copy.checklistTitle}</h2>
              <ul className="space-y-4 text-slate-600">
                {copy.checklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-semibold text-xs flex items-center justify-center">{idx + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-4">
              <div className="w-full h-56 rounded-lg overflow-hidden border border-slate-100 bg-white">
                <img src="/images/quality-control-process-clean.webp" alt={copy.qualityImageAlt} className="w-full h-full object-contain" loading="lazy" decoding="async" />
              </div>
            </div>
          </div>
        </section>

        <FactoryShowcase className="-mx-6 lg:-mx-12" />

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">{copy.coordinationTitle}</h2>
          <div className="grid lg:grid-cols-5 gap-4">
            {copy.steps.map((step, index) => (
              <div key={step.title} className="bg-white rounded-lg p-5 border border-slate-100 shadow-sm">
                <p className="text-sm font-mono text-blue-500">{String(index + 1).padStart(2, '0')}</p>
                <h4 className="text-lg font-semibold text-slate-900 mt-2">{step.title}</h4>
                <p className="text-sm text-slate-600 mt-1">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 text-white shadow-2xl">
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.2em] text-white/80">{copy.supportEyebrow}</p>
              <h2 className="text-3xl font-bold leading-tight">{copy.supportTitle}</h2>
              <p className="text-white/80">
                {copy.supportDescription}
              </p>
              <div className="flex flex-wrap gap-6 text-sm text-white/70">
                {copy.supportBullets.map((item) => <span key={item}>• {item}</span>)}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-slate-900 shadow-xl">
              <InquiryForm productName={copy.inquiryProductName} productLink={typeof window !== 'undefined' ? window.location.href : ''} />
            </div>
          </div>
        </section>
      </div>

      <FloatingContactButtons />
    </div>
  );
};

export default ProductShowcase;

