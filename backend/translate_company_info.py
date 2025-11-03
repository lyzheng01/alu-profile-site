#!/usr/bin/env python
"""
翻译数据库中的公司信息
"""
import os
import sys
import django

# 设置Django环境
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aluminum.settings')
django.setup()

from apps.about.models import CompanyInfo
from deep_translator import GoogleTranslator

def translate_company_info():
    """翻译公司信息"""
    print("开始翻译公司信息...")
    
    # 需要翻译的字段
    fields_to_translate = [
        'company_name',
        'company_description', 
        'company_vision',
        'company_mission'
    ]
    
    for field_key in fields_to_translate:
        try:
            # 获取公司信息
            company_info = CompanyInfo.objects.filter(key=field_key).first()
            if company_info:
                print(f"翻译字段: {field_key}")
                print(f"原文: {company_info.value}")
                
                # 检查是否已经是中文
                if company_info.value and not company_info.value.isascii():
                    print(f"  已经是中文，跳过")
                    continue
                
                # 翻译
                translated_value = GoogleTranslator(source='en', target='zh-CN').translate(company_info.value)
                company_info.value = translated_value
                company_info.save()
                
                print(f"  翻译为: {translated_value}")
                print(f"  翻译完成")
                
        except Exception as e:
            print(f"  翻译字段 '{field_key}' 失败: {e}")
    
    print("公司信息翻译完成！")

if __name__ == '__main__':
    translate_company_info()
