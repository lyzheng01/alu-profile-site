import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { resolveMediaUrl } from '../utils/url';
import { useTranslation } from '../contexts/TranslationContext';
import CountUp from 'react-countup';
import FloatingContactButtons from '../components/FloatingContactButtons';
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

  // 设置页面标题
  usePageTitle('home');

  // 幻灯片数据 - 使用实际图片
  const slides = [
    {
      title: t('slide_1_title', 'LingYe Aluminum'),
      subtitle: t('slide_1_subtitle', 'High-quality solutions for your needs'),
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=600&fit=crop',
      cta: t('slide_1_cta', 'Learn More')
    },
    {
      title: t('slide_2_title', 'Global Export Experience'),
      subtitle: t('slide_2_subtitle', 'Serving 30+ countries worldwide'),
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&h=600&fit=crop',
      cta: t('slide_2_cta', 'View Products')
    },
    {
      title: t('slide_3_title', 'Advanced Technology'),
      subtitle: t('slide_3_subtitle', 'Innovative manufacturing processes'),
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&h=600&fit=crop',
      cta: t('slide_3_cta', 'Contact Us')
    }
  ];

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
  const scrollRef = useRef<HTMLDivElement>(null);
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
        setCategories(list);
      })
      .catch(() => {
        setCategories([]);
      });
  }, []);

  // 自动滚动逻辑
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollBy({ left: 320 + 24, behavior: 'smooth' }); // 卡片宽+间距
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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

      {/* 产品种类（Product Categories）Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 animate-slide-in-left">
              {t('home_product_categories_title', 'Product Categories')}
            </h2>
            <p className="text-lg text-gray-600 animate-slide-in-right">
              {t('home_product_categories_subtitle', 'Explore our main product categories')}
            </p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/${currentLanguage}/products?category=${cat.id}`}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow flex flex-col items-center p-8 cursor-pointer"
              >
                <img
                  src={resolveMediaUrl(cat.image) || '/images/category1.jpg'}
                  alt={cat.name}
                  className="h-56 w-56 md:h-64 md:w-64 object-cover mb-6 rounded-full border-2 border-gray-200"
                />
                <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 新产品（New Products）Section - 全屏显示 */}
      <section className="py-16 bg-gray-50 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 animate-slide-in-left">
              {t('home_new_products_title', 'New Products')}
            </h2>
            <p className="text-xl text-gray-600 animate-slide-in-right">
              {t('home_new_products_subtitle', 'Latest high-quality products')}
            </p>
          </div>
          <div className="relative">
            {/* 滚动按钮 */}
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition-colors"
              onClick={() => {
                if (scrollRef.current) scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
              }}
              style={{display: 'block'}}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition-colors"
              onClick={() => {
                if (scrollRef.current) scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
              }}
              style={{display: 'block'}}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
            {/* 横向滚动容器 */}
            <div
              ref={scrollRef}
              className="flex space-x-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 py-4 px-4"
              style={{scrollBehavior: 'smooth'}}
            >
                             {featuredProducts.map((prod, idx) => (
                 <div key={prod.id || idx} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col min-w-[320px] max-w-[320px] transform hover:scale-105">
                   <img 
                    src={resolveMediaUrl(prod.product_image)} 
                     alt={prod.name} 
                     className="w-full h-64 object-cover" 
                   />
                   <div className="p-6">
                     <h3 className="text-xl font-semibold text-gray-900 text-center truncate w-full">{prod.name}</h3>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* 工厂展示区块 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 标题和副标题 */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('home_explore_company_title', 'Explore Our Company')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('home_explore_company_subtitle', 'From production and product offerings to inventory, see how we bring quality to life.')}
            </p>
          </div>
          
          {/* 工厂展示图片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 工厂场景 1 - 生产设备 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-500 text-sm">{t('home_factory_production_line', 'Factory Production Line')}</p>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home_production_equipment', 'Production Equipment')}</h3>
                <p className="text-gray-600 text-sm">{t('home_production_equipment_desc', 'Advanced manufacturing facilities with cutting-edge technology')}</p>
              </div>
            </div>

            {/* 工厂场景 2 - 产品存储 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-500 text-sm">{t('home_product_storage', 'Product Storage')}</p>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home_inventory_management', 'Inventory Management')}</h3>
                <p className="text-gray-600 text-sm">{t('home_inventory_management_desc', 'Organized storage facilities with efficient inventory control')}</p>
              </div>
            </div>

            {/* 工厂场景 3 - 质量控制 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-500 text-sm">{t('home_quality_control', 'Quality Control')}</p>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home_quality_assurance', 'Quality Assurance')}</h3>
                <p className="text-gray-600 text-sm">{t('home_quality_assurance_desc', 'Strict quality control processes ensuring product excellence')}</p>
              </div>
            </div>

            {/* 工厂场景 4 - 包装区域 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-500 text-sm">{t('home_packaging_area', 'Packaging Area')}</p>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home_packaging_shipping', 'Packaging & Shipping')}</h3>
                <p className="text-gray-600 text-sm">{t('home_packaging_shipping_desc', 'Professional packaging and logistics for global delivery')}</p>
              </div>
            </div>

            {/* 工厂场景 5 - 物流运输 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-500 text-sm">{t('home_logistics_shipping', 'Logistics & Shipping')}</p>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home_global_logistics', 'Global Logistics')}</h3>
                <p className="text-gray-600 text-sm">{t('home_global_logistics_desc', 'Efficient shipping and delivery to customers worldwide')}</p>
              </div>
            </div>

            {/* 工厂场景 6 - 研发中心 */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-64 bg-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <p className="text-gray-500 text-sm">{t('home_rd_center', 'R&D Center')}</p>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('home_research_development', 'Research & Development')}</h3>
                <p className="text-gray-600 text-sm">{t('home_research_development_desc', 'Innovation center for new product development')}</p>
              </div>
            </div>
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
                end={29} 
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
                end={80} 
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
                end={1000} 
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
              {t('home_market_area_desc', 'Shengxin is located in Xuancheng City, Anhui Province, China, which is 100km from Wuhu port and 350km from Shanghai port. Our products are exported to America, Africa, Asia, Europe and the Middle East.')}
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
            {t('home_quote_subtitle', 'You can contact us any way that is convenient for you. Shengxin Provide Services 24/7 via fax, email or telephone.')}
          </p>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg text-base font-semibold hover:bg-gray-100 transition-colors pulse">
            {t('btn_contact_us', 'Contact Us')}
          </button>
        </div>
      </section>

      {/* 悬浮联系按钮 */}
      <FloatingContactButtons />
    </div>
  );
};

export default Home; 