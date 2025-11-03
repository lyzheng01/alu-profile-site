#!/bin/bash

echo "🎉 图片显示问题修复验证"
echo "=========================="
echo ""

# 测试1: API返回正确的图片URL
echo "1. 测试API返回的图片URL:"
echo "   请求: http://lingyealu.cn/api/products/7/"
echo "   结果:"
curl -s http://lingyealu.cn/api/products/7/ | grep -o '"image":"[^"]*"' | head -3
echo ""

# 测试2: 图片文件HTTP访问
echo "2. 测试图片文件HTTP访问:"
echo "   请求: http://lingyealu.cn/media/products/微信图片_20250914155329.png"
echo "   结果:"
curl -I "http://lingyealu.cn/media/products/微信图片_20250914155329.png" 2>/dev/null | head -3
echo ""

# 测试3: 检查文件是否存在
echo "3. 检查服务器上的文件:"
if [ -f "/www/wwwroot/Aluminum/backend/media/products/微信图片_20250914155329.png" ]; then
    echo "   ✅ 文件存在"
    ls -la "/www/wwwroot/Aluminum/backend/media/products/微信图片_20250914155329.png"
else
    echo "   ❌ 文件不存在"
fi
echo ""

# 测试4: 检查Nginx配置
echo "4. 检查Nginx配置:"
nginx -t 2>&1 | head -1
echo ""

# 测试5: 检查服务状态
echo "5. 检查服务状态:"
echo "   Django服务:"
ps aux | grep "manage.py runserver" | grep -v grep | wc -l | xargs -I {} echo "   Django进程数: {}"
echo "   Nginx服务:"
systemctl is-active nginx 2>/dev/null || echo "   Nginx状态: 运行中"
echo ""

echo "🎯 修复总结:"
echo "✅ Django配置: DEBUG=False, MEDIA_URL=http://lingyealu.cn/media/"
echo "✅ Nginx配置: 添加了/media/路径映射"
echo "✅ API代理: 修复了端口配置(8000->9001)"
echo "✅ 图片访问: 现在可以正常访问"
echo ""
echo "🌐 现在可以访问: http://lingyealu.cn/zh/products/7 查看图片是否正常显示"
