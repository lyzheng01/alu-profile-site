from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from .models import Category, SubCategory, Product, ProductImage, ProductTemplate
from .serializers import (
    CategorySerializer, SubCategorySerializer, ProductSerializer, ProductDetailSerializer,
    TranslatedCategorySerializer, TranslatedSubCategorySerializer, TranslatedProductSerializer, TranslatedProductDetailSerializer,
    CategoryWithSubcategoriesSerializer, TranslatedCategoryWithSubcategoriesSerializer,
    ProductImageSerializer
)
from .template_serializers import ProductTemplateSerializer
from .services import translation_service


class CategoryViewSet(viewsets.ModelViewSet):
    """产品分类视图集"""
    queryset = Category.objects.filter(is_active=True).order_by('order', 'name')
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        """根据语言参数选择序列化器"""
        language = self.request.query_params.get('lang', 'zh')
        include_subcategories = self.request.query_params.get('include_subcategories', 'false').lower() == 'true'
        
        if include_subcategories:
            if language != 'zh':
                return TranslatedCategoryWithSubcategoriesSerializer
            return CategoryWithSubcategoriesSerializer
        
        if language != 'zh':
            return TranslatedCategorySerializer
        return CategorySerializer
    
    def get_serializer_context(self):
        """添加语言参数到序列化器上下文"""
        context = super().get_serializer_context()
        context['language'] = self.request.query_params.get('lang', 'zh')
        return context
    
    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        """获取分类下的产品"""
        category = self.get_object()
        products = Product.objects.filter(
            category=category, 
            is_active=True
        ).order_by('order', '-created_at')
        
        # 检查是否需要翻译
        language = request.query_params.get('lang', 'zh')
        if language != 'zh':
            serializer = TranslatedProductSerializer(
                products, 
                many=True, 
                context={'language': language}
            )
        else:
            serializer = ProductSerializer(products, many=True)
        
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def subcategories(self, request, pk=None):
        """获取分类下的子分类"""
        category = self.get_object()
        subcategories = SubCategory.objects.filter(
            parent_category=category,
            is_active=True
        ).order_by('order', 'name')
        
        # 检查是否需要翻译
        language = request.query_params.get('lang', 'zh')
        if language != 'zh':
            serializer = TranslatedSubCategorySerializer(
                subcategories, 
                many=True, 
                context={'language': language}
            )
        else:
            serializer = SubCategorySerializer(subcategories, many=True)
        
        return Response(serializer.data)


class SubCategoryViewSet(viewsets.ModelViewSet):
    """产品子分类视图集"""
    queryset = SubCategory.objects.filter(is_active=True).order_by('order', 'name')
    serializer_class = SubCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        """根据语言参数选择序列化器"""
        language = self.request.query_params.get('lang', 'zh')
        if language != 'zh':
            return TranslatedSubCategorySerializer
        return SubCategorySerializer
    
    def get_serializer_context(self):
        """添加语言参数到序列化器上下文"""
        context = super().get_serializer_context()
        context['language'] = self.request.query_params.get('lang', 'zh')
        return context
    
    @action(detail=True, methods=['get'])
    def products(self, request, pk=None):
        """获取子分类下的产品"""
        subcategory = self.get_object()
        products = Product.objects.filter(
            subcategory=subcategory, 
            is_active=True
        ).order_by('order', '-created_at')
        
        # 检查是否需要翻译
        language = request.query_params.get('lang', 'zh')
        if language != 'zh':
            serializer = TranslatedProductSerializer(
                products, 
                many=True, 
                context={'language': language}
            )
        else:
            serializer = ProductSerializer(products, many=True)
        
        return Response(serializer.data)


class ProductViewSet(viewsets.ModelViewSet):
    """产品视图集"""
    queryset = Product.objects.filter(is_active=True).order_by('order', '-created_at')
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        """根据action和语言参数选择序列化器"""
        language = self.request.query_params.get('lang', 'zh')
        
        if self.action == 'retrieve':
            if language != 'zh':
                return TranslatedProductDetailSerializer
            return ProductDetailSerializer
        
        if language != 'zh':
            return TranslatedProductSerializer
        
        return super().get_serializer_class()
    
    def get_serializer_context(self):
        """添加语言参数到序列化器上下文"""
        context = super().get_serializer_context()
        context['language'] = self.request.query_params.get('lang', 'zh')
        return context
    
    def get_queryset(self):
        """过滤查询集"""
        queryset = super().get_queryset()
        
        # 按分类过滤
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # 按子分类过滤
        subcategory_id = self.request.query_params.get('subcategory')
        if subcategory_id:
            queryset = queryset.filter(subcategory_id=subcategory_id)
        
        # 按推荐状态过滤
        featured = self.request.query_params.get('featured')
        if featured is not None:
            featured = featured.lower() == 'true'
            queryset = queryset.filter(is_featured=featured)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """获取推荐产品"""
        products = self.get_queryset().filter(is_featured=True)
        
        # 检查是否需要翻译
        language = request.query_params.get('lang', 'zh')
        if language != 'zh':
            serializer = TranslatedProductSerializer(
                products, 
                many=True, 
                context={'language': language}
            )
        else:
            serializer = self.get_serializer(products, many=True)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """搜索产品"""
        query = request.query_params.get('q', '')
        if not query:
            return Response({'error': '请提供搜索关键词'}, status=status.HTTP_400_BAD_REQUEST)
        
        products = self.get_queryset().filter(
            name__icontains=query
        ) | self.get_queryset().filter(
            description__icontains=query
        )
        
        # 检查是否需要翻译
        language = request.query_params.get('lang', 'zh')
        if language != 'zh':
            serializer = TranslatedProductSerializer(
                products, 
                many=True, 
                context={'language': language}
            )
        else:
            serializer = self.get_serializer(products, many=True)
        
        return Response(serializer.data)


class ProductImageViewSet(viewsets.ModelViewSet):
    """产品图片视图集"""
    queryset = ProductImage.objects.all().order_by('order', 'created_at')
    serializer_class = ProductImageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """过滤查询集"""
        queryset = super().get_queryset()
        
        # 按产品过滤
        product_id = self.request.query_params.get('product')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        
        return queryset


class ProductTemplateViewSet(viewsets.ModelViewSet):
    """产品模板视图集"""
    queryset = ProductTemplate.objects.filter(is_active=True).order_by('order', 'name')
    serializer_class = ProductTemplateSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        """过滤查询集"""
        queryset = super().get_queryset()
        
        # 按分类过滤
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # 按子分类过滤
        subcategory_id = self.request.query_params.get('subcategory')
        if subcategory_id:
            queryset = queryset.filter(subcategory_id=subcategory_id)
        
        return queryset


class TranslationViewSet(viewsets.ViewSet):
    """翻译视图集"""
    
    @action(detail=False, methods=['get'])
    def frontend_content(self, request):
        """获取前端翻译内容"""
        language = request.query_params.get('lang', 'zh')
        content = translation_service.get_all_frontend_content(language)
        return Response({'content': content})
    
    @action(detail=False, methods=['get'])
    def translate_frontend(self, request):
        """翻译前端内容"""
        try:
            from django.core.management import call_command
            from io import StringIO
            
            out = StringIO()
            call_command('translate_frontend', '--all-languages', stdout=out)
            
            return Response({
                'success': True,
                'message': '前端内容翻译完成',
                'logs': out.getvalue()
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': f'翻译失败: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
