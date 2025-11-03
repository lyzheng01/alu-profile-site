from rest_framework import serializers
from .models import Category, SubCategory, Product, ProductImage, ProductSpecification, ProductFeature, ProductApplication
from .services import translation_service


class CategorySerializer(serializers.ModelSerializer):
    """产品分类序列化器"""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'image', 'slug', 'order', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TranslatedCategorySerializer(serializers.ModelSerializer):
    """翻译后的分类序列化器"""
    translated_name = serializers.SerializerMethodField()
    translated_description = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'translated_name', 'translated_description', 'image', 'slug', 'order', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
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
        read_only_fields = ['id', 'created_at', 'updated_at']


class TranslatedSubCategorySerializer(serializers.ModelSerializer):
    """翻译后的子分类序列化器"""
    translated_name = serializers.SerializerMethodField()
    translated_description = serializers.SerializerMethodField()
    
    class Meta:
        model = SubCategory
        fields = ['id', 'parent_category', 'translated_name', 'translated_description', 'image', 'slug', 'order', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
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
        read_only_fields = ['id', 'created_at', 'updated_at']


class TranslatedCategoryWithSubcategoriesSerializer(serializers.ModelSerializer):
    """翻译后的带子分类的分类序列化器"""
    translated_name = serializers.SerializerMethodField()
    translated_description = serializers.SerializerMethodField()
    subcategories = TranslatedSubCategorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'translated_name', 'translated_description', 'image', 'slug', 'order', 'is_active', 'subcategories', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
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
        fields = ['id', 'name', 'description', 'order', 'created_at']
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
    
    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_id', 'subcategory', 'subcategory_id', 'name', 'description', 'features', 
            'applications', 'specifications', 'range_param', 'type_param', 'surface_treatment', 'colors', 'grade', 'temper',
            'slug', 'is_featured', 'is_active', 'order', 'created_at', 'updated_at', 'images',
            'specification_items', 'feature_items', 'application_items'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


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
        read_only_fields = ['id', 'created_at', 'updated_at']
    
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
    """产品详情序列化器"""
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    subcategory = SubCategorySerializer(read_only=True)
    subcategory_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    images = ProductImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_id', 'subcategory', 'subcategory_id', 'name', 'description', 'features', 
            'applications', 'specifications', 'range_param', 'type_param', 'surface_treatment', 'colors', 'grade', 'temper',
            'slug', 'is_featured', 'is_active', 'order', 'created_at', 'updated_at', 'images'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TranslatedProductDetailSerializer(serializers.ModelSerializer):
    """翻译后的产品详情序列化器"""
    category = TranslatedCategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    subcategory = TranslatedSubCategorySerializer(read_only=True)
    subcategory_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    translated_name = serializers.SerializerMethodField()
    translated_description = serializers.SerializerMethodField()
    translated_features = serializers.SerializerMethodField()
    translated_applications = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_id', 'subcategory', 'subcategory_id', 'translated_name', 'translated_description',
            'translated_features', 'translated_applications', 'specifications', 'range_param', 'type_param', 'surface_treatment', 'colors', 'grade', 'temper',
            'slug', 'is_featured', 'is_active', 'order', 'created_at', 'updated_at', 'images'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
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