import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FloatingContactButtons from '../components/FloatingContactButtons';
import InquiryForm from '../components/InquiryForm';
import { API_ENDPOINTS } from '../config/api';
import { useTranslation } from '../contexts/TranslationContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { useSeoMeta } from '../hooks/useSeoMeta';
import { useStructuredData } from '../hooks/useStructuredData';
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

const temporaryAluslinkImages = {
  hero: 'https://aluslink.com/wp-content/uploads/2025/08/aluminum-extrusions-inside-plant.jpg',
  heroAlt: 'https://aluslink.com/wp-content/uploads/2026/04/2024010857569425.jpg',
  productLine: 'https://aluslink.com/wp-content/uploads/2025/08/Aluminium-Home6--400x300.webp',
  category: 'https://aluslink.com/wp-content/uploads/2024/09/400x400.png',
  product: 'https://aluslink.com/wp-content/uploads/2024/09/4040-1-Aluminium-Extrusion-Profiel.png',
  factory: [
    'https://aluslink.com/wp-content/uploads/2024/11/DJI_0074-scaled.jpg',
    'https://aluslink.com/wp-content/uploads/2024/11/71877.jpg',
    'https://aluslink.com/wp-content/uploads/2025/08/aluminum-extrusions-inside-plant.jpg',
  ],
};

const heroSlideContent = [
  {
    title: 'Precision Aluminum Extrusion Solutions',
    description: 'High-quality aluminum profiles for industrial, architectural, and custom applications',
  },
  {
    title: 'Custom Profiles, Reliable Manufacture',
    description:
      'From design to production, we deliver tailored aluminum extrusion solutions with consistent quality',
  },
  {
    title: 'Your Trusted Aluminum Extrusion Partner',
    description:
      'Serving customers worldwide with durable products, competitive pricing, and on-time delivery',
  },
];

const cleanEnglishCopy = (value?: string) =>
  (value || '')
    .replace(/\bProfle\b/g, 'Profile')
    .replace(/\bIndustry Profile\b/g, 'Industrial Profile')
    .trim();

const cleanMediaUrl = (value?: string) => {
  const resolved = resolveMediaUrl(value);
  if (!resolved) return '';
  if (/^https?:\/\/(www\.)?(lingyealu\.cn|lingyealuminum\.com)/i.test(resolved)) {
    const path = new URL(resolved).pathname;
    return typeof window !== 'undefined' ? `${window.location.origin}${path}` : path;
  }
  return resolved;
};

const categoryCardImages: Record<string, string> = {
  '5': '/media/products/t-slot_aluminium_profile.jpg',
  '6': '/media/products/chile_1.jpg',
  '7': '/media/products/aluminium_square_tube.webp',
};

const getCategoryCardImage = (category: CategoryItem) =>
  categoryCardImages[String(category.id)] || category.image || temporaryAluslinkImages.category;

