import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import FloatingContactButtons from '../components/FloatingContactButtons';
import { useTranslation } from '../contexts/TranslationContext';
import { resolveMediaUrl } from '../utils/url';
import { useSeoMeta } from '../hooks/useSeoMeta';
import { useStructuredData } from '../hooks/useStructuredData';

interface Product {
  id: number;
  slug: string;
  name?: string; // 中文时使用
  translated_name?: string; // 非中文时使用
  description?: string;
  translated_description?: string;
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
  range_param?: string;
  surface_treatment?: string;
  grade?: string;
  temper?: string;
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
  slug: string;
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

const CATEGORY_COPY: Record<string, Record<string, string>> = {
 en: {'cabinet-profiles':'Profiles for cabinet doors and wardrobes. Check the section, panel fit, finish, and assembly before requesting a quote.','industrial-profiles':'For equipment frames and automation. Match section to load and connections; confirm alloy and finish.','t-slot-profiles':'For modular frames. Confirm slot series, connectors, fasteners, and cut list.','windows-doors':'For window and door systems. Confirm opening, glazing, thermal break, hardware, and local requirements.','standard-aluminium-profiles':'For general fabrication. Share a drawing or standard to check alloy, dimensions, and tolerances.'},
 zh: {'cabinet-profiles':'适用于柜门和衣柜系统。询价前核对截面、板材适配、表面处理和装配方式。','industrial-profiles':'适用于设备框架和自动化结构。结合承载与连接方式选截面，并确认合金状态和表面处理。','t-slot-profiles':'适用于模块化框架。先确认槽口系列、连接件、紧固件和下料尺寸。','windows-doors':'适用于门窗系统。确认开启方式、玻璃、隔热条、五金及项目所在地规范。','standard-aluminium-profiles':'适用于通用加工。提供截面图或标准号，便于核对尺寸、合金状态和公差。'},
 es: {'cabinet-profiles':'Para armarios. Compruebe sección, panel, acabado y montaje antes de cotizar.','industrial-profiles':'Para equipos y automatización. Defina carga y conexiones; confirme aleación y acabado.','t-slot-profiles':'Para estructuras modulares. Confirme ranura, conectores, fijaciones y lista de corte.','windows-doors':'Para ventanas y puertas. Confirme apertura, vidrio, aislamiento, herrajes y normas locales.','standard-aluminium-profiles':'Para fabricación general. Envíe plano o norma para revisar aleación, medidas y tolerancias.'},
 pt: {'cabinet-profiles':'Para armários. Confira seção, painel, acabamento e montagem antes do orçamento.','industrial-profiles':'Para equipamentos e automação. Defina carga e conexões; confirme liga e acabamento.','t-slot-profiles':'Para estruturas modulares. Confirme canal, conectores, fixadores e plano de corte.','windows-doors':'Para janelas e portas. Confirme abertura, vidro, isolamento, ferragens e normas locais.','standard-aluminium-profiles':'Para fabricação geral. Envie desenho ou norma para conferir liga, dimensões e tolerâncias.'}
};
const Products: React.FC = () => {
  const { lang: routeLanguage = 'en', categorySlug } = useParams<{ lang: string; categorySlug: string }>();
  const { pathname } = useLocation();
  const pathLanguage = pathname.split('/').filter(Boolean)[0];
  const urlLanguage = pathLanguage && ['en', 'zh', 'es', 'pt'].includes(pathLanguage) ? pathLanguage : routeLanguage;
  const navigate = useNavigate();
  const { t, currentLanguage: translationLanguage } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState(urlLanguage);
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryDescription = categorySlug ? CATEGORY_COPY[currentLanguage]?.[categorySlug] : undefined;
  const categoryLabel = categories.find((category) => category.slug === categorySlug)?.name || categorySlug || '';
  const fallbackProductImage = 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=900&h=700&fit=crop';
  const cleanEnglishCopy = (value?: string) =>
    (value || '')
      .replace(/\bProfle\b/g, 'Profile')
      .replace(/\bIndustry Profile\b/g, 'Industrial Profile')
      .trim();
  const cleanMediaUrl = (value?: string) => {
    const resolved = resolveMediaUrl(value);
    if (!resolved) return '';
    return resolved
      .replace(/^http:\/\/lingyealu\.cn/i, 'https://lingyealu.com')
      .replace(/^https:\/\/lingyealu\.cn/i, 'https://lingyealu.com');
  };

  // 获取当前语言
  useEffect(() => {
    setCurrentLanguage(urlLanguage);
    localStorage.setItem('language', urlLanguage);
  }, [urlLanguage]);

  useSeoMeta({
    canonicalPath: categorySlug ? '/' + currentLanguage + '/products/category/' + categorySlug : '/' + currentLanguage + '/products',
    title: categorySlug ? categoryLabel + ' | LingYe Aluminum' : 'Aluminum Profile Product Catalog | LingYe Aluminum',
    description: categoryDescription || 'Browse architectural, industrial, trim, tube, and custom aluminum extrusion profiles with alloy, temper, finish, and RFQ details for export buyers.',
    ogTitle: categorySlug ? categoryLabel + ' | LingYe Aluminum' : 'LingYe Aluminum Product Catalog',
    ogDescription: categoryDescription || 'Find aluminum profiles for windows, doors, industrial framing, trim, tubes, and OEM extrusion projects.',
    ogImage: 'https://lingyealu.com/logo.jpg?v=3',
    language: currentLanguage,
  });

  const collectionStructuredData = React.useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: categorySlug ? categoryLabel : 'Aluminum Profile Product Catalog | LingYe Aluminum',
    description: categoryDescription || 'Browse architectural, industrial, trim, tube, and custom aluminum extrusion profiles.',
    isPartOf: { '@type': 'WebSite', name: 'LingYe Aluminum', url: 'https://lingyealu.com' },
  }), [categorySlug, categoryLabel, categoryDescription]);

  useStructuredData('products-collection', collectionStructuredData);

  const breadcrumbStructuredData = React.useMemo(() => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://lingyealu.com';
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: base + '/' + currentLanguage },
        { '@type': 'ListItem', position: 2, name: 'Products', item: base + '/' + currentLanguage + '/products' },
        ...(categorySlug ? [{ '@type': 'ListItem', position: 3, name: categoryLabel, item: base + '/' + currentLanguage + '/products/category/' + categorySlug }] : []),
      ],
    };
  }, [currentLanguage, categorySlug, categoryLabel]);

  useStructuredData('products-breadcrumb', breadcrumbStructuredData);

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

  const handleCategorySelect = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
    if (categoryId === null) {
      setSearchParams({});
    } else {
      setSearchParams({ category: String(categoryId) });
    }
  };

  // 获取产品数据
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let nextUrl: string | null = API_ENDPOINTS.PRODUCTS + '?lang=' + currentLanguage;
        const allProducts: any[] = [];
        while (nextUrl) {
          const response: Response = await fetch(nextUrl);
          if (!response.ok) break;
          const data = await response.json();
          if (Array.isArray(data)) { allProducts.push(...data); break; }
          allProducts.push(...(data.results || []));
          if (!data.next) break;
          const next = new URL(data.next, window.location.origin);
          nextUrl = window.location.origin + next.pathname + next.search;
        }
        setProducts(allProducts.map((product: Product) => ({
          ...product,
          translated_name: cleanEnglishCopy(product.translated_name),
          name: cleanEnglishCopy(product.name),
          translated_description: cleanEnglishCopy(product.translated_description),
          description: cleanEnglishCopy(product.description),
          category: { ...product.category, name: cleanEnglishCopy(product.category?.name) },
        })));

      } catch (error) {
        console.error('获取产品数据失败:', error);
      } finally {
        setProductsLoaded(true);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.CATEGORIES}?lang=${currentLanguage}&include_subcategories=true`);
        if (response.ok) {
          const data = await response.json();
          const list = (data.results || data).map((item: any) => ({
            id: item.id,
            slug: item.slug,
            name: cleanEnglishCopy(item.translated_name || item.name),
            description: cleanEnglishCopy(item.translated_description || item.description),
            subcategories: item.subcategories ? item.subcategories.map((sub: any) => ({
              id: sub.id,
              name: cleanEnglishCopy(sub.translated_name || sub.name),
              description: cleanEnglishCopy(sub.translated_description || sub.description),
              parent_category: sub.parent_category,
            })) : [],
          }));
          setCategories(list);
        }
      } catch (error) {
        console.error('获取分类数据失败:', error);
      }
    };

    setLoading(true);
    setProductsLoaded(false);
    Promise.all([fetchProducts(), fetchCategories()]).finally(() => setLoading(false));
  }, [currentLanguage]); // 当语言改变时重新获取数据

  const routeCategory = categorySlug ? categories.find(c => c.slug === categorySlug) : null;
  const effectiveCategoryId = categorySlug ? routeCategory?.id ?? null : selectedCategory;
  const activeCategory = effectiveCategoryId ? categories.find(c => c.id === effectiveCategoryId) : null;
  const activeSubcategory = selectedSubcategory ? activeCategory?.subcategories?.find(s => s.id === selectedSubcategory) : null;

  // 过滤产品（按分类和子分类筛选）
  const filteredProducts = products.filter(product => {
    const matchesCategory = effectiveCategoryId === null || product.category.id === effectiveCategoryId;
    const matchesSubcategory = selectedSubcategory === null || product.subcategory?.id === selectedSubcategory;
    return matchesCategory && matchesSubcategory;
  });

  const getProductTitle = (product: Product) => product.translated_name || product.name || 'Aluminum Profile';
  const getProductDescription = (product: Product) =>
    product.translated_description || product.description || 'Custom aluminum extrusion profile with export-ready production support.';
  const getProductImage = (product: Product) =>
    cleanMediaUrl(product.images?.find(img => img.is_primary)?.image || product.images?.[0]?.image) || fallbackProductImage;

  if (loading) {
    return (
      <div>
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
    <div data-testid="products-page" data-products-loaded={productsLoaded ? 'true' : 'false'} data-translation-language={translationLanguage} className="bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1600&h=650&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(2,6,23,0.92),rgba(12,74,110,0.74),rgba(15,23,42,0.70))]" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-200">{t('products_catalog_label', 'Product catalog')}</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
              {categorySlug ? categoryLabel : t('products_center_title', 'Aluminum Products Center')}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-100">
              {categoryDescription || t('products_center_desc', 'Browse our aluminum profile range and check specifications before sending a drawing or RFQ.')}
            </p>
          </div>
          <div className="mt-8 grid gap-4 text-sm text-slate-100 sm:grid-cols-3">
            <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">{t('products_feature_custom', 'Custom extrusion and OEM projects')}</div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">{t('products_feature_finish', 'Anodizing, powder coating, and CNC support')}</div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">{t('products_feature_export', 'Export packaging and shipping planning')}</div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{t('products_browse_title', 'Browse by profile type')}</h2>
              <p className="mt-1 text-sm text-slate-600">{t('products_browse_desc', 'Filter by category first, then open a product page for specifications and inquiry details.')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => categorySlug ? navigate('/' + currentLanguage + '/products') : handleCategorySelect(null)}
                className={`min-h-[44px] rounded-lg border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  effectiveCategoryId === null
                    ? 'border-sky-700 bg-sky-700 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-sky-400 hover:text-sky-700'
                }`}
              >
                {t('product_detail_all_products', 'All Products')}
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => navigate('/' + currentLanguage + '/products/category/' + category.slug)}
                  className={`min-h-[44px] rounded-lg border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    effectiveCategoryId === category.id
                      ? 'border-sky-700 bg-sky-700 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-sky-400 hover:text-sky-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 分类文字说明（在产品前展示） */}
        {activeCategory && (
          <div className="mb-8 rounded-xl border border-sky-100 bg-white p-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-3">
              {activeCategory.name}
              {activeSubcategory && (
                <span className="text-xl md:text-2xl text-sky-700 ml-2">
                  - {activeSubcategory.name}
                </span>
              )}
            </h2>
            {(categoryDescription || activeCategory.description || activeSubcategory?.description) && (
              <p className="text-slate-600 leading-7 whitespace-pre-line max-w-4xl">
                {categoryDescription || activeSubcategory?.description || activeCategory.description}
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 product-grid">
            {filteredProducts.map(product => {
              return (
                <article
                  key={product.id}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <Link to={`/${currentLanguage}/products/${product.slug}`} className="block">
                    <div className="h-64 bg-slate-100 overflow-hidden relative product-image-container flex-shrink-0">
                      <img
                        src={getProductImage(product)}
                        alt={getProductTitle(product)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow">
                        {product.category?.name || t('product_detail_aluminum_profile', 'Aluminum Profile')}
                      </div>
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-semibold leading-7 text-slate-900 group-hover:text-sky-700 line-clamp-2">
                      {getProductTitle(product)}
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                      {getProductDescription(product)}
                    </p>
                    <dl className="mt-5 grid gap-3 text-sm">
                      {product.range_param && (
                        <div className="rounded-lg bg-slate-50 p-3">
                          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t('products_range', 'Range')}</dt>
                          <dd className="mt-1 text-slate-900">{product.range_param}</dd>
                        </div>
                      )}
                      {(product.grade || product.temper) && (
                        <div className="rounded-lg bg-slate-50 p-3">
                          <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t('products_alloy_temper', 'Alloy / Temper')}</dt>
                          <dd className="mt-1 text-slate-900">{[product.grade, product.temper].filter(Boolean).join(' / ')}</dd>
                        </div>
                      )}
                    </dl>
                    <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row">
                      <Link
                        to={`/${currentLanguage}/products/${product.slug}`}
                        className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        View Details
                      </Link>
                      <Link
                        to={`/${currentLanguage}/products/${product.id}#inquiry`}
                        className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-sky-200 px-4 py-2 text-sm font-semibold text-sky-800 transition hover:border-sky-500 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        Send RFQ
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* 产品统计 */}
        <div className="mt-12 text-center">
          <p className="text-slate-600">
            {t('products_found_count', 'Found {count} products').replace('{count}', filteredProducts.length.toString())}
          </p>
        </div>

        {currentLanguage === 'en' && (
          <div className="mt-10 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Buying Guides</h2>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <Link className="text-blue-700 hover:text-blue-900 underline" to="/en/aluminum-profile-supplier-for-construction-projects">
                Aluminum Profile Supplier for Construction Projects
              </Link>
              <Link className="text-blue-700 hover:text-blue-900 underline" to="/en/industrial-aluminum-extrusion-manufacturer-in-china">
                Industrial Aluminum Extrusion Manufacturer in China
              </Link>
              <Link className="text-blue-700 hover:text-blue-900 underline" to="/en/custom-aluminum-profile-factory-for-oem-orders">
                Custom Aluminum Profile Factory for OEM Orders
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 悬浮联系按钮 */}
      <FloatingContactButtons />
    </div>
  );
};

export default Products; 
