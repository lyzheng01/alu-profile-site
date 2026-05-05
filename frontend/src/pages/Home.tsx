import React, { useEffect, useMemo, useState } from 'react';
import CountUp from 'react-countup';
import { Link } from 'react-router-dom';
import FloatingContactButtons from '../components/FloatingContactButtons';
import InquiryForm from '../components/InquiryForm';
import { API_ENDPOINTS } from '../config/api';
import { useTranslation } from '../contexts/TranslationContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { useStructuredData } from '../hooks/useStructuredData';
import { trackEvent } from '../utils/analytics';
import { resolveMediaUrl } from '../utils/url';

type ProductImage = {
  image: string;
  is_primary?: boolean;
};

type FeaturedProduct = {
  id: number | string;
  name: string;
  description?: string;
  images?: ProductImage[];
  product_image: string;
};

type CategoryItem = {
  id: number | string;
  name: string;
  description?: string;
  image?: string;
};

type FactoryImage = {
  title?: string;
  image?: string;
};

const Home: React.FC = () => {
  const { t, currentLanguage } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [factoryImages, setFactoryImages] = useState<FactoryImage[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  usePageTitle('home');

  const stats = useMemo(
    () => [
      { value: 15, suffix: '+', label: 'Years of export-focused manufacturing' },
      { value: 12, suffix: '', label: 'Extrusion and finishing lines' },
      { value: 30, suffix: '+', label: 'Countries served with aluminum profiles' },
      { value: 7, suffix: '-15', label: 'Days typical lead time for standard orders' },
    ],
    []
  );

  const capabilityCards = useMemo(
    () => [
      {
        title: 'OEM Drawing Support',
        description:
          'From quotation review to extrusion die evaluation, we help buyers move from drawing to shipment with fewer delays.',
      },
      {
        title: 'Integrated Surface Finishing',
        description:
          'Anodizing, powder coating, wood grain, cutting, drilling, and CNC support are organized around stable export production.',
      },
      {
        title: 'Reliable Export Packaging',
        description:
          'We prepare bundles, film, carton, pallet, and container loading plans that reduce transit damage and simplify receiving.',
      },
    ],
    []
  );

  const applicationScenes = useMemo(
    () => [
      'Windows and doors systems',
      'Curtain wall and facade projects',
      'Industrial frames and automation lines',
      'Decorative trim and furniture applications',
    ],
    []
  );

  const faqItems = useMemo(
    () => [
      {
        question: 'What information helps you quote faster?',
        answer:
          'Share drawings, alloy and temper, surface finish, quantity, and destination port. That lets us respond with a practical quotation quickly.',
      },
      {
        question: 'Can you support OEM and custom extrusion orders?',
        answer:
          'Yes. We support OEM and ODM projects with custom drawings, profile tooling evaluation, and production planning for export orders.',
      },
      {
        question: 'Which surface treatments are commonly available?',
        answer:
          'Typical options include anodizing, powder coating, electrophoresis, and wood-grain transfer based on end-use requirements.',
      },
      {
        question: 'Do you only supply construction profiles?',
        answer:
          'No. We supply both architectural and industrial aluminum profiles, including window, door, trim, and custom mechanical applications.',
      },
    ],
    []
  );

  const faqStructuredData = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    }),
    [faqItems]
  );

  useStructuredData('home-faq', faqStructuredData);

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        const [factoryResponse, productsResponse, categoriesResponse] = await Promise.all([
          fetch(API_ENDPOINTS.FACTORY_IMAGES),
          fetch(`${API_ENDPOINTS.PRODUCTS}?featured=true&lang=${currentLanguage}`),
          fetch(`${API_ENDPOINTS.CATEGORIES}?lang=${currentLanguage}`),
        ]);

        if (factoryResponse.ok) {
          const factoryData = await factoryResponse.json();
          const factoryList = factoryData.results || factoryData || [];
          setFactoryImages(Array.isArray(factoryList) ? factoryList : []);
        }

        if (productsResponse.ok) {
          const productData = await productsResponse.json();
          const products = (productData.results || productData || []) as any[];
          setFeaturedProducts(
            products.map((product) => ({
              ...product,
              product_image:
                product.images && product.images.length > 0
                  ? product.images.find((img: ProductImage) => img.is_primary)?.image || product.images[0].image
                  : '',
            }))
          );
        }

        if (categoriesResponse.ok) {
          const categoryData = await categoriesResponse.json();
          const categoryList = (categoryData.results || categoryData || []) as CategoryItem[];
          setCategories(categoryList.slice(0, 4));
        }
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
      }
    };

    fetchHomepageData();
  }, [currentLanguage]);

  const heroImage = useMemo(() => {
    const preferredFactoryImage = factoryImages.find((item) => (item.title || '').includes('首页图片1'));
    return resolveMediaUrl(preferredFactoryImage?.image) || 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1600&h=900&fit=crop';
  }, [factoryImages]);

  const slideImages = useMemo(() => {
    const dynamicImages = factoryImages
      .map((item) => resolveMediaUrl(item.image))
      .filter(Boolean) as string[];

    const fallbackImages = [
      heroImage,
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&h=900&fit=crop',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1600&h=900&fit=crop',
    ];

    return [...dynamicImages, ...fallbackImages].slice(0, 3);
  }, [factoryImages, heroImage]);

  const galleryImages = useMemo(
    () =>
      factoryImages
        .map((item) => ({
          title: item.title || 'Factory image',
          image: resolveMediaUrl(item.image),
        }))
        .filter((item) => item.image)
        .slice(0, 3),
    [factoryImages]
  );

  const primaryProduct = featuredProducts[0];
  const secondaryProducts = featuredProducts.slice(1, 4);

  useEffect(() => {
    if (slideImages.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [slideImages]);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0">
          {slideImages.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className={`absolute inset-0 bg-cover bg-center brightness-[0.88] contrast-[1.08] saturate-[1.08] transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(2,6,23,0.72),rgba(12,74,110,0.44),rgba(15,23,42,0.34))]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.18),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-24 lg:px-8 lg:pb-24 lg:pt-32">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="max-w-3xl rounded-[34px] border border-white/10 bg-slate-950/28 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.20)] backdrop-blur-[6px] md:p-8">
              <div className="inline-flex items-center rounded-full border border-sky-300/30 bg-white/10 px-4 py-2 text-sm font-medium text-sky-100 shadow-lg backdrop-blur-xl">
                Aluminum extrusion, finishing, and export support from China
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-tight text-white drop-shadow-[0_8px_32px_rgba(15,23,42,0.75)] md:text-6xl">
                China Aluminum Profile Manufacturer
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-sky-50/95 md:text-xl">
                Built for global buyers who need stable quality, practical lead times, and a supplier that understands OEM drawings,
                export packaging, and B2B communication.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    trackEvent('contact_click', {
                      source: 'home_hero_quote',
                      page_path: typeof window !== 'undefined' ? window.location.pathname : '',
                    });
                    const element = document.getElementById('home-inquiry-form');
                    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-7 py-3 text-base font-semibold text-white shadow-[0_18px_35px_rgba(249,115,22,0.35)] transition hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  Get a Quote
                </button>
                <Link
                  to={`/${currentLanguage}/products`}
                  className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-white/30 bg-white/12 px-7 py-3 text-base font-semibold text-white shadow-lg backdrop-blur transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
                >
                  View Products
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[30px] border border-white/15 bg-slate-950/30 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.30)] backdrop-blur-xl">
                <h2 className="text-lg font-semibold text-white">What buyers usually ask first</h2>
                <ul className="mt-5 space-y-4 text-sm leading-6 text-sky-50/90">
                  <li>Can you quote from 2D or 3D drawings?</li>
                  <li>Which alloys and tempers are available for this profile?</li>
                  <li>Can you handle anodizing, powder coating, and machining together?</li>
                  <li>What is the packaging plan for container shipment?</li>
                </ul>
              </div>
              <div className="rounded-[30px] border border-sky-200/10 bg-gradient-to-br from-sky-500/16 via-slate-950/26 to-orange-500/16 p-6 shadow-[0_20px_60px_rgba(8,47,73,0.24)] backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.24em] text-orange-200">Fast quote checklist</p>
                <p className="mt-3 text-lg font-semibold text-white">Send drawing, finish, quantity, and destination port.</p>
                <p className="mt-3 text-sm leading-6 text-orange-50/90">
                  That gives our team enough context to return a useful quotation instead of a generic reply.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 text-sm text-sky-100/90 md:grid-cols-3">
            <div className="rounded-[26px] border border-white/12 bg-slate-950/22 p-5 shadow-xl backdrop-blur-lg">
              OEM and ODM aluminum extrusion support
            </div>
            <div className="rounded-[26px] border border-white/12 bg-slate-950/22 p-5 shadow-xl backdrop-blur-lg">
              Architectural and industrial profile supply
            </div>
            <div className="rounded-[26px] border border-white/12 bg-slate-950/22 p-5 shadow-xl backdrop-blur-lg">
              Fast response for export quotation requests
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            {slideImages.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => setCurrentSlide(index)}
                className={`h-3 rounded-full transition-all ${
                  index === currentSlide ? 'w-10 bg-white' : 'w-3 bg-white/45 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="relative -mt-10 z-10 px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-[28px] border border-white/60 bg-white/90 p-6 text-center shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
              <div className="text-4xl font-semibold text-sky-700">
                <CountUp start={0} end={item.value} duration={2.2} />
                <span>{item.suffix}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#f8fbff_0%,#eef7ff_100%)] py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Why procurement teams shortlist us</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
              Production Strength You Can Verify
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              The homepage should answer the commercial questions buyers care about first: manufacturing scope, export readiness, response speed,
              and whether your team can execute repeated orders without quality drift.
            </p>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {capabilityCards.map((card) => (
              <article key={card.title} className="rounded-[30px] bg-gradient-to-br from-white via-white to-sky-50 p-7 shadow-[0_20px_55px_rgba(14,116,144,0.10)] ring-1 ring-sky-100 transition hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(14,116,144,0.16)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-100 to-cyan-50 text-sky-700 shadow-sm">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 7h16M7 4v6m10-6v6M5 11h14l-1 8H6l-1-8Z" />
                  </svg>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-3 text-base leading-7 text-slate-600">{card.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Category navigation</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">Explore Core Product Categories</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Make category decisions easy for visitors who arrive from search results and need to confirm quickly whether you handle their application.
              </p>
            </div>
            <Link
              to={`/${currentLanguage}/products`}
              className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              Browse all product categories
            </Link>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/${currentLanguage}/products?category=${category.id}`}
                className="group overflow-hidden rounded-[34px] bg-slate-950 shadow-[0_28px_70px_rgba(15,23,42,0.18)] transition hover:-translate-y-1 hover:shadow-[0_36px_85px_rgba(15,23,42,0.22)]"
              >
                <div className="relative h-64">
                  <img
                    src={resolveMediaUrl(category.image) || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=800&fit=crop'}
                    alt={category.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.92))]" />
                  <div className="absolute left-6 top-6 inline-flex rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-lg">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <h3 className="text-2xl font-semibold">{category.name}</h3>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-100/90">
                      {category.description || 'Profiles prepared for repeatable production, practical finishing options, and export shipment.'}
                    </p>
                    <span className="mt-4 inline-flex items-center rounded-full bg-white/12 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/90 backdrop-blur">
                      View Category
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-950 py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.20),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.20),transparent_25%)]" />
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-300">Featured supply</p>
              <h2 className="mt-4 text-3xl font-semibold md:text-4xl">Recommended Profiles for High-Intent Buyers</h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                Highlighting a few strong products keeps the homepage commercially useful without turning it into an endless catalog.
              </p>

              {primaryProduct ? (
                <Link
                  to={`/${currentLanguage}/products/${primaryProduct.id}`}
                  className="mt-8 block overflow-hidden rounded-[34px] border border-white/12 bg-white/8 shadow-[0_35px_90px_rgba(15,23,42,0.32)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.10]"
                >
                  <div className="grid md:grid-cols-[0.95fr_1.05fr]">
                    <div className="h-72 overflow-hidden">
                      <img
                        src={resolveMediaUrl(primaryProduct.product_image) || heroImage}
                        alt={primaryProduct.name}
                        className="h-full w-full object-cover"
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                    <div className="p-7">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-300">Featured Product</p>
                      <h3 className="mt-3 text-2xl font-semibold">{primaryProduct.name}</h3>
                      <p className="mt-4 text-base leading-7 text-slate-300">
                        {primaryProduct.description || 'Explore a profile page built for procurement review, specification checks, and quotation requests.'}
                      </p>
                      <span className="mt-6 inline-flex items-center text-sm font-semibold text-white">
                        View product details
                      </span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="mt-8 rounded-[32px] border border-dashed border-white/20 p-8 text-slate-300">
                  Add featured products in the backend to make the homepage stronger for product discovery and quotation flow.
                </div>
              )}
            </div>

            <div className="space-y-6">
              {secondaryProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/${currentLanguage}/products/${product.id}`}
                  className="grid min-h-[180px] gap-5 overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:bg-white/[0.08] md:grid-cols-[160px_1fr]"
                >
                  <img
                    src={resolveMediaUrl(product.product_image) || heroImage}
                    alt={product.name}
                    className="h-40 w-full rounded-2xl object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-white">{product.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {product.description || 'Built for aluminum buyers who need a clear product page, not just a name and one image.'}
                    </p>
                  </div>
                </Link>
              ))}

              <div className="rounded-[30px] border border-sky-300/20 bg-gradient-to-br from-sky-400/14 via-white/6 to-orange-500/14 p-6 backdrop-blur-xl">
                <h3 className="text-xl font-semibold text-white">Application coverage</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-sky-50/90">
                  {applicationScenes.map((scene) => (
                    <li key={scene} className="flex items-start gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-400" />
                      <span>{scene}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Factory and fulfillment</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">Visual Proof for Buyers Who Need More Than Marketing Copy</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Competitor sites convert better when they show factory environment, packaging logic, and shipment readiness. This block gives your homepage the same confidence layer.
              </p>
              <div className="mt-8 rounded-[28px] bg-slate-100 p-6">
                <h3 className="text-lg font-semibold text-slate-900">What this section should communicate</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  <li>Production scale and process discipline</li>
                  <li>Surface treatment and machining capacity</li>
                  <li>Export packaging and loading readiness</li>
                  <li>Repeat-order confidence for project buyers</li>
                </ul>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {galleryImages.length > 0 ? (
                galleryImages.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="overflow-hidden rounded-[30px] bg-slate-100 shadow-[0_20px_55px_rgba(15,23,42,0.12)]">
                    <img
                      src={item.image || heroImage}
                      alt={item.title}
                      className="h-64 w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                ))
              ) : (
                <>
                  {[
                    'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=900&h=1200&fit=crop',
                    'https://images.unsplash.com/photo-1581092919535-7146ff1a5902?w=900&h=1200&fit=crop',
                    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=900&h=1200&fit=crop',
                  ].map((image, index) => (
                    <div key={index} className="overflow-hidden rounded-[30px] bg-slate-100 shadow-[0_20px_55px_rgba(15,23,42,0.12)]">
                      <img src={image} alt="Factory and production" className="h-64 w-full object-cover" loading="lazy" decoding="async" />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)] py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">FAQ</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">Common Questions from Aluminum Buyers</h2>
          </div>
          <div className="mt-10 space-y-4">
            {faqItems.map((item) => (
              <details key={item.question} className="rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm open:shadow-md">
                <summary className="cursor-pointer list-none text-lg font-semibold text-slate-900">{item.question}</summary>
                <p className="mt-4 text-base leading-7 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="home-inquiry-form" className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-600">Inquiry</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">Start Your Quote With the Right Details</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              A strong homepage should make the next step obvious. Instead of hiding contact behind multiple clicks, give buyers a direct quotation form and clear expectations.
            </p>
            <div className="mt-8 space-y-5 rounded-[30px] bg-gradient-to-br from-slate-950 via-sky-950 to-slate-900 p-6 text-slate-100 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
              <div>
                <h3 className="text-lg font-semibold text-white">Send these details for a faster reply</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                  <li>Profile drawing or reference photo</li>
                  <li>Alloy, temper, and finish requirement</li>
                  <li>Estimated quantity and destination port</li>
                  <li>Packaging or machining expectations</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                Email, WhatsApp, and product links can work together, but the form should remain the clearest conversion path on the page.
              </div>
            </div>
          </div>

          <div className="rounded-[34px] bg-white shadow-[0_28px_75px_rgba(15,23,42,0.14)] ring-1 ring-slate-200">
            <InquiryForm />
          </div>
        </div>
      </section>

      <FloatingContactButtons />
    </div>
  );
};

export default Home;
