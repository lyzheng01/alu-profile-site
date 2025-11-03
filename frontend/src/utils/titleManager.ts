// 标题管理工具
export interface PageTitleConfig {
  en: string;
  zh: string;
  es: string;
  pt: string;
  ar: string;
  hi: string;
}

// 页面标题配置
export const PAGE_TITLES: Record<string, PageTitleConfig> = {
  home: {
    en: 'LingYe Aluminum',
    zh: 'lingye 铝业',
    es: 'LingYe Aluminum',
    pt: 'LingYe Aluminum',
    ar: 'LingYe Aluminum',
    hi: 'LingYe Aluminum'
  },
  about: {
    en: 'About Us - Aluminum Expert',
    zh: '关于我们 - 铝业专家',
    es: 'Sobre Nosotros - Aluminum Expert',
    pt: 'Sobre Nós - Aluminum Expert',
    ar: 'من نحن - خبير الألمنيوم',
    hi: 'हमारे बारे में - एल्युमिनियम एक्सपर्ट'
  },
  products: {
    en: 'Products - Aluminum Expert',
    zh: '产品中心 - 铝业专家',
    es: 'Productos - Aluminum Expert',
    pt: 'Produtos - Aluminum Expert',
    ar: 'المنتجات - خبير الألمنيوم',
    hi: 'उत्पाद - एल्युमिनियम एक्सपर्ट'
  },
  news: {
    en: 'News - Aluminum Expert',
    zh: '新闻资讯 - 铝业专家',
    es: 'Noticias - Aluminum Expert',
    pt: 'Notícias - Aluminum Expert',
    ar: 'الأخبار - خبير الألمنيوم',
    hi: 'समाचार - एल्युमिनियम एक्सपर्ट'
  },
  newsDetail: {
    en: 'News Detail - Aluminum Expert',
    zh: '新闻详情 - 铝业专家',
    es: 'Detalle de Noticia - Aluminum Expert',
    pt: 'Detalhes da Notícia - Aluminum Expert',
    ar: 'تفاصيل الأخبار - خبير الألمنيوم',
    hi: 'समाचार विवरण - एल्युमिनियम एक्सपर्ट'
  },
  inquiry: {
    en: 'Inquiry - Aluminum Expert',
    zh: '在线询价 - 铝业专家',
    es: 'Consulta - Aluminum Expert',
    pt: 'Consulta - Aluminum Expert',
    ar: 'استفسار - خبير الألمنيوم',
    hi: 'पूछताछ - एल्युमिनियम एक्सपर्ट'
  }
};

// 设置页面标题
export const setPageTitle = (pageKey: string, language: string, customTitle?: string) => {
  let title: string;
  
  if (customTitle) {
    // 如果有自定义标题，使用自定义标题
    title = customTitle;
  } else {
    // 否则使用配置的标题
    const pageConfig = PAGE_TITLES[pageKey];
    if (pageConfig) {
      title = pageConfig[language as keyof PageTitleConfig] || pageConfig.en;
    } else {
      // 默认标题
      title = 'LingYe Aluminum';
    }
  }
  
  // 设置文档标题
  document.title = title;
  
  // 同时更新 meta description（可选）
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', title);
  }
};

// 设置新闻详情页标题
export const setNewsDetailTitle = (articleTitle: string, language: string) => {
  const baseTitle = PAGE_TITLES.newsDetail[language as keyof PageTitleConfig] || PAGE_TITLES.newsDetail.en;
  const title = `${articleTitle} - ${baseTitle}`;
  document.title = title;
};

// 重置为默认标题
export const resetTitle = (language: string = 'en') => {
  setPageTitle('home', language);
};
