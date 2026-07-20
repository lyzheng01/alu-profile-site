import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { useSeoMeta } from '../hooks/useSeoMeta';
import { useStructuredData } from '../hooks/useStructuredData';
import { resolveMediaUrl } from '../utils/url';
import NotFound from './NotFound';

interface FaqItem {
  question: string;
  answer: string;
}

interface LandingPageData {
  slug: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
  bullets: string[];
  relatedLinks: Array<{ label: string; to: string }>;
  faqs: FaqItem[];
}

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

const landingPages: Record<string, LandingPageData> = {
  'aluminum-profile-supplier-for-construction-projects': {
    slug: 'aluminum-profile-supplier-for-construction-projects',
    title: 'Aluminum Profile Supplier for Construction Projects | LingYe Aluminum',
    h1: 'Aluminum Profile Supplier for Construction Projects',
    description:
      'Reliable aluminum profile supplier for construction projects. Custom extrusion, stable quality, and global B2B delivery from LingYe Aluminum.',
    intro:
      'LingYe Aluminum supports developers, contractors, and distributors with scalable aluminum profile supply for residential and commercial construction projects.',
    bullets: [
      'Architectural sections for windows, doors, facades, and partition systems',
      'Multiple alloys and surface finishes for indoor and outdoor applications',
      'Stable production scheduling and export-ready packaging',
      'Technical support from drawing review to shipment planning',
    ],
    relatedLinks: [
      { label: 'Browse all aluminum products', to: '/en/products' },
      { label: 'Door and window profile showcase', to: '/en/products/windows-doors/showcase' },
      { label: 'Read aluminum industry news', to: '/en/news' },
    ],
    faqs: [
      {
        question: 'Which construction projects are suitable for your aluminum profiles?',
        answer:
          'Our profiles are used in residential towers, commercial buildings, facade systems, and interior partition projects.',
      },
      {
        question: 'Can you customize profile dimensions and wall thickness?',
        answer:
          'Yes, we support customized dimensions, wall thickness, and structural requirements based on project drawings.',
      },
      {
        question: 'Do you provide surface treatment options for outdoor use?',
        answer:
          'Yes. We provide anodizing, powder coating, and other treatments designed for durability in outdoor environments.',
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
    title: 'Industrial Aluminum Extrusion Manufacturer in China | LingYe Aluminum',
    h1: 'Industrial Aluminum Extrusion Manufacturer in China',
    description:
      'China-based industrial aluminum extrusion manufacturer with OEM support, precision processing, and export-ready production.',
    intro:
      'We provide industrial aluminum extrusion solutions for equipment frames, automation lines, transport components, and custom mechanical applications.',
    bullets: [
      'Custom extrusion tooling and profile development for OEM projects',
      'Secondary processing including cutting, drilling, and CNC options',
      'Anodizing and powder coating for corrosion resistance and appearance',
      'Quality checks for dimensional consistency and surface finish',
    ],
    relatedLinks: [
      { label: 'Explore industrial-ready products', to: '/en/products' },
      { label: 'See profile categories and specs', to: '/en/products' },
      { label: 'Check latest company updates', to: '/en/news' },
    ],
    faqs: [
      {
        question: 'Do you support OEM industrial extrusion projects?',
        answer:
          'Yes, we support OEM projects from profile design and tooling development to mass production and export shipment.',
      },
      {
        question: 'What alloys and tempers are commonly available?',
        answer:
          'Common options include 6061 and 6063 series with tempers such as T5 and T6, depending on application needs.',
      },
      {
        question: 'Can you provide machining after extrusion?',
        answer:
          'Yes, we provide secondary processing such as cutting, drilling, punching, and CNC machining based on drawings.',
      },
      {
        question: 'How do you control quality consistency?',
        answer:
          'We apply incoming material checks, process controls, and final inspections for dimensions, surface quality, and packaging.',
      },
    ],
  },
  'custom-aluminum-profile-factory-for-oem-orders': {
    slug: 'custom-aluminum-profile-factory-for-oem-orders',
    title: 'Custom Aluminum Profile Factory for OEM Orders | LingYe Aluminum',
    h1: 'Custom Aluminum Profile Factory for OEM Orders',
    description:
      'Custom aluminum profile factory for OEM/ODM projects. Send drawings and get fast feedback on tooling, finish, and lead time.',
    intro:
      'From sample development to mass production, LingYe Aluminum helps OEM buyers launch custom aluminum profile products with predictable quality and lead time.',
    bullets: [
      'Fast quotation workflow based on 2D/3D drawings and specifications',
      'Flexible MOQ strategy for pilot and scale-up orders',
      'Material, temper, and finish selection based on target market needs',
      'Responsive communication for procurement and engineering teams',
    ],
    relatedLinks: [
      { label: 'Submit inquiry from product detail pages', to: '/en/products' },
      { label: 'View windows and doors profile showcase', to: '/en/products/windows-doors/showcase' },
      { label: 'Read technical and market insights', to: '/en/news' },
    ],
    faqs: [
      {
        question: 'Can you produce profiles strictly based on our drawings?',
        answer:
          'Yes, we can produce according to your 2D/3D drawings and technical standards with engineering review before tooling.',
      },
      {
        question: 'Do you support low-volume trial production?',
        answer:
          'Yes, we support pilot runs and trial orders before scaling up to regular mass production.',
      },
      {
        question: 'What lead time should we expect for OEM orders?',
        answer:
          'Lead time depends on tooling complexity, quantity, and finish process, and we provide a clear timeline during quotation.',
      },
      {
        question: 'How is packaging handled for export shipments?',
        answer:
          'We provide export-oriented packaging solutions to reduce damage risk and support efficient container loading.',
      },
    ],
  },
};

const LongtailLanding: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const page = slug ? landingPages[slug] : undefined;
  const [relatedProducts, setRelatedProducts] = useState<LandingProduct[]>([]);

  useSeoMeta({
    title: page?.title,
    description: page?.description,
    canonicalPath: page ? `/en/${page.slug}` : undefined,
  });

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!page) return;
      try {
        const response = await fetch(`${API_ENDPOINTS.PRODUCTS}?lang=en&limit=6`);
        if (!response.ok) return;
        const data = await response.json();
        const products = (data.results || data || []) as LandingProduct[];
        setRelatedProducts(products.slice(0, 3));
      } catch (error) {
        console.error('Failed to load related products:', error);
      }
    };

    fetchRelatedProducts();
  }, [page]);

  const structuredData = React.useMemo(() => {
    if (!page) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: page.h1,
      description: page.description,
      brand: { '@type': 'Brand', name: 'LingYe Aluminum' },
      manufacturer: { '@type': 'Organization', name: 'LingYe Aluminum' },
      url: typeof window !== 'undefined' ? window.location.href : `https://lingyealu.cn/en/${page.slug}`,
    };
  }, [page]);

  const breadcrumbData = React.useMemo(() => {
    if (!page) return null;
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://lingyealu.cn';
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

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why buyers choose LingYe Aluminum</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-8">
          {page.bullets.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Request a quotation</h3>
          <p className="text-gray-700 mb-4">
            Share your drawing, alloy, finish, quantity, and destination port. Our team will provide a practical quote quickly.
          </p>
          <Link
            to="/en/products"
            className="inline-flex items-center px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse products
          </Link>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recommended products</h3>
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
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
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
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Related resources</h3>
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
