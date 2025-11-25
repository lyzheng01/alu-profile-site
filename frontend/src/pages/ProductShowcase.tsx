import React from 'react';
import FloatingContactButtons from '../components/FloatingContactButtons';
import InquiryForm from '../components/InquiryForm';
import { useTranslation } from '../contexts/TranslationContext';
import { usePageTitle } from '../hooks/usePageTitle';

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
  'https://images.unsplash.com/photo-1502767089025-6572583495b0?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1600&q=80',
];

const finishes = [
  { title: 'Anodized', desc: '10-25μm anodizing layer, matte or bright tone', tone: 'Matte Silver' },
  { title: 'Powder Coated', desc: 'Akzo Nobel powder, any RAL color available', tone: 'RAL 7016 / 9016' },
  { title: 'PVDF Painting', desc: 'Excellent UV resistance for curtain walls', tone: 'Metallic Champagne' },
  { title: 'Wood Grain Transfer', desc: 'Faux wood feel with anti-scratch coat', tone: 'Golden Oak / Walnut' },
];

const qaChecklist = [
  'Dimensional accuracy ±0.08 mm ensured with inline laser gauges',
  'Hardness testing for each batch (HB 8-12) after aging furnace',
  'Neutral salt spray testing ≥ 1,000 h for PVDF and powder layers',
  'Double inspection for corner joining strength and surface finish',
];

const applicationScenarios = [
  { title: 'Luxury Sliding Doors', detail: 'Large-span panoramic openings with slim interlocks (31 mm)', icon: '🚪' },
  { title: 'Passive House Windows', detail: 'Triple glazing ready profiles with multi-cavity thermal break', icon: '🏠' },
  { title: 'Commercial Curtain Walls', detail: 'Unitized façade frames with hidden drainage design', icon: '🏢' },
  { title: 'Villa Folding Doors', detail: 'Heavy-duty rollers for 120 kg leaf, flush sill threshold', icon: '🌳' },
];

const manufacturingSteps = [
  { step: '01', title: 'Billet Preparation', desc: 'High purity 6063/6061 billets inspected & homogenized' },
  { step: '02', title: 'Precision Extrusion', desc: '1,800-3,600T presses with online quenching & stretchers' },
  { step: '03', title: 'Aging & Machining', desc: 'Automatic aging furnaces + CNC cutting, punching & milling' },
  { step: '04', title: 'Surface Finishing', desc: 'Vertical powder line & 12+ anodizing tanks for stylish finishes' },
  { step: '05', title: 'Assembly & QA', desc: 'Pre-assembly mock-up, hardware fitting & full inspection report' },
];

const ProductShowcase: React.FC = () => {
  const { t } = useTranslation();
  usePageTitle('windowsDoors');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="relative overflow-hidden pt-24">
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
                Built with Lingye’s strict European-class quality control and extensive finish library.
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
                    <img key={idx} src={img} alt={`hero-${idx}`} className="w-full h-full object-cover" />
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
              <img src={img} alt={`product-${idx}`} className="w-full h-[420px] object-cover" />
            </div>
          ))}
        </section>

        <section className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Performance & Specifications</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-600">
              <div className="p-4 rounded-2xl bg-slate-50">
                <p className="text-xs uppercase tracking-wide text-slate-500">Profile Alloy</p>
                <p className="text-lg font-semibold text-slate-900">6063-T5 / 6061-T6</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50">
                <p className="text-xs uppercase tracking-wide text-slate-500">Wall Thickness</p>
                <p className="text-lg font-semibold text-slate-900">1.4 mm – 3.0 mm</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50">
                <p className="text-xs uppercase tracking-wide text-slate-500">Thermal Break</p>
                <p className="text-lg font-semibold text-slate-900">PA66 GF25 Insulating Strips</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50">
                <p className="text-xs uppercase tracking-wide text-slate-500">Hardware Compatibility</p>
                <p className="text-lg font-semibold text-slate-900">Siegenia / Roto / HOPO</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Project Services</h3>
            <ul className="space-y-4 text-sm tracking-wide">
              <li>• BIM & shop drawing support (Autodesk Revit / CAD)</li>
              <li>• Custom die opening within 7 days</li>
              <li>• Mock-up fabrication & onsite guidance</li>
              <li>• 15-year surface warranty for PVDF systems</li>
            </ul>
          </div>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-bold text-slate-900">Finishes & Textures</h2>
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
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Quality Assurance</h2>
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
                <div key={idx} className="w-full rounded-2xl overflow-hidden border border-slate-100">
                  <img src={img} alt={`factory-${idx}`} className="w-full h-56 object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">Manufacturing Journey</h2>
          <div className="grid lg:grid-cols-5 gap-4">
            {manufacturingSteps.map((step) => (
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
              <h2 className="text-3xl font-bold leading-tight">Request detailed drawings, die opening and finish samples within 5 days</h2>
              <p className="text-white/80">
                Share your window/door schedule or façade elevation, and our engineering team will match the optimal profile system, glazing bead, mullion,
                transom and accessory solution for faster installation onsite.
              </p>
              <div className="flex flex-wrap gap-6 text-sm text-white/70">
                <span>• BIM & CNC files</span>
                <span>• Hardware pairing</span>
                <span>• Mock-up fabrication</span>
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


