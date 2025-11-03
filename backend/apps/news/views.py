from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Tag, Article
from .serializers import (
    TagSerializer, ArticleSerializer, ArticleDetailSerializer,
    TranslatedArticleSerializer
)


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """标签视图集"""
    queryset = Tag.objects.all().order_by('name')
    serializer_class = TagSerializer
    
    @action(detail=True, methods=['get'])
    def articles(self, request, pk=None):
        """获取标签下的文章"""
        tag = self.get_object()
        articles = Article.objects.filter(
            tags=tag, 
            status='published'
        ).order_by('-published_at', '-created_at')
        
        # 检查是否需要翻译
        language = request.query_params.get('lang', 'zh')
        if language != 'zh':
            serializer = TranslatedArticleSerializer(
                articles, 
                many=True, 
                context={'language': language}
            )
        else:
            serializer = ArticleSerializer(articles, many=True)
        
        return Response(serializer.data)


class ArticleViewSet(viewsets.ReadOnlyModelViewSet):
    """文章视图集"""
    queryset = Article.objects.filter(status='published').order_by('-published_at', '-created_at')
    serializer_class = ArticleSerializer
    
    def get_serializer_class(self):
        """根据action选择序列化器"""
        if self.action == 'retrieve':
            return ArticleDetailSerializer
        return super().get_serializer_class()
    
    def get_queryset(self):
        """过滤查询集"""
        queryset = super().get_queryset()
        
        # 按标签过滤
        tag_id = self.request.query_params.get('tag')
        if tag_id:
            queryset = queryset.filter(tags__id=tag_id)
        
        # 按推荐状态过滤
        featured = self.request.query_params.get('featured')
        if featured is not None:
            featured = featured.lower() == 'true'
            queryset = queryset.filter(is_featured=featured)
        
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        """获取文章详情时增加浏览次数"""
        instance = self.get_object()
        instance.views += 1
        instance.save(update_fields=['views'])
        return super().retrieve(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """获取推荐文章"""
        articles = self.get_queryset().filter(is_featured=True)
        
        # 检查是否需要翻译
        language = request.query_params.get('lang', 'zh')
        if language != 'zh':
            serializer = TranslatedArticleSerializer(
                articles, 
                many=True, 
                context={'language': language}
            )
        else:
            serializer = self.get_serializer(articles, many=True)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """搜索文章"""
        query = request.query_params.get('q', '')
        if not query:
            return Response({'error': '请提供搜索关键词'}, status=status.HTTP_400_BAD_REQUEST)
        
        articles = self.get_queryset().filter(
            Q(title__icontains=query) | 
            Q(content__icontains=query) | 
            Q(excerpt__icontains=query)
        )
        
        # 检查是否需要翻译
        language = request.query_params.get('lang', 'zh')
        if language != 'zh':
            serializer = TranslatedArticleSerializer(
                articles, 
                many=True, 
                context={'language': language}
            )
        else:
            serializer = self.get_serializer(articles, many=True)
        
        return Response(serializer.data)
