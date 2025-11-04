from django.db import models


class CompanyInfo(models.Model):
    """公司信息"""
    name = models.CharField('公司名称', max_length=200, blank=True, default='')
    description = models.TextField('公司描述', blank=True, default='')
    address = models.CharField('地址', max_length=500, blank=True)
    phone = models.CharField('电话', max_length=50, blank=True)
    email = models.EmailField('邮箱', blank=True)
    website = models.URLField('网站', blank=True)
    is_active = models.BooleanField('是否激活', default=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '公司信息'
        verbose_name_plural = '公司信息'
        ordering = ['-created_at']

    def __str__(self):
        return self.name or 'Company Info'


class Advantage(models.Model):
    """企业优势"""
    title = models.CharField('标题', max_length=200)
    description = models.TextField('描述')
    icon = models.CharField('图标', max_length=100, blank=True, help_text='图标类名或SVG')
    order = models.IntegerField('排序', default=0)
    is_active = models.BooleanField('是否激活', default=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '企业优势'
        verbose_name_plural = '企业优势'
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.title


class Certificate(models.Model):
    """证书"""
    name = models.CharField('证书名称', max_length=200)
    image = models.ImageField('证书图片', upload_to='certificates/')
    description = models.TextField('描述', blank=True)
    issue_date = models.DateField('颁发日期', null=True, blank=True)
    order = models.IntegerField('排序', default=0)
    is_active = models.BooleanField('是否激活', default=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '证书'
        verbose_name_plural = '证书'
        ordering = ['order', '-created_at']

    def __str__(self):
        return self.name


class FactoryImage(models.Model):
    """工厂图片"""
    title = models.CharField('图片标题', max_length=200)
    description = models.TextField('图片描述', blank=True)
    image = models.ImageField('工厂图片', upload_to='factory_images/')
    order = models.IntegerField('排序', default=0)
    is_active = models.BooleanField('是否激活', default=True)
    created_at = models.DateTimeField('创建时间', auto_now_add=True)

    class Meta:
        verbose_name = '工厂图片'
        verbose_name_plural = '工厂图片'
        ordering = ['order', 'title']

    def __str__(self):
        return self.title


class FriendLink(models.Model):
    """友情链接/外链交换"""
    name = models.CharField('网站名称', max_length=200, help_text='友链网站的显示名称')
    url = models.URLField('网站链接', help_text='友链网站的完整URL')
    description = models.CharField('描述', max_length=500, blank=True, help_text='网站简短描述（可选）')
    logo = models.ImageField('Logo', upload_to='friend_links/', blank=True, null=True, help_text='友链网站的Logo（可选）')
    order = models.IntegerField('排序', default=0, help_text='数字越小越靠前')
    is_active = models.BooleanField('是否激活', default=True)
    is_nofollow = models.BooleanField('NoFollow', default=False, help_text='是否添加nofollow属性（SEO控制）')
    target_blank = models.BooleanField('新窗口打开', default=True, help_text='是否在新窗口打开链接')
    created_at = models.DateTimeField('创建时间', auto_now_add=True)
    updated_at = models.DateTimeField('更新时间', auto_now=True)

    class Meta:
        verbose_name = '友情链接'
        verbose_name_plural = '友情链接'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name
