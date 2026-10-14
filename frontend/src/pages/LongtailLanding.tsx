import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { useSeoMeta } from '../hooks/useSeoMeta';
import { SITE_ORIGIN } from '../config/site';
import { useStructuredData } from '../hooks/useStructuredData';
import { useTranslation } from '../contexts/TranslationContext';
import { resolveMediaUrl } from '../utils/url';
import NotFound from './NotFound';

interface LandingProduct {
  id: number;
  slug: string;
  name?: string;
  translated_name?: string;
  description?: string;
  translated_description?: string;
  images?: Array<{
    image: string;
    is_primary?: boolean;
  }>;
}

const WHATSAPP_URL = 'https://wa.me/8618326081058?text=Hello! I am interested in your aluminum products.';
const EMAIL_URL = 'mailto:iris@lingyealu.com?subject=Aluminum Products Inquiry&body=Hello! I am interested in your aluminum products. Please provide more information.';

interface FaqItem {
  question: string;
  answer: string;
}

interface TrustPoint {
  icon: string;
  text: string;
}

interface ProcessStep {
  step: string;
  title: string;
  description: string;
}

interface LandingPageData {
  slug: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
  bullets: string[];
  trustPoints: TrustPoint[];
  processSteps: ProcessStep[];
  productSlugs: string[];
  relatedLinks: Array<{ label: string; to: string }>;
  faqs: FaqItem[];
}

