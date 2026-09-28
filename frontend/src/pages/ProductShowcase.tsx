import React from 'react';
import FloatingContactButtons from '../components/FloatingContactButtons';
import InquiryForm from '../components/InquiryForm';
import FactoryShowcase from '../components/FactoryShowcase';
import { useTranslation } from '../contexts/TranslationContext';
import { useSeoMeta } from '../hooks/useSeoMeta';
import { useStructuredData } from '../hooks/useStructuredData';

const heroImages = [
  'https://images.unsplash.com/photo-1505692794400-25d77c2d0f66?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80',
];

const productImages = [
  'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1505692794400-25d77c2d0f66?auto=format&fit=crop&w=1600&q=80',
];

const factoryImages = [
  { src: '/images/quality-control-process-clean.webp', alt: 'Aluminum profile quality control process', fit: 'contain' },
];

const finishes = [
  { title: 'Anodized', desc: 'Confirm color and coating requirements against the project specification', tone: 'Project-confirmed' },
  { title: 'Powder Coated', desc: 'Discuss target color and surface requirements for the intended application', tone: 'Project-confirmed' },
  { title: 'PVDF Painting', desc: 'Confirm coating system and performance requirements for the project', tone: 'Project-confirmed' },
  { title: 'Wood Grain Transfer', desc: 'Check available decorative finish references for the order', tone: 'Project-confirmed' },
];

const qaChecklist = [
  'Share the profile drawing or section dimensions',
  'Confirm alloy and temper for the intended application',
  'Specify surface finish, color, and appearance requirements',
  'Note estimated quantity, packaging, and destination',
];

const applicationScenarios = [
  { title: 'Sliding doors', detail: 'Discuss opening size, panel configuration, and finish requirements.', icon: '🚪' },
  { title: 'Windows', detail: 'Confirm glazing, thermal-break, and hardware compatibility by system.', icon: '🏠' },
  { title: 'Curtain walls', detail: 'Share elevations and project specifications for profile review.', icon: '🏢' },
  { title: 'Folding doors', detail: 'Confirm panel arrangement, hardware, and intended loading.', icon: '🌳' },
];

const projectSteps = [
  { step: '01', title: 'Share requirements', desc: 'Provide drawings, dimensions, application, and estimated quantity.' },
  { step: '02', title: 'Review profile needs', desc: 'Discuss section geometry, system compatibility, alloy, and temper.' },
  { step: '03', title: 'Confirm finish options', desc: 'Align color, surface appearance, and processing details to the project.' },
  { step: '04', title: 'Review quotation', desc: 'Confirm specification, quantity, packaging, and destination details.' },
  { step: '05', title: 'Coordinate the order', desc: 'Agree on the order plan and export documentation requirements.' },
];

