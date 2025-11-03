from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Inquiry, ContactInfo
from .serializers import InquirySerializer, ContactInfoSerializer


class InquiryViewSet(viewsets.ModelViewSet):
    """询价视图集"""
    queryset = Inquiry.objects.all().order_by('-created_at')
    serializer_class = InquirySerializer
    
    def get_queryset(self):
        """只允许查看自己的询价（这里简化处理）"""
        return super().get_queryset()
    
    def create(self, request, *args, **kwargs):
        """创建询价"""
        # 获取客户端IP
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        
        # 添加IP地址和来源
        data = request.data.copy()
        data['ip_address'] = ip
        data['source'] = 'website'
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            {'message': '询价提交成功，我们会尽快与您联系！'}, 
            status=status.HTTP_201_CREATED, 
            headers=headers
        )


class ContactInfoViewSet(viewsets.ReadOnlyModelViewSet):
    """联系信息视图集"""
    queryset = ContactInfo.objects.filter(is_active=True).order_by('type', 'order')
    serializer_class = ContactInfoSerializer
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """按类型获取联系信息"""
        info_type = request.query_params.get('type', '')
        if info_type:
            queryset = self.get_queryset().filter(type=info_type)
        else:
            queryset = self.get_queryset()
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
