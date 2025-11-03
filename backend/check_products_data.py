#!/usr/bin/env python
"""
检查数据库中的产品分类和产品数据
"""
import os
import sys
import django

# 设置Django环境
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aluminum.settings')
django.setup()

from apps.products.models import Category, Product

def check_products_data():
    """检查产品数据"""
    print("数据库中的产品分类:")
    print("=" * 50)
    
    categories = Category.objects.all()
    for category in categories:
        print(f"ID: {category.id}")
        print(f"名称: {category.name}")
        print(f"描述: {category.description}")
        print(f"是否激活: {category.is_active}")
        print("-" * 30)
    
    print("\n数据库中的产品:")
    print("=" * 50)
    
    products = Product.objects.all()
    for product in products:
        print(f"ID: {product.id}")
        print(f"名称: {product.name}")
        print(f"分类: {product.category.name}")
        print(f"描述: {product.description[:100]}...")
        print(f"特性: {product.features[:100] if product.features else '无'}...")
        print(f"应用: {product.applications[:100] if product.applications else '无'}...")
        print("-" * 30)

if __name__ == '__main__':
    check_products_data()
