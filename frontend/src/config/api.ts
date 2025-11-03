// API配置文件
// 生产环境配置 - 请根据您的实际域名修改
const PRODUCTION_DOMAIN = 'http://lingyealu.cn'; // 请替换为您的实际域名

const API_BASE_URL = (() => {
  // 如果设置了环境变量，使用环境变量
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/$/, '');
  }
  
  // 如果在浏览器环境中
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    
    // 如果是开发环境（localhost或127.0.0.1），使用开发环境配置
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return origin;
    }
    
    // 生产环境，使用配置的域名（通过nginx代理）
    return PRODUCTION_DOMAIN;
  }
  
  // 默认返回空字符串
  return '';
})();

export const API_ENDPOINTS = {
  // 产品相关
  PRODUCTS: `${API_BASE_URL}/api/products/`,
  CATEGORIES: `${API_BASE_URL}/api/categories/`,
  PRODUCT_IMAGES: `${API_BASE_URL}/api/product-images/`,
  
  // 新闻相关
  ARTICLES: `${API_BASE_URL}/api/articles/`,
  TAGS: `${API_BASE_URL}/api/tags/`,
  
  // 公司信息
  COMPANY_INFO: `${API_BASE_URL}/api/company-info/`,
  ADVANTAGES: `${API_BASE_URL}/api/advantages/`,
  CERTIFICATES: `${API_BASE_URL}/api/certificates/`,
  FACTORY_IMAGES: `${API_BASE_URL}/api/factory-images/`,
  
  // 咨询相关
  INQUIRIES: `${API_BASE_URL}/api/inquiries/`,
  CONTACT_INFO: `${API_BASE_URL}/api/contact-info/`,
  
  // 翻译相关
  TRANSLATIONS: `${API_BASE_URL}/api/translations/frontend_content/`,
  TRANSLATE_FRONTEND: `${API_BASE_URL}/api/translations/translate_frontend/`,
};

export default API_BASE_URL;
