from django.contrib import admin
from django.http import JsonResponse
from django.urls import path
from django.utils.html import format_html
from django.contrib import messages
from django.utils import timezone
from django import forms
from .models import Product, Category, SubCategory, ProductImage, TranslationLog, TranslationManagement, ProductSpecification, ProductFeature, ProductApplication
from .widgets import ExcelTableWidget
from apps.news.models import Article
from apps.about.models import CompanyInfo, Advantage, Certificate
from apps.inquiry.models import ContactInfo
from .services import translation_service
import json
import time


class ProductForm(forms.ModelForm):
    """产品表单 - 使用Excel风格表格widget"""
    features = forms.CharField(
        widget=ExcelTableWidget(),
        required=False,
        help_text="使用Excel风格表格输入产品特性，支持键盘导航和实时编辑"
    )
    
    class Meta:
        model = Product
        fields = '__all__'


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'is_active', 'order', 'subcategory_count', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['order', '-created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()
    
    def subcategory_count(self, obj):
        """显示子分类数量"""
        count = obj.subcategories.count()
        if count == 0:
            return format_html('<span style="color: gray;">0 个子分类</span>')
        else:
            return format_html('<span style="color: blue;">{} 个子分类</span>', count)
    
    subcategory_count.short_description = '子分类数量'


@admin.register(SubCategory)
class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent_category', 'description', 'is_active', 'order', 'created_at']
    list_filter = ['parent_category', 'is_active', 'created_at']
    search_fields = ['name', 'description', 'parent_category__name']
    ordering = ['parent_category__order', 'order', 'name']
    prepopulated_fields = {'slug': ('name',)}
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('parent_category')


class ProductImageInline(admin.TabularInline):
    """产品图片内联编辑"""
    model = ProductImage
    extra = 1
    fields = ['image', 'caption', 'is_primary', 'order']
    ordering = ['order', 'created_at']


class ProductSpecificationInline(admin.TabularInline):
    """产品技术规格内联编辑"""
    model = ProductSpecification
    extra = 1
    fields = ['name', 'value', 'order']
    ordering = ['order', 'created_at']
    verbose_name = '技术规格'
    verbose_name_plural = '技术规格'


class ProductFeatureInline(admin.TabularInline):
    """产品特性内联编辑"""
    model = ProductFeature
    extra = 1
    fields = ['name', 'description', 'order']
    ordering = ['order', 'created_at']
    verbose_name = '产品特性'
    verbose_name_plural = '产品特性'


class ProductApplicationInline(admin.TabularInline):
    """产品应用领域内联编辑"""
    model = ProductApplication
    extra = 1
    fields = ['name', 'description', 'order']
    ordering = ['order', 'created_at']
    verbose_name = '应用领域'
    verbose_name_plural = '应用领域'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    form = ProductForm
    list_display = ['name', 'category', 'subcategory', 'is_featured', 'is_active', 'order', 'created_at', 'translation_status', 'image_count']
    list_filter = ['category', 'subcategory', 'is_featured', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['order', '-created_at']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]
    
    # 字段配置
    fields = ['category', 'subcategory', 'name', 'description', 'features', 'applications', 'specifications', 
              'range_param', 'type_param', 'surface_treatment', 'colors', 'grade', 'temper', 
              'slug', 'is_featured', 'is_active', 'order']
    exclude = []
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('category', 'subcategory').prefetch_related('images')
    
    def image_count(self, obj):
        """显示图片数量"""
        count = obj.images.count()
        if count == 0:
            return format_html('<span style="color: red;">0 张图片</span>')
        elif count == 1:
            return format_html('<span style="color: orange;">1 张图片</span>')
        else:
            return format_html('<span style="color: green;">{} 张图片</span>', count)
    
    image_count.short_description = '图片数量'
    
    def translation_status(self, obj):
        """显示翻译状态"""
        status = translation_service.get_translation_status('product', obj.id, 'zh')
        if status['status'] == 'completed':
            return format_html('<span style="color: green;">✅ 已翻译</span>')
        elif status['status'] == 'partial':
            return format_html('<span style="color: orange;">⚠ 部分翻译</span>')
        else:
            return format_html('<span style="color: red;">✗ 未翻译</span>')
    
    translation_status.short_description = '翻译状态'


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'image_preview', 'caption', 'is_primary', 'order', 'created_at']
    list_filter = ['is_primary', 'created_at', 'product__category']
    search_fields = ['product__name', 'caption']
    ordering = ['product__name', 'order', 'created_at']
    list_editable = ['is_primary', 'order']
    
    def image_preview(self, obj):
        """图片预览"""
        if obj.image:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 50px; object-fit: cover;" />',
                obj.image.url
            )
        return "无图片"
    
    image_preview.short_description = '图片预览'


