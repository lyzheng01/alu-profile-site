// Title and meta management helpers.
export interface PageTitleConfig {
  en: string;
  zh: string;
  es: string;
  pt: string;
  ar: string;
  hi: string;
}

// Page title configuration.
export const PAGE_TITLES: Record<string, PageTitleConfig> = {
  home: {
    en: 'LingYe Aluminum | Aluminum Profile Manufacturer',
    zh: 'LingYe Aluminum | 铝型材制造商',
    es: 'LingYe Aluminum | Fabricante de perfiles de aluminio',
    pt: 'LingYe Aluminum | Fabricante de perfis de aluminio',
    ar: 'LingYe Aluminum | مصنع مقاطع الألمنيوم',
    hi: 'LingYe Aluminum | Aluminium Profile Manufacturer'
  },
  about: {
    en: 'About LingYe Aluminum | Factory and Capabilities',
    zh: '关于 LingYe Aluminum | 工厂与产能',
    es: 'Sobre LingYe Aluminum | Fábrica y capacidades',
    pt: 'Sobre a LingYe Aluminum | Fabrica e capacidade',
    ar: 'حول LingYe Aluminum | المصنع والقدرات',
    hi: 'About LingYe Aluminum | Factory and Capabilities'
  },
  products: {
    en: 'Aluminum Products | Industrial and Architectural Profiles',
    zh: '铝型材产品中心 | 工业与建筑铝材',
    es: 'Productos de aluminio | Perfiles industriales y arquitectonicos',
    pt: 'Produtos de aluminio | Perfis industriais e arquitetonicos',
    ar: 'منتجات الالمنيوم | مقاطع صناعية ومعمارية',
    hi: 'Aluminum Products | Industrial and Architectural Profiles'
  },
  news: {
    en: 'Aluminum Industry News | LingYe Aluminum',
    zh: '铝行业资讯 | LingYe Aluminum',
    es: 'Noticias de la industria del aluminio | LingYe Aluminum',
    pt: 'Noticias da industria do aluminio | LingYe Aluminum',
    ar: 'اخبار صناعة الالمنيوم | LingYe Aluminum',
    hi: 'Aluminum Industry News | LingYe Aluminum'
  },
  newsDetail: {
    en: 'News Detail | LingYe Aluminum',
    zh: '新闻详情 | LingYe Aluminum',
    es: 'Detalle de noticia | LingYe Aluminum',
    pt: 'Detalhe da noticia | LingYe Aluminum',
    ar: 'تفاصيل الخبر | LingYe Aluminum',
    hi: 'News Detail | LingYe Aluminum'
  },
  inquiry: {
    en: 'Inquiry | LingYe Aluminum',
    zh: '在线询价 | LingYe Aluminum',
    es: 'Consulta | LingYe Aluminum',
    pt: 'Consulta | LingYe Aluminum',
    ar: 'استفسار | LingYe Aluminum',
    hi: 'Inquiry | LingYe Aluminum'
  }
};

