from rest_framework import serializers
from .models import (
    Category, SubCategory, Product, ProductImage, ProductSpecification, ProductFeature, ProductApplication,
    ProductTemplate, TemplateSpecification, TemplateFeature, TemplateApplication, TemplateFactoryImage
)
# ProductTemplate 已导入，无需在__init__中再次导入
from .services import translation_service


class CategorySerializer(serializers.ModelSerializer):
    """产品分类序列化器"""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'image', 'slug', 'order', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'template_name']


class TranslatedCategorySerializer(serializers.ModelSerializer):
    """翻译后的分类序列化器"""
    translated_name = serializers.SerializerMethodField()
    translated_description = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'translated_name', 'translated_description', 'image', 'slug', 'order', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'template_name']
    
    def get_translated_name(self, obj):
        language = self.context.get('language', 'zh')
        return translation_service.get_translated_text('category', obj.id, 'name', language) or obj.name
    
    def get_translated_description(self, obj):
        language = self.context.get('language', 'zh')
        return translation_service.get_translated_text('category', obj.id, 'description', language) or obj.description


class SubCategorySerializer(serializers.ModelSerializer):
    """产品子分类序列化器"""
    
    class Meta:
        model = SubCategory
        fields = ['id', 'parent_category', 'name', 'description', 'image', 'slug', 'order', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'template_name']


class TranslatedSubCategorySerializer(serializers.ModelSerializer):
    """翻译后的子分类序列化器"""
    translated_name = serializers.SerializerMethodField()
    translated_description = serializers.SerializerMethodField()
    
    class Meta:
        model = SubCategory
        fields = ['id', 'parent_category', 'translated_name', 'translated_description', 'image', 'slug', 'order', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'template_name']
    
    def get_translated_name(self, obj):
        language = self.context.get('language', 'zh')
        return translation_service.get_translated_text('subcategory', obj.id, 'name', language) or obj.name
    
    def get_translated_description(self, obj):
        language = self.context.get('language', 'zh')
        return translation_service.get_translated_text('subcategory', obj.id, 'description', language) or obj.description


class CategoryWithSubcategoriesSerializer(serializers.ModelSerializer):
    """带子分类的分类序列化器"""
    subcategories = SubCategorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'image', 'slug', 'order', 'is_active', 'subcategories', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'template_name']


class TranslatedCategoryWithSubcategoriesSerializer(serializers.ModelSerializer):
    """翻译后的带子分类的分类序列化器"""
    translated_name = serializers.SerializerMethodField()
    translated_description = serializers.SerializerMethodField()
    subcategories = TranslatedSubCategorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'translated_name', 'translated_description', 'image', 'slug', 'order', 'is_active', 'subcategories', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'template_name']
    
    def get_translated_name(self, obj):
        language = self.context.get('language', 'zh')
        return translation_service.get_translated_text('category', obj.id, 'name', language) or obj.name
    
    def get_translated_description(self, obj):
        language = self.context.get('language', 'zh')
        return translation_service.get_translated_text('category', obj.id, 'description', language) or obj.description


