#!/usr/bin/env python
"""
创建测试数据的脚本
"""
import os
import sys
import django

# 设置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aluminum.settings')
django.setup()

from apps.products.models import Category, Product
from django.utils.text import slugify

def create_test_data():
    """创建测试数据"""
    print("开始创建测试数据...")
    
    # 创建产品分类
    categories_data = [
        {
            'name': 'Industrial Profiles',
            'description': 'High-quality industrial aluminum profiles for various applications',
            'order': 1
        },
        {
            'name': 'Architectural Profiles',
            'description': 'Architectural aluminum profiles for building and construction',
            'order': 2
        },
        {
            'name': 'Automotive Profiles',
            'description': 'Automotive aluminum profiles for vehicle manufacturing',
            'order': 3
        }
    ]
    
    categories = []
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={
                'description': cat_data['description'],
                'order': cat_data['order'],
                'slug': slugify(cat_data['name']),
                'is_active': True
            }
        )
        categories.append(category)
        if created:
            print(f"创建分类: {category.name}")
        else:
            print(f"分类已存在: {category.name}")
    
    # 创建产品
    products_data = [
        {
            'name': 'Standard Industrial Profile',
            'description': 'Standard industrial aluminum profile with excellent strength and durability',
            'features': 'High strength\nCorrosion resistant\nEasy to install\nCost effective',
            'applications': 'Industrial machinery\nEquipment frames\nSupport structures',
            'category': categories[0],
            'is_featured': True,
            'order': 1
        },
        {
            'name': 'Architectural Window Profile',
            'description': 'Premium architectural aluminum profile for modern window systems',
            'features': 'Thermal insulation\nWeather resistant\nAesthetic design\nEnergy efficient',
            'applications': 'Residential windows\nCommercial buildings\nGreenhouse construction',
            'category': categories[1],
            'is_featured': True,
            'order': 2
        },
        {
            'name': 'Automotive Frame Profile',
            'description': 'Lightweight automotive aluminum profile for vehicle frame construction',
            'features': 'Lightweight\nHigh strength\nCrash resistant\nFuel efficient',
            'applications': 'Vehicle frames\nBody panels\nStructural components',
            'category': categories[2],
            'is_featured': False,
            'order': 3
        },
        {
            'name': 'Heavy Duty Industrial Profile',
            'description': 'Heavy duty industrial aluminum profile for demanding applications',
            'features': 'Extra high strength\nHeavy load capacity\nLong service life\nLow maintenance',
            'applications': 'Heavy machinery\nIndustrial equipment\nLoad bearing structures',
            'category': categories[0],
            'is_featured': False,
            'order': 4
        },
        {
            'name': 'Curtain Wall Profile',
            'description': 'Specialized aluminum profile for modern curtain wall systems',
            'features': 'Modern design\nExcellent sealing\nWind resistant\nThermal performance',
            'applications': 'Office buildings\nShopping centers\nHigh-rise construction',
            'category': categories[1],
            'is_featured': True,
            'order': 5
        }
    ]
    
    for prod_data in products_data:
        product, created = Product.objects.get_or_create(
            name=prod_data['name'],
            defaults={
                'description': prod_data['description'],
                'features': prod_data['features'],
                'applications': prod_data['applications'],
                'category': prod_data['category'],
                'is_featured': prod_data['is_featured'],
                'order': prod_data['order'],
                'slug': slugify(prod_data['name']),
                'is_active': True
            }
        )
        if created:
            print(f"创建产品: {product.name}")
        else:
            print(f"产品已存在: {product.name}")
    
    print(f"\n数据创建完成!")
    print(f"分类数量: {Category.objects.count()}")
    print(f"产品数量: {Product.objects.count()}")

if __name__ == '__main__':
    create_test_data() 