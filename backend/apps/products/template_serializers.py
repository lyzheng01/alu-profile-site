"""
模板序列化器和工具函数
"""
from rest_framework import serializers
from .models import (
    ProductTemplate, TemplateSpecification, TemplateFeature, 
    TemplateApplication, TemplateFactoryImage, TemplateProcess, Product
)


class TemplateSpecificationSerializer(serializers.ModelSerializer):
    """模板技术规格序列化器"""
    class Meta:
        model = TemplateSpecification
        fields = ['id', 'name', 'value', 'order']
        read_only_fields = ['id']


class TemplateFeatureSerializer(serializers.ModelSerializer):
    """模板特性序列化器"""
    class Meta:
        model = TemplateFeature
        fields = ['id', 'name', 'description', 'order']
        read_only_fields = ['id']


class TemplateApplicationSerializer(serializers.ModelSerializer):
    """模板应用领域序列化器"""
    class Meta:
        model = TemplateApplication
        fields = ['id', 'name', 'description', 'image', 'order']
        read_only_fields = ['id']


class TemplateFactoryImageSerializer(serializers.ModelSerializer):
    """模板工厂图片序列化器"""
    class Meta:
        model = TemplateFactoryImage
        fields = ['id', 'title', 'description', 'image', 'category', 'order']
        read_only_fields = ['id']


class TemplateProcessSerializer(serializers.ModelSerializer):
    """模板工艺处理序列化器"""
    class Meta:
        model = TemplateProcess
        fields = ['id', 'name', 'description', 'image', 'order']
        read_only_fields = ['id']


class ProductTemplateSerializer(serializers.ModelSerializer):
    """产品模板序列化器"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    subcategory_name = serializers.CharField(source='subcategory.name', read_only=True)
    specification_items = TemplateSpecificationSerializer(many=True, read_only=True)
    feature_items = TemplateFeatureSerializer(many=True, read_only=True)
    application_items = TemplateApplicationSerializer(many=True, read_only=True)
    factory_images = TemplateFactoryImageSerializer(many=True, read_only=True)
    process_items = TemplateProcessSerializer(many=True, read_only=True)
    
    class Meta:
        model = ProductTemplate
        fields = [
            'id', 'name', 'category', 'category_name', 'subcategory', 'subcategory_name',
            'range_param', 'type_param', 'surface_treatment', 'colors', 'grade', 'temper',
            'description', 'features_text', 'applications_text', 'specifications_text', 'packaging_details',
            'oem_available', 'free_samples', 'supply_ability', 'payment_terms',
            'product_origin', 'shipping_port', 'lead_time',
            'is_active', 'order', 'created_at', 'updated_at',
            'specification_items', 'feature_items', 'application_items', 'factory_images', 'process_items'
        ]
        read_only_fields = ['created_at', 'updated_at']


def get_product_template(product):
    """获取产品匹配的模板 - 支持多模板"""
    # 优先级1：产品直接关联的模板（最高优先级）
    if hasattr(product, 'template') and product.template:
        if product.template.is_active:
            return product.template
    
    # 如果产品设置了不使用模板，返回None
    if hasattr(product, 'use_template') and not product.use_template:
        return None
    
    # 优先级2：子分类模板
    if product.subcategory:
        template = ProductTemplate.objects.filter(
            subcategory=product.subcategory,
            category__isnull=True,  # 只匹配子分类模板（不包含分类模板）
            is_active=True
        ).order_by('order').first()
        if template:
            return template
    
    # 优先级3：分类模板
    if product.category:
        template = ProductTemplate.objects.filter(
            category=product.category,
            subcategory__isnull=True,  # 只匹配分类模板
            is_active=True
        ).order_by('order').first()
        if template:
            return template
    
    return None


def merge_template_data(product_data, template):
    """合并模板数据到产品数据（字典格式）"""
    if not template:
        return product_data
    
    # 基础参数：产品有值则用产品值，否则用模板值
    if not product_data.get('range_param'):
        product_data['range_param'] = template.range_param or ''
    if not product_data.get('type_param'):
        product_data['type_param'] = template.type_param or ''
    if not product_data.get('surface_treatment'):
        product_data['surface_treatment'] = template.surface_treatment or ''
    if not product_data.get('colors'):
        product_data['colors'] = template.colors or ''
    if not product_data.get('grade'):
        product_data['grade'] = template.grade or ''
    if not product_data.get('temper'):
        product_data['temper'] = template.temper or ''
    
    # 描述和内容
    if not product_data.get('description'):
        product_data['description'] = template.description or ''
    if not product_data.get('features'):
        product_data['features'] = template.features_text or ''
    if not product_data.get('applications'):
        product_data['applications'] = template.applications_text or ''
    if not product_data.get('specifications'):
        product_data['specifications'] = template.specifications_text or ''
    
    # 结构化数据：如果产品没有或为空，使用模板的
    # 注意：这里需要检查产品是否已经有这些数据（可能是空数组）
    if not product_data.get('specification_items') or len(product_data.get('specification_items', [])) == 0:
        product_data['specification_items'] = [
            {
                'id': item.id,
                'name': item.name,
                'value': item.value,
                'order': item.order
            }
            for item in template.specification_items.all().order_by('order')
        ]
    
    if not product_data.get('feature_items') or len(product_data.get('feature_items', [])) == 0:
        product_data['feature_items'] = [
            {
                'id': item.id,
                'name': item.name,
                'description': item.description,
                'order': item.order
            }
            for item in template.feature_items.all().order_by('order')
        ]
    
    if not product_data.get('application_items') or len(product_data.get('application_items', [])) == 0:
        product_data['application_items'] = [
            {
                'id': item.id,
                'name': item.name,
                'description': item.description,
                'image': item.image.url if item.image else None,
                'order': item.order
            }
            for item in template.application_items.all().order_by('order')
        ]
    
    # 扩展字段
    if not product_data.get('packaging_details'):
        product_data['packaging_details'] = template.packaging_details or ''
    if 'oem_available' not in product_data:
        product_data['oem_available'] = template.oem_available
    if not product_data.get('free_samples'):
        product_data['free_samples'] = template.free_samples or ''
    if not product_data.get('supply_ability'):
        product_data['supply_ability'] = template.supply_ability or ''
    if not product_data.get('payment_terms'):
        product_data['payment_terms'] = template.payment_terms or ''
    if not product_data.get('product_origin'):
        product_data['product_origin'] = template.product_origin or ''
    if not product_data.get('shipping_port'):
        product_data['shipping_port'] = template.shipping_port or ''
    if not product_data.get('lead_time'):
        product_data['lead_time'] = template.lead_time or ''
    
    # 工厂图片
    if not product_data.get('factory_images') or len(product_data.get('factory_images', [])) == 0:
        product_data['factory_images'] = [
            {
                'id': img.id,
                'title': img.title,
                'description': img.description or '',
                'image': img.image.url if img.image else None,
                'category': img.category or '',
                'order': img.order
            }
            for img in template.factory_images.all().order_by('order')
        ]
    
    # ⭐新增：合并工艺处理数据
    if not product_data.get('process_items') or len(product_data.get('process_items', [])) == 0:
        product_data['process_items'] = [
            {
                'id': item.id,
                'name': item.name,
                'description': item.description,
                'image': item.image.url if item.image else None,
                'order': item.order
            }
            for item in template.process_items.all().order_by('order')
        ]
    
    return product_data

