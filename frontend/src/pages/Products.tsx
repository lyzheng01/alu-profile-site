import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import FloatingContactButtons from '../components/FloatingContactButtons';
import { usePageTitle } from '../hooks/usePageTitle';
import { useTranslation } from '../contexts/TranslationContext';
import { resolveMediaUrl } from '../utils/url';

interface Product {
  id: number;
  name: string;
  description: string;
  category: {
    id: number;
    name: string;
  };
  subcategory?: {
    id: number;
    name: string;
  };
  features: string; // 改为字符串，因为后端存储的是字符串
  applications: string; // 改为字符串，因为后端存储的是字符串
  specifications: Record<string, any>;
  images: Array<{
    id: number;
    image: string;
    caption?: string;
    is_primary?: boolean;
    order?: number;
  }>;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  subcategories?: SubCategory[];
}

interface SubCategory {
  id: number;
  name: string;
  description: string;
  parent_category: number;
}

const Products: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState('zh'); // 默认中文
  const [searchParams, setSearchParams] = useSearchParams();

  // 获取当前语言
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'zh';
    setCurrentLanguage(savedLanguage);
  }, []);

  // 设置页面标题
  usePageTitle('products');

  // 从URL参数获取分类ID和子分类ID
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const subcategoryParam = searchParams.get('subcategory');
    if (categoryParam) {
      setSelectedCategory(Number(categoryParam));
    }
    if (subcategoryParam) {
      setSelectedSubcategory(Number(subcategoryParam));
    }
  }, [searchParams]);

  // 获取产品数据
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PRODUCTS}?lang=${currentLanguage}`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data.results || data);
        }
      } catch (error) {
        console.error('获取产品数据失败:', error);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.CATEGORIES}?lang=${currentLanguage}&include_subcategories=true`);
        if (response.ok) {
          const data = await response.json();
          const list = (data.results || data).map((item: any) => ({
            id: item.id,
            name: item.translated_name || item.name,
            description: item.translated_description || item.description,
            subcategories: item.subcategories ? item.subcategories.map((sub: any) => ({
              id: sub.id,
              name: sub.translated_name || sub.name,
              description: sub.translated_description || sub.description,
              parent_category: sub.parent_category,
            })) : [],
          }));
          setCategories(list);
        }
      } catch (error) {
        console.error('获取分类数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    fetchCategories();
  }, [currentLanguage]); // 当语言改变时重新获取数据

  const activeCategory = selectedCategory ? categories.find(c => c.id === selectedCategory) : null;
  const activeSubcategory = selectedSubcategory ? activeCategory?.subcategories?.find(s => s.id === selectedSubcategory) : null;

  // 页面仅通过URL参数设置分类，不提供页面内切换控件

  // 过滤产品（按分类和子分类筛选）
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === null || product.category.id === selectedCategory;
    const matchesSubcategory = selectedSubcategory === null || product.subcategory?.id === selectedSubcategory;
    return matchesCategory && matchesSubcategory;
  });

  // 将字符串转换为数组（用于显示）
  const parseFeatures = (features: string): string[] => {
    if (!features) return [];
    // 尝试按换行符分割，如果没有换行符则按逗号分割
    return features.split(/\n|,|、/).filter(item => item.trim());
  };

  if (loading) {
    return (
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('status_loading', 'Loading...')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      {/* 页面标题 */}
      <div 
        className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=400&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* 背景遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-blue-800/80"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('products_page_title', 'Product Center')}
            </h1>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              {t('products_page_subtitle', 'Comprehensive product line to meet various application requirements')}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">

        {/* 分类文字说明（在产品前展示） */}
        {activeCategory && (
          <div className="mb-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              {activeCategory.name}
              {activeSubcategory && (
                <span className="text-2xl md:text-3xl text-blue-600 ml-2">
                  - {activeSubcategory.name}
                </span>
              )}
            </h2>
            {(activeCategory.description || activeSubcategory?.description) && (
              <p className="text-gray-700 leading-relaxed whitespace-pre-line max-w-3xl mx-auto">
                {activeSubcategory?.description || activeCategory.description}
              </p>
            )}
          </div>
        )}

        {/* 产品列表 */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('products_no_products', 'No products found')}</p>
            <p className="text-gray-400 mt-2">{t('products_no_products_desc', 'Please add product information in the backend first')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 product-grid">
            {filteredProducts.map(product => {
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer product-card"
                  onClick={() => window.location.href = `/${currentLanguage}/products/${product.id}`}
                >
                  {/* 产品图片 - 占据主要空间 */}
                  <div className="h-64 bg-gray-100 overflow-hidden relative product-image-container">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={resolveMediaUrl(product.images.find(img => img.is_primary)?.image || product.images[0].image)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 to-gray-100">
                        <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* 产品信息 - 简洁布局 */}
                  <div className="p-4 text-center">
                    {/* 产品名称 - 居中显示 */}
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 产品统计 */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            {t('products_found_count', 'Found {count} products').replace('{count}', filteredProducts.length.toString())}
          </p>
        </div>
      </div>

      {/* 悬浮联系按钮 */}
      <FloatingContactButtons />
    </div>
  );
};

export default Products; 