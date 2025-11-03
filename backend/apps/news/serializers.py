from rest_framework import serializers
from .models import Tag, Article


class TagSerializer(serializers.ModelSerializer):
    """标签序列化器"""
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']


class ArticleSerializer(serializers.ModelSerializer):
    """文章序列化器"""
    tags = TagSerializer(many=True, read_only=True)
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'excerpt', 'featured_image',
            'tags', 'is_featured', 'views', 'created_at', 'published_at'
        ]


class ArticleDetailSerializer(serializers.ModelSerializer):
    """文章详情序列化器"""
    tags = TagSerializer(many=True, read_only=True)
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 'featured_image',
            'tags', 'is_featured', 'views', 'created_at', 'updated_at', 'published_at',
            'meta_title', 'meta_description', 'meta_keywords'
        ]


class TranslatedArticleSerializer(serializers.ModelSerializer):
    """翻译后的文章序列化器"""
    tags = TagSerializer(many=True, read_only=True)
    translated_title = serializers.SerializerMethodField()
    translated_content = serializers.SerializerMethodField()
    translated_excerpt = serializers.SerializerMethodField()
    
    class Meta:
        model = Article
        fields = [
            'id', 'slug', 'translated_title', 'translated_content', 'translated_excerpt',
            'featured_image', 'tags', 'is_featured', 'views', 'created_at', 'published_at'
        ]
    
    def get_translated_title(self, obj):
        from apps.products.services import translation_service
        language = self.context.get('language', 'zh')
        return translation_service.translate_text(obj.title, language)
    
    def get_translated_content(self, obj):
        from apps.products.services import translation_service
        language = self.context.get('language', 'zh')
        return translation_service.translate_text(obj.content, language)
    
    def get_translated_excerpt(self, obj):
        from apps.products.services import translation_service
        language = self.context.get('language', 'zh')
        return translation_service.translate_text(obj.excerpt, language) 