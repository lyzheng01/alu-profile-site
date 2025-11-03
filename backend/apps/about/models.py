from django.db import models
from django.utils.translation import gettext_lazy as _


class CompanyInfo(models.Model):
    """公司信息 - 使用键值对存储，便于扩展"""
    INFO_TYPE_CHOICES = [
        ('basic', _('基本信息')),
        ('contact', _('联系信息')),
        ('social', _('社交媒体')),
        ('stats', _('统计数据')),
        ('other', _('其他信息')),
    ]
    
    key = models.CharField(_('信息键'), max_length=100, unique=True)
    value = models.TextField(_('信息值'))
    info_type = models.CharField(_('信息类型'), max_length=20, choices=INFO_TYPE_CHOICES, default='basic')
    order = models.IntegerField(_('排序'), default=0)
    is_active = models.BooleanField(_('是否激活'), default=True)
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)

    class Meta:
        verbose_name = _('公司信息')
        verbose_name_plural = _('公司信息')
        ordering = ['info_type', 'order', 'key']

    def __str__(self):
        return f"{self.key}: {self.value}"


class Advantage(models.Model):
    """企业优势"""
    title = models.CharField(_('优势标题'), max_length=200)
    description = models.TextField(_('优势描述'))
    icon = models.CharField(_('图标'), max_length=50, blank=True)  # FontAwesome图标名
    image = models.ImageField(_('优势图片'), upload_to='advantages/', blank=True)
    order = models.IntegerField(_('排序'), default=0)
    is_active = models.BooleanField(_('是否激活'), default=True)
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)

    class Meta:
        verbose_name = _('企业优势')
        verbose_name_plural = _('企业优势')
        ordering = ['order', 'title']

    def __str__(self):
        return self.title


class Certificate(models.Model):
    """资质证书"""
    name = models.CharField(_('证书名称'), max_length=200)
    description = models.TextField(_('证书描述'), blank=True)
    image = models.ImageField(_('证书图片'), upload_to='certificates/')
    issue_date = models.DateField(_('颁发日期'), null=True, blank=True)
    expiry_date = models.DateField(_('到期日期'), null=True, blank=True)
    order = models.IntegerField(_('排序'), default=0)
    is_active = models.BooleanField(_('是否激活'), default=True)
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)

    class Meta:
        verbose_name = _('资质证书')
        verbose_name_plural = _('资质证书')
        ordering = ['order', 'name']

    def __str__(self):
        return self.name


class FactoryImage(models.Model):
    """工厂图片"""
    title = models.CharField(_('图片标题'), max_length=200)
    description = models.TextField(_('图片描述'), blank=True)
    image = models.ImageField(_('工厂图片'), upload_to='factory/')
    order = models.IntegerField(_('排序'), default=0)
    is_active = models.BooleanField(_('是否激活'), default=True)
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)

    class Meta:
        verbose_name = _('工厂图片')
        verbose_name_plural = _('工厂图片')
        ordering = ['order', 'title']

    def __str__(self):
        return self.title
