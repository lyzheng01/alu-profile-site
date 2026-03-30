import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSeoMeta } from '../hooks/useSeoMeta';
import { useStructuredData } from '../hooks/useStructuredData';
import NotFound from './NotFound';

interface LandingPageData {
  slug: string;
  title: string;
  h1: string;
  description: string;
  intro: string;
  bullets: string[];
  relatedLinks: Array<{ label: string; to: string }>;
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
  },
};

const LongtailLanding: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const page = slug ? landingPages[slug] : undefined;

  useSeoMeta({
    title: page?.title,
    description: page?.description,
    canonicalPath: page ? `/en/${page.slug}` : undefined,
  });

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

  useStructuredData(`landing-${slug || 'unknown'}`, structuredData);
  useStructuredData(`landing-breadcrumb-${slug || 'unknown'}`, breadcrumbData);

  if (!page) {
    return <NotFound />;
  }

  return (
    <div className="pt-20">
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
      </section>
    </div>
  );
};

export default LongtailLanding;