const landingPages: Record<string, LandingPageData> = {
  'aluminum-profile-supplier-for-construction-projects': {
    slug: 'aluminum-profile-supplier-for-construction-projects',
    title: 'Construction Aluminum Profiles | LingYe',
    h1: 'Aluminum Profile Supplier for Construction Projects',
    description:
      'Aluminum profile references for construction projects. Share drawings, finish requirements, quantity, and destination to discuss a project-specific quotation.',
    intro:
      'LingYe helps buyers discuss aluminum profile requirements for residential and commercial construction applications, coordinate manufacturing resources, and clarify export order details.',
    bullets: [
      'Architectural sections for windows, doors, facades, and partition systems',
      'Multiple alloys and surface finishes for indoor and outdoor applications',
      'Order and packaging requirements discussed for each project',
      'Drawing and shipment requirements coordinated during quotation',
    ],
    trustPoints: [
      { icon: 'Application', text: 'Profile options for construction applications' },
      { icon: 'Drawing', text: 'Requirements reviewed against project drawings' },
      { icon: 'Finish', text: 'Finish options confirmed for each order' },
      { icon: 'Export', text: 'Export order details coordinated by project' },
    ],
    processSteps: [
      { step: '01', title: 'Submit requirements', description: 'Share drawings, alloy, finish, quantity, and destination port.' },
      { step: '02', title: 'Project review', description: 'Discuss profile geometry, material, finish, and open questions.' },
      { step: '03', title: 'Options confirmation', description: 'Confirm available tooling, sample, and processing options during quotation.' },
      { step: '04', title: 'Order coordination', description: 'Agree on order details, packaging, and export documentation requirements.' },
    ],
    productSlugs: ['wholesale-aluminium-tile-trim-l-shape-tile-trim', 'aluminium-skirting-boards', 'industrial-profile-extrude-aluminium-framing-40x40'],
    relatedLinks: [
      { label: 'Browse all aluminum products', to: '/en/products' },
      { label: 'Door and window profile showcase', to: '/en/products/windows-doors/showcase' },
      { label: 'Read aluminum industry news', to: '/en/news' },
    ],
    faqs: [
      {
        question: 'Which construction applications can I discuss?',
        answer:
          'Common applications include windows, doors, facades, partitions, and interior systems. Share project drawings to review profile requirements.',
      },
      {
        question: 'Can you customize profile dimensions and wall thickness?',
        answer:
          'Share the drawing and intended application so dimensions, wall thickness, and other requirements can be reviewed for the project.',
      },
      {
        question: 'Do you provide surface treatment options for outdoor use?',
        answer:
          'Discuss the intended environment, appearance, and finish requirements. Available options should be confirmed for the specific profile and order.',
      },
      {
        question: 'What is the typical MOQ for construction profiles?',
        answer:
          'Minimum order quantities depend on the profile and project details. Share the expected quantity to confirm what is available.',
      },
      {
        question: 'What information is needed for a quick quote?',
        answer:
          'Please share drawings, alloy/temper, finish requirement, quantity, and destination port for accurate pricing.',
      },
    ],
  },
  'industrial-aluminum-extrusion-manufacturer-in-china': {
    slug: 'industrial-aluminum-extrusion-manufacturer-in-china',
    title: 'Industrial Aluminum Profiles for Automation | LingYe',
    h1: 'Industrial Aluminum Profiles for Equipment and Automation',
    description:
      'Explore industrial aluminum profile references for equipment frames, automation, transport, and mechanical projects. Share drawings to discuss project requirements.',
    intro:
      'LingYe helps buyers discuss industrial profile geometry and coordinate manufacturing resources for equipment frames, automation lines, transport components, and custom mechanical applications.',
    bullets: [
      'Drawing-based profile and tooling requirements',
      'Processing options discussed against the drawing',
      'Surface finish selected for the intended application',
      'Dimensions and material confirmed by project specification',
    ],
    trustPoints: [
      { icon: 'OEM', text: 'OEM project requirements reviewed' },
      { icon: 'Processing', text: 'Processing options confirmed by drawing' },
      { icon: 'Specification', text: 'Dimensions confirmed for each project' },
      { icon: 'Export', text: 'Export order details coordinated' },
    ],
    processSteps: [
      { step: '01', title: 'Share drawings', description: 'Provide profile geometry, material, finish, and application details.' },
      { step: '02', title: 'Review requirements', description: 'Discuss profile, tooling, and processing needs against the project.' },
      { step: '03', title: 'Confirm options', description: 'Review available samples, finish choices, and order specifications.' },
      { step: '04', title: 'Coordinate order', description: 'Confirm quantity, packaging, destination, and export documentation.' },
    ],
    productSlugs: ['2020-3030-4040-t-slot-aluminium-profiles', '2020-t-slot-aluminium-extrusion-profile-industrial', 'industrial-profile-extrude-aluminium-framing-40x40'],
    relatedLinks: [
      { label: 'Explore industrial-ready products', to: '/en/products' },
      { label: 'T-slot aluminum extrusion profiles', to: '/en/products/category/t-slot-profiles' },
      { label: 'Check latest company updates', to: '/en/news' },
    ],
    faqs: [
      {
        question: 'Do you support OEM industrial extrusion projects?',
        answer:
          'Share the drawing, material, finish, and application. Tooling, processing, and order options can then be discussed for the project.',
      },
      {
        question: 'What alloys and tempers are commonly available?',
        answer:
          'Alloy and temper depend on the profile and application. Share the required specification so availability can be confirmed.',
      },
      {
        question: 'Can you provide machining after extrusion?',
        answer:
          'Share the drawing and processing details to confirm which secondary operations can be coordinated for the order.',
      },
      {
        question: 'How do you control quality consistency?',
        answer:
          'Inspection documents and acceptance criteria should be agreed for each project. Include any required standards with the inquiry.',
      },
      {
        question: 'What is your typical lead time for industrial profiles?',
        answer:
          'Timing depends on profile, quantity, tooling, and finish requirements. A project-specific schedule should be confirmed during quotation.',
      },
    ],
  },
  'custom-aluminum-profile-factory-for-oem-orders': {
    slug: 'custom-aluminum-profile-factory-for-oem-orders',
    title: 'Custom Aluminum Profiles for OEM Projects | LingYe',
    h1: 'Custom Aluminum Profiles for OEM Projects',
    description:
      'Discuss custom aluminum profile requirements for OEM projects. Share drawings and confirm tooling, finish, order, and delivery options for your project.',
    intro:
      'LingYe helps OEM buyers communicate profile requirements, coordinate manufacturing resources, and clarify order details against project drawings.',
    bullets: [
      'Drawing-based review of profile requirements',
      'Order quantity and tooling options confirmed by project',
      'Material, temper, and finish discussed for the application',
      'Project communication for procurement and engineering teams',
    ],
    trustPoints: [
      { icon: 'Drawing', text: 'Profile requirements reviewed against drawings' },
      { icon: 'Tooling', text: 'Tooling and sample options confirmed by project' },
      { icon: 'Quantity', text: 'Order quantity discussed during quotation' },
      { icon: 'Export', text: 'Delivery and export details confirmed by order' },
    ],
    processSteps: [
      { step: '01', title: 'Share the drawing', description: 'Include alloy, temper, finish, application, and estimated quantity if known.' },
      { step: '02', title: 'Review the requirements', description: 'Discuss profile geometry, tooling, processing, and open specification questions.' },
      { step: '03', title: 'Confirm project options', description: 'Review quotation details, sample options, and the expected order plan.' },
      { step: '04', title: 'Coordinate delivery', description: 'Confirm packaging, destination, and export document requirements.' },
    ],
    productSlugs: ['aluminium-heat-sink-custom-extruded-aluminum-heats', 'h-shaped-aluminum-extrusionaluminum-h-structural-p', 'square-aluminium-tube-profiles-china-aluminium-ext'],
    relatedLinks: [
      { label: 'Submit inquiry from product detail pages', to: '/en/products' },
      { label: 'View windows and doors profile showcase', to: '/en/products/windows-doors/showcase' },
      { label: 'Read technical and market insights', to: '/en/news' },
    ],
    faqs: [
      {
        question: 'Can profile requirements be based on our drawings?',
        answer:
          'Yes. Share the drawing and applicable standards so profile, tooling, and manufacturing options can be reviewed for the project.',
      },
      {
        question: 'Do you support low-volume trial production?',
        answer:
          'Minimum quantities depend on the profile and project. Include your expected quantity so options can be confirmed.',
      },
      {
        question: 'What lead time should we expect for OEM orders?',
        answer:
          'Timing depends on tooling, quantity, and finish requirements. Confirm the expected schedule during project quotation.',
      },
      {
        question: 'How is packaging handled for export shipments?',
        answer:
          'Share packaging and destination requirements so the suitable order and export arrangements can be discussed.',
      },
      {
        question: 'What file formats do you accept for drawings?',
        answer:
          'Include a drawing or reference file with the inquiry. Confirm accepted formats and review requirements with the project contact.',
      },
    ],
  },
};