export const PAGE_DESCRIPTIONS: Record<string, PageTitleConfig> = {
  home: {
    en: 'Professional aluminum profile manufacturer providing industrial extrusions, architectural profiles, and global B2B supply.',
    zh: '专业铝型材制造商，提供工业挤压型材、建筑铝材和全球 B2B 供货。',
    es: 'Fabricante profesional de perfiles de aluminio para extrusion industrial, perfiles arquitectonicos y suministro B2B global.',
    pt: 'Fabricante profissional de perfis de aluminio para extrusoes industriais, perfis arquitetonicos e fornecimento B2B global.',
    ar: 'شركة متخصصة في تصنيع مقاطع الالمنيوم للتطبيقات الصناعية والمعمارية والتوريد العالمي B2B.',
    hi: 'Professional aluminum profile manufacturer for industrial extrusions, architectural profiles, and global B2B supply.'
  },
  about: {
    en: 'Learn about LingYe Aluminum production capacity, quality control, export experience, and OEM/ODM services.',
    zh: '了解 LingYe Aluminum 的产能、质控体系、出口经验和 OEM/ODM 服务。',
    es: 'Conozca la capacidad de produccion, control de calidad, experiencia de exportacion y servicios OEM/ODM de LingYe Aluminum.',
    pt: 'Conheca a capacidade produtiva, controle de qualidade, experiencia em exportacao e servicos OEM/ODM da LingYe Aluminum.',
    ar: 'تعرف على قدرة الانتاج وضبط الجودة وخبرة التصدير وخدمات OEM/ODM لدى LingYe Aluminum.',
    hi: 'Learn about LingYe Aluminum capacity, quality control, export experience, and OEM/ODM services.'
  },
  products: {
    en: 'Browse aluminum profiles for windows, doors, decoration, and industrial applications with custom extrusion options.',
    zh: '浏览门窗、装饰及工业应用铝型材，支持来图来样定制挤压。',
    es: 'Explore perfiles de aluminio para ventanas, puertas, decoracion y aplicaciones industriales con extrusion personalizada.',
    pt: 'Veja perfis de aluminio para janelas, portas, decoracao e aplicacoes industriais com extrusao personalizada.',
    ar: 'استعرض مقاطع الالمنيوم للنوافذ والابواب والديكور والتطبيقات الصناعية مع خيارات بثق مخصصة.',
    hi: 'Browse aluminum profiles for windows, doors, decoration, and industrial applications with custom extrusion options.'
  },
  news: {
    en: 'Read latest aluminum market trends, processing insights, and product updates from LingYe Aluminum.',
    zh: '查看 LingYe Aluminum 发布的铝材市场趋势、工艺洞察与产品动态。',
    es: 'Lea tendencias del mercado de aluminio, conocimientos de proceso y novedades de LingYe Aluminum.',
    pt: 'Leia tendencias do mercado de aluminio, insights de processamento e novidades da LingYe Aluminum.',
    ar: 'اطلع على اتجاهات سوق الالمنيوم ورؤى المعالجة وتحديثات المنتجات من LingYe Aluminum.',
    hi: 'Read aluminum market trends, processing insights, and product updates from LingYe Aluminum.'
  },
  newsDetail: {
    en: 'Detailed article about aluminum materials, manufacturing, and market updates from LingYe Aluminum.',
    zh: '铝材料、制造与市场动态的详细文章，来自 LingYe Aluminum。',
    es: 'Articulo detallado sobre materiales de aluminio, manufactura y novedades del mercado de LingYe Aluminum.',
    pt: 'Artigo detalhado sobre materiais de aluminio, fabricacao e atualizacoes de mercado da LingYe Aluminum.',
    ar: 'مقال تفصيلي حول مواد الالمنيوم والتصنيع وتحديثات السوق من LingYe Aluminum.',
    hi: 'Detailed article on aluminum materials, manufacturing, and market updates from LingYe Aluminum.'
  },
  inquiry: {
    en: 'Send your aluminum profile inquiry to get fast quotation and technical support from LingYe Aluminum.',
    zh: '提交铝型材询盘，获取 LingYe Aluminum 快速报价与技术支持。',
    es: 'Envie su consulta para obtener cotizacion rapida y soporte tecnico de LingYe Aluminum.',
    pt: 'Envie sua consulta para obter cotacao rapida e suporte tecnico da LingYe Aluminum.',
    ar: 'ارسل استفسارك للحصول على عرض سعر سريع ودعم فني من LingYe Aluminum.',
    hi: 'Send your aluminum profile inquiry for fast quotation and technical support from LingYe Aluminum.'
  }
};

const getLocalizedValue = (
  map: Record<string, PageTitleConfig>,
  pageKey: string,
  language: string,
  fallback: string
): string => {
  const config = map[pageKey];
  if (!config) return fallback;
  return config[language as keyof PageTitleConfig] || config.en || fallback;
};

export const setMetaDescription = (description?: string) => {
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription && description) {
    metaDescription.setAttribute('content', description);
  }
};

export const setPageTitle = (
  pageKey: string,
  language: string,
  customTitle?: string,
  customDescription?: string
) => {
  const title = customTitle || getLocalizedValue(PAGE_TITLES, pageKey, language, 'LingYe Aluminum');
  const description =
    customDescription ||
    getLocalizedValue(PAGE_DESCRIPTIONS, pageKey, language, 'LingYe Aluminum aluminum profile supplier.');

  document.title = title;
  setMetaDescription(description);
};

export const setNewsDetailTitle = (articleTitle: string, language: string) => {
  const baseTitle = getLocalizedValue(PAGE_TITLES, 'newsDetail', language, 'News Detail | LingYe Aluminum');
  document.title = `${articleTitle} - ${baseTitle}`;
};

export const resetTitle = (language: string = 'en') => {
  setPageTitle('home', language);
};
