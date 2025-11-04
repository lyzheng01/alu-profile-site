"""
URL configuration for aluminum project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve
from rest_framework import routers

# Import ViewSets
from apps.products.views import CategoryViewSet, ProductViewSet, ProductImageViewSet, TranslationViewSet, ProductTemplateViewSet
from apps.news.views import TagViewSet, ArticleViewSet
from apps.inquiry.views import InquiryViewSet, ContactInfoViewSet
from apps.about.views import CompanyInfoViewSet, AdvantageViewSet, CertificateViewSet, FactoryImageViewSet, FriendLinkViewSet

# Create router and register ViewSets
router = routers.DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'product-images', ProductImageViewSet)
router.register(r'product-templates', ProductTemplateViewSet)
router.register(r'translations', TranslationViewSet, basename='translation')
router.register(r'tags', TagViewSet)
router.register(r'articles', ArticleViewSet)
router.register(r'inquiries', InquiryViewSet)
router.register(r'contact-info', ContactInfoViewSet)
router.register(r'company-info', CompanyInfoViewSet)
router.register(r'advantages', AdvantageViewSet)
router.register(r'certificates', CertificateViewSet)
router.register(r'factory-images', FactoryImageViewSet)
router.register(r'friend-links', FriendLinkViewSet)

urlpatterns = [
    # Admin interface - 管理后台
    path('admin/', admin.site.urls),
    
    # API endpoints - API接口
    path('api/', include(router.urls)),
    
    # API authentication - API认证
    path('api-auth/', include('rest_framework.urls')),
]

# Serve static and media files
# 在生产环境中，如果直接访问Django（不通过Nginx），也需要提供静态文件
# 注意：推荐使用Nginx等Web服务器提供静态文件以获得更好的性能
# 无论开发还是生产环境，都提供静态文件和媒体文件
# 使用re_path确保能匹配所有静态文件路径
urlpatterns += [
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATIC_ROOT}),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
