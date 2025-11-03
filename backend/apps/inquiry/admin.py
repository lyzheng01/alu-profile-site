from django.contrib import admin
from .models import Inquiry, ContactInfo


@admin.register(Inquiry)
class InquiryAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'subject', 'status', 'created_at']
    list_filter = ['status', 'source', 'created_at']
    search_fields = ['name', 'company', 'email', 'subject', 'message']
    ordering = ['-created_at']
    list_editable = ['status']
    readonly_fields = ['created_at', 'updated_at', 'ip_address']
    
    fieldsets = (
        ('客户信息', {
            'fields': ('name', 'company', 'email', 'phone', 'whatsapp')
        }),
        ('询价内容', {
            'fields': ('subject', 'message', 'product_name', 'quantity')
        }),
        ('状态管理', {
            'fields': ('status', 'reply', 'replied_at')
        }),
        ('系统信息', {
            'fields': ('source', 'ip_address', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_replied', 'mark_as_processing']
    
    def mark_as_replied(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(status='replied', replied_at=timezone.now())
        self.message_user(request, f'成功标记 {updated} 条询价为已回复')
    mark_as_replied.short_description = '标记为已回复'
    
    def mark_as_processing(self, request, queryset):
        updated = queryset.update(status='processing')
        self.message_user(request, f'成功标记 {updated} 条询价为处理中')
    mark_as_processing.short_description = '标记为处理中'


@admin.register(ContactInfo)
class ContactInfoAdmin(admin.ModelAdmin):
    list_display = ['name', 'value', 'type', 'order', 'is_active']
    list_filter = ['type', 'is_active']
    search_fields = ['name', 'value']
    ordering = ['type', 'order']
    list_editable = ['order', 'is_active']
