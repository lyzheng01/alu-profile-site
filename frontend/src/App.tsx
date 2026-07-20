import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { TranslationProvider, useTranslation } from './contexts/TranslationContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const ProductShowcase = lazy(() => import('./pages/ProductShowcase'));
const News = lazy(() => import('./pages/News'));
const About = lazy(() => import('./pages/About'));
const NotFound = lazy(() => import('./pages/NotFound'));
const LongtailLanding = lazy(() => import('./pages/LongtailLanding'));

// 支持的语言列表 - 精简为4种主要语言
const supportedLanguages = ['en', 'zh', 'es', 'pt'];

// 语言重定向组件
const LanguageRedirect: React.FC = () => {
  const { currentLanguage } = useTranslation();
  const location = useLocation();
  
  // 如果当前路径不包含语言代码，重定向到带语言代码的路径
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];
  
  if (!supportedLanguages.includes(firstSegment)) {
    const newPath = `/${currentLanguage}${location.pathname}`;
    return <Navigate to={newPath} replace />;
  }
  
  return null;
};

// 主应用内容组件
const AppContent: React.FC = () => {
  return (
    <div className="App">
      <Navbar />
      <main>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
        <Routes>
          {/* 默认重定向到英语 */}
          <Route path="/" element={<Navigate to="/en" replace />} />
          
          {/* 语言路由 */}
          {supportedLanguages.map(lang => (
            <Route key={lang} path={`/${lang}`} element={<Home />} />
          ))}
          {supportedLanguages.map(lang => (
            <Route key={`${lang}-products`} path={`/${lang}/products`} element={<Products />} />
          ))}
          {supportedLanguages.map(lang => (
            <Route key={`${lang}-product-detail`} path={`/${lang}/products/:productSlug`} element={<ProductDetail />} />
          ))}
          {supportedLanguages.map(lang => (
            <Route
              key={`${lang}-product-showcase`}
              path={`/${lang}/products/windows-doors/showcase`}
              element={<ProductShowcase />}
            />
          ))}
          {supportedLanguages.map(lang => (
            <Route key={`${lang}-news-detail`} path={`/${lang}/news/:articleRef`} element={<News />} />
          ))}
          {supportedLanguages.map(lang => (
            <Route key={`${lang}-news`} path={`/${lang}/news`} element={<News />} />
          ))}
          {supportedLanguages.map(lang => (
            <Route key={`${lang}-about`} path={`/${lang}/about`} element={<About />} />
          ))}

          {/* EN long-tail landing pages */}
          <Route
            path="/en/:slug"
            element={<LongtailLanding />}
          />

          {/* 404 页面 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <TranslationProvider>
        <LanguageRedirect />
        <AppContent />
      </TranslationProvider>
    </Router>
  );
}

export default App; 