import React, { useState, useEffect } from 'react';
import { resolveMediaUrl, forceProductionUrl, debugMediaUrl } from '../utils/url';
import API_BASE_URL from '../config/api';

const UrlDebugger: React.FC = () => {
  const [testUrl, setTestUrl] = useState('http://127.0.0.1:9001/media/products/test.jpg');
  const [result, setResult] = useState('');

  const testUrlResolution = () => {
    console.log('=== URL解析测试 ===');
    console.log('API_BASE_URL:', API_BASE_URL);
    console.log('当前域名:', window.location.origin);
    console.log('原始URL:', testUrl);
    
    const resolved = resolveMediaUrl(testUrl);
    const forced = forceProductionUrl(testUrl);
    
    console.log('resolveMediaUrl结果:', resolved);
    console.log('forceProductionUrl结果:', forced);
    
    setResult(`
API_BASE_URL: ${API_BASE_URL}
当前域名: ${window.location.origin}
原始URL: ${testUrl}
resolveMediaUrl结果: ${resolved}
forceProductionUrl结果: ${forced}
    `);
  };

  useEffect(() => {
    testUrlResolution();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg m-4">
      <h3 className="text-lg font-bold mb-4">URL解析调试器</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">测试URL:</label>
        <input
          type="text"
          value={testUrl}
          onChange={(e) => setTestUrl(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="输入要测试的URL"
        />
      </div>
      
      <button
        onClick={testUrlResolution}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
      >
        测试URL解析
      </button>
      
      <div className="bg-white p-4 rounded border">
        <h4 className="font-medium mb-2">解析结果:</h4>
        <pre className="text-sm whitespace-pre-wrap">{result}</pre>
      </div>
    </div>
  );
};

export default UrlDebugger;
