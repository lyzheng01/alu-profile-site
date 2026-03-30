from django.contrib import admin
from .models import Tag, Article, AluminumBlogTopic


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'created_at']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['name']


@admin.register(AluminumBlogTopic)
class AluminumBlogTopicAdmin(admin.ModelAdmin):
    list_display = ['title', 'primary_keyword', 'status', 'priority', 'article', 'updated_at']
    list_filter = ['status', 'priority', 'created_at']
    search_fields = ['title', 'slug', 'primary_keyword']
    ordering = ['priority', 'id']
    list_editable = ['status', 'priority']


@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'status', 'is_featured', 'views', 'created_at', 'published_at']
    list_filter = ['status', 'is_featured', 'tags', 'created_at', 'published_at']
    search_fields = ['title', 'content', 'excerpt']
    prepopulated_fields = {'slug': ('title',)}
    ordering = ['-published_at', '-created_at']
    list_editable = ['status', 'is_featured']
    
    fieldsets = (
        ('基本信息', {
            'fields': ('title', 'slug', 'content', 'excerpt')
        }),
        ('媒体', {
            'fields': ('featured_image',)
        }),
        ('分类', {
            'fields': ('tags',)
        }),
        ('状态', {
            'fields': ('status', 'is_featured')
        }),
        ('SEO', {
            'fields': ('meta_title', 'meta_description', 'meta_keywords'),
            'classes': ('collapse',)
        }),
        ('统计', {
            'fields': ('views',),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['views', 'created_at', 'updated_at', 'published_at']
