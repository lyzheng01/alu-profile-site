import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { resolveMediaUrl } from '../utils/url';
import { useTranslation } from '../contexts/TranslationContext';
import CountUp from 'react-countup';
import FloatingContactButtons from '../components/FloatingContactButtons';
import InquiryForm from '../components/InquiryForm';
import { usePageTitle } from '../hooks/usePageTitle';

// 类型声明
type ProductImage = {
  image: string;
  is_primary?: boolean;
};

type FeaturedProduct = {
  id: number | string;
  name: string;
  description: string;
  images?: ProductImage[];
  product_image: string;
};

type CategoryItem = {
  id: number | string;
  name: string;
  description?: string;
  image?: string;
  subcategories?: SubCategoryItem[];
};

type SubCategoryItem = {
  id: number | string;
  name: string;
  description?: string;
  parent_category: number | string;
};

const Home: React.FC = () => {
  const { t, currentLanguage } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isServiceExpanded, setIsServiceExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [homepageImage3Url, setHomepageImage3Url] = useState('');
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  // 设置页面标题
  usePageTitle('home');

  // 幻灯片默认图片
  const defaultSlideImages = useMemo(() => ([
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&h=600&fit=crop'
  ]), []);

  // 幻灯片数据 - 优先使用后台上传的首页图片
  const slides = useMemo(() => ([
    {
      title: t('slide_1_title', 'LingYe Aluminum'),
      subtitle: t('slide_1_subtitle', 'High-quality solutions for your needs'),
      image: homepageImage3Url || defaultSlideImages[0],
      cta: t('slide_1_cta', 'Learn More')
    },
    {
      title: t('slide_2_title', 'Global Export Experience'),
      subtitle: t('slide_2_subtitle', 'Serving 30+ countries worldwide'),
      image: heroImageUrl || defaultSlideImages[1],
      cta: t('slide_2_cta', 'View Products')
    },
    {
      title: t('slide_3_title', 'Advanced Technology'),
      subtitle: t('slide_3_subtitle', 'Innovative manufacturing processes'),
      image: defaultSlideImages[2],
      cta: t('slide_3_cta', 'Contact Us')
    }
  ]), [defaultSlideImages, heroImageUrl, homepageImage3Url, t]);
  // 加载后台上传的首页图片
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.FACTORY_IMAGES);
        if (!response.ok) return;
        const data = await response.json();
        const list = data.results || data || [];
        if (Array.isArray(list) && list.length > 0) {
          // 获取首页图片1（第二张幻灯片）
          const homepageImage1 = list.find((item: any) => (item.title || '').includes('首页图片1'));
          if (homepageImage1) {
            const resolvedUrl1 = resolveMediaUrl(homepageImage1?.image);
            if (resolvedUrl1) {
              setHeroImageUrl(resolvedUrl1);
            }
          }
          
          // 获取首页图片3（第一张幻灯片）
          const homepageImage3 = list.find((item: any) => (item.title || '').includes('首页图片3'));
          if (homepageImage3) {
            const resolvedUrl3 = resolveMediaUrl(homepageImage3?.image);
            if (resolvedUrl3) {
              setHomepageImage3Url(resolvedUrl3);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch hero images:', error);
      }
    };

    fetchHeroImages();
  }, []);

  // 自动播放幻灯片
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // 产品优势数据
  const advantages = [
    {
      icon: '🏭',
      title: t('advantage_1_title', 'Advanced Manufacturing'),
      description: t('advantage_1_desc', 'State-of-the-art production facilities with cutting-edge technology')
    },
    {
      icon: '🌍',
      title: t('advantage_2_title', 'Global Export'),
      description: t('advantage_2_desc', 'Serving customers in 30+ countries with reliable delivery')
    },
    {
      icon: '⚡',
      title: t('advantage_3_title', 'Fast Delivery'),
      description: t('advantage_3_desc', 'Efficient supply chain management for quick response')
    },
    {
      icon: '🔧',
      title: t('advantage_4_title', 'Technical Support'),
      description: t('advantage_4_desc', 'Professional technical team providing 24/7 support')
    },
    {
      icon: '📋',
      title: t('advantage_5_title', 'Quality Assurance'),
      description: t('advantage_5_desc', 'Strict quality control system ensuring product excellence')
    },
    {
      icon: '🤝',
      title: t('advantage_6_title', 'Customer Service'),
      description: t('advantage_6_desc', 'Dedicated customer service team for your satisfaction')
    }
  ];

  // featuredProducts 拉取逻辑
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  useEffect(() => {
    fetch(`${API_ENDPOINTS.PRODUCTS}?is_featured=true`)
      .then(res => res.json())
      .then(data => {
        // 兼容分页和非分页
        const products = data.results || data;
        // 取主图
        setFeaturedProducts(products.map((prod: any) => ({
          ...prod,
          product_image: (prod.images && prod.images.length > 0)
            ? (prod.images.find((img: any) => img.is_primary)?.image || prod.images[0].image)
            : '/images/default-product.jpg'
        })));
      });
  }, []);

  // 分类拉取逻辑（动态）
  useEffect(() => {
    fetch(`${API_ENDPOINTS.CATEGORIES}`)
      .then(res => res.json())
      .then(data => {
        const list = data.results || data;
        // 按照指定顺序排序：construction -> industrial -> common used
        const sortedList = [...list].sort((a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          
          // 定义优先级
          const getPriority = (name: string) => {
            if (name.includes('construction')) return 1;
            if (name.includes('industrial')) return 2;
            if (name.includes('common') || name.includes('common used')) return 3;
            return 4; // 其他分类排在最后
          };
          
          return getPriority(nameA) - getPriority(nameB);
        });
        
        setCategories(sortedList);
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  const heroProduct = featuredProducts[0];
  const secondaryProducts = featuredProducts.slice(1, 5);

  // 点击外部关闭移动端菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('#mobile-contact-menu') && !target.closest('#mobile-contact-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 当弹窗打开时，禁止背景滚动
  useEffect(() => {
    if (isInquiryModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isInquiryModalOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section with Slider - 缩小高度 */}
      <section className="relative pt-16 pb-16 overflow-hidden">
        {/* Slider - 调整高度 */}
        <div className="relative h-96 md:h-[500px]">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-purple-900/70"></div>
              <div className="absolute inset-0 bg-cover bg-center" style={{
                backgroundImage: `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}></div>
              <div className="relative z-10 flex items-center justify-center h-full">
                <div className="text-center text-white max-w-4xl mx-auto px-4">
                  <h1 className="text-3xl md:text-5xl font-bold mb-4 animate-fade-in text-responsive">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl mb-6 animate-fade-in-delay">
                    {slide.subtitle}
                  </p>
                  <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-blue-700 transition-colors animate-fade-in-delay-2 pulse">
                    {slide.cta}
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Slider Navigation */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Company Features Cards Section */}
      <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Manufacturing Strength - Blue Theme */}
            <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-blue-200/50 animate-fade-in cursor-pointer">
              <div className="mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-7 h-7 text-white transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">Manufacturing Strength</h3>
              </div>
              <p className="text-blue-800/80 leading-relaxed">
                We operate a modern aluminum extrusion factory equipped with advanced production lines.
                Stable capacity, consistent quality, and strict QC ensure every profile meets global standards.
              </p>
            </div>

            {/* Card 2: Custom Solutions - Purple/Indigo Theme */}
            <div className="group bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-purple-200/50 animate-fade-in-delay cursor-pointer">
              <div className="mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-7 h-7 text-white transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-purple-900 mb-3 group-hover:text-purple-700 transition-colors duration-300">Custom Solutions</h3>
              </div>
              <p className="text-purple-800/80 leading-relaxed">
                From design support to extrusion, machining, and surface finishing,
                we provide complete OEM/ODM aluminum profile solutions tailored to your project needs.
              </p>
            </div>

            {/* Card 3: Global Delivery & Service - Orange/Amber Theme */}
            <div className="group bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl shadow-lg p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-amber-200/50 animate-fade-in-delay-2 cursor-pointer">
              <div className="mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg className="w-7 h-7 text-white transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-orange-900 mb-3 group-hover:text-orange-700 transition-colors duration-300">Global Delivery & Service</h3>
              </div>
              <p className="text-orange-800/80 leading-relaxed">
                With years of export experience, fast response, and reliable logistics partners,
                we deliver high-quality aluminum profiles to global clients with smooth communication and timely support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 产品种类（Product Categories）Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#eef2ff] via-white to-[#e0ecff]" />
        <div className="absolute -top-20 -right-10 w-72 h-72 bg-blue-200/40 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-100/50 blur-3xl rounded-full" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center">
            <span className="text-sm uppercase tracking-[0.5em] text-blue-400">
              {t('home_product_categories_title', 'Product Categories')}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4">
              {t('home_product_categories_subtitle', 'Explore our main product categories')}
            </h2>
            <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
              {t('about_company_mission', 'Our mission is to create greater value for customers through innovative technology and quality service.')}
            </p>
          </div>

          <div className="space-y-10">
            {categories.map((cat, index) => (
              <Link
                key={cat.id}
                to={`/${currentLanguage}/products?category=${cat.id}`}
                className={`group relative rounded-[36px] overflow-hidden shadow-[0_25px_60px_rgba(15,23,42,0.15)] border border-white/60 bg-white/90 backdrop-blur-xl ring-1 ring-blue-100/70 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} flex flex-col lg:flex-row`}
              >
                <div className="relative lg:w-1/2 h-72 lg:h-[420px]">
                  <img
                    src={resolveMediaUrl(cat.image) || '/images/category1.jpg'}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute top-6 left-6 bg-white/85 text-gray-900 px-4 py-2 rounded-full text-sm font-semibold shadow">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <p className="text-sm text-white/80 mb-1">{t('btn_view_details', 'View Details')}</p>
                    <div className="text-3xl font-semibold flex items-center gap-4">
                      {cat.name}
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="lg:w-1/2 p-8 flex flex-col gap-6 bg-gradient-to-br from-white/70 via-white/40 to-blue-50/50">
                  <div>
                    <span className="text-xs uppercase tracking-[0.4em] text-blue-400">{t('home_product_categories_title', 'Product Categories')}</span>
                    <h3 className="text-2xl font-bold text-gray-900 mt-3 mb-2">{cat.name}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {cat.description || t('home_product_categories_subtitle', 'Explore our main product categories')}
                    </p>
                  </div>

                  <div className="flex justify-start">
                    <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-sm shadow-lg group-hover:translate-x-1 transition-transform">
                      {t('btn_view_details', 'View Details')}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 新产品（New Products）Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e2761] to-[#1f2937]" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #60a5fa, transparent 45%)' }} />
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 80% 0%, #818cf8, transparent 35%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-slide-in-left">
              {t('home_new_products_title', 'New Products')}
            </h2>
            <p className="text-xl text-white/70 animate-slide-in-right">
              {t('home_new_products_subtitle', 'Latest high-quality products')}
            </p>
          </div>

          {featuredProducts.slice(0, 6).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.slice(0, 6).map((prod, idx) => {
                const productId = prod.id || idx;
                const productLink = `/${currentLanguage || 'en'}/products/${productId}`;
                return (
                  <Link
                    key={productId}
                    to={productLink}
                    className="group bg-gradient-to-br from-white/90 via-white/70 to-blue-50/60 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/40 overflow-hidden flex flex-col backdrop-blur"
                  >
                    <div className="relative h-72 md:h-80 overflow-hidden">
                      <img 
                        src={resolveMediaUrl(prod.product_image)} 
                        alt={prod.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-4 left-4 bg-white/80 text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-md backdrop-blur">
                        {t('home_new_products_title', 'New Products')}
                      </div>
                    </div>
                    <div className="px-5 py-4 flex flex-col gap-3 text-gray-900">
                      <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors line-clamp-2">
                        {prod.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 line-clamp-3">
                        {prod.description || t('about_company_mission', 'Our mission is to create greater value for customers through innovative technology and quality service.')}
                      </p>
                      <div className="flex items-center justify-between text-sm font-semibold text-blue-600">
                        <span className="flex items-center gap-2">
                          {t('btn_view_details', 'View Details')}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                        <span className="text-gray-400">#{String(idx + 1).padStart(2, '0')}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-white/70">
              {t('products_no_products', 'No products found')}
            </div>
          )}

          <div className="mt-10 text-center">
            <Link
              to={`/${currentLanguage}/products`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-colors"
            >
              {t('btn_view_details', 'View Details')}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section - 动态统计+市场分布 */}
      <section className="bg-white py-12">
        {/* 顶部数字统计动画 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center pb-12 border-b border-gray-100">
          <div>
            <div className="text-5xl font-bold text-yellow-500 mb-2">
              <CountUp 
                start={0} 
                end={15} 
                duration={2.5} 
                useEasing={true}
                separator=","
              />
            </div>
            <div className="text-xl font-semibold">{t('home_stats_years', 'YEARS')}</div>
            <div className="text-gray-400 text-sm">{t('home_stats_on_market', 'ON THE MARKET')}</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-yellow-500 mb-2">
              <CountUp 
                start={0} 
                end={50} 
                duration={2.5} 
                useEasing={true}
                separator=","
              />
            </div>
            <div className="text-xl font-semibold">{t('home_stats_thousand', 'THOUSAND')}</div>
            <div className="text-gray-400 text-sm">{t('home_stats_annual_production', 'ANNUAL PRODUCTION')}</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-yellow-500 mb-2">
              <CountUp 
                start={0} 
                end={62} 
                duration={2.5} 
                useEasing={true}
                separator=","
              />
            </div>
            <div className="text-xl font-semibold">{t('home_stats_country', 'COUNTRY')}</div>
            <div className="text-gray-400 text-sm">{t('home_stats_cooperation', 'COUNTRY OF COOPERATION')}</div>
          </div>
          <div>
            <div className="text-5xl font-bold text-yellow-500 mb-2">
              <CountUp 
                start={0} 
                end={400} 
                duration={2.5} 
                useEasing={true}
                separator=","
              />
            </div>
            <div className="text-xl font-semibold">{t('home_stats_employees', 'EMPLOYEES')}</div>
            <div className="text-gray-400 text-sm">{t('home_stats_corporate_employees', 'CORPORATE EMPLOYEES')}</div>
          </div>
        </div>

        {/* 市场区域分布 */}
        <div className="flex flex-col md:flex-row bg-yellow-400 mt-12 rounded-lg overflow-hidden shadow-lg">
          {/* 左侧文字说明 */}
          <div className="md:w-1/3 p-8 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-white mb-4">{t('home_market_area', 'MARKET AREA')}</h2>
            <p className="text-white text-base mb-2">
              {t('home_market_area_desc', 'Our products are exported to Europe, South America, North America, Africa, Asia, and the Middle East, etc.')}
            </p>
          </div>
          {/* 右侧五大洲icon分布 */}
          <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-6 p-8 bg-cover bg-center" style={{backgroundImage: 'url(https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80)'}}>
            {/* 非洲 */}
            <div className="flex flex-col items-center">
              <img src="/images/africa.svg" alt="Africa" className="w-20 h-20 mb-2" />
              <div className="text-white font-bold text-lg">{t('home_five_continents', 'FIVE CONTINENTS')}</div>
              <div className="text-white text-sm">{t('home_africa', 'Africa')}</div>
            </div>
                         {/* 亚洲 */}
             <div className="flex flex-col items-center">
               <img src="/images/asia.svg" alt="Asia" className="w-20 h-20 mb-2" />
               <div className="text-white font-bold text-lg">{t('home_five_continents', 'FIVE CONTINENTS')}</div>
               <div className="text-white text-sm">{t('home_asia', 'Asia')}</div>
             </div>
             {/* 北美洲 */}
             <div className="flex flex-col items-center">
               <img src="/images/north-america.svg" alt="North America" className="w-20 h-20 mb-2" />
               <div className="text-white font-bold text-lg">{t('home_five_continents', 'FIVE CONTINENTS')}</div>
               <div className="text-white text-sm">{t('home_north_america', 'North America')}</div>
             </div>
             {/* 南美洲 */}
             <div className="flex flex-col items-center">
               <img src="/images/south-america.svg" alt="South America" className="w-20 h-20 mb-2" />
               <div className="text-white font-bold text-lg">{t('home_five_continents', 'FIVE CONTINENTS')}</div>
               <div className="text-white text-sm">{t('home_south_america', 'South America')}</div>
             </div>
             {/* 澳大利亚 */}
             <div className="flex flex-col items-center">
               <img src="/images/australia.svg" alt="Australia" className="w-20 h-20 mb-2" />
               <div className="text-white font-bold text-lg">{t('home_five_continents', 'FIVE CONTINENTS')}</div>
               <div className="text-white text-sm">{t('home_australia', 'Australia')}</div>
             </div>
          </div>
        </div>
      </section>

      {/* Product Advantages Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 animate-slide-in-left">
              {t('advantages_title', 'Our Advantages')}
            </h2>
            <p className="text-lg text-gray-600 animate-slide-in-right">
              {t('advantages_subtitle', 'Discover what makes us the preferred choice')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advantages.map((advantage, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow card-hover">
                <div className="text-3xl mb-3 animate-bounce">{advantage.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {advantage.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {advantage.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 animate-slide-in-left">
            {t('home_quote_title', 'Request A Free Quote')}
          </h2>
          <p className="text-lg mb-6 animate-slide-in-right">
            {t('home_quote_subtitle', 'You can contact us any way that is convenient for you. Lingye Provide Services 24/7 via fax, email or telephone.')}
          </p>
          <button 
            onClick={() => setIsInquiryModalOpen(true)}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg text-base font-semibold hover:bg-gray-100 transition-colors pulse"
          >
            {t('btn_contact_us', 'Contact Us')}
          </button>
        </div>
      </section>

      {/* Inquiry Form Modal */}
      {isInquiryModalOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto"
          onClick={() => setIsInquiryModalOpen(false)}
        >
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            style={{ animation: 'fadeIn 0.3s ease-out' }}
          ></div>
          
          {/* 弹窗内容 */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div 
              className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
              style={{ animation: 'slideUp 0.3s ease-out' }}
            >
              {/* 关闭按钮 */}
              <button
                onClick={() => setIsInquiryModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 bg-white rounded-full p-2 hover:bg-gray-100 shadow-md"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* 表单内容 */}
              <InquiryForm 
                onSuccess={() => {
                  setTimeout(() => {
                    setIsInquiryModalOpen(false);
                  }, 2000); // 2秒后自动关闭，让用户看到成功消息
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 添加动画样式 */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* 悬浮联系按钮 */}
      <FloatingContactButtons />
    </div>
  );
};

export default Home; 