const LongtailLanding: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const page = slug ? landingPages[slug] : undefined;
  const { t, currentLanguage } = useTranslation();
  const [relatedProducts, setRelatedProducts] = useState<LandingProduct[]>([]);

  useSeoMeta({
    title: page?.title,
    description: page?.description,
    canonicalPath: page ? `/en/${page.slug}` : undefined,
    ogImage: `${SITE_ORIGIN}/logo.jpg?v=3`,
    ogTitle: page?.title,
    ogDescription: page?.description,
    language: 'en',
  });

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!page) return;
      try {
        const response = await fetch(`${API_ENDPOINTS.PRODUCTS}?lang=${currentLanguage}&limit=20`);
        if (!response.ok) return;
        const data = await response.json();
        const allProducts = (data.results || data || []) as LandingProduct[];
        const slugs = page.productSlugs;
        const matched = allProducts.filter(p => slugs.includes(p.slug));
        const remaining = allProducts.filter(p => !slugs.includes(p.slug));
        setRelatedProducts([...matched, ...remaining].slice(0, 3));
      } catch (error) {
        console.error('Failed to load related products:', error);
      }
    };

    fetchRelatedProducts();
  }, [page, currentLanguage]);

  const structuredData = React.useMemo(() => {
    if (!page) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.h1,
      description: page.description,
      publisher: { '@type': 'Organization', name: 'LingYe Aluminum', url: SITE_ORIGIN },
      url: typeof window !== 'undefined' ? window.location.href : `${SITE_ORIGIN}/en/${page.slug}`,
    };
  }, [page]);

  const breadcrumbData = React.useMemo(() => {
    if (!page) return null;
    const base = typeof window !== 'undefined' ? window.location.origin : SITE_ORIGIN;
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/en` },
        { '@type': 'ListItem', position: 2, name: 'Products', item: `${base}/en/products` },
        { '@type': 'ListItem', position: 3, name: page.h1, item: `${base}/en/${page.slug}` },
      ],
    };
  }, [page]);

  const faqData = React.useMemo(() => {
    if (!page) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: page.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };
  }, [page]);

  useStructuredData(`landing-${slug || 'unknown'}`, structuredData);
  useStructuredData(`landing-breadcrumb-${slug || 'unknown'}`, breadcrumbData);
  useStructuredData(`landing-faq-${slug || 'unknown'}`, faqData);

  if (!page) {
    return <NotFound />;
  }

  return (
    <div>
      <section className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4">{page.h1}</h1>
          <p className="text-lg opacity-95 max-w-4xl">{page.description}</p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 py-12">
        <p className="text-gray-700 text-lg leading-relaxed mb-6">{page.intro}</p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('landing_why_choose', 'Why buyers choose LingYe Aluminum')}</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-8">
          {page.bullets.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {page.trustPoints.map((tp, idx) => (
            <div key={idx} className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">{tp.icon}</div>
              <p className="text-sm text-gray-700 font-medium">{tp.text}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('landing_request_quote', 'Request a quotation')}</h3>
          <p className="text-gray-700 mb-4">
            Share your drawing, alloy, finish, quantity, and destination port so the project requirements can be reviewed.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/en/products"
              className="inline-flex items-center px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse products
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-3 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors"
            >
              Chat on WhatsApp
            </a>
            <a
              href={EMAIL_URL}
              className="inline-flex items-center px-5 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
            >
              Send email
            </a>
          </div>
        </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('landing_how_it_works', 'How it works')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {page.processSteps.map((ps, idx) => (
            <div key={idx} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm font-bold text-blue-600 mb-1">{ps.step}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{ps.title}</h3>
              <p className="text-sm text-gray-600">{ps.description}</p>
            </div>
          ))}
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('landing_recommended_products', 'Recommended products')}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {relatedProducts.map((product) => {
                const title = product.translated_name || product.name || 'Aluminum Product';
                const description = product.translated_description || product.description || 'Explore this aluminum profile product.';
                const image = product.images?.find((img) => img.is_primary)?.image || product.images?.[0]?.image;
                return (
                  <Link
                    key={product.id}
                    to={`/en/products/${product.slug}`}
                    className="rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="h-40 bg-gray-100 overflow-hidden">
                      {image ? (
                        <img
                          src={resolveMediaUrl(image)}
                          alt={title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">{t('product_detail_no_image', 'No image')}</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 line-clamp-2 mb-2">{title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('landing_related_resources', 'Related resources')}</h3>
          <ul className="space-y-2">
            {page.relatedLinks.map((link) => (
              <li key={link.to + link.label}>
                <Link to={link.to} className="text-blue-700 hover:text-blue-900 underline underline-offset-4">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">FAQ</h3>
          <div className="space-y-3">
            {page.faqs.map((faq, idx) => (
              <details key={idx} className="group rounded-lg border border-gray-200 p-4 bg-gray-50/70 open:bg-white">
                <summary className="cursor-pointer list-none font-semibold text-gray-900 flex items-center justify-between">
                  <span>{faq.question}</span>
                  <span className="text-blue-600 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-gray-600 leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LongtailLanding;