@admin.register(TranslationLog)
class TranslationLogAdmin(admin.ModelAdmin):
    list_display = ['translation_type', 'target_language', 'status', 'items_processed', 'items_success', 'success_rate', 'duration', 'created_at']
    list_filter = ['translation_type', 'status', 'target_language', 'created_at']
    search_fields = ['message', 'logs']
    readonly_fields = ['created_at', 'success_rate']
    ordering = ['-created_at']
    
    def success_rate(self, obj):
        """显示成功率"""
        return f"{obj.success_rate}%"
    success_rate.short_description = '成功率'


@admin.register(TranslationManagement)
class TranslationAdmin(admin.ModelAdmin):
    """翻译管理"""
    change_list_template = 'admin/translation_changelist.html'
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('translate-frontend/', self.translate_frontend, name='translate_frontend'),
            path('translate-products/', self.translate_products, name='translate_products'),
            path('translate-categories/', self.translate_categories, name='translate_categories'),
            path('translate-articles/', self.translate_articles, name='translate_articles'),
            path('translate-all/', self.translate_all, name='translate_all'),
            path('translation-logs/', self.get_translation_logs, name='translation_logs'),
        ]
        return custom_urls + urls
    
    def create_translation_log(self, translation_type, target_language, status, message, logs, items_processed=0, items_success=0, items_failed=0, duration=None):
        """创建翻译日志"""
        return TranslationLog.objects.create(
            translation_type=translation_type,
            target_language=target_language,
            status=status,
            message=message,
            logs=logs,
            items_processed=items_processed,
            items_success=items_success,
            items_failed=items_failed,
            duration=duration
        )
    
    def translate_frontend(self, request):
        """翻译前端内容"""
        start_time = time.time()
        try:
            from django.core.management import call_command
            from io import StringIO
            
            # 捕获命令输出
            out = StringIO()
            call_command('translate_frontend', '--all-languages', stdout=out)
            
            logs = out.getvalue()
            duration = time.time() - start_time
            
            # 创建日志记录
            log_entry = self.create_translation_log(
                translation_type='frontend',
                target_language='all',
                status='success',
                message='前端内容翻译完成（英语→其他语言）',
                logs=logs,
                items_processed=88,  # 前端内容总数
                items_success=88,
                duration=duration
            )
            
            return JsonResponse({
                'success': True,
                'message': '前端内容翻译完成（英语→其他语言）',
                'logs': logs,
                'log_id': log_entry.id
            })
        except Exception as e:
            duration = time.time() - start_time
            error_message = f'翻译失败: {str(e)}'
            
            # 创建失败日志记录
            log_entry = self.create_translation_log(
                translation_type='frontend',
                target_language='all',
                status='failed',
                message=error_message,
                logs=str(e),
                duration=duration
            )
            
            return JsonResponse({
                'success': False,
                'message': error_message,
                'log_id': log_entry.id
            })
    
    def translate_products(self, request):
        """翻译产品内容"""
        start_time = time.time()
        try:
            from django.core.management import call_command
            from io import StringIO
            
            out = StringIO()
            call_command('translate_content', '--all-languages', '--model', 'product', stdout=out)
            
            logs = out.getvalue()
            duration = time.time() - start_time
            
            # 统计产品数量
            products_count = Product.objects.count()
            
            log_entry = self.create_translation_log(
                translation_type='product',
                target_language='all',
                status='success',
                message='产品翻译完成（英语→其他语言）',
                logs=logs,
                items_processed=products_count,
                items_success=products_count,
                duration=duration
            )
            
            return JsonResponse({
                'success': True,
                'message': '产品翻译完成（英语→其他语言）',
                'logs': logs,
                'log_id': log_entry.id
            })
        except Exception as e:
            duration = time.time() - start_time
            error_message = f'翻译失败: {str(e)}'
            
            log_entry = self.create_translation_log(
                translation_type='product',
                target_language='all',
                status='failed',
                message=error_message,
                logs=str(e),
                duration=duration
            )
            
            return JsonResponse({
                'success': False,
                'message': error_message,
                'log_id': log_entry.id
            })
    
    def translate_categories(self, request):
        """翻译分类内容"""
        start_time = time.time()
        try:
            from django.core.management import call_command
            from io import StringIO
            
            out = StringIO()
            call_command('translate_content', '--all-languages', '--model', 'category', stdout=out)
            
            logs = out.getvalue()
            duration = time.time() - start_time
            
            categories_count = Category.objects.count()
            
            log_entry = self.create_translation_log(
                translation_type='category',
                target_language='all',
                status='success',
                message='分类翻译完成（英语→其他语言）',
                logs=logs,
                items_processed=categories_count,
                items_success=categories_count,
                duration=duration
            )
            
            return JsonResponse({
                'success': True,
                'message': '分类翻译完成（英语→其他语言）',
                'logs': logs,
                'log_id': log_entry.id
            })
        except Exception as e:
            duration = time.time() - start_time
            error_message = f'翻译失败: {str(e)}'
            
            log_entry = self.create_translation_log(
                translation_type='category',
                target_language='all',
                status='failed',
                message=error_message,
                logs=str(e),
                duration=duration
            )
            
            return JsonResponse({
                'success': False,
                'message': error_message,
                'log_id': log_entry.id
            })
    
    def translate_articles(self, request):
        """翻译文章内容（资讯）"""
        start_time = time.time()
        try:
            from django.core.management import call_command
            from io import StringIO
            
            out = StringIO()
            call_command('translate_content', '--all-languages', '--model', 'article', stdout=out)
            
            logs = out.getvalue()
            duration = time.time() - start_time
            
            articles_count = Article.objects.filter(status='published').count()
            
            log_entry = self.create_translation_log(
                translation_type='article',
                target_language='all',
                status='success',
                message='文章翻译完成（英语→其他语言）',
                logs=logs,
                items_processed=articles_count,
                items_success=articles_count,
                duration=duration
            )
            
            return JsonResponse({
                'success': True,
                'message': '文章翻译完成（英语→其他语言）',
                'logs': logs,
                'log_id': log_entry.id
            })
        except Exception as e:
            duration = time.time() - start_time
            error_message = f'翻译失败: {str(e)}'
            
            log_entry = self.create_translation_log(
                translation_type='article',
                target_language='all',
                status='failed',
                message=error_message,
                logs=str(e),
                duration=duration
            )
            
            return JsonResponse({
                'success': False,
                'message': error_message,
                'log_id': log_entry.id
            })
    
    def translate_all(self, request):
        """翻译所有内容"""
        start_time = time.time()
        try:
            from django.core.management import call_command
            from io import StringIO
            
            out = StringIO()
            # 翻译前端内容
            call_command('translate_frontend', '--all-languages', stdout=out)
            # 翻译所有内容
            call_command('translate_content', '--all-languages', '--model', 'all', stdout=out)
            
            logs = out.getvalue()
            duration = time.time() - start_time
            
            # 统计所有内容数量
            total_items = (
                88 +  # 前端内容
                Product.objects.count() +  # 产品
                Category.objects.count() +  # 分类
                Article.objects.filter(status='published').count() +  # 文章
                ContactInfo.objects.filter(is_active=True).count() +  # 联系信息
                CompanyInfo.objects.filter(is_active=True).count() +  # 公司信息
                Advantage.objects.filter(is_active=True).count() +  # 企业优势
                Certificate.objects.filter(is_active=True).count()  # 证书
            )
            
            log_entry = self.create_translation_log(
                translation_type='all',
                target_language='all',
                status='success',
                message='所有内容翻译完成（英语→其他语言）',
                logs=logs,
                items_processed=total_items,
                items_success=total_items,
                duration=duration
            )
            
            return JsonResponse({
                'success': True,
                'message': '所有内容翻译完成（英语→其他语言）',
                'logs': logs,
                'log_id': log_entry.id
            })
        except Exception as e:
            duration = time.time() - start_time
            error_message = f'翻译失败: {str(e)}'
            
            log_entry = self.create_translation_log(
                translation_type='all',
                target_language='all',
                status='failed',
                message=error_message,
                logs=str(e),
                duration=duration
            )
            
            return JsonResponse({
                'success': False,
                'message': error_message,
                'log_id': log_entry.id
            })
    
    def get_translation_logs(self, request):
        """获取翻译日志"""
        try:
            # 获取最近的翻译日志
            recent_logs = TranslationLog.objects.all()[:10]
            logs_text = "最近的翻译日志:\n\n"
            
            for log in recent_logs:
                logs_text += f"[{log.created_at.strftime('%Y-%m-%d %H:%M:%S')}] "
                logs_text += f"{log.get_translation_type_display()} -> {log.target_language} "
                logs_text += f"({log.get_status_display()}) "
                logs_text += f"- 处理: {log.items_processed}, 成功: {log.items_success}, "
                logs_text += f"耗时: {log.duration:.2f}秒\n"
                logs_text += f"消息: {log.message}\n\n"
            
            return JsonResponse({
                'success': True,
                'logs': logs_text
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': f'获取日志失败: {str(e)}'
            })
