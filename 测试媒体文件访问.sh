#!/bin/bash

echo "=== 媒体文件访问测试 ==="
echo ""

# 测试1: 检查文件是否存在
echo "1. 检查媒体文件是否存在:"
if [ -f "/www/wwwroot/Aluminum/backend/media/products/微信图片_20250914155329.png" ]; then
    echo "✅ 文件存在: /www/wwwroot/Aluminum/backend/media/products/微信图片_20250914155329.png"
    ls -la "/www/wwwroot/Aluminum/backend/media/products/微信图片_20250914155329.png"
else
    echo "❌ 文件不存在"
fi

echo ""

# 测试2: 检查文件权限
echo "2. 检查文件权限:"
ls -la /www/wwwroot/Aluminum/backend/media/products/ | head -3

echo ""

# 测试3: 测试API返回的URL
echo "3. 测试API返回的图片URL:"
curl -s http://lingyealu.cn/api/products/7/ | grep -o '"image":"[^"]*"' | head -3

echo ""

# 测试4: 测试媒体文件访问
echo "4. 测试媒体文件HTTP访问:"
echo "测试URL: http://lingyealu.cn/media/products/微信图片_20250914155329.png"
curl -I "http://lingyealu.cn/media/products/微信图片_20250914155329.png" 2>/dev/null | head -3

echo ""

# 测试5: 检查Nginx配置
echo "5. 检查Nginx配置:"
nginx -t 2>&1 | head -3

echo ""

echo "=== 建议的解决方案 ==="
echo "1. 确保Nginx配置包含媒体文件路径配置"
echo "2. 检查文件权限: chown -R www:www /www/wwwroot/Aluminum/backend/media/"
echo "3. 重启Nginx: systemctl restart nginx"
echo "4. 检查Nginx错误日志: tail -f /var/log/nginx/error.log"
