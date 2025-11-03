from django.db import models
from django.utils.translation import gettext_lazy as _


class Tag(models.Model):
    """标签"""
    name = models.CharField(_('标签名称'), max_length=50, unique=True)
    slug = models.SlugField(_('标签别名'), max_length=50, unique=True)
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)

    class Meta:
        verbose_name = _('标签')
        verbose_name_plural = _('标签')
        ordering = ['name']

    def __str__(self):
        return self.name


class Article(models.Model):
    """文章"""
    STATUS_CHOICES = [
        ('draft', _('草稿')),
        ('published', _('已发布')),
    ]
    
    title = models.CharField(_('文章标题'), max_length=200)
    slug = models.SlugField(_('文章别名'), max_length=200, unique=True)
    content = models.TextField(_('文章内容'))
    excerpt = models.TextField(_('文章摘要'), blank=True)
    
    # 图片
    featured_image = models.ImageField(_('特色图片'), upload_to='articles/', blank=True)
    
    # 分类和标签
    tags = models.ManyToManyField(Tag, verbose_name=_('标签'), blank=True)
    
    # 状态
    status = models.CharField(_('状态'), max_length=10, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(_('是否推荐'), default=False)
    
    # SEO
    meta_title = models.CharField(_('SEO标题'), max_length=200, blank=True)
    meta_description = models.TextField(_('SEO描述'), blank=True)
    meta_keywords = models.CharField(_('SEO关键词'), max_length=200, blank=True)
    
    # 统计
    views = models.PositiveIntegerField(_('浏览次数'), default=0)
    
    # 时间戳
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    published_at = models.DateTimeField(_('发布时间'), null=True, blank=True)

    class Meta:
        verbose_name = _('文章')
        verbose_name_plural = _('文章')
        ordering = ['-published_at', '-created_at']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        # 如果状态改为已发布且发布时间为空，设置发布时间
        if self.status == 'published' and not self.published_at:
            from django.utils import timezone
            self.published_at = timezone.now()
        super().save(*args, **kwargs)
