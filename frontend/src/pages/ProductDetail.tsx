import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import FloatingContactButtons from '../components/FloatingContactButtons';
import InquiryForm from '../components/InquiryForm';
import { usePageTitle } from '../hooks/usePageTitle';
// 模板系统已集成到后端API，前端直接使用API返回的数据即可

interface Product {
  id: number;
  name: string;
  description: string;
  category: {
    id: number;
    name: string;
    slug?: string;
  };
  subcategory?: {
    id: number;
    name: string;
    slug?: string;
  };
  features: string | Array<Record<string, any>>;
  applications: string;
  specifications: Record<string, any>;
  // Product parameter fields
  range_param: string;
  type_param: string;
  surface_treatment: string;
  colors: string;
  grade: string;
  temper: string;
  specification_items: Array<{
    id?: number;
    name: string;
    value: string;
    order: number;
  }>;
  feature_items: Array<{
    id?: number;
    name: string;
    description: string;
    order: number;
  }>;
  application_items: Array<{
    id?: number;
    name: string;
    description: string;
    image?: string;
    order: number;
  }>;
  images: Array<{
    id: number;
    image: string;
    caption?: string;
  }>;
  // 扩展字段（来自模板）
  packaging_details?: string;
  oem_available?: boolean;
  free_samples?: string;
  supply_ability?: string;
  payment_terms?: string;
  product_origin?: string;
  shipping_port?: string;
  lead_time?: string;
  factory_images?: Array<{
    title: string;
    description?: string;
    image: string;
    category?: string;
  }>;
  created_at: string;
}

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState('zh');

  const resolveProductMediaUrl = (imageUrl?: string | null) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) return imageUrl;
    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      if (imageUrl.startsWith('/media/')) {
        return `${origin}${imageUrl}`;
      }
      if (imageUrl.startsWith('media/')) {
        return `${origin}/${imageUrl}`;
      }
      const baseUrl = API_ENDPOINTS.PRODUCTS.replace('/api/products/', '');
      return `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
    }
    return imageUrl;
  };

  // Get current language
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'zh';
    setCurrentLanguage(savedLanguage);
  }, []);

  // Set page title
  usePageTitle('products', product ? `${product.name} - Products` : undefined);

  // Get product details and related products
  useEffect(() => {
    const fetchProductAndRelated = async () => {
      if (!productId) return;
      
      try {
        // Get product details
        const productResponse = await fetch(`${API_ENDPOINTS.PRODUCTS}${productId}/?lang=${currentLanguage}`);
        if (productResponse.ok) {
          const productData = await productResponse.json();
          
          // 调试：检查工厂图片数据和 features
          console.log('Product Data:', productData);
          console.log('Factory Images:', productData.factory_images);
          console.log('Product Features:', productData.features);
          console.log('Product Features Type:', typeof productData.features);
          console.log('Product Feature Items:', productData.feature_items);
          
          // 后端API已经自动合并了模板数据，直接使用
          setProduct(productData);
          
          // Get other products in the same category
          if (productData.category?.id) {
            const relatedResponse = await fetch(`${API_ENDPOINTS.PRODUCTS}?category=${productData.category.id}&lang=${currentLanguage}&limit=4`);
            if (relatedResponse.ok) {
              const relatedData = await relatedResponse.json();
              // Filter out current product
              const filteredRelated = relatedData.results?.filter((p: Product) => p.id !== productData.id) || [];
              setRelatedProducts(filteredRelated.slice(0, 4));
            }
          }
        } else {
          console.error('Product not found');
          navigate('/products');
        }
      } catch (error) {
        console.error('Failed to fetch product details:', error);
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndRelated();
  }, [productId, currentLanguage, navigate]);

  // 所有 Hooks 必须在早期返回之前调用
  const surfaceTreatmentImageData = React.useMemo(() => {
    if (!product) return null;
    return (product.images || []).find((img) => {
      const caption = img.caption?.toLowerCase() || '';
      return caption.includes('surface') || caption.includes('treatment') || caption.includes('表面') || caption.includes('处理');
    }) || null;
  }, [product]);

  const surfaceTreatmentImageUrl = React.useMemo(() => {
    return surfaceTreatmentImageData
      ? resolveProductMediaUrl(surfaceTreatmentImageData.image)
      : null;
  }, [surfaceTreatmentImageData]);

  const surfaceTreatmentTitle = surfaceTreatmentImageData?.caption;
  const surfaceTreatmentDescription = product?.surface_treatment;

  // 解码 HTML 实体和 Unicode 转义序列（使用 useCallback 以便在渲染中使用）
  const decodeText = React.useCallback((text: string): string => {
    if (!text || typeof text !== 'string') return '';
    try {
      // 创建临时元素来解码 HTML 实体
      const textarea = document.createElement('textarea');
      textarea.innerHTML = text;
      let decoded = textarea.value;
      
      // 处理 Unicode 转义序列（如 \u4e2d\u6587）
      decoded = decoded.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
        return String.fromCharCode(parseInt(code, 16));
      });
      
      // 处理其他转义序列
      decoded = decoded.replace(/\\n/g, '\n');
      decoded = decoded.replace(/\\r/g, '\r');
      decoded = decoded.replace(/\\t/g, '\t');
      
      return decoded;
    } catch (error) {
      console.warn('Failed to decode text:', error);
      return text;
    }
  }, []);

  const { featureTableData, featureString, featureItems } = React.useMemo<{
    featureTableData: Array<Record<string, any>> | null;
    featureString: string;
    featureItems: Array<{ id?: number; name: string; description: string; order: number }> | null;
  }>(() => {
    console.log('Processing features - product:', product);
    console.log('Features value:', product?.features);
    console.log('Feature items:', product?.feature_items);
    
    // 优先使用 feature_items（结构化数据），但需要检查内容是否有效
    if (product?.feature_items && Array.isArray(product.feature_items) && product.feature_items.length > 0) {
      // 过滤掉无效的 feature_items（比如测试数据）
      const validItems = product.feature_items.filter(item => {
        const name = (item.name || '').trim();
        // 排除明显的测试数据（如纯数字、简单重复字符等）
        return name && name.length > 2 && !/^\d+$/.test(name) && name !== '1112';
      });
      
      if (validItems.length > 0) {
        console.log('Using valid feature_items:', validItems);
        // 解码 feature_items 中的文本
        const decodedItems = validItems.map(item => ({
          ...item,
          name: decodeText(item.name || ''),
          description: decodeText(item.description || '')
        }));
        console.log('Decoded feature_items:', decodedItems);
        return { 
          featureTableData: null, 
          featureString: '', 
          featureItems: decodedItems.sort((a, b) => (a.order || 0) - (b.order || 0))
        };
      } else {
        console.log('Feature_items exist but are invalid, falling back to features field');
      }
    }
    
    // 如果没有有效的 feature_items，再使用 features 字段
    if (!product?.features) {
      console.log('No features data found');
      return { featureTableData: null, featureString: '', featureItems: null };
    }
    
    if (typeof product.features === 'string') {
      console.log('Features is string:', product.features);
      let decodedFeatures = product.features;
      
      // 先尝试直接解析（可能是双重编码的JSON字符串）
      try {
        const firstParse = JSON.parse(decodedFeatures);
        if (typeof firstParse === 'string') {
          // 如果是字符串，再次解析
          decodedFeatures = firstParse;
          console.log('Double-encoded JSON detected, second parse:', decodedFeatures);
        } else {
          // 如果解析后是对象或数组，直接使用
          if (Array.isArray(firstParse) && firstParse.length > 0) {
            console.log('Parsed JSON array directly:', firstParse);
            const decodedArray = firstParse.map((item: any) => {
              if (typeof item === 'object' && item !== null) {
                const decodedItem: Record<string, any> = {};
                Object.entries(item).forEach(([key, value]) => {
                  decodedItem[decodeText(key)] = typeof value === 'string' ? decodeText(value) : value;
                });
                return decodedItem;
              }
              return typeof item === 'string' ? decodeText(item) : item;
            });
            return { featureTableData: decodedArray, featureString: '', featureItems: null };
          }
        }
      } catch (e) {
        console.log('First parse failed, treating as plain string');
      }
      
      // 解码 HTML 实体等
      decodedFeatures = decodeText(decodedFeatures);
      console.log('Decoded features:', decodedFeatures);
      
      // 再次尝试解析为 JSON
      try {
        const parsed = JSON.parse(decodedFeatures);
        console.log('Parsed JSON:', parsed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // 解码数组中的每个值
          const decodedArray = parsed.map((item: any) => {
            if (typeof item === 'object' && item !== null) {
              const decodedItem: Record<string, any> = {};
              Object.entries(item).forEach(([key, value]) => {
                decodedItem[decodeText(key)] = typeof value === 'string' ? decodeText(value) : value;
              });
              return decodedItem;
            }
            return typeof item === 'string' ? decodeText(item) : item;
          });
          console.log('Returning featureTableData:', decodedArray);
          return { featureTableData: decodedArray, featureString: '', featureItems: null };
        }
      } catch (error) {
        // 不是 JSON，作为普通字符串处理
        console.log('Features is not JSON, treating as plain text. Error:', error);
        console.log('Returning featureString:', decodedFeatures.trim());
        return { featureTableData: null, featureString: decodedFeatures.trim(), featureItems: null };
      }
    }
    
    if (Array.isArray(product.features) && product.features.length > 0) {
      console.log('Features is array:', product.features);
      // 解码数组中的每个值
      const decodedArray = product.features.map((item: any) => {
        if (typeof item === 'object' && item !== null) {
          const decodedItem: Record<string, any> = {};
          Object.entries(item).forEach(([key, value]) => {
            decodedItem[decodeText(key)] = typeof value === 'string' ? decodeText(value) : value;
          });
          return decodedItem;
        }
        return typeof item === 'string' ? decodeText(item) : item;
      });
      console.log('Returning featureTableData from array:', decodedArray);
      return { featureTableData: decodedArray, featureString: '', featureItems: null };
    }
    
    console.log('No valid features data found');
    return { featureTableData: null, featureString: '', featureItems: null };
  }, [product?.features, product?.feature_items, decodeText]);

  type WhyChooseUsItem = { title: string; description: string };
  const whyChooseUsItems = React.useMemo<WhyChooseUsItem[]>(() => {
    if (featureString) {
      return featureString
        .split(/\n\s*\n/)
        .map((chunk) => {
          const lines = chunk.split('\n').map((line) => line.trim()).filter(Boolean);
          if (!lines.length) return null;
          const [title, ...rest] = lines;
          return {
            title,
            description: rest.join(' ').trim() || '',
          };
        })
        .filter((item): item is WhyChooseUsItem => Boolean(item && item.title));
    }
    return [
      { 
        title: '10+ Years Aluminium Manufacturing Experience', 
        description: 'We specialize in aluminium extrusion, machining, finishing, and custom profile production with over a decade of industry expertise.' 
      },
      { 
        title: 'Full-Service Production Capabilities', 
        description: 'Extrusion, anodizing, powder coating, CNC machining, cutting, punching, assembly — all processes completed in-house for stable quality and fast delivery.' 
      },
      { 
        title: 'High-Quality Aluminium Materials', 
        description: 'We use premium 6063-T5, 6061-T6, and other alloys with strict control over hardness, flatness, anodizing thickness, and dimensional tolerance.' 
      },
      { 
        title: 'Custom Profiles & OEM/ODM Support', 
        description: 'Send us your drawings or samples — we provide custom molds, extrusion, and finishing solutions for industrial, construction, and consumer applications.' 
      },
      { 
        title: 'Reliable Lead Time & Large Production Capacity', 
        description: 'Multiple extrusion lines and automated equipment ensure consistent supply, quick turnaround, and on-time delivery for global customers.' 
      },
      { 
        title: 'Competitive Factory-Direct Pricing', 
        description: 'We offer cost-effective aluminium solutions with stable long-term supply for distributors and project buyers.' 
      },
      { 
        title: 'Global Export Experience', 
        description: 'We ship to Europe, North America, Southeast America, Asia, Africa, etc., providing professional packaging, documentation, and logistics support.' 
      },
    ];
  }, [featureString]);

  if (loading) {
    return (
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="text-center">
            <p className="text-gray-500 text-lg">Product not found</p>
            <Link to="/products" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      {/* Breadcrumb navigation */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link to="/" className="text-gray-500 hover:text-gray-700">
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <Link to="/products" className="ml-4 text-gray-500 hover:text-gray-700">
                    Products
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-gray-700">{product.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Product title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {product.name}
            {product.category && (
              <span className="text-2xl font-normal text-gray-600 ml-2">
                - {product.category.name}
              </span>
            )}
          </h1>
          <p className="text-gray-600">
            Categories: All Product{product.category && `, ${product.category.name}`}
            {product.subcategory && `, ${product.subcategory.name}`}
          </p>
        </div>

        {/* Product overview layout */}
        <div className="mb-16 flex flex-col gap-12 lg:flex-row">
          {/* Left column - images */}
          <div className="lg:w-[35%] space-y-10 lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <div>
                  {/* Main image with navigation buttons */}
                  <div className="relative h-80 bg-gray-200 group sm:h-[24rem]">
                    <img
                      src={product.images[currentImageIndex].image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Previous/Next buttons - 只在有多张图片时显示 */}
                    {product.images.length > 1 && (
                      <>
                        {/* Previous button */}
                        <button
                          onClick={() => {
                            const prevIndex = currentImageIndex === 0 
                              ? product.images.length - 1 
                              : currentImageIndex - 1;
                            setCurrentImageIndex(prevIndex);
                          }}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10"
                          aria-label="Previous image"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        
                        {/* Next button */}
                        <button
                          onClick={() => {
                            const nextIndex = currentImageIndex === product.images.length - 1 
                              ? 0 
                              : currentImageIndex + 1;
                            setCurrentImageIndex(nextIndex);
                          }}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10"
                          aria-label="Next image"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnails */}
                  {product.images.length > 1 && (
                    <div className="p-4">
                      <div className="flex space-x-2 overflow-x-auto">
                        {product.images.map((image, index) => (
                          <button
                            key={image.id}
                            onClick={() => setCurrentImageIndex(index)}
                            onMouseEnter={() => setCurrentImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                              index === currentImageIndex 
                                ? 'border-blue-500 ring-2 ring-blue-300' 
                                : 'border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            <img
                              src={image.image}
                              alt={`${product.name} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-80 bg-gray-200 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Right column - product info */}
          <div className="flex-1 space-y-10">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Parameters</h3>
                <div className="space-y-3">
                  {product.range_param && (
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">Specification Range:</span>
                      <span className="text-gray-900 flex-1">{product.range_param}</span>
                    </div>
                  )}
                  {product.type_param && (
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">Product Type:</span>
                      <span className="text-gray-900 flex-1">{product.type_param}</span>
                    </div>
                  )}
                  {product.surface_treatment && (
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">Surface Treatment:</span>
                      <span className="text-gray-900 flex-1">{product.surface_treatment}</span>
                    </div>
                  )}
                  {product.colors && (
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">Color Specification:</span>
                      <span className="text-gray-900 flex-1">{product.colors}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">Quality Grade:</span>
                    <span className="text-gray-900 flex-1">6061, 6063</span>
                  </div>
                  <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">Temper State:</span>
                    <span className="text-gray-900 flex-1">T5, T6</span>
                  </div>
                  {product.oem_available !== undefined && (
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">OEM:</span>
                      <span className="text-gray-900 flex-1">{product.oem_available ? 'Available' : 'Not Available'}</span>
                    </div>
                  )}
                  {product.free_samples && (
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">Free Samples:</span>
                      <span className="text-gray-900 flex-1">{product.free_samples}</span>
                    </div>
                  )}
                  {product.supply_ability && (
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">Supply Ability:</span>
                      <span className="text-gray-900 flex-1">{product.supply_ability}</span>
                    </div>
                  )}
                  {product.payment_terms && (
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">Payment:</span>
                      <span className="text-gray-900 flex-1">{product.payment_terms}</span>
                    </div>
                  )}
                  {product.product_origin && (
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">Product Origin:</span>
                      <span className="text-gray-900 flex-1">{product.product_origin}</span>
                    </div>
                  )}
                  {product.shipping_port && (
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">Shipping Port:</span>
                      <span className="text-gray-900 flex-1">{product.shipping_port}</span>
                    </div>
                  )}
                  {product.lead_time && (
                    <div className="flex items-start gap-4 py-2">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">Lead Time:</span>
                      <span className="text-gray-900 flex-1">{product.lead_time}</span>
                    </div>
                  )}
                </div>
                {!product.range_param && !product.type_param && !product.surface_treatment && !product.colors && !product.grade && !product.temper && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-lg">No product parameter information</p>
                    <p className="text-gray-400 text-sm mt-1">Please contact us for detailed technical specifications</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">PRODUCT DESCRIPTION</h2>
                <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">
                  {product.description?.trim()
                    ? product.description
                    : `Aluminium tile trim is a durable edging profile designed to protect tile edges and create clean, professional finishes in wall and floor installations.
Made from high-quality aluminum, it prevents chipping, improves overall appearance, and ensures long-lasting protection.
Available in various shapes, sizes, and surface finishes, aluminium tile trims are widely used in bathrooms, kitchens, stair areas, and commercial spaces.`}
                </p>
              </div>
            </div>

            {(featureItems || featureTableData || featureString) && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Features</h2>
                  {featureItems ? (
                    <div className="space-y-4">
                      {featureItems.map((item, index) => (
                        <div key={item.id || index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                          <div className="flex items-start gap-3">
                            <svg className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                              {item.description && (
                                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : featureTableData ? (
                    (() => {
                      console.log('Rendering featureTableData:', featureTableData);
                      return (
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Specification Name</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Specification Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {featureTableData.map((feature, index) => {
                              console.log('Rendering feature:', feature, 'index:', index);
                              // 如果 feature 有 name 和 value 字段，直接使用
                              if (feature && typeof feature === 'object' && 'name' in feature && 'value' in feature) {
                                return (
                                  <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      <div className="flex items-center">
                                        <svg className="flex-shrink-0 h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        <span style={{ wordBreak: 'break-word' }}>{decodeText(String(feature.name))}</span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900">
                                      <span style={{ wordBreak: 'break-word' }}>{decodeText(String(feature.value))}</span>
                                    </td>
                                  </tr>
                                );
                              }
                              // 否则遍历所有键值对，每个键值对一行
                              const entries = Object.entries(feature || {});
                              return entries.map(([key, value], entryIndex) => (
                                <tr key={`${index}-${entryIndex}`} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    <div className="flex items-center">
                                      <svg className="flex-shrink-0 h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      <span style={{ wordBreak: 'break-word' }}>{decodeText(String(key))}</span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-sm text-gray-900">
                                    <span style={{ wordBreak: 'break-word' }}>{decodeText(String(value))}</span>
                                  </td>
                                </tr>
                              ));
                            })}
                          </tbody>
                        </table>
                      );
                    })()
                  ) : featureString ? (
                    <div className="p-4">
                      <div className="whitespace-pre-wrap text-gray-600 leading-relaxed" 
                           style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {featureString.split('\n').map((line, index) => (
                          <React.Fragment key={index}>
                            {line}
                            {index < featureString.split('\n').length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-lg">No product feature data</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Product display images */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">PRODUCT DISPLAY</h2>
                {product.images && product.images.length > 0 ? (
                  <div className="space-y-8">
                    {product.images.slice(0, 4).map((image, index) => {
                      const isFirstImage = index === 0;
                      return (
                        <div key={index} className="w-full flex justify-center">
                          <div
                            className={`w-full bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center ${
                              isFirstImage
                                ? 'min-h-[260px] md:min-h-[400px]'
                                : 'max-w-3xl min-h-[240px] md:min-h-[320px]'
                            }`}
                          >
                            <img
                              src={image.image}
                              alt={`${product.name} view ${index + 1}`}
                              className="w-full h-auto object-contain"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm">No product display images</p>
                  </div>
                )}
              </div>
            </div>

            {/* Factory Images */}
            {product.factory_images && product.factory_images.length > 0 && (
              <div className="space-y-10">
                <h2 className="text-xl font-semibold text-gray-900">OUR FACTORY</h2>
                {product.factory_images
                  .filter((factoryImg: any) => {
                    // 过滤掉 ANODIZED WORKSHOP 照片
                    const title = (factoryImg.title || '').toUpperCase();
                    return !title.includes('ANODIZED WORKSHOP');
                  })
                  .slice(0, Math.max(0, product.factory_images.length - 2))
                  .map((factoryImg: any, index: number) => {
                  let imageUrl = factoryImg.image;
                  if (imageUrl && !imageUrl.startsWith('http')) {
                    const origin = window.location.origin;
                    if (imageUrl.startsWith('/media/')) {
                      imageUrl = `${origin}${imageUrl}`;
                    } else if (imageUrl.startsWith('media/')) {
                      imageUrl = `${origin}/${imageUrl}`;
                    } else {
                      const baseUrl = API_ENDPOINTS.PRODUCTS.replace('/api/products/', '');
                      imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
                    }
                  }
                  
                  return (
                    <div key={factoryImg.id || index} className="w-full">
                      <div className="w-full bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center min-h-[360px]">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={factoryImg.title || `Factory Image ${index + 1}`}
                            className="w-full h-auto max-h-[720px] object-contain"
                            onError={(e) => {
                              console.error('Failed to load factory image:', imageUrl);
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-[420px] bg-gray-100 flex items-center justify-center rounded-2xl">
                            <p className="text-gray-500 text-sm">{factoryImg.title || 'Factory Image'}</p>
                          </div>
                        )}
                      </div>
                      {factoryImg.description && (
                        <p className="text-sm text-gray-600 mt-3">{factoryImg.description}</p>
                      )}
                    </div>
                  );
                })}
                {surfaceTreatmentImageUrl && (
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4 tracking-[0.3em]">SURFACE TREATMENT</h2>
                      <div className="w-full bg-gray-50 rounded-2xl flex items-center justify-center">
                        <img
                          src={surfaceTreatmentImageUrl}
                          alt={surfaceTreatmentTitle || 'Surface Treatment'}
                          className="w-full h-auto object-contain"
                          loading="lazy"
                        />
                      </div>
                      {(surfaceTreatmentTitle || surfaceTreatmentDescription) && (
                        <div className="mt-4 space-y-1">
                          {surfaceTreatmentTitle && <p className="text-lg font-semibold text-gray-900">{surfaceTreatmentTitle}</p>}
                          {surfaceTreatmentDescription && (
                            <p className="text-sm text-gray-600 leading-relaxed">{surfaceTreatmentDescription}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 border border-blue-100 rounded-2xl p-8 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Why choose us?
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {whyChooseUsItems.map((item, index) => (
                      <div 
                        key={index}
                        className="group bg-white rounded-xl p-5 border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="flex items-start gap-4">
                          {/* 编号圆圈 */}
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform duration-300">
                            {index + 1}
                          </div>
                          {/* 内容 */}
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors duration-300">
                              {item.title}
                            </h4>
                            {item.description && (
                              <p className="text-gray-600 leading-relaxed text-sm">
                                {item.description}
                              </p>
                            )}
                          </div>
                          {/* 装饰图标 */}
                          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {(product.specification_items && product.specification_items.length > 0) || product.specifications ? (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Technical Specifications</h2>
                  {product.specification_items && product.specification_items.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Specification Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">Specification Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {product.specification_items
                          .sort((a, b) => a.order - b.order)
                          .map((spec, index) => (
                            <tr key={spec.id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 border-b">{spec.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-700 border-b">{spec.value}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  ) : product.specifications && product.specifications.trim() ? (
                    <pre className="whitespace-pre-wrap text-gray-700 text-lg leading-relaxed">{String(product.specifications)}</pre>
                  ) : null}
                </div>
              </div>
            ) : null}

            {(product.application_items && product.application_items.length > 0) || product.applications ? (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Applications</h2>
                  {product.application_items && product.application_items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {product.application_items
                        .sort((a, b) => a.order - b.order)
                        .map((app, index) => (
                          <div key={app.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            {app.image && (
                              <div className="mb-3 h-32 bg-gray-100 rounded overflow-hidden">
                                <img src={app.image} alt={app.name} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <h4 className="font-semibold text-gray-900 mb-2">{app.name}</h4>
                            <p className="text-sm text-gray-600">{app.description}</p>
                          </div>
                        ))}
                    </div>
                  ) : product.applications && product.applications.trim() ? (
                    <pre className="whitespace-pre-wrap text-gray-700 text-lg leading-relaxed">{String(product.applications)}</pre>
                  ) : null}
                </div>
              </div>
            ) : null}
            
            {product.packaging_details && (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Packaging Details</h2>
                  <p className="text-gray-700 text-lg leading-relaxed">{product.packaging_details}</p>
                </div>
              </div>
            )}

            {/* Inquiry form */}
            <div>
              <InquiryForm 
                productName={product.name}
                productLink={window.location.href}
              />
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {relatedProduct.images && relatedProduct.images.length > 0 ? (
                      <img
                        src={relatedProduct.images[0].image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <p className="text-gray-500 text-sm">No Image</p>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{relatedProduct.name}</h3>
                    <div className="flex gap-2">
                      <Link
                        to={`/products/${relatedProduct.id}`}
                        className="flex-1 bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition-colors text-center"
                      >
                        Read more
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inquiry Form placeholder removed - now inside right column */}
      </div>

      {/* Floating contact buttons */}
      <FloatingContactButtons />
    </div>
  );
};

export default ProductDetail;
