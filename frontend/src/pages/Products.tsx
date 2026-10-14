import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import FloatingContactButtons from '../components/FloatingContactButtons';
import FactoryShowcase from '../components/FactoryShowcase';
import { useTranslation } from '../contexts/TranslationContext';
import { resolveMediaUrl } from '../utils/url';
import { useSeoMeta } from '../hooks/useSeoMeta';
import { SITE_ORIGIN } from '../config/site';
import { useStructuredData } from '../hooks/useStructuredData';
import { getProductCatalogMeta, getProductCategoryGuide, getProductCategoryLabel } from '../data/productCategoryGuides';
import { getSeoLocaleLabels } from '../data/seoLocaleLabels';

interface Product {
  id: number;
  slug: string;
  name?: string; // 中文时使用
  translated_name?: string; // 非中文时使用
  description?: string;
  translated_description?: string;
  category: {
    id: number;
    slug?: string;
    name: string;
    translated_name?: string;
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
  slug?: string;
  name: string;
  description: string;
  image?: string;
  subcategories?: SubCategory[];
}

interface SubCategory {
  id: number;
  name: string;
  description: string;
  parent_category: number;
}

const Products: React.FC = () => {
  const translationContext = useTranslation();
  const { t } = translationContext;
  const currentLanguage = translationContext.currentLanguage || (
    typeof window === 'undefined' ? 'en' : localStorage.getItem('language') || 'en'
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [productsReady, setProductsReady] = useState(false);
  const [categoriesReady, setCategoriesReady] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const navigate = useNavigate();
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
      .replace(/^http:\/\/lingyealu\.cn/i, SITE_ORIGIN)
      .replace(/^https:\/\/lingyealu\.cn/i, SITE_ORIGIN);
  };

  const categoryGuideSlug = categorySlug || (searchParams.get('category') === '4' ? 'windows-doors' : undefined);
  const categoryGuide = categoryGuideSlug ? getProductCategoryGuide(categoryGuideSlug, currentLanguage) : null;
  const catalogMeta = getProductCatalogMeta(currentLanguage);
  const seoLabels = getSeoLocaleLabels(currentLanguage);
  const resolvedCategoryId = categorySlug ? categories.find((category) => category.slug === categorySlug)?.id : null;
  const categoryFilterReady = !categorySlug || resolvedCategoryId === null || selectedCategory === resolvedCategoryId;
  const catalogReady = productsReady && categoriesReady && categoryFilterReady;

  useSeoMeta({
    canonicalPath: categoryGuide
      ? `/${currentLanguage}/products/category/${categoryGuideSlug}`
      : `/${currentLanguage}/products`,
    title: categoryGuide?.metaTitle || catalogMeta.title,
    description: categoryGuide?.metaDescription || catalogMeta.description,
    ogTitle: categoryGuide?.metaTitle || catalogMeta.title,
    ogDescription: categoryGuide?.metaDescription || catalogMeta.description,
    ogImage: `${SITE_ORIGIN}/logo.jpg?v=3`,
    language: currentLanguage,
    robots: searchParams.has('subcategory') ? 'noindex,follow' : undefined,
  });

  const collectionStructuredData = React.useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: categoryGuide?.title || catalogMeta.title,
    description: categoryGuide?.metaDescription || catalogMeta.description,
    isPartOf: { '@type': 'WebSite', name: 'LingYe Aluminum', url: SITE_ORIGIN },
  }), [categoryGuide, catalogMeta]);

  useStructuredData('products-collection', collectionStructuredData);

  const breadcrumbStructuredData = React.useMemo(() => {
    const base = typeof window !== 'undefined' ? window.location.origin : SITE_ORIGIN;
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: seoLabels.home, item: `${base}/${currentLanguage}` },
        { '@type': 'ListItem', position: 2, name: categoryGuide ? categoryGuide.title : seoLabels.products, item: `${base}${categoryGuide ? `/${currentLanguage}/products/category/${categoryGuideSlug}` : `/${currentLanguage}/products`}` },
      ],
    };
  }, [currentLanguage, categoryGuide, categoryGuideSlug, seoLabels]);

  useStructuredData('products-breadcrumb', breadcrumbStructuredData);

  // 从URL参数获取分类ID和子分类ID
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const subcategoryParam = searchParams.get('subcategory');
    if (categorySlug) {
      const matchedCategory = categories.find((category) => category.slug === categorySlug);
      if (matchedCategory) setSelectedCategory(matchedCategory.id);
      setSelectedSubcategory(null);
      return;
    }
    setSelectedCategory(categoryParam ? Number(categoryParam) : null);
    setSelectedSubcategory(subcategoryParam ? Number(subcategoryParam) : null);
  }, [searchParams, categorySlug, categories]);

  const handleCategorySelect = (categoryId: number | null) => {
    if (categoryId === null) {
      navigate(`/${currentLanguage}/products`);
    } else {
      const category = categories.find((item) => item.id === categoryId);
      if (category?.slug) {
        navigate(`/${currentLanguage}/products/category/${category.slug}`);
      } else {
        navigate(`/${currentLanguage}/products?category=${categoryId}`);
      }
    }
  };

  // 获取产品数据
  useEffect(() => {
    setProductsReady(false);
    setCategoriesReady(false);
    const fetchProducts = async () => {
      try {
        let nextUrl: string | null = `${API_ENDPOINTS.PRODUCTS}?lang=${currentLanguage}`;
        const allProducts: Product[] = [];

        while (nextUrl) {
          const response: Response = await fetch(nextUrl);
          if (!response.ok) break;

          const data = await response.json();
          allProducts.push(...(Array.isArray(data) ? data : data.results || []));
          nextUrl = Array.isArray(data) ? null : data.next;
        }

        setProducts(allProducts.map((product: Product) => ({
          ...product,
          translated_name: cleanEnglishCopy(product.translated_name),
          name: cleanEnglishCopy(product.name),
          translated_description: cleanEnglishCopy(product.translated_description),
          description: cleanEnglishCopy(product.description),
          category: {
            ...product.category,
            name: getProductCategoryLabel(
              product.category?.slug,
              currentLanguage,
              cleanEnglishCopy(product.category?.translated_name || product.category?.name)
            ),
          },
        })));
      } catch (error) {
        console.error('获取产品数据失败:', error);
      } finally {
        setProductsReady(true);
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
            name: getProductCategoryLabel(item.slug, currentLanguage, cleanEnglishCopy(item.translated_name || item.name)),
            description: cleanEnglishCopy(item.translated_description || item.description),
            image: item.image,
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
      } finally {
        setCategoriesReady(true);
        setLoading(false);
      }
    };

    fetchProducts();
    fetchCategories();
  }, [currentLanguage]); // 当语言改变时重新获取数据

  const activeCategory = selectedCategory ? categories.find(c => c.id === selectedCategory) : null;
  const activeSubcategory = selectedSubcategory ? activeCategory?.subcategories?.find(s => s.id === selectedSubcategory) : null;

  // 过滤产品（按分类和子分类筛选）
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === null || product.category.id === selectedCategory;
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
    <div data-testid="products-page" data-products-ready={catalogReady ? 'true' : 'false'} className="bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-45"
          style={{
            backgroundImage: categoryGuide
              ? 'none'
              : `url('https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=1600&h=650&fit=crop')`,
          }}
        />
        {!categoryGuide && <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(2,6,23,0.92),rgba(12,74,110,0.74),rgba(15,23,42,0.70))]" />}
        <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className={categoryGuide ? 'grid items-center gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(16rem,0.7fr)]' : ''}>
            <div className={categoryGuide ? 'max-w-3xl' : 'max-w-4xl'}>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-200">{t('products_catalog_label', 'Product catalog')}</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-5xl">
                {categoryGuide?.title || t('products_center_title', 'Aluminum Profile Product Center')}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-100">
                {categoryGuide?.intro || t('products_center_desc', 'Find architectural, industrial, trim, tube, and custom extrusion profiles with the details buyers need before sending drawings or RFQs.')}
              </p>
            </div>
            {categoryGuide && (
              <figure className="mx-auto w-full max-w-sm">
                <div className="overflow-hidden bg-white">
                  <img
                    src={categoryGuideSlug === 'windows-doors'
                      ? '/images/thermal-break-window-system.webp'
                      : categories.find((category) => category.slug === categoryGuideSlug)?.image || fallbackProductImage}
                    alt={categoryGuide.heroImageAlt}
                    className="block h-auto w-full object-contain"
                    width="343"
                    height="343"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
                {categoryGuide.heroImageNote && <figcaption className="mt-2 text-xs leading-5 text-slate-300">{categoryGuide.heroImageNote}</figcaption>}
              </figure>
            )}
          </div>
          <div className="mt-8 grid gap-4 text-sm text-slate-100 sm:grid-cols-3">
            <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">{t('products_feature_custom', 'Custom extrusion and OEM projects')}</div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">{t('products_feature_finish', 'Anodizing, powder coating, CNC support')}</div>
            <div className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur">{t('products_feature_export', 'Export packaging and shipment planning')}</div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">{t('products_browse_title', 'Browse by profile type')}</h2>
              <p className="mt-1 text-sm text-slate-600">{t('products_browse_desc', 'Use categories as a fast starting point, then open a product page for parameters and RFQ details.')}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleCategorySelect(null)}
                className={`min-h-[44px] rounded-lg border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  selectedCategory === null
                    ? 'border-sky-700 bg-sky-700 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-sky-400 hover:text-sky-700'
                }`}
              >
                {t('product_detail_all_products', 'All Products')}
              </button>
              {categories.map((category) => {
                const className = `min-h-[44px] rounded-lg border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    selectedCategory === category.id
                      ? 'border-sky-700 bg-sky-700 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-sky-400 hover:text-sky-700'
                  }`;
                return category.slug ? (
                  <Link
                    key={category.id}
                    to={`/${currentLanguage}/products/category/${category.slug}`}
                    aria-current={categoryGuideSlug === category.slug ? 'page' : undefined}
                    className={className}
                  >
                    {category.name}
                  </Link>
                ) : (
                  <button key={category.id} type="button" onClick={() => handleCategorySelect(category.id)} className={className}>
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 分类文字说明（在产品前展示） */}
        {activeCategory && !categoryGuide && (
          <div className="mb-8 rounded-xl border border-sky-100 bg-white p-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-3">
              {activeCategory.name}
              {activeSubcategory && (
                <span className="text-xl md:text-2xl text-sky-700 ml-2">
                  - {activeSubcategory.name}
                </span>
              )}
            </h2>
            {(activeCategory.description || activeSubcategory?.description) && (
              <p className="text-slate-600 leading-7 whitespace-pre-line max-w-4xl">
                {activeSubcategory?.description || activeCategory.description}
              </p>
            )}
          </div>
        )}

        {categoryGuide && (
          <section className="mt-14 border-t border-slate-200 pt-10" aria-labelledby="category-guide-title">
            <h2 id="category-guide-title" className="text-2xl font-semibold text-slate-900">{categoryGuide.checksTitle}</h2>
            <div className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
              {categoryGuide.checks.map((check) => (
                <article key={check.title} className="grid gap-2 py-5 sm:grid-cols-[minmax(12rem,0.8fr)_2fr] sm:gap-8">
                  <h3 className="font-semibold text-slate-900">{check.title}</h3>
                  <p className="leading-7 text-slate-600">{check.description}</p>
                </article>
              ))}
            </div>
            <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{categoryGuide.rfqTitle}</h2>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {categoryGuide.rfqItems.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                      <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-700" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <aside className="border-l-2 border-sky-700 pl-5">
                <p className="text-sm leading-7 text-slate-600">{categoryGuide.serviceNote}</p>
                <Link
                  to={categoryGuide.articlePath ? `/${currentLanguage}/${categoryGuide.articlePath}` : '#catalog-products'}
                  className="mt-4 inline-flex font-semibold text-sky-800 underline decoration-sky-300 underline-offset-4 hover:text-sky-950"
                >
                  {categoryGuide.articleLabel}
                </Link>
              </aside>
            </div>
          </section>
        )}

        {/* 产品列表 */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">{t('products_no_products', 'No products found')}</p>
            <p className="text-gray-400 mt-2">{t('products_no_products_desc', 'Please add product information in the backend first')}</p>
          </div>
        ) : (
          <div id="catalog-products" className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 product-grid">
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
                        {product.category?.name || 'Aluminum Profile'}
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
                        {t('products_view_details', 'View Details')}
                      </Link>
                      <Link
                        to={`/${currentLanguage}/products/${product.slug || product.id}#inquiry`}
                        className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg border border-sky-200 px-4 py-2 text-sm font-semibold text-sky-800 transition hover:border-sky-500 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      >
                        {t('products_send_rfq', 'Send RFQ')}
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
            <h2 className="text-xl font-semibold text-gray-900 mb-3">{t('products_buying_guides', 'Buying Guides')}</h2>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <Link className="text-blue-700 hover:text-blue-900 underline" to="/en/aluminum-profile-supplier-for-construction-projects">
                Aluminum Profile Supplier for Construction Projects
              </Link>
              <Link className="text-blue-700 hover:text-blue-900 underline" to="/en/industrial-aluminum-extrusion-manufacturer-in-china">
                Industrial Aluminum Profiles for Equipment and Automation
              </Link>
              <Link className="text-blue-700 hover:text-blue-900 underline" to="/en/custom-aluminum-profile-factory-for-oem-orders">
                Custom Aluminum Profiles for OEM Projects
              </Link>
            </div>
          </div>
        )}
      </div>

      <FactoryShowcase />

      {/* 悬浮联系按钮 */}
      <FloatingContactButtons />
    </div>
  );
};

export default Products; 
