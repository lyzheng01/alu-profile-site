from django.db import models
from django.utils.translation import gettext_lazy as _


class Inquiry(models.Model):
    """询价咨询"""
    STATUS_CHOICES = [
        ('new', _('新询价')),
        ('processing', _('处理中')),
        ('replied', _('已回复')),
        ('closed', _('已关闭')),
    ]
    
    # 客户信息
    name = models.CharField(_('客户姓名'), max_length=100)
    company = models.CharField(_('公司名称'), max_length=200, blank=True)
    email = models.EmailField(_('邮箱地址'))
    phone = models.CharField(_('联系电话'), max_length=20, blank=True)
    whatsapp = models.CharField(_('WhatsApp'), max_length=20, blank=True)
    
    # 询价内容
    subject = models.CharField(_('询价主题'), max_length=200)
    message = models.TextField(_('询价内容'))
    
    # 产品信息（可选）
    product_name = models.CharField(_('产品名称'), max_length=200, blank=True)
    quantity = models.CharField(_('数量'), max_length=100, blank=True)
    
    # 状态
    status = models.CharField(_('状态'), max_length=20, choices=STATUS_CHOICES, default='new')
    
    # 回复
    reply = models.TextField(_('回复内容'), blank=True)
    replied_at = models.DateTimeField(_('回复时间'), null=True, blank=True)
    
    # 来源
    source = models.CharField(_('来源'), max_length=50, default='website')
    ip_address = models.GenericIPAddressField(_('IP地址'), null=True, blank=True)
    
    # 时间戳
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)

    class Meta:
        verbose_name = _('询价咨询')
        verbose_name_plural = _('询价咨询')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.subject}"

    def mark_as_replied(self, reply_content):
        """标记为已回复"""
        from django.utils import timezone
        self.status = 'replied'
        self.reply = reply_content
        self.replied_at = timezone.now()
        self.save()


class ContactInfo(models.Model):
    """联系信息"""
    name = models.CharField(_('名称'), max_length=100)
    value = models.CharField(_('值'), max_length=200)
    type = models.CharField(_('类型'), max_length=50)  # phone, email, address, whatsapp
    order = models.IntegerField(_('排序'), default=0)
    is_active = models.BooleanField(_('是否激活'), default=True)

    class Meta:
        verbose_name = _('联系信息')
        verbose_name_plural = _('联系信息')
        ordering = ['order', 'name']

    def __str__(self):
        return f"{self.name}: {self.value}"
