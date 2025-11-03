#!/usr/bin/env python
"""
翻译数据库中的产品内容
"""
import os
import sys
import django

# 设置Django环境
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aluminum.settings')
django.setup()

from apps.products.models import Category, Product
from apps.products.services import translation_service
from deep_translator import GoogleTranslator

def translate_categories():
    """翻译产品分类"""
    print("开始翻译产品分类...")
    
    categories = Category.objects.all()
    for category in categories:
        print(f"翻译分类: {category.name}")
        
        try:
            # 翻译分类名称
            if category.name and not category.name.isascii():
                print(f"  分类名称 '{category.name}' 已经是中文，跳过")
            else:
                translated_name = GoogleTranslator(source='en', target='zh-CN').translate(category.name)
                category.name = translated_name
                print(f"  分类名称翻译为: {translated_name}")
            
            # 翻译分类描述
            if category.description:
                if not category.description.isascii():
                    print(f"  分类描述已经是中文，跳过")
                else:
                    translated_desc = GoogleTranslator(source='en', target='zh-CN').translate(category.description)
                    category.description = translated_desc
                    print(f"  分类描述翻译为: {translated_desc}")
            
            category.save()
            print(f"  分类 '{category.name}' 翻译完成")
            
        except Exception as e:
            print(f"  翻译分类 '{category.name}' 失败: {e}")
    
    print("产品分类翻译完成！")

def translate_products():
    """翻译产品内容"""
    print("开始翻译产品内容...")
    
    products = Product.objects.all()
    for product in products:
        print(f"翻译产品: {product.name}")
        
        try:
            # 翻译产品名称
            if product.name and not product.name.isascii():
                print(f"  产品名称 '{product.name}' 已经是中文，跳过")
            else:
                translated_name = GoogleTranslator(source='en', target='zh-CN').translate(product.name)
                product.name = translated_name
                print(f"  产品名称翻译为: {translated_name}")
            
            # 翻译产品描述
            if product.description:
                if not product.description.isascii():
                    print(f"  产品描述已经是中文，跳过")
                else:
                    translated_desc = GoogleTranslator(source='en', target='zh-CN').translate(product.description)
                    product.description = translated_desc
                    print(f"  产品描述翻译为: {translated_desc}")
            
            # 翻译产品特性
            if product.features:
                if not product.features.isascii():
                    print(f"  产品特性已经是中文，跳过")
                else:
                    translated_features = GoogleTranslator(source='en', target='zh-CN').translate(product.features)
                    product.features = translated_features
                    print(f"  产品特性翻译为: {translated_features}")
            
            # 翻译应用领域
            if product.applications:
                if not product.applications.isascii():
                    print(f"  应用领域已经是中文，跳过")
                else:
                    translated_apps = GoogleTranslator(source='en', target='zh-CN').translate(product.applications)
                    product.applications = translated_apps
                    print(f"  应用领域翻译为: {translated_apps}")
            
            product.save()
            print(f"  产品 '{product.name}' 翻译完成")
            
        except Exception as e:
            print(f"  翻译产品 '{product.name}' 失败: {e}")
    
    print("产品内容翻译完成！")

if __name__ == '__main__':
    print("开始翻译数据库中的产品内容...")
    
    # 翻译分类
    translate_categories()
    
    # 翻译产品
    translate_products()
    
    print("所有翻译完成！")
