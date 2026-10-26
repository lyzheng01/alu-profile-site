import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import FloatingContactButtons from '../components/FloatingContactButtons';
import InquiryForm from '../components/InquiryForm';
import { useSeoMeta } from '../hooks/useSeoMeta';
import { useStructuredData } from '../hooks/useStructuredData';
import { useTranslation } from '../contexts/TranslationContext';
// 模板系统已集成到后端API，前端直接使用API返回的数据即可

interface Product {
  id: number;
  slug: string;
  name?: string;
  translated_name?: string;
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

type FactoryLanguage = 'en' | 'zh' | 'es' | 'pt';

const factorySectionHeadings: Record<FactoryLanguage, string> = {
  en: 'OUR FACTORY',
  zh: '我们的工厂',
  es: 'NUESTRA FÁBRICA',
  pt: 'NOSSA FÁBRICA',
};

const productPageCopy: Record<FactoryLanguage, Record<string, string>> = {
  en: { loading: 'Loading…', notFound: 'Product not found', backToProducts: 'Back to Products', breadcrumb: 'Breadcrumb', view: 'view', oemAvailable: 'Available', oemUnavailable: 'Not available', whyChooseUs: 'Why choose us?' },
  zh: { loading: '正在加载…', notFound: '未找到该产品', backToProducts: '返回产品列表', breadcrumb: '面包屑导航', view: '图片', oemAvailable: '支持', oemUnavailable: '不支持', whyChooseUs: '为什么选择我们？' },
  es: { loading: 'Cargando…', notFound: 'Producto no encontrado', backToProducts: 'Volver a los productos', breadcrumb: 'Ruta de navegación', view: 'vista', oemAvailable: 'Disponible', oemUnavailable: 'No disponible', whyChooseUs: '¿Por qué elegirnos?' },
  pt: { loading: 'A carregar…', notFound: 'Produto não encontrado', backToProducts: 'Voltar aos produtos', breadcrumb: 'Navegação estrutural', view: 'vista', oemAvailable: 'Disponível', oemUnavailable: 'Não disponível', whyChooseUs: 'Por que nos escolher?' },
};

const factoryOverviewModules = [
  {
    id: 'surface-treatment-options',
    image: '/images/surface-treatment-options.webp',
    title: {
      en: 'Surface Treatment Options',
      zh: '表面处理方式',
      es: 'Opciones de tratamiento de superficies',
      pt: 'Opções de tratamento de superfície',
    },
    description: {
      en: 'Visual reference for common profile finishes. Applicable processes, brands, coating thickness and color range are confirmed for each project.',
      zh: '常见型材表面效果参考图。适用工艺、品牌、涂层厚度与颜色范围以具体项目确认信息为准。',
      es: 'Referencia visual de acabados habituales para perfiles. Los procesos, las marcas, el espesor del recubrimiento y la gama de colores se confirman para cada proyecto.',
      pt: 'Referência visual de acabamentos comuns para perfis. Os processos, as marcas, a espessura do revestimento e a gama de cores são confirmados para cada projeto.',
    },
  },
  {
    id: 'aluminum-profile-production-process',
    image: '/images/aluminum-profile-process.webp',
    title: {
      en: 'Production Process',
      zh: '铝型材生产流程',
      es: 'Proceso de producción',
      pt: 'Processo de produção',
    },
    description: {
      en: 'Illustrative overview of mold development, extrusion, finishing, machining and packing. Applicable steps and the production route depend on the product and confirmed order requirements.',
      zh: '模具开发、挤压、表面处理、深加工与包装流程示意。适用工序和具体生产路线以产品及已确认订单要求为准。',
      es: 'Vista ilustrativa del desarrollo del molde, la extrusión, los acabados, el mecanizado y el embalaje. Las etapas y la ruta de producción aplicables dependen del producto y de los requisitos confirmados del pedido.',
      pt: 'Visão ilustrativa do desenvolvimento do molde, extrusão, acabamentos, usinagem e embalagem. As etapas aplicáveis e o fluxo de produção dependem do produto e dos requisitos confirmados do pedido.',
    },
  },
];

const factoryContentTranslations: Record<string, Record<FactoryLanguage, string>> = {
  '铝型材挤压生产环节': {
    en: 'Aluminum extrusion production process',
    zh: '铝型材挤压生产环节',
    es: 'Proceso de extrusión de perfiles de aluminio',
    pt: 'Processo de extrusão de perfis de alumínio',
  },
  '展示铝型材挤压生产线及型材下线区域。照片用于介绍项目可对接的生产环节；具体生产主体与能力以项目确认信息为准。': {
    en: 'Shows the aluminum extrusion line and profile runout area. This photo illustrates production stages that may be coordinated for a project; the actual production entity and capabilities are subject to project confirmation.',
    zh: '展示铝型材挤压生产线及型材下线区域。照片用于介绍项目可对接的生产环节；具体生产主体与能力以项目确认信息为准。',
    es: 'Muestra la línea de extrusión de aluminio y la zona de salida de los perfiles. La imagen ilustra las etapas de producción que pueden coordinarse para un proyecto; la entidad productora y sus capacidades concretas se confirmarán para cada proyecto.',
    pt: 'Mostra a linha de extrusão de alumínio e a área de saída dos perfis. A imagem ilustra as etapas de produção que podem ser coordenadas para um projeto; a unidade produtora e suas capacidades serão confirmadas para cada projeto.',
  },
  '表面处理生产线': {
    en: 'Surface treatment production line',
    zh: '表面处理生产线',
    es: 'Línea de tratamiento de superficies',
    pt: 'Linha de tratamento de superfícies',
  },
  '表面处理生产现场参考图，展示铝型材表面处理环节。不同项目的工艺路线和承制工厂以订单确认信息为准。': {
    en: 'Reference photo of a surface-treatment production area, showing the finishing stage for aluminum profiles. The process route and contracted factory may vary by project and are confirmed with each order.',
    zh: '表面处理生产现场参考图，展示铝型材表面处理环节。不同项目的工艺路线和承制工厂以订单确认信息为准。',
    es: 'Imagen de referencia de una zona de producción de tratamiento de superficies que muestra esta etapa para perfiles de aluminio. El proceso y la fábrica contratada pueden variar según el proyecto y se confirman con cada pedido.',
    pt: 'Imagem de referência de uma área de produção de tratamento de superfícies, mostrando essa etapa dos perfis de alumínio. O processo e a fábrica contratada podem variar conforme o projeto e são confirmados em cada pedido.',
  },
  '铝型材挤压车间': {
    en: 'Aluminum extrusion workshop',
    zh: '铝型材挤压车间',
    es: 'Taller de extrusión de aluminio',
    pt: 'Oficina de extrusão de alumínio',
  },
  '铝型材挤压与型材输送生产现场。图片用于说明制造环节，具体设备及生产安排以项目供应方确认信息为准。': {
    en: 'Production area for aluminum extrusion and profile handling. This image illustrates a manufacturing stage; the specific equipment and production arrangements are confirmed with the project supplier.',
    zh: '铝型材挤压与型材输送生产现场。图片用于说明制造环节，具体设备及生产安排以项目供应方确认信息为准。',
    es: 'Zona de producción de extrusión y traslado de perfiles de aluminio. La imagen muestra una etapa de fabricación; el equipo y la planificación concretos se confirman con el proveedor del proyecto.',
    pt: 'Área de produção de extrusão e movimentação de perfis de alumínio. A imagem mostra uma etapa de fabricação; os equipamentos e o planejamento específicos são confirmados com o fornecedor do projeto.',
  },
  '型材包装作业': {
    en: 'Protective packaging & dispatch preparation',
    zh: '防护包装与发运准备',
    es: 'Embalaje protector y preparación del envío',
    pt: 'Embalagem protetora e preparação para expedição',
  },
  '型材包装作业现场，展示成品整理与防护包装环节。实际包装方式按订单规格、运输路线与项目要求确认。': {
    en: 'Profile packaging area showing finished-product organization and protective packaging. The packaging method is confirmed according to order specifications, shipping route, and project requirements.',
    zh: '型材包装作业现场，展示成品整理与防护包装环节。实际包装方式按订单规格、运输路线与项目要求确认。',
    es: 'Zona de embalaje de perfiles que muestra la organización del producto terminado y su protección. El método de embalaje se confirma según las especificaciones del pedido, la ruta de transporte y los requisitos del proyecto.',
    pt: 'Área de embalagem de perfis que mostra a organização dos produtos acabados e sua proteção. O método de embalagem é confirmado conforme as especificações do pedido, a rota de transporte e os requisitos do projeto.',
  },
  '铝型材尺寸与外观检验': {
    en: 'Aluminum profile dimensional inspection',
    zh: '铝型材尺寸与外观检验',
    es: 'Inspección dimensional de perfiles de aluminio',
    pt: 'Inspeção dimensional de perfis de alumínio',
  },
  '展示铝型材尺寸检验参考场景。可按已确认图纸或样品核对关键尺寸与表面状态；检验项目按订单及验收要求确定。': {
    en: 'Reference image of dimensional inspection for aluminum profiles. Critical dimensions and visible surfaces may be checked against the approved drawing or sample; inspection points depend on order and acceptance requirements.',
    zh: '展示铝型材尺寸检验参考场景。可按已确认图纸或样品核对关键尺寸与表面状态；检验项目按订单及验收要求确定。',
    es: 'Imagen de referencia de la inspección dimensional de perfiles de aluminio. Las dimensiones clave y las superficies visibles pueden comprobarse según el plano o la muestra aprobados; los puntos de inspección dependen del pedido y de los criterios de aceptación.',
    pt: 'Imagem de referência da inspeção dimensional de perfis de alumínio. As dimensões principais e as superfícies visíveis podem ser verificadas conforme o desenho ou a amostra aprovados; os pontos de inspeção dependem do pedido e dos critérios de aceitação.',
  },
  '模具存放现场': {
    en: 'Die storage area',
    zh: '模具存放现场',
    es: 'Área de almacenamiento de matrices',
    pt: 'Área de armazenamento de matrizes',
  },
  '模具存放与管理现场参考图。具体模具资源及配套条件按项目确认。': {
    en: 'Reference photo of a die storage and management area. The available tooling and supporting resources are confirmed for each project.',
    zh: '模具存放与管理现场参考图。具体模具资源及配套条件按项目确认。',
    es: 'Imagen de referencia de una zona de almacenamiento y gestión de matrices. Las matrices disponibles y los recursos asociados se confirman para cada proyecto.',
    pt: 'Imagem de referência de uma área de armazenamento e gestão de matrizes. As matrizes disponíveis e os recursos de apoio são confirmados para cada projeto.',
  },
};

const translateFactoryContent = (content: string | undefined, language: FactoryLanguage): string => {
  if (!content) return '';
  return factoryContentTranslations[content.trim()]?.[language] || content;
};

const ProductDetail: React.FC = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const pathLanguage = pathname.split('/').filter(Boolean)[0];
  const routeLanguage = pathLanguage && ['en', 'zh', 'es', 'pt'].includes(pathLanguage) ? pathLanguage : 'en';
  const { productSlug } = useParams<{ productSlug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState(routeLanguage);
  const pageCopy = productPageCopy[currentLanguage as FactoryLanguage] || productPageCopy.en;
  const localizedProductName = product?.translated_name || product?.name || t('product_detail_aluminum_profile', 'Aluminum Profile');
  const getLocalizedProductName = (item: Product) => item.translated_name || item.name || t('product_detail_aluminum_profile', 'Aluminum Profile');

  const resolveProductMediaUrl = (imageUrl?: string | null) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http')) {
      return imageUrl.replace(/^https?:\/\/(?:www\.)?lingyealuminum\.com(?=\/)/i, window.location.origin);
    }
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

