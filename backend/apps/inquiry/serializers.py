from rest_framework import serializers
from .models import Inquiry, ContactInfo


class InquirySerializer(serializers.ModelSerializer):
    """询价序列化器"""
    
    class Meta:
        model = Inquiry
        fields = [
            'id', 'name', 'company', 'email', 'phone', 'whatsapp',
            'subject', 'message', 'product_name', 'quantity',
            'status', 'created_at'
        ]
        read_only_fields = ['status', 'created_at']


class ContactInfoSerializer(serializers.ModelSerializer):
    """联系信息序列化器"""
    
    class Meta:
        model = ContactInfo
        fields = ['id', 'name', 'value', 'type', 'order'] 