const ProductShowcase: React.FC = () => {
  const { currentLanguage } = useTranslation();

  useSeoMeta({
    title: 'Aluminium Windows & Doors System | LingYe Aluminum',
    description: 'Aluminum window and door profile references for sliding doors, windows, curtain walls, and folding door projects. Confirm dimensions and system compatibility against project drawings.',
    canonicalPath: `/${currentLanguage}/products/windows-doors/showcase`,
    ogImage: 'https://lingyealuminum.com/logo.jpg?v=3',
    language: currentLanguage,
  });

  const productStructuredData = React.useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Aluminium Windows & Doors System',
    description: 'Custom-engineered thermal break aluminum profiles for windows, doors, curtain walls and villa folding doors.',
    brand: { '@type': 'Brand', name: 'LingYe Aluminum' },
    category: 'Aluminum Profiles for Windows and Doors',
    image: ['https://lingyealuminum.com/logo.jpg?v=3'],
  }), []);

  useStructuredData('showcase-product', productStructuredData);

  const breadcrumbStructuredData = React.useMemo(() => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://lingyealuminum.com';
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${base}/${currentLanguage}` },
        { '@type': 'ListItem', position: 2, name: 'Products', item: `${base}/${currentLanguage}/products` },
        { '@type': 'ListItem', position: 3, name: 'Windows & Doors System', item: `${base}/${currentLanguage}/products/windows-doors/showcase` },
      ],
    };
  }, [currentLanguage]);

  useStructuredData('showcase-breadcrumb', breadcrumbStructuredData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="relative overflow-hidden py-16 lg:py-20">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.25),_transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.4em] text-blue-500 font-semibold">Signature Series</p>
              <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
                Aluminium Extrusion System for Windows & Doors
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Custom-engineered thermal break profiles optimized for contemporary façades, villas and commercial towers.
                Share a drawing or project schedule to discuss profile configuration, finish options, and order requirements.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="px-5 py-3 bg-white border border-blue-100 rounded-2xl shadow-sm">
                  <p className="text-3xl font-bold text-blue-600">2.6 W/m²·K</p>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Thermal Transmittance</p>
                </div>
                <div className="px-5 py-3 bg-white border border-blue-100 rounded-2xl shadow-sm">
                  <p className="text-3xl font-bold text-blue-600">120 kg</p>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Max Leaf Load</p>
                </div>
                <div className="px-5 py-3 bg-white border border-blue-100 rounded-2xl shadow-sm">
                  <p className="text-3xl font-bold text-blue-600">1,000+</p>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Global Projects</p>
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-600 rounded-3xl opacity-30 blur-2xl group-hover:opacity-60 transition" />
              <div className="relative rounded-[32px] overflow-hidden shadow-2xl border border-white/40">
                <div className="grid grid-cols-2 gap-2">
                  {heroImages.map((img, idx) => (
                    <img key={idx} src={img} alt={`Aluminium window and door profile showcase ${idx + 1}`} className="w-full h-full object-cover" />
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
              <img src={img} alt={`Aluminium extrusion profile product photo ${idx + 1}`} className="w-full h-[420px] object-cover" />
            </div>
          ))}
        </section>

        <section className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Project Specifications to Confirm</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-600">
              <div className="p-4 rounded-2xl bg-slate-50">
                <p className="text-xs uppercase tracking-wide text-slate-500">Profile Alloy</p>
                <p className="text-lg font-semibold text-slate-900">Confirm by drawing or specification</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50">
                <p className="text-xs uppercase tracking-wide text-slate-500">Wall Thickness</p>
                <p className="text-lg font-semibold text-slate-900">Confirm by profile requirements</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50">
                <p className="text-xs uppercase tracking-wide text-slate-500">Thermal Break</p>
                <p className="text-lg font-semibold text-slate-900">Select to match the target system</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50">
                <p className="text-xs uppercase tracking-wide text-slate-500">Hardware Compatibility</p>
                <p className="text-lg font-semibold text-slate-900">Confirm with system and hardware details</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Project Services</h3>
            <ul className="space-y-4 text-sm tracking-wide">
              <li>• Drawing and schedule review</li>
              <li>• Profile, finish, and processing requirement discussion</li>
              <li>• Tooling or sample options confirmed during quotation</li>
              <li>• Order and export detail coordination</li>
            </ul>
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-slate-900">Finishes & Textures</h2>
          <div className="mx-auto max-w-4xl overflow-hidden rounded-xl bg-slate-950">
            <img
              src="/images/surface-treatment-options-clean.webp"
              alt="Aluminum surface finish samples"
              className="mx-auto max-h-[720px] w-full object-contain"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {finishes.map((finish) => (
              <div key={finish.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm uppercase tracking-widest text-blue-500">{finish.title}</p>
                <p className="text-lg font-semibold text-slate-900 mt-2">{finish.tone}</p>
                <p className="text-sm text-slate-600 mt-2">{finish.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-slate-900">Application Highlights</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {applicationScenarios.map((item) => (
              <div key={item.title} className="bg-white rounded-3xl p-6 shadow border border-slate-100">
                <div className="text-3xl">{item.icon}</div>
                <h3 className="text-lg font-semibold text-slate-900 mt-4">{item.title}</h3>
                <p className="text-sm text-slate-600 mt-2">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-lg">
          <div className="grid lg:grid-cols-2 gap-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Project Details to Confirm</h2>
              <ul className="space-y-4 text-slate-600">
                {qaChecklist.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 text-blue-600 font-semibold text-xs flex items-center justify-center">{idx + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-4">
              {factoryImages.map((img, idx) => (
                <div key={img.src} className="w-full h-56 rounded-2xl overflow-hidden border border-slate-100 bg-white">
                  <img src={img.src} alt={img.alt} className={`w-full h-full ${img.fit === 'contain' ? 'object-contain' : 'object-cover'}`} loading="lazy" decoding="async" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <FactoryShowcase className="-mx-6 lg:-mx-12" />

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Project Coordination</h2>
          <div className="grid lg:grid-cols-5 gap-4">
            {projectSteps.map((step) => (
              <div key={step.step} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                <p className="text-sm font-mono text-blue-500">{step.step}</p>
                <h4 className="text-lg font-semibold text-slate-900 mt-2">{step.title}</h4>
                <p className="text-sm text-slate-600 mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 text-white shadow-2xl">
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-white/70">Custom Project Support</p>
              <h2 className="text-3xl font-bold leading-tight">Discuss your window or facade requirements</h2>
              <p className="text-white/80">
                Share a window schedule, façade elevation, drawing, or reference. Profile configuration, finish, and system compatibility can then be reviewed against your project needs.
              </p>
              <div className="flex flex-wrap gap-6 text-sm text-white/70">
                <span>• Drawing or schedule</span>
                <span>• Finish requirements</span>
                <span>• Quantity and destination</span>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-slate-900 shadow-xl">
              <InquiryForm productName="Aluminium Window & Door System" productLink={typeof window !== 'undefined' ? window.location.href : ''} />
            </div>
          </div>
        </section>
      </div>

      <FloatingContactButtons />
    </div>
  );
};

export default ProductShowcase;

