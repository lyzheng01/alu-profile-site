import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../contexts/TranslationContext';

const factoryImages = [
  {
    src: '/images/factory-extrusion-lines.webp',
    altKey: 'factory_extrusion_line_alt',
    fallbackAlt: 'Aluminum extrusion production line',
  },
  {
    src: '/images/factory-crane-clean.webp',
    altKey: 'factory_crane_alt',
    fallbackAlt: 'Aluminum extrusion factory crane',
  },
];

const FactoryShowcase: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { t, currentLanguage } = useTranslation();

  return (
    <section className={`bg-slate-100 py-14 sm:py-16 ${className}`} aria-labelledby="factory-showcase-title" data-testid="factory-showcase">
      <div className="mx-auto max-w-7xl px-4 pr-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <h2 id="factory-showcase-title" className="text-2xl font-semibold text-slate-900 sm:text-3xl">
              {t('factory_showcase', 'Manufacturing Capabilities')}
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600 sm:text-lg">
              {t('factory_subtitle', 'Production scenes and manufacturing resources for project-specific aluminum profile requirements.')}
            </p>
          </div>
          <Link
            to={`/${currentLanguage}/about`}
            className="inline-flex min-h-11 items-center font-semibold text-sky-800 underline decoration-sky-300 underline-offset-4 hover:text-sky-950 focus:outline-none focus:ring-2 focus:ring-sky-600"
          >
            {t('factory_showcase_about_cta', 'Learn about our approach')}
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {factoryImages.map((image) => (
            <figure key={image.src} className="min-w-0 overflow-hidden bg-white">
              <div className="aspect-[16/9] w-full overflow-hidden bg-slate-200">
                <img
                  src={image.src}
                  alt={t(image.altKey, image.fallbackAlt)}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  width="1280"
                  height="720"
                />
              </div>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FactoryShowcase;
