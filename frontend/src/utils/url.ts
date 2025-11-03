import API_BASE_URL from '../config/api';

export function resolveMediaUrl(url?: string): string {
  if (!url) return '';
  
  try {
    // 如果是相对媒体路径，如 /media/xxx，则拼接后端API基址
    if (url.startsWith('/media/')) {
      return `${API_BASE_URL}${url}`;
    }
    
    // 如果是绝对URL，检查是否需要替换域名
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // 获取当前页面的域名和协议
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
      
      // 如果是开发环境的地址，替换为生产环境地址
      if (url.includes('127.0.0.1:9001') || url.includes('localhost:9001')) {
        // 提取路径部分
        const urlObj = new URL(url);
        const path = urlObj.pathname;
        return `${currentOrigin}${path}`;
      }
      
      // 如果URL已经包含正确的域名，直接返回
      return url;
    }
    
    // 如果是相对路径，拼接API基址
    return `${API_BASE_URL}${url}`;
  } catch (error) {
    console.warn('解析媒体URL失败:', error, '原始URL:', url);
    return url;
  }
}

// 新增：强制使用生产环境域名的函数
export function forceProductionUrl(url?: string): string {
  if (!url) return '';
  
  try {
    // 如果是相对媒体路径，直接拼接生产环境域名
    if (url.startsWith('/media/')) {
      return `${API_BASE_URL}${url}`;
    }
    
    // 如果是绝对URL，提取路径并拼接生产环境域名
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      return `${API_BASE_URL}${path}`;
    }
    
    // 如果是相对路径，拼接API基址
    return `${API_BASE_URL}${url}`;
  } catch (error) {
    console.warn('强制生产环境URL解析失败:', error, '原始URL:', url);
    return url;
  }
}

// 调试函数，用于检查URL解析
export function debugMediaUrl(url?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('媒体URL调试信息:');
    console.log('原始URL:', url);
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('当前域名:', typeof window !== 'undefined' ? window.location.origin : 'N/A');
    console.log('解析后URL:', resolveMediaUrl(url));
  }
}


