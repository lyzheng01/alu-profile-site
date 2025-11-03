// 测试媒体URL解析的辅助函数
import { resolveMediaUrl } from './url';

export function testMediaUrlResolution() {
  console.log('=== 媒体URL解析测试 ===');
  
  const testUrls = [
    '/media/products/test.jpg',
    'http://127.0.0.1:9001/media/products/test.jpg',
    'http://localhost:9001/media/products/test.jpg',
    'https://your-domain.com/media/products/test.jpg',
    'https://example.com/media/products/test.jpg',
  ];
  
  testUrls.forEach(url => {
    console.log(`原始URL: ${url}`);
    console.log(`解析后URL: ${resolveMediaUrl(url)}`);
    console.log('---');
  });
}

// 在开发环境中自动运行测试
if (process.env.NODE_ENV === 'development') {
  // 延迟执行，确保DOM已加载
  setTimeout(() => {
    testMediaUrlResolution();
  }, 1000);
}
