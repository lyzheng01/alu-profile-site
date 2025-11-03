from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CompanyInfo, Advantage, Certificate, FactoryImage
from .serializers import (
    CompanyInfoSerializer, AdvantageSerializer, CertificateSerializer,
    FactoryImageSerializer, TranslatedAdvantageSerializer
)


# Create your views here.


class CompanyInfoViewSet(viewsets.ReadOnlyModelViewSet):
    """公司信息视图集"""
    queryset = CompanyInfo.objects.filter(is_active=True).order_by('info_type', 'order')
    serializer_class = CompanyInfoSerializer
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """按类型获取公司信息"""
        info_type = request.query_params.get('type', '')
        if info_type:
            queryset = self.get_queryset().filter(info_type=info_type)
        else:
            queryset = self.get_queryset()
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class AdvantageViewSet(viewsets.ReadOnlyModelViewSet):
    """企业优势视图集"""
    queryset = Advantage.objects.filter(is_active=True).order_by('order', 'title')
    serializer_class = AdvantageSerializer
    
    def get_serializer_class(self):
        """根据语言选择序列化器"""
        language = self.request.query_params.get('lang', 'zh')
        if language != 'zh':
            return TranslatedAdvantageSerializer
        return super().get_serializer_class()
    
    def get_serializer_context(self):
        """添加语言上下文"""
        context = super().get_serializer_context()
        context['language'] = self.request.query_params.get('lang', 'zh')
        return context


class CertificateViewSet(viewsets.ReadOnlyModelViewSet):
    """资质证书视图集"""
    queryset = Certificate.objects.filter(is_active=True).order_by('order', 'name')
    serializer_class = CertificateSerializer


class FactoryImageViewSet(viewsets.ReadOnlyModelViewSet):
    """工厂图片视图集"""
    queryset = FactoryImage.objects.filter(is_active=True).order_by('order', 'title')
    serializer_class = FactoryImageSerializer