const Home: React.FC = () => {
  const { currentLanguage } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [factoryImages, setFactoryImages] = useState<FactoryImage[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  usePageTitle('home');
  useSeoMeta({
    title: 'China Aluminum Profile Manufacturer | LingYe Aluminum',
    description:
      'LingYe Aluminum supplies architectural and industrial aluminum profiles, custom extrusion, surface finishing, OEM drawing support, and export packaging for global B2B buyers.',
    canonicalPath: `/${currentLanguage}`,
    ogTitle: 'LingYe Aluminum | China Aluminum Profile Manufacturer',
    ogDescription: 'Factory-direct aluminum extrusion, finishing, and export RFQ support for global buyers.',
    ogImage: temporaryAluslinkImages.hero,
    language: currentLanguage,
  });

  const stats = useMemo(
    () => [
      { value: 10, suffix: '+', label: 'Years manufacturing' },
      { value: 40, suffix: '+', label: 'Global Markets' },
      { value: 20000, suffix: '', label: 'Annual Output(tons)' },
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
              name: cleanEnglishCopy(product.translated_name || product.name),
              description: cleanEnglishCopy(product.translated_description || product.description),
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
          setCategories(
            categoryList.slice(0, 4).map((category) => ({
              ...category,
              name: cleanEnglishCopy((category as any).translated_name || category.name),
              description: cleanEnglishCopy((category as any).translated_description || category.description),
            }))
          );
        }
      } catch (error) {
        console.error('Failed to fetch homepage data:', error);
      }
    };

    fetchHomepageData();
  }, [currentLanguage]);

  const heroImage = useMemo(() => {
    const preferredFactoryImage = factoryImages.find((item) => (item.title || '').includes('首页图片1'));
    return cleanMediaUrl(preferredFactoryImage?.image) || temporaryAluslinkImages.hero;
  }, [factoryImages]);

  const slideImages = useMemo(() => {
    const dynamicImages = factoryImages
      .map((item) => cleanMediaUrl(item.image))
      .filter(Boolean) as string[];

    const fallbackImages = [
      heroImage,
      temporaryAluslinkImages.heroAlt,
      temporaryAluslinkImages.productLine,
    ];

    return [...dynamicImages, ...fallbackImages].slice(0, 3);
  }, [factoryImages, heroImage]);

  const galleryImages = useMemo(
    () =>
      factoryImages
        .map((item) => ({
          title: item.title || 'Factory image',
          image: cleanMediaUrl(item.image),
        }))
        .filter((item) => item.image)
        .slice(0, 3),
    [factoryImages]
  );

  const primaryProduct = featuredProducts[0];
  const secondaryProducts = featuredProducts.slice(1, 4);
  const currentHeroContent = heroSlideContent[currentSlide] || heroSlideContent[0];

  useEffect(() => {
    if (slideImages.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideImages.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [slideImages]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50">
      <section className="relative min-h-[480px] overflow-hidden bg-slate-950 text-white sm:min-h-[560px] lg:min-h-[640px]">
        <div className="absolute inset-0">
          {slideImages.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className={`absolute inset-0 bg-cover bg-center brightness-[0.72] contrast-[1.08] saturate-[1.02] transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url(${image})` }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.9)_0%,rgba(15,23,42,0.64)_40%,rgba(15,23,42,0.18)_100%)]" />
        <div className="relative mx-auto max-w-7xl min-w-0 px-4 pb-10 pt-10 sm:px-6 lg:px-8 lg:pb-12 lg:pt-16">
          <div className="w-full max-w-[20rem] min-w-0 sm:max-w-2xl lg:max-w-3xl">
            <div className="min-w-0">
              <h1 className="max-w-full break-words text-4xl font-semibold leading-tight text-white drop-shadow-[0_8px_32px_rgba(15,23,42,0.75)] sm:text-5xl md:text-6xl">
                {currentHeroContent.title}
              </h1>
              <p className="mt-4 max-w-[20rem] break-words text-base leading-7 text-sky-50/95 sm:max-w-xl md:text-lg">
                {currentHeroContent.description}
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-3">
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

      <section className="border-b border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div data-testid="home-stats-grid" className="grid w-full max-w-[22rem] grid-cols-1 gap-3 sm:mx-auto sm:max-w-7xl sm:grid-cols-3 sm:gap-4">
          {stats.map((item) => (
            <div key={item.label} data-testid="home-stat-card" className="rounded-lg border border-slate-200 bg-slate-50 p-5 text-center shadow-sm">
              <div className="text-3xl font-semibold text-sky-700 md:text-4xl">
                <span>{item.value}</span>
                <span>{item.suffix}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">Explore Core Product Categories</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Make category decisions easy for visitors who arrive from search results and need to confirm quickly whether you handle their application.
              </p>
            </div>
            <Link
              to={`/${currentLanguage}/products`}
              className="inline-flex min-h-[48px] items-center justify-center rounded-md border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              Browse all product categories
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/${currentLanguage}/products?category=${category.id}`}
                className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                <div className="flex h-64 items-center justify-center bg-white p-4">
                  <img
                    src={cleanMediaUrl(getCategoryCardImage(category))}
                    alt={category.name}
                    className="h-full w-full object-contain object-center transition duration-300 group-hover:scale-[1.03]"
                    loading="eager"
                    decoding="async"
                  />
                </div>
                <div className="border-t border-slate-100 p-5">
                  <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-300">Featured supply</p>
              <h2 className="mt-4 text-3xl font-semibold md:text-4xl">Recommended Profiles for High-Intent Buyers</h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                Highlighting a few strong products keeps the homepage commercially useful without turning it into an endless catalog.
              </p>

              {primaryProduct ? (
                <Link
                  to={`/${currentLanguage}/products/${primaryProduct.id}`}
                  className="mt-8 block overflow-hidden rounded-lg border border-white/12 bg-white/8 shadow-[0_28px_80px_rgba(15,23,42,0.30)] backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.10]"
                >
                  <div className="grid md:grid-cols-[0.95fr_1.05fr]">
                    <div className="h-72 overflow-hidden">
                      <img
                        src={cleanMediaUrl(primaryProduct.product_image) || temporaryAluslinkImages.product}
                        alt={primaryProduct.name}
                        className="h-full w-full object-cover"
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                    <div className="p-7">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">Featured Product</p>
                      <h3 className="mt-3 text-2xl font-semibold">{primaryProduct.name}</h3>
                      <p className="mt-4 text-base leading-7 text-slate-300 line-clamp-3">
                        {primaryProduct.description || 'Explore a profile page built for procurement review, specification checks, and quotation requests.'}
                      </p>
                      <span className="mt-6 inline-flex items-center text-sm font-semibold text-white">
                        View product details
                      </span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="mt-8 rounded-lg border border-dashed border-white/20 p-8 text-slate-300">
                  Add featured products in the backend to make the homepage stronger for product discovery and quotation flow.
                </div>
              )}
            </div>

            <div className="space-y-6">
              {secondaryProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/${currentLanguage}/products/${product.id}`}
                  className="grid min-h-[180px] gap-5 overflow-hidden rounded-lg border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:bg-white/[0.08] md:grid-cols-[160px_1fr]"
                >
                  <img
                    src={cleanMediaUrl(product.product_image) || temporaryAluslinkImages.product}
                    alt={product.name}
                    className="h-40 w-full rounded-md object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div>
                    <h3 className="text-xl font-semibold text-white">{product.name}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300 line-clamp-3">
                      {product.description || 'Built for aluminum buyers who need a clear product page, not just a name and one image.'}
                    </p>
                  </div>
                </Link>
              ))}

            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Factory and fulfillment</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">Manufacturing Capabilities Buyers Check First</h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Show the production, finishing, packaging, and export readiness that serious B2B buyers need before they send drawings or project quantities.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {galleryImages.length > 0 ? (
                galleryImages.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="overflow-hidden rounded-lg bg-slate-100 shadow-[0_20px_55px_rgba(15,23,42,0.12)]">
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
                    ...temporaryAluslinkImages.factory,
                  ].map((image, index) => (
                    <div key={index} className="overflow-hidden rounded-lg bg-slate-100 shadow-[0_20px_55px_rgba(15,23,42,0.12)]">
                      <img src={image} alt="Factory and production" className="h-64 w-full object-cover" loading="lazy" decoding="async" />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">FAQ</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">Common Questions from Aluminum Buyers</h2>
          </div>
          <div className="mt-10 space-y-4">
            {faqItems.map((item) => (
              <details key={item.question} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm open:shadow-md">
                <summary className="cursor-pointer list-none text-lg font-semibold text-slate-900">{item.question}</summary>
                <p className="mt-4 text-base leading-7 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="home-inquiry-form" className="bg-white py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">Inquiry</p>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900 md:text-4xl">Start Your Quote With the Right Details</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              Share drawings, finish, quantity, destination port, and packaging needs. The form keeps the RFQ path visible for export buyers who are ready to compare suppliers.
            </p>
            <div className="mt-8 space-y-5 rounded-lg bg-slate-950 p-6 text-slate-100 shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
              <div>
                <h3 className="text-lg font-semibold text-white">Send these details for a faster reply</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                  <li>Profile drawing or reference photo</li>
                  <li>Alloy, temper, and finish requirement</li>
                  <li>Estimated quantity and destination port</li>
                  <li>Packaging or machining expectations</li>
                </ul>
              </div>
              <div className="rounded-md border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-300">
                Email, WhatsApp, and product links can work together, but the form should remain the clearest conversion path on the page.
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white shadow-[0_28px_75px_rgba(15,23,42,0.14)] ring-1 ring-slate-200">
            <InquiryForm />
          </div>
        </div>
      </section>

      <FloatingContactButtons />
    </div>
  );
};

export default Home;
