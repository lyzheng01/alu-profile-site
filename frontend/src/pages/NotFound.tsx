import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../contexts/TranslationContext';
import { useSeoMeta } from '../hooks/useSeoMeta';

const NotFound: React.FC = () => {
  const { currentLanguage, t } = useTranslation();

  useSeoMeta({
    title: '404 | LingYe Aluminum',
    description: 'Page not found on LingYe Aluminum website.',
    robots: 'noindex,follow',
  });

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-20">
      <div className="max-w-xl text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-blue-600 mb-3">404</p>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('page_not_found', 'Page Not Found')}</h1>
        <p className="text-gray-600 mb-8">
          {t('page_not_found_desc', 'The page you requested does not exist. Please return to the homepage or browse products.')}
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to={`/${currentLanguage}`}
            className="px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            {t('back_home', 'Back Home')}
          </Link>
          <Link
            to={`/${currentLanguage}/products`}
            className="px-5 py-3 rounded-lg bg-white border border-gray-300 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
          >
            {t('browse_products', 'Browse Products')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