class ProductImageSerializer(serializers.ModelSerializer):
    """产品图片序列化器"""
    
    class Meta:
        model = ProductImage
        fields = ['id', 'product', 'image', 'caption', 'is_primary', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']


# 新的表格数据序列化器
class ProductSpecificationSerializer(serializers.ModelSerializer):
    """产品技术规格序列化器"""
    
    class Meta:
        model = ProductSpecification
        fields = ['id', 'name', 'value', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProductFeatureSerializer(serializers.ModelSerializer):
    """产品特性序列化器"""
    
    class Meta:
        model = ProductFeature
        fields = ['id', 'name', 'description', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProductApplicationSerializer(serializers.ModelSerializer):
    """产品应用领域序列化器"""
    
    class Meta:
        model = ProductApplication
        fields = ['id', 'name', 'description', 'image', 'order', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    """产品序列化器"""
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    subcategory = SubCategorySerializer(read_only=True)
    subcategory_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    images = ProductImageSerializer(many=True, read_only=True)
    specification_items = ProductSpecificationSerializer(many=True, read_only=True)
    feature_items = ProductFeatureSerializer(many=True, read_only=True)
    application_items = ProductApplicationSerializer(many=True, read_only=True)
    
    # ⭐新增：模板字段
    template = serializers.PrimaryKeyRelatedField(
        queryset=ProductTemplate.objects.filter(is_active=True),
        required=False,
        allow_null=True,
        read_only=False
    )
    template_name = serializers.CharField(source='template.name', read_only=True)
    use_template = serializers.BooleanField(default=True, required=False)
    
    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_id', 'subcategory', 'subcategory_id', 'template', 'template_name', 'use_template',
            'name', 'description', 'features', 
            'applications', 'specifications', 'range_param', 'type_param', 'surface_treatment', 'colors', 'grade', 'temper',
            'slug', 'is_featured', 'is_active', 'order', 'created_at', 'updated_at', 'images',
            'specification_items', 'feature_items', 'application_items'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'template_name']


class TranslatedProductSerializer(serializers.ModelSerializer):
    """翻译后的产品序列化器"""
    category = TranslatedCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    subcategory = TranslatedSubCategorySerializer(read_only=True)
    subcategory_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    translated_name = serializers.SerializerMethodField()
    translated_description = serializers.SerializerMethodField()
    translated_features = serializers.SerializerMethodField()
    translated_applications = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)
    specification_items = ProductSpecificationSerializer(many=True, read_only=True)
    feature_items = ProductFeatureSerializer(many=True, read_only=True)
    application_items = ProductApplicationSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_id', 'subcategory', 'subcategory_id', 'translated_name', 'translated_description',
            'translated_features', 'translated_applications', 'specifications', 'range_param', 'type_param', 'surface_treatment', 'colors', 'grade', 'temper',
            'slug', 'is_featured', 'is_active', 'order', 'created_at', 'updated_at', 'images',
            'specification_items', 'feature_items', 'application_items'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'template_name']
    
    def get_translated_name(self, obj):
        language = self.context.get('language', 'zh')
        return translation_service.get_translated_text('product', obj.id, 'name', language) or obj.name
    
    def get_translated_description(self, obj):
        language = self.context.get('language', 'zh')
        return translation_service.get_translated_text('product', obj.id, 'description', language) or obj.description
    
    def get_translated_features(self, obj):
        language = self.context.get('language', 'zh')
        return translation_service.get_translated_text('product', obj.id, 'features', language) or obj.features
    
    def get_translated_applications(self, obj):
        language = self.context.get('language', 'zh')
        return translation_service.get_translated_text('product', obj.id, 'applications', language) or obj.applications


class ProductDetailSerializer(serializers.ModelSerializer):
    """产品详情序列化器 - 支持模板合并"""
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    subcategory = SubCategorySerializer(read_only=True)
    subcategory_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    images = ProductImageSerializer(many=True, read_only=True)
    specification_items = ProductSpecificationSerializer(many=True, read_only=True)
    feature_items = ProductFeatureSerializer(many=True, read_only=True)
    application_items = ProductApplicationSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_id', 'subcategory', 'subcategory_id', 'name', 'description', 'features', 
            'applications', 'specifications', 'range_param', 'type_param', 'surface_treatment', 'colors', 'grade', 'temper',
            'slug', 'is_featured', 'is_active', 'order', 'created_at', 'updated_at', 'images',
            'specification_items', 'feature_items', 'application_items'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'template_name']
    
    def to_representation(self, instance):
        """重写序列化方法，合并模板数据"""
        from .template_serializers import get_product_template, merge_template_data, ensure_factory_images
        
        # 先获取基本数据
        data = super().to_representation(instance)
        
        # 获取匹配的模板
        template = get_product_template(instance)
        
        # 合并模板数据
        if template:
            data = merge_template_data(data, template)
        
        data = ensure_factory_images(data, template)
        
        return data


class TranslatedProductDetailSerializer(serializers.ModelSerializer):
    """翻译后的产品详情序列化器 - 支持模板合并"""
    category = TranslatedCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    subcategory = TranslatedSubCategorySerializer(read_only=True)
    subcategory_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    translated_name = serializers.SerializerMethodField()
    translated_description = serializers.SerializerMethodField()
    translated_features = serializers.SerializerMethodField()
    translated_applications = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)
    specification_items = ProductSpecificationSerializer(many=True, read_only=True)
    feature_items = ProductFeatureSerializer(many=True, read_only=True)
    application_items = ProductApplicationSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_id', 'subcategory', 'subcategory_id', 'translated_name', 'translated_description',
            'translated_features', 'translated_applications', 'specifications', 'range_param', 'type_param', 'surface_treatment', 'colors', 'grade', 'temper',
            'slug', 'is_featured', 'is_active', 'order', 'created_at', 'updated_at', 'images',
            'specification_items', 'feature_items', 'application_items'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'template_name']
    
    def get_translated_name(self, obj):
        language = self.context.get('language', 'zh')
        return translation_service.get_translated_text('product', obj.id, 'name', language) or obj.name
    
    def get_translated_description(self, obj):
        language = self.context.get('language', 'zh')
        return translation_service.get_translated_text('product', obj.id, 'description', language) or obj.description
    
    def get_translated_features(self, obj):
        language = self.context.get('language', 'zh')
        return translation_service.get_translated_text('product', obj.id, 'features', language) or obj.features
    
    def get_translated_applications(self, obj):
        language = self.context.get('language', 'zh')
        return translation_service.get_translated_text('product', obj.id, 'applications', language) or obj.applications
    
    def to_representation(self, instance):
        """重写序列化方法，合并模板数据"""
        from .template_serializers import get_product_template, merge_template_data, ensure_factory_images
        
        # 先获取基本数据（包含翻译）
        data = super().to_representation(instance)
        
        # 将翻译字段映射为标准字段，以便模板合并和前端使用
        if 'translated_description' in data:
            data['description'] = data.pop('translated_description')
        if 'translated_features' in data:
            data['features'] = data.pop('translated_features')
        if 'translated_applications' in data:
            data['applications'] = data.pop('translated_applications')
        if 'translated_name' in data:
            data['name'] = data.pop('translated_name')
        
        # 获取匹配的模板
        template = get_product_template(instance)
        
        # 合并模板数据
        if template:
            data = merge_template_data(data, template)
        
        data = ensure_factory_images(data, template)
        
        return data