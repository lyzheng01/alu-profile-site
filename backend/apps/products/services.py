import requests
import json
import hashlib
import time
import os
from django.conf import settings
from django.core.cache import cache
from pathlib import Path
from deep_translator import GoogleTranslator


class TranslationService:
    """翻译服务 - 支持Google翻译API和多种触发机制"""
    
    def __init__(self):
        self.cache_timeout = getattr(settings, 'TRANSLATION_CACHE_TIMEOUT', 3600)  # 1小时缓存
        self.translations_dir = getattr(settings, 'TRANSLATIONS_DIR', Path(settings.BASE_DIR) / 'translations')
        
        # 确保翻译文件目录存在
        os.makedirs(self.translations_dir, exist_ok=True)
    
    def _get_cache_key(self, text, target_lang):
        """生成缓存键"""
        text_hash = hashlib.md5(text.encode('utf-8')).hexdigest()
        return f"translation_{text_hash}_{target_lang}"
    
    def _get_from_cache(self, text, target_lang):
        """从缓存获取翻译"""
        cache_key = self._get_cache_key(text, target_lang)
        return cache.get(cache_key)
    
    def _save_to_cache(self, text, target_lang, translated_text):
        """保存翻译到缓存"""
        cache_key = self._get_cache_key(text, target_lang)
        cache.set(cache_key, translated_text, self.cache_timeout)
    
    def _get_translation_file_path(self, model_name, language):
        """获取翻译文件路径"""
        return self.translations_dir / f"{model_name}_{language}.json"
    
    def _load_translations_from_file(self, model_name, language):
        """从文件加载翻译"""
        file_path = self._get_translation_file_path(model_name, language)
        print(f"[DEBUG] 尝试加载翻译文件: {file_path}")
        print(f"[DEBUG] 文件是否存在: {file_path.exists()}")
        if file_path.exists():
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = json.load(f)
                    print(f"[DEBUG] 成功加载翻译文件，内容长度: {len(content)}")
                    return content
            except Exception as e:
                print(f"加载翻译文件失败: {e}")
        else:
            print(f"[DEBUG] 翻译文件不存在: {file_path}")
        return {}
    
    def _save_translations_to_file(self, model_name, language, translations):
        """保存翻译到文件"""
        file_path = self._get_translation_file_path(model_name, language)
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(translations, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"保存翻译文件失败: {e}")
            return False
    
    def translate_text(self, text, target_lang='zh', source_lang='en'):
        """使用Google翻译API翻译文本"""
        if not text:
            return text
        
        # 如果目标语言是英语，直接返回原文
        if target_lang in ['en', 'en-US', 'en-GB']:
            return text
        
        # 检查缓存
        cached_result = self._get_from_cache(text, target_lang)
        if cached_result:
            return cached_result
        
        try:
            # 使用Google翻译API
            translator = GoogleTranslator(source=source_lang, target=target_lang)
            translated_text = translator.translate(text)
            
            # 保存到缓存
            self._save_to_cache(text, target_lang, translated_text)
            return translated_text
            
        except Exception as e:
            # 翻译失败时返回原文
            print(f"Google翻译失败: {e}")
            return text
    
    def translate_model_batch(self, model_name, objects, target_lang='zh', force=False):
        """批量翻译模型对象并保存到文件"""
        if target_lang in ['en', 'en-US', 'en-GB']:
            return {}  # 英语不需要翻译
        
        # 加载现有翻译
        translations = self._load_translations_from_file(model_name, target_lang)
        
        # 收集需要翻译的文本
        texts_to_translate = {}
        for obj in objects:
            # 根据模型类型收集需要翻译的字段
            if model_name == 'product':
                texts_to_translate[f"name_{obj.id}"] = obj.name
                texts_to_translate[f"description_{obj.id}"] = obj.description
                texts_to_translate[f"features_{obj.id}"] = obj.features
                texts_to_translate[f"applications_{obj.id}"] = obj.applications
            elif model_name == 'category':
                texts_to_translate[f"name_{obj.id}"] = obj.name
                texts_to_translate[f"description_{obj.id}"] = obj.description
            elif model_name == 'subcategory':
                texts_to_translate[f"name_{obj.id}"] = obj.name
                texts_to_translate[f"description_{obj.id}"] = obj.description
            elif model_name == 'article':
                texts_to_translate[f"title_{obj.id}"] = obj.title
                texts_to_translate[f"content_{obj.id}"] = obj.content
                texts_to_translate[f"excerpt_{obj.id}"] = obj.excerpt
            elif model_name == 'contact_info':
                texts_to_translate[f"name_{obj.id}"] = obj.name
                texts_to_translate[f"value_{obj.id}"] = obj.value
            elif model_name == 'company_info':
                texts_to_translate[f"value_{obj.id}"] = obj.value
            elif model_name == 'advantage':
                texts_to_translate[f"title_{obj.id}"] = obj.title
                texts_to_translate[f"description_{obj.id}"] = obj.description
            elif model_name == 'certificate':
                texts_to_translate[f"name_{obj.id}"] = obj.name
                texts_to_translate[f"description_{obj.id}"] = obj.description
        
        # 批量翻译
        translated_count = 0
        for key, text in texts_to_translate.items():
            if force or key not in translations:
                translated_text = self.translate_text(text, target_lang)
                translations[key] = translated_text
                translated_count += 1
                # 添加延迟避免API限制
                time.sleep(0.2)
        
        # 保存到文件
        if translated_count > 0:
            self._save_translations_to_file(model_name, target_lang, translations)
        
        return translations
    
    def translate_single_object(self, model_name, obj, target_lang='zh'):
        """翻译单个对象"""
        if target_lang in ['en', 'en-US', 'en-GB']:
            return {}  # 英语不需要翻译
        
        # 加载现有翻译
        translations = self._load_translations_from_file(model_name, target_lang)
        
        # 收集需要翻译的文本
        texts_to_translate = {}
        if model_name == 'product':
            texts_to_translate[f"name_{obj.id}"] = obj.name
            texts_to_translate[f"description_{obj.id}"] = obj.description
            texts_to_translate[f"features_{obj.id}"] = obj.features
            texts_to_translate[f"applications_{obj.id}"] = obj.applications
        elif model_name == 'category':
            texts_to_translate[f"name_{obj.id}"] = obj.name
            texts_to_translate[f"description_{obj.id}"] = obj.description
        elif model_name == 'subcategory':
            texts_to_translate[f"name_{obj.id}"] = obj.name
            texts_to_translate[f"description_{obj.id}"] = obj.description
        elif model_name == 'article':
            texts_to_translate[f"title_{obj.id}"] = obj.title
            texts_to_translate[f"content_{obj.id}"] = obj.content
            texts_to_translate[f"excerpt_{obj.id}"] = obj.excerpt
        elif model_name == 'contact_info':
            texts_to_translate[f"name_{obj.id}"] = obj.name
            texts_to_translate[f"value_{obj.id}"] = obj.value
        elif model_name == 'company_info':
            texts_to_translate[f"value_{obj.id}"] = obj.value
        elif model_name == 'advantage':
            texts_to_translate[f"title_{obj.id}"] = obj.title
            texts_to_translate[f"description_{obj.id}"] = obj.description
        elif model_name == 'certificate':
            texts_to_translate[f"name_{obj.id}"] = obj.name
            texts_to_translate[f"description_{obj.id}"] = obj.description
        
        # 翻译
        for key, text in texts_to_translate.items():
            translated_text = self.translate_text(text, target_lang)
            translations[key] = translated_text
            time.sleep(0.2)  # 延迟避免API限制
        
        # 保存到文件
        self._save_translations_to_file(model_name, target_lang, translations)
        return translations
    
    def get_translated_text(self, model_name, obj_id, field_name, target_lang='zh'):
        """从文件获取翻译文本"""
        if target_lang in ['en', 'en-US', 'en-GB']:
            return None  # 英语返回None，使用原文
        
        translations = self._load_translations_from_file(model_name, target_lang)
        key = f"{field_name}_{obj_id}"
        return translations.get(key)
    
    def translate_product(self, product, target_lang='zh'):
        """翻译产品信息"""
        if target_lang == 'en':
            return {
                'name': product.name,
                'description': product.description,
                'features': product.features,
                'applications': product.applications,
            }
        
        # 从文件获取翻译
        translated_name = self.get_translated_text('product', product.id, 'name', target_lang) or product.name
        translated_description = self.get_translated_text('product', product.id, 'description', target_lang) or product.description
        translated_features = self.get_translated_text('product', product.id, 'features', target_lang) or product.features
        translated_applications = self.get_translated_text('product', product.id, 'applications', target_lang) or product.applications
        
        return {
            'name': translated_name,
            'description': translated_description,
            'features': translated_features,
            'applications': translated_applications,
        }
    
    def translate_category(self, category, target_lang='zh'):
        """翻译分类信息"""
        if target_lang == 'en':
            return {
                'name': category.name,
                'description': category.description,
            }
        
        # 从文件获取翻译
        translated_name = self.get_translated_text('category', category.id, 'name', target_lang) or category.name
        translated_description = self.get_translated_text('category', category.id, 'description', target_lang) or category.description
        
        return {
            'name': translated_name,
            'description': translated_description,
        }
    
    def translate_subcategory(self, subcategory, target_lang='zh'):
        """翻译子分类信息"""
        if target_lang == 'en':
            return {
                'name': subcategory.name,
                'description': subcategory.description,
            }
        
        # 从文件获取翻译
        translated_name = self.get_translated_text('subcategory', subcategory.id, 'name', target_lang) or subcategory.name
        translated_description = self.get_translated_text('subcategory', subcategory.id, 'description', target_lang) or subcategory.description
        
        return {
            'name': translated_name,
            'description': translated_description,
        }
    
    def translate_article(self, article, target_lang='zh'):
        """翻译文章信息"""
        if target_lang == 'en':
            return {
                'title': article.title,
                'content': article.content,
                'excerpt': article.excerpt,
            }
        
        # 从文件获取翻译
        translated_title = self.get_translated_text('article', article.id, 'title', target_lang) or article.title
        translated_content = self.get_translated_text('article', article.id, 'content', target_lang) or article.content
        translated_excerpt = self.get_translated_text('article', article.id, 'excerpt', target_lang) or article.excerpt
        
        return {
            'title': translated_title,
            'content': translated_content,
            'excerpt': translated_excerpt,
        }
    
    def auto_translate_on_save(self, instance, model_name):
        """保存时自动翻译"""
        # 获取支持的语言列表（排除英语）
        supported_languages = ['zh', 'es', 'pt', 'fr', 'de', 'it', 'ru', 'hi']
        
        for lang in supported_languages:
            try:
                self.translate_single_object(model_name, instance, lang)
                print(f"自动翻译完成: {model_name} ID {instance.id} -> {lang}")
            except Exception as e:
                print(f"自动翻译失败: {model_name} ID {instance.id} -> {lang}, 错误: {e}")
    
    def get_translation_status(self, model_name, obj_id, target_lang='zh'):
        """获取翻译状态"""
        if target_lang in ['en', 'en-US', 'en-GB']:
            return {'status': 'not_needed', 'message': '英语不需要翻译'}
        
        translations = self._load_translations_from_file(model_name, target_lang)
        
        # 检查所有字段是否已翻译
        fields_to_check = []
        if model_name == 'product':
            fields_to_check = ['name', 'description', 'features', 'applications']
        elif model_name == 'category':
            fields_to_check = ['name', 'description']
        elif model_name == 'subcategory':
            fields_to_check = ['name', 'description']
        elif model_name == 'article':
            fields_to_check = ['title', 'content', 'excerpt']
        elif model_name == 'contact_info':
            fields_to_check = ['name', 'value']
        elif model_name == 'company_info':
            fields_to_check = ['value']
        elif model_name == 'advantage':
            fields_to_check = ['title', 'description']
        elif model_name == 'certificate':
            fields_to_check = ['name', 'description']
        
        translated_fields = []
        missing_fields = []
        
        for field in fields_to_check:
            key = f"{field}_{obj_id}"
            if key in translations:
                translated_fields.append(field)
            else:
                missing_fields.append(field)
        
        if len(missing_fields) == 0:
            return {'status': 'completed', 'message': '翻译完成', 'translated_fields': translated_fields}
        elif len(translated_fields) == 0:
            return {'status': 'not_started', 'message': '未开始翻译', 'missing_fields': missing_fields}
        else:
            return {
                'status': 'partial', 
                'message': '部分翻译完成', 
                'translated_fields': translated_fields,
                'missing_fields': missing_fields
            }
    
    def clear_cache(self):
        """清除翻译缓存"""
        # 这里可以添加清除特定缓存的逻辑
        pass

    def translate_frontend_content(self, content_key, target_lang='zh', source_lang='en'):
        """翻译前端固定内容"""
        if target_lang in ['en', 'en-US', 'en-GB']:
            return self.get_frontend_content(content_key, 'en')
        
        # 检查缓存
        cache_key = f"frontend_{content_key}_{target_lang}"
        cached_result = cache.get(cache_key)
        if cached_result:
            return cached_result
        
        # 获取英语原文
        original_text = self.get_frontend_content(content_key, 'en')
        if not original_text:
            return content_key
        
        try:
            # 使用Google翻译API
            translator = GoogleTranslator(source=source_lang, target=target_lang)
            translated_text = translator.translate(original_text)
            
            # 保存到缓存
            cache.set(cache_key, translated_text, self.cache_timeout)
            return translated_text
            
        except Exception as e:
            print(f"前端内容翻译失败: {e}")
            return original_text
    
    def get_frontend_content(self, content_key, language='en'):
        """获取前端固定内容"""
        # 前端固定内容字典（英语为默认语言）
        frontend_content = {
            'en': {
                # 首页内容
                'home_title': 'LingYe Aluminum',
                'home_subtitle': 'Providing high-quality aluminum profile solutions to meet your various needs. 20 years of professional experience, exporting to 30+ countries worldwide, a trustworthy partner.',
                'home_cta_button': 'Inquire Now',
                'home_why_choose_title': 'Why Choose Us',
                'home_why_choose_subtitle': 'We have a professional team and advanced technology',
                'home_new_products_title': 'New Products',
                'home_new_products_subtitle': 'Latest high-quality products',
                'home_quote_title': 'Request A Free Quote',
                'home_quote_subtitle': 'You can contact us any way that is convenient for you. Shengxin Provide Services 24/7 via fax, email or telephone.',
                
                # 导航菜单
                'nav_home': 'Home',
                'nav_products': 'Products',
                'nav_news': 'News',
                'nav_about': 'About Us',
                'nav_contact': 'Contact',
                
                # 页面标题
                'page_products_title': 'Products',
                'page_products_subtitle': 'Rich product line to meet various application needs',
                'page_news_title': 'News',
                'page_news_subtitle': 'Learn about the latest technology trends and industry information',
                'page_about_title': 'About Us',
                'page_about_subtitle': 'Learn about our company history and advantages',
                'page_contact_title': 'Contact Us',
                'page_contact_subtitle': 'Always ready to provide professional service support',
                
                # 按钮和链接
                'btn_view_details': 'View Details',
                'btn_learn_more': 'Learn More',
                'btn_contact_us': 'Contact Us',
                'btn_request_quote': 'Get Quote',
                'btn_search': 'Search',
                'btn_filter': 'Filter',
                'btn_clear': 'Clear',
                'btn_submit': 'Submit',
                'btn_cancel': 'Cancel',
                'btn_close': 'Close',
                
                # 表单标签
                'form_name': 'Name',
                'form_email': 'Email',
                'form_phone': 'Phone',
                'form_message': 'Message',
                'form_company': 'Company',
                'form_subject': 'Subject',
                'form_required': 'Required',
                'form_optional': 'Optional',
                
                # 状态信息
                'status_loading': 'Loading...',
                'status_no_data': 'No Data',
                'status_error': 'Load Failed',
                'status_success': 'Success',
                'status_failed': 'Failed',
                
                # 页脚信息
                'footer_copyright': '© 2024 Aluminum Profile Manufacturer. All rights reserved.',
                'footer_address': 'Address',
                'footer_phone': 'Phone',
                'footer_email': 'Email',
                'footer_wechat': 'WeChat',
                'footer_whatsapp': 'WhatsApp',
                
                # 联系信息
                'contact_24_7': '24/7 Service',
                'contact_free_quote': 'Free Quote',
                'contact_technical_support': 'Technical Support',
                'contact_sales_inquiry': 'Sales Inquiry',
                
                # 产品相关
                'product_features': 'Product Features',
                'product_applications': 'Applications',
                'product_specifications': 'Specifications',
                'product_inquiry': 'Product Inquiry',
                'product_category': 'Product Category',
                'product_search': 'Search Products',
                'product_filter': 'Filter Products',
                
                # 新闻相关
                'news_latest': 'Latest News',
                'news_popular': 'Popular Articles',
                'news_category': 'News Category',
                'news_read_more': 'Read More',
                'news_published': 'Published',
                'news_author': 'Author',
                'news_tags': 'Tags',
                
                # 关于我们
                'about_history': 'Company History',
                'about_mission': 'Company Mission',
                'about_vision': 'Company Vision',
                'about_values': 'Company Values',
                'about_team': 'Team Introduction',
                'about_certificates': 'Certificates',
                'about_factory': 'Factory Showcase',
                
                # 资讯相关
                'news_title': 'News',
                'news_subtitle': 'Learn about the latest technology trends and industry information',
                'news_read_more': 'Read More',
                'news_published': 'Published',
                'news_author': 'Author',
                'news_tags': 'Tags',
                'news_category': 'News Category',
                'news_search': 'Search News',
                'news_filter': 'Filter News',
                
                # 语言切换
                'lang_en': 'English',
                'lang_zh': '中文',
                'lang_es': 'Español',
                'lang_pt': 'Português',
                'lang_fr': 'Français',
                'lang_de': 'Deutsch',
                'lang_it': 'Italiano',
                'lang_ru': 'Русский',
                'lang_hi': 'हिन्दी',
            }
        }
        
        # 如果content_key为空，返回整个字典
        if not content_key:
            return frontend_content.get(language, {})
        
        # 否则返回特定键的值
        return frontend_content.get(language, {}).get(content_key, content_key)
    
    def get_all_frontend_content(self, target_lang='zh'):
        """获取所有前端内容的翻译"""
        print(f"[DEBUG] get_all_frontend_content 被调用，target_lang: {target_lang}")
        if target_lang in ['en', 'en-US', 'en-GB']:
            # 返回英语内容字典
            print(f"[DEBUG] 返回英语内容")
            return self.get_frontend_content('', 'en')
        
        # 尝试从预翻译文件加载
        print(f"[DEBUG] 尝试从文件加载 frontend_{target_lang}.json")
        translations = self._load_translations_from_file('frontend', target_lang)
        if translations:
            print(f"[DEBUG] 成功从文件加载翻译，返回 {len(translations)} 个翻译项")
            return translations
        
        # 如果没有预翻译文件，则实时翻译并保存
        en_content = self.get_frontend_content('', 'en')
        translated_content = {}
        
        # 确保en_content是字典
        if isinstance(en_content, dict):
            print(f"正在为前端内容创建{target_lang}翻译...")
            for key in en_content.keys():
                translated_content[key] = self.translate_frontend_content(key, target_lang)
                time.sleep(0.1)  # 避免API限制
            
            # 保存到文件
            self._save_translations_to_file('frontend', target_lang, translated_content)
            print(f"前端内容{target_lang}翻译已保存到文件")
        else:
            # 如果en_content不是字典，返回空字典
            print(f"警告: en_content不是字典类型: {type(en_content)}")
            return {}
        
        return translated_content


# 全局翻译服务实例
translation_service = TranslationService() 