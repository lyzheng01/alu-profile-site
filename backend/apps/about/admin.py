from django.contrib import admin
from .models import CompanyInfo, Advantage, Certificate, FactoryImage, FriendLink


@admin.register(CompanyInfo)
class CompanyInfoAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description', 'email', 'phone']
    ordering = ['-created_at']
    list_editable = ['is_active']


@admin.register(Advantage)
class AdvantageAdmin(admin.ModelAdmin):
    list_display = ['title', 'order', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'description']
    ordering = ['order', 'title']
    list_editable = ['order', 'is_active']


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ['name', 'issue_date', 'order', 'is_active']
    list_filter = ['is_active', 'issue_date']
    search_fields = ['name', 'description']
    ordering = ['order', 'name']
    list_editable = ['order', 'is_active']


@admin.register(FactoryImage)
class FactoryImageAdmin(admin.ModelAdmin):
    list_display = ['title', 'order', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'description']
    ordering = ['order', 'title']
    list_editable = ['order', 'is_active']


@admin.register(FriendLink)
class FriendLinkAdmin(admin.ModelAdmin):
    """友情链接管理"""
    list_display = ['name', 'url', 'order', 'is_active', 'is_nofollow', 'target_blank', 'created_at']
    list_filter = ['is_active', 'is_nofollow', 'target_blank', 'created_at']
    search_fields = ['name', 'url', 'description']
    ordering = ['order', 'name']
    list_editable = ['order', 'is_active', 'is_nofollow', 'target_blank']
    
    fieldsets = (
        ('基本信息', {
            'fields': ('name', 'url', 'description', 'logo')
        }),
        ('SEO设置', {
            'fields': ('is_nofollow', 'target_blank')
        }),
        ('显示设置', {
            'fields': ('order', 'is_active')
        }),
    )
