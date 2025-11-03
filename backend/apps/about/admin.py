from django.contrib import admin
from .models import CompanyInfo, Advantage, Certificate, FactoryImage


@admin.register(CompanyInfo)
class CompanyInfoAdmin(admin.ModelAdmin):
    list_display = ['key', 'value', 'info_type', 'order', 'is_active']
    list_filter = ['info_type', 'is_active']
    search_fields = ['key', 'value']
    ordering = ['info_type', 'order']
    list_editable = ['order', 'is_active']
    
    fieldsets = (
        ('基本信息', {
            'fields': ('key', 'value', 'info_type')
        }),
        ('显示设置', {
            'fields': ('order', 'is_active')
        }),
    )


@admin.register(Advantage)
class AdvantageAdmin(admin.ModelAdmin):
    list_display = ['title', 'order', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title', 'description']
    ordering = ['order', 'title']
    list_editable = ['order', 'is_active']


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ['name', 'issue_date', 'expiry_date', 'order', 'is_active']
    list_filter = ['is_active', 'issue_date', 'expiry_date']
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