  const formatParameterValue = (value?: string | null) =>
    value ? value.replace(/^[^:：]{1,80}[:：]\s*/, '').trim() : '';

  // Keep product API requests and metadata aligned with the language in the URL.
  useEffect(() => {
    setCurrentLanguage(routeLanguage);
  }, [routeLanguage]);

  useSeoMeta({
    title: product ? `${localizedProductName} | LingYe Aluminum` : undefined,
    description: product
      ? (product.description || t('product_detail_description_pending', 'Project-specific details are confirmed against the approved drawing and specification.'))
      : undefined,
    canonicalPath: product?.slug ? `/${currentLanguage}/products/${product.slug}` : undefined,
    ogImage: product?.images?.[0]?.image
      ? resolveProductMediaUrl(product.images[0].image) || undefined
      : 'https://lingyealu.com/logo.jpg?v=3',
    ogTitle: product ? `${localizedProductName} | LingYe Aluminum` : undefined,
    ogDescription: product?.description || undefined,
    language: currentLanguage,
  });

  const productStructuredData = React.useMemo(() => {
    if (!product) return null;
    const image = product.images?.[0]?.image;
    let imageUrl: string | undefined;
    if (image) {
      imageUrl = resolveProductMediaUrl(image) || undefined;
    }
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: localizedProductName,
      description: product.description || undefined,
      image: imageUrl ? [imageUrl] : undefined,
      brand: {
        '@type': 'Brand',
        name: 'LingYe Aluminum',
      },
      manufacturer: {
        '@type': 'Organization',
        name: 'LingYe Aluminum',
      },
      category: product.category?.name || undefined,
      sku: String(product.id),
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };
  }, [product, localizedProductName]);

  useStructuredData('product', productStructuredData);

  const breadcrumbStructuredData = React.useMemo(() => {
    if (!product) return null;
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://lingyealu.com';
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: t('product_detail_home', 'Home'),
          item: `${base}/${currentLanguage}`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: t('product_detail_products', 'Products'),
          item: `${base}/${currentLanguage}/products`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: localizedProductName,
          item: `${base}/${currentLanguage}/products/${product.slug}`,
        },
      ],
    };
  }, [product, currentLanguage, t]);

  useStructuredData('product-breadcrumb', breadcrumbStructuredData);

  // Get product details and related products
  useEffect(() => {
    const fetchProductAndRelated = async () => {
        if (!productSlug) return;

      const isNumeric = /^\d+$/.test(productSlug);
      const detailUrl = isNumeric
        ? `${API_ENDPOINTS.PRODUCTS}${productSlug}/?lang=${currentLanguage}`
        : `${API_ENDPOINTS.PRODUCTS}by-slug/${productSlug}/?lang=${currentLanguage}`;

      try {
        // Retry transient network or server errors before treating a valid product URL as missing.
        let productResponse: Response | null = null;
        let lastError: unknown;
        for (let attempt = 0; attempt < 2; attempt += 1) {
          try {
            const response = await fetch(detailUrl, { signal: AbortSignal.timeout(15000) });
            if (response.status < 500 || attempt === 1) {
              productResponse = response;
              break;
            }
            lastError = new Error(`Product API returned ${response.status}`);
          } catch (error) {
            lastError = error;
            if (attempt === 1) throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
        if (!productResponse) throw lastError || new Error('Product request failed');
        // Get product details
        if (productResponse.ok) {
          const productData = await productResponse.json();

          // Keep backward compatibility for old id URLs — redirect to slug
          if (isNumeric && productData?.slug) {
            navigate(`/${currentLanguage}/products/${productData.slug}`, { replace: true });
          }

          // 后端API已经自动合并了模板数据，直接使用
          setProduct(productData);
          setLoading(false);

          // Get other products in the same category
          if (productData.category?.id) {
            try {
              const relatedResponse = await fetch(`${API_ENDPOINTS.PRODUCTS}?category=${productData.category.id}&lang=${currentLanguage}&limit=4`, { signal: AbortSignal.timeout(12000) });
              if (relatedResponse.ok) {
                const relatedData = await relatedResponse.json();
                // Filter out current product
                const filteredRelated = relatedData.results?.filter((p: Product) => p.id !== productData.id) || [];
                setRelatedProducts(filteredRelated.slice(0, 4));
              }
            } catch (relatedError) {
              console.warn('Failed to fetch related products:', relatedError);
              setRelatedProducts([]);
            }
          }
        } else {
          console.error('Product not found');
          navigate(`/${currentLanguage}/products`);
        }
      } catch (error) {
        console.error('Failed to fetch product details:', error);
        navigate(`/${currentLanguage}/products`);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndRelated();
  }, [productSlug, currentLanguage, navigate]);

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

  const { featureString } = React.useMemo<{
    featureTableData: Array<Record<string, any>> | null;
    featureString: string;
    featureItems: Array<{ id?: number; name: string; description: string; order: number }> | null;
  }>(() => {
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
      return { featureTableData: null, featureString: '', featureItems: null };
    }
    
    if (typeof product.features === 'string') {
      let decodedFeatures = product.features;
      
      // 先尝试直接解析（可能是双重编码的JSON字符串）
      try {
        const firstParse = JSON.parse(decodedFeatures);
        if (typeof firstParse === 'string') {
          // 如果是字符串，再次解析
          decodedFeatures = firstParse;
        } else {
          // 如果解析后是对象或数组，直接使用
          if (Array.isArray(firstParse) && firstParse.length > 0) {
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
      }
      
      // 解码 HTML 实体等
      decodedFeatures = decodeText(decodedFeatures);
      
      // 再次尝试解析为 JSON
      try {
        const parsed = JSON.parse(decodedFeatures);
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
          return { featureTableData: decodedArray, featureString: '', featureItems: null };
        }
      } catch (error) {
        // 不是 JSON，作为普通字符串处理
        return { featureTableData: null, featureString: decodedFeatures.trim(), featureItems: null };
      }
    }
    
    if (Array.isArray(product.features) && product.features.length > 0) {
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
      return { featureTableData: decodedArray, featureString: '', featureItems: null };
    }
    
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
      <div>
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{pageCopy.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="text-center">
            <p className="text-gray-500 text-lg">{pageCopy.notFound}</p>
            <Link to={`/${currentLanguage}/products`} className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
              {pageCopy.backToProducts}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb navigation */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-8">
          <nav className="flex" aria-label={pageCopy.breadcrumb}>
            <ol className="flex items-center space-x-4">
              <li>
                <Link to={`/${currentLanguage}`} className="text-gray-500 hover:text-gray-700">
                  {t('product_detail_home', 'Home')}
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <Link to={`/${currentLanguage}/products`} className="ml-4 text-gray-500 hover:text-gray-700">
                    {t('product_detail_products', 'Products')}
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-gray-700">{localizedProductName}</span>
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
            {localizedProductName}
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
                      src={resolveProductMediaUrl(product.images[currentImageIndex].image) || ''}
                      alt={localizedProductName}
                      className="w-full h-full object-cover"
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      width="800"
                      height="600"
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
                              src={resolveProductMediaUrl(image.image) || ''}
                              alt={`${localizedProductName} ${index + 1}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                              decoding="async"
                              width="80"
                              height="80"
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
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('product_detail_parameters', 'Product Parameters')}</h3>
                <div className="space-y-3">
                  {product.range_param && (
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">{t('product_detail_specification_range', 'Specification Range')}:</span>
                      <span className="text-gray-900 flex-1">{formatParameterValue(product.range_param)}</span>
                    </div>
                  )}
                  {product.type_param && (
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">{t('product_detail_product_type', 'Product Type')}:</span>
                      <span className="text-gray-900 flex-1">{formatParameterValue(product.type_param)}</span>
                    </div>
                  )}
                  {product.surface_treatment && (
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">{t('product_detail_surface_treatment', 'Surface Treatment')}:</span>
                      <span className="text-gray-900 flex-1">{formatParameterValue(product.surface_treatment)}</span>
                    </div>
                  )}
                  {product.colors && (
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">{t('product_detail_color_specification', 'Color Specification')}:</span>
                      <span className="text-gray-900 flex-1">{formatParameterValue(product.colors)}</span>
                    </div>
                  )}
                  {product.grade && (
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">{t('product_detail_quality_grade', 'Alloy grade')}:</span>
                      <span className="text-gray-900 flex-1">{formatParameterValue(product.grade)}</span>
                    </div>
                  )}
                  {product.temper && (
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">{t('product_detail_temper_state', 'Temper state')}:</span>
                      <span className="text-gray-900 flex-1">{formatParameterValue(product.temper)}</span>
                    </div>
                  )}
                  {product.oem_available !== undefined && (
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">{t('product_detail_oem', 'OEM')}:</span>
                      <span className="text-gray-900 flex-1">{product.oem_available ? pageCopy.oemAvailable : pageCopy.oemUnavailable}</span>
                    </div>
                  )}
                  {product.free_samples && (
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">{t('product_detail_free_samples', 'Free samples')}:</span>
                      <span className="text-gray-900 flex-1">{product.free_samples}</span>
                    </div>
                  )}
                  {product.supply_ability && (
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">{t('product_detail_supply_ability', 'Supply capacity')}:</span>
                      <span className="text-gray-900 flex-1">{product.supply_ability}</span>
                    </div>
                  )}
                  {product.payment_terms && (
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">{t('product_detail_payment', 'Payment terms')}:</span>
                      <span className="text-gray-900 flex-1">{product.payment_terms}</span>
                    </div>
                  )}
                  {product.product_origin && (
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">{t('product_detail_origin', 'Product origin')}:</span>
                      <span className="text-gray-900 flex-1">{product.product_origin}</span>
                    </div>
                  )}
                  {product.shipping_port && (
                    <div className="flex items-start gap-4 py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">{t('product_detail_shipping_port', 'Shipping port')}:</span>
                      <span className="text-gray-900 flex-1">{product.shipping_port}</span>
                    </div>
                  )}
                  {product.lead_time && (
                    <div className="flex items-start gap-4 py-2">
                      <span className="text-sm font-medium text-gray-500 w-36 flex-shrink-0">{t('product_detail_lead_time', 'Lead time')}:</span>
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
                    <p className="text-gray-500 text-lg">{t('product_detail_no_parameters', 'No product parameters available')}</p>
                    <p className="text-gray-400 text-sm mt-1">{t('product_detail_contact_specs', 'Contact us for detailed technical specifications')}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('product_detail_description', 'Product Description')}</h2>
                <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">
                  {product.description?.trim()
                    ? product.description
                    : t('product_detail_description_pending', 'Project-specific details are confirmed against the approved drawing and specification.')}
                </p>
              </div>
            </div>

                        {/* Product display images */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('product_detail_display', 'Product Display')}</h2>
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
                              src={resolveProductMediaUrl(image.image) || ''}
                              alt={`${localizedProductName} ${pageCopy.view} ${index + 1}`}
                              className="w-full h-auto object-contain"
                              loading={isFirstImage ? 'eager' : 'lazy'}
                              fetchPriority={isFirstImage ? 'high' : 'auto'}
                              decoding="async"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 text-sm">{t('product_detail_no_image', 'No Image')}</p>
                  </div>
                )}
              </div>
            </div>

        <section className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8" aria-label={currentLanguage === 'zh' ? '工厂工艺与生产流程' : currentLanguage === 'es' ? 'Procesos de fábrica y producción' : currentLanguage === 'pt' ? 'Processos de fábrica e produção' : 'Factory processes and production'}>
          {factoryOverviewModules.map((module) => {
            const moduleTitle = module.title[currentLanguage as FactoryLanguage] || module.title.en;
            const moduleDescription = module.description[currentLanguage as FactoryLanguage] || module.description.en;
            return (
              <article key={module.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
                <h2 className="mb-4 text-xl font-semibold text-gray-900 sm:text-2xl">{moduleTitle}</h2>
                <div className="flex h-[360px] items-center justify-center overflow-hidden rounded-xl bg-gray-50 sm:h-[420px] lg:h-[460px]">
                  <img src={module.image} alt={moduleTitle} className="h-full w-full object-contain" loading="lazy" decoding="async" />
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600">{moduleDescription}</p>
              </article>
            );
          })}
        </section>

                {surfaceTreatmentImageUrl && (
                  <div className="bg-white rounded-lg shadow-md">
                    <div className="p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-4 tracking-[0.3em]">{t('product_detail_surface_title', 'Surface Treatment')}</h2>
                      <div className="w-full bg-gray-50 rounded-2xl flex items-center justify-center">
                        <img
                          src={surfaceTreatmentImageUrl}
                          alt={surfaceTreatmentTitle || t('product_detail_surface_title', 'Surface Treatment')}
                          className="w-full h-auto object-contain"
                          loading="lazy"
                          decoding="async"
                          width="800"
                          height="600"
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
                    {pageCopy.whyChooseUs}
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

            {(product.specification_items && product.specification_items.length > 0) || product.specifications ? (
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('product_detail_technical_specs', 'Technical Specifications')}</h2>
                  {product.specification_items && product.specification_items.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">{t('product_detail_specification_name', 'Specification Name')}</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">{t('product_detail_specification_value', 'Specification Value')}</th>
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
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('product_detail_applications', 'Applications')}</h2>
                  {product.application_items && product.application_items.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {product.application_items
                        .sort((a, b) => a.order - b.order)
                        .map((app, index) => (
                          <div key={app.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            {app.image && (
                              <div className="mb-3 h-32 bg-gray-100 rounded overflow-hidden">
                                <img src={app.image} alt={app.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
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
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('product_detail_packaging', 'Packaging details')}</h2>
                  <p className="text-gray-700 text-lg leading-relaxed">{product.packaging_details}</p>
                </div>
              </div>
            )}

          </div>
        </div>


        {product.factory_images && product.factory_images.length > 0 && (
          <section className="mb-16 w-full space-y-8" aria-labelledby="our-factory-heading">
            <h2 id="our-factory-heading" className="text-2xl font-semibold text-gray-900">{factorySectionHeadings[currentLanguage as FactoryLanguage] || factorySectionHeadings.en}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {product.factory_images.map((factoryImg: any, index: number) => {
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

                const localizedFactoryTitle = translateFactoryContent(factoryImg.title, currentLanguage as FactoryLanguage) || `${currentLanguage === 'zh' ? '工厂图片' : currentLanguage === 'es' ? 'Imagen de fábrica' : currentLanguage === 'pt' ? 'Imagem da fábrica' : 'Factory Image'} ${index + 1}`;
                const localizedFactoryDescription = translateFactoryContent(factoryImg.description, currentLanguage as FactoryLanguage);

                return (
                  <figure key={factoryImg.id || index} className="w-full">
                    <div className="w-full h-[260px] sm:h-[300px] lg:h-[360px] bg-gray-50 rounded-2xl overflow-hidden flex items-center justify-center">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={localizedFactoryTitle}
                          className="w-full h-full max-h-full object-contain"
                          loading="lazy"
                          decoding="async"
                          width="1200"
                          height="800"
                          onError={(e) => {
                            console.error('Failed to load factory image:', imageUrl);
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-[420px] bg-gray-100 flex items-center justify-center rounded-2xl">
                          <p className="text-gray-500 text-sm">{localizedFactoryTitle}</p>
                        </div>
                      )}
                    </div>
                    {localizedFactoryDescription && (
                      <figcaption className="text-sm text-gray-600 mt-3">{localizedFactoryDescription}</figcaption>
                    )}
                  </figure>
                );
              })}
            </div>
          </section>
        )}

        {currentLanguage === 'en' && (
          <div className="mb-12 rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('product_detail_related_guides', 'Related Buying Guides')}</h2>
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

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('product_detail_related_products', 'Related Products')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {relatedProduct.images && relatedProduct.images.length > 0 ? (
                      <img
                        src={resolveProductMediaUrl(relatedProduct.images[0].image) || ''}
                        alt={getLocalizedProductName(relatedProduct)}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        width="400"
                        height="300"
                      />
                    ) : (
                      <p className="text-gray-500 text-sm">{t('product_detail_no_image', 'No Image')}</p>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{getLocalizedProductName(relatedProduct)}</h3>
                    <div className="flex gap-2">
                      <Link
                        to={`/${currentLanguage}/products/${relatedProduct.slug}`}
                        className="flex-1 bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition-colors text-center"
                      >
                        {t('products_view_details', 'View details')}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <section className="mb-16" aria-label={currentLanguage === 'zh' ? '获取报价' : currentLanguage === 'es' ? 'Solicitar presupuesto' : currentLanguage === 'pt' ? 'Solicitar cotação' : 'Get a Quote'}>
          <InquiryForm
            productName={localizedProductName}
            productLink={window.location.href}
          />
        </section>
      </div>

      {/* Floating contact buttons */}
      <FloatingContactButtons />
    </div>
  );
};

export default ProductDetail;
