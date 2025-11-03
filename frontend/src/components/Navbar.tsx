import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supportedLanguages } from '../services/translationService';
import { useTranslation } from '../contexts/TranslationContext';
import { API_ENDPOINTS } from '../config/api';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(false);
  const [productCategories, setProductCategories] = useState<Array<{
    id: number, 
    name: string, 
    subcategories?: Array<{id: number, name: string}>
  }>>([]);
  const { currentLanguage, changeLanguage, t, isLoading } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const productsMenuRef = useRef<HTMLDivElement>(null);

  // 获取产品分类数据（包含子分类）
  useEffect(() => {
    fetch(`${API_ENDPOINTS.CATEGORIES}?include_subcategories=true`)
      .then(res => res.json())
      .then(data => {
        const categories = data.results || data;
        setProductCategories(categories);
      })
      .catch(error => {
        console.error('获取产品分类失败:', error);
        // 如果API失败，使用默认数据
        setProductCategories([
          { 
            id: 1, 
            name: t('product_category_cabinet', 'Aluminium Cabinet Profile'),
            subcategories: [
              { id: 11, name: '门窗' },
              { id: 12, name: '地板' }
            ]
          },
          { 
            id: 2, 
            name: t('product_category_industry', 'Aluminium Industry Profile'),
            subcategories: [
              { id: 21, name: '工业型材' },
              { id: 22, name: '建筑型材' }
            ]
          },
          { 
            id: 3, 
            name: t('product_category_t_slot', 'Aluminium T Slot Profiles and Accessories'),
            subcategories: [
              { id: 31, name: 'T型槽' },
              { id: 32, name: '配件' }
            ]
          },
          { 
            id: 4, 
            name: t('product_category_window_door', 'Aluminium Window and Door Profile'),
            subcategories: [
              { id: 41, name: '窗框' },
              { id: 42, name: '门框' }
            ]
          },
          { 
            id: 5, 
            name: t('product_category_standard', 'Standard Aluminium Profile'),
            subcategories: [
              { id: 51, name: '标准型材' },
              { id: 52, name: '定制型材' }
            ]
          }
        ]);
      });
  }, []);

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isLanguageMenuOpen && !isProductsMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (languageMenuRef.current && !languageMenuRef.current.contains(event.target as Node)) {
        setIsLanguageMenuOpen(false);
      }
      if (productsMenuRef.current && !productsMenuRef.current.contains(event.target as Node)) {
        setIsProductsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLanguageMenuOpen, isProductsMenuOpen]);

  // 获取当前页面路径（不包含语言代码）
  const getCurrentPagePath = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    if (pathSegments.length === 0) return '/';
    
    // 如果第一个段是语言代码，返回剩余路径
    if (supportedLanguages.some(lang => lang.code === pathSegments[0])) {
      const remainingPath = pathSegments.slice(1).join('/');
      return remainingPath ? `/${remainingPath}` : '/';
    }
    
    // 否则返回完整路径
    return location.pathname;
  };

  // 切换语言
  const handleLanguageChange = async (language: string) => {
    setIsLanguageMenuOpen(false);
    await changeLanguage(language);
    
    // 更新URL
    const currentPagePath = getCurrentPagePath();
    const newPath = `/${language}${currentPagePath}`;
    navigate(newPath);
  };

  const navLinks = [
    { to: `/${currentLanguage}`, text: t('nav_home', 'Home') },
    { to: `/${currentLanguage}/products`, text: t('nav_products', 'Products') },
    { to: `/${currentLanguage}/news`, text: t('nav_news', 'News') },
    { to: `/${currentLanguage}/about`, text: t('nav_about', 'About Us') },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
      ${isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to={`/${currentLanguage}`} className="flex items-center">
              <img src="/logo.jpg" alt="lingye Logo" className="w-8 h-8 rounded mr-2" />
              <span className="text-xl font-bold text-gray-800">
                {t('home_title', 'LingYe Aluminum')}
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.to || 
                  (link.to === `/${currentLanguage}` && location.pathname === `/${currentLanguage}`);
                
                // 特殊处理Products按钮
                if (link.text === t('nav_products', 'Products')) {
                  return (
                    <div key={link.to} className="relative" ref={productsMenuRef}>
                      <div
                        onMouseEnter={() => setIsProductsMenuOpen(true)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 cursor-pointer ${
                          isActive
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        <span>{link.text}</span>
                        <svg
                          className={`w-4 h-4 transition-transform ${isProductsMenuOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                      
                      {/* Products Dropdown Menu */}
                      {isProductsMenuOpen && (
                        <div 
                          className="absolute top-full left-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50"
                          onMouseEnter={() => setIsProductsMenuOpen(true)}
                          onMouseLeave={() => setIsProductsMenuOpen(false)}
                        >
                          {productCategories.map((category) => (
                            <div key={category.id} className="group">
                              <Link
                                to={`/${currentLanguage}/products?category=${category.id}`}
                                onClick={() => setIsProductsMenuOpen(false)}
                                className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors font-medium"
                              >
                                {category.name}
                              </Link>
                              {category.subcategories && category.subcategories.length > 0 && (
                                <div className="ml-4 mt-1">
                                  {category.subcategories.map((subcategory) => (
                                    <Link
                                      key={subcategory.id}
                                      to={`/${currentLanguage}/products?category=${category.id}&subcategory=${subcategory.id}`}
                                      onClick={() => setIsProductsMenuOpen(false)}
                                      className="block px-4 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                                    >
                                      • {subcategory.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                
                // 其他导航链接正常渲染
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {link.text}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Language Switcher */}
          <div className="relative" ref={languageMenuRef}>
            <button
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <span className="text-sm font-medium">
                {supportedLanguages.find(lang => lang.code === currentLanguage)?.nativeName || '中文'}
              </span>
              {isLoading && (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              )}
              <svg
                className={`w-4 h-4 transition-transform ${isLanguageMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Language Dropdown */}
            {isLanguageMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                {supportedLanguages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    disabled={isLoading}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      currentLanguage === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getLanguageFlag(language.code)}</span>
                      <div>
                        <div className="font-medium">{language.nativeName}</div>
                        <div className="text-xs text-gray-500">{language.name}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.to || 
              (link.to === `/${currentLanguage}` && location.pathname === `/${currentLanguage}`);
            
            // 移动端特殊处理Products按钮
            if (link.text === t('nav_products', 'Products')) {
              return (
                <div key={link.to}>
                  <button
                    onClick={() => setIsProductsMenuOpen(!isProductsMenuOpen)}
                    className={`w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center justify-between ${
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <span>{link.text}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isProductsMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Mobile Products Dropdown */}
                  {isProductsMenuOpen && (
                    <div className="mt-2 ml-4 bg-gray-50 rounded-lg p-2">
                      {productCategories.map((category) => (
                        <div key={category.id}>
                          <Link
                            to={`/${currentLanguage}/products?category=${category.id}`}
                            onClick={() => setIsProductsMenuOpen(false)}
                            className="block px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors font-medium"
                          >
                            {category.name}
                          </Link>
                          {category.subcategories && category.subcategories.length > 0 && (
                            <div className="ml-4 mt-1">
                              {category.subcategories.map((subcategory) => (
                                <Link
                                  key={subcategory.id}
                                  to={`/${currentLanguage}/products?category=${category.id}&subcategory=${subcategory.id}`}
                                  onClick={() => setIsProductsMenuOpen(false)}
                                  className="block px-3 py-1 text-xs text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded transition-colors"
                                >
                                  • {subcategory.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            
            // 其他移动端导航链接正常渲染
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {link.text}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

// 获取语言国旗emoji
const getLanguageFlag = (languageCode: string): string => {
  const flags: Record<string, string> = {
    zh: '🇨🇳',
    en: '🇺🇸',
    es: '🇪🇸',
    pt: '🇵🇹',
  };
  return flags[languageCode] || '🌐';
};

export default Navbar; 