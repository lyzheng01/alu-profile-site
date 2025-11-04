from rest_framework import serializers
from .models import CompanyInfo, Advantage, Certificate, FactoryImage, FriendLink


class CompanyInfoSerializer(serializers.ModelSerializer):
    """公司信息序列化器"""
    
    class Meta:
        model = CompanyInfo
        fields = ['id', 'name', 'description', 'address', 'phone', 'email', 'website', 'is_active']


class AdvantageSerializer(serializers.ModelSerializer):
    """企业优势序列化器"""
    
    class Meta:
        model = Advantage
        fields = ['id', 'title', 'description', 'icon', 'image', 'order']


class CertificateSerializer(serializers.ModelSerializer):
    """资质证书序列化器"""
    
    class Meta:
        model = Certificate
        fields = [
            'id', 'name', 'description', 'image', 'issue_date', 'order'
        ]


class FactoryImageSerializer(serializers.ModelSerializer):
    """工厂图片序列化器"""
    
    class Meta:
        model = FactoryImage
        fields = ['id', 'title', 'description', 'image', 'order']


class TranslatedAdvantageSerializer(serializers.ModelSerializer):
    """翻译后的企业优势序列化器"""
    translated_title = serializers.SerializerMethodField()
    translated_description = serializers.SerializerMethodField()
    
    class Meta:
        model = Advantage
        fields = ['id', 'translated_title', 'translated_description', 'icon', 'image', 'order']
    
    def get_translated_title(self, obj):
        from apps.products.services import translation_service
        language = self.context.get('language', 'zh')
        return translation_service.translate_text(obj.title, language)
    
    def get_translated_description(self, obj):
        from apps.products.services import translation_service
        language = self.context.get('language', 'zh')
        return translation_service.translate_text(obj.description, language)


class FriendLinkSerializer(serializers.ModelSerializer):
    """友情链接序列化器"""
    
    class Meta:
        model = FriendLink
        fields = ['id', 'name', 'url', 'description', 'logo', 'order', 'is_nofollow', 'target_blank']
        read_only_fields = ['id']
    
    def to_representation(self, instance):
        """重写以返回完整的图片URL"""
        data = super().to_representation(instance)
        if data.get('logo') and not data['logo'].startswith('http'):
            request = self.context.get('request')
            if request:
                data['logo'] = request.build_absolute_uri(instance.logo.url)
        return data 