from rest_framework import serializers
from .models import Tag, Article


def get_article_available_languages(article):
    from apps.products.services import translation_service

    languages = ['en']
    for language in ('zh', 'es', 'pt'):
        translations = translation_service._load_translations_from_file('article', language)
        if translations.get(f'title_{article.id}') and translations.get(f'content_{article.id}'):
            languages.append(language)
    return languages


class TagSerializer(serializers.ModelSerializer):
    """标签序列化器"""
    name = serializers.SerializerMethodField()

    def get_name(self, obj):
        request = self.context.get('request')
        language = request.query_params.get('lang', 'en') if request else 'en'
        if language == 'en':
            return obj.name
        from apps.products.services import translation_service
        translations = translation_service._load_translations_from_file('article', language)
        return translations.get(f'tag_{obj.id}', obj.name)

    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug']


class ArticleSerializer(serializers.ModelSerializer):
    """文章序列化器"""
    tags = TagSerializer(many=True, read_only=True)
    available_languages = serializers.SerializerMethodField()

    def get_available_languages(self, obj):
        return get_article_available_languages(obj)
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'excerpt', 'featured_image',
            'tags', 'is_featured', 'views', 'created_at', 'published_at',
            'meta_title', 'meta_description', 'meta_keywords', 'available_languages'
        ]


class ArticleDetailSerializer(serializers.ModelSerializer):
    """文章详情序列化器"""
    tags = TagSerializer(many=True, read_only=True)
    available_languages = serializers.SerializerMethodField()

    def get_available_languages(self, obj):
        return get_article_available_languages(obj)
    
    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'content', 'excerpt', 'featured_image',
            'tags', 'is_featured', 'views', 'created_at', 'updated_at', 'published_at',
            'meta_title', 'meta_description', 'meta_keywords', 'available_languages'
        ]


class TranslatedArticleSerializer(serializers.ModelSerializer):
    """翻译后的文章序列化器"""
    tags = serializers.SerializerMethodField()
    translated_title = serializers.SerializerMethodField()
    translated_content = serializers.SerializerMethodField()
    translated_excerpt = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()
    excerpt = serializers.SerializerMethodField()
    meta_title = serializers.SerializerMethodField()
    meta_description = serializers.SerializerMethodField()
    meta_keywords = serializers.SerializerMethodField()
    available_languages = serializers.SerializerMethodField()

    def get_available_languages(self, obj):
        return get_article_available_languages(obj)
    
    class Meta:
        model = Article
        fields = [
            'id', 'slug', 'title', 'content', 'excerpt', 'translated_title', 'translated_content', 'translated_excerpt',
            'featured_image', 'tags', 'is_featured', 'views', 'created_at', 'updated_at', 'published_at',
            'meta_title', 'meta_description', 'meta_keywords', 'available_languages'
        ]
    
    def get_translated_title(self, obj):
        from apps.products.services import translation_service
        language = self.context.get('language', 'zh')
        return translation_service.get_translated_text('article', obj.id, 'title', language) or obj.title

    def get_title(self, obj):
        return self.get_translated_title(obj)
    
    def get_translated_content(self, obj):
        from apps.products.services import translation_service
        language = self.context.get('language', 'zh')
        return translation_service.get_translated_text('article', obj.id, 'content', language) or obj.content

    def get_content(self, obj):
        return self.get_translated_content(obj)
    
    def get_translated_excerpt(self, obj):
        from apps.products.services import translation_service
        language = self.context.get('language', 'zh')
        return translation_service.get_translated_text('article', obj.id, 'excerpt', language) or obj.excerpt

    def get_excerpt(self, obj):
        return self.get_translated_excerpt(obj)

    def _get_translation(self, obj, field):
        from apps.products.services import translation_service
        language = self.context.get('language', 'zh')
        return translation_service.get_translated_text('article', obj.id, field, language)

    def get_meta_title(self, obj):
        return self._get_translation(obj, 'meta_title') or obj.meta_title or obj.title

    def get_meta_description(self, obj):
        return self._get_translation(obj, 'meta_description') or obj.meta_description or obj.excerpt

    def get_meta_keywords(self, obj):
        return self._get_translation(obj, 'meta_keywords') or obj.meta_keywords

    def get_tags(self, obj):
        from apps.products.services import translation_service
        language = self.context.get('language', 'zh')
        translations = translation_service._load_translations_from_file('article', language)
        return [
            {
                'id': tag.id,
                'name': translations.get(f'tag_{tag.id}', tag.name),
                'slug': tag.slug,
            }
            for tag in obj.tags.all()
        ]
