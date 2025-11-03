#!/usr/bin/env python
"""
检查数据库中的公司信息
"""
import os
import sys
import django

# 设置Django环境
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aluminum.settings')
django.setup()

from apps.about.models import CompanyInfo

def check_company_info():
    """检查公司信息"""
    print("数据库中的公司信息:")
    print("=" * 50)
    
    company_info = CompanyInfo.objects.all()
    for item in company_info:
        print(f"Key: {item.key}")
        print(f"Value: {item.value}")
        print(f"Type: {item.info_type}")
        print("-" * 30)

if __name__ == '__main__':
    check_company_info()
