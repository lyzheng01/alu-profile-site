import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supportedLanguages } from '../services/translationService';
import { useTranslation } from '../contexts/TranslationContext';
import { API_ENDPOINTS } from '../config/api';

type MenuSubcategory = { id: number; name?: string; translated_name?: string };
type ProductCategory = {
  id: number;
  name?: string;
  translated_name?: string;
  subcategories?: MenuSubcategory[];
  is_active?: boolean;
};

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const { currentLanguage, changeLanguage, t, isLoading } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const productsMenuRef = useRef<HTMLDivElement>(null);

  // 获取当前语言的产品分类，统一兼容 API 的 name / translated_name 字段
  useEffect(() => {
    const controller = new AbortController();
    const categoryUrl = `${API_ENDPOINTS.CATEGORIES}?lang=${encodeURIComponent(currentLanguage)}&include_subcategories=true`;

    fetch(categoryUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`分类接口返回 ${response.status}`);
        return response.json();
      })
      .then((data) => {
        const categories = data.results || data;
        if (!Array.isArray(categories)) throw new Error('分类接口返回格式不正确');

        const normalizedCategories = categories
          .filter((category: ProductCategory) => category && category.is_active !== false)
          .map((category: ProductCategory) => ({
            ...category,
            name: category.name?.trim() || category.translated_name?.trim() || '',
            subcategories: Array.isArray(category.subcategories)
              ? category.subcategories
                  .map((subcategory) => ({
                    ...subcategory,
                    name: subcategory.name?.trim() || subcategory.translated_name?.trim() || '',
                  }))
                  .filter((subcategory) => subcategory.name)
              : [],
          }))
          .filter((category: ProductCategory) => category.name);

        if (!normalizedCategories.length) throw new Error('分类接口没有返回可显示的分类名称');
        setProductCategories(normalizedCategories);
      })
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === 'AbortError') return;
        console.error('获取产品分类失败:', error);
        setProductCategories([
          {
            id: 1,
            name: t('product_category_cabinet', 'Aluminium Cabinet Profile'),
            subcategories: [
              { id: 11, name: '门窗' },
              { id: 12, name: '地板' },
            ],
          },
          {
            id: 2,
            name: t('product_category_industry', 'Aluminium Industry Profile'),
            subcategories: [
              { id: 21, name: '工业型材' },
              { id: 22, name: '建筑型材' },
            ],
          },
          {
            id: 3,
            name: t('product_category_t_slot', 'Aluminium T Slot Profiles and Accessories'),
            subcategories: [
              { id: 31, name: 'T型槽' },
              { id: 32, name: '配件' },
            ],
          },
          {
            id: 4,
            name: t('product_category_window_door', 'Aluminium Window and Door Profile'),
            subcategories: [
              { id: 41, name: '窗框' },
              { id: 42, name: '门框' },
            ],
          },
          {
            id: 5,
            name: t('product_category_standard', 'Standard Aluminium Profile'),
            subcategories: [
              { id: 51, name: '标准型材' },
              { id: 52, name: '定制型材' },
            ],
          },
        ]);
      });

    return () => controller.abort();
  }, [currentLanguage, t]);

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
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsLanguageMenuOpen(false);
        setIsProductsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
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
    setIsMobileMenuOpen(false);
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
    <nav className={`sticky top-0 z-50 border-b border-gray-800 bg-gray-900 transition-all duration-300 
      ${isScrolled ? 'shadow-lg shadow-gray-950/20' : 'shadow-none'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to={`/${currentLanguage}`} className="flex items-center">
              <div className="w-20 h-20 mr-3 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-sm">
                <img 
                  src="/logo.png?v=5" 
                  alt="lingye Logo" 
                  className="w-full h-full" 
                  style={{ 
                    objectFit: 'contain'
                  }}
                />
              </div>
              <span className="text-2xl font-bold text-white whitespace-nowrap">
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
                      <button
                        type="button"
                        aria-haspopup="true"
                        aria-expanded={isProductsMenuOpen}
                        aria-controls="desktop-products-menu"
                        onClick={() => setIsProductsMenuOpen((open) => !open)}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 cursor-pointer ${
                          isActive
                            ? 'text-white bg-sky-700'
                            : 'text-white hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span>{link.text}</span>
                        <svg
                          aria-hidden="true"
                          className={`w-4 h-4 transition-transform ${isProductsMenuOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Products Dropdown Menu */}
                      {isProductsMenuOpen && (
                        <div
                          id="desktop-products-menu"
                          className="absolute top-full left-0 mt-2 w-80 bg-gray-900 rounded-lg shadow-xl border border-white/10 py-2 z-50"
                        >
                          {productCategories.map((category) => (
                            <div key={category.id} className="group">
                              <Link
                                to={`/${currentLanguage}/products?category=${category.id}`}
                                onClick={() => setIsProductsMenuOpen(false)}
                                className="block px-4 py-2 text-sm text-white hover:text-white hover:bg-white/10 transition-colors font-medium"
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
                                      className="block px-4 py-1 text-xs text-sky-200 hover:text-white hover:bg-white/10 transition-colors"
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
                        ? 'text-white bg-sky-700'
                        : 'text-white hover:text-white hover:bg-white/10'
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
              className="flex min-h-[44px] items-center space-x-2 rounded-lg bg-white/10 px-3 py-2 text-white transition-colors hover:bg-white/15 disabled:opacity-50 sm:px-4"
            >
              <span className="text-sm font-medium">
                {supportedLanguages.find(lang => lang.code === currentLanguage)?.nativeName || '中文'}
              </span>
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg border border-white/10 py-2 z-50">
                {supportedLanguages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    disabled={isLoading}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-600 transition-colors ${
                      currentLanguage === language.code ? 'bg-sky-700 text-white' : 'text-white hover:bg-white/10'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center space-x-2">
                      <LanguageFlag languageCode={language.code} />
                      <div>
                        <div className="font-medium">{language.nativeName}</div>
                        <div className="text-xs text-sky-200">{language.name}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div data-testid="mobile-navigation" className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
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
                        ? 'text-white bg-sky-700'
                        : 'text-white hover:text-white hover:bg-white/10'
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
                    <div className="mt-2 ml-4 bg-white/10 rounded-lg p-2">
                      {productCategories.map((category) => (
                        <div key={category.id}>
                          <Link
                            to={`/${currentLanguage}/products?category=${category.id}`}
                            onClick={() => {
                              setIsProductsMenuOpen(false);
                              setIsMobileMenuOpen(false);
                            }}
                            className="block px-3 py-2 text-sm text-white hover:text-white hover:bg-white/10 rounded transition-colors font-medium"
                          >
                            {category.name}
                          </Link>
                          {category.subcategories && category.subcategories.length > 0 && (
                            <div className="ml-4 mt-1">
                              {category.subcategories.map((subcategory) => (
                                <Link
                                  key={subcategory.id}
                                  to={`/${currentLanguage}/products?category=${category.id}&subcategory=${subcategory.id}`}
                                  onClick={() => {
                                    setIsProductsMenuOpen(false);
                                    setIsMobileMenuOpen(false);
                                  }}
                                  className="block px-3 py-1 text-xs text-sky-200 hover:text-white hover:bg-white/10 rounded transition-colors"
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
                    ? 'text-white bg-sky-700'
                    : 'text-white hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
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

const getStarPoints = (cx: number, cy: number, outerRadius: number, innerRadius: number) =>
  Array.from({ length: 10 }, (_, index) => {
    const angle = (index * Math.PI) / 5 - Math.PI / 2;
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    return `${(cx + Math.cos(angle) * radius).toFixed(2)},${(cy + Math.sin(angle) * radius).toFixed(2)}`;
  }).join(' ');

const LanguageFlag: React.FC<{ languageCode: string }> = ({ languageCode }) => {
  const flagContent: Record<string, React.ReactNode> = {
    en: (
      <>
        <rect width="20" height="14" fill="#fff" />
        {[0, 2, 4, 6, 8, 10, 12].map((y) => <rect key={y} y={y} width="20" height="1" fill="#b22234" />)}
        <rect width="9" height="7.5" fill="#3c3b6e" />
        <g fill="#fff">
          <circle cx="1.5" cy="1.5" r="0.45" /><circle cx="4" cy="1.5" r="0.45" /><circle cx="6.5" cy="1.5" r="0.45" />
          <circle cx="2.75" cy="3.5" r="0.45" /><circle cx="5.25" cy="3.5" r="0.45" /><circle cx="7.5" cy="3.5" r="0.4" />
          <circle cx="1.5" cy="5.5" r="0.45" /><circle cx="4" cy="5.5" r="0.45" /><circle cx="6.5" cy="5.5" r="0.45" />
        </g>
      </>
    ),
    zh: (
      <>
        <rect width="20" height="14" fill="#de2910" />
        <polygon points={getStarPoints(5, 4, 2.5, 1.05)} fill="#ffde00" />
        <circle cx="8.4" cy="2" r="0.65" fill="#ffde00" />
        <circle cx="9.7" cy="4" r="0.65" fill="#ffde00" />
        <circle cx="9.2" cy="6.3" r="0.65" fill="#ffde00" />
        <circle cx="7.5" cy="8" r="0.65" fill="#ffde00" />
      </>
    ),
    es: (
      <>
        <rect width="20" height="14" fill="#aa151b" />
        <rect y="3.5" width="20" height="7" fill="#f1bf00" />
        <circle cx="6" cy="7" r="1.1" fill="#aa151b" />
      </>
    ),
    pt: (
      <>
        <rect width="8" height="14" fill="#046a38" />
        <rect x="8" width="12" height="14" fill="#da291c" />
        <circle cx="8" cy="7" r="2.2" fill="#ffcc29" />
        <circle cx="8" cy="7" r="1.1" fill="#fff" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="h-3.5 w-5 shrink-0 rounded-[2px] shadow-sm"
      viewBox="0 0 20 14"
    >
      {flagContent[languageCode] || (
        <>
          <circle cx="10" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 7h12M10 1c2 2 2 10 0 12M10 1c-2 2-2 10 0 12" fill="none" stroke="currentColor" strokeWidth="1" />
        </>
      )}
    </svg>
  );
};

export default Navbar; 
