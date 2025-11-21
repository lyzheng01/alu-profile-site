import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { TranslationProvider, useTranslation } from './contexts/TranslationContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import ProductShowcase from './pages/ProductShowcase';
import News from './pages/News';
import About from './pages/About';

import Footer from './components/Footer';

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
            <Route key={`${lang}-product-detail`} path={`/${lang}/products/:productId`} element={<ProductDetail />} />
          ))}
          {supportedLanguages.map(lang => (
            <Route
              key={`${lang}-product-showcase`}
              path={`/${lang}/products/windows-doors/showcase`}
              element={<ProductShowcase />}
            />
          ))}
          {supportedLanguages.map(lang => (
            <Route key={`${lang}-news-detail`} path={`/${lang}/news/:articleId`} element={<News />} />
          ))}
          {supportedLanguages.map(lang => (
            <Route key={`${lang}-news`} path={`/${lang}/news`} element={<News />} />
          ))}
          {supportedLanguages.map(lang => (
            <Route key={`${lang}-about`} path={`/${lang}/about`} element={<About />} />
          ))}

          
          {/* 404重定向到英语首页 */}
          <Route path="*" element={<Navigate to="/en" replace />} />
        </Routes>